import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ia")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/$slug", params: { slug: "automacao-com-ia" }, statusCode: 301, replace: true });
  },
  component: () => null,
});
