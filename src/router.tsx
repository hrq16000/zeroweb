import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Desidrata o cache do React Query no HTML e reidrata no cliente:
  // sem isso, componentes que leem queries pré-carregadas no loader
  // (Header, FeaturedServices) renderizam vazios na hidratação → mismatch.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
