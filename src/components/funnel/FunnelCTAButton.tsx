import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useFunnel, type FunnelPageType } from "@/hooks/useFunnel";
import { FunnelModalWrapper } from "./FunnelModalWrapper";
import { trackEvent } from "@/lib/analytics";
import {
  buildContactFallbackHref,
  type ContactIntent,
} from "@/lib/contact-intent";

type LegacyProps = {
  pageType: FunnelPageType;
  serviceSlug?: string;
  serviceFunnels?: Record<string, string>;
  /** Força um slug específico ignorando a resolução padrão. @deprecated use `intent`. */
  funnelSlug?: string;
};

type Props = Partial<LegacyProps> & {
  /**
   * Funnel-first: preferred way to open a funnel. The `purpose` decides
   * which funnel (from a fixed allowlist) is opened; slugs are never
   * chosen directly by the caller. Legacy props above are kept for
   * backwards compatibility during migration.
   */
  intent?: ContactIntent;
  label?: string;
  className?: string;
  location?: string;
  showArrow?: boolean;
};

/**
 * Botão "tudo-em-um" que abre o FunnelModalWrapper. Renderiza um `<a href>`
 * real para o fallback (`/contato?...` ou `/lgpd?...`), intercepta o clique
 * somente no lado cliente e abre o modal com `preventDefault`. Sem JS, o link
 * navega para o funil renderizado em página cheia.
 */
export function FunnelCTAButton({
  pageType,
  serviceSlug,
  serviceFunnels,
  funnelSlug: funnelSlugOverride,
  intent,
  label = "Solicitar orçamento gratuito",
  className,
  location,
  showArrow = true,
}: Props) {
  const resolvedPageType: FunnelPageType = pageType ?? "common";
  const {
    isOpen,
    openFunnel,
    closeFunnel,
    funnelSlug: resolvedFunnelSlug,
  } = useFunnel(resolvedPageType, serviceSlug, serviceFunnels, intent);
  const funnelSlug = funnelSlugOverride ?? resolvedFunnelSlug;

  const clickingRef = useRef(false);

  const fallbackHref = intent
    ? buildContactFallbackHref(intent)
    : "/contato";

  const runtimeIntent: ContactIntent = intent ?? {
    purpose: resolvedPageType === "service" ? "proposal" : "diagnosis",
    source: location ?? `${resolvedPageType}_${serviceSlug ?? "page"}`,
    pagePath: typeof window === "undefined" ? "/" : window.location.pathname,
    placement: resolvedPageType === "post" ? "article" : "section",
    serviceSlug,
  };

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // Preserve normal navigation for Ctrl/Cmd/middle-click.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (clickingRef.current) {
      e.preventDefault();
      return;
    }
    clickingRef.current = true;
    setTimeout(() => { clickingRef.current = false; }, 400);

    e.preventDefault();
    trackEvent("contact_cta_click", {
      label: "funnel_cta",
      location: location ?? `${resolvedPageType}_${serviceSlug ?? "page"}`,
      funnel: funnelSlug,
      purpose: intent?.purpose,
      placement: intent?.placement,
      surface: intent?.pagePath,
    });
    openFunnel();
  };

  return (
    <>
      <a
        href={fallbackHref}
        onClick={onClick}
        data-funnel-slug={funnelSlug}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition-opacity"
        }
      >
        {label}
        {showArrow && <ArrowRight className="w-4 h-4" />}
      </a>
      <FunnelModalWrapper
        open={isOpen}
        onClose={closeFunnel}
        funnelSlug={funnelSlug}
        serviceSlug={serviceSlug}
        intent={runtimeIntent}
      />
    </>
  );
}
