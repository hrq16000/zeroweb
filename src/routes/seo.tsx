import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/seo")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/$slug", params: { slug: "seo" }, statusCode: 301, replace: true });
  },
  component: () => null,
});
