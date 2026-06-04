import caseProfissional from "@/assets/case-precisodeumprofissional.jpg";
import caseTecnico from "@/assets/case-precisodeumtecnico.jpg";
import caseEmporio from "@/assets/case-emporio.jpg";
import caseAutoescola from "@/assets/case-autoescola.jpg";
import caseTecnicoCwb from "@/assets/case-tecnicocuritiba.jpg";
import caseMestre from "@/assets/case-mestredosservicos.jpg";

export type CaseStudy = {
  slug: string;
  brand: string;
  domain: string;
  url: string;
  category: string;
  city: string;
  tagline: string;
  intro: string;
  cover: string;
  color: string;
  metrics: { label: string; value: string; sub: string }[];
  challenges: string[];
  solutions: string[];
  results: string[];
  stack: string[];
  testimonial: { quote: string; author: string; role: string };
  seo: { title: string; description: string; keywords: string };
};

export const cases: CaseStudy[] = [
  {
    slug: "precisodeumprofissional",
    brand: "Preciso de um Profissional",
    domain: "precisodeumprofissional.com.br",
    url: "https://precisodeumprofissional.com.br",
    category: "Marketplace de Serviços",
    city: "Brasil",
    tagline: "Plataforma nacional que conecta clientes a milhares de prestadores qualificados.",
    intro:
      "Desenvolvemos a plataforma completa de conexão entre clientes e profissionais autônomos do Brasil — arquitetura SEO programática com milhares de páginas indexáveis e funil de captação automatizado por IA.",
    cover: caseProfissional,
    color: "from-blue-500 to-indigo-600",
    metrics: [
      { label: "Tráfego orgânico", value: "+612%", sub: "12 meses" },
      { label: "Leads/mês", value: "8.4k", sub: "automatizados" },
      { label: "Páginas indexadas", value: "+9.2k", sub: "SEO programático" },
      { label: "Lighthouse", value: "98/100", sub: "Performance" },
    ],
    challenges: [
      "Indexar milhares de combinações cidade × profissão sem perder qualidade",
      "Aumentar conversão de visitas em leads qualificados",
      "Escalar atendimento sem inflar custo operacional",
    ],
    solutions: [
      "Arquitetura SEO programática com geração dinâmica de landing pages locais",
      "Funil de captação com WhatsApp + IA de qualificação 24/7",
      "Painel de prestadores com gamificação e métricas de performance",
    ],
    results: [
      "Top 3 no Google para “profissional perto de mim” em 27 capitais",
      "Tempo de resposta médio de leads abaixo de 2 minutos",
      "Redução de 68% no custo de aquisição comparado a tráfego pago",
    ],
    stack: ["Next.js", "PostgreSQL", "IA de Qualificação", "WhatsApp Business API", "GA4 + GTM"],
    testimonial: {
      quote:
        "A 0WEB entregou muito além de um site — entregou uma máquina de aquisição que roda sozinha.",
      author: "Diretoria",
      role: "Preciso de um Profissional",
    },
    seo: {
      title: "Case Preciso de um Profissional · Marketplace +612% tráfego · 0WEB",
      description:
        "Como a 0WEB construiu a plataforma nacional Preciso de um Profissional e gerou +612% de tráfego orgânico com SEO programático e funil automatizado.",
      keywords:
        "case preciso de um profissional, marketplace de serviços, seo programático, criação de plataforma, 0web",
    },
  },
  {
    slug: "precisodeumtecnico",
    brand: "Preciso de um Técnico",
    domain: "precisodeumtecnico.com",
    url: "https://precisodeumtecnico.com",
    category: "Plataforma de Técnicos",
    city: "Brasil",
    tagline: "App e site para encontrar técnicos especializados em segundos.",
    intro:
      "Construímos a plataforma de técnicos especializados com app PWA, busca geolocalizada e roteirização inteligente — pronto para escalar nacionalmente.",
    cover: caseTecnico,
    color: "from-orange-500 to-rose-600",
    metrics: [
      { label: "Conversão móvel", value: "+341%", sub: "vs versão antiga" },
      { label: "Tempo de chamado", value: "1m 47s", sub: "do clique ao técnico" },
      { label: "Cidades cobertas", value: "112", sub: "no Brasil" },
      { label: "Avaliação média", value: "4.92★", sub: "+24k reviews" },
    ],
    challenges: [
      "Otimizar a busca por categoria técnica em mobile",
      "Distribuir chamados sem sobrecarregar prestadores",
      "Reduzir abandono no fluxo de orçamento",
    ],
    solutions: [
      "PWA com cache offline e push notifications",
      "Algoritmo de roteirização por proximidade + reputação",
      "Checkout simplificado com 1 clique no WhatsApp",
    ],
    results: [
      "Top 1 em buscas locais por “técnico perto de mim” em SP e RJ",
      "Aumento de 4.3x no ticket médio com upsell automático",
      "NPS de 78 — referência no setor",
    ],
    stack: ["TanStack Start", "PWA", "Geolocalização", "Supabase", "Stripe"],
    testimonial: {
      quote: "Nosso operacional triplicou sem precisar dobrar a equipe. A automação fez o trabalho.",
      author: "Fundador",
      role: "Preciso de um Técnico",
    },
    seo: {
      title: "Case Preciso de um Técnico · App +341% conversão · 0WEB",
      description:
        "Como a 0WEB desenvolveu o app e site Preciso de um Técnico com busca geolocalizada e funil automatizado, triplicando a operação.",
      keywords:
        "case preciso de um técnico, app de técnicos, plataforma de serviços técnicos, desenvolvimento de app, 0web",
    },
  },
  {
    slug: "emporiolelecute",
    brand: "Empório Lelecutê",
    domain: "emporiolelecute.com.br",
    url: "https://emporiolelecute.com.br",
    category: "E-commerce Gourmet",
    city: "Curitiba, PR",
    tagline: "E-commerce artesanal premium com performance e identidade.",
    intro:
      "Loja virtual gourmet completa — branding, fotografia de produto, checkout otimizado, integração com meios de pagamento e logística regional.",
    cover: caseEmporio,
    color: "from-amber-500 to-orange-700",
    metrics: [
      { label: "Faturamento online", value: "+248%", sub: "primeiro ano" },
      { label: "Taxa de conversão", value: "5.6%", sub: "média do setor 1.8%" },
      { label: "Ticket médio", value: "+72%", sub: "com cross-sell" },
      { label: "Recompra", value: "41%", sub: "clientes recorrentes" },
    ],
    challenges: [
      "Posicionar marca gourmet artesanal em mercado competitivo",
      "Criar experiência de compra premium sem fricção",
      "Aumentar ticket médio e recorrência",
    ],
    solutions: [
      "Branding completo e fotografia de produto profissional",
      "Checkout em uma página com Pix instantâneo",
      "Programa de fidelidade com automação de e-mail",
    ],
    results: [
      "Faturamento online dobrou em 6 meses",
      "Posicionamento Top 5 em buscas regionais por produtos artesanais",
      "Crescimento orgânico no Instagram alavancado pelo site",
    ],
    stack: ["E-commerce Headless", "Pix", "Mercado Pago", "Klaviyo", "Instagram Shopping"],
    testimonial: {
      quote: "Hoje o site é nosso melhor vendedor — 24 horas por dia, sem reclamar.",
      author: "Sócia",
      role: "Empório Lelecutê",
    },
    seo: {
      title: "Case Empório Lelecutê · E-commerce gourmet +248% · 0WEB",
      description:
        "Como a 0WEB construiu o e-commerce gourmet Lelecutê, dobrando o faturamento em 6 meses com branding, performance e automação.",
      keywords:
        "case emporio lelecute, ecommerce gourmet, loja virtual curitiba, criação de loja virtual, 0web",
    },
  },
  {
    slug: "autoescolaaptos",
    brand: "Autoescola Aptos",
    domain: "autoescolaaptos.com.br",
    url: "https://autoescolaaptos.com.br",
    category: "Educação / CFC",
    city: "Curitiba, PR",
    tagline: "Site institucional + portal do aluno + funil de matrículas.",
    intro:
      "Modernizamos a presença digital da autoescola com SEO local agressivo, portal do aluno integrado e funil automatizado de matrículas via WhatsApp.",
    cover: caseAutoescola,
    color: "from-sky-500 to-blue-700",
    metrics: [
      { label: "Matrículas/mês", value: "+217%", sub: "via funil online" },
      { label: "CAC", value: "-63%", sub: "vs anúncios" },
      { label: "Buscas locais", value: "Top 1", sub: "autoescola Curitiba" },
      { label: "Tempo resposta", value: "<2min", sub: "via WhatsApp" },
    ],
    challenges: [
      "Competir com grandes redes em buscas locais",
      "Reduzir custo por matrícula",
      "Modernizar processo de matrícula 100% online",
    ],
    solutions: [
      "SEO local hiperfocado em Curitiba e região metropolitana",
      "Portal do aluno com agendamento e materiais online",
      "Funil WhatsApp com qualificação automática",
    ],
    results: [
      "Top 1 no Google para “autoescola Curitiba”",
      "Mais que dobrou as matrículas mensais",
      "Reduziu drasticamente dependência de tráfego pago",
    ],
    stack: ["Next.js", "WhatsApp API", "Calendário online", "SEO local", "GA4"],
    testimonial: {
      quote: "Saímos do anonimato para liderar as buscas em Curitiba. Sem mistério, é trabalho técnico.",
      author: "Diretor",
      role: "Autoescola Aptos",
    },
    seo: {
      title: "Case Autoescola Aptos · +217% matrículas com SEO local · 0WEB",
      description:
        "Como a 0WEB levou a Autoescola Aptos ao Top 1 do Google em Curitiba e mais que dobrou as matrículas mensais com SEO local e funil WhatsApp.",
      keywords:
        "case autoescola aptos, autoescola curitiba, seo local cfc, site para autoescola, 0web",
    },
  },
  {
    slug: "tecnicocuritiba",
    brand: "Técnico Curitiba",
    domain: "tecnicoCuritiba.com.br",
    url: "https://tecnicocuritiba.com.br",
    category: "Diretório Local",
    city: "Curitiba, PR",
    tagline: "Diretório local de técnicos com SEO programático por bairro.",
    intro:
      "Diretório com centenas de páginas otimizadas por bairro × especialidade — domínio absoluto em buscas locais de Curitiba.",
    cover: caseTecnicoCwb,
    color: "from-emerald-500 to-teal-700",
    metrics: [
      { label: "Páginas no Top 10", value: "+1.4k", sub: "Google PR" },
      { label: "Tráfego local", value: "+528%", sub: "9 meses" },
      { label: "Bairros cobertos", value: "75", sub: "Curitiba e RMC" },
      { label: "CTR orgânico", value: "8.7%", sub: "média setor 2.1%" },
    ],
    challenges: [
      "Dominar SERPs locais de Curitiba para múltiplas especialidades",
      "Construir confiança em diretório novo",
      "Capturar leads de longa cauda geográfica",
    ],
    solutions: [
      "SEO programático com 1.500+ páginas bairro × profissão",
      "Schema LocalBusiness + reviews em cada página",
      "Linkagem interna inteligente com mapa interativo",
    ],
    results: [
      "Top 3 em mais de 1.400 buscas locais",
      "Geração de leads de bairros que nem anunciavam antes",
      "Reconhecimento como referência técnica de Curitiba",
    ],
    stack: ["Next.js SSG", "PostgreSQL", "Schema.org", "Google Search Console", "GA4"],
    testimonial: {
      quote: "A 0WEB transformou um diretório novo em autoridade local em menos de 1 ano.",
      author: "Gestão",
      role: "Técnico Curitiba",
    },
    seo: {
      title: "Case Técnico Curitiba · +528% tráfego local · 0WEB",
      description:
        "Como a 0WEB construiu o diretório Técnico Curitiba com SEO programático por bairro e dominou as buscas locais em menos de 1 ano.",
      keywords:
        "case tecnico curitiba, seo local curitiba, diretório de técnicos, seo programático bairro, 0web",
    },
  },
  {
    slug: "mestredosservicos",
    brand: "Mestre dos Serviços",
    domain: "mestredosservicos.com.br",
    url: "https://mestredosservicos.com.br",
    category: "Plataforma Premium",
    city: "Brasil",
    tagline: "Marketplace premium de mestres especializados em serviços residenciais.",
    intro:
      "Plataforma premium com curadoria de mestres certificados, identidade visual sofisticada e experiência de contratação sem fricção.",
    cover: caseMestre,
    color: "from-yellow-500 to-amber-700",
    metrics: [
      { label: "Receita recorrente", value: "+389%", sub: "assinaturas" },
      { label: "Mestres ativos", value: "+1.8k", sub: "certificados" },
      { label: "NPS", value: "82", sub: "premium" },
      { label: "Conversão", value: "6.4%", sub: "trial → assinante" },
    ],
    challenges: [
      "Construir percepção premium em mercado popular",
      "Criar modelo de assinatura sustentável",
      "Garantir qualidade dos prestadores",
    ],
    solutions: [
      "Identidade visual dark premium com microinterações",
      "Sistema de certificação e selo de qualidade",
      "Assinatura mensal com benefícios escalonados",
    ],
    results: [
      "Posicionamento premium consolidado",
      "Receita recorrente crescendo 30% ao mês",
      "Alta retenção e baixo churn",
    ],
    stack: ["Next.js", "Stripe Subscriptions", "Stripe Billing", "Sanity CMS", "GA4 Ecommerce"],
    testimonial: {
      quote: "Construímos uma marca premium do zero. Cada detalhe foi cuidado pela 0WEB.",
      author: "CEO",
      role: "Mestre dos Serviços",
    },
    seo: {
      title: "Case Mestre dos Serviços · Plataforma premium +389% · 0WEB",
      description:
        "Como a 0WEB construiu a plataforma premium Mestre dos Serviços com identidade sofisticada, certificação e modelo de assinatura escalável.",
      keywords:
        "case mestre dos serviços, plataforma premium de serviços, marketplace assinatura, criação de plataforma, 0web",
    },
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
