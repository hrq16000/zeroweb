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

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function hasAnalyticsConsent(cookies: Record<string, string>): boolean {
  const raw = cookies["0web_consent_v1"];
  if (!raw) return false;
  try {
    const c = JSON.parse(raw);
    return c?.decided === true && c?.analytics_storage === "granted";
  } catch {
    return false;
  }
}

const visitorTrackingMiddleware = createMiddleware().server(async ({ next, request }) => {
  let setCookieValue: string | null = null;
  try {
    const url = new URL(request.url);
    if (request.method !== "GET" || shouldSkip(url.pathname)) return next();

    const accept = request.headers.get("accept") || "";
    // Only track real document navigations (HTML), never XHR/fetch/data calls.
    if (!accept.includes("text/html")) return next();

    const cookies = parseCookies(request.headers.get("cookie"));
    const consented = hasAnalyticsConsent(cookies);

    let visitorId = cookies["0web_vid"];
    const ephemeral = !consented;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      if (!ephemeral) {
        setCookieValue = `0web_vid=${visitorId}; Path=/; Max-Age=63072000; HttpOnly; Secure; SameSite=Lax`;
      }
    }

    if (consented) {
      const headers = request.headers;
      const ipRaw =
        headers.get("cf-connecting-ip") ||
        headers.get("x-real-ip") ||
        (headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
        "";
      const day = new Date().toISOString().slice(0, 10);
      const salt = process.env.VISITOR_HASH_SALT || "0web-salt";
      const ipHash = ipRaw ? await sha256Hex(`${ipRaw}|${day}|${salt}`) : await sha256Hex(`${visitorId}|${day}|${salt}`);

      const sp = url.searchParams;
      const insertPromise = (async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("visitantes_rastreio").upsert(
            {
              visitor_id: visitorId,
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

      // Cloudflare Workers exposes waitUntil; fall back to fire-and-forget.
      const cfCtx = (globalThis as { __cfCtx?: { waitUntil?: (p: Promise<unknown>) => void } }).__cfCtx;
      if (cfCtx?.waitUntil) cfCtx.waitUntil(insertPromise);
      else void insertPromise;
    }
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
  requestMiddleware: [globalBlockMiddleware, visitorTrackingMiddleware, errorMiddleware],
}));
