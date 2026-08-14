import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { FloatingFunnelCTA } from "@/components/funnel/FloatingFunnelCTA";
import { Check, Sparkles } from "lucide-react";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

const URL = "https://0web.com.br/planos";
const TITLE = "Planos e Preços · Sites, SEO, Tráfego e Automações · 0WEB";
const DESC =
  "Conheça os planos da 0WEB para sites, SEO, tráfego pago, automações com IA e gestão de redes sociais. Pacotes mensais transparentes para empresas que querem crescer.";

const plans = [
  {
    name: "Essencial",
    price: "R$ 1.490",
    period: "/mês",
    tagline: "Para começar com presença digital profissional",
    features: [
      "Site institucional otimizado (até 5 páginas)",
      "Hospedagem e SSL gerenciados",
      "Google Meu Negócio otimizado",
      "SEO técnico básico",
      "Relatório mensal de tráfego",
      "Suporte por WhatsApp em horário comercial",
    ],
    cta: "Quero o Essencial",
  },
  {
    name: "Crescimento",
    price: "R$ 3.490",
    period: "/mês",
    tagline: "Para escalar tráfego, leads e vendas",
    featured: true,
    features: [
      "Tudo do Essencial",
      "SEO técnico + 4 artigos otimizados/mês",
      "Tráfego pago Google e Meta (até R$ 5k de verba)",
      "1 landing page de conversão/mês",
      "Automação de leads e CRM básico",
      "Dashboard de performance em tempo real",
      "Suporte prioritário",
    ],
    cta: "Quero crescer",
  },
  {
    name: "Performance",
    price: "Sob consulta",
    period: "",
    tagline: "Para empresas com metas agressivas de receita",
    features: [
      "Tudo do Crescimento",
      "Estratégia omnichannel completa",
      "Chatbot e IA generativa personalizada",
      "Integrações com ERP, CRM e e-commerce",
      "Squad dedicado (designer, dev, mídia, SEO)",
      "Reuniões semanais de performance",
      "SLA garantido em contrato",
    ],
    cta: "Falar com especialista",
  },
];

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "https://0web.com.br/og-default.jpg" },
      { property: "og:image:alt", content: "Planos 0WEB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/og-default.jpg" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Planos 0WEB",
          itemListElement: plans.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Offer",
              name: p.name,
              description: p.tagline,
              price: p.price.replace(/[^0-9]/g, "") || undefined,
              priceCurrency: "BRL",
              url: URL,
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
            { "@type": "ListItem", position: 2, name: "Planos", item: URL },
          ],
        }),
      },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="pt-28 pb-16 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Planos transparentes
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            Planos para empresas que querem <span className="text-gradient">crescer com previsibilidade</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            Escolha o plano ideal para o seu momento. Sem fidelidade abusiva, sem custos escondidos.
          </p>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  p.featured ? "border-primary shadow-glow-primary bg-card" : "border-border bg-card/60"
                }`}
              >
                <h2 className="text-2xl font-bold font-display">{p.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{p.tagline}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <FunnelCTAButton
                  intent={{ purpose: "proposal", source: `planos_${p.name.toLowerCase()}`, pagePath: "/planos", placement: "section", campaign: p.name.toLowerCase() }}
                  label={p.cta}
                  location={`planos_${p.name.toLowerCase()}`}
                  showArrow={false}
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ${
                    p.featured
                      ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
                      : "bg-foreground text-background"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h2 className="font-display text-3xl font-bold">Como escolher o plano certo</h2>
            <p>
              Cada empresa está em um estágio diferente. O plano <strong>Essencial</strong> é ideal para
              quem está estruturando a presença digital e precisa de site, Google Meu Negócio e SEO básico.
              O <strong>Crescimento</strong> entrega tráfego pago, SEO de conteúdo e automação de leads,
              ideal para empresas que já vendem online e querem escalar. O <strong>Performance</strong> é
              desenhado para metas agressivas de receita, com squad dedicado e estratégia omnichannel.
            </p>
            <p>
              Todos os planos incluem dashboards de performance, suporte humano pelo funil e contrato
              flexível. Quer ajuda para escolher?{" "}
              <FunnelCTAButton
                intent={{ purpose: "proposal", source: "planos_inline", pagePath: "/planos", placement: "section" }}
                label="Fale com um especialista"
                location="planos_inline"
                showArrow={false}
                className="text-primary font-medium underline"
              />
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
      <FloatingFunnelCTA location="planos_page" />
    </div>
  );
}
