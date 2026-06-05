import { createFileRoute } from "@tanstack/react-router";
import { runHealthChecks } from "@/lib/settings.functions";

/**
 * Periodic integration health-check. Called every 15 minutes by pg_cron.
 * Auth: requires the project's anon/publishable key in the `apikey` header.
 */
export const Route = createFileRoute("/api/public/hooks/integration-healthcheck")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
        if (!apikey || !expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const results = await runHealthChecks();
          return Response.json({ ok: true, results, at: new Date().toISOString() });
        } catch (e: any) {
          return Response.json({ ok: false, error: e?.message ?? "fail" }, { status: 500 });
        }
      },
    },
  },
});
