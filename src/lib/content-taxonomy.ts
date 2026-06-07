// Sprint 12 — Mapa de Autoridade Temática (Topical Authority Map)
// Estrutura: Tema → Cluster → Subcluster → Intent → Funnel

export type Intent = "informational" | "navigational" | "commercial" | "transactional";
export type Funnel = "tofu" | "mofu" | "bofu";

export type Subcluster = {
  slug: string;
  title: string;
  intent: Intent;
  funnel: Funnel;
  priority: 1 | 2 | 3; // 1 = alta
  commercialValue: 1 | 2 | 3 | 4 | 5;
  estimatedVolume?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
};

export type Cluster = {
  slug: string;
  title: string;
  description: string;
  hubPath: string; // ex: /blog/seo
  pillarKeyword: string;
  relatedServices: string[]; // paths
  relatedCities?: boolean;
  subclusters: Subcluster[];
};

export type Theme = {
  slug: string;
  title: string;
  description: string;
  clusters: string[]; // cluster slugs
};

export const CLUSTERS: Cluster[] = [
  {
    slug: "seo",
    title: "SEO",
    description: "Otimização para motores de busca, autoridade tópica e Core Web Vitals.",
    hubPath: "/blog/seo",
    pillarKeyword: "seo",
    relatedServices: ["/seo"],
    relatedCities: true,
    subclusters: [
      { slug: "o-que-e-seo", title: "O que é SEO", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 2 },
      { slug: "seo-tecnico", title: "SEO Técnico", intent: "informational", funnel: "mofu", priority: 1, commercialValue: 3 },
      { slug: "seo-local", title: "SEO Local", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "seo-on-page", title: "SEO On-Page", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "link-building", title: "Link Building", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "consultoria-seo", title: "Consultoria SEO", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "agencia-de-seo", title: "Agência de SEO", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "quanto-custa-seo", title: "Quanto custa SEO", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "core-web-vitals", title: "Core Web Vitals", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "auditoria-seo", title: "Auditoria SEO", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
    ],
  },
  {
    slug: "google-meu-negocio",
    title: "Google Meu Negócio",
    description: "Perfil da empresa no Google, Maps e busca local.",
    hubPath: "/blog/google-meu-negocio",
    pillarKeyword: "google meu negócio",
    relatedServices: ["/servicos/google-meu-negocio"],
    relatedCities: true,
    subclusters: [
      { slug: "como-criar-perfil", title: "Como criar perfil GMN", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 3 },
      { slug: "otimizacao-gmn", title: "Otimização do Google Meu Negócio", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "como-aparecer-no-maps", title: "Como aparecer no Google Maps", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 4 },
      { slug: "avaliacoes-google", title: "Avaliações no Google", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 4 },
      { slug: "empresa-de-gmn", title: "Empresa de Google Meu Negócio", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "quanto-custa-gmn", title: "Quanto custa otimizar GMN", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "categorias-gmn", title: "Categorias do GMN", intent: "informational", funnel: "mofu", priority: 3, commercialValue: 2 },
      { slug: "postagens-gmn", title: "Postagens no GMN", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
    ],
  },
  {
    slug: "sites",
    title: "Criação de Sites",
    description: "Desenvolvimento e estratégia de sites comerciais.",
    hubPath: "/blog/sites",
    pillarKeyword: "criação de sites",
    relatedServices: ["/criacao-sites", "/desenvolvimento"],
    relatedCities: true,
    subclusters: [
      { slug: "como-criar-site", title: "Como criar um site", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 3 },
      { slug: "site-institucional", title: "Site institucional", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "site-rapido", title: "Site rápido e leve", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "quanto-custa-site", title: "Quanto custa um site", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "agencia-de-sites", title: "Agência de criação de sites", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "site-wordpress-vs-custom", title: "WordPress x custom", intent: "informational", funnel: "mofu", priority: 3, commercialValue: 3 },
      { slug: "redesign-site", title: "Redesign de site", intent: "commercial", funnel: "bofu", priority: 2, commercialValue: 4 },
    ],
  },
  {
    slug: "landing-pages",
    title: "Landing Pages",
    description: "Páginas de conversão para campanhas pagas e orgânicas.",
    hubPath: "/blog/landing-pages",
    pillarKeyword: "landing page",
    relatedServices: ["/criacao-sites"],
    subclusters: [
      { slug: "o-que-e-landing-page", title: "O que é landing page", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 2 },
      { slug: "lp-alta-conversao", title: "Landing pages de alta conversão", intent: "informational", funnel: "mofu", priority: 1, commercialValue: 4 },
      { slug: "criacao-de-lp", title: "Criação de landing page", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "lp-para-ads", title: "LP para Google Ads", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "quanto-custa-lp", title: "Quanto custa uma landing page", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
    ],
  },
  {
    slug: "ia",
    title: "IA para Empresas",
    description: "Aplicações práticas de inteligência artificial em negócios.",
    hubPath: "/blog/ia",
    pillarKeyword: "inteligência artificial para empresas",
    relatedServices: ["/ia", "/automacao"],
    subclusters: [
      { slug: "ia-para-empresas", title: "IA para empresas", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 4 },
      { slug: "agentes-ia-whatsapp", title: "Agentes de IA no WhatsApp", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "chatbots-com-ia", title: "Chatbots com IA", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "automacao-com-ia", title: "Automação com IA", intent: "commercial", funnel: "mofu", priority: 2, commercialValue: 4 },
      { slug: "consultoria-ia", title: "Consultoria em IA", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "quanto-custa-ia", title: "Quanto custa implantar IA", intent: "commercial", funnel: "bofu", priority: 2, commercialValue: 5 },
    ],
  },
  {
    slug: "trafego-pago",
    title: "Tráfego Pago",
    description: "Google Ads, Meta Ads e mídia de performance.",
    hubPath: "/blog/trafego-pago",
    pillarKeyword: "tráfego pago",
    relatedServices: ["/servicos/trafego-pago"],
    relatedCities: true,
    subclusters: [
      { slug: "o-que-e-trafego-pago", title: "O que é tráfego pago", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 3 },
      { slug: "google-ads-para-empresas", title: "Google Ads para empresas", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "meta-ads-instagram-facebook", title: "Meta Ads (Instagram/Facebook)", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "gestor-de-trafego", title: "Gestor de tráfego pago", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "agencia-de-trafego", title: "Agência de tráfego pago", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "quanto-custa-anunciar-google", title: "Quanto custa anunciar no Google", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "cpa-cpc-roas", title: "CPA, CPC, ROAS — métricas", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
    ],
  },
  {
    slug: "marketing-local",
    title: "Marketing Local",
    description: "Estratégias geo-targetadas para captar clientes próximos.",
    hubPath: "/blog/marketing-local",
    pillarKeyword: "marketing local",
    relatedServices: ["/seo", "/servicos/google-meu-negocio"],
    relatedCities: true,
    subclusters: [
      { slug: "marketing-para-pequenas-empresas", title: "Marketing para pequenas empresas", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 4 },
      { slug: "como-atrair-clientes-na-regiao", title: "Como atrair clientes na região", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 4 },
      { slug: "seo-local-cidades", title: "SEO local por cidade", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "agencia-marketing-local", title: "Agência de marketing local", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
    ],
  },
  {
    slug: "automacao",
    title: "Automação",
    description: "Workflows, integrações e ferramentas no-code/low-code.",
    hubPath: "/blog/automacao",
    pillarKeyword: "automação",
    relatedServices: ["/automacao"],
    subclusters: [
      { slug: "automacao-de-marketing", title: "Automação de marketing", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 4 },
      { slug: "automacao-whatsapp", title: "Automação de WhatsApp", intent: "commercial", funnel: "mofu", priority: 1, commercialValue: 5 },
      { slug: "n8n-make-zapier", title: "n8n x Make x Zapier", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "consultoria-automacao", title: "Consultoria em automação", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
    ],
  },
  {
    slug: "conversao",
    title: "Conversão",
    description: "CRO, otimização de funil e ciência da conversão.",
    hubPath: "/blog/conversao",
    pillarKeyword: "otimização de conversão",
    relatedServices: ["/criacao-sites", "/servicos/consultoria"],
    subclusters: [
      { slug: "o-que-e-cro", title: "O que é CRO", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 3 },
      { slug: "ab-testing", title: "Testes A/B", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "heatmaps-analytics", title: "Heatmaps e analytics", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "consultoria-cro", title: "Consultoria em CRO", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
    ],
  },
  {
    slug: "vendas",
    title: "Vendas e Leads",
    description: "Geração, qualificação e fechamento de leads B2B/B2C.",
    hubPath: "/blog/vendas",
    pillarKeyword: "geração de leads",
    relatedServices: ["/servicos/consultoria", "/servicos/trafego-pago"],
    subclusters: [
      { slug: "geracao-de-leads", title: "Geração de leads", intent: "informational", funnel: "tofu", priority: 1, commercialValue: 5 },
      { slug: "leads-qualificados", title: "Leads qualificados (MQL/SQL)", intent: "informational", funnel: "mofu", priority: 1, commercialValue: 4 },
      { slug: "funil-de-vendas", title: "Funil de vendas", intent: "informational", funnel: "mofu", priority: 2, commercialValue: 3 },
      { slug: "empresa-geracao-leads", title: "Empresa de geração de leads", intent: "transactional", funnel: "bofu", priority: 1, commercialValue: 5 },
      { slug: "quanto-custa-lead", title: "Quanto custa um lead", intent: "commercial", funnel: "bofu", priority: 1, commercialValue: 5 },
    ],
  },
];

export const THEMES: Theme[] = [
  { slug: "marketing-digital", title: "Marketing Digital", description: "Pilar mais amplo, abrange SEO, ads, conteúdo, conversão.", clusters: ["seo", "trafego-pago", "conversao", "marketing-local", "vendas"] },
  { slug: "tecnologia", title: "Tecnologia & Sites", description: "Construção e operação de ativos digitais.", clusters: ["sites", "landing-pages", "automacao"] },
  { slug: "inteligencia-artificial", title: "Inteligência Artificial", description: "IA aplicada a marketing e operação.", clusters: ["ia", "automacao"] },
  { slug: "local", title: "Negócio Local", description: "Captação de clientes próximos.", clusters: ["google-meu-negocio", "marketing-local", "seo"] },
];

// SEO commercial intent patterns
export const COMMERCIAL_PATTERNS = [
  "quanto custa",
  "empresa de",
  "agência de",
  "especialista em",
  "consultoria",
  "serviço de",
  "melhor",
  "como contratar",
];

export function findCluster(slug: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}

export function totalSubclusters(): number {
  return CLUSTERS.reduce((acc, c) => acc + c.subclusters.length, 0);
}

export function commercialSubclusters() {
  return CLUSTERS.flatMap((c) =>
    c.subclusters
      .filter((s) => s.intent === "commercial" || s.intent === "transactional")
      .map((s) => ({ cluster: c.slug, ...s })),
  );
}

// Related clusters (interlinking suggestions)
export const CLUSTER_RELATIONS: Record<string, string[]> = {
  seo: ["google-meu-negocio", "marketing-local", "conversao", "sites"],
  "google-meu-negocio": ["seo", "marketing-local", "vendas"],
  sites: ["landing-pages", "seo", "conversao"],
  "landing-pages": ["sites", "trafego-pago", "conversao"],
  ia: ["automacao", "vendas", "conversao"],
  "trafego-pago": ["landing-pages", "conversao", "vendas"],
  "marketing-local": ["seo", "google-meu-negocio", "trafego-pago"],
  automacao: ["ia", "vendas"],
  conversao: ["landing-pages", "trafego-pago", "sites"],
  vendas: ["trafego-pago", "ia", "conversao"],
};
