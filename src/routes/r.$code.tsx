// Sprint 13 — Redirect rastreado de link de parceiro (/r/$code)
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r/$code")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const code = String(params.code || "").slice(0, 30);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: link } = await supabaseAdmin
          .from("partner_links")
          .select("id, partner_id, target_path, active")
          .eq("code", code)
          .maybeSingle();

        const headers = new Headers();
        let redirectTo = "/";
        if (link && link.active) {
          redirectTo = link.target_path || "/";
          // cookie de atribuição 60 dias
          headers.append(
            "Set-Cookie",
            `0web_partner=${encodeURIComponent(code)}; Path=/; Max-Age=${60 * 86400}; SameSite=Lax`,
          );
          // log clique (não bloqueia redirect)
          const ipHash = await hashIp(request.headers.get("cf-connecting-ip") ?? "");
          supabaseAdmin
            .from("partner_clicks")
            .insert({
              link_id: link.id,
              partner_id: link.partner_id,
              ip_hash: ipHash,
              country: request.headers.get("cf-ipcountry"),
              referer: request.headers.get("referer"),
              user_agent: request.headers.get("user-agent")?.slice(0, 500),
            })
            .then(() => undefined);
        }
        headers.set("Location", redirectTo);
        return new Response(null, { status: 302, headers });
      },
    },
  },
});

async function hashIp(ip: string): Promise<string | null> {
  if (!ip) return null;
  const enc = new TextEncoder().encode(ip + new Date().toISOString().slice(0, 10));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
