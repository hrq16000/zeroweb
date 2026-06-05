import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron endpoint — chamado diariamente por pg_cron para anonimizar e purgar
 * registros conforme prazo LGPD. Roteado em /api/public/* (bypass de auth);
 * a segurança vem do `apikey` header.
 */
export const Route = createFileRoute("/api/public/hooks/lgpd-maintenance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey") || "";
        if (!apikey || apikey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const [{ data: anon }, { data: purged }, { data: rl }] = await Promise.all([
            supabaseAdmin.rpc("anonymize_visitantes_rastreio_old"),
            supabaseAdmin.rpc("purge_visitantes_rastreio_old"),
            supabaseAdmin.rpc("purge_rate_limit_buckets"),
          ]);
          return Response.json({ ok: true, anonymized: Number(anon ?? 0), purged: Number(purged ?? 0), rate_limit_purged: Number(rl ?? 0) });
        } catch (e) {
          return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
