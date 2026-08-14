import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Telemetria de falhas de hidratação. Sem PII: apenas motivo, mensagem
 * truncada, rota e user-agent. Apenas loga (visível nos Server Logs).
 */
const payloadSchema = z.object({
  reason: z.string().max(60),
  detail: z.string().max(500).optional().default(""),
  path: z.string().max(300),
  ua: z.string().max(200).optional().default(""),
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

        console.error(
          `[hydration-failure] reason=${parsed.reason} path=${parsed.path} detail=${parsed.detail} ua=${parsed.ua}`,
        );

        return new Response(null, { status: 204 });
      },
    },
  },
});
