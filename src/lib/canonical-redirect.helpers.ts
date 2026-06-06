/**
 * Pure helpers used by the canonical/redirect middleware in `src/start.ts`.
 *
 * Kept side-effect-free so the redirect logic can be unit-tested without
 * spinning up the Worker runtime or hitting Supabase.
 */

export const CANONICAL_HOST = "0web.com.br";

export interface RedirectEntry {
  from_path: string;
  to_path: string;
  status_code: number;
}

export interface CanonicalDecisionInput {
  method: string;
  url: string;
  forwardedProto?: string | null;
  redirects: Map<string, { to: string; status: number }>;
}

export interface CanonicalDecision {
  status: number;
  location: string;
  source: "host" | "https" | "trailing-slash" | "custom";
  fromPath: string;
}

/**
 * Asset/internal paths that the middleware should never touch.
 */
export function shouldSkipCanonical(pathname: string): boolean {
  return (
    pathname.startsWith("/_build") ||
    pathname.startsWith("/_server") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt" ||
    /\.(js|css|map|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|txt|xml|json)$/i.test(pathname)
  );
}

/**
 * Compute the canonical/redirect response for a given request.
 *
 * Returns `null` when the request should pass through untouched.
 * Order of precedence: custom redirect > host/https/trailing-slash normalization.
 */
export function computeCanonicalRedirect(
  input: CanonicalDecisionInput,
): CanonicalDecision | null {
  if (input.method !== "GET" && input.method !== "HEAD") return null;
  const url = new URL(input.url);
  if (shouldSkipCanonical(url.pathname)) return null;

  // 1) Host normalization
  let host = url.host;
  let proto = (input.forwardedProto ?? url.protocol.replace(":", "")) || "http";
  let needsRedirect = false;
  let source: CanonicalDecision["source"] = "trailing-slash";

  if (host.startsWith("www.")) {
    host = host.slice(4);
    needsRedirect = true;
    source = "host";
  }
  const isProdHost = host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
  if (isProdHost && host !== CANONICAL_HOST) {
    host = CANONICAL_HOST;
    needsRedirect = true;
    source = "host";
  }
  if (isProdHost && proto !== "https") {
    proto = "https";
    needsRedirect = true;
    source = "https";
  }

  // 2) Trailing slash
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
    needsRedirect = true;
    if (source === "trailing-slash") source = "trailing-slash";
  }

  // 3) Custom redirects table
  const hit = input.redirects.get(pathname);
  if (hit) {
    const target = /^https?:\/\//i.test(hit.to)
      ? hit.to
      : `${proto}://${host}${hit.to}${url.search}`;
    return {
      status: hit.status,
      location: target,
      source: "custom",
      fromPath: pathname,
    };
  }

  if (needsRedirect) {
    return {
      status: 308,
      location: `${proto}://${host}${pathname}${url.search}`,
      source,
      fromPath: url.pathname,
    };
  }

  return null;
}

/**
 * Detect duplicate / conflicting entries inside the custom redirects table.
 *
 * Surfaces: self-loops, two-step loops, chains pointing to inactive targets,
 * and duplicate `from_path` rows (which should be prevented by the unique
 * index but are still validated defensively).
 */
export interface RedirectConflict {
  kind: "self_loop" | "cycle" | "duplicate_from" | "chain_to_redirected";
  from_path: string;
  to_path: string;
  detail?: string;
}

export function detectRedirectConflicts(
  rows: ReadonlyArray<RedirectEntry & { enabled?: boolean }>,
): RedirectConflict[] {
  const out: RedirectConflict[] = [];
  const byFrom = new Map<string, RedirectEntry>();
  const seen = new Set<string>();

  for (const r of rows) {
    if (seen.has(r.from_path)) {
      out.push({
        kind: "duplicate_from",
        from_path: r.from_path,
        to_path: r.to_path,
      });
    } else {
      seen.add(r.from_path);
      byFrom.set(r.from_path, r);
    }
  }

  for (const r of rows) {
    if (r.from_path === r.to_path) {
      out.push({ kind: "self_loop", from_path: r.from_path, to_path: r.to_path });
      continue;
    }
    // Two-hop cycle detection
    const next = byFrom.get(r.to_path);
    if (next && next.to_path === r.from_path) {
      out.push({
        kind: "cycle",
        from_path: r.from_path,
        to_path: r.to_path,
        detail: `↔ ${next.from_path}`,
      });
    } else if (next) {
      out.push({
        kind: "chain_to_redirected",
        from_path: r.from_path,
        to_path: r.to_path,
        detail: `${next.from_path} → ${next.to_path}`,
      });
    }
  }

  return out;
}
