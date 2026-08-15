import { createFileRoute } from "@tanstack/react-router";

/**
 * Mediação server-side do "pedido com ajuda". Valida o token opaco, registra a
 * solicitação e redireciona para o funil — sem expor telefone/e-mail no HTML.
 */
export const Route = createFileRoute("/suporte-pedido/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { resolveOrderSupportToken } = await import("@/lib/order-support.server");
        const result = await resolveOrderSupportToken(params.token);

        const target = result.ok
          ? result.redirectTo
          : `/f/funnel-order-support?intent=order-support&status=${result.reason}`;

        return new Response(null, {
          status: 302,
          headers: {
            location: target,
            "cache-control": "no-store",
            "referrer-policy": "no-referrer",
          },
        });
      },
    },
  },
});
