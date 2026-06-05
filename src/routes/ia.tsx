import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/ia";
const TITLE = "Inteligência Artificial para Negócios · 0WEB";
const DESC = "Soluções de IA aplicadas a atendimento, conteúdo e operação. Resultados mensuráveis em 30 dias.";

export const Route = createFileRoute("/ia")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="ia"
      intent="ia"
      offerSlug="diagnostico-gratuito"
      eyebrow="Inteligência Artificial"
      headline="IA aplicada ao seu negócio"
      subheadline="Atendimento, conteúdo, qualificação de leads e analytics potencializados por IA."
      ctaLabel="Quero aplicar IA"
      whatsappMessage="Quero aplicar IA no meu negócio com a 0WEB."
      benefits={[
        { title: "Qualificação automática", description: "IA classifica leads em frio, morno e quente." },
        { title: "Atendimento inteligente", description: "Assistentes treinados no seu contexto." },
        { title: "Geração de conteúdo", description: "SEO programático com revisão humana." },
        { title: "Insights operacionais", description: "Detecção de gargalos e oportunidades." },
      ]}
      faq={[
        { q: "Vocês usam modelo próprio?", a: "Trabalhamos com OpenAI, Anthropic e modelos open via Lovable AI." },
        { q: "Preciso de dados?", a: "Quanto mais melhor, mas começamos pequeno." },
        { q: "É seguro?", a: "Sim, com tokens isolados e logs auditáveis." },
      ]}
      schemaService={{ name: "Inteligência Artificial", description: DESC }}
    />
  ),
});
