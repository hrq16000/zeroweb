import { motion } from "motion/react";
import { TrendingUp, Users, ShoppingCart } from "lucide-react";

const cases = [
  {
    icon: TrendingUp,
    label: "Tráfego orgânico",
    value: "+412%",
    desc: "Reposicionamento SEO em 6 meses.",
    points: [12, 18, 22, 30, 44, 58, 72, 88],
  },
  {
    icon: Users,
    label: "Leads qualificados",
    value: "+286%",
    desc: "Funil de captação + IA de qualificação.",
    points: [20, 24, 35, 42, 50, 64, 78, 92],
  },
  {
    icon: ShoppingCart,
    label: "Vendas online",
    value: "+193%",
    desc: "E-commerce headless + performance.",
    points: [30, 38, 45, 52, 60, 68, 80, 95],
  },
];

export function Cases() {
  return (
    <section className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Cases</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Crescimento <span className="text-gradient">mensurável.</span>
          </h2>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl bg-background border border-border p-6 shadow-elegant"
            >
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-primary text-primary-foreground">
                  <c.icon className="w-5 h-5" />
                </span>
                <span className="text-3xl font-bold font-display text-gradient">{c.value}</span>
              </div>
              <h3 className="mt-4 font-semibold text-lg">{c.label}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <Sparkline points={c.points} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const w = 280, h = 80, step = w / (points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step},${h - (v / max) * (h - 8) - 4}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 w-full h-20">
      <defs>
        <linearGradient id="line" x1="0" x2="1">
          <stop offset="0%" stopColor="oklch(0.58 0.24 262)" />
          <stop offset="100%" stopColor="oklch(0.83 0.17 170)" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#line)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
