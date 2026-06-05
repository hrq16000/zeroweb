/**
 * Pure helpers extracted from the visitor tracking middleware
 * (see src/start.ts). Kept side-effect free so they can be
 * unit-tested without a real Request/Response or DB.
 */

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) {
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}

export function hasAnalyticsConsent(cookies: Record<string, string>): boolean {
  const raw = cookies["0web_consent_v1"];
  if (!raw) return false;
  try {
    const c = JSON.parse(raw);
    return c?.decided === true && c?.analytics_storage === "granted";
  } catch {
    return false;
  }
}

export function shouldSkip(pathname: string): boolean {
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

export type TrackDecision =
  | { action: "skip"; reason: string }
  | { action: "track"; visitorId: string; setCookie: string | null; ephemeral: boolean }
  | { action: "track-ephemeral"; visitorId: string };

export function decideTracking(input: {
  method: string;
  pathname: string;
  accept: string | null;
  cookieHeader: string | null;
}): TrackDecision {
  if (input.method !== "GET") return { action: "skip", reason: "non-GET" };
  if (shouldSkip(input.pathname)) return { action: "skip", reason: "asset" };
  if (!input.accept || !input.accept.includes("text/html"))
    return { action: "skip", reason: "non-html" };

  const cookies = parseCookies(input.cookieHeader);
  const consented = hasAnalyticsConsent(cookies);
  const existing = cookies["0web_vid"] ?? null;

  if (!consented) {
    // Ephemeral per-request id, never persisted, never inserted.
    return { action: "track-ephemeral", visitorId: existing ?? crypto.randomUUID() };
  }

  if (existing) {
    return { action: "track", visitorId: existing, setCookie: null, ephemeral: false };
  }

  const fresh = crypto.randomUUID();
  return {
    action: "track",
    visitorId: fresh,
    setCookie: `0web_vid=${fresh}; Path=/; Max-Age=63072000; HttpOnly; Secure; SameSite=Lax`,
    ephemeral: false,
  };
}
