import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// In-memory negative cache to avoid hammering the DB for every request.
// Map<ip_hash, expires_at_ms>
const blockedCache = new Map<string, { until: number; reason: string }>();
const CACHE_TTL_MS = 60_000;

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function shouldSkip(pathname: string): boolean {
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

// ---------------------------------------------------------------------------
// Canonical / redirect middleware.
// Pure decision logic lives in `@/lib/canonical-redirect.helpers` so it can
// be unit-tested without spinning up the Worker runtime. This wrapper handles
// the I/O side (Supabase cache + hit counter).
// ---------------------------------------------------------------------------

import { computeCanonicalRedirect } from "@/lib/canonical-redirect.helpers";

type RedirectHit = { to: string; status: number };
const redirectCache = new Map<string, RedirectHit>();
let redirectCacheAt = 0;
const REDIRECT_CACHE_TTL_MS = 60_000;

async function loadRedirectsIntoCache(): Promise<void> {
  const now = Date.now();
  if (redirectCache.size > 0 && now - redirectCacheAt < REDIRECT_CACHE_TTL_MS) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("redirects")
      .select("from_path,to_path,status_code,enabled")
      .eq("enabled", true)
      .limit(2000);
    redirectCache.clear();
    for (const r of (data ?? []) as Array<{
      from_path: string;
      to_path: string;
      status_code: number;
    }>) {
      redirectCache.set(r.from_path, { to: r.to_path, status: r.status_code });
    }
    redirectCacheAt = now;
  } catch (e) {
    console.warn("[redirects cache]", e);
  }
}

function recordRedirectHit(fromPath: string): void {
  // Fire-and-forget hit counter (best-effort, ignore errors).
  (async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("redirects")
        .select("hits")
        .eq("from_path", fromPath)
        .maybeSingle();
      const next = (data?.hits ?? 0) + 1;
      await supabaseAdmin
        .from("redirects")
        .update({ hits: next, last_hit_at: new Date().toISOString() })
        .eq("from_path", fromPath);
    } catch {
      /* noop */
    }
  })();
}

const canonicalRedirectMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    await loadRedirectsIntoCache();
    const decision = computeCanonicalRedirect({
      method: request.method,
      url: request.url,
      forwardedProto: request.headers.get("x-forwarded-proto"),
      redirects: redirectCache,
    });
    if (decision) {
      if (decision.source === "custom") recordRedirectHit(decision.fromPath);
      return new Response(null, {
        status: decision.status,
        headers: {
          Location: decision.location,
          "Cache-Control":
            decision.source === "custom"
              ? "public, max-age=300"
              : "public, max-age=3600",
        },
      });
    }
  } catch (e) {
    console.warn("[canonicalRedirectMiddleware]", e);
  }
  return next();
});



const globalBlockMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    const url = new URL(request.url);
    if (request.method !== "GET" || shouldSkip(url.pathname)) return next();

    const headers = request.headers;
    const ipRaw =
      headers.get("cf-connecting-ip") ||
      headers.get("x-real-ip") ||
      (headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "";
    if (!ipRaw) return next();

    const day = new Date().toISOString().slice(0, 10);
    const salt = process.env.VISITOR_HASH_SALT || "0web-salt";
    const ipHash = await sha256Hex(`${ipRaw}|${day}|${salt}`);

    const now = Date.now();
    // Purge expired cache entries occasionally
    if (blockedCache.size > 2000) {
      for (const [k, v] of blockedCache) if (v.until < now) blockedCache.delete(k);
    }

    const cached = blockedCache.get(ipHash);
    if (cached && cached.until > now) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "300",
          "X-Block-Reason": cached.reason,
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // DB lookup via supabaseAdmin
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("ip_blocklist")
      .select("block_reason,expires_at")
      .eq("ip_hash", ipHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (data) {
      blockedCache.set(ipHash, {
        until: now + CACHE_TTL_MS,
        reason: data.block_reason ?? "blocked",
      });
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "300",
          "X-Block-Reason": data.block_reason ?? "blocked",
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  } catch (e) {
    // Fail open — never let middleware break the site
    console.warn("[globalBlockMiddleware]", e);
  }
  return next();
});

