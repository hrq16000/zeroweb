// Página de serviço — Presença Digital (a partir de R$399/mês)
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CheckCircle2, MapPin, MessageCircle, Phone, ShieldCheck, Star,
  TrendingUp, Sparkles, Flame, ArrowRight, Search, Users, DollarSign,
  Monitor, BarChart3, Bot, Cloud,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RelatedLinksGrid } from "@/components/site/RelatedLinksGrid";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { ServiceCTA } from "@/components/site/ServiceCTA";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import cover from "@/assets/presenca-digital-google-capa.png.asset.json";

const TITLE = "Presença Digital para Empresas · 0WEB · Planos a partir de R$399/mês";
const DESC =
  "Seus clientes estão no Google. E a sua empresa? A 0WEB coloca seu negócio no topo das buscas, no Maps e no WhatsApp do cliente. Planos a partir de R$399/mês.";
const URL = "https://zeroweb.lovable.app/presenca-digital";

const benefits = [
  { icon: TrendingUp, t: "Mais visibilidade", d: "Sua empresa aparecendo para quem busca o que você oferece." },
  { icon: MessageCircle, t: "Mais contatos", d: "Mensagens no WhatsApp e ligações de clientes prontos para fechar." },
  { icon: Users, t: "Mais clientes", d: "Fluxo previsível de novos clientes todos os dias, sem depender de indicação." },
  { icon: DollarSign, t: "Mais resultados", d: "Crescimento mensurável, com relatórios claros do que está dando retorno." },
];

const services = [
  { icon: Monitor, t: "Sites", d: "Sites institucionais e landing pages que vendem." },
  { icon: BarChart3, t: "Marketing", d: "Google, Meta Ads e SEO local para captar clientes todos os dias." },
  { icon: Bot, t: "IA & Automação", d: "Atendimento automatizado no WhatsApp e funis inteligentes." },
  { icon: Cloud, t: "SaaS", d: "Painel próprio para gerenciar leads, campanhas e resultados." },
];

export const Route = createFileRoute("/servicos/presenca-digital")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: cover.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: cover.url },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Presença Digital para Empresas",
          provider: {
            "@type": "Organization",
            name: "0WEB Marketing Digital",
            url: "https://zeroweb.lovable.app",
          },
          areaServed: "BR",
          description: DESC,
          offers: {
            "@type": "Offer",
            name: "Plano Presença Digital",
            price: "399",
            priceCurrency: "BRL",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "399",
              priceCurrency: "BRL",
              unitText: "MONTH",
            },
          },
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
            { "@type": "ListItem", position: 3, name: "Presença Digital", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Em quanto tempo começo a receber clientes?", acceptedAnswer: { "@type": "Answer", text: "As campanhas entram no ar em até 72h após o briefing. A maioria dos clientes começa a receber mensagens e ligações ainda na primeira semana de veiculação." } },
            { "@type": "Question", name: "Preciso entender de marketing ou tecnologia?", acceptedAnswer: { "@type": "Answer", text: "Não. A 0WEB cuida de tudo — criação, anúncios, segmentação, relatórios e suporte. Você só precisa atender os clientes que chegam." } },
            { "@type": "Question", name: "Tem contrato ou fidelidade?", acceptedAnswer: { "@type": "Answer", text: "Não. Os planos da 0WEB são mensais, sem contrato e sem fidelidade. Você continua porque gera resultado." } },
            { "@type": "Question", name: "O que está incluso no plano de R$399/mês?", acceptedAnswer: { "@type": "Answer", text: "Estratégia de presença digital, otimização do Google Meu Negócio, anúncios locais no Google e Meta, integração com WhatsApp, relatórios claros e suporte humano." } },
          ],
        }),
      },
    ],
  }),
  component: PresencaDigitalPage,
});

