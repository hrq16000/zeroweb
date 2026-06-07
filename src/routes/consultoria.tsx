import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/consultoria
export const Route = createFileRoute("/consultoria")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/consultoria", statusCode: 301 });
  },
  component: () => null,
});
