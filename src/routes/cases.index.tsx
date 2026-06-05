import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { ArrowRight, TrendingUp } from "lucide-react";

const URL = "https://0web.com.br/cases";
const TITLE = "Cases de Sucesso · Resultados Reais em SEO, Tráfego e IA · 0WEB";
const DESC =
  "Conheça cases reais de clientes 0WEB: crescimento de tráfego orgânico, redução de CPL, automação de vendas e implementação de IA. Resultados mensuráveis.";

const cases = [
  {
    slug: "saas-b2b-seo",
    title: "+412% de tráfego orgânico para SaaS B2B em 8 meses",
    summary: "Reestruturação de SEO técnico, conteúdo programático e link building gerou crescimento orgânico recorrente.",
    metric: "+412% sessões orgânicas",
    segment: "SaaS B2B",
  },
  {
    slug: "ecommerce-trafego-pago",
    title: "ROAS 7,3 em e-commerce de moda no Meta Ads",
    summary: "Reestruturação completa de campanhas, criativos UGC e funil de remarketing aumentaram o retorno em 3x.",
    metric: "ROAS 7,3",
    segment: "E-commerce moda",
  },
  {
    slug: "clinica-google-meu-negocio",
    title: "Clínica passa de 12 para 187 contatos/mês via Google",
    summary: "Otimização de Google Meu Negócio, SEO local e landing pages para bairros aumentaram o volume de pacientes.",
    metric: "+1.458% leads locais",
    segment: "Saúde",
  },
  {
    slug: "automacao-ia-whatsapp",
    title: "Atendimento 24/7 com IA reduz custo em 62%",
    summary: "Chatbot com IA generativa qualifica leads no WhatsApp, integra com CRM e libera time comercial.",
    metric: "-62% custo de atendimento",
    segment: "Serviços",
  },
];

export const Route = createFileRoute("/cases/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Cases de Sucesso 0WEB",
          itemListElement: cases.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://0web.com.br/cases/${c.slug}`,
            name: c.title,
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
            { "@type": "ListItem", position: 2, name: "Cases", item: URL },
          ],
        }),
      },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="pt-28 pb-12 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <TrendingUp className="w-3.5 h-3.5" /> Resultados reais
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold max-w-3xl mx-auto">
            Cases de sucesso de clientes que <span className="text-gradient">cresceram com a 0WEB</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            Resultados mensuráveis em SEO, tráfego pago, automação com IA e desenvolvimento web.
          </p>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <Link
                key={c.slug}
                to="/cases/$slug"
                params={{ slug: c.slug }}
                className="rounded-2xl border border-border bg-card p-8 hover:shadow-glow-primary hover:border-primary/40 transition group"
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{c.segment}</div>
                <h2 className="mt-2 text-2xl font-display font-bold">{c.title}</h2>
                <p className="mt-3 text-muted-foreground">{c.summary}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-primary font-semibold">
                    {c.metric}
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
