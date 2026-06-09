/**
 * Daily snapshot of index_coverage_issues into index_coverage_snapshots.
 * Called by pg_cron with the Supabase anon key in the `apikey` header.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/index-coverage-snapshot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronSecret } = await import("./_cron-auth");
        const unauth = requireCronSecret(request);
        if (unauth) return unauth;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const today = new Date().toISOString().slice(0, 10);
        const from = `${today}T00:00:00Z`;
        const to = `${today}T23:59:59Z`;

        const { data: rows, error } = await supabaseAdmin
          .from("index_coverage_issues")
          .select("issue_type, resolved_at, detected_at")
          .gte("detected_at", from)
          .lte("detected_at", to);
        if (error) return new Response(error.message, { status: 500 });

        const totals: Record<string, { count: number; open: number }> = {};
        for (const r of rows ?? []) {
          const k = r.issue_type as string;
          totals[k] ??= { count: 0, open: 0 };
          totals[k].count += 1;
          if (!r.resolved_at) totals[k].open += 1;
        }
        const payload = Object.entries(totals).map(([issue_type, v]) => ({
          day: today, issue_type, count: v.count, open_count: v.open,
        }));
        if (payload.length) {
          const { error: upErr } = await supabaseAdmin
            .from("index_coverage_snapshots")
            .upsert(payload, { onConflict: "day,issue_type" });
          if (upErr) return new Response(upErr.message, { status: 500 });
        }
        return Response.json({ ok: true, written: payload.length });
      },
    },
  },
});
