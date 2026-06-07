import { createFileRoute, redirect } from "@tanstack/react-router";

// Permanent 301 — page moved to /servicos/marketplace
export const Route = createFileRoute("/marketplace")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/marketplace", statusCode: 301 });
  },
  component: () => null,
});
