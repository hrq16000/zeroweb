import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Structural guard for canonical declarations in route files.
 *
 * Complements `scripts/validate-canonicals.mjs` (build-time) with fast
 * feedback inside the unit-test loop. Only enforces invariants that
 * must hold across every release:
 *   1. __root.tsx never declares a canonical (router concatenates links).
 *   2. Any canonical literal href present uses https://0web.com.br (no www / http).
 *   3. Dynamic blog/categoria leaves never hardcode a literal URL that
 *      would collapse all params to the same canonical.
 */

const ROUTES_DIR = path.resolve(import.meta.dir, "../routes");
const CANONICAL_HOST = "https://0web.com.br";

function readRoute(name: string): string {
  return readFileSync(path.join(ROUTES_DIR, name), "utf8");
}

/** Extract every canonical href expression in a file (multi-line tolerant). */
function extractCanonicals(src: string): string[] {
  const out: string[] = [];
  const re = /rel:\s*["']canonical["']\s*,\s*href:\s*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    let i = m.index + m[0].length;
    while (i < src.length && /\s/.test(src[i])) i++;
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      let depth = 0;
      while (j < src.length) {
        const c = src[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (quote === "`" && c === "$" && src[j + 1] === "{") {
          depth++;
          j += 2;
          continue;
        }
        if (depth > 0 && c === "}") {
          depth--;
          j++;
          continue;
        }
        if (depth === 0 && c === quote) {
          out.push(src.slice(i, j + 1));
          break;
        }
        j++;
      }
    } else {
      // Variable reference (e.g. `href: url`) — read until comma/}
      let j = i;
      while (j < src.length && !/[,}\n]/.test(src[j])) j++;
      out.push(src.slice(i, j).trim());
    }
  }
  return out;
}

describe("canonical dedup — route files", () => {
  test("__root.tsx does NOT declare a canonical", () => {
    const root = readFileSync(path.join(ROUTES_DIR, "__root.tsx"), "utf8");
    expect(extractCanonicals(root)).toEqual([]);
  });

  test("every literal canonical href uses https://0web.com.br (no www, no http)", () => {
    const files = readdirSync(ROUTES_DIR).filter(
      (f) => f.endsWith(".tsx") && !f.startsWith("_authenticated"),
    );
    const offenders: string[] = [];
    for (const f of files) {
      for (const href of extractCanonicals(readRoute(f))) {
        // Only check literals (string / template), not variable references.
        if (!/^["'`]/.test(href)) continue;
        if (href.includes("www.0web")) offenders.push(`${f}: ${href}`);
        if (href.includes("http://0web")) offenders.push(`${f}: ${href}`);
        // Must reference the canonical host literally OR via interpolation.
        const ok = href.includes(CANONICAL_HOST) || href.includes("${");
        if (!ok) offenders.push(`${f}: missing host (${href})`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test("dynamic blog/categoria leaves never hardcode a static canonical literal", () => {
    const dynamic = readdirSync(ROUTES_DIR).filter(
      (f) => f.endsWith(".tsx") && f.includes("$") && /^(blog|categoria)\./.test(f),
    );
    expect(dynamic.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const f of dynamic) {
      for (const href of extractCanonicals(readRoute(f))) {
        // A plain "https://..." literal in a dynamic route means every param
        // collapses to the same URL — that's the bug we're guarding against.
        if (/^["']https?:\/\//.test(href)) offenders.push(`${f}: ${href}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
