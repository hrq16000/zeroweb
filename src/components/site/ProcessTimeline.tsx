import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Search, Compass, Code2, CheckCircle2, Rocket, TrendingUp } from "lucide-react";

const STEPS = [
  {
    id: "diagnostico",
    icon: Search,
    title: "Diagnóstico",
    desc: "Entendemos seu negócio, mercado e métricas atuais para definir prioridades.",
  },
  {
    id: "planejamento",
    icon: Compass,
    title: "Planejamento",
    desc: "Arquitetura de informação, escopo, roadmap e definição de sucesso.",
  },
  {
    id: "desenvolvimento",
    icon: Code2,
    title: "Desenvolvimento",
    desc: "Design + código com stack moderna, performance e SEO técnico desde a base.",
  },
  {
    id: "aprovacao",
    icon: CheckCircle2,
    title: "Aprovação",
    desc: "Ciclos curtos de revisão com sua equipe e ajustes guiados por dados.",
  },
  {
    id: "publicacao",
    icon: Rocket,
    title: "Publicação",
    desc: "Deploy seguro, monitoramento, analytics e integrações ativas no dia 1.",
  },
  {
    id: "crescimento",
    icon: TrendingUp,
    title: "Crescimento",
    desc: "Otimização contínua, conteúdo, tráfego e iterações guiadas por conversão.",
  },
];

export function ProcessTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 20 });

  return (
    <section className="py-24 relative" id="processo">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Processo</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Do <span className="text-gradient">diagnóstico</span> ao crescimento.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Um caminho claro, com etapas mensuráveis e responsabilidades definidas em cada fase.
          </p>
        </div>

        <div ref={ref} className="mt-14 relative">
          {/* Linha guia */}
          <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-px bg-border" aria-hidden />
          <motion.div
            style={{ scaleY: progress, transformOrigin: "top" }}
            className="absolute left-5 sm:left-7 top-0 bottom-0 w-px bg-gradient-to-b from-primary to-accent"
            aria-hidden
          />

          <ol className="space-y-10">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="relative pl-16 sm:pl-20 scroll-mt-24"
              >
                <span className="absolute left-0 top-0 grid place-items-center w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
                  <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-primary/40 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
