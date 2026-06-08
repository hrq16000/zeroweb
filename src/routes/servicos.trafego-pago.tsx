import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/servicos/trafego-pago";
const TITLE = "Tráfego Pago — Google Ads e Meta Ads · 0WEB";
const DESC = "Campanhas de mídia paga com CPA otimizado e atribuição completa. Leads previsíveis todos os dias.";

export const Route = createFileRoute("/servicos/trafego-pago")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="trafego-pago"
      funnelSlug="funnel-service"
      serviceSlug="trafego-pago"
      intent="trafego-pago"
      offerSlug="diagnostico-gratuito"
      eyebrow="Tráfego pago"
      headline="Anúncios que viram cliente"
      subheadline="Campanhas Google Ads e Meta Ads com landing pages otimizadas e tracking ponta a ponta."
      ctaLabel="Quero diagnóstico gratuito"
      whatsappMessage="Quero rodar tráfego pago com a 0WEB."
      benefits={[
        { title: "Estrutura de campanhas profissional", description: "Search, Performance Max, Demand Gen e Meta." },
        { title: "Landing pages dedicadas", description: "1 LP por intenção, com A/B contínuo." },
        { title: "Tracking 100%", description: "GA4, GTM, gclid/fbclid e conversões offline." },
        { title: "Otimização semanal", description: "Lances, criativos e palavras revisados." },
      ]}
      faq={[
        { q: "Qual investimento mínimo?", a: "Recomendamos R$ 1.500/mês em mídia + gestão." },
        { q: "Vocês entregam relatório?", a: "Sim, semanal com leads, CPA, ROAS e ações." },
        { q: "Conseguem CPA garantido?", a: "Trabalhamos com meta de CPA, ajustada após validação." },
      ]}
      schemaService={{ name: "Tráfego Pago", description: DESC }}
    />
  ),
});
