import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/parceiros
export const Route = createFileRoute("/parceiros")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/parceiros", statusCode: 301 });
  },
  component: () => null,
});
