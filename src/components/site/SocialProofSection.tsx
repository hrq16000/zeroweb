import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Quote, Star, TrendingUp, Users, Award, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cases } from "@/lib/cases-data";

const metrics = [
  { icon: Users, label: "Clientes atendidos", value: 520, suffix: "+", tone: "primary" as const },
  { icon: TrendingUp, label: "Crescimento médio orgânico", value: 312, suffix: "%", tone: "emerald" as const },
  { icon: Award, label: "Anos de mercado", value: 20, suffix: "+", tone: "accent" as const },
  { icon: Zap, label: "Leads gerados / mês", value: 28400, suffix: "", tone: "violet" as const },
];

const testimonials = [
  {
    quote: "Mais que uma agência — virou parte da nossa operação. Resultado constante e mensurável.",
    author: "Diretoria",
    role: "Preciso de um Profissional",
    stars: 5,
  },
  {
    quote: "Triplicamos a operação sem precisar dobrar a equipe. A automação fez o trabalho.",
    author: "Fundador",
    role: "Preciso de um Técnico",
    stars: 5,
  },
  {
    quote: "Saímos do anonimato para liderar buscas em Curitiba. Trabalho técnico sério.",
    author: "Diretor",
    role: "Autoescola Aptos",
    stars: 5,
  },
];

export function SocialProofSection() {
  return (
    <section
      id="prova-social"
      className="relative py-24 overflow-hidden bg-gradient-to-br from-background via-surface to-muted/30"
    >
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Prova social
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Empresas reais.{" "}
            <span className="text-gradient">Resultados mensuráveis.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Os números abaixo são acumulados das empresas que confiaram na 0WEB para crescer
            digitalmente.
          </p>
        </div>

        {/* Counters */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <Counter key={m.label} {...m} delay={i * 0.08} />
          ))}
        </div>

        {/* Cases preview */}
        <div className="mt-16">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <h3 className="text-2xl font-bold font-display">Cases de sucesso</h3>
            <p className="text-sm text-muted-foreground">
              Clique para abrir o estudo completo de cada projeto.
            </p>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/cases/$slug"
                  params={{ slug: c.slug }}
                  className="group block rounded-2xl border border-border overflow-hidden bg-card hover:shadow-elegant transition"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={c.cover}
                      alt={`Case ${c.brand}`}
                      width={1280}
                      height={800}
                      loading="lazy"
                      className="w-full aspect-[16/10] object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${c.color} opacity-0 group-hover:opacity-60 transition-opacity`}
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {c.category} · {c.city}
                    </div>
                    <div className="mt-1 font-semibold">{c.brand}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {c.metrics.slice(0, 2).map((m) => (
                        <span
                          key={m.label}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold"
                        >
                          {m.label}: <span className="text-gradient">{m.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author + i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-elegant"
            >
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: t.stars }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <Quote className="w-6 h-6 mt-3 text-primary/60" />
              <p className="mt-3 text-base leading-relaxed">{t.quote}</p>
              <div className="mt-5 text-sm">
                <strong className="text-foreground">{t.author}</strong>
                <span className="text-muted-foreground"> · {t.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
  delay,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  suffix: string;
  tone: "primary" | "accent" | "emerald" | "violet";
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const startTs = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.floor(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  const toneBg = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    emerald: "bg-emerald-500/10 text-emerald-600",
    violet: "bg-violet-500/10 text-violet-600",
  }[tone];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elegant"
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${toneBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-4 text-4xl font-bold font-display tabular-nums">
        {val.toLocaleString("pt-BR")}
        {suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
    </motion.div>
  );
}
