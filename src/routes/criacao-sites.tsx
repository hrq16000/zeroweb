import { createFileRoute, redirect } from "@tanstack/react-router";

// 301 legacy → /servicos/criacao-de-sites
export const Route = createFileRoute("/criacao-sites")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/$slug", params: { slug: "criacao-de-sites" }, statusCode: 301, replace: true });
  },
  component: () => null,
});
