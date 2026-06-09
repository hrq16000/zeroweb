import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Globe, ShoppingBag, TrendingUp, Check, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: Globe,
    iconClass: "text-primary bg-primary/10",
    title: "Sites Institucionais e Corporativos de Alta Performance",
    desc: "Sua empresa com uma vitrine digital profissional e autoridade imediata.",
    bullets: [
      "Design Responsivo Otimizado para Dispositivos Móveis",
      "Integração Estratégica com WhatsApp e Redes Sociais",
    ],
    to: "/criacao-sites" as const,
  },
  {
    icon: ShoppingBag,
    iconClass: "text-amber-500 bg-amber-500/10",
    title: "Lojas Virtuais e E-commerce para Vendas Online",
    desc: "Venda seus produtos 24h por dia com uma plataforma robusta e segura.",
    bullets: [
      "Sistemas de Pagamento Seguros e Checkout Simplificado",
      "Gestão de Produtos e Estoque de Fácil Operação",
    ],
    to: "/servicos" as const,
  },
  {
    icon: TrendingUp,
    iconClass: "text-accent bg-accent/15",
    title: "Landing Pages de Alta Conversão para Campanhas de Tráfego",
    desc: "Páginas focadas em um único objetivo: transformar visitantes em clientes.",
    bullets: [
      "Foco Total em Geração de Leads e Vendas Diretas",
      "Copywriting Persuasivo e Gatilhos Mentais de Venda",
    ],
    to: "/landing-pages" as const,
  },
];

export function HighlightTrio() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Especialidades
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Agência de Desenvolvimento de Sites{" "}
            <span className="text-gradient">Focada em Resultados Reais</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Tecnologia de ponta e especialistas em site para empresas que buscam liderança digital.
          </p>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl border border-border bg-background/80 backdrop-blur p-7 hover:border-primary/40 hover:shadow-elegant transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500" />

              <span
                className={`relative grid place-items-center w-14 h-14 rounded-2xl ${c.iconClass} group-hover:scale-110 transition-transform duration-300`}
              >
                <c.icon className="w-7 h-7" />
              </span>

              <h3 className="relative mt-6 font-bold text-xl leading-snug">{c.title}</h3>
              <p className="relative mt-3 text-muted-foreground leading-relaxed">{c.desc}</p>

              <ul className="relative mt-5 space-y-3">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm font-medium">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={c.to}
                className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
              >
                Saiba mais
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
