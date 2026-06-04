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
    slug: "google-meu-negocio-como-aparecer-no-google",
    title: "Sua empresa NÃO aparece no Google? Veja como mudar isso em 2026",
    excerpt:
      "Enquanto seus concorrentes recebem clientes todos os dias pelo Google Maps, quem não está otimizado fica invisível. Veja o passo a passo para virar o jogo.",
    category: "Marketing Digital",
    date: "2026-06-04",
    readTime: "10 min",
    content:
      "🚨 Sua empresa NÃO aparece no Google? Então provavelmente seus concorrentes estão recebendo clientes que poderiam ser seus TODOS OS DIAS.\n\nHoje, quando alguém procura por empresas do seu segmento, o Google mostra primeiro quem está bem posicionado no Maps. Se a sua empresa não estiver otimizada, você simplesmente fica invisível — e cada clique que vai para o concorrente é uma venda perdida.\n\n## Por que o Google Meu Negócio é decisivo\n\nO Google Maps virou a nova vitrine local. Mais de 75% das pessoas que pesquisam por um serviço próximo entram em contato com a empresa nas primeiras 24 horas. Sem perfil otimizado, sua empresa não entra nessa disputa.\n\n## O que a 0WEB Marketing Digital faz pela sua empresa\n\nA 0WEB configura e otimiza seu Google Meu Negócio de ponta a ponta:\n\n- ✅ Aparecer no Google\n- ✅ Ganhar mais visibilidade\n- ✅ Receber mensagens no WhatsApp\n- ✅ Transmitir mais confiança\n- ✅ Atrair novos clientes diariamente\n\n## Passo a passo do que entregamos\n\n1. Reivindicação ou criação do perfil oficial.\n2. Categorização correta e áreas de atuação otimizadas.\n3. Fotos profissionais, horários, atributos e descrição persuasiva.\n4. Integração com WhatsApp para receber leads quentes.\n5. Postagens estratégicas e resposta a avaliações (Plano PRO).\n6. Relatórios mensais com cliques, ligações e direções (Plano PRO).\n\n## 🔥 Oferta de lançamento para os 10 primeiros clientes\n\n- ✔ Plano Único: R$397 (configuração completa)\n- ✔ Plano PRO: R$247/mês por 3 meses (tempo mínimo) — otimização contínua, postagens e relatórios\n\n## Mais visibilidade. Mais confiança. Mais clientes.\n\nConectamos sua empresa a mais clientes todos os dias.\n\n📲 Clique em “Saiba Mais” e fale conosco no WhatsApp.",
  },
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
