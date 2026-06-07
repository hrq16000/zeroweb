import { createFileRoute } from "@tanstack/react-router";
import { ErrorState } from "../components/site/ErrorState";

export const Route = createFileRoute("/403")({
  head: () => ({
    meta: [
      { title: "403 · Acesso restrito | 0WEB" },
      { name: "description", content: "Você não tem permissão para acessar esta página." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <ErrorState kind="403" />,
});
