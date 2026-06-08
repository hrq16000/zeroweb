import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/servicos/consultoria";
const TITLE = "Consultoria de Marketing e Crescimento · 0WEB";
const DESC = "Diagnóstico, planejamento e acompanhamento estratégico para escalar canais digitais.";

export const Route = createFileRoute("/servicos/consultoria")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="consultoria"
      funnelSlug="funnel-service"
      serviceSlug="consultoria"
      intent="consultoria"
      offerSlug="planejamento-digital"
      breadcrumbName="Consultoria Estratégica"
      relatedServicePaths={["/servicos/seo", "/servicos/trafego-pago", "/servicos/presenca-digital"]}
      eyebrow="Consultoria"
      headline="Estratégia digital com método"
      subheadline="Sessões de planejamento e execução guiada para crescer com previsibilidade."
      ctaLabel="Quero o planejamento"
      whatsappMessage="Quero contratar consultoria estratégica com a 0WEB."
      benefits={[
        { title: "Diagnóstico completo", description: "Funil, canais, ofertas, posicionamento." },
        { title: "Roadmap 90 dias", description: "Quinzenas com entregas mensuráveis." },
        { title: "Mentoria ao time", description: "Capacitação prática em SEO, ads e CRO." },
        { title: "Acompanhamento semanal", description: "Calls de revisão e ajuste." },
      ]}
      faq={[
        { q: "Quantas horas por mês?", a: "Pacotes de 4h, 8h e 16h mensais." },
        { q: "Vocês executam também?", a: "Sim, equipe própria para SEO, ads e desenvolvimento." },
        { q: "Atendem qualquer porte?", a: "Trabalhamos com PMEs e operações em estágio inicial." },
      ]}
      schemaService={{ name: "Consultoria Digital", description: DESC }}
    />
  ),
});
