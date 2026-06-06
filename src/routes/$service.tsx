import { createFileRoute, redirect } from "@tanstack/react-router";

// Rota legada: /$service → /servicos/$slug (301 permanente).
// Mantida apenas para preservar SEO de links antigos indexados.
export const Route = createFileRoute("/$service")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/servicos/$slug",
      params: { slug: params.service },
      statusCode: 301,
      replace: true,
    });
  },
  component: () => null,
});