function PresencaDigitalPage() {
  const wa = (msg: string, content: string) => whatsappUrl(msg, content);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs compact
        items={[
          { name: "Serviços", path: "/servicos" },
          { name: "Presença Digital", path: "/servicos/presenca-digital" },
        ]}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#0a1330] to-[#0b1a3d] text-white">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Flame className="w-3.5 h-3.5" /> Marketing digital que coloca cliente no seu WhatsApp
            </p>
            <h1 className="mt-4 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Seus clientes estão no <span className="text-amber-400">Google</span>.
              <br className="hidden sm:block" /> E a sua empresa?
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Apareça para quem procura <strong className="text-white">o que você oferece</strong> e receba
              mais contatos todos os dias. A 0WEB coloca sua empresa no topo do Google, no Maps e no WhatsApp do cliente.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={wa("Olá! Quero saber mais sobre o plano de Presença Digital de R$399/mês.", "presdig_hero_principal")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("presdig_hero_principal", { label: "Fale Conosco" })}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold px-6 py-3.5 shadow-glow-primary hover:scale-[1.02] transition"
              >
                Fale Conosco <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/solicitar-diagnostico"
                onClick={() => trackEvent("cta_click", { label: "Solicitar Diagnóstico", location: "presdig_hero" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white font-semibold px-6 py-3.5 hover:bg-white/10 transition"
              >
                Solicitar diagnóstico gratuito
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="ml-1">Planos a partir de R$399/mês · sem contrato</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-tr from-amber-400/30 to-primary/30 rounded-[3rem] blur-3xl" />
            <img
              src={cover.url}
              alt="Seus clientes estão no Google. E a sua empresa? Marketing digital da 0WEB com planos a partir de R$399/mês."
              width={1248}
              height={1248}
              fetchPriority="high"
              decoding="async"
              className="relative w-full rounded-3xl shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-elegant">
            <p className="text-sm font-semibold uppercase tracking-wider text-destructive">🚨 Sua empresa está perdendo clientes todos os dias</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
              Você ainda depende de <span className="text-gradient">indicação, redes sociais ou de quem passa na frente</span>?
            </h2>
            <div className="mt-5 space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>Tem dias em que aparecem vários clientes. E tem dias em que o telefone simplesmente não toca.</p>
              <p>Hoje as pessoas <strong className="text-foreground">não procuram mais na lista telefônica</strong>, não perguntam para vizinhos e nem ficam andando pela cidade procurando empresas.</p>
              <p className="inline-flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> Elas pegam o celular e pesquisam no Google.</p>
              <p>E quem aparece primeiro recebe mais ligações, mais mensagens no WhatsApp e fecha mais negócios.</p>
              <p className="text-foreground font-semibold">
                Enquanto isso, centenas de clientes podem estar procurando exatamente o que você oferece — e encontrando seus concorrentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-16 bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">O que você ganha</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Marketing digital que coloca <span className="text-gradient">cliente no seu WhatsApp</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Você não precisa entender de marketing, anúncios ou tecnologia. A 0WEB cuida de tudo.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b, i) => (
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

      {/* SOLUÇÕES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Ecossistema completo</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Tudo o que sua empresa precisa <span className="text-gradient">em um só lugar</span>
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <div key={s.t} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                  <s.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 font-semibold text-lg">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANO */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <Sparkles className="w-3.5 h-3.5" /> Investimento que cabe no orçamento
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Planos a partir de <span className="text-gradient">R$399/mês</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Sem contrato. Sem fidelidade. Com suporte humano de verdade.</p>
          </div>

          <div className="mt-10 relative rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-slate-950 to-slate-900 text-white p-8 lg:p-10 shadow-2xl overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative">
              <span className="inline-block rounded-full bg-amber-400 text-slate-900 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
                Plano Presença Digital
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-6xl font-display font-black">R$399</span>
                <span className="text-white/70 text-lg">/mês</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Otimização do Google Meu Negócio",
                  "Anúncios locais no Google e Meta",
                  "Integração com WhatsApp Business",
                  "Landing page ou mini-site para captação",
                  "Relatórios claros (sem juridiquês)",
                  "Suporte humano por WhatsApp",
                  "Sem contrato e sem fidelidade",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> {i}</li>
                ))}
              </ul>
              <a
                href={wa("Quero o plano de Presença Digital de R$399/mês da 0WEB.", "presdig_pricing")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("presdig_pricing")}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold px-6 py-3.5 hover:scale-[1.02] transition"
              >
                Quero começar agora <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Perguntas frequentes</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: "Em quanto tempo começo a receber clientes?", a: "As campanhas entram no ar em até 72h após o briefing. A maioria dos clientes começa a receber mensagens e ligações ainda na primeira semana de veiculação." },
              { q: "Preciso entender de marketing ou tecnologia?", a: "Não. A 0WEB cuida de tudo — criação, anúncios, segmentação, relatórios e suporte. Você só precisa atender os clientes que chegam." },
              { q: "Tem contrato ou fidelidade?", a: "Não. Os planos são mensais, sem contrato e sem fidelidade. Você continua porque gera resultado." },
              { q: "O que está incluso no plano de R$399/mês?", a: "Estratégia de presença digital, otimização do Google Meu Negócio, anúncios locais, integração com WhatsApp, relatórios claros e suporte humano." },
              { q: "Funciona para qualquer tipo de negócio?", a: "Sim — comércios, prestadores de serviço, clínicas, escritórios, restaurantes, autoescolas e qualquer empresa que queira mais clientes locais." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-semibold flex items-center justify-between">
                  {f.q}
                  <ArrowRight className="w-4 h-4 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA → FUNIL */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="text-center rounded-3xl border border-border bg-card/60 backdrop-blur p-8 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fale com a 0WEB</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-display">
              Receba uma proposta personalizada
            </h2>
            <p className="mt-3 text-muted-foreground">
              Responda perguntas rápidas no WhatsApp e enviamos sua proposta em até 1 hora útil.
            </p>
            <div className="mt-6 flex justify-center">
              <ServiceCTA
                serviceSlug="presenca-digital"
                location="footer"
                label="Solicitar proposta agora"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#0b1a3d] to-slate-900 text-white p-10 lg:p-14 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="text-amber-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> 📈 Mais visibilidade. 📱 Mais contatos. 💰 Mais clientes. 🚀 Mais resultados.
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
                  Pare de torcer. <span className="text-amber-400">Comece a vender.</span>
                </h2>
                <p className="mt-3 text-white/80">
                  Fale conosco no WhatsApp agora mesmo e comece a aparecer no Google esta semana.
                </p>
              </div>
              <FunnelCTAButton
                pageType="service"
                serviceSlug="presenca-digital"
                label="Solicitar orçamento gratuito"
                location="presdig_cta_final"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold px-7 py-4 hover:scale-[1.02] transition"
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Leia também:{" "}
            <Link
              to="/blog/$slug"
              params={{ slug: "seus-clientes-estao-no-google-e-a-sua-empresa" }}
              onClick={() => trackEvent("internal_link_click", { from: "presdig_page", to: "blog_post" })}
              className="text-primary font-semibold hover:underline"
            >
              Seus clientes estão no Google. E a sua empresa? →
            </Link>
          </p>
        </div>
      </section>

      <RelatedLinksGrid
        title="Serviços relacionados"
        subtitle="Complete sua presença digital com outras frentes."
        only={["/servicos/seo", "/servicos/gestao-redes-sociais", "/servicos/google-meu-negocio"]}
      />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
