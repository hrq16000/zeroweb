import { motion } from "motion/react";

const steps = [
  { n: "01", title: "Diagnóstico", desc: "Entendemos seu negócio, mercado e objetivos." },
  { n: "02", title: "Planejamento", desc: "Estratégia, arquitetura e roadmap claro." },
  { n: "03", title: "Desenvolvimento", desc: "Design + código com stack moderna." },
  { n: "04", title: "Aprovação", desc: "Revisões iterativas com sua equipe." },
  { n: "05", title: "Publicação", desc: "Deploy seguro, monitoramento e analytics." },
  { n: "06", title: "Crescimento", desc: "Otimização contínua e ganho de performance." },
];

export function Process() {
  return (
    <section className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Processo</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Do diagnóstico ao <span className="text-gradient">crescimento.</span>
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="relative rounded-2xl bg-background border border-border p-6 overflow-hidden"
            >
              <span className="absolute -right-3 -top-6 text-7xl font-bold font-display text-muted opacity-80 select-none">
                {s.n}
              </span>
              <div className="relative">
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