// ---------------------------------------------------------------------------
// Visitor tracking middleware — runs server-side on every page request.
// Generates an HttpOnly `0web_vid` cookie when absent and upserts a row in
// `visitantes_rastreio` via ctx.waitUntil (non-blocking). Skips assets and
// respects analytics consent cookie (`0web_consent_v1`).
// ---------------------------------------------------------------------------

import { decideTracking } from "@/lib/tracking-middleware.helpers";

// Token bucket per ip_hash to avoid stampedes hitting Supabase: at most
// 4 inserts per 10s per visitor (well above normal navigation cadence).
const insertRateBucket = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 4;
function allowInsert(ipHash: string): boolean {
  const now = Date.now();
  const slot = insertRateBucket.get(ipHash);
  if (!slot || slot.resetAt < now) {
    insertRateBucket.set(ipHash, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (insertRateBucket.size > 5000) {
      for (const [k, v] of insertRateBucket) if (v.resetAt < now) insertRateBucket.delete(k);
    }
    return true;
  }
  if (slot.count >= RATE_MAX) return false;
  slot.count += 1;
  return true;
}

const visitorTrackingMiddleware = createMiddleware().server(async ({ next, request }) => {
  let setCookieValue: string | null = null;
  try {
    const url = new URL(request.url);
    const decision = decideTracking({
      method: request.method,
      pathname: url.pathname,
      accept: request.headers.get("accept"),
      cookieHeader: request.headers.get("cookie"),
    });

    if (decision.action === "track") {
      setCookieValue = decision.setCookie;
      const headers = request.headers;
      const ipRaw =
        headers.get("cf-connecting-ip") ||
        headers.get("x-real-ip") ||
        (headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
        "";
      const day = new Date().toISOString().slice(0, 10);
      const salt = process.env.VISITOR_HASH_SALT || "0web-salt";
      const ipHash = ipRaw
        ? await sha256Hex(`${ipRaw}|${day}|${salt}`)
        : await sha256Hex(`${decision.visitorId}|${day}|${salt}`);

      if (allowInsert(ipHash)) {
        const sp = url.searchParams;
        const insertPromise = (async () => {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin.from("visitantes_rastreio").upsert(
              {
                visitor_id: decision.visitorId,
                ip_hash: ipHash,
                day,
                method: "GET",
                path: url.pathname,
                query: url.search || null,
                referer: headers.get("referer"),
                user_agent: headers.get("user-agent"),
                country: headers.get("cf-ipcountry"),
                city: headers.get("cf-ipcity"),
                asn: headers.get("cf-ip-asn"),
                landing_page: url.pathname,
                utm_source: sp.get("utm_source"),
                utm_medium: sp.get("utm_medium"),
                utm_campaign: sp.get("utm_campaign"),
                utm_content: sp.get("utm_content"),
                utm_term: sp.get("utm_term"),
                gclid: sp.get("gclid"),
                fbclid: sp.get("fbclid"),
              },
              { onConflict: "ip_hash,day,path", ignoreDuplicates: true },
            );
          } catch (e) {
            console.warn("[visitorTrackingMiddleware insert]", e);
          }
        })();
        const cfCtx = (globalThis as { __cfCtx?: { waitUntil?: (p: Promise<unknown>) => void } }).__cfCtx;
        if (cfCtx?.waitUntil) cfCtx.waitUntil(insertPromise);
        else void insertPromise;
      }
    }
    // action === "skip" or "track-ephemeral" → no insert, no cookie.
  } catch (e) {
    console.warn("[visitorTrackingMiddleware]", e);
  }

  const response = await next();
  if (setCookieValue && response instanceof Response) {
    try { response.headers.append("set-cookie", setCookieValue); } catch { /* noop */ }
  }
  return response;
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [canonicalRedirectMiddleware, globalBlockMiddleware, visitorTrackingMiddleware, errorMiddleware],
}));
