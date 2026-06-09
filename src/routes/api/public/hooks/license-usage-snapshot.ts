import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron diário (pg_cron): gera license_usage_metrics para cada licença ativa.
 * Chamada via /api/public/hooks/license-usage-snapshot (sem auth, bypass público).
 */
export const Route = createFileRoute("/api/public/hooks/license-usage-snapshot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronSecret } = await import("./_cron-auth");
        const unauth = requireCronSecret(request);
        if (unauth) return unauth;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: licenses, error } = await supabaseAdmin
          .from("licenses")
          .select("id, portal_id, status")
          .in("status", ["active", "trial"]);

        if (error) {
          console.error("[license-usage-snapshot] list error", error.message);
          return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
        }

        const today = new Date().toISOString().slice(0, 10);
        let processed = 0;
        const errors: string[] = [];

        for (const lic of licenses ?? []) {
          try {
            const [users, leads, visits] = await Promise.all([
              supabaseAdmin.from("portal_members").select("user_id", { count: "exact", head: true }).eq("portal_id", lic.portal_id),
              supabaseAdmin.from("lead_submissions").select("id", { count: "exact", head: true }).eq("portal_id", lic.portal_id),
              supabaseAdmin.from("visitantes_rastreio").select("id", { count: "exact", head: true }).eq("portal_id", lic.portal_id),
            ]);

            const { error: upErr } = await supabaseAdmin
              .from("license_usage_metrics")
              .upsert(
                {
                  license_id: lic.id,
                  portal_id: lic.portal_id,
                  day: today,
                  users_count: users.count ?? 0,
                  leads_count: leads.count ?? 0,
                  visits_count: visits.count ?? 0,
                  projects_count: 0,
                },
                { onConflict: "license_id,day" },
              );
            if (upErr) throw new Error(upErr.message);
            processed++;
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[license-usage-snapshot] license=${lic.id}`, msg);
            errors.push(`${lic.id}: ${msg}`);
          }
        }

        return new Response(
          JSON.stringify({ ok: true, processed, total: (licenses ?? []).length, errors }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
      GET: async () => new Response("ok"),
    },
  },
});
