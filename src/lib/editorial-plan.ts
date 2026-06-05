// Sprint 12 — Planejamento editorial (100/300/1000 artigos)
// Gera plano a partir da taxonomia. Sem produzir conteúdo de fato.

import { CLUSTERS, COMMERCIAL_PATTERNS, type Cluster, type Subcluster } from "./content-taxonomy";

export type PlannedArticle = {
  clusterSlug: string;
  clusterTitle: string;
  subSlug: string;
  title: string;
  slug: string;
  intent: Subcluster["intent"];
  funnel: Subcluster["funnel"];
  priority: 1 | 2 | 3;
  commercialValue: 1 | 2 | 3 | 4 | 5;
  estimatedVolume: number;
  difficulty: number; // 1..5
  template: ArticleTemplate;
  internalLinks: { type: "service" | "city" | "cluster" | "hub"; href: string; label: string }[];
};

export type ArticleTemplate =
  | "guide" // tofu informational
  | "how-to"
  | "comparison"
  | "pricing" // bofu commercial "quanto custa"
  | "service-page" // bofu transactional "agência de"
  | "case-study"
  | "faq";

const CITIES_SAMPLE = ["sao-paulo", "rio-de-janeiro", "belo-horizonte", "curitiba", "porto-alegre"];

function templateFor(s: Subcluster, title: string): ArticleTemplate {
  const lc = title.toLowerCase();
  if (COMMERCIAL_PATTERNS.some((p) => lc.startsWith(p))) {
    if (lc.startsWith("quanto custa")) return "pricing";
    if (lc.startsWith("empresa de") || lc.startsWith("agência de") || lc.startsWith("especialista em") || lc.startsWith("consultoria") || lc.startsWith("serviço de")) return "service-page";
  }
  if (s.funnel === "bofu") return "service-page";
  if (lc.includes(" x ") || lc.includes(" vs ")) return "comparison";
  if (lc.startsWith("como ")) return "how-to";
  return "guide";
}

function difficultyHeuristic(s: Subcluster): number {
  // Higher commercial value usually = harder
  return Math.min(5, 2 + Math.round(s.commercialValue / 2));
}

function volumeHeuristic(s: Subcluster): number {
  const base = { tofu: 4000, mofu: 1200, bofu: 400 }[s.funnel];
  return base * (4 - s.priority);
}

function buildInternalLinks(c: Cluster, _s: Subcluster): PlannedArticle["internalLinks"] {
  const links: PlannedArticle["internalLinks"] = [
    { type: "hub", href: c.hubPath, label: `Hub ${c.title}` },
  ];
  c.relatedServices.forEach((p) =>
    links.push({ type: "service", href: p, label: `Serviço: ${p.replace("/", "")}` }),
  );
  if (c.relatedCities) {
    CITIES_SAMPLE.slice(0, 2).forEach((city) =>
      links.push({ type: "city", href: `/cidade/${city}`, label: `Cidade: ${city}` }),
    );
  }
  return links;
}

export function generatePlan(): PlannedArticle[] {
  const plan: PlannedArticle[] = [];
  for (const c of CLUSTERS) {
    for (const s of c.subclusters) {
      const slug = `${c.slug}-${s.slug}`;
      const tpl = templateFor(s, s.title);
      plan.push({
        clusterSlug: c.slug,
        clusterTitle: c.title,
        subSlug: s.slug,
        title: s.title,
        slug,
        intent: s.intent,
        funnel: s.funnel,
        priority: s.priority,
        commercialValue: s.commercialValue,
        estimatedVolume: s.estimatedVolume ?? volumeHeuristic(s),
        difficulty: s.difficulty ?? difficultyHeuristic(s),
        template: tpl,
        internalLinks: buildInternalLinks(c, s),
      });

      // Expand commercial patterns into derived articles (e.g. "quanto custa X", "agência de X")
      if (s.priority === 1 && s.intent !== "transactional") {
        for (const pat of ["quanto custa", "agência de", "consultoria em"]) {
          const derivedTitle = `${pat} ${s.title.toLowerCase()}`;
          plan.push({
            clusterSlug: c.slug,
            clusterTitle: c.title,
            subSlug: `${s.slug}-${pat.replace(/\s+/g, "-")}`,
            title: derivedTitle.charAt(0).toUpperCase() + derivedTitle.slice(1),
            slug: `${c.slug}-${s.slug}-${pat.replace(/\s+/g, "-")}`,
            intent: pat === "quanto custa" ? "commercial" : "transactional",
            funnel: "bofu",
            priority: 2,
            commercialValue: 5,
            estimatedVolume: 300,
            difficulty: 4,
            template: pat === "quanto custa" ? "pricing" : "service-page",
            internalLinks: buildInternalLinks(c, s),
          });
        }
      }
    }
  }
  // Sort by ranking score: priority + commercial value + volume
  return plan.sort((a, b) => {
    const sa = (4 - a.priority) * 10 + a.commercialValue * 5 + Math.log10(a.estimatedVolume + 1);
    const sb = (4 - b.priority) * 10 + b.commercialValue * 5 + Math.log10(b.estimatedVolume + 1);
    return sb - sa;
  });
}

export function planBuckets() {
  const full = generatePlan();
  return {
    top100: full.slice(0, 100),
    top300: full.slice(0, 300),
    top1000: full.slice(0, 1000),
    full,
  };
}

// Article block templates (for future automation)
export const ARTICLE_BLOCKS: Record<ArticleTemplate, string[]> = {
  guide: ["intro", "sumario", "definicao", "secoes", "exemplos", "faq", "cta", "links-relacionados"],
  "how-to": ["intro", "sumario", "passo-a-passo", "checklist", "erros-comuns", "faq", "cta", "links-relacionados"],
  comparison: ["intro", "tabela-comparativa", "criterios", "quando-usar-cada", "veredito", "faq", "cta"],
  pricing: ["intro", "faixas-de-preco", "fatores", "exemplo-real", "case", "faq", "cta-orçamento"],
  "service-page": ["hero", "proposta-valor", "como-funciona", "diferenciais", "casos", "faq", "cta-contato"],
  "case-study": ["resumo", "contexto", "desafio", "solucao", "resultados", "depoimento", "cta"],
  faq: ["intro", "perguntas", "respostas-curtas", "cta"],
};
