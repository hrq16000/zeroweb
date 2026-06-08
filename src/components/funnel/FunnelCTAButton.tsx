import { ArrowRight } from "lucide-react";
import { useFunnel, type FunnelPageType } from "@/hooks/useFunnel";
import { FunnelModalWrapper } from "./FunnelModalWrapper";
import { trackEvent } from "@/lib/analytics";

type Props = {
  pageType: FunnelPageType;
  serviceSlug?: string;
  serviceFunnels?: Record<string, string>;
  /** Força um slug específico ignorando a resolução padrão de useFunnel. */
  funnelSlug?: string;
  label?: string;
  className?: string;
  location?: string;
  showArrow?: boolean;
};

/**
 * Botão "tudo-em-um" que abre o FunnelModalWrapper. Resolve o funil correto
 * via useFunnel (banco + fallback). Use nas páginas legadas de serviço, posts
 * e onde o funil precisar substituir um CTA de WhatsApp direto.
 */
export function FunnelCTAButton({
  pageType,
  serviceSlug,
  serviceFunnels,
  funnelSlug: funnelSlugOverride,
  label = "Solicitar orçamento gratuito",
  className,
  location,
  showArrow = true,
}: Props) {
  const {
    isOpen,
    openFunnel,
    closeFunnel,
    funnelSlug: resolvedFunnelSlug,
  } = useFunnel(pageType, serviceSlug, serviceFunnels);
  const funnelSlug = funnelSlugOverride ?? resolvedFunnelSlug;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent("cta_click", {
            label: "funnel_cta",
            location: location ?? `${pageType}_${serviceSlug ?? "page"}`,
            funnel: funnelSlug,
          });
          openFunnel();
        }}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition-opacity"
        }
      >
        {label}
        {showArrow && <ArrowRight className="w-4 h-4" />}
      </button>
      <FunnelModalWrapper
        open={isOpen}
        onClose={closeFunnel}
        funnelSlug={funnelSlug}
        serviceSlug={serviceSlug}
      />
    </>
  );
}
