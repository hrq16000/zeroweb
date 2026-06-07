import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/google-meu-negocio
export const Route = createFileRoute("/google-meu-negocio")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/google-meu-negocio", statusCode: 301 });
  },
  component: () => null,
});
