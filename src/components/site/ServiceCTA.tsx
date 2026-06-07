import { ArrowRight } from "lucide-react";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

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
  const { open } = useWaFunnel();
  const funnelSlug = funnels[location] || funnels.default || null;
  const eventLocation = `service_${serviceSlug}_${location}`;

  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("cta_click", {
          label: "service_cta",
          location: eventLocation,
          service: serviceSlug,
          funnel: funnelSlug ?? "global",
        });
        trackConversion("whatsapp_click", { location: eventLocation });
        // Passa o funnel slug como sufixo para que análises e roteamento possam
        // reconhecer qual configuração de funil disparou este CTA.
        open(funnelSlug ? `${eventLocation}__${funnelSlug}` : eventLocation);
      }}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition-opacity"
      }
    >
      {label}
      {showArrow && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
