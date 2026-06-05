#!/usr/bin/env node
/**
 * Postbuild image optimizer.
 *
 * For every blog hero/asset emitted into dist/, generate WebP and AVIF
 * siblings (same basename, different extension) so the <Picture>
 * component can serve modern formats while keeping the JPG fallback
 * (which Discover crawlers prefer).
 *
 * Idempotent. Skip with SKIP_IMAGE_OPT=1.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import sharp from "sharp";

if (process.env.SKIP_IMAGE_OPT === "1") {
  console.log("[img-opt] skipped via SKIP_IMAGE_OPT=1");
  process.exit(0);
}

const DIST = path.resolve(process.cwd(), "dist");
const exists = async (p) => !!(await fs.stat(p).catch(() => null));
if (!(await exists(DIST))) {
  console.log("[img-opt] no dist/ — skipping");
  process.exit(0);
}

const PATTERNS = ["**/blog-*.jpg", "**/blog-*.jpeg", "**/blog-*.png", "**/og-*.jpg", "**/og-*.png"];
const files = PATTERNS.flatMap((p) => globSync(p, { cwd: DIST, absolute: true, nodir: true }));

if (files.length === 0) {
  console.log("[img-opt] no candidate images found in dist/");
  process.exit(0);
}

let made = 0;
for (const file of files) {
  const dir = path.dirname(file);
  const base = path.basename(file).replace(/\.(jpe?g|png)$/i, "");
  const webp = path.join(dir, `${base}.webp`);
  const avif = path.join(dir, `${base}.avif`);

  try {
    if (!(await exists(webp))) {
      await sharp(file).webp({ quality: 82, effort: 4 }).toFile(webp);
      made++;
    }
    if (!(await exists(avif))) {
      await sharp(file).avif({ quality: 60, effort: 4 }).toFile(avif);
      made++;
    }
  } catch (e) {
    console.warn(`[img-opt] failed on ${file}: ${e.message}`);
  }
}

console.log(`[img-opt] OK — generated ${made} variant(s) for ${files.length} source(s)`);
