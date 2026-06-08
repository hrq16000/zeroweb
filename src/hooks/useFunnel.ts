import { useCallback, useMemo, useState } from "react";

export type FunnelPageType = "common" | "service" | "post";

const BASE_SLUG: Record<FunnelPageType, string> = {
  common: "funnel-common",
  service: "funnel-service",
  post: "funnel-post",
};

/**
 * Resolve qual funil disparar e gerencia abertura/fechamento do modal.
 *
 * Ordem de prioridade do slug:
 *   1. Se pageType === 'service' e `serviceFunnels` (vindo de services.funnels)
 *      contém uma chave 'cta' ou 'hero' ou 'default' → usa esse slug
 *   2. Slug-base por tipo (funnel-common | funnel-service | funnel-post)
 *
 * Para evitar uma chamada extra ao banco, páginas de serviço passam o mapa
 * `funnels` que já vem do loader em services-public.functions.
 */
export function useFunnel(
  pageType: FunnelPageType,
  _serviceSlug?: string,
  serviceFunnels?: Record<string, string>,
) {
  const [isOpen, setOpen] = useState(false);

  const funnelSlug = useMemo(() => {
    if (pageType === "service" && serviceFunnels) {
      return (
        serviceFunnels.cta ||
        serviceFunnels.hero ||
        serviceFunnels.default ||
        BASE_SLUG.service
      );
    }
    return BASE_SLUG[pageType];
  }, [pageType, serviceFunnels]);

  const openFunnel = useCallback(() => setOpen(true), []);
  const closeFunnel = useCallback(() => setOpen(false), []);

  return { isOpen, openFunnel, closeFunnel, funnelSlug };
}
