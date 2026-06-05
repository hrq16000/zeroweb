import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VisitInput = z.object({
  path: z.string().min(1).max(2048),
  query: z.string().max(2048).optional().nullable(),
  referer: z.string().max(2048).optional().nullable(),
  user_agent: z.string().max(1024).optional().nullable(),
  visitor_id: z.string().max(128).optional().nullable(),
  session_id: z.string().max(128).optional().nullable(),
  utm_source: z.string().max(128).optional().nullable(),
  utm_medium: z.string().max(128).optional().nullable(),
  utm_campaign: z.string().max(128).optional().nullable(),
  utm_content: z.string().max(128).optional().nullable(),
  utm_term: z.string().max(128).optional().nullable(),
  gclid: z.string().max(256).optional().nullable(),
  fbclid: z.string().max(256).optional().nullable(),
  tenant_slug: z.string().max(128).optional().nullable(),
  landing_page: z.string().max(2048).optional().nullable(),
});

// Rate-limit thresholds (per ip_hash)
const RL_WINDOW_SEC = 10;
const RL_MAX_HITS = 15; // > 15 hits in 10s => suspect
const RL_BLOCK_MAX = 40; // > 40 hits in 10s => block

function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null;
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  if (ip.includes(":")) {
    const segs = ip.split(":");
    return segs.slice(0, 3).join(":") + "::";
  }
  return ip;
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseUA(ua: string | null) {
  if (!ua) return { ua_browser: null, ua_os: null, ua_device: null, is_bot: true };
  const u = ua.toLowerCase();
  const is_bot = /bot|crawl|spider|slurp|preview|monitor|axios|curl|wget|headless|lighthouse|python-requests|scrapy|java\//i.test(ua);
  const ua_browser = /edg/i.test(ua) ? "Edge" : /chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : /firefox/i.test(ua) ? "Firefox" : "Other";
  const ua_os = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ipad|ios/i.test(ua) ? "iOS" : /mac os/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "Other";
  const ua_device = /mobile|iphone|android.*mobile/i.test(u) ? "mobile" : /tablet|ipad/i.test(u) ? "tablet" : "desktop";
  return { ua_browser, ua_os, ua_device, is_bot };
}

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((input) => VisitInput.parse(input))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const req = getRequest();
    const headers = req.headers;

    const ipRaw =
      headers.get("cf-connecting-ip") ||
      headers.get("x-real-ip") ||
      (headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      null;
    const ipAnon = anonymizeIp(ipRaw);
    const ua = data.user_agent || headers.get("user-agent");
    const country = headers.get("cf-ipcountry") || null;
    const city = headers.get("cf-ipcity") || null;
    const asn = headers.get("cf-ip-asn") || null;
    const referer = data.referer || headers.get("referer") || null;

    const day = new Date().toISOString().slice(0, 10);
    const salt = process.env.VISITOR_HASH_SALT || "0web-salt";
    const ipHash = await sha256(`${ipRaw || "unknown"}|${day}|${salt}`);
    const meta = parseUA(ua);

    // ----- Rate limit / blocking -----
    let blocked = false;
    let block_reason: string | null = null;
    let risk_score = 0;

    try {
      const sinceIso = new Date(Date.now() - RL_WINDOW_SEC * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("visitantes_rastreio")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", sinceIso);
      const hits = count ?? 0;
      if (hits >= RL_BLOCK_MAX) {
        blocked = true;
        block_reason = "rate_limit_block";
        risk_score = 90;
      } else if (hits >= RL_MAX_HITS) {
        block_reason = "rate_limit_warn";
        risk_score = 60;
      }
    } catch {
      // soft-fail rate-limit check
    }

    if (meta.is_bot) {
      risk_score = Math.max(risk_score, 50);
      if (!block_reason) block_reason = "bot_signature";
    }
    if (!ua || ua.length < 8) {
      risk_score = Math.max(risk_score, 70);
      blocked = blocked || risk_score >= 70;
      if (!block_reason) block_reason = "missing_ua";
    }

    const row = {
      day,
      visitor_id: data.visitor_id || null,
      session_id: data.session_id || null,
      ip_address: ipAnon,
      ip_hash: ipHash,
      country,
      city,
      asn,
      user_agent: ua?.slice(0, 1000) || null,
      ua_browser: meta.ua_browser,
      ua_os: meta.ua_os,
      ua_device: meta.ua_device,
      is_bot: meta.is_bot,
      method: req.method,
      path: data.path,
      query: data.query || null,
      referer,
      landing_page: data.landing_page || data.path,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_content: data.utm_content || null,
      utm_term: data.utm_term || null,
      gclid: data.gclid || null,
      fbclid: data.fbclid || null,
      tenant_slug: data.tenant_slug || null,
      blocked,
      block_reason,
      risk_score,
    };

    const { error } = await supabaseAdmin
      .from("visitantes_rastreio")
      .upsert(row, { onConflict: "ip_hash,day", ignoreDuplicates: true });

    if (error) {
      console.error("trackVisit error:", error.message);
      return { ok: false, blocked };
    }
    return { ok: true, blocked };
  });
