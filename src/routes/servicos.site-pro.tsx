import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";
import { absUrl } from "@/lib/seo";

const URL = absUrl("/servicos/site-pro");
const TITLE = "Site Pro · 10+ páginas com meta de ranking Google 1–5 · 0WEB";
const DESC =
  "Site profissional com 10+ páginas custom, SEO técnico + on-page e estratégia de palavras-chave com meta de ranqueamento entre as posições 1 e 5 do Google. Inclui hospedagem, SSL, anti-DDoS e 6 meses de suporte.";

export const Route = createFileRoute("/servicos/site-pro")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: SiteProPage,
});

function SiteProPage() {
  return (
    <IntentLanding
      slug="site-pro"
      serviceSlug="site-pro"
      intent="site-pro"
      eyebrow="Plano Site Pro · a partir de R$ 7.900"
      headline="Site Pro: 10+ páginas com meta de Google posição 1–5"
      subheadline="Para quem quer ranquear de verdade. Site profissional completo, estratégia de palavras-chave, SEO técnico + on-page e auditoria mensal de posição até atingir o top 5 do Google."
      offerSlug="site-pro"
      ctaLabel="Quero o Site Pro"
      whatsappMessage="Olá! Quero um orçamento do plano Site Pro (10+ páginas + ranqueamento Google)."
      breadcrumbName="Site Pro"
      benefits={[
        {
          title: "10+ páginas custom",
          description:
            "Cada página desenhada do zero para a sua marca — sem template, sem WordPress. Estrutura semântica, design premium e copy estratégico.",
        },
        {
          title: "Meta de ranking 1–5 no Google",
          description:
            "Trabalhamos palavras-chave selecionadas em conjunto com você e perseguimos as primeiras 5 posições. Você recebe relatório mensal de posicionamento.",
        },
        {
          title: "SEO técnico + on-page incluso",
          description:
            "Schema.org em todas as páginas, core web vitals 95+, sitemap, canonicals, internal linking e meta tags otimizadas. Sem custo extra.",
        },
        {
          title: "Estratégia de palavras-chave",
          description:
            "Pesquisa profissional de termos, intenção de busca, cluster de conteúdo e arquitetura de informação focada em conversão.",
        },
        {
          title: "Infraestrutura empresarial",
          description:
            "Cloudflare Edge (300+ PoPs), SSL grátis, proteção anti-DDoS, 100% de uptime garantido e backup automático.",
        },
        {
          title: "6 meses de suporte incluso",
          description:
            "Acompanhamento técnico e estratégico durante o período crítico de indexação e estabilização nos rankings.",
        },
      ]}
      faq={[
        {
          q: "Quanto tempo até aparecer no Google posição 1–5?",
          a: "O ranqueamento depende da concorrência das palavras-chave escolhidas. Termos locais e de cauda longa costumam atingir o top 5 em 60–120 dias; termos genéricos competitivos podem levar 4–8 meses. Definimos juntos um conjunto realista de palavras-chave no kickoff.",
        },
        {
          q: "Qual a diferença para o Site Express (R$ 1.500)?",
          a: "O Site Express entrega 1 landing page em 24h, focada em campanhas de tráfego pago. O Site Pro é um site institucional completo de 10+ páginas com estratégia de SEO orgânico e meta de ranqueamento auditada mês a mês. São produtos para objetivos diferentes.",
        },
        {
          q: "O que está incluso no preço a partir de R$ 7.900?",
          a: "Design e desenvolvimento de 10+ páginas, SEO técnico + on-page, pesquisa de palavras-chave, hospedagem por 1 ano, SSL, anti-DDoS, Edge CDN, painel para você editar e 6 meses de suporte. Páginas adicionais e estratégias avançadas de link building são orçadas à parte.",
        },
        {
          q: "Vocês usam WordPress ou template?",
          a: "Não. Todo Site Pro é hand-coded sob medida em TanStack/React, otimizado para Core Web Vitals 95+. Você recebe um painel próprio para editar conteúdo sem depender de plugin.",
        },
        {
          q: "Posso adicionar mais páginas depois?",
          a: "Sim. Páginas adicionais e novos clusters de conteúdo são orçados separadamente, com preço fixo por página entregue.",
        },
        {
          q: "Posso pagar parcelado?",
          a: "Sim. Aceitamos cartão em até 12x, Pix com desconto e divisão em entrada + parcelas conforme cronograma de entrega.",
        },
      ]}
      schemaService={{
        name: "Site Pro 0WEB",
        description: DESC,
        url: URL,
      }}
      relatedServicePaths={["/servicos/seo", "/servicos/site-express", "/servicos/criacao-de-sites"]}
    />
  );
}
