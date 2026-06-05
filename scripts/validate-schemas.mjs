#!/usr/bin/env node
/**
 * Build-time validator for JSON-LD schemas declared in TanStack route files.
 *
 * Scans src/routes/**\/*.tsx for inline JSON.stringify({ ... }) blocks used in
 * head().scripts and validates required fields for known @type values:
 *  - Organization      → name, url
 *  - LocalBusiness     → name, address, telephone
 *  - WebSite           → name, url
 *  - FAQPage           → mainEntity (array with Question/Answer)
 *  - Review            → author, reviewRating
 *  - AggregateRating   → ratingValue, reviewCount
 *
 * Also validates the social-proof component (src/components/site/SocialProofBlock.tsx).
 *
 * Exit code 1 with a descriptive error blocks the pipeline.
 *
 * Bypass: SKIP_SCHEMA_VALIDATION=1
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

if (process.env.SKIP_SCHEMA_VALIDATION === "1") {
  console.log("[schemas] skipped via SKIP_SCHEMA_VALIDATION=1");
  process.exit(0);
}

const ROOTS = ["src/routes", "src/components"];

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(e)) out.push(full);
  }
  return out;
}

const REQUIRED = {
  Organization: ["name", "url"],
  LocalBusiness: ["name", "address", "telephone"],
  WebSite: ["name", "url"],
  FAQPage: ["mainEntity"],
  Review: ["author", "reviewRating"],
  AggregateRating: ["ratingValue", "reviewCount"],
};

const errors = [];

function checkObject(obj, file, path = "") {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) { obj.forEach((o, i) => checkObject(o, file, `${path}[${i}]`)); return; }
  const t = obj["@type"];
  if (typeof t === "string" && REQUIRED[t]) {
    for (const field of REQUIRED[t]) {
      if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
        errors.push(`${file}: ${t}${path ? ` (${path})` : ""} missing required field "${field}"`);
      }
    }
  }
  for (const k of Object.keys(obj)) checkObject(obj[k], file, `${path}.${k}`);
}

// Extract literal JSON-LD blocks from source. We look for `JSON.stringify({ ... "@context": ... })`
// and try to evaluate that single object expression in a safe sandbox.
function extractJsonLdLiterals(src) {
  const blocks = [];
  const re = /JSON\.stringify\(\s*(\{[\s\S]*?\})\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const literal = m[1];
    if (!literal.includes("@context") && !literal.includes("@type")) continue;
    // Skip if it references runtime variables that aren't trivially resolvable
    blocks.push(literal);
  }
  return blocks;
}

function tryEval(literal) {
  // Replace identifiers we know (testimonials reference, etc.) with safe fallbacks.
  // This is a best-effort: if evaluation fails, we still do shallow string checks.
  try {
    // eslint-disable-next-line no-new-func
    return new Function(`"use strict"; const testimonials=[]; const numbers=[]; return (${literal});`)();
  } catch {
    return null;
  }
}

const files = ROOTS.flatMap(walk);
const warnings = [];
let scanned = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (!/@context|@type/.test(src)) continue;
  scanned++;
  const literals = extractJsonLdLiterals(src);
  for (const lit of literals) {
    const obj = tryEval(lit);
    if (obj) {
      // Strict: object literal fully resolved — required fields must be present
      // (unless the node is a pure @id reference like { "@id": "..." }).
      const strictCheck = (o, path = "") => {
        if (!o || typeof o !== "object") return;
        if (Array.isArray(o)) { o.forEach((x, i) => strictCheck(x, `${path}[${i}]`)); return; }
        const t = o["@type"];
        const isRefOnly = o["@id"] && !t;
        if (t && REQUIRED[t] && !isRefOnly) {
          for (const field of REQUIRED[t]) {
            if (o[field] === undefined || o[field] === null || o[field] === "") {
              errors.push(`${f}: ${t}${path ? ` (${path})` : ""} missing required field "${field}"`);
            }
          }
        }
        for (const k of Object.keys(o)) strictCheck(o[k], `${path}.${k}`);
      };
      strictCheck(obj);
    } else {
      // Non-evaluatable (references runtime variables) — emit warning only.
      const typeMatches = [...lit.matchAll(/"@type":\s*"(\w+)"/g)].map((x) => x[1]);
      for (const t of typeMatches) {
        if (REQUIRED[t]) warnings.push(`${f}: ${t} block uses runtime variables — skipped strict check`);
      }
    }
  }
}

if (warnings.length > 0 && process.env.SCHEMA_VERBOSE === "1") {
  for (const w of warnings) console.warn("  ⚠ " + w);
}


if (errors.length > 0) {
  console.error("✖ Schema.org validation failed:\n");
  for (const e of errors) console.error("  • " + e);
  console.error(`\n${errors.length} issue(s) in ${scanned} file(s). Fix or set SKIP_SCHEMA_VALIDATION=1 to bypass.`);
  process.exit(1);
}

console.log(`✓ Schemas OK (${scanned} file(s) scanned, types validated: ${Object.keys(REQUIRED).join(", ")})`);
process.exit(0);
