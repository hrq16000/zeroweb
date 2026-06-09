import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Check, Globe, MousePointerClick } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useExperiment, trackExperimentEvent } from "@/lib/ab-testing";

const BULLETS = [
  { strong: "Site projetado para converter", rest: "visitantes das suas campanhas em clientes reais." },
  { strong: "Jornada otimizada", rest: "do clique do anúncio à conversão em menos de 3 segundos." },
  { strong: "Carregamento ultra-rápido", rest: "para não perder leads impacientes no meio do caminho." },
  { strong: "100% compatível", rest: "com Meta Pixel, GA4, Google Tag Manager e Conversion API." },
];

export function HomeSpotlight() {
  const variant = useExperiment("home_spotlight_copy", ["A", "B"] as const);
  const headline = variant === "A"
    ? { pre: "Anúncios sem site otimizado?", em: "você perde até 70% dos leads." }
    : { pre: "Cada clique pago sem destino certo?", em: "é dinheiro virando fumaça." };
  const ctaLabel = variant === "A" ? "Obter orçamento gratuito" : "Falar com especialista agora";
  return (
    <section id="spotlight" className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant p-8 sm:p-12 lg:p-16 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center"
        >
          {/* decorative glow */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-primary opacity-10 blur-3xl" />

          {/* LEFT: copy */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1.5">
                <Globe className="w-3.5 h-3.5" /> Criação de Sites
              </span>
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="text-primary"
              >
                <Activity className="w-4 h-4" />
              </motion.span>
            </div>

            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] uppercase">
              {headline.pre}{" "}
              <span className="text-gradient">{headline.em}</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Um site otimizado transforma cliques pagos em clientes reais. A combinação que
              vence: <strong className="text-foreground">anúncio certo + página de alta performance</strong> = ROI máximo,
              sem dinheiro escorrendo pelo ralo.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
              A partir de <span className="text-foreground font-bold">R$ 1.490</span>
              <span className="text-muted-foreground">· entrega em 7 dias</span>
            </div>

            <ul className="mt-7 space-y-3.5">
              {BULLETS.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                  className="flex gap-3 text-sm sm:text-[15px] leading-relaxed"
                >
                  <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span>
                    <strong className="text-foreground">{b.strong}</strong>{" "}
                    <span className="text-muted-foreground">{b.rest}</span>
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contato"
                onClick={() => {
                  trackEvent("cta_click", { label: "spotlight_orcamento", location: "home_spotlight", variant });
                  trackExperimentEvent("conversion", "home_spotlight_copy", variant, { label: "spotlight_orcamento" });
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary hover:opacity-95 transition uppercase text-sm tracking-wide"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/servicos"
                onClick={() => {
                  trackEvent("cta_click", { label: "spotlight_ver_servicos", location: "home_spotlight", variant });
                  trackExperimentEvent("click", "home_spotlight_copy", variant, { label: "spotlight_ver_servicos" });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background hover:border-primary hover:text-primary font-semibold px-6 py-3 text-sm transition uppercase tracking-wide"
              >
                Ver serviços
              </Link>
            </div>
          </div>

          {/* RIGHT: animated browser mockup */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/85 via-primary to-primary/70 p-6 sm:p-8 overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            >
              {/* browser */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-xl bg-background shadow-2xl overflow-hidden border border-white/20"
              >
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 h-3 flex-1 rounded bg-muted" />
                </div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-full rounded bg-muted/70" />
                  <div className="h-2 w-5/6 rounded bg-muted/70" />
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="aspect-[4/3] rounded-md bg-muted" />
                    <div className="aspect-[4/3] rounded-md bg-muted" />
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="aspect-[4/3] rounded-md bg-emerald-100 grid place-items-center"
                    >
                      <Check className="w-6 h-6 text-emerald-600" strokeWidth={3} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* floating cursor */}
              <motion.div
                aria-hidden="true"
                initial={{ x: -10, y: 10, opacity: 0 }}
                animate={{ x: [10, 60, 10], y: [40, -10, 40], opacity: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 right-10 text-white drop-shadow-lg"
              >
                <MousePointerClick className="w-7 h-7" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
