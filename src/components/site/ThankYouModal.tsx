import { useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle, ArrowRight, MessageCircle, HelpCircle, Layers, Sparkles, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";
import { getThankYouContent, type LeadSource } from "@/lib/thank-you-content";
import { getLeadAttribution, attributionToEventParams } from "@/lib/lead-attribution";
import { loadAttributionSnapshot } from "@/lib/lead-attribution-snapshot";
import { useWhatsappTracking } from "@/lib/use-whatsapp-tracking";
import { THANK_YOU_CTA, buildThankYouCtaParams } from "@/lib/event-taxonomy";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source?: LeadSource | string;
};

export function ThankYouModal({ open, onOpenChange, source }: Props) {
  // Prefer the attribution snapshot persisted at submit-time so the modal
  // shows the exact same source/channel/UTM as /obrigado and the events
  // emitted from this surface — even after a refresh or back navigation.
  const attr = useMemo(() => {
    if (typeof window === "undefined") return null;
    return loadAttributionSnapshot() ?? getLeadAttribution(String(source || "unknown"));
  }, [source, open]);
  const resolvedSource = attr?.source ?? String(source || "unknown");
  const content = attr?.content ?? getThankYouContent(resolvedSource);

  const evtAttr = useMemo(() => {
    if (typeof window === "undefined") return { source: resolvedSource, channel: content.channel };
    return attributionToEventParams(attr ?? getLeadAttribution(resolvedSource));
  }, [attr, resolvedSource, content.channel]);

  useEffect(() => {
    if (!open) return;
    trackConversion("thank_you_view", { ...evtAttr, surface: "modal", event_category: "conversion" });
  }, [open, evtAttr]);

  const fireCta = (eventName: string, ctaId: string, label: string, position: number, target: string) => {
    const params = buildThankYouCtaParams({
      base: evtAttr,
      surface: "modal",
      ctaId,
      target,
      label,
      position,
    });
    trackConversion(eventName, params);
    // Legacy aggregate event kept during transition for older dashboards.
    trackEvent("thank_you_cta_click", { ...params, legacy: true });
  };

  const wa = useWhatsappTracking({
    ...evtAttr,
    location: `thankyou_modal_${content.channel}`,
    surface: "modal",
    cta_id: THANK_YOU_CTA.WHATSAPP.id,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl text-center font-display">
            {content.title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-muted-foreground text-sm">{content.subtitle}</p>

        <a
          href={whatsappUrl(content.whatsappMessage, `thankyou_modal_${content.channel}`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            wa.onClick();
            trackConversion(THANK_YOU_CTA.WHATSAPP.event, {
              ...evtAttr,
              surface: "modal",
              location: `thankyou_modal_${content.channel}`,
              cta_id: THANK_YOU_CTA.WHATSAPP.id,
            });
          }}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
        >
          <MessageCircle className="w-4 h-4" /> Falar no WhatsApp agora
        </a>

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            to={THANK_YOU_CTA.PLANS.target}
            onClick={() => fireCta(THANK_YOU_CTA.PLANS.event, THANK_YOU_CTA.PLANS.id, "Ver planos", 1, THANK_YOU_CTA.PLANS.target)}
            className="group rounded-xl border border-border bg-card p-3 text-left hover:border-primary transition-colors"
          >
            <Layers className="w-4 h-4 text-primary mb-1" />
            <p className="text-sm font-semibold">Ver planos</p>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              {content.planosLabel} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <Link
            to={THANK_YOU_CTA.FAQ.target}
            onClick={() => fireCta(THANK_YOU_CTA.FAQ.event, THANK_YOU_CTA.FAQ.id, "Ver FAQ", 2, THANK_YOU_CTA.FAQ.target)}
            className="group rounded-xl border border-border bg-card p-3 text-left hover:border-primary transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-primary mb-1" />
            <p className="text-sm font-semibold">Dúvidas</p>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              FAQ rápido <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <Link
            to={content.finalCtaTo}
            onClick={() => fireCta(THANK_YOU_CTA.DIAGNOSTICO.event, THANK_YOU_CTA.DIAGNOSTICO.id, content.finalCtaLabel, 3, content.finalCtaTo)}
            className="group rounded-xl border border-primary/40 bg-primary/5 p-3 text-left hover:border-primary transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary mb-1" />
            <p className="text-sm font-semibold">{content.finalCtaLabel}</p>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              Próximo passo <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <div className="grid grid-cols-3 gap-2 mb-2 text-center">
            {content.stats.map((s) => (
              <div key={s.l}>
                <p className="text-sm font-bold text-primary">{s.n}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.l}</p>
              </div>
            ))}
          </div>
          {content.testimonials[0] && (
            <figure className="border-t border-border/60 pt-2">
              <div className="flex gap-0.5 text-yellow-500 mb-1" aria-label="5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <blockquote className="text-xs text-foreground">"{content.testimonials[0].text}"</blockquote>
              <figcaption className="text-[10px] text-muted-foreground mt-1">
                — {content.testimonials[0].name} · {content.testimonials[0].role}
              </figcaption>
            </figure>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            trackEvent(THANK_YOU_CTA.DISMISS.event, { ...evtAttr, surface: "modal" });
            onOpenChange(false);
          }}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block"
        >
          Continuar navegando
        </button>
      </DialogContent>
    </Dialog>
  );
}
