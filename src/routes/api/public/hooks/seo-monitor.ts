import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendWhatsAppAlert } from "@/lib/alerts.functions";

const BASE = "https://grow-evolution-engine.lovable.app";
const ROUTES_TO_CHECK = ["/", "/blog", "/servicos", "/contato", "/google-meu-negocio"];

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; body?: string }> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "0web-seo-monitor/1.0" } });
    const body = r.headers.get("content-type")?.includes("text/") ? await r.text() : undefined;
    return { ok: r.ok, status: r.status, body };
  } catch {
    return { ok: false, status: 0 };
  }
}

export const Route = createFileRoute("/api/public/hooks/seo-monitor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        if (apikey !== process.env.SUPABASE_PUBLISHABLE_KEY && apikey !== process.env.SUPABASE_ANON_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }

        const sitemap = await checkUrl(`${BASE}/sitemap.xml`);
        const robots = await checkUrl(`${BASE}/robots.txt`);
        const sitemapUrlCount = sitemap.body ? (sitemap.body.match(/<loc>/g) || []).length : 0;

        let jsonldFailed = 0;
        const jsonldDetails: Array<{ route: string; ok: boolean; reason?: string }> = [];
        for (const r of ROUTES_TO_CHECK) {
          const res = await checkUrl(`${BASE}${r}`);
          const hasJsonLd = res.body?.includes('application/ld+json') ?? false;
          jsonldDetails.push({ route: r, ok: res.ok && hasJsonLd, reason: !res.ok ? `http ${res.status}` : !hasJsonLd ? "no JSON-LD" : undefined });
          if (!res.ok || !hasJsonLd) jsonldFailed++;
        }

        const ok = sitemap.ok && robots.ok && jsonldFailed === 0 && sitemapUrlCount > 5;

        const { data: inserted } = await supabaseAdmin
          .from("seo_monitor_runs")
          .insert({
            sitemap_ok: sitemap.ok,
            sitemap_url_count: sitemapUrlCount,
            robots_ok: robots.ok,
            jsonld_ok: jsonldFailed === 0,
            jsonld_routes_checked: ROUTES_TO_CHECK.length,
            jsonld_routes_failed: jsonldFailed,
            details: { sitemap_status: sitemap.status, robots_status: robots.status, jsonld: jsonldDetails },
          })
          .select("id")
          .single();

        if (!ok) {
          const msg = `⚠️ 0WEB — Regressão SEO detectada\nsitemap: ${sitemap.status} (${sitemapUrlCount} urls)\nrobots: ${robots.status}\nJSON-LD falhou: ${jsonldFailed}/${ROUTES_TO_CHECK.length}`;
          const sent = await sendWhatsAppAlert(msg);
          await supabaseAdmin.from("anomaly_alerts").insert({
            kind: "seo_regression",
            severity: "warning",
            channel: "whatsapp",
            status: sent.ok ? "sent" : "failed",
            message: msg,
            payload: { run_id: inserted?.id, jsonldFailed, sitemapUrlCount },
            sent_at: sent.ok ? new Date().toISOString() : null,
          });
          if (inserted?.id) {
            await supabaseAdmin.from("seo_monitor_runs").update({ alerted: true }).eq("id", inserted.id);
          }
        }

        return Response.json({ ok, sitemap: sitemap.status, robots: robots.status, jsonldFailed, sitemapUrlCount });
      },
    },
  },
});
