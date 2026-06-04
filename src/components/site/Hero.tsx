import { motion } from "motion/react";
import { ArrowRight, MessageCircle, Sparkles, Zap } from "lucide-react";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { useExperiment } from "@/lib/ab-testing";
import { useWaFunnel } from "@/components/site/WaFunnelModal";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const stats = [
  { label: "Projetos", value: "+500" },
  { label: "Anos de experiência", value: "+20" },
  { label: "Aprovação", value: "95%" },
  { label: "Suporte", value: "Nacional" },
];

const HERO_VARIANTS = {
  A: {
    headline: "Sua empresa merece mais que",
    accent: "apenas um site.",
    sub: "Criamos sites, automações, sistemas e estratégias digitais que atraem clientes, aumentam vendas e transformam negócios em máquinas de crescimento.",
  },
  B: {
    headline: "Mais clientes. Menos esforço.",
    accent: "Tudo no mesmo time.",
    sub: "Tecnologia, IA e marketing performam juntos para multiplicar seus leads em até 312% nos primeiros 90 dias.",
  },
} as const;

const CTA_VARIANTS = {
  A: { label: "Solicitar Diagnóstico Gratuito", icon: ArrowRight },
  B: { label: "Quero Mais Clientes Agora", icon: Zap },
} as const;

export function Hero() {
  const heroVariant = useExperiment("hero_copy", ["A", "B"] as const);
  const ctaVariant = useExperiment("hero_cta", ["A", "B"] as const);
  const copy = HERO_VARIANTS[heroVariant];
  const cta = CTA_VARIANTS[ctaVariant];
  const CtaIcon = cta.icon;
  const { open: openFunnel } = useWaFunnel();

  return (
    <section id="inicio" className="relative pt-32 lg:pt-40 pb-24 bg-hero overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-foreground/80 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Tecnologia que gera crescimento
          </motion.div>

          <motion.h1
            key={heroVariant}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
          >
            {copy.headline} <span className="text-gradient">{copy.accent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl"
          >
            {copy.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#diagnostico"
              onClick={() =>
                trackEvent("cta_click", {
                  label: "solicitar_diagnostico",
                  location: "hero",
                  experiment_hero: heroVariant,
                  experiment_cta: ctaVariant,
                })
              }
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
            >
              {cta.label}
              <CtaIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href={whatsappUrl(undefined, "hero")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversion("whatsapp_click", { location: "hero", experiment_hero: heroVariant })}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background font-semibold px-6 py-3.5 hover:bg-foreground/90 transition"
            >
              <MessageCircle className="w-4 h-4 text-accent" />
              Falar no WhatsApp
            </a>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div className="text-2xl lg:text-3xl font-bold font-display">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-primary opacity-25 blur-3xl rounded-full pointer-events-none" />
            <picture>
              <img
                src={heroDashboard}
                alt="Dashboard 0WEB mostrando crescimento de tráfego orgânico e leads qualificados"
                width={1280}
                height={960}
                fetchPriority="high"
                decoding="async"
                sizes="(min-width: 1024px) 480px, 100vw"
                className="relative w-full h-auto rounded-3xl shadow-elegant border border-border/40"
              />
            </picture>
            <div className="absolute -bottom-4 -left-4 sm:-left-6 glass rounded-2xl px-4 py-3 shadow-elegant hidden sm:flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">↑</span>
              <div>
                <p className="text-xs text-muted-foreground">Tráfego orgânico</p>
                <p className="text-lg font-bold font-display">+312%</p>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 sm:-right-6 glass rounded-2xl px-4 py-3 shadow-elegant hidden sm:block">
              <p className="text-xs text-muted-foreground">Leads/mês</p>
              <p className="text-lg font-bold font-display text-gradient">2.8k</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
