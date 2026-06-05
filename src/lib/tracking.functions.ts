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

function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null;
  // IPv4: zero last octet
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  // IPv6: keep /48
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
  if (!ua) return { ua_browser: null, ua_os: null, ua_device: null, is_bot: false };
  const u = ua.toLowerCase();
  const is_bot = /bot|crawl|spider|slurp|preview|monitor|axios|curl|wget|headless|lighthouse/i.test(ua);
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
    };

    // Upsert on (ip_hash, day) — first visit per visitor per day
    const { error } = await supabaseAdmin
      .from("visitantes_rastreio")
      .upsert(row, { onConflict: "ip_hash,day", ignoreDuplicates: true });

    if (error) {
      console.error("trackVisit error:", error.message);
      return { ok: false };
    }
    return { ok: true };
  });
