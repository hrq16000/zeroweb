import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/visitors-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronSecret } = await import("./_cron-auth");
        const unauth = requireCronSecret(request);
        if (unauth) return unauth;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("purge_visitantes_rastreio_old");
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ ok: true, deleted: data ?? 0 }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
