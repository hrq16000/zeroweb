import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Problems } from "@/components/site/Problems";
import { Solutions } from "@/components/site/Solutions";
import { AISection } from "@/components/site/AISection";
import { Differentials } from "@/components/site/Differentials";
import { Portfolio } from "@/components/site/Portfolio";
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
      { property: "og:url", content: "/" },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [
      { rel: "canonical", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "0WEB",
              url: "https://0web.com.br",
              slogan: "Tecnologia que gera crescimento",
              sameAs: [],
            },
            {
              "@type": "LocalBusiness",
              name: "0WEB",
              url: "https://0web.com.br",
              telephone: "+55-00-00000-0000",
              priceRange: "$$",
              areaServed: "BR",
            },
            {
              "@type": "WebSite",
              name: "0WEB",
              url: "https://0web.com.br",
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
                { "@type": "ListItem", position: 1, name: "Início", item: "/" },
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
        <Solutions />
        <AISection />
        <Differentials />
        <Portfolio />
        <Cases />
        <Plans />
        <Process />
        <FAQ />
        <Blog />
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
