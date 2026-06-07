import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/trafego-pago
export const Route = createFileRoute("/trafego-pago")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/trafego-pago", statusCode: 301 });
  },
  component: () => null,
});
