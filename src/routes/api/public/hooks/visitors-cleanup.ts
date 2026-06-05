import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/visitors-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // pg_cron calls this with the project's anon apikey header
        const apikey = request.headers.get("apikey");
        if (!apikey || apikey.length < 20) {
          return new Response("unauthorized", { status: 401 });
        }
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
