// Página dedicada — Gestão de Redes Sociais (a partir de R$149,99/mês)
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CheckCircle2, ArrowRight, Sparkles, Instagram, Facebook, Linkedin,
  Calendar, BarChart3, MessageCircle, Camera, Palette, Video, Hash,
  Users, TrendingUp, Clock, ShieldCheck, Star, Flame,
  FileText, Check, Minus, Heart, Eye, MessageSquare, MousePointerClick,
} from "lucide-react";
import { RedesSimulator } from "@/components/site/RedesSimulator";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
const TITLE = "Gestão de Redes Sociais · 0WEB · Planos a partir de R$149,99/mês";
const DESC =
  "Sua marca ativa todos os dias no Instagram, Facebook, TikTok e LinkedIn. Calendário editorial, design profissional, reels, copywriting e relatórios reais. Planos a partir de R$149,99/mês.";
const URL = "https://0web.com.br/servicos/gestao-redes-sociais";

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
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "pt-BR", href: URL },
      { rel: "alternate", hrefLang: "x-default", href: URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Gestão de Redes Sociais",
          serviceType: "Gestão de Redes Sociais",
          url: URL,
          provider: { "@type": "Organization", name: "0WEB Marketing Digital", url: "https://0web.com.br" },
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
            { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
            { "@type": "ListItem", position: 2, name: "Serviços", item: "https://0web.com.br/servicos" },
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
              <FunnelCTAButton
                intent={{ purpose: "proposal", source: "redes_hero_principal", pagePath: "/servicos/gestao-redes-sociais", placement: "hero", serviceSlug: "gestao-redes-sociais" }}
                label="Iniciar diagnóstico"
                location="redes_hero_principal"
                className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400 text-slate-900 font-bold px-6 py-3.5 shadow-glow-primary hover:scale-[1.02] transition"
              />
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
                <FunnelCTAButton
                  intent={{ purpose: "proposal", source: `redes_plano_${p.name.toLowerCase()}`, pagePath: "/servicos/gestao-redes-sociais", placement: "section", serviceSlug: "gestao-redes-sociais", campaign: p.name.toLowerCase() }}
                  label="Contratar"
                  location={`redes_plano_${p.name.toLowerCase()}`}
                  className={[
                    "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full font-bold px-5 py-3 transition hover:scale-[1.02]",
                    p.highlight
                      ? "bg-fuchsia-400 text-slate-900"
                      : "bg-foreground text-background",
                  ].join(" ")}
                />
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Precisa de algo personalizado? <Link to="/contato" className="text-primary font-semibold underline">Fale com a gente</Link> para um plano sob medida.
          </p>
        </div>
      </section>

      {/* ENTREGÁVEIS DETALHADOS POR PLANO */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Entregáveis reais</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              O que <span className="text-gradient">exatamente</span> você recebe por mês
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sem letras miúdas. Cada plano tem números fixos de posts, stories, reels, roteiros e relatórios.
            </p>
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-5">
            {[
              {
                plano: "Essencial",
                cor: "border-border",
                semana: ["2 posts no feed por semana", "3 stories por semana", "1 carrossel ou 1 estático por semana"],
                mes: [
                  "8 posts no feed (4 estáticos + 4 carrosséis)",
                  "12 stories editados com identidade visual",
                  "1 calendário editorial aprovado todo dia 25",
                  "Edição/tratamento das fotos que você enviar",
                  "Hashtags e legendas escritas por copywriter",
                  "1 relatório mensal com prints e leitura simples",
                ],
                naoTem: ["Reels", "Gravação presencial", "Resposta a DMs", "Tráfego pago"],
              },
              {
                plano: "Profissional",
                cor: "border-fuchsia-400 ring-2 ring-fuchsia-300/30",
                semana: ["3 posts no feed por semana", "5 stories por semana", "1 Reel a cada 15 dias"],
                mes: [
                  "12 posts no feed (carrosséis + estáticos + 1 vídeo)",
                  "20 stories com enquetes, caixinhas e CTAs",
                  "2 Reels editados (roteiro + edição + trilha + legendas)",
                  "Calendário editorial com aprovação quinzenal",
                  "Design com identidade visual aplicada",
                  "Copywriting persuasivo (gancho + corpo + CTA) em todas as peças",
                  "Resposta a comentários e DMs em até 30 min (horário comercial)",
                  "2 relatórios quinzenais com insights estratégicos",
                ],
                naoTem: ["Gravação presencial recorrente", "Tráfego pago"],
              },
              {
                plano: "Avançado",
                cor: "border-border",
                semana: ["4 posts no feed por semana", "7-8 stories por semana", "1 Reel/TikTok por semana"],
                mes: [
                  "16 posts no feed em 3 redes (IG + FB + TikTok)",
                  "30 stories com sequência narrativa semanal",
                  "4 Reels/TikToks (roteiro, gravação no celular ou edição do material enviado, trilha, legendas)",
                  "1 sessão presencial de 2h (região metropolitana) para captar 1 mês de conteúdo",
                  "Gestão completa de comentários e DMs em horário comercial",
                  "Roteiros para vídeos + storyboard das gravações",
                  "Relatório semanal + 1 reunião mensal de estratégia (30 min)",
                ],
                naoTem: ["LinkedIn", "Tráfego pago incluso"],
              },
              {
                plano: "Premium",
                cor: "border-border",
                semana: ["6 posts no feed por semana", "10 stories por semana", "2 Reels por semana"],
                mes: [
                  "24 posts no feed em 4 redes (IG, FB, TikTok e LinkedIn)",
                  "40 stories com narrativa cross-channel",
                  "8 Reels/vídeos curtos (roteiro + gravação + edição profissional)",
                  "2 sessões presenciais de gravação no mês",
                  "Tráfego pago incluso: até R$300 de verba + gestão da campanha",
                  "Gestão de comunidade (responde tudo, escala para você só o que importa)",
                  "SLA de resposta em até 2h (úteis e fim de semana)",
                  "Relatório semanal + dashboard ao vivo + reunião quinzenal",
                ],
                naoTem: [],
              },
            ].map((p) => (
              <div key={p.plano} className={`rounded-3xl border ${p.cor} bg-card p-7 shadow-sm`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-2xl font-bold">{p.plano}</h3>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Volume mensal
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">Ritmo semanal</p>
                  <ul className="space-y-1 text-sm">
                    {p.semana.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 mt-1 text-primary shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Inclui no mês</p>
                  <ul className="space-y-2 text-sm">
                    {p.mes.map((m) => (
                      <li key={m} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {p.naoTem.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Não incluso</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {p.naoTem.map((n) => (
                        <li key={n} className="flex items-start gap-2">
                          <Minus className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <CtaStrip
            location="redes_pos_entregaveis"
            title="Quer o detalhamento do plano ideal pro seu negócio?"
            sub="Recebe em até 1h útil uma proposta com o volume exato de posts, reels e relatórios."
          />
        </div>
      </section>


      {/* TABELA COMPARATIVA */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Compare lado a lado</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              O que <span className="text-gradient">muda</span> entre os planos
            </h2>
          </div>

          <div className="mt-10 overflow-x-auto rounded-3xl border border-border bg-card shadow-elegant">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="p-4 font-semibold">Critério</th>
                  <th className="p-4 font-semibold text-center">Essencial</th>
                  <th className="p-4 font-semibold text-center bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-700 dark:text-fuchsia-300">
                    Profissional <span className="block text-[10px] uppercase tracking-wider">Mais escolhido</span>
                  </th>
                  <th className="p-4 font-semibold text-center">Avançado</th>
                  <th className="p-4 font-semibold text-center">Premium</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/20">
                {[
                  ["Canais incluídos", "1 (Instagram)", "2 (IG + FB)", "3 (IG + FB + TikTok)", "4 (+ LinkedIn)"],
                  ["Posts no feed / mês", "8", "12", "16", "24"],
                  ["Stories / mês", "12", "20", "30", "40"],
                  ["Reels / mês", "—", "2", "4", "8"],
                  ["Sessão de gravação presencial", "—", "—", "1 / mês", "2 / mês"],
                  ["Resposta a DMs e comentários", "—", "Até 30 min", "Completa (horário comercial)", "Comunidade (SLA 2h)"],
                  ["SLA de aprovação do calendário", "Até 5 dias úteis", "Até 3 dias úteis", "Até 2 dias úteis", "Até 24h"],
                  ["Tráfego pago incluso", "—", "—", "—", "Até R$300/mês"],
                  ["Suporte", "WhatsApp comercial", "WhatsApp comercial", "WhatsApp + reunião mensal", "Prioritário + reunião quinzenal"],
                  ["Relatórios", "Mensal", "Quinzenal", "Semanal", "Semanal + dashboard ao vivo"],
                  ["Preço / mês", "R$149,99", "R$349,90", "R$699,90", "R$1.290,00"],
                ].map(([crit, ...vals]) => (
                  <tr key={crit} className="border-t border-border">
                    <td className="p-4 font-medium">{crit}</td>
                    {vals.map((v, i) => (
                      <td
                        key={i}
                        className={[
                          "p-4 text-center",
                          i === 1 ? "bg-fuchsia-50/50 dark:bg-fuchsia-950/20 font-semibold" : "",
                          v === "—" ? "text-muted-foreground" : "",
                        ].join(" ")}
                      >
                        {v === "—" ? <Minus className="w-4 h-4 mx-auto" /> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Todos os planos: mensal · sem contrato · sem fidelidade · cancela quando quiser
          </p>

          <CtaStrip
            location="redes_pos_comparativo"
            title="Na dúvida entre Profissional e Avançado?"
            sub="Te ajudamos a escolher com base no seu volume real de conteúdo e canais."
            variant="muted"
          />
        </div>
      </section>

      {/* EXEMPLOS REAIS — calendário, métricas, relatório */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como é na prática</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Veja o que <span className="text-gradient">você recebe</span> de verdade
            </h2>
            <p className="mt-3 text-muted-foreground">
              Calendário editorial, painel de métricas e modelo de relatório — exemplos reais (sem imagem de IA).
            </p>
          </div>

          {/* Calendário editorial mockup */}
          <div className="mt-12 grid lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fuchsia-500" />
                  <h3 className="font-bold">Calendário editorial · Novembro</h3>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                  Aprovado pelo cliente
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[11px]">
                {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
                  <div key={i} className="text-center font-semibold text-muted-foreground p-1">{d}</div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const posts: Record<number, { tipo: string; cor: string }> = {
                    3: { tipo: "Reel", cor: "bg-fuchsia-500" },
                    5: { tipo: "Post", cor: "bg-blue-500" },
                    7: { tipo: "Story", cor: "bg-amber-400" },
                    10: { tipo: "Carrossel", cor: "bg-emerald-500" },
                    12: { tipo: "Reel", cor: "bg-fuchsia-500" },
                    14: { tipo: "Post", cor: "bg-blue-500" },
                    17: { tipo: "Story", cor: "bg-amber-400" },
                    19: { tipo: "Carrossel", cor: "bg-emerald-500" },
                    21: { tipo: "Reel", cor: "bg-fuchsia-500" },
                    24: { tipo: "Post", cor: "bg-blue-500" },
                    26: { tipo: "Story", cor: "bg-amber-400" },
                    28: { tipo: "Carrossel", cor: "bg-emerald-500" },
                  };
                  const p = posts[day];
                  return (
                    <div
                      key={day}
                      className="aspect-square rounded-md border border-border p-1 flex flex-col items-start hover:bg-muted/40 transition"
                    >
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                      {p && (
                        <span className={`mt-auto w-full text-[8px] text-white font-bold px-1 py-0.5 rounded ${p.cor} truncate`}>
                          {p.tipo}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                {[
                  ["bg-fuchsia-500", "Reels"],
                  ["bg-blue-500", "Posts"],
                  ["bg-emerald-500", "Carrosséis"],
                  ["bg-amber-400", "Stories"],
                ].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${c}`} /> {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Painel de métricas mockup */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-fuchsia-500" />
                  <h3 className="font-bold">Performance · Últimos 30 dias</h3>
                </div>
                <span className="text-[11px] text-fuchsia-600 font-semibold">@suamarca</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Eye, label: "Alcance", v: "47.2k", delta: "+38%", color: "text-emerald-500" },
                  { icon: Heart, label: "Curtidas", v: "3.1k", delta: "+22%", color: "text-emerald-500" },
                  { icon: MessageSquare, label: "Comentários", v: "284", delta: "+51%", color: "text-emerald-500" },
                  { icon: MousePointerClick, label: "Cliques no link", v: "612", delta: "+14%", color: "text-emerald-500" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                      <m.icon className="w-3.5 h-3.5" /> {m.label}
                    </div>
                    <p className="mt-1.5 text-2xl font-display font-black">{m.v}</p>
                    <p className={`text-[11px] font-semibold ${m.color}`}>{m.delta} vs. mês anterior</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-muted/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Engajamento por formato
                </p>
                <div className="space-y-2">
                  {[
                    { l: "Reels", pct: 92 },
                    { l: "Carrosséis", pct: 71 },
                    { l: "Posts", pct: 48 },
                    { l: "Stories", pct: 34 },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>{b.l}</span>
                        <span className="font-semibold">{b.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600"
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground italic">
                * Dados ilustrativos baseados em médias de clientes da 0WEB.
              </p>
            </div>
          </div>

          {/* Layout de relatório */}
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-elegant">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-fuchsia-500" />
              <h3 className="font-bold">Modelo de relatório mensal · 12 páginas em PDF</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { n: "01", t: "Capa & resumo executivo", d: "Visão de 30 segundos para a diretoria" },
                { n: "02", t: "Métricas principais", d: "Alcance, engajamento, seguidores, mensagens" },
                { n: "03", t: "Top 3 posts do mês", d: "O que mais funcionou e por quê" },
                { n: "04", t: "Análise por formato", d: "Performance de Reels, posts e stories" },
                { n: "05", t: "Comunidade", d: "Crescimento, perfil de quem te segue, principais DMs" },
                { n: "06", t: "Concorrência", d: "O que players do seu nicho estão fazendo" },
                { n: "07", t: "Aprendizados", d: "O que mudamos com base nos dados" },
                { n: "08", t: "Próximos passos", d: "Plano editorial e foco do próximo mês" },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl bg-muted/30 p-4 hover:bg-muted/50 transition">
                  <span className="text-[10px] font-bold text-fuchsia-500">PG {s.n}</span>
                  <p className="mt-1 font-semibold text-sm">{s.t}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>

          <CtaStrip
            location="redes_pos_exemplos"
            title="Quer receber esse mesmo relatório com a sua marca?"
            sub="Peça um diagnóstico gratuito — analisamos seu Instagram e mostramos o que mudar."
          />
        </div>
      </section>


      {/* SIMULADOR */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-fuchsia-50/30 dark:from-slate-900/40 dark:to-fuchsia-950/20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <RedesSimulator />
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
          <FunnelCTAButton
            intent={{ purpose: "proposal", source: "redes_cta_final", pagePath: "/servicos/gestao-redes-sociais", placement: "section", serviceSlug: "gestao-redes-sociais" }}
            label="Iniciar diagnóstico agora"
            location="redes_cta_final"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white text-fuchsia-700 font-bold px-7 py-4 hover:scale-[1.02] transition"
          />
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function CtaStrip({
  location,
  title,
  sub,
  variant = "default",
}: {
  location: string;
  title: string;
  sub: string;
  variant?: "default" | "muted";
}) {
  return (
    <div
      className={[
        "mt-10 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between",
        variant === "muted"
          ? "bg-card border border-border shadow-elegant"
          : "bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white shadow-2xl",
      ].join(" ")}
    >
      <div className="max-w-xl">
        <h3 className="text-xl lg:text-2xl font-bold">{title}</h3>
        <p className={["mt-1.5 text-sm", variant === "muted" ? "text-muted-foreground" : "text-white/85"].join(" ")}>
          {sub}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <FunnelCTAButton
          intent={{ purpose: "proposal", source: location, pagePath: "/servicos/gestao-redes-sociais", placement: "section", serviceSlug: "gestao-redes-sociais" }}
          label="Iniciar diagnóstico"
          location={location}
          className={[
            "inline-flex items-center gap-2 rounded-full font-bold px-5 py-3 transition hover:scale-[1.02]",
            variant === "muted"
              ? "bg-fuchsia-500 text-white"
              : "bg-white text-fuchsia-700",
          ].join(" ")}
        />
        <Link
          to="/solicitar-diagnostico"
          onClick={() => trackEvent("cta_click", { label: "Solicitar diagnóstico", location })}
          className={[
            "inline-flex items-center gap-2 rounded-full font-semibold px-5 py-3 transition hover:scale-[1.02] border",
            variant === "muted"
              ? "border-border bg-background hover:bg-muted"
              : "border-white/40 text-white hover:bg-white/10",
          ].join(" ")}
        >
          Solicitar diagnóstico <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

