import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/desenvolvimento";
const TITLE = "Desenvolvimento Web e Sistemas Sob Medida · 0WEB";
const DESC = "Sistemas, dashboards e integrações construídos com stack moderna (React, TypeScript, Supabase).";

export const Route = createFileRoute("/desenvolvimento")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="desenvolvimento"
      intent="desenvolvimento"
      offerSlug="diagnostico-gratuito"
      eyebrow="Desenvolvimento"
      headline="Sistemas que crescem com o seu negócio"
      subheadline="Engenharia ágil para construir produtos digitais robustos e escaláveis."
      ctaLabel="Quero conversar"
      whatsappMessage="Quero desenvolver um sistema sob medida com a 0WEB."
      benefits={[
        { title: "Stack moderna", description: "TypeScript, React, TanStack, Supabase, Cloudflare." },
        { title: "Entrega incremental", description: "MVP em 30 dias, evoluindo por sprint." },
        { title: "Arquitetura escalável", description: "Multi-tenant, RLS, edge runtime." },
        { title: "Qualidade auditável", description: "Tests, lint, observabilidade e logs." },
      ]}
      faq={[
        { q: "Vocês fazem mobile?", a: "Web responsivo e PWAs. Para nativo, parceiros especializados." },
        { q: "Como cobram?", a: "Por escopo ou por sprint (squad dedicada)." },
        { q: "Tenho acesso ao código?", a: "Sim, repositório transferido após o ciclo." },
      ]}
      schemaService={{ name: "Desenvolvimento de Software", description: DESC }}
    />
  ),
});
