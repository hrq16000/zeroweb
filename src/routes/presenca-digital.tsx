import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/presenca-digital
export const Route = createFileRoute("/presenca-digital")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/presenca-digital", statusCode: 301 });
  },
  component: () => null,
});
