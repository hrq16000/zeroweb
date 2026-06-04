export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string;
};

export const categories = [
  "Marketing Digital",
  "SEO",
  "Sites",
  "Inteligência Artificial",
  "Automação",
  "Tecnologia",
  "Negócios",
];

export const posts: BlogPost[] = [
  {
    slug: "como-rankear-no-google-em-2026",
    title: "Como rankear no Google em 2026 sem truques",
    excerpt:
      "O que realmente move o ranking hoje: intenção de busca, autoridade tópica e Core Web Vitals.",
    category: "SEO",
    date: "2026-05-12",
    readTime: "8 min",
    content:
      "Rankear no Google em 2026 é menos sobre palavras-chave e mais sobre resolver a intenção do usuário com autoridade real. Comece estruturando seu site por temas (topic clusters), entregando respostas profundas e mantendo Core Web Vitals em verde. Conteúdo superficial perdeu espaço — o algoritmo identifica respostas completas, citações e experiência prática.",
  },
  {
    slug: "agentes-de-ia-no-whatsapp",
    title: "Agentes de IA no WhatsApp: do hype ao ROI",
    excerpt:
      "Como tirar agentes de IA do experimento e levar para um ROI mensurável no atendimento.",
    category: "Inteligência Artificial",
    date: "2026-05-02",
    readTime: "6 min",
    content:
      "Um agente de IA no WhatsApp só gera ROI quando é treinado no contexto do seu negócio, integrado a um CRM e tem regras claras de escalonamento para humanos. Comece mapeando os 10 motivos de contato mais frequentes, automatize os 5 mais simples e meça tempo de resposta, taxa de resolução e leads qualificados.",
  },
  {
    slug: "trafego-pago-vs-organico",
    title: "Tráfego pago x orgânico: onde investir primeiro",
    excerpt: "Quando começar com Ads, quando dobrar em SEO e como combinar os dois sem desperdício.",
    category: "Marketing Digital",
    date: "2026-04-20",
    readTime: "5 min",
    content:
      "Tráfego pago entrega velocidade, tráfego orgânico entrega composição. Empresas em fase de validação devem começar por Ads para aprender rápido, e ativar SEO em paralelo para colher os ganhos compostos a partir do 4º mês. Quem ignora um dos dois deixa CAC subir ou crescimento estagnar.",
  },
  {
    slug: "core-web-vitals-o-que-mudou",
    title: "Core Web Vitals: o que mudou e como passar",
    excerpt: "INP, LCP e CLS na prática — checklist técnico para passar nas métricas do Google.",
    category: "Sites",
    date: "2026-04-08",
    readTime: "7 min",
    content:
      "A substituição do FID pelo INP elevou a régua de interatividade. Para passar: reduza JavaScript no carregamento inicial, use SSR/SSG quando possível, comprima imagens com AVIF/WebP, reserve espaço para mídia (sem layout shift) e priorize fontes locais com display swap.",
  },
  {
    slug: "automatize-captacao-de-leads",
    title: "Automatize a captação de leads com n8n + IA",
    excerpt: "Fluxo passo a passo para captar, enriquecer e qualificar leads sem intervenção manual.",
    category: "Automação",
    date: "2026-03-28",
    readTime: "9 min",
    content:
      "Um fluxo simples: formulário → webhook n8n → enriquecimento via Clearbit/Apollo → roteamento por score → resposta automática por IA → criação de oportunidade no CRM. O segredo é manter cada etapa observável: logs, retries e fallbacks por canal.",
  },
  {
    slug: "transformacao-digital-pme-2026",
    title: "Transformação digital para PMEs em 2026",
    excerpt: "Um roteiro pragmático para PMEs digitalizarem operações sem queimar caixa.",
    category: "Negócios",
    date: "2026-03-15",
    readTime: "6 min",
    content:
      "Comece pela jornada do cliente, não pela tecnologia. Mapeie pontos de atrito, escolha 1 processo de alto impacto, automatize, meça e só então expanda. Tentar digitalizar tudo de uma vez é a forma mais cara de não digitalizar nada.",
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
