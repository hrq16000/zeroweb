import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/seo";
const TITLE = "SEO Técnico e de Conteúdo · 0WEB";
const DESC = "Aumente seu tráfego orgânico com SEO técnico, conteúdo programático e link building.";

export const Route = createFileRoute("/seo")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="seo"
      intent="seo"
      offerSlug="analise-seo"
      eyebrow="SEO"
      headline="SEO que traz tráfego qualificado mês após mês"
      subheadline="Auditoria técnica, conteúdo estratégico e autoridade construída de forma sustentável."
      ctaLabel="Quero a análise gratuita"
      whatsappMessage="Quero uma análise SEO gratuita do meu site."
      benefits={[
        { title: "Auditoria técnica completa", description: "Crawl, Core Web Vitals, sitemap, schema." },
        { title: "Conteúdo orientado a intenção", description: "Páginas para cada estágio do funil." },
        { title: "Link building seguro", description: "Backlinks de autoridade, sem black hat." },
        { title: "Relatórios mensais", description: "Posições, tráfego e conversões orgânicas." },
      ]}
      faq={[
        { q: "Em quanto tempo vejo resultado?", a: "Em geral entre 60 e 120 dias para keywords competitivas." },
        { q: "Atendem qualquer nicho?", a: "Atuamos em serviços locais, B2B e e-commerce." },
        { q: "Vocês fazem conteúdo?", a: "Sim, do briefing à publicação." },
      ]}
      schemaService={{ name: "SEO", description: DESC }}
    />
  ),
});
