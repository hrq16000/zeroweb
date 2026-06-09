import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Monitor,
  Rocket,
  Search,
  Wrench,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Gauge,
  Palette,
  Target,
  MapPin,
  HeartHandshake,
  Timer,
} from "lucide-react";

const items = [
  {
    icon: Monitor,
    title: "Criação de Sites Profissionais",
    desc: "Sites institucionais modernos, responsivos e gerenciáveis para fortalecer sua marca.",
    href: "/criacao-sites",
    tone: "from-sky-400 to-cyan-400",
  },
  {
    icon: Rocket,
    title: "Landing Pages de Alta Conversão",
    desc: "Páginas focadas em vendas e captura de leads, otimizadas para campanhas pagas.",
    href: "/landing-pages",
    tone: "from-fuchsia-400 to-pink-400",
  },
  {
    icon: Search,
    title: "SEO Local para Curitiba",
    desc: "Otimização para aparecer no Google quando buscarem por seus serviços na região.",
    href: "/seo",
    tone: "from-emerald-400 to-teal-400",
  },
  {
    icon: Wrench,
    title: "Manutenção e Atualização",
    desc: "Suporte contínuo, atualizações de segurança e conteúdo para seu site sempre no ar.",
    href: "/servicos",
    tone: "from-rose-400 to-orange-400",
  },
  {
    icon: MessageCircle,
    title: "Integração WhatsApp & CRM",
    desc: "Botões diretos e formulários conectados ao seu CRM e sistema de vendas.",
    href: "/automacao",
    tone: "from-lime-400 to-emerald-400",
  },
  {
    icon: ShieldCheck,
    title: "Hospedagem e Segurança",
    desc: "Servidores rápidos com certificado SSL incluso para garantir a segurança dos dados.",
    href: "/servicos",
    tone: "from-amber-300 to-yellow-400",
  },
];

const reasons = [
  { icon: Gauge, title: "Sites Ultra Rápidos", note: "Google PageSpeed 90+" },
  { icon: Palette, title: "Design Exclusivo", note: "UI/UX Premium" },
  { icon: Target, title: "Foco em Vendas", note: "Alta conversão" },
  { icon: MapPin, title: "Atendimento Local", note: "Curitiba e Região" },
  { icon: HeartHandshake, title: "Suporte Humanizado", note: "Via WhatsApp" },
  { icon: Timer, title: "Entrega Ágil", note: "Prazos cumpridos" },
];

export function FeatureShowcase() {
  return (
    <section
      id="entregas"
      className="relative overflow-hidden bg-foreground text-background py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-20" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[820px] rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-primary)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Nossas entregas
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            O que fazemos de <span className="text-gradient">melhor</span>
          </h2>
          <p className="mt-4 text-background/70">
            Desenvolvemos estratégias digitais completas. Conheça os serviços que mais geram
            resultado para nossos clientes.
          </p>
        </div>

        {/* Grid de cards */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.07, duration: 0.45 }}
            >
              <Link
                to={it.href}
                className="group relative block h-full rounded-2xl border border-background/10 bg-background/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-background/[0.07] hover:shadow-[0_18px_60px_-20px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
              >
                <div
                  aria-hidden
                  className={`absolute inset-x-6 -top-px h-px bg-gradient-to-r ${it.tone} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <span
                  className={`inline-grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br ${it.tone} text-foreground shadow-elegant`}
                >
                  <it.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/65">{it.desc}</p>

                <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-80 group-hover:opacity-100">
                  Saiba mais
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Por que escolher */}
        <div className="mt-24 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Vantagens competitivas
          </p>
          <h3 className="mt-3 text-3xl sm:text-4xl font-bold font-display">
            Por que escolher a <span className="text-gradient">0WEB?</span>
          </h3>
          <p className="mt-4 text-background/70">
            Combinamos tecnologia de ponta com estratégia de marketing para entregar não apenas um
            site, mas uma máquina de vendas.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
              className="group flex items-center gap-3 rounded-xl border border-background/10 bg-background/[0.04] p-4 transition-all hover:border-primary/50 hover:bg-background/[0.07]"
            >
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-primary/15 text-primary transition-transform group-hover:scale-110">
                <r.icon className="w-5 h-5" />
              </span>
              <div className="text-left">
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-background/60">{r.note}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/solicitar-diagnostico"
            className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-elegant transition-all hover:scale-[1.03] hover:shadow-[0_12px_40px_-10px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
          >
            Solicitar diagnóstico gratuito
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/servicos"
            className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-semibold text-background/80 hover:text-background hover:border-background/50 transition"
          >
            Ver todos os serviços
          </Link>
        </div>
      </div>
    </section>
  );
}
