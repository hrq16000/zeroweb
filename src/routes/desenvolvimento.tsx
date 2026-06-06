import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/desenvolvimento")({
  beforeLoad: () => {
    throw redirect({ to: "/servicos/$slug", params: { slug: "desenvolvimento-saas" }, statusCode: 301, replace: true });
  },
  component: () => null,
});
