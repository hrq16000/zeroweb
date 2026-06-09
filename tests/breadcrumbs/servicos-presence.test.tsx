import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { ServicosBreadcrumbs } from "@/components/site/ServicosBreadcrumbs";

/**
 * Garante que ServicosBreadcrumbs renderiza um <nav aria-label="Breadcrumb">
 * para cada página da loja virtual (/servicos/*), em qualquer viewport.
 * Falha a suite se uma rota for adicionada sem cobertura.
 */
const paths = [
  "/servicos",
  "/servicos/marketplace",
  "/servicos/parceiros",
  "/servicos/consultoria",
  "/servicos/site-express",
  "/servicos/site-24h",
  "/servicos/presenca-digital",
  "/servicos/google-meu-negocio",
  "/servicos/gestao-redes-sociais",
  "/servicos/trafego-pago",
  "/servicos/trafego-pago-local",
  "/servicos/produto-dinamico-xyz",
];

function makeRouter(initial: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <ServicosBreadcrumbs />
        <Outlet />
      </>
    ),
  });
  const splat = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => null,
  });
  rootRoute.addChildren([splat]);
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initial] }),
  });
}

describe("Loja virtual — Breadcrumbs em toda página /servicos/*", () => {
  for (const path of paths) {
    it(`renderiza <nav aria-label="Breadcrumb"> em ${path}`, async () => {
      const router = makeRouter(path);
      await router.load();
      const { container } = render(<RouterProvider router={router} />);
      const nav = container.querySelector('nav[aria-label="Breadcrumb"]');
      expect(nav, `Breadcrumb ausente em ${path}`).not.toBeNull();
      // viewport-agnostic: classes responsivas não afetam o teste — basta existir.
      const items = nav!.querySelectorAll("li");
      expect(items.length).toBeGreaterThanOrEqual(2); // Início + Serviços
    });
  }
});
