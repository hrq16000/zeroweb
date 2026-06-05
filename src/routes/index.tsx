import { createFileRoute } from "@tanstack/react-router";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Problems } from "@/components/site/Problems";
import { Solutions } from "@/components/site/Solutions";
import { AISection } from "@/components/site/AISection";
import { Differentials } from "@/components/site/Differentials";
import { Cases } from "@/components/site/Cases";
import { Plans } from "@/components/site/Plans";
import { Process } from "@/components/site/Process";
import { FAQ, faqData } from "@/components/site/FAQ";
import { Blog } from "@/components/site/Blog";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { ScrollTracker } from "@/components/site/ScrollTracker";
import { ConsentBanner } from "@/components/site/ConsentBanner";
import { SocialProof, TrustBar } from "@/components/site/SocialProof";
import { ExitIntent } from "@/components/site/ExitIntent";
import { DiagnosticForm } from "@/components/site/DiagnosticForm";
import { LossCalculator } from "@/components/site/LossCalculator";
import { SocialProofSection } from "@/components/site/SocialProofSection";

const TITLE = "0WEB · Criação de Sites, IA e Marketing Digital para Empresas";
const DESC =
  "Criamos sites, automações, sistemas e estratégias digitais que atraem clientes, aumentam vendas e transformam empresas em máquinas de crescimento.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "criação de sites, desenvolvimento web, landing pages, lojas virtuais, SEO, marketing digital, automação, IA, chatbot, SaaS, hospedagem, tráfego pago" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://0web.com.br/" },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "https://0web.com.br/og-default.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/og-default.png" },
    ],
    links: [
      { rel: "canonical", href: "https://0web.com.br/" },
      { rel: "preload", as: "image", href: heroDashboard, fetchPriority: "high" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://0web.com.br/#org",
              name: "0WEB",
              url: "https://0web.com.br",
              logo: "https://0web.com.br/favicon.ico",
              slogan: "Tecnologia que gera crescimento",
              taxID: "41.723.708/0001-58",
              telephone: "+55-41-99745-2053",
              email: "contato@0web.com.br",
              foundingDate: "2006",
              sameAs: [],
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://0web.com.br/#localbusiness",
              name: "0WEB",
              url: "https://0web.com.br",
              telephone: "+55-41-99745-2053",
              email: "contato@0web.com.br",
              priceRange: "$$",
              areaServed: { "@type": "Country", name: "BR" },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Curitiba",
                addressRegion: "PR",
                addressCountry: "BR",
              },
              openingHoursSpecification: [{
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                opens: "09:00",
                closes: "19:00",
              }],
            },
            {
              "@type": "WebSite",
              "@id": "https://0web.com.br/#website",
              name: "0WEB",
              url: "https://0web.com.br",
              inLanguage: "pt-BR",
              publisher: { "@id": "https://0web.com.br/#org" },
            },
            {
              "@type": "WebPage",
              "@id": "https://0web.com.br/#webpage",
              url: "https://0web.com.br/",
              name: TITLE,
              description: DESC,
              isPartOf: { "@id": "https://0web.com.br/#website" },
              inLanguage: "pt-BR",
            },
            {
              "@type": "FAQPage",
              mainEntity: faqData.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollTracker />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Problems />
        <LossCalculator />
        <Solutions />
        <AISection />
        <DiagnosticForm />
        <Differentials />
        {/* Portfolio fake removido — substituído pela seção Cases (reais) */}
        <Cases />
        <Plans />
        <Process />
        <FAQ />
        <Blog />
        <SocialProofSection />
        <CTA />
      </main>
      <Footer />
      <WhatsAppFloat />
      <SocialProof />
      <ExitIntent />
      <ConsentBanner />
    </div>
  );
}
