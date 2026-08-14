import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import heroDashboard from "@/assets/hero-dashboard.webp";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/SocialProof";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Footer } from "@/components/site/Footer";

import { getPageSections } from "@/lib/site-sections.functions";

// Below-the-fold: code-split + lazy-load to slash initial JS and TTI on mobile.
const Problems = lazy(() => import("@/components/site/Problems").then((m) => ({ default: m.Problems })));
const LossCalculator = lazy(() => import("@/components/site/LossCalculator").then((m) => ({ default: m.LossCalculator })));
const Solutions = lazy(() => import("@/components/site/Solutions").then((m) => ({ default: m.Solutions })));
const HighlightTrio = lazy(() => import("@/components/site/HighlightTrio").then((m) => ({ default: m.HighlightTrio })));
const FeatureShowcase = lazy(() => import("@/components/site/FeatureShowcase").then((m) => ({ default: m.FeatureShowcase })));
const HomeSpotlight = lazy(() => import("@/components/site/HomeSpotlight").then((m) => ({ default: m.HomeSpotlight })));
const FeaturedServices = lazy(() => import("@/components/site/FeaturedServices").then((m) => ({ default: m.FeaturedServices })));
const AISection = lazy(() => import("@/components/site/AISection").then((m) => ({ default: m.AISection })));
const DiagnosticForm = lazy(() => import("@/components/site/DiagnosticForm").then((m) => ({ default: m.DiagnosticForm })));
const Differentials = lazy(() => import("@/components/site/Differentials").then((m) => ({ default: m.Differentials })));
const Cases = lazy(() => import("@/components/site/Cases").then((m) => ({ default: m.Cases })));
const Plans = lazy(() => import("@/components/site/Plans").then((m) => ({ default: m.Plans })));
const Process = lazy(() => import("@/components/site/ProcessTimeline").then((m) => ({ default: m.ProcessTimeline })));
const StatsStrip = lazy(() => import("@/components/site/StatsStrip").then((m) => ({ default: m.StatsStrip })));
const Testimonials = lazy(() => import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials })));

const SocialProofSection = lazy(() => import("@/components/site/SocialProofSection").then((m) => ({ default: m.SocialProofSection })));
const CTA = lazy(() => import("@/components/site/CTA").then((m) => ({ default: m.CTA })));
const WhatsAppFloat = lazy(() => import("@/components/site/WhatsAppFloat").then((m) => ({ default: m.WhatsAppFloat })));
const SocialProof = lazy(() => import("@/components/site/SocialProof").then((m) => ({ default: m.SocialProof })));
const ExitIntent = lazy(() => import("@/components/site/ExitIntent").then((m) => ({ default: m.ExitIntent })));
const ConsentBanner = lazy(() => import("@/components/site/ConsentBanner").then((m) => ({ default: m.ConsentBanner })));
const ScrollTracker = lazy(() => import("@/components/site/ScrollTracker").then((m) => ({ default: m.ScrollTracker })));
const HomeChatbot = lazy(() => import("@/components/chatbot/HomeChatbot").then((m) => ({ default: m.HomeChatbot })));
const LeadWidget = lazy(() => import("@/components/site/LeadWidget").then((m) => ({ default: m.LeadWidget })));

const Skel = ({ h = "h-64" }: { h?: string }) => (
  <div className={`${h} w-full animate-pulse bg-muted/30`} aria-hidden="true" />
);

const homeSectionsQuery = queryOptions({
  queryKey: ["site-sections", "home"],
  queryFn: () => getPageSections({ data: { page: "home" } }),
  staleTime: 60_000,
});

const TITLE = "0WEB · Criação de Sites, IA e Marketing Digital";
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
      { property: "og:image", content: "https://0web.com.br/og-default.jpg" },
      { property: "og:image:alt", content: "0WEB — Sites otimizados para anúncios, IA e marketing digital" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "article:section", content: "Home · Spotlight · Busca Global · Depoimentos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/og-default.jpg" },
      { name: "twitter:image:alt", content: "0WEB — Sites otimizados para anúncios, IA e marketing digital" },
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
              foundingDate: "2006",
              sameAs: [],
            },
            {
              "@type": "WebSite",
              "@id": "https://0web.com.br/#website",
              name: "0WEB",
              url: "https://0web.com.br",
              inLanguage: "pt-BR",
              publisher: { "@id": "https://0web.com.br/#org" },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://0web.com.br/servicos?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "ItemList",
              "@id": "https://0web.com.br/#home-spotlight",
              name: "Destaques da Home — Criação de Sites para Anúncios",
              description:
                "Site otimizado para campanhas pagas: jornada de até 3s, integração com Meta Pixel/GA4 e SEO técnico nativo.",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Criação de Sites para Anúncios",
                  url: "https://0web.com.br/servicos",
                },
              ],
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
  loader: ({ context }) => context.queryClient.ensureQueryData(homeSectionsQuery),
});

function Index() {
  const { data } = useSuspenseQuery(homeSectionsQuery);
  const on = (k: string) => data.map[k] !== false;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={null}><ScrollTracker /></Suspense>
      <Header />
      <main>
        {on("hero") && <Hero />}
        {on("trustbar") && <TrustBar />}
        {on("trust_strip") !== false && <TrustStrip variant="compact" />}
        {/* Cada seção lazy tem seu próprio boundary: evita mismatch de
            hidratação quando os chunks resolvem em ordens diferentes. */}
        {on("problems") && <Suspense key="problems" fallback={<Skel />}><Problems /></Suspense>}
        {on("loss_calculator") && <Suspense key="loss_calculator" fallback={<Skel />}><LossCalculator /></Suspense>}
        {on("solutions") && <Suspense key="solutions" fallback={<Skel />}><Solutions /></Suspense>}
        <Suspense key="highlight_trio" fallback={<Skel />}><HighlightTrio /></Suspense>
        <Suspense key="home_spotlight" fallback={<Skel />}><HomeSpotlight /></Suspense>
        <Suspense key="feature_showcase" fallback={<Skel />}><FeatureShowcase /></Suspense>
        {on("featured_services") && <Suspense key="featured_services" fallback={<Skel />}><FeaturedServices /></Suspense>}
        {on("ai_section") && <Suspense key="ai_section" fallback={<Skel />}><AISection /></Suspense>}
        {on("diagnostic_form") && <Suspense key="diagnostic_form" fallback={<Skel />}><DiagnosticForm /></Suspense>}
        {on("differentials") && <Suspense key="differentials" fallback={<Skel />}><Differentials /></Suspense>}
        {on("cases") && <Suspense key="cases" fallback={<Skel />}><Cases /></Suspense>}
        <Suspense key="stats_strip" fallback={<Skel />}><StatsStrip /></Suspense>
        {on("plans") && <Suspense key="plans" fallback={<Skel />}><Plans /></Suspense>}
        {on("process") && <Suspense key="process" fallback={<Skel />}><Process /></Suspense>}
        <Suspense key="testimonials" fallback={<Skel />}><Testimonials /></Suspense>
        {on("social_proof") && <Suspense key="social_proof" fallback={<Skel />}><SocialProofSection /></Suspense>}
        {on("cta") && <Suspense key="cta" fallback={<Skel />}><CTA /></Suspense>}


      </main>
      <Footer />
      <Suspense fallback={null}>
        <WhatsAppFloat />
        <SocialProof />
        <ExitIntent />
        <ConsentBanner />
        <HomeChatbot />
        <LeadWidget />
      </Suspense>
    </div>
  );
}
