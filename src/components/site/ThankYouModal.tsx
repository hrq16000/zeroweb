import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle, ArrowRight, MessageCircle, HelpCircle, Layers, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";
import { getThankYouContent, type LeadSource } from "@/lib/thank-you-content";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source?: LeadSource | string;
};

export function ThankYouModal({ open, onOpenChange, source }: Props) {
  const content = getThankYouContent(source);

  useEffect(() => {
    if (!open) return;
    trackConversion("thank_you_view", {
      source: String(source || "unknown"),
      surface: "modal",
      event_category: "conversion",
    });
  }, [open, source]);

  const handleCtaClick = (ctaId: string, label: string) => {
    trackConversion("thank_you_cta_click", {
      source: String(source || "unknown"),
      cta_id: ctaId,
      label,
      surface: "modal",
    });
  };

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
          href={whatsappUrl(content.whatsappMessage, `thankyou_modal_${source || "default"}`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleCtaClick("whatsapp", "Falar no WhatsApp agora")}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
        >
          <MessageCircle className="w-4 h-4" /> Falar no WhatsApp agora
        </a>

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            to="/planos"
            onClick={() => handleCtaClick("planos", "Ver planos")}
            className="group rounded-xl border border-border bg-card p-3 text-left hover:border-primary transition-colors"
          >
            <Layers className="w-4 h-4 text-primary mb-1" />
            <p className="text-sm font-semibold">Ver planos</p>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              {content.planosLabel} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <Link
            to="/faq"
            onClick={() => handleCtaClick("faq", "Ver FAQ")}
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
            onClick={() => handleCtaClick("final_cta", content.finalCtaLabel)}
            className="group rounded-xl border border-primary/40 bg-primary/5 p-3 text-left hover:border-primary transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary mb-1" />
            <p className="text-sm font-semibold">{content.finalCtaLabel}</p>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              Próximo passo <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        <div className="mt-4 rounded-xl bg-muted/40 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">+200 clientes</strong> já cresceram com a 0WEB ·
            <strong className="text-foreground"> 98%</strong> de satisfação · resposta em até <strong className="text-foreground">1h útil</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            trackEvent("thank_you_dismiss", { source: String(source || "unknown") });
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
