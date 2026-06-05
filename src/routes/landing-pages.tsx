import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/landing-pages";
const TITLE = "Landing Pages de Alta Conversão · 0WEB";
const DESC =
  "Criação de landing pages de alta conversão para Google Ads, Meta Ads e SEO. Design persuasivo, copy orientada a CRO, carregamento rápido e testes A/B contínuos.";

export const Route = createFileRoute("/landing-pages")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="landing-pages"
      intent="landing-pages"
      offerSlug="landing-page-conversao"
      eyebrow="Landing Pages"
      headline="Landing pages que convertem visitantes em clientes"
      subheadline="Páginas otimizadas para Google Ads, Meta Ads e SEO. Copy persuasiva, design moderno, Core Web Vitals 100% verdes e testes A/B contínuos."
      ctaLabel="Quero minha landing page"
      whatsappMessage="Quero uma landing page de alta conversão para minha campanha."
      benefits={[
        { title: "Copy orientada a CRO", description: "Headlines, provas sociais e gatilhos baseados em dados de conversão." },
        { title: "Design responsivo e rápido", description: "LCP abaixo de 2,5s e nota 95+ no PageSpeed Insights." },
        { title: "Integração com Ads e CRM", description: "GTM, GA4, Meta Pixel, RD Station, HubSpot e webhooks." },
        { title: "Testes A/B contínuos", description: "Variações de hero, CTA e oferta com acompanhamento mensal." },
        { title: "Formulários inteligentes", description: "Validação, anti-spam, qualificação e roteamento por WhatsApp." },
        { title: "SEO técnico no DNA", description: "Schema.org, meta tags Open Graph e estrutura semântica." },
      ]}
      faq={[
        { q: "Em quanto tempo a landing page fica pronta?", a: "Entre 5 e 10 dias úteis, com revisões incluídas." },
        { q: "Posso usar para Google Ads e Meta Ads?", a: "Sim. Entregamos otimizada para Quality Score alto e CPL baixo." },
        { q: "Vocês fazem o copywriting?", a: "Sim, copy persuasiva com base na sua oferta e público-alvo." },
        { q: "Como medimos resultados?", a: "GA4, Meta Pixel e dashboards com taxa de conversão, CPL e ROI." },
      ]}
      schemaService={{ name: "Landing Pages de Alta Conversão", description: DESC }}
    />
  ),
});
