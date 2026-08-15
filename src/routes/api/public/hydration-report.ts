import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  hydrationTelemetrySnapshot,
  recordHydrationReport,
} from "@/lib/hydration-telemetry.server";

/**
 * Telemetria de falhas de hidratação. Sem PII: apenas motivo, mensagem
 * truncada, rota, correlação e user-agent.
 *
 * POST — recebe o relatório do cliente (beacon) e agrega por rota.
 * GET  — devolve o painel consolidado (contagens por rota, sem PII).
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

export const Route = createFileRoute("/api/public/hydration-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
      GET: async () => {
        const snapshot = hydrationTelemetrySnapshot();
        console.warn(
          `[hydration-telemetry] totalReports=${snapshot.totalReports} routesTracked=${snapshot.routesTracked}`,
        );
        return Response.json(snapshot, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
