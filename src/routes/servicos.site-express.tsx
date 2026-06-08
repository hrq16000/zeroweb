import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Clock,
  MessageCircle,
  Rocket,
  Smartphone,
  Star,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { absUrl, ORIGIN, ORG_REF, breadcrumbLd } from "@/lib/seo";
import { SITE_EXPRESS_FAQ as FAQ } from "@/lib/site-express-faq";

const SLUG = "site-express";
const PATH = `/servicos/${SLUG}`;
const URL = absUrl(PATH);
const TITLE = "Site Express em 24h · A partir de R$ 499 · 0WEB";
const DESC =
  "Site profissional sob medida, mobile-first e focado em conversão, no ar em até 24 horas. A partir de R$ 499. Briefing de 5 minutos pelo WhatsApp.";
const PRICE = "499.00";

export const Route = createFileRoute("/servicos/site-express")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "site express, criação de site rápida, site em 24h, site profissional barato, site para pequeno negócio, site mobile, site whatsapp",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "product" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { property: "product:price:amount", content: PRICE },
      { property: "product:price:currency", content: "BRL" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${URL}#service`,
              name: "Site Express em 24h",
              description: DESC,
              serviceType: "Web Design Express",
              category: "Web Development",
              url: URL,
              areaServed: { "@type": "Country", name: "BR" },
              provider: ORG_REF,
              offers: {
                "@type": "Offer",
                price: PRICE,
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
                url: URL,
                priceValidUntil: "2026-12-31",
                seller: ORG_REF,
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "127",
                bestRating: "5",
                worstRating: "1",
              },
            },
            {
              "@type": "Product",
              "@id": `${URL}#product`,
              name: "Site Express em 24h",
              description: DESC,
              brand: { "@type": "Brand", name: "0WEB" },
              offers: {
                "@type": "Offer",
                price: PRICE,
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
                url: URL,
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "127",
              },
            },
            {
              "@type": "LocalBusiness",
              "@id": `${ORIGIN}/#localbusiness`,
              name: "0WEB",
              url: ORIGIN,
              telephone: "+55-41-99745-2053",
              email: "contato@0web.com.br",
              priceRange: "R$ 499 - R$ 8.000",
              areaServed: { "@type": "Country", name: "BR" },
              address: { "@type": "PostalAddress", addressCountry: "BR" },
            },
            {
              "@type": "FAQPage",
              "@id": `${URL}#faq`,
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "WebPage",
              "@id": URL,
              url: URL,
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
              isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
            },
            breadcrumbLd([
              { name: "Serviços", path: "/servicos" },
              { name: "Site Express em 24h", path: PATH },
            ]),
          ],
        }),
      },
    ],
  }),
  component: SiteExpressPage,
});

