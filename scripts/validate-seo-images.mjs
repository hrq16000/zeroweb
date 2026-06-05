#!/usr/bin/env node
/**
 * Postbuild SEO + Google Discover validator.
 *
 * Scans dist/ HTML files and asserts each indexable page has:
 *  - <title>, meta description, canonical, og:image, twitter:image
 *  - robots meta containing "max-image-preview:large"
 *  - og:image points to a real file inside dist/ AND has dimensions >= 1200x630
 *  - twitter:image present (Twitter card)
 *
 * Exits non-zero with a clear report when any check fails. Skip with
 * SKIP_SEO_IMAGE_CHECK=1.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import sharp from "sharp";

if (process.env.SKIP_SEO_IMAGE_CHECK === "1") {
  console.log("[seo-images] skipped via SKIP_SEO_IMAGE_CHECK=1");
  process.exit(0);
}

const DIST = path.resolve(process.cwd(), "dist");
const MIN_W = 1200;
const MIN_H = 630;

const exists = async (p) => !!(await fs.stat(p).catch(() => null));
if (!(await exists(DIST))) {
  console.log("[seo-images] no dist/ found — skipping (likely SSR-only build)");
  process.exit(0);
}

const htmlFiles = globSync("**/*.html", { cwd: DIST, absolute: true });
if (htmlFiles.length === 0) {
  console.log("[seo-images] no HTML files in dist/ (server-rendered runtime) — skipping");
  process.exit(0);
}

const errors = [];
const warnings = [];
const imageCache = new Map();

function pick(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}

async function resolveLocal(urlOrPath) {
  if (!urlOrPath) return null;
  try {
    const u = new URL(urlOrPath, "https://x.local");
    const rel = u.pathname.replace(/^\//, "");
    const candidate = path.join(DIST, rel);
    if (await exists(candidate)) return candidate;
  } catch {}
  return null;
}

async function checkImage(url, file, label) {
  if (!url) {
    errors.push(`${file}: missing ${label}`);
    return;
  }
  const local = await resolveLocal(url);
  if (!local) {
    // External image — can't validate dimensions; warn only
    warnings.push(`${file}: ${label} is external (${url}); cannot verify dimensions locally`);
    return;
  }
  let meta = imageCache.get(local);
  if (!meta) {
    try {
      meta = await sharp(local).metadata();
      imageCache.set(local, meta);
    } catch (e) {
      errors.push(`${file}: ${label} unreadable (${local}): ${e.message}`);
      return;
    }
  }
  if ((meta.width || 0) < MIN_W || (meta.height || 0) < MIN_H) {
    errors.push(
      `${file}: ${label} too small ${meta.width}x${meta.height} (min ${MIN_W}x${MIN_H} for Google Discover)`
    );
  }
  if (!["jpeg", "png", "webp", "avif"].includes(meta.format)) {
    errors.push(`${file}: ${label} unsupported format "${meta.format}"`);
  }
}

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const html = await fs.readFile(file, "utf8");

  const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i);
  const desc = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogImage = pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const twImage = pick(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  const robots = pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);

  if (!title) errors.push(`${rel}: missing <title>`);
  if (!desc) errors.push(`${rel}: missing meta description`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!robots || !/max-image-preview:large/i.test(robots)) {
    errors.push(`${rel}: robots meta missing "max-image-preview:large" (required for Discover)`);
  }

  await checkImage(ogImage, rel, "og:image");
  await checkImage(twImage, rel, "twitter:image");
}

if (warnings.length) {
  console.log("\n[seo-images] warnings:");
  warnings.forEach((w) => console.log("  ⚠ " + w));
}

if (errors.length) {
  console.error(`\n[seo-images] ${errors.length} error(s):`);
  errors.forEach((e) => console.error("  ✖ " + e));
  console.error("\nFix the issues above or set SKIP_SEO_IMAGE_CHECK=1 to bypass.\n");
  process.exit(1);
}

console.log(`[seo-images] OK — ${htmlFiles.length} page(s) validated`);
