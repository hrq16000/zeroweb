import { motion } from "motion/react";
import { ArrowRight, MessageCircle, Sparkles, TrendingUp, Users, Activity } from "lucide-react";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";

const stats = [
  { label: "Projetos", value: "+500" },
  { label: "Anos de experiência", value: "+20" },
  { label: "Aprovação", value: "95%" },
  { label: "Suporte", value: "Nacional" },
];

export function Hero() {
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
          >
            Sua empresa merece mais que <span className="text-gradient">apenas um site.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl"
          >
            Criamos sites, automações, sistemas e estratégias digitais que atraem clientes,
            aumentam vendas e transformam negócios em máquinas de crescimento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#contato"
              onClick={() => trackEvent("cta_click", { label: "solicitar_diagnostico", location: "hero" })}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
            >
              Solicitar Diagnóstico Gratuito
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversion("whatsapp_click", { location: "hero" })}
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
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
      <div className="relative glass rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/70" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            0web · dashboard
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Conversão" value="+184%" tone="primary" />
          <MetricCard icon={<Users className="w-4 h-4" />} label="Leads/mês" value="2.8k" tone="accent" />
        </div>

        <div className="mt-3 rounded-2xl bg-foreground text-background p-5">
          <div className="flex items-center justify-between text-xs text-background/70">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-accent" />
              Tráfego orgânico
            </span>
            <span>últimos 30 dias</span>
          </div>
          <svg viewBox="0 0 300 80" className="mt-3 w-full h-20">
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.83 0.17 170)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="oklch(0.83 0.17 170)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 C30,45 50,55 80,35 C110,15 140,40 170,28 C200,18 230,30 260,12 L300,8 L300,80 L0,80 Z"
              fill="url(#g)"
            />
            <path
              d="M0,60 C30,45 50,55 80,35 C110,15 140,40 170,28 C200,18 230,30 260,12 L300,8"
              fill="none"
              stroke="oklch(0.83 0.17 170)"
              strokeWidth="2"
            />
          </svg>
          <div className="mt-2 text-2xl font-bold font-display">+312%</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {["LCP 1.1s", "SEO 100", "A11y 98"].map((m) => (
            <div key={m} className="rounded-xl bg-muted py-2 text-[11px] font-medium">
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "accent";
}) {
  return (
    <div className="rounded-2xl bg-muted p-4">
      <div
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
          tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold font-display">{value}</div>
    </div>
  );
}
