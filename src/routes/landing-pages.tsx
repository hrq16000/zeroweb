import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/landing-pages")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/$slug", params: { slug: "landing-pages" }, statusCode: 301, replace: true });
  },
  component: () => null,
});
