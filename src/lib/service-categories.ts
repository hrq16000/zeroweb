/**
 * Hubs de categoria da loja (/servicos/categoria/$slug).
 * Fonte única: mapeia slug SEO → categoria do banco (services.category)
 * + copy própria para ranquear termos comerciais.
 */
export type ServiceCategoryHub = {
  slug: string;
  /** Valores aceitos em services.category (case-insensitive). */
  match: string[];
  name: string;
  title: string;
  description: string;
  intro: string;
  h2: { title: string; body: string }[];
};

export const SERVICE_CATEGORY_HUBS: ServiceCategoryHub[] = [
  {
    slug: "seo",
    match: ["seo", "conteudo", "conversão", "conversao"],
    name: "SEO e Conteúdo",
    title: "Serviços de SEO: otimização, conteúdo e ranqueamento no Google",
    description:
      "Serviços de SEO técnico, conteúdo e otimização para colocar seu site nas primeiras posições do Google. Preços transparentes e orçamento sem burocracia.",
    intro:
      "SEO é o canal que entrega clientes todos os dias sem custo por clique. Nossos serviços cobrem a base técnica (velocidade, indexação, dados estruturados), o conteúdo que responde à intenção de busca e a otimização contínua de conversão.",
    h2: [
      {
        title: "SEO técnico: a base que o Google precisa entender",
        body: "Core Web Vitals, indexação limpa, canônicas corretas, sitemaps segmentados e Schema.org. Sem essa base, conteúdo bom não ranqueia.",
      },
      {
        title: "Conteúdo com intenção comercial",
        body: "Trabalhamos termos com dinheiro na ponta — 'preço', 'orçamento', 'perto de mim', 'urgente' — em páginas que respondem rápido e convertem.",
      },
      {
        title: "Otimização de conversão",
        body: "Ranquear não basta: cada página tem CTA claro, prova social e caminho direto para o atendimento.",
      },
    ],
  },
  {
    slug: "ia",
    match: ["ia", "sistemas"],
    name: "Inteligência Artificial",
    title: "Serviços de Inteligência Artificial para empresas | 0WEB",
    description:
      "Chatbots, atendimento automatizado e sistemas com IA aplicados ao seu negócio. Implantação rápida, integração com WhatsApp e resultado medido.",
    intro:
      "IA aplicada a negócio não é experimento: é atendimento 24h, qualificação automática de leads e processos internos que deixam de consumir horas da equipe.",
    h2: [
      {
        title: "Atendimento com IA no WhatsApp",
        body: "Responde dúvidas, qualifica o lead e entrega a conversa pronta para o time comercial.",
      },
      {
        title: "Sistemas sob medida com IA embarcada",
        body: "Painéis, integrações e automações que usam IA onde ela realmente reduz custo.",
      },
      {
        title: "Implantação em semanas, não meses",
        body: "Escopo fechado, entrega por blocos e medição de impacto desde o primeiro mês.",
      },
    ],
  },
  {
    slug: "automacao",
    match: ["automação", "automacao", "marketplace", "e-commerce"],
    name: "Automação e Integrações",
    title: "Automação de processos e integrações para empresas | 0WEB",
    description:
      "Automatize orçamentos, follow-up, pedidos e integrações entre sistemas. Menos trabalho manual, mais vendas fechadas.",
    intro:
      "Cada tarefa repetida à mão é margem indo embora. Automatizamos captação, follow-up, pedidos e integrações entre as ferramentas que a empresa já usa.",
    h2: [
      {
        title: "Funis e follow-up automáticos",
        body: "Lead entra, é qualificado e recebe resposta na hora — sem depender de alguém estar online.",
      },
      {
        title: "Integrações entre sistemas",
        body: "Site, CRM, ERP, marketplaces e WhatsApp falando a mesma língua.",
      },
      {
        title: "E-commerce e marketplaces",
        body: "Catálogo, pedidos e atendimento integrados em um fluxo só.",
      },
    ],
  },
  {
    slug: "trafego-pago",
    match: ["tráfego", "trafego", "marketing", "local", "midia", "mídia"],
    name: "Tráfego Pago e Mídia",
    title: "Gestão de tráfego pago: Google Ads e Meta Ads | 0WEB",
    description:
      "Gestão de Google Ads e Meta Ads com foco em custo por lead. Campanhas, criativos e páginas otimizadas para converter.",
    intro:
      "Tráfego pago traz demanda imediata. Cuidamos da campanha, do criativo e da página de destino — porque anúncio bom em página ruim só queima verba.",
    h2: [
      {
        title: "Google Ads para intenção de compra",
        body: "Quem pesquisa está pronto para contratar. Estruturamos campanhas por termo comercial e região.",
      },
      {
        title: "Meta Ads para demanda e remarketing",
        body: "Alcance novo público e recupere quem já visitou o site.",
      },
      {
        title: "Página de destino que converte",
        body: "Carregamento rápido, prova social e atendimento em um clique.",
      },
    ],
  },
  {
    slug: "criacao-de-sites",
    match: ["web", "branding", "social", "consultoria", "parceria"],
    name: "Criação de Sites e Presença Digital",
    title: "Criação de sites profissionais e presença digital | 0WEB",
    description:
      "Sites rápidos, otimizados para anúncios e prontos para ranquear. Do site express ao projeto sob medida, com SEO técnico incluso.",
    intro:
      "Seu site é o ativo que trabalha 24h. Entregamos páginas rápidas, indexáveis e com caminho de conversão claro — do modelo express ao projeto sob medida.",
    h2: [
      {
        title: "Sites rápidos e indexáveis",
        body: "Performance é ranqueamento e é conversão. Entregamos com Core Web Vitals no verde.",
      },
      {
        title: "Estrutura pensada para conversão",
        body: "CTA acima da dobra, prova social e atendimento direto pelo WhatsApp.",
      },
      {
        title: "Identidade e presença completa",
        body: "Branding, redes sociais e Google Meu Negócio alinhados ao site.",
      },
    ],
  },
];

export function findServiceCategoryHub(slug: string): ServiceCategoryHub | undefined {
  return SERVICE_CATEGORY_HUBS.find((c) => c.slug === slug);
}

export function matchesCategory(hub: ServiceCategoryHub, category: string): boolean {
  const c = (category || "").trim().toLowerCase();
  return hub.match.includes(c);
}
