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

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [globalBlockMiddleware, errorMiddleware],
}));
