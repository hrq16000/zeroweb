import { Check } from "lucide-react";
import { motion } from "motion/react";

const items = [
  "Mobile First", "SEO Estrutural", "Core Web Vitals", "LGPD",
  "Segurança Avançada", "Hospedagem Premium", "Suporte Humanizado",
  "IA Integrada", "Escalabilidade", "Performance Máxima",
  "Design Premium", "Stack Moderna",
];

export function Differentials() {
  return (
    <section id="servicos" className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Diferenciais</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Engenharia, design e estratégia <span className="text-gradient">no mesmo time.</span>
          </h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.04 }}
              className="flex items-center gap-3 rounded-2xl bg-background border border-border px-4 py-4 hover:border-primary/40 transition"
            >
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-accent/20 text-foreground">
                <Check className="w-4 h-4" />
              </span>
              <span className="font-medium">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
