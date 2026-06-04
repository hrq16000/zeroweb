import { ArrowRight, MessageCircle } from "lucide-react";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";

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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                trackConversion("form_submit", {
                  form_name: "diagnostico",
                  has_company: Boolean(data.get("company")),
                });
                window.open(
                  whatsappUrl(
                    `Olá! Sou ${data.get("name") || ""} (${data.get("company") || "—"}). Quero solicitar um diagnóstico.`,
                    "final_cta_form",
                  ),
                  "_blank",
                );
              }}
              className="mt-8 grid sm:grid-cols-2 gap-3 max-w-xl"
            >
              <input
                name="name"
                required
                placeholder="Seu nome"
                className="rounded-xl bg-background/10 border border-background/20 px-4 py-3 text-sm placeholder:text-background/50 focus:outline-none focus:border-accent"
              />
              <input
                name="company"
                placeholder="Empresa"
                className="rounded-xl bg-background/10 border border-background/20 px-4 py-3 text-sm placeholder:text-background/50 focus:outline-none focus:border-accent"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="E-mail"
                className="sm:col-span-2 rounded-xl bg-background/10 border border-background/20 px-4 py-3 text-sm placeholder:text-background/50 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="sm:col-span-2 group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
              >
                Solicitar Diagnóstico
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            <div className="mt-5">
              <a
                href={whatsappUrl(undefined, "final_cta")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackConversion("whatsapp_click", { location: "final_cta" });
                  trackEvent("cta_click", { label: "falar_whatsapp", location: "final_cta" });
                }}
                className="inline-flex items-center gap-2 rounded-full glass-dark text-background font-semibold px-6 py-3.5 hover:bg-background/10 transition"
              >
                <MessageCircle className="w-4 h-4 text-accent" />
                Falar direto no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
