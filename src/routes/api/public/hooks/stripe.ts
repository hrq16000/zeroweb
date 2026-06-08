import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Webhook do Stripe — esqueleto pronto, **desativado por padrão**.
 *
 * Fica ativo automaticamente assim que o secret `STRIPE_WEBHOOK_SECRET`
 * estiver configurado e o painel "Pagamentos" habilitar Stripe. Atualiza
 * `orders.status = 'paid'` quando recebe `checkout.session.completed` ou
 * `payment_intent.succeeded`. Sem o secret, responde 503 — Stripe entende
 * como "endpoint offline" e suspende reenvios.
 *
 * Configuração no painel Stripe:
 *   URL: https://0web.com.br/api/public/hooks/stripe
 *   Eventos: checkout.session.completed, payment_intent.succeeded
 *   Sempre inclua `metadata.order_id` (UUID do pedido) no Checkout Session
 *   ou `client_reference_id = order_id`.
 */
export const Route = createFileRoute("/api/public/hooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Stripe webhook desativado (sem secret).", { status: 503 });
        }

        const sigHeader = request.headers.get("stripe-signature");
        const body = await request.text();
        if (!sigHeader) return new Response("Missing signature", { status: 400 });

        // Stripe signature: t=<timestamp>,v1=<hex_hmac>(,v1=<hex_hmac>)*
        const parts = Object.fromEntries(
          sigHeader.split(",").map((p) => {
            const [k, ...rest] = p.split("=");
            return [k, rest.join("=")];
          }),
        ) as Record<string, string>;
        const timestamp = parts.t;
        const signatures = sigHeader
          .split(",")
          .filter((p) => p.startsWith("v1="))
          .map((p) => p.slice(3));
        if (!timestamp || signatures.length === 0) {
          return new Response("Malformed signature", { status: 400 });
        }
        // Replay protection: 5min tolerance
        const ts = Number(timestamp);
        if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
          return new Response("Timestamp out of tolerance", { status: 400 });
        }
        const expected = createHmac("sha256", secret)
          .update(`${timestamp}.${body}`)
          .digest("hex");
        const expectedBuf = Buffer.from(expected);
        const ok = signatures.some((s) => {
          const sBuf = Buffer.from(s);
          return sBuf.length === expectedBuf.length && timingSafeEqual(sBuf, expectedBuf);
        });
        if (!ok) return new Response("Invalid signature", { status: 401 });

        let event: { type?: string; data?: { object?: Record<string, unknown> } };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const obj = (event.data?.object ?? {}) as Record<string, unknown>;
        const orderId =
          (obj.client_reference_id as string | undefined) ||
          ((obj.metadata as Record<string, string> | undefined)?.order_id) ||
          undefined;

        // Extrai ID do PaymentIntent / Session para auditoria
        const stripeId = (obj.id as string | undefined) ?? null;
        const amount = (obj.amount_total as number | undefined) ?? (obj.amount_received as number | undefined) ?? null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (
          (event.type === "checkout.session.completed" ||
            event.type === "payment_intent.succeeded") &&
          orderId
        ) {
          const { error } = await supabaseAdmin
            .from("orders")
            .update({
              status: "paid",
              payment_method: "stripe",
              paid_at: new Date().toISOString(),
              metadata: { stripe_event: event.type, stripe_id: stripeId, amount },
            })
            .eq("id", orderId);
          if (error) {
            console.error("[stripe-webhook] order update error:", error.message);
            return new Response("DB error", { status: 500 });
          }
        }

        // Sempre 200 quando assinatura é válida — evita reenvios em loop.
        return Response.json({ received: true, type: event.type ?? null });
      },
    },
  },
});
