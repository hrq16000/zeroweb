import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Structural guard: ensure every blog/categoria route declares a unique
 * canonical and that the dynamic ones use a template literal (so they don't
 * all resolve to the same URL at runtime — that was the duplicate-canonical
 * regression we keep guarding against).
 *
 * Complements `scripts/validate-canonicals.mjs` (which runs at build time) by
 * giving us fast feedback in the unit-test loop.
 */

const ROUTES_DIR = path.resolve(import.meta.dir, "../routes");
const CANONICAL_HOST = "https://0web.com.br";

function readRoute(name: string): string {
  return readFileSync(path.join(ROUTES_DIR, name), "utf8");
}

function extractCanonical(src: string): string | null {
  const m = src.match(/rel:\s*["']canonical["']\s*,\s*href:\s*([^\n]+?)\s*[,}]/);
  return m ? m[1].trim() : null;
}

describe("canonical dedup — blog & categoria routes", () => {
  const blogFiles = readdirSync(ROUTES_DIR).filter(
    (f) => /^(blog|categoria)\./.test(f) && f.endsWith(".tsx"),
  );

  test("every blog/categoria leaf declares a canonical", () => {
    for (const f of blogFiles) {
      const src = readRoute(f);
      // Skip files that don't render a page (rare, but possible)
      if (!src.includes("createFileRoute")) continue;
      expect(extractCanonical(src), `missing canonical in ${f}`).not.toBeNull();
    }
  });

  test("dynamic blog/categoria routes use template literals (no static dupes)", () => {
    const dynamic = blogFiles.filter((f) => f.includes("$"));
    expect(dynamic.length).toBeGreaterThan(0);
    for (const f of dynamic) {
      const href = extractCanonical(readRoute(f));
      if (!href) continue;
      // Must be a template literal that interpolates ${params...}
      expect(href.startsWith("`"), `${f} canonical should be a template literal`).toBe(true);
      expect(href.includes("${"), `${f} canonical should interpolate params`).toBe(true);
    }
  });

  test("static blog/categoria leaves have distinct canonical URLs", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const f of blogFiles) {
      if (f.includes("$")) continue;
      const href = extractCanonical(readRoute(f));
      if (!href) continue;
      // Strip surrounding quotes/backticks for comparison
      const clean = href.replace(/^["'`]|["'`]$/g, "");
      const prev = seen.get(clean);
      if (prev) dupes.push(`${prev} ↔ ${f} (${clean})`);
      else seen.set(clean, f);
    }
    expect(dupes).toEqual([]);
  });

  test("__root.tsx does NOT define a canonical (router would duplicate it)", () => {
    const root = readFileSync(path.join(ROUTES_DIR, "__root.tsx"), "utf8");
    expect(root.match(/rel:\s*["']canonical["']/)).toBeNull();
  });

  test("all canonicals point to https://0web.com.br (no www, no http)", () => {
    for (const f of blogFiles) {
      const href = extractCanonical(readRoute(f));
      if (!href) continue;
      expect(
        href.includes(CANONICAL_HOST),
        `${f} canonical must use ${CANONICAL_HOST}`,
      ).toBe(true);
      expect(href).not.toContain("www.0web");
      expect(href).not.toContain("http://0web");
    }
  });
});
