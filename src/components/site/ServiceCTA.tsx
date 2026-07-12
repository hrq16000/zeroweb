import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

export type ServiceCTALocation =
  | "default"
  | "header"
  | "hero"
  | "card"
  | "detail"
  | "footer";

type Props = {
  serviceSlug: string;
  /** Map de location → form slug definido no painel administrativo. */
  funnels?: Record<string, string>;
  location?: ServiceCTALocation;
  label?: string;
  className?: string;
  showArrow?: boolean;
};

/**
 * CTA padrão dos serviços. Cada local (hero, card, rodapé...) pode disparar um
 * funil diferente, 100% configurável pelo painel administrativo
 * (services.funnels jsonb). Sem configuração, cai no funil global do site.
 */
export function ServiceCTA({
  serviceSlug,
  funnels = {},
  location = "default",
  label = "Quero saber mais",
  className,
  showArrow = true,
}: Props) {
  const eventLocation = `service_${serviceSlug}_${location}`;

  return (
    <FunnelCTAButton
      pageType="service"
      serviceSlug={serviceSlug}
      serviceFunnels={funnels}
      intent={{
        purpose: "proposal",
        source: eventLocation,
        pagePath: typeof window === "undefined" ? `/servicos/${serviceSlug}` : window.location.pathname,
        placement: location === "hero" ? "hero" : location === "footer" ? "footer" : "section",
        serviceSlug,
      }}
      label={label}
      location={eventLocation}
      className={className}
      showArrow={showArrow}
    />
  );
}
