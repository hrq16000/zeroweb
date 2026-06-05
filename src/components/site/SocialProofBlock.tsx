import { Link } from "@tanstack/react-router";
import { Star, Quote, Users, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { whatsappUrl } from "@/lib/site-config";

const testimonials = [
  {
    name: "Mariana Souza",
    role: "Clínica Bem-Estar · Curitiba/PR",
    text: "Em 3 semanas o WhatsApp não parou. A 0WEB entregou o que prometeu — e ainda explicou cada decisão da campanha.",
  },
  {
    name: "Rafael Lima",
    role: "Auto Center Lima · São José dos Pinhais/PR",
    text: "Triplicamos os orçamentos vindos do Google. O site novo e o tráfego pago juntos viraram a chave do nosso comercial.",
  },
  {
    name: "Juliana Castro",
    role: "Estúdio Castro Arquitetura · Florianópolis/SC",
    text: "Profissionalismo do briefing ao relatório. Recomendo de olhos fechados pra quem quer parar de depender só de indicação.",
  },
];

const numbers = [
  { v: "+R$ 28M", l: "em vendas geradas para clientes" },
  { v: "+180", l: "negócios atendidos no Brasil" },
  { v: "4,9/5", l: "satisfação média dos clientes" },
  { v: "72h", l: "para colocar sua campanha no ar" },
];

const steps = [
  { icon: Users, title: "1. Diagnóstico", desc: "Em 30 min entendemos seu negócio, sua oferta e o público que precisa te encontrar." },
  { icon: TrendingUp, title: "2. Estratégia", desc: "Montamos site, SEO e campanhas com foco em conversão real, não vaidade." },
  { icon: Clock, title: "3. Execução", desc: "Tudo no ar em até 72h, com criativos, copy e públicos prontos para performar." },
  { icon: Star, title: "4. Otimização", desc: "Acompanhamento semanal, relatórios claros e ajustes contínuos para escalar." },
];

export function SocialProofBlock({ ctxId = "servicos_social_proof" }: { ctxId?: string }) {
  const ctaWa = whatsappUrl("Quero um diagnóstico gratuito da 0WEB.", ctxId);

  return (
    <>
      {/* Números */}
      <section className="py-14 bg-muted/30 border-y border-border" aria-label="Resultados em números">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {numbers.map((n) => (
            <div key={n.l}>
              <div className="font-display text-3xl lg:text-4xl font-bold text-primary">{n.v}</div>
              <p className="mt-2 text-sm text-muted-foreground">{n.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16" aria-label="Depoimentos de clientes">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-center">
            Quem trabalha com a 0WEB <span className="text-primary">cresce de verdade</span>
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Empresas locais, clínicas, escritórios e e-commerces que pararam de torcer e começaram a vender com previsibilidade.
          </p>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
                <Quote className="w-6 h-6 text-primary" />
                <blockquote className="mt-3 text-sm text-foreground/90 flex-1">"{t.text}"</blockquote>
                <div className="mt-4 flex items-center gap-1 text-yellow-500" aria-label="5 estrelas">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <figcaption className="mt-3 text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href={ctaWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary">
              Quero esses resultados também <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 bg-muted/30 border-y border-border" aria-label="Como funciona o processo da 0WEB">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-center">Como funciona</h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Um processo simples e transparente, do primeiro contato à primeira venda online.
          </p>
          <ol className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="w-10 h-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={ctaWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary">
              Falar com especialista <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/planos" className="inline-flex items-center gap-2 rounded-full border border-border hover:bg-muted font-semibold px-6 py-3">
              Ver planos e preços
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
