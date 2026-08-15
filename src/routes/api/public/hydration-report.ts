import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { recordHydrationReport } from "@/lib/hydration-telemetry.server";

/**
 * Telemetria de falhas de hidratação. Sem PII: apenas motivo, mensagem
 * truncada, rota, correlação e user-agent.
 *
 * POST — recebe o relatório do cliente (beacon), com rate limit estrito por IP.
 * GET  — não é público: o painel consolidado vive em `/app/hydration`
 *        (server function autenticada + admin).
 */
const payloadSchema = z.object({
  reason: z.string().max(60),
  detail: z.string().max(500).optional().default(""),
  path: z.string().max(300),
  search: z.string().max(300).optional().default(""),
  mode: z.enum(["hydrate", "client-only"]).optional().default("hydrate"),
  ua: z.string().max(200).optional().default(""),
  cid: z.string().max(64).optional().default(""),
  ts: z.number().optional(),
});

const RATE_WINDOW_S = 60;
const RATE_MAX = 20;

export const Route = createFileRoute("/api/public/hydration-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("cf-connecting-ip") ??
          null;

        try {
          const { hashIp } = await import("@/lib/whatsapp-redirect.server");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: allowed } = await (supabaseAdmin as any).rpc(
            "check_and_record_rate_limit",
            {
              p_scope: "hydration_report",
              p_ip_hash: hashIp(ip) ?? "no-ip",
              p_window_seconds: RATE_WINDOW_S,
              p_max_hits: RATE_MAX,
            },
          );
          if (allowed === false) return new Response("Too many requests", { status: 429 });
        } catch (err) {
          // Rate limiter indisponível não pode derrubar a telemetria.
          console.warn("[hydration-report] rate limit check failed", (err as Error).message);
        }

        let parsed: z.infer<typeof payloadSchema>;
        try {
          const raw = await request.text();
          if (raw.length > 4000) return new Response("Payload too large", { status: 413 });
          parsed = payloadSchema.parse(JSON.parse(raw));
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        const entry = recordHydrationReport({
          reason: parsed.reason,
          detail: parsed.detail,
          path: parsed.path,
          search: parsed.search,
          mode: parsed.mode,
          ua: parsed.ua,
          correlationId: parsed.cid,
        });

        console.error(
          `[hydration-failure] cid=${parsed.cid || "n/a"} reason=${parsed.reason} route=${parsed.path}${parsed.search} mode=${parsed.mode} routeTotal=${entry.total} clientOnly=${entry.clientOnlyFallbacks} detail=${parsed.detail} ua=${parsed.ua}`,
        );

        return new Response(null, { status: 204 });
      },
      GET: async () => new Response("Not found", { status: 404 }),
    },
  },
});
