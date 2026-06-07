import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/trafego-pago-local
export const Route = createFileRoute("/trafego-pago-local")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/trafego-pago-local", statusCode: 301 });
  },
  component: () => null,
});
