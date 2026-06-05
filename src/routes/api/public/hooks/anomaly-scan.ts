import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendWhatsAppAlert } from "@/lib/alerts.functions";

/**
 * Calculates z-score over last 72h of hourly buckets (mv_visitors_hourly).
 * Triggers alert when latest blocked-hits z-score > 3.
 */
export const Route = createFileRoute("/api/public/hooks/anomaly-scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        if (apikey !== process.env.SUPABASE_PUBLISHABLE_KEY && apikey !== process.env.SUPABASE_ANON_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data, error } = await supabaseAdmin
          .from("mv_visitors_hourly")
          .select("hour,total,blocked,bots")
          .order("hour", { ascending: false })
          .limit(72);
        if (error || !data || data.length < 12) {
          return Response.json({ ok: false, error: error?.message || "insufficient data" });
        }

        const series = data.slice(1); // exclude current incomplete hour
        const latest = data[0];
        const blockedVals = series.map((r: any) => r.blocked || 0);
        const mean = blockedVals.reduce((a, b) => a + b, 0) / blockedVals.length;
        const variance = blockedVals.reduce((a, b) => a + (b - mean) ** 2, 0) / blockedVals.length;
        const std = Math.sqrt(variance) || 1;
        const latestBlocked = latest.blocked || 0;
        const z = (latestBlocked - mean) / std;

        const alerts: Array<{ kind: string; ok: boolean }> = [];
        if (z > 3 && latestBlocked > 20) {
          const msg = `🚨 0WEB — Pico anômalo de bloqueios\nHora: ${latest.hour}\nBlocked: ${latestBlocked} (média 72h: ${mean.toFixed(1)}, σ: ${std.toFixed(1)}, z=${z.toFixed(2)})`;
          const sent = await sendWhatsAppAlert(msg);
          await supabaseAdmin.from("anomaly_alerts").insert({
            kind: "blocked_spike",
            severity: z > 5 ? "critical" : "warning",
            value: latestBlocked,
            threshold: mean + 3 * std,
            zscore: z,
            channel: "whatsapp",
            status: sent.ok ? "sent" : "failed",
            message: msg,
            payload: { hour: latest.hour, mean, std, error: sent.error },
            sent_at: sent.ok ? new Date().toISOString() : null,
          });
          alerts.push({ kind: "blocked_spike", ok: sent.ok });
        }
        return Response.json({ ok: true, z, latestBlocked, mean, std, alerts });
      },
    },
  },
});
