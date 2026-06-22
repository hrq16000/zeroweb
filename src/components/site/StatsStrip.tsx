import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Users, Rocket, Star, Globe2 } from "lucide-react";

type Stat = {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
};

const STATS: Stat[] = [
  { icon: Rocket, value: 7, label: "Sites entregues em 2026" },
  { icon: Globe2, value: 20, suffix: " anos", label: "No ar construindo presença digital" },
  { icon: Star, value: 3, suffix: "%", label: "Top 5 do Google (média dos projetos)" },
  { icon: Users, value: 4.9, decimals: 1, suffix: "/5", label: "Avaliação média dos clientes" },
];

function useCountUp(target: number, active: boolean, duration = 1600, decimals = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Number((target * eased).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, decimals]);
  return v;
}

function StatCard({ s, active, delay }: { s: Stat; active: boolean; delay: number }) {
  const v = useCountUp(s.value, active, 1600, s.decimals ?? 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 text-center"
    >
      <s.icon className="w-6 h-6 text-primary mx-auto" />
      <div className="mt-3 text-3xl sm:text-4xl font-bold font-display text-gradient">
        {s.prefix}
        {s.decimals ? v.toFixed(s.decimals) : Math.round(v).toLocaleString("pt-BR")}
        {s.suffix}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
    </motion.div>
  );
}

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30" aria-hidden />
      <div ref={ref} className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Números</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">
            Resultados que <span className="text-gradient">somam.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} s={s} active={inView} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
