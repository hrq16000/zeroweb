import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout para todas as rotas /servicos/* — apenas renderiza o filho.
export const Route = createFileRoute("/servicos")({
  component: () => <Outlet />,
});
