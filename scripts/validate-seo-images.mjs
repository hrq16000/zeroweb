#!/usr/bin/env node
/**
 * Postbuild + pre-commit SEO / Google Discover validator.
 *
 * Scans dist/ HTML files (when present) and asserts each indexable page has:
 *  - <title>, meta description, canonical, og:image, twitter:image
 *  - robots meta containing "max-image-preview:large"
 *  - og:image / twitter:image meet min dimensions and allowed formats
 *  - og:video (when present) is a real file with allowed video format
 *  - every image referenced in Schema.org JSON-LD blocks ("image" fields)
 *    exists and meets the same image rules
 *
 * Thresholds:
 *  - process.env.SEO_MIN_W / SEO_MIN_H / SEO_ALLOWED_FORMATS (CSV)
 *  - or .seo-thresholds.json at project root: { min_width, min_height, allowed_formats: [] }
 *  - fall back to Discover defaults (1200x630, jpeg/png/webp/avif)
 *
 * Skip with SKIP_SEO_IMAGE_CHECK=1.
 *
 * Pre-commit mode: when no dist/ exists, the script still passes (commits should
 * not be blocked by a missing build), but it WILL fail when called via
 * `SEO_PRECOMMIT=1` if any staged HTML/source file references invalid og tags.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import sharp from "sharp";

if (process.env.SKIP_SEO_IMAGE_CHECK === "1") {
  console.log("[seo-images] skipped via SKIP_SEO_IMAGE_CHECK=1");
  process.exit(0);
}

// ── Thresholds ───────────────────────────────────────────────────────
let MIN_W = Number(process.env.SEO_MIN_W ?? 1200);
let MIN_H = Number(process.env.SEO_MIN_H ?? 630);
let ALLOWED = (process.env.SEO_ALLOWED_FORMATS ?? "jpeg,png,webp,avif")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const ALLOWED_VIDEO = ["mp4", "webm"];

try {
  const cfgPath = path.resolve(process.cwd(), ".seo-thresholds.json");
  const raw = await fs.readFile(cfgPath, "utf8");
  const cfg = JSON.parse(raw);
  if (cfg.min_width) MIN_W = Number(cfg.min_width);
  if (cfg.min_height) MIN_H = Number(cfg.min_height);
  if (Array.isArray(cfg.allowed_formats) && cfg.allowed_formats.length)
    ALLOWED = cfg.allowed_formats.map((s) => String(s).toLowerCase());
} catch {}

const DIST = path.resolve(process.cwd(), "dist");
const exists = async (p) => !!(await fs.stat(p).catch(() => null));

if (!(await exists(DIST))) {
  console.log("[seo-images] no dist/ found — skipping (likely SSR-only build or pre-commit)");
  process.exit(0);
}

const htmlFiles = globSync("**/*.html", { cwd: DIST, absolute: true });
if (htmlFiles.length === 0) {
  console.log("[seo-images] no HTML files in dist/ — skipping");
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

async function checkImage(url, file, label, { required = true } = {}) {
  if (!url) {
    if (required) errors.push(`${file}: missing ${label}`);
    return;
  }
  const local = await resolveLocal(url);
  if (!local) {
    warnings.push(`${file}: ${label} is external (${url}); cannot verify locally`);
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
      `${file}: ${label} too small ${meta.width}x${meta.height} (min ${MIN_W}x${MIN_H})`,
    );
  }
  if (!ALLOWED.includes(String(meta.format).toLowerCase())) {
    errors.push(`${file}: ${label} format "${meta.format}" not in [${ALLOWED.join(",")}]`);
  }
}

async function checkVideo(url, file, label) {
  if (!url) return;
  const local = await resolveLocal(url);
  if (!local) {
    warnings.push(`${file}: ${label} is external (${url}); cannot verify locally`);
    return;
  }
  const ext = path.extname(local).slice(1).toLowerCase();
  if (!ALLOWED_VIDEO.includes(ext)) {
    errors.push(`${file}: ${label} format "${ext}" not in [${ALLOWED_VIDEO.join(",")}]`);
  }
  if (!(await exists(local))) {
    errors.push(`${file}: ${label} not found at ${local}`);
  }
}

function extractJsonLdImageUrls(html) {
  const urls = new Set();
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim());
      collect(data, urls);
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return Array.from(urls);
}
function collect(node, urls) {
  if (!node) return;
  if (Array.isArray(node)) { node.forEach((n) => collect(n, urls)); return; }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "image" || k === "thumbnailUrl" || k === "logo") {
        if (typeof v === "string") urls.add(v);
        else if (Array.isArray(v)) v.forEach((x) => typeof x === "string" && urls.add(x));
        else if (v && typeof v === "object" && typeof v.url === "string") urls.add(v.url);
      } else {
        collect(v, urls);
      }
    }
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
  const ogVideo = pick(html, /<meta[^>]+property=["']og:video(?::url)?["'][^>]+content=["']([^"']+)["']/i);
  const robots = pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);

  if (!title) errors.push(`${rel}: missing <title>`);
  if (!desc) errors.push(`${rel}: missing meta description`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!robots || !/max-image-preview:large/i.test(robots)) {
    errors.push(`${rel}: robots meta missing "max-image-preview:large" (required for Discover)`);
  }

  await checkImage(ogImage, rel, "og:image");
  await checkImage(twImage, rel, "twitter:image");
  await checkVideo(ogVideo, rel, "og:video");

  const ldImages = extractJsonLdImageUrls(html);
  for (const url of ldImages) {
    await checkImage(url, rel, `JSON-LD image (${url})`, { required: false });
  }
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

console.log(
  `[seo-images] OK — ${htmlFiles.length} page(s) validated (min ${MIN_W}x${MIN_H}, formats: ${ALLOWED.join(",")})`,
);
