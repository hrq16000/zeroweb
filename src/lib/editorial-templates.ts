// Sprint 12 — Templates editoriais padronizados (não geram conteúdo, apenas estrutura)
import type { Cluster, Subcluster } from "@/lib/content-taxonomy";

export type ArticleSection =
  | "intro"
  | "summary"
  | "body"
  | "faq"
  | "cta"
  | "related"
  | "author"
  | "schema";

export type ArticleTemplate = {
  id: string;
  label: string;
  intentFit: Array<Subcluster["intent"]>;
  funnelFit: Array<Subcluster["funnel"]>;
  sections: ArticleSection[];
  minWords: number;
  recommendedH2: number;
  notes: string;
};

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: "pillar-guide",
    label: "Guia Pilar (long-form)",
    intentFit: ["informational"],
    funnelFit: ["tofu", "mofu"],
    sections: ["intro", "summary", "body", "faq", "related", "author", "cta", "schema"],
    minWords: 1800,
    recommendedH2: 8,
    notes: "Cobertura ampla do tema-pilar. Linka para todos os subtópicos do cluster.",
  },
  {
    id: "how-to",
    label: "How-to / Passo a passo",
    intentFit: ["informational"],
    funnelFit: ["tofu", "mofu"],
    sections: ["intro", "summary", "body", "faq", "cta", "schema"],
    minWords: 900,
    recommendedH2: 5,
    notes: "Schema HowTo. Cada passo em H2 ou OL.",
  },
  {
    id: "comparative",
    label: "Comparativo / Versus",
    intentFit: ["commercial", "informational"],
    funnelFit: ["mofu"],
    sections: ["intro", "summary", "body", "faq", "cta", "related", "schema"],
    minWords: 1200,
    recommendedH2: 6,
    notes: "Tabela comparativa, prós e contras, recomendação final.",
  },
  {
    id: "pricing",
    label: "Quanto custa / Pricing",
    intentFit: ["commercial"],
    funnelFit: ["bofu"],
    sections: ["intro", "summary", "body", "faq", "cta", "schema"],
    minWords: 1000,
    recommendedH2: 5,
    notes: "Faixas de preço, fatores que influenciam, CTA para orçamento.",
  },
  {
    id: "service-landing",
    label: "Landing de serviço editorial",
    intentFit: ["transactional"],
    funnelFit: ["bofu"],
    sections: ["intro", "body", "faq", "cta", "author", "schema"],
    minWords: 800,
    recommendedH2: 5,
    notes: "Schema Service. Reforço de E-E-A-T e CTA dominante.",
  },
  {
    id: "case-study",
    label: "Estudo de caso",
    intentFit: ["informational", "commercial"],
    funnelFit: ["mofu", "bofu"],
    sections: ["intro", "body", "cta", "author", "schema"],
    minWords: 800,
    recommendedH2: 4,
    notes: "Antes/depois, métricas reais, schema Article + AggregateRating quando aplicável.",
  },
  {
    id: "glossary",
    label: "Verbete de glossário",
    intentFit: ["informational"],
    funnelFit: ["tofu"],
    sections: ["intro", "body", "related", "schema"],
    minWords: 350,
    recommendedH2: 3,
    notes: "DefinedTerm schema. Linka para o hub do cluster.",
  },
];

export function suggestTemplate(s: Subcluster): ArticleTemplate {
  return (
    ARTICLE_TEMPLATES.find(
      (t) => t.intentFit.includes(s.intent) && t.funnelFit.includes(s.funnel),
    ) ?? ARTICLE_TEMPLATES[0]
  );
}

export function blueprintFor(cluster: Cluster, s: Subcluster) {
  const t = suggestTemplate(s);
  return {
    template: t.id,
    title: s.title,
    targetUrl: `/blog/${cluster.slug}/${s.slug}`,
    h1: s.title,
    sections: t.sections,
    minWords: t.minWords,
    suggestedH2: t.recommendedH2,
    primaryKeyword: s.title.toLowerCase(),
    secondaryKeywords: [cluster.pillarKeyword, ...cluster.relatedServices.map((p) => p.slice(1))],
    cta:
      s.funnel === "bofu"
        ? `Falar com especialista em ${cluster.title}`
        : `Diagnóstico gratuito de ${cluster.title}`,
  };
}
