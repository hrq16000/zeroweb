import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import heroDashboard from "@/assets/hero-dashboard.webp";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/SocialProof";
import { Footer } from "@/components/site/Footer";

import { getPageSections } from "@/lib/site-sections.functions";

// Below-the-fold: code-split + lazy-load to slash initial JS and TTI on mobile.
const Problems = lazy(() => import("@/components/site/Problems").then((m) => ({ default: m.Problems })));
const LossCalculator = lazy(() => import("@/components/site/LossCalculator").then((m) => ({ default: m.LossCalculator })));
const Solutions = lazy(() => import("@/components/site/Solutions").then((m) => ({ default: m.Solutions })));
const FeaturedServices = lazy(() => import("@/components/site/FeaturedServices").then((m) => ({ default: m.FeaturedServices })));
const AISection = lazy(() => import("@/components/site/AISection").then((m) => ({ default: m.AISection })));
const DiagnosticForm = lazy(() => import("@/components/site/DiagnosticForm").then((m) => ({ default: m.DiagnosticForm })));
const Differentials = lazy(() => import("@/components/site/Differentials").then((m) => ({ default: m.Differentials })));
const Cases = lazy(() => import("@/components/site/Cases").then((m) => ({ default: m.Cases })));
const Plans = lazy(() => import("@/components/site/Plans").then((m) => ({ default: m.Plans })));
const Process = lazy(() => import("@/components/site/Process").then((m) => ({ default: m.Process })));
const Blog = lazy(() => import("@/components/site/Blog").then((m) => ({ default: m.Blog })));
const SocialProofSection = lazy(() => import("@/components/site/SocialProofSection").then((m) => ({ default: m.SocialProofSection })));
const CTA = lazy(() => import("@/components/site/CTA").then((m) => ({ default: m.CTA })));
const WhatsAppFloat = lazy(() => import("@/components/site/WhatsAppFloat").then((m) => ({ default: m.WhatsAppFloat })));
const SocialProof = lazy(() => import("@/components/site/SocialProof").then((m) => ({ default: m.SocialProof })));
const ExitIntent = lazy(() => import("@/components/site/ExitIntent").then((m) => ({ default: m.ExitIntent })));
const ConsentBanner = lazy(() => import("@/components/site/ConsentBanner").then((m) => ({ default: m.ConsentBanner })));
const ScrollTracker = lazy(() => import("@/components/site/ScrollTracker").then((m) => ({ default: m.ScrollTracker })));
const HomeChatbot = lazy(() => import("@/components/chatbot/HomeChatbot").then((m) => ({ default: m.HomeChatbot })));

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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/og-default.jpg" },
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
        <Suspense fallback={<Skel />}>
          {on("problems") && <Problems />}
          {on("loss_calculator") && <LossCalculator />}
          {on("solutions") && <Solutions />}
          {on("featured_services") && <FeaturedServices />}
          {on("ai_section") && <AISection />}
          {on("diagnostic_form") && <DiagnosticForm />}
          {on("differentials") && <Differentials />}
          {on("cases") && <Cases />}
          {on("plans") && <Plans />}
          {on("process") && <Process />}
          
          {on("blog") && <Blog />}
          {on("social_proof") && <SocialProofSection />}
          {on("cta") && <CTA />}
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <WhatsAppFloat />
        <SocialProof />
        <ExitIntent />
        <ConsentBanner />
        <HomeChatbot />
      </Suspense>
    </div>
  );
}
