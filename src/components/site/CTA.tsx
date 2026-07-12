import { Sparkles } from "lucide-react";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

export function CTA() {
  return (
    <section id="contato" className="py-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground text-background p-10 lg:p-16">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Vamos conversar</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Pronto para colocar sua empresa <span className="text-accent">na frente dos concorrentes?</span>
            </h2>
            <p className="mt-5 text-background/70 text-lg">
              Diagnóstico gratuito, sem compromisso. Em 24h você recebe um plano sob medida.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <FunnelCTAButton
                intent={{
                  purpose: "diagnosis",
                  source: "final_cta",
                  pagePath: typeof window === "undefined" ? "/" : window.location.pathname,
                  placement: "section",
                }}
                label="Solicitar Diagnóstico"
                location="final_cta"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
              />
              <FunnelCTAButton
                intent={{
                  purpose: "commercial",
                  source: "final_cta_specialist",
                  pagePath: typeof window === "undefined" ? "/" : window.location.pathname,
                  placement: "section",
                }}
                label="Falar com especialista"
                location="final_cta_specialist"
                showArrow={false}
                className="inline-flex items-center gap-2 rounded-full glass-dark text-background font-semibold px-6 py-3.5 hover:bg-background/10 transition"
              />
              <Sparkles className="w-4 h-4 text-accent self-center" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
