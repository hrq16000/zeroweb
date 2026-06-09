/**
 * Stub endpoint to receive GSC coverage exports from external pullers
 * (Apps Script, n8n, Make). Authenticated by the Supabase anon key in the
 * `apikey` header.
 *
 * Body: { rows: Array<{ url, issue_type, status_code?, message? }> }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  rows: z.array(z.object({
    url: z.string().url().max(2000),
    issue_type: z.enum(["404", "soft_404", "redirect", "excluded", "server_error", "blocked_robots", "noindex", "other"]),
    status_code: z.number().int().optional(),
    message: z.string().max(2000).optional(),
  })).min(1).max(2000),
});

export const Route = createFileRoute("/api/public/hooks/gsc-ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronSecret } = await import("./_cron-auth");
        const unauth = requireCronSecret(request);
        if (unauth) return unauth;
        let body: unknown;
        try { body = await request.json(); } catch { return new Response("invalid_json", { status: 400 }); }
        const parsed = Body.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const rows = parsed.data.rows.map((r) => ({
          url: r.url,
          issue_type: r.issue_type,
          status_code: r.status_code ?? null,
          message: r.message ?? null,
          source: "gsc_webhook",
        }));
        const { error } = await supabaseAdmin.from("index_coverage_issues").insert(rows);
        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ ok: true, inserted: rows.length });
      },
    },
  },
});
