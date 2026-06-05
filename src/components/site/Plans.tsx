import { Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const plans = [
  {
    name: "Landing Page",
    price: "R$ 99,99",
    period: "/mês",
    desc: "Sua presença online profissional, sem complicação.",
    features: [
      "Landing page de alta conversão",
      "Design responsivo premium",
      "Formulário + WhatsApp integrado",
      "SEO básico on-page",
      "Hospedagem e SSL inclusos",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Start",
    price: "R$ 249",
    period: "/mês",
    desc: "Para empresas que precisam estar online com qualidade.",
    features: [
      "Site institucional até 5 páginas",
      "Design responsivo premium",
      "SEO básico on-page",
      "Formulário + WhatsApp",
      "Hospedagem inclusa",
      "Suporte 30 dias",
    ],
  },
  {
    name: "Pro",
    price: "R$ 649",
    period: "/mês",
    desc: "O plano mais escolhido. Site + estratégia + IA.",
    highlight: true,
    features: [
      "Tudo do Start",
      "Até 12 páginas + blog",
      "SEO técnico avançado",
      "Integração com CRM",
      "Chatbot IA no WhatsApp",
      "Painel de métricas",
      "Suporte 90 dias",
    ],
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    desc: "Sistemas SaaS, e-commerce e automações sob medida.",
    features: [
      "Tudo do Pro",
      "Desenvolvimento sob medida",
      "Arquitetura escalável",
      "Agentes IA customizados",
      "Integrações ilimitadas",
      "SLA dedicado",
      "Suporte 12 meses",
    ],
  },
];

export function Plans() {
  return (
    <section id="planos" className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Planos</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Escolha o plano ideal <span className="text-gradient">para crescer.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sem fidelidade abusiva. Sem letras miúdas. Resultado mensurável desde o primeiro mês.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-3 gap-5 items-stretch">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                p.highlight
                  ? "bg-foreground text-background shadow-glow-primary lg:-translate-y-4 border border-primary/30"
                  : "bg-card border border-border"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 shadow-glow-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mais escolhido
                </span>
              )}

              <h3 className="text-2xl font-bold font-display">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? "text-background/70" : "text-muted-foreground"}`}>
                {p.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-display">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-background/60" : "text-muted-foreground"}`}>
                  {p.period}
                </span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-accent" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contato"
                className={`mt-8 inline-flex items-center justify-center rounded-full font-semibold px-5 py-3 transition ${
                  p.highlight
                    ? "bg-gradient-primary text-primary-foreground hover:opacity-95"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                Quero esse plano
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
