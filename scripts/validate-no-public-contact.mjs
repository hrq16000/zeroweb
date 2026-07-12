#!/usr/bin/env node
/**
 * Validates that no public/client bundle contains raw WhatsApp / e-mail
 * contact channels. Scans `dist/` if present, otherwise scans `src/` while
 * excluding server-only paths (*.server.ts, *.server.tsx, route handlers).
 *
 * Fails the process with non-zero exit code when any forbidden pattern is
 * found in a client-reachable location.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "src");

const FORBIDDEN = [
  { re: /wa\.me\/\d/i, name: "wa.me/<digits>" },
  { re: /api\.whatsapp\.com\/send/i, name: "api.whatsapp.com/send" },
  { re: /whatsapp:\/\//i, name: "whatsapp:// scheme" },
  { re: /mailto:[^"'\s]+@0web/i, name: "mailto:*@0web" },
];

// Allowlist: server-only files where these patterns are expected.
const ALLOW = [
  /\.server\.ts$/,
  /\.server\.tsx$/,
  /whatsapp-redirect\.server\.ts$/,
  /contact\.server\.ts$/,
  /r\.whatsapp\.\$token\.ts$/, // server route handler body is stripped from client bundle
  /\.test\.ts$/,
  /scripts\/validate-no-public-contact/,
  // Admin-only pages behind _authenticated (SSR:false + auth gate)
  /_authenticated\//,
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      walk(full, out);
    } else out.push(full);
  }
  return out;
}

let violations = 0;

function scan(root, label) {
  if (!existsSync(root)) return;
  const files = walk(root).filter((f) => /\.(js|mjs|cjs|ts|tsx|html|json)$/.test(f));
  for (const f of files) {
    const rel = relative(ROOT, f);
    if (ALLOW.some((r) => r.test(rel))) continue;
    let content;
    try { content = readFileSync(f, "utf8"); } catch { continue; }
    for (const { re, name } of FORBIDDEN) {
      if (re.test(content)) {
        console.error(`[${label}] ${rel} contains ${name}`);
        violations++;
      }
    }
  }
}

// Prefer dist (real client bundle); fall back to src heuristic.
if (existsSync(DIST)) {
  scan(DIST, "dist");
} else {
  console.warn("[validate-no-public-contact] dist/ not found — scanning src/ as best-effort");
  scan(SRC, "src");
}

if (violations > 0) {
  console.error(`\n✗ ${violations} forbidden contact reference(s) in client-reachable code.`);
  process.exit(1);
}
console.log("✓ No public WhatsApp/email exposure found in client-reachable code.");