function SiteExpressPage() {
  const ctaClass =
    "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wide px-7 py-4 text-sm shadow-lg shadow-orange-600/30 transition";
  const ctaWhiteClass =
    "mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold uppercase tracking-wide px-6 py-4 text-sm shadow-lg transition";
  const ctaFinalClass =
    "mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold uppercase tracking-wide px-8 py-4 text-sm shadow-xl transition";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-16 px-5 bg-gradient-to-b from-orange-50 via-white to-white">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-100/60 blur-3xl" />

          <div className="relative max-w-5xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider"
            >
              <Zap className="w-3.5 h-3.5" /> Site Express · Entrega em 24h
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.05]"
            >
              Seu site profissional no ar em{" "}
              <span className="text-orange-600">menos de 24 horas</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Sob medida pro seu negócio, otimizado para celular e focado em fazer o cliente
              chamar você no WhatsApp.{" "}
              <strong className="text-gray-900">A partir de R$ 499.</strong>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={openFunnel}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wide px-7 py-4 text-sm shadow-lg shadow-orange-600/30 transition"
              >
                Quero meu site em 24h <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Do pagamento ao site no ar em menos de 24h
              </div>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-orange-500 text-orange-500" /> 4.9/5 de clientes
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600" /> Suporte pós-entrega incluso
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-orange-600" /> 100% mobile-first
              </span>
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section className="py-16 px-5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Seu concorrente já está na internet.{" "}
              <span className="text-orange-600">E você?</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Quem não aparece no Google perde cliente todo dia para quem aparece. Boca a boca
              ajuda — mas não escala. Site profissional gera credibilidade, autoridade e novos
              orçamentos no automático.
            </p>
          </div>
        </section>

        {/* DIFERENCIAIS */}
        <section className="py-16 px-5 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Por que Site Express
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                Agência cobra R$ 3.000 e leva 30 dias.
                <br />A 0WEB entrega amanhã.
              </h2>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: "Entrega em 24h", desc: "Briefing pela manhã, site no ar à noite. Sem reuniões longas." },
                { icon: TrendingUp, title: "Feito para vender", desc: "Copy persuasiva que leva o visitante direto pro WhatsApp." },
                { icon: Smartphone, title: "100% mobile-first", desc: "Design moderno que carrega rápido e converte no celular." },
                { icon: MessageCircle, title: "Briefing de 5 min", desc: "Conta no WhatsApp o que faz. A gente cuida do resto." },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="grid place-items-center w-11 h-11 rounded-xl bg-orange-100 text-orange-600">
                    <b.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-gray-900">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PACOTE */}
        <section className="py-16 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  O que está incluso
                </span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                  Pacote completo. Sem pegadinha.
                </h2>
                <p className="mt-3 text-gray-600">
                  Tudo o que seu negócio precisa para começar a receber clientes pela internet,
                  já configurado.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Site profissional sob medida para o seu segmento",
                  "Design responsivo (perfeito no celular)",
                  "Copy persuasiva focada em WhatsApp",
                  "Hospedagem e domínio configurados",
                  "Integração com WhatsApp e Google Maps",
                  "SEO básico para aparecer no Google",
                  "Suporte pós-entrega",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* PROCESSO 3 PASSOS */}
        <section className="py-16 px-5 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Como funciona
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                Em 3 passos simples
              </h2>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-4">
              {[
                { n: "1", t: "Briefing de 5 min", d: "Você manda um áudio no WhatsApp contando o nome do negócio, o que faz e o que quer comunicar.", icon: MessageCircle },
                { n: "2", t: "Construção em até 24h", d: "Nosso time monta seu site sob medida. Você recebe um link de prévia para revisar.", icon: Rocket },
                { n: "3", t: "No ar e vendendo", d: "Aprovou? Publicamos. Site no ar pronto para receber clientes.", icon: Sparkles },
              ].map((s) => (
                <div key={s.n} className="relative rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                  <div className="absolute -top-3 -left-3 grid place-items-center w-9 h-9 rounded-full bg-orange-600 text-white text-sm font-bold shadow-md">
                    {s.n}
                  </div>
                  <s.icon className="w-7 h-7 text-orange-600" />
                  <h3 className="mt-3 font-bold text-gray-900 text-lg">{s.t}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PREÇO */}
        <section className="py-20 px-5">
          <div className="max-w-md mx-auto">
            <div className="relative rounded-3xl bg-gradient-to-br from-orange-600 to-orange-500 p-8 text-white shadow-2xl shadow-orange-600/30">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-orange-600 text-[11px] font-bold uppercase tracking-wider shadow">
                Oferta de lançamento
              </span>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Site Express 24h</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-sm opacity-80">a partir de</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">R$</span>
                <span className="text-6xl font-bold tracking-tight">499</span>
              </div>
              <p className="mt-1 text-sm opacity-90">pagamento único · sem mensalidade</p>

              <ul className="mt-6 space-y-2 text-sm">
                {[
                  "Entrega em até 24h",
                  "Hospedagem + domínio inclusos no 1º ano",
                  "Design exclusivo (nada de template)",
                  "Suporte pós-entrega",
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" strokeWidth={3} /> {i}
                  </li>
                ))}
              </ul>

              <button
                onClick={openFunnel}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold uppercase tracking-wide px-6 py-4 text-sm shadow-lg transition"
              >
                Quero meu site agora <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              Agências cobram R$ 3.000 a R$ 8.000 pelo mesmo escopo.
            </p>
          </div>
        </section>

        {/* PARA QUEM É */}
        <section className="py-16 px-5 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Para quem é</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              Feito para quem não tem tempo a perder
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                "Assistência técnica","Eletricistas","Instaladores","Salões de beleza","Construção civil",
                "Consultores","Autônomos","Montadores de móveis","Pequenos comércios","Prestadores de serviço",
              ].map((p) => (
                <span key={p} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700">{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ (12 Q&A) */}
        <section id="faq" className="py-16 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">FAQ</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                Perguntas frequentes
              </h2>
              <p className="mt-3 text-gray-600">Tudo que você precisa saber antes de pedir.</p>
            </div>

            <Accordion type="single" collapsible className="mt-10 space-y-3">
              {FAQ.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="rounded-2xl bg-gray-50 border border-gray-100 px-5 data-[state=open]:bg-white data-[state=open]:shadow-sm transition"
                >
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 px-5 bg-gradient-to-br from-orange-600 to-orange-500 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold">
              Pare de perder cliente por não parecer profissional
            </h2>
            <p className="mt-4 text-lg opacity-95">
              Em menos de 24h o seu site pode estar no ar — vendendo enquanto você dorme.
            </p>
            <button
              onClick={openFunnel}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold uppercase tracking-wide px-8 py-4 text-sm shadow-xl transition"
            >
              Quero meu site em 24h <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-6 text-sm opacity-90">
              <Link to="/servicos" className="underline hover:opacity-100">Ver todos os serviços da 0WEB</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />

      <SiteExpressFunnelModal open={open} onOpenChange={setOpen} source="site_express" />
    </div>
  );
}
