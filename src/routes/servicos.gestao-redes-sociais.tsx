// Página dedicada — Gestão de Redes Sociais (a partir de R$149,99/mês)
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CheckCircle2, ArrowRight, Sparkles, Instagram, Facebook, Linkedin,
  Calendar, BarChart3, MessageCircle, Camera, Palette, Video, Hash,
  Users, TrendingUp, Clock, ShieldCheck, Star, Flame,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";

const TITLE = "Gestão de Redes Sociais · 0WEB · Planos a partir de R$149,99/mês";
const DESC =
  "Sua marca ativa todos os dias no Instagram, Facebook, TikTok e LinkedIn. Calendário editorial, design profissional, reels, copywriting e relatórios reais. Planos a partir de R$149,99/mês.";
const URL = "https://zeroweb.lovable.app/servicos/gestao-redes-sociais";

// Fotos reais (Unsplash — fotografia profissional, sem IA)
const HERO_IMG =
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1600&q=80";
const GALLERY = [
  { src: "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=900&q=80", alt: "Equipe planejando posts para Instagram" },
  { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80", alt: "Reunião de planejamento editorial" },
  { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80", alt: "Análise de métricas de redes sociais" },
  { src: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=900&q=80", alt: "Gravação de reels para Instagram" },
  { src: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=900&q=80", alt: "Smartphone com feed do Instagram" },
  { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80", alt: "Equipe criativa de redes sociais" },
];

type Plan = {
  name: string;
  price: string;
  cents?: string;
  highlight?: boolean;
  badge?: string;
  tagline: string;
  features: string[];
  cta: string;
};

const PLANS: Plan[] = [
  {
    name: "Essencial",
    price: "149",
    cents: ",99",
    tagline: "Para quem está começando e quer presença consistente no Instagram.",
    features: [
      "1 rede social (Instagram)",
      "8 posts no feed por mês",
      "12 stories por mês",
      "Calendário editorial mensal",
      "Edição de fotos enviadas pelo cliente",
      "Hashtags estratégicas e legendas",
      "Relatório mensal de desempenho",
      "Suporte por WhatsApp em horário comercial",
    ],
    cta: "Quero o plano Essencial de R$149,99/mês",
  },
  {
    name: "Profissional",
    price: "349",
    cents: ",90",
    badge: "Mais escolhido",
    highlight: true,
    tagline: "Para empresas que querem crescer e gerar engajamento real.",
    features: [
      "2 redes (Instagram + Facebook)",
      "12 posts no feed + 20 stories/mês",
      "2 Reels editados por mês",
      "Design profissional com identidade visual",
      "Copywriting persuasivo em todas as peças",
      "Resposta a comentários e DMs (até 30 min/dia)",
      "Calendário editorial + planejamento mensal",
      "Relatório quinzenal com insights",
    ],
    cta: "Quero o plano Profissional de R$349,90/mês",
  },
  {
    name: "Avançado",
    price: "699",
    cents: ",90",
    tagline: "Para marcas que precisam de presença forte em múltiplas redes.",
    features: [
      "3 redes (Instagram, Facebook e TikTok)",
      "16 posts + 30 stories por mês",
      "4 Reels / TikToks editados por mês",
      "1 sessão presencial de gravação/mês (região metropolitana)",
      "Gestão completa de comentários e DMs",
      "Copywriting + roteiros para vídeos",
      "Acompanhamento semanal de métricas",
      "Reunião mensal de estratégia",
    ],
    cta: "Quero o plano Avançado de R$699,90/mês",
  },
  {
    name: "Premium",
    price: "1.290",
    cents: ",00",
    tagline: "Operação completa para marcas que querem dominar o digital.",
    features: [
      "4 redes (IG, Facebook, TikTok e LinkedIn)",
      "24 posts + 40 stories por mês",
      "8 Reels / vídeos curtos por mês",
      "2 sessões de gravação no mês",
      "Tráfego pago incluso (verba até R$300)",
      "Gestão de comunidade e relacionamento",
      "Atendimento prioritário (resposta em até 2h)",
      "Relatório semanal + dashboard ao vivo",
      "Reunião quinzenal de estratégia",
    ],
    cta: "Quero o plano Premium de R$1.290/mês",
  },
];

const BENEFITS = [
  { icon: Calendar, t: "Calendário editorial", d: "Planejamento mensal alinhado com datas, campanhas e lançamentos da sua empresa." },
  { icon: Palette, t: "Design com identidade", d: "Cada peça segue a sua marca — cores, tipografia e estilo coerentes em toda a comunicação." },
  { icon: Video, t: "Reels que engajam", d: "Roteiros pensados para o algoritmo, com edição dinâmica e legendas." },
  { icon: MessageCircle, t: "Atendimento ágil", d: "Resposta a comentários e mensagens diretas para não perder oportunidade de venda." },
  { icon: BarChart3, t: "Relatórios reais", d: "Métricas claras: alcance, engajamento, seguidores e mensagens — sem juridiquês." },
  { icon: ShieldCheck, t: "Sem fidelidade", d: "Você fica porque gera resultado. Mensal, transparente e sem letras miúdas." },
];

const PROCESS = [
  { n: "01", t: "Briefing & estratégia", d: "Entendemos seu negócio, público, concorrência e definimos pilares de conteúdo." },
  { n: "02", t: "Calendário editorial", d: "Aprovação mensal com tema, formato e data de cada publicação." },
  { n: "03", t: "Produção", d: "Design, copy, edição de fotos e gravação/edição de reels conforme o plano." },
  { n: "04", t: "Publicação & engajamento", d: "Postamos nos melhores horários e respondemos a interações em seu nome." },
  { n: "05", t: "Análise & otimização", d: "Relatórios periódicos com ajustes na estratégia para crescer mais rápido." },
];

const FAQ = [
  { q: "Preciso enviar as fotos ou vocês produzem?", a: "Nos planos Essencial e Profissional, trabalhamos com fotos que você nos envia (do seu acervo, dia a dia da empresa, produtos). A partir do Avançado, incluímos sessões presenciais de gravação na região metropolitana. Em todos os planos fazemos a edição profissional." },
  { q: "Em quanto tempo as primeiras postagens vão ao ar?", a: "Após o briefing e a aprovação do calendário editorial, as primeiras publicações vão ao ar em até 7 dias úteis." },
  { q: "Vocês cuidam dos anúncios também?", a: "O plano Premium inclui gestão de tráfego pago com verba de até R$300. Nos outros planos, oferecemos a gestão de tráfego como serviço complementar, a partir de R$199/mês." },
  { q: "Tem fidelidade ou multa?", a: "Não. Todos os planos são mensais, sem contrato de fidelidade e sem multa rescisória. Você fica porque gera resultado." },
  { q: "Posso trocar de plano depois?", a: "Sim — pode subir ou descer de plano a qualquer momento. O ajuste vale para o próximo ciclo de cobrança." },
  { q: "Vocês respondem comentários e DMs?", a: "Sim. A partir do plano Profissional respondemos comentários e mensagens diretas em horário comercial, sempre com aprovação de scripts e tom de voz definidos com você." },
];

export const Route = createFileRoute("/servicos/gestao-redes-sociais")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: HERO_IMG },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: HERO_IMG },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Gestão de Redes Sociais",
          provider: { "@type": "Organization", name: "0WEB Marketing Digital", url: "https://zeroweb.lovable.app" },
          areaServed: "BR",
          description: DESC,
          offers: PLANS.map((p) => ({
            "@type": "Offer",
            name: `Plano ${p.name}`,
            price: p.price.replace(".", "") + (p.cents ?? "").replace(",", "."),
            priceCurrency: "BRL",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: p.price.replace(".", "") + (p.cents ?? "").replace(",", "."),
              priceCurrency: "BRL",
              unitText: "MONTH",
            },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: "https://zeroweb.lovable.app/" },
            { "@type": "ListItem", position: 2, name: "Serviços", item: "https://zeroweb.lovable.app/servicos" },
            { "@type": "ListItem", position: 3, name: "Gestão de Redes Sociais", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: GestaoRedesSociaisPage,
});

function GestaoRedesSociaisPage() {
  const wa = (msg: string, content: string) => whatsappUrl(msg, content);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0b2e] via-[#0f0c29] to-[#1f1147] text-white">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fuchsia-400">
              <Flame className="w-3.5 h-3.5" /> Sua marca ativa todos os dias
            </p>
            <h1 className="mt-4 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Gestão de <span className="text-fuchsia-400">Redes Sociais</span> que vende todos os dias
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Calendário editorial, design profissional, reels, copywriting e relatórios reais.
              Sua marca presente onde seu cliente está — <strong className="text-white">a partir de R$149,99/mês</strong>.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Instagram className="w-6 h-6 text-fuchsia-300" />
              <Facebook className="w-6 h-6 text-fuchsia-300" />
              <Linkedin className="w-6 h-6 text-fuchsia-300" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Instagram · Facebook · TikTok · LinkedIn</span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={wa("Olá! Quero saber mais sobre o plano de Gestão de Redes Sociais a partir de R$149,99/mês.", "redes_hero_principal")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("redes_hero_principal", { label: "Falar no WhatsApp" })}
                className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400 text-slate-900 font-bold px-6 py-3.5 shadow-glow-primary hover:scale-[1.02] transition"
              >
                Falar no WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#planos"
                onClick={() => trackEvent("cta_click", { label: "Ver planos", location: "redes_hero" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white font-semibold px-6 py-3.5 hover:bg-white/10 transition"
              >
                Ver os 4 planos
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <Star className="w-4 h-4 text-fuchsia-300 fill-current" />
              <Star className="w-4 h-4 text-fuchsia-300 fill-current" />
              <Star className="w-4 h-4 text-fuchsia-300 fill-current" />
              <Star className="w-4 h-4 text-fuchsia-300 fill-current" />
              <Star className="w-4 h-4 text-fuchsia-300 fill-current" />
              <span className="ml-1">Sem contrato · Sem fidelidade · Cancelamento a qualquer momento</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-tr from-fuchsia-500/30 to-primary/30 rounded-[3rem] blur-3xl" />
            <img
              src={HERO_IMG}
              alt="Equipe de social media planejando conteúdo profissional para Instagram"
              width={1200}
              height={1200}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative w-full aspect-square object-cover rounded-3xl shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>
        </div>
      </section>

      {/* O QUE INCLUI */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">O que está incluso</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Tudo o que sua marca precisa para <span className="text-gradient">crescer no digital</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Estratégia, produção e atendimento — uma equipe inteira de social media trabalhando pela sua marca.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.t}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-elegant transition"
              >
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
                  <b.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {b.t}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA REAL */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Nosso dia a dia</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Equipe real, <span className="text-gradient">trabalho real</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fotografia profissional — nada de imagem gerada por IA. É gente cuidando da sua marca.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY.map((g, i) => (
              <motion.div
                key={g.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] ring-1 ring-border"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 bg-surface scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-fuchsia-600">
              <Sparkles className="w-3.5 h-3.5" /> 4 planos para cada momento da sua marca
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Planos a partir de <span className="text-gradient">R$149,99/mês</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Mensal · Sem contrato · Sem fidelidade</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={[
                  "relative rounded-3xl p-7 flex flex-col",
                  p.highlight
                    ? "bg-gradient-to-br from-slate-950 to-fuchsia-950 text-white ring-2 ring-fuchsia-400 shadow-2xl lg:-translate-y-3"
                    : "bg-card border border-border shadow-elegant",
                ].join(" ")}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fuchsia-400 text-slate-900 text-[11px] font-bold uppercase tracking-wider px-3 py-1 shadow">
                    {p.badge}
                  </span>
                )}
                <h3 className={["text-xl font-bold", p.highlight ? "text-white" : ""].join(" ")}>{p.name}</h3>
                <p className={["mt-2 text-sm leading-relaxed min-h-[3rem]", p.highlight ? "text-white/80" : "text-muted-foreground"].join(" ")}>
                  {p.tagline}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className={["text-sm", p.highlight ? "text-white/70" : "text-muted-foreground"].join(" ")}>R$</span>
                  <span className="text-5xl font-display font-black tracking-tight">{p.price}</span>
                  {p.cents && <span className="text-xl font-bold">{p.cents}</span>}
                  <span className={["text-sm ml-1", p.highlight ? "text-white/70" : "text-muted-foreground"].join(" ")}>/mês</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className={["w-4 h-4 mt-0.5 shrink-0", p.highlight ? "text-fuchsia-300" : "text-emerald-500"].join(" ")} />
                      <span className={p.highlight ? "text-white/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={wa(p.cta + " da 0WEB.", `redes_plano_${p.name.toLowerCase()}`)}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(`redes_plano_${p.name.toLowerCase()}`)}
                  className={[
                    "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full font-bold px-5 py-3 transition hover:scale-[1.02]",
                    p.highlight
                      ? "bg-fuchsia-400 text-slate-900"
                      : "bg-foreground text-background",
                  ].join(" ")}
                >
                  Contratar <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Precisa de algo personalizado? <Link to="/contato" className="text-primary font-semibold underline">Fale com a gente</Link> para um plano sob medida.
          </p>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como trabalhamos</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Do briefing ao <span className="text-gradient">resultado</span>
            </h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs font-bold text-primary">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="py-16 bg-surface">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, n: "+180", t: "Marcas ativas" },
            { icon: TrendingUp, n: "+3.2M", t: "Alcance mensal somado" },
            { icon: Clock, n: "<2h", t: "Tempo médio de resposta" },
            { icon: Hash, n: "+12k", t: "Posts publicados em 2025" },
          ].map((s) => (
            <div key={s.t}>
              <s.icon className="w-7 h-7 mx-auto text-primary" />
              <p className="mt-3 text-3xl font-display font-black">{s.n}</p>
              <p className="text-sm text-muted-foreground">{s.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Perguntas frequentes</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-semibold flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <ArrowRight className="w-4 h-4 transition group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <Camera className="w-10 h-10 mx-auto" />
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Pronto para ativar sua marca?</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            Começa hoje com o plano Essencial por R$149,99/mês. Cancela quando quiser.
          </p>
          <a
            href={wa("Quero começar com a Gestão de Redes Sociais da 0WEB.", "redes_cta_final")}
            target="_blank" rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("redes_cta_final")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white text-fuchsia-700 font-bold px-7 py-4 hover:scale-[1.02] transition"
          >
            Falar no WhatsApp agora <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
