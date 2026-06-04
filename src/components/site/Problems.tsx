import { motion } from "motion/react";
import { Zap, Search, PhoneOff, Share2, Bot, Trophy } from "lucide-react";

const items = [
  { icon: Zap, title: "Site lento", desc: "Cada segundo a mais custa até 7% em conversão." },
  { icon: Search, title: "Invisível no Google", desc: "Sem SEO, ninguém encontra sua empresa." },
  { icon: PhoneOff, title: "Poucos contatos", desc: "Tráfego sem estratégia não vira cliente." },
  { icon: Share2, title: "Redes sem resultado", desc: "Postar não basta — é preciso converter." },
  { icon: Bot, title: "Sem automação", desc: "Sua equipe gasta horas no que IA faz em segundos." },
  { icon: Trophy, title: "Concorrentes na frente", desc: "Enquanto você espera, eles vendem." },
];

export function Problems() {
  return (
    <section className="py-24 bg-surface relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Diagnóstico</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Sua empresa está perdendo clientes <span className="text-gradient">sem perceber?</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Se algum desses pontos parece familiar, você está deixando dinheiro na mesa todos os dias.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-2xl bg-background border border-border p-6 hover:border-primary/40 hover:shadow-elegant transition"
            >
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-destructive/10 text-destructive">
                  <it.icon className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-lg">{it.title}</h3>
              </div>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
