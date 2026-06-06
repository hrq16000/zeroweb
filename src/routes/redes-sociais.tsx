import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/redes-sociais")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/$slug", params: { slug: "gestao-redes-sociais" }, statusCode: 301, replace: true });
  },
  component: () => null,
});
