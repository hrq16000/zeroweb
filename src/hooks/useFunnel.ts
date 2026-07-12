import { useCallback, useMemo, useState } from "react";
import type { ContactIntent } from "@/lib/contact-intent";
import { assertAllowedFunnelSlug, resolveFunnelFromIntent } from "@/lib/contact-intent";

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
 *   1. `intent` — resolvido pelo `resolveFunnelFromIntent` central. É a via
 *      preferida (Funnel-first policy) e ignora qualquer slug controlado por
 *      caller/URL que não esteja no allowlist.
 *   2. `serviceFunnels` (vindo de services.funnels), quando `pageType==='service'`.
 *      O slug do banco é validado contra o allowlist antes de ser aceito.
 *   3. Slug-base por tipo (funnel-common | funnel-service | funnel-post).
 */
export function useFunnel(
  pageType: FunnelPageType,
  _serviceSlug?: string,
  serviceFunnels?: Record<string, string>,
  intent?: ContactIntent,
) {
  const [isOpen, setOpen] = useState(false);

  const funnelSlug = useMemo(() => {
    if (intent) return resolveFunnelFromIntent(intent);
    if (pageType === "service" && serviceFunnels) {
      const raw =
        serviceFunnels.cta ||
        serviceFunnels.hero ||
        serviceFunnels.default;
      const validated = assertAllowedFunnelSlug(raw);
      if (validated) return validated;
    }
    return BASE_SLUG[pageType];
  }, [pageType, serviceFunnels, intent]);

  const openFunnel = useCallback(() => setOpen(true), []);
  const closeFunnel = useCallback(() => setOpen(false), []);

  return { isOpen, openFunnel, closeFunnel, funnelSlug };
}
