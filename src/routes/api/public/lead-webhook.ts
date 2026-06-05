// Public webhook stub: accepts lead payloads from external sources
// (formulários externos, integrações). Validates input + optional shared secret.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().min(3).max(40).optional(),
  company: z.string().max(200).optional(),
  source: z.string().max(60).default("webhook"),
  landing_page: z.string().max(500).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  payload_json: z.record(z.string(), z.unknown()).optional(),
});

export const Route = createFileRoute("/api/public/lead-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const secret = process.env.LEAD_WEBHOOK_SECRET;
          if (secret && request.headers.get("x-webhook-secret") !== secret) {
            return new Response("Unauthorized", { status: 401 });
          }
          const body = await request.json().catch(() => null);
          const parsed = Schema.safeParse(body);
          if (!parsed.success) {
            return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
          }
          if (!parsed.data.email && !parsed.data.phone) {
            return Response.json({ ok: false, error: "email_or_phone_required" }, { status: 400 });
          }
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { payload_json, ...rest } = parsed.data;
          const insertRow: Record<string, unknown> = { ...rest, status: "novo" };
          if (payload_json) insertRow.payload_json = payload_json as never;
          const { data, error } = await supabaseAdmin
            .from("lead_submissions")
            .insert(insertRow as never)
            .select("id")
            .single();
          if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
          return Response.json({ ok: true, id: data.id });
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "unknown" },
            { status: 500 }
          );
        }
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret",
          },
        }),
    },
  },
});
