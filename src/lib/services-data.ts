// ============================================================================
// Sprint 5 — Rich service catalogue.
// Single source of truth for services. Drives /$service, /$city/$service,
// the services hub and interlinking. Add a service → page + sitemap entry
// + interlinks pick it up automatically.
// ============================================================================

export type ServiceCategory =
  | "Web"
  | "Conversão"
  | "E-commerce"
  | "SEO"
  | "Tráfego"
  | "IA"
  | "Sistemas"
  | "Social"
  | "Branding"
  | "Conteudo"
  | "Midia";

export type ServiceData = {
  slug: string;
  name: string;
  category: ServiceCategory;
  title: string;            // full <title>
  h1: string;
  description: string;      // meta description
  serviceType: string;      // schema.org Service.serviceType
  problems: string[];       // 4-6 problem statements (city-agnostic)
  benefits: string[];       // 4-6 outcomes
  process: { step: string; desc: string }[];
  faq: { q: string; a: string }[];
  keywords: string[];
  ctaLabel: string;
};

export const SERVICES: Record<string, ServiceData> = {
  "criacao-de-sites": {
    slug: "criacao-de-sites",
    name: "Criação de Sites",
    category: "Web",
    title: "Criação de Sites Profissionais · 0WEB",
    h1: "Criação de sites que vendem",
    description:
      "Sites institucionais rápidos, modernos e otimizados para Google. Conversão acima da média do mercado.",
    serviceType: "Web Design",
    problems: [
      "Site lento, desatualizado ou difícil de editar",
      "Aparece mal no celular e perde clientes",
      "Não converte visitas em contatos",
      "Sem segurança, sem backup, sem suporte",
    ],
    benefits: [
      "Design premium e identidade forte",
      "Performance 95+ no Lighthouse",
      "SEO técnico embutido desde o dia 1",
      "Painel simples para o cliente editar",
      "Hospedagem, SSL e backup inclusos",
    ],
    process: [
      { step: "Diagnóstico", desc: "Briefing, benchmarking e arquitetura de informação" },
      { step: "Design", desc: "UI/UX premium aprovada antes de codar" },
      { step: "Desenvolvimento", desc: "Código limpo, responsivo e performático" },
      { step: "Lançamento", desc: "Deploy, SEO técnico, analytics e treinamento" },
    ],
    faq: [
      { q: "Em quanto tempo o site fica pronto?", a: "Sites institucionais ficam prontos em 15 a 30 dias, dependendo do escopo aprovado." },
      { q: "Posso editar o site depois?", a: "Sim. Entregamos um painel simples para você atualizar textos, imagens e seções sem depender de programador." },
      { q: "Hospedagem está inclusa?", a: "Sim. Cuidamos de hospedagem, SSL, backup e monitoramento durante todo o contrato." },
      { q: "Vocês fazem SEO no site?", a: "Sim. SEO técnico, semântico e on-page já vem embutido em toda entrega." },
    ],
    keywords: ["criação de sites", "desenvolvimento de sites", "agência de sites", "site profissional"],
    ctaLabel: "Quero meu site",
  },
  "landing-pages": {
    slug: "landing-pages",
    name: "Landing Pages",
    category: "Conversão",
    title: "Landing Pages de Alta Conversão · 0WEB",
    h1: "Landing pages que convertem visitantes em clientes",
    description:
      "Páginas focadas em conversão para Google Ads e Meta Ads. Taxa de conversão até 4x maior.",
    serviceType: "Conversion Rate Optimization",
    problems: [
      "Investimento em mídia paga sem retorno",
      "Taxa de conversão abaixo de 1%",
      "Sem tracking, sem dados, sem decisão",
      "Página confusa, sem foco em uma ação",
    ],
    benefits: [
      "Estrutura validada por CRO",
      "Integração direta com Ads e CRM",
      "A/B testing nativo",
      "Tracking completo (GA4 + Pixel + GTM)",
      "Entrega em 7 dias úteis",
    ],
    process: [
      { step: "Estratégia", desc: "Persona, oferta e proposta única de valor" },
      { step: "Copy + Design", desc: "Headline, prova social, oferta e CTA" },
      { step: "Build", desc: "Página rápida, mobile-first, integrada" },
      { step: "Otimização", desc: "A/B testing, heatmap e melhoria contínua" },
    ],
    faq: [
      { q: "Em quanto tempo entregam?", a: "7 dias úteis para a primeira versão pronta para tráfego." },
      { q: "Vocês cuidam dos anúncios também?", a: "Sim, oferecemos pacote integrado de landing page + gestão de Ads." },
      { q: "Tem teste A/B?", a: "Sim. Implementamos variações e medimos conversão para decidir o vencedor." },
      { q: "Funciona em mobile?", a: "Todas as páginas são mobile-first e otimizadas para o tráfego pago." },
    ],
    keywords: ["landing page", "página de conversão", "página de vendas", "CRO"],
    ctaLabel: "Quero minha landing page",
  },
  "loja-virtual": {
    slug: "loja-virtual",
    name: "Loja Virtual",
    category: "E-commerce",
    title: "E-commerce e Lojas Virtuais · 0WEB",
    h1: "Lojas virtuais prontas para escalar",
    description:
      "E-commerce de alta performance integrado a meios de pagamento, frete e marketing.",
    serviceType: "E-commerce Development",
    problems: [
      "Loja lenta e com checkout abandonado",
      "Sem integração com pagamentos e frete",
      "Falta de SEO de produto e categoria",
      "Operação manual sem automação de marketing",
    ],
    benefits: [
      "Checkout otimizado para conversão",
      "Pagamentos (Pix, cartão, boleto) integrados",
      "Painel admin completo",
      "Recuperação de carrinho automática",
      "SEO de produto e categoria nativo",
    ],
    process: [
      { step: "Catálogo", desc: "Estruturação de categorias, atributos e SEO" },
      { step: "Plataforma", desc: "Setup Shopify / WooCommerce / custom" },
      { step: "Pagamentos", desc: "Integração com gateways e antifraude" },
      { step: "Tráfego", desc: "Google Shopping, Meta Ads e SEO programático" },
    ],
    faq: [
      { q: "Qual plataforma vocês usam?", a: "Shopify, WooCommerce ou desenvolvimento sob medida, conforme o projeto." },
      { q: "Vocês integram com ERP?", a: "Sim. Integramos com Bling, Tiny, Omie e ERPs próprios via API." },
      { q: "Como funciona o frete?", a: "Integramos com Correios, Melhor Envio e transportadoras direto." },
      { q: "Vocês fazem o marketing?", a: "Sim, pacotes integrados de Ads, SEO e e-mail marketing." },
    ],
    keywords: ["loja virtual", "e-commerce", "criação de loja online", "shopify", "woocommerce"],
    ctaLabel: "Quero minha loja virtual",
  },
  seo: {
    slug: "seo",
    name: "SEO",
    category: "SEO",
    title: "SEO Técnico e Estratégico · 0WEB",
    h1: "SEO Estratégico que Posiciona sua Empresa no Topo do Google",
    description:
      "SEO técnico, on-page e off-page executado por especialistas — com conteúdo, autoridade e Core Web Vitals otimizados para gerar tráfego orgânico que vende, mês após mês.",
    serviceType: "Search Engine Optimization",
    problems: [
      "Seu site não aparece nas buscas que realmente geram cliente",
      "Concorrentes mais fracos ranqueando à sua frente por terem SEO estruturado",
      "Conteúdo sem cluster, sem palavra-chave e sem autoridade travando o crescimento",
    ],
    benefits: [
      "Auditoria técnica completa (Core Web Vitals, indexação, schema)",
      "Estratégia de cluster de conteúdo baseada em intenção de busca real",
      "Conteúdo escrito por time editorial próprio com SEO embutido",
      "Link building white-hat com veículos e portais relevantes",
      "SEO local: Google Meu Negócio, citações e páginas geo-segmentadas",
      "Relatório mensal transparente: posições, tráfego, leads e ROI",
    ],
    process: [
      { step: "Auditoria", desc: "Técnica, on-page e de autoridade" },
      { step: "Estratégia", desc: "Cluster de conteúdo e roadmap" },
      { step: "Execução", desc: "Otimização técnica + conteúdo + links" },
      { step: "Mensuração", desc: "GSC, GA4, posicionamento e ROI" },
    ],
    faq: [
      { q: "Em quanto tempo vejo resultado em SEO?", a: "Primeiros ganhos de posição em 60-90 dias. SEO consistente e previsível a partir do 6º mês — quem promete top 1 em 30 dias está mentindo." },
      { q: "Vocês escrevem o conteúdo?", a: "Sim. Time editorial próprio com briefing SEO, revisão e otimização on-page antes de publicar." },
      { q: "Fazem SEO local para minha cidade?", a: "Sim. Otimização de Google Meu Negócio, páginas geo-targeted por cidade/bairro e citações locais." },
      { q: "Como medem o ROI de SEO?", a: "Tracking de leads orgânicos no GA4, valor de oportunidade por keyword e comparativo com CPA de mídia paga." },
      { q: "Se eu parar, perco tudo?", a: "Não. Diferente de mídia paga, os ativos (conteúdo, links, autoridade) continuam gerando tráfego. Mas concorrentes ativos podem ultrapassar com o tempo." },
    ],
    keywords: ["SEO", "otimização para google", "agência de SEO", "consultoria SEO"],
    ctaLabel: "Quero Aparecer no Google",
  },
  "marketing-digital": {
    slug: "marketing-digital",
    name: "Marketing Digital",
    category: "Tráfego",
    title: "Marketing Digital com ROI · 0WEB",
    h1: "Marketing digital que gera resultado",
    description:
      "Estratégia 360° de tráfego pago, orgânico, social media e automação focada em ROI.",
    serviceType: "Digital Marketing",
    problems: [
      "Investimento em mídia sem estratégia",
      "Falta de funil e atribuição",
      "Equipe interna sobrecarregada",
      "Sem clareza sobre custo por lead e LTV",
    ],
    benefits: [
      "Google Ads e Meta Ads geridos por especialistas",
      "Funil completo (TOFU/MOFU/BOFU)",
      "Atribuição multicanal",
      "Otimização semanal baseada em dados",
      "Relatórios executivos mensais",
    ],
    process: [
      { step: "Diagnóstico", desc: "Análise de funil, métricas e mercado" },
      { step: "Estratégia", desc: "Planejamento de mídia, criativos e oferta" },
      { step: "Execução", desc: "Setup, criativos, campanhas e tracking" },
      { step: "Otimização", desc: "Ajustes semanais e escalonamento" },
    ],
    faq: [
      { q: "Qual investimento mínimo recomendam?", a: "Mínimo de R$ 3.000/mês em mídia + fee para resultado consistente." },
      { q: "Vocês criam os criativos?", a: "Sim, design e copy fazem parte do pacote." },
      { q: "Trabalham com Google e Meta?", a: "Sim, somos certificados nos dois ecossistemas." },
      { q: "Como sei se está dando certo?", a: "Painel com CAC, ROAS e LTV atualizado em tempo real." },
    ],
    keywords: ["marketing digital", "tráfego pago", "google ads", "meta ads", "agência de performance"],
    ctaLabel: "Quero gerar mais leads",
  },
  "automacao-com-ia": {
    slug: "automacao-com-ia",
    name: "Automação com IA",
    category: "IA",
    title: "Automação com IA · 0WEB",
    h1: "Automações inteligentes que escalam sua operação",
    description:
      "Agentes de IA, integrações e workflows que economizam horas e aumentam vendas.",
    serviceType: "AI Automation",
    problems: [
      "Equipe sobrecarregada com tarefas repetitivas",
      "Leads esfriam antes do primeiro contato",
      "Sistemas isolados, dados em planilhas",
      "Falta de visão unificada do cliente",
    ],
    benefits: [
      "Agentes GPT customizados para seu negócio",
      "Integrações n8n / Make / Zapier",
      "Qualificação automática de leads",
      "Follow-up inteligente 24/7",
      "ROI mensurável em horas economizadas",
    ],
    process: [
      { step: "Mapeamento", desc: "Identificar processos manuais e gargalos" },
      { step: "Desenho", desc: "Workflow, integrações e prompts" },
      { step: "Implementação", desc: "Build, testes e ajustes" },
      { step: "Operação", desc: "Monitoramento, evolução e suporte" },
    ],
    faq: [
      { q: "Funciona com meu CRM?", a: "Sim. Integramos com HubSpot, Pipedrive, RD Station, Salesforce e CRMs próprios." },
      { q: "Os agentes substituem meu time?", a: "Não. Eles aumentam a capacidade do time e cuidam do operacional repetitivo." },
      { q: "É seguro?", a: "Sim. Dados criptografados, ambientes isolados e LGPD compliance." },
      { q: "Em quanto tempo implanta?", a: "MVPs em 2-4 semanas; automações completas em 30-60 dias." },
    ],
    keywords: ["automação", "automação com IA", "agentes de IA", "workflow", "n8n", "make"],
    ctaLabel: "Quero automatizar minha operação",
  },
  "chatbot-whatsapp": {
    slug: "chatbot-whatsapp",
    name: "Chatbot WhatsApp",
    category: "IA",
    title: "Chatbot WhatsApp com IA · 0WEB",
    h1: "Chatbot WhatsApp que vende 24/7",
    description:
      "Atendimento e vendas automatizadas no WhatsApp com Inteligência Artificial.",
    serviceType: "Conversational AI",
    problems: [
      "Leads parados na fila de atendimento",
      "Mensagens fora do horário sem resposta",
      "Atendentes ocupados com dúvidas básicas",
      "Sem histórico unificado por cliente",
    ],
    benefits: [
      "Resposta em segundos, 24h por dia",
      "Treinado com a base do seu negócio",
      "Integra com CRM, agendamento e pagamentos",
      "Multi-atendente com transferência automática",
      "Métricas e satisfação em tempo real",
    ],
    process: [
      { step: "Conhecimento", desc: "Treinar o bot com FAQ, política e tom de voz" },
      { step: "Integração", desc: "WhatsApp Business API + CRM + agenda" },
      { step: "Fluxos", desc: "Atendimento, qualificação, agendamento e venda" },
      { step: "Operação", desc: "Métricas, aprendizado contínuo e ajustes" },
    ],
    faq: [
      { q: "Precisa do WhatsApp Business API?", a: "Sim, configuramos a API oficial Meta para você." },
      { q: "Atende fora do horário comercial?", a: "Sim, o bot atende 24/7 e escala para humano quando preciso." },
      { q: "Integra com meu sistema?", a: "Sim, com CRM, ERP, agenda, pagamentos e sistemas próprios via API." },
      { q: "Quanto custa?", a: "Setup + mensalidade. Avaliamos no diagnóstico gratuito." },
    ],
    keywords: ["chatbot whatsapp", "atendimento whatsapp", "bot whatsapp", "whatsapp business"],
    ctaLabel: "Quero meu chatbot",
  },
  "desenvolvimento-saas": {
    slug: "desenvolvimento-saas",
    name: "Desenvolvimento de SaaS",
    category: "Sistemas",
    title: "Desenvolvimento de SaaS · 0WEB",
    h1: "Desenvolvemos seu SaaS do MVP ao scale",
    description: "Arquitetura moderna, escalável e segura para produtos SaaS B2B e B2C.",
    serviceType: "Software Development",
    problems: [
      "Validar uma ideia sem estourar orçamento",
      "Escalar produto que cresceu além do MVP",
      "Multi-tenancy, billing e onboarding mal resolvidos",
      "Stack legada travando a evolução",
    ],
    benefits: [
      "Next.js + TypeScript + arquitetura moderna",
      "Multi-tenant com isolamento por workspace",
      "Billing integrado (Stripe / Paddle)",
      "Painel admin e analytics nativos",
      "Suporte contínuo e evolução incremental",
    ],
    process: [
      { step: "Discovery", desc: "Validação de hipóteses e escopo do MVP" },
      { step: "MVP", desc: "Build enxuto, focado no core" },
      { step: "Go-to-market", desc: "Onboarding, billing e métricas" },
      { step: "Scale", desc: "Performance, novos módulos e expansão" },
    ],
    faq: [
      { q: "Quanto tempo até o MVP?", a: "Entre 8 e 16 semanas para a primeira versão utilizável." },
      { q: "Quem é dono do código?", a: "Você. Entregamos repositório e infraestrutura no seu nome." },
      { q: "Vocês operam pós-lançamento?", a: "Sim. Squad dedicado com SLA e roadmap mensal." },
      { q: "Qual stack usam?", a: "Next.js, TypeScript, PostgreSQL, Supabase, Stripe e Cloudflare." },
    ],
    keywords: ["desenvolvimento de saas", "criar saas", "agência saas", "mvp saas"],
    ctaLabel: "Quero desenvolver meu SaaS",
  },
  "sistemas-web": {
    slug: "sistemas-web",
    name: "Sistemas Web",
    category: "Sistemas",
    title: "Sistemas Web Sob Medida · 0WEB",
    h1: "Sistemas web sob medida para sua operação",
    description: "ERP, CRM, ordens de serviço, agendamento e dashboards customizados.",
    serviceType: "Custom Software Development",
    problems: [
      "Planilhas controlando o que deveria ser sistema",
      "Time perdendo horas com retrabalho",
      "Falta de visibilidade gerencial",
      "Software de prateleira engessando o negócio",
    ],
    benefits: [
      "Análise profunda dos processos atuais",
      "Stack moderna, segura e escalável",
      "Treinamento e adoção pela equipe",
      "Hospedagem dedicada e backup",
      "Evolução contínua conforme o negócio",
    ],
    process: [
      { step: "Mapeamento", desc: "Entrevistas, BPMN e priorização" },
      { step: "Protótipo", desc: "Telas navegáveis aprovadas antes de codar" },
      { step: "Build", desc: "Desenvolvimento incremental em sprints" },
      { step: "Adoção", desc: "Treinamento, suporte e melhorias" },
    ],
    faq: [
      { q: "Vocês integram com sistemas existentes?", a: "Sim, via API REST, webhooks ou banco direto." },
      { q: "É no celular também?", a: "Sim, sistemas responsivos por padrão; apps nativos sob demanda." },
      { q: "Como cobram?", a: "Projeto fechado ou squad mensal, conforme o escopo." },
      { q: "E quando o negócio mudar?", a: "Evoluímos o sistema em sprints; não há limite." },
    ],
    keywords: ["sistema web", "ERP sob medida", "CRM customizado", "software sob medida"],
    ctaLabel: "Quero meu sistema",
  },
  "gestao-redes-sociais": {
    slug: "gestao-redes-sociais",
    name: "Gestão de Redes Sociais",
    category: "Social",
    title: "Gestão de Redes Sociais · 0WEB",
    h1: "Gestão Profissional de Redes Sociais que gera Autoridade e Vendas",
    description: "Estratégia, conteúdo premium, design com identidade e métricas conectadas ao seu funil. Sua marca deixa de postar por postar e passa a construir autoridade e faturamento.",
    serviceType: "Social Media Management",
    problems: [
      "Postar sem estratégia gera curtidas vazias, não vendas",
      "Feed sem identidade visual passa amadorismo e afasta cliente qualificado",
      "Sem métricas claras, você não sabe o que dá ROI e o que só queima energia",
    ],
    benefits: [
      "Calendário editorial estratégico alinhado a vendas e SEO social",
      "Design profissional dentro da sua identidade visual (não template genérico)",
      "Copywriting persuasivo com CTAs testados por especialista",
      "Produção de reels, motion e carrosséis com padrão de agência",
      "Relatório mensal de performance com decisões acionáveis",
      "Integração com tráfego pago e WhatsApp para converter seguidor em lead",
    ],
    process: [
      { step: "Posicionamento", desc: "Audiência, voz, pilares e referências" },
      { step: "Produção", desc: "Criativos, vídeos e roteiros mensais" },
      { step: "Distribuição", desc: "Postagens, stories, reels e engajamento" },
      { step: "Análise", desc: "Métricas, ajustes e crescimento" },
    ],
    faq: [
      { q: "Preciso fornecer fotos e vídeos?", a: "Não. Criamos tudo do zero usando banco premium, IA generativa e produção própria. Se você quiser enviar material, aproveitamos também." },
      { q: "Vocês respondem os comentários e DMs?", a: "Fazemos a triagem e o roteiro de resposta. Interações comerciais podem ficar com seu time ou ser gerenciadas por nós em pacotes com atendimento." },
      { q: "Consigo aprovar tudo antes de publicar?", a: "Sim. Todo o mês você recebe o planejamento e cada peça antes de ir ao ar, com prazo claro de aprovação." },
      { q: "Em quanto tempo vejo resultado?", a: "Ganhos de percepção de marca já no 1º mês. Crescimento consistente de alcance qualificado e leads a partir do 3º mês." },
      { q: "E se eu já tiver uma agência ou social media interno?", a: "Trabalhamos como camada estratégica e de produção. Podemos assumir tudo ou apenas o que falta (estratégia, design, tráfego)." },
    ],
    keywords: ["gestão de redes sociais", "social media", "agência de social media", "instagram para empresas"],
    ctaLabel: "Quero Minhas Redes Profissionais",
  },
  "site-24h": {
    slug: "site-24h",
    name: "Site Express Legado",
    category: "Web",
    title: "Site Express Profissional por R$499 · 0WEB",
    h1: "Seu site profissional chave-na-mão",
    description:
      "Site profissional, responsivo e otimizado entregue em fluxo turnkey. R$499 com hospedagem, SSL e SEO inclusos.",
    serviceType: "Web Design",
    problems: [
      "Precisa de presença online sem depender de reuniões longas",
      "Orçamentos caros e prazos longos com outras agências",
      "Está perdendo clientes por não ter site",
      "Já tentou montar sozinho e não ficou profissional",
    ],
    benefits: [
      "Entrega chave-na-mão após aprovação do conteúdo",
      "Design moderno, mobile-first e performático",
      "Hospedagem, SSL e domínio inclusos no 1º ano",
      "SEO técnico embutido e Google Meu Negócio",
      "Suporte e ajustes incluídos por 30 dias",
    ],
    process: [
      { step: "Briefing", desc: "Coleta de conteúdo e referências em 1 conversa" },
      { step: "Produção", desc: "Montagem do site pelo time 0WEB" },
      { step: "Aprovação", desc: "Você revisa e pedimos ajustes finais" },
      { step: "No ar", desc: "Publicamos no seu domínio com SEO e analytics" },
    ],
    faq: [
      { q: "Como funciona a entrega?", a: "Após você enviar textos, fotos e logo, nosso time monta o site e envia uma prévia para aprovação." },
      { q: "Qual o valor?", a: "R$499 à vista. Inclui hospedagem, SSL e domínio (.com.br) no primeiro ano." },
      { q: "Posso pedir alterações depois?", a: "Sim. Você tem 30 dias de suporte para ajustes de conteúdo e layout." },
      { q: "É responsivo?", a: "Totalmente. Construído mobile-first e otimizado para Google PageSpeed." },
    ],
    keywords: ["site express", "site rápido", "site barato", "criação de site express", "site profissional 499"],
    ctaLabel: "Quero meu Site Express",
  },
  "cartao-digital": {
    slug: "cartao-digital",
    name: "Cartão Digital",
    category: "Branding",
    title: "Cartão Digital Profissional · Sua Empresa na Palma da Mão · 0WEB",
    h1: "Cartão Digital Profissional: Sua Empresa na Palma da Mão",
    description:
      "Substitua o cartão de papel por um cartão digital moderno, editável e que gera resultados. Compartilhe no WhatsApp, Instagram e QR Code.",
    serviceType: "Digital Business Card Design",
    problems: [
      "Cartões de papel são perdidos, esquecidos e vão para o lixo",
      "Seus contatos não têm como acessar seus serviços rapidamente",
      "Você perde oportunidades de negócio por não estar digital",
    ],
    benefits: [
      "Compartilhamento instantâneo via WhatsApp, SMS e e-mail",
      "QR Code personalizado para eventos e materiais impressos",
      "Links diretos para WhatsApp, Instagram, site e localização",
      "Atualização em tempo real (mudou algo? atualize na hora)",
      "Analytics de cliques (saiba quantas pessoas acessaram)",
    ],
    process: [
      { step: "Briefing rápido", desc: "15 min — entendemos sua marca e serviços" },
      { step: "Design personalizado", desc: "2 dias — criamos o layout exclusivo" },
      { step: "Aprovação e ajustes", desc: "1 dia — você revisa e pede mudanças" },
      { step: "Entrega e treinamento", desc: "1 dia — você recebe o cartão e aprende a usar" },
    ],
    faq: [
      { q: "Posso editar depois de pronto?", a: "Sim, você pode atualizar informações, fotos e links quando quiser." },
      { q: "Funciona em qualquer celular?", a: "Sim, é 100% responsivo e funciona em qualquer dispositivo." },
      { q: "Preciso instalar algum app?", a: "Não, funciona direto no navegador, sem downloads." },
      { q: "Como compartilho?", a: "Via link, QR Code, WhatsApp, Instagram, e-mail ou onde quiser." },
      { q: "Quanto tempo leva para ficar pronto?", a: "Entregamos em até 5 dias úteis após o briefing." },
    ],
    keywords: ["cartão digital", "cartão de visitas digital", "cartão virtual", "cartão QR code"],
    ctaLabel: "Criar Meu Cartão Digital",
  },
  "catalogo-digital": {
    slug: "catalogo-digital",
    name: "Catálogo Digital",
    category: "E-commerce",
    title: "Catálogo Digital Completo · Venda 24h por Dia · 0WEB",
    h1: "Catálogo Digital Completo: Venda 24h por Dia",
    description:
      "Transforme seus produtos em um catálogo online profissional, com fotos, descrições, preços e botão direto para WhatsApp. Sem mensalidade.",
    serviceType: "Digital Product Catalog",
    problems: [
      "Enviar fotos e preços pelo WhatsApp um por um toma muito tempo",
      "Clientes querem ver tudo de uma vez, não ficar esperando resposta",
      "Você perde vendas fora do horário comercial",
    ],
    benefits: [
      "Catálogo online 24h, acessível de qualquer lugar",
      "Botão de compra direto para WhatsApp (fechamento rápido)",
      "Organização por categorias (facilita a navegação)",
      "Fotos em alta qualidade com zoom",
      "Busca inteligente por produto",
      "Sem mensalidade (pague uma vez, use para sempre)",
    ],
    process: [
      { step: "Coleta de produtos", desc: "3 dias — você envia fotos, nomes e preços" },
      { step: "Organização e design", desc: "3 dias — montamos a estrutura e o visual" },
      { step: "Cadastro dos produtos", desc: "2 dias — inserimos tudo no catálogo" },
      { step: "Revisão e ajustes", desc: "2 dias — você confere e pede mudanças" },
      { step: "Publicação e treinamento", desc: "1 dia — catálogo no ar e você aprende a atualizar" },
    ],
    faq: [
      { q: "Posso adicionar produtos depois?", a: "Sim, você pode adicionar quantos produtos quiser, quando quiser." },
      { q: "Funciona no celular?", a: "Sim, é 100% responsivo e otimizado para mobile." },
      { q: "Preciso pagar mensalidade?", a: "Não, você paga uma vez só e usa para sempre." },
      { q: "Como o cliente compra?", a: "Clica no produto e vai direto para o WhatsApp com a mensagem pronta." },
      { q: "Posso mudar preços e fotos?", a: "Sim, você tem acesso para editar tudo quando quiser." },
    ],
    keywords: ["catálogo digital", "catálogo online", "catálogo whatsapp", "vitrine digital"],
    ctaLabel: "Criar Meu Catálogo Digital",
  },
  "identidade-visual": {
    slug: "identidade-visual",
    name: "Identidade Visual",
    category: "Branding",
    title: "Identidade Visual Completa · Sua Marca Inesquecível · 0WEB",
    h1: "Identidade Visual Profissional: Sua Marca Inesquecível",
    description:
      "Criamos uma identidade visual completa que transmite profissionalismo, confiança e diferencia sua empresa da concorrência.",
    serviceType: "Brand Identity Design",
    problems: [
      "Sua marca não transmite profissionalismo e afasta clientes",
      "Você não tem padrão visual (cada post é de um jeito)",
      "Concorrentes com marcas melhores roubam seus clientes",
    ],
    benefits: [
      "Logo profissional e memorável",
      "Paleta de cores estratégica (psicologia das cores)",
      "Tipografia exclusiva (fontes que combinam com sua marca)",
      "Manual de marca completo (como aplicar em tudo)",
      "Templates para redes sociais (padrão visual pronto)",
      "Cartão de visita e papelaria (aplicação completa)",
    ],
    process: [
      { step: "Briefing estratégico", desc: "1h — entendemos seu negócio, público e valores" },
      { step: "Pesquisa e referências", desc: "3 dias — analisamos concorrentes e tendências" },
      { step: "Criação de conceitos", desc: "5 dias — desenvolvemos 3 propostas de logo" },
      { step: "Apresentação e escolha", desc: "1 dia — você escolhe a proposta vencedora" },
      { step: "Refinamento e aplicação", desc: "5 dias — ajustamos e criamos todos os materiais" },
      { step: "Entrega do manual de marca", desc: "2 dias — você recebe tudo organizado" },
    ],
    faq: [
      { q: "Quantas propostas de logo vocês fazem?", a: "Apresentamos 3 conceitos diferentes para você escolher." },
      { q: "Posso pedir ajustes?", a: "Sim, incluímos até 3 rodadas de ajustes na proposta escolhida." },
      { q: "Recebo os arquivos editáveis?", a: "Sim, você recebe todos os arquivos em alta resolução e editáveis (AI, EPS, PNG, JPG, PDF)." },
      { q: "O que é o manual de marca?", a: "É um documento que ensina como aplicar sua marca corretamente em tudo (cores, fontes, logos, etc)." },
      { q: "Quanto tempo leva o projeto completo?", a: "Entregamos tudo em até 20 dias úteis após o briefing." },
    ],
    keywords: ["identidade visual", "logo", "branding", "manual de marca", "criação de logotipo"],
    ctaLabel: "Criar Minha Identidade Visual",
  },
  "portfolio-empresarial": {
    slug: "portfolio-empresarial",
    name: "Portfólio Empresarial",
    category: "Web",
    title: "Portfólio Empresarial · Mostre Seu Trabalho com Profissionalismo · 0WEB",
    h1: "Portfólio Empresarial: Mostre Seu Trabalho com Profissionalismo",
    description:
      "Um site de uma página, elegante e estratégico, para apresentar sua empresa, serviços e cases de sucesso. Perfeito para conquistar clientes.",
    serviceType: "One-Page Portfolio Website",
    problems: [
      "Você não tem um lugar profissional para mostrar seu trabalho",
      "Enviar PDFs e apresentações pelo WhatsApp não passa credibilidade",
      "Clientes não encontram informações completas sobre sua empresa",
    ],
    benefits: [
      "Site de uma página (landing page institucional) completo",
      "Seções estratégicas: sobre, serviços, portfólio, depoimentos, contato",
      "Design premium e responsivo (funciona em qualquer dispositivo)",
      "Otimizado para SEO (aparece no Google)",
      "Botão de WhatsApp integrado (conversão rápida)",
      "Entrega em 10 dias úteis",
    ],
    process: [
      { step: "Briefing e conteúdo", desc: "2 dias — você envia textos, fotos e informações" },
      { step: "Design e estruturação", desc: "4 dias — criamos o layout e organizamos as seções" },
      { step: "Desenvolvimento", desc: "3 dias — programamos o site com animações e responsividade" },
      { step: "Revisão e publicação", desc: "1 dia — você aprova e colocamos no ar" },
    ],
    faq: [
      { q: "Posso editar depois de pronto?", a: "Sim, você pode solicitar alterações (cobrado à parte) ou usar nosso plano de manutenção." },
      { q: "Preciso pagar hospedagem?", a: "Sim, hospedagem e domínio são à parte (indicamos os melhores fornecedores)." },
      { q: "Funciona no celular?", a: "Sim, é 100% responsivo e otimizado para mobile." },
      { q: "Vai aparecer no Google?", a: "Sim, fazemos otimização básica de SEO para aparecer nas buscas." },
      { q: "Quanto tempo leva?", a: "Entregamos em até 10 dias úteis após o recebimento do conteúdo." },
    ],
    keywords: ["portfólio empresarial", "site portfólio", "site institucional", "one page"],
    ctaLabel: "Criar Meu Portfólio",
  },
  "ebook-profissional": {
    slug: "ebook-profissional",
    name: "E-Book Profissional",
    category: "Conteudo",
    title: "E-Book Profissional · Autoridade e Captação de Leads · 0WEB",
    h1: "E-Book Profissional: Autoridade e Captação de Leads",
    description:
      "Transforme seu conhecimento em um e-book estratégico que posiciona sua empresa como autoridade e captura leads qualificados 24h por dia.",
    serviceType: "Ebook Production",
    problems: [
      "Seus clientes não confiam em você como especialista do mercado",
      "Você não tem um material rico para oferecer em troca de contatos",
      "Concorrentes estão capturando leads com conteúdo de qualidade",
    ],
    benefits: [
      "E-book estratégico com até 30 páginas (design profissional)",
      "Posicionamento como autoridade no seu mercado",
      "Material rico para captura de leads (landing page + formulário)",
      "Design editorial premium (capa, diagramação, ícones)",
      "Entrega em PDF editável + versão para web",
      "Estratégia de distribuição (como usar para gerar leads)",
    ],
    process: [
      { step: "Briefing estratégico", desc: "1h — definimos tema, público-objetivo e objetivos" },
      { step: "Estrutura e roteiro", desc: "3 dias — criamos o sumário e fluxo de conteúdo" },
      { step: "Redação do conteúdo", desc: "7 dias — escrevemos o texto completo" },
      { step: "Design editorial", desc: "5 dias — diagramação profissional com imagens" },
      { step: "Revisão e entrega", desc: "2 dias — você aprova e recebe os arquivos" },
    ],
    faq: [
      { q: "Vocês escrevem o conteúdo?", a: "Sim, nossa equipe de redação cria todo o conteúdo estratégico." },
      { q: "Posso revisar e pedir ajustes?", a: "Sim, incluímos 2 rodadas de revisão no texto e no design." },
      { q: "Recebo os arquivos editáveis?", a: "Sim, você recebe PDF, Word e versão para web (HTML)." },
      { q: "Quanto tempo leva?", a: "Entregamos em até 20 dias úteis após o briefing." },
      { q: "Vocês ajudam na distribuição?", a: "Sim, entregamos um guia estratégico de como usar o e-book para captar leads." },
    ],
    keywords: ["e-book profissional", "ebook", "captura de leads", "material rico", "isca digital"],
    ctaLabel: "Criar Meu E-Book",
  },
  "videos-empresariais": {
    slug: "videos-empresariais",
    name: "Vídeos Empresariais",
    category: "Midia",
    title: "Vídeos Empresariais · Conte Sua História com Impacto · 0WEB",
    h1: "Vídeos Empresariais: Conte Sua História com Impacto",
    description:
      "Produção profissional de vídeos institucionais, de produtos e depoimentos que conectam, engajam e convertem.",
    serviceType: "Corporate Video Production",
    problems: [
      "Vídeos amadores não passam credibilidade e afastam clientes",
      "Você não tem conteúdo em vídeo para redes sociais e site",
      "Concorrentes estão usando vídeo para se destacar no mercado",
    ],
    benefits: [
      "Vídeo institucional completo (até 3 minutos)",
      "Roteiro estratégico (storytelling que conecta)",
      "Captação profissional (câmera 4K, iluminação, áudio)",
      "Edição cinematográfica (trilha sonora, motion graphics, color grading)",
      "Versões para diferentes plataformas (horizontal, vertical, quadrado)",
      "Entrega em alta resolução (Full HD + 4K)",
    ],
    process: [
      { step: "Briefing criativo", desc: "1h — entendemos sua marca, mensagem e objetivos" },
      { step: "Roteiro e planejamento", desc: "3 dias — criamos o roteiro e cronograma" },
      { step: "Captação de imagens", desc: "1 dia — gravação profissional na sua empresa" },
      { step: "Edição e pós-produção", desc: "7 dias — edição, trilha, motion graphics" },
      { step: "Revisão e ajustes", desc: "2 dias — você assiste e pede mudanças" },
      { step: "Entrega final", desc: "1 dia — todos os arquivos e versões" },
    ],
    faq: [
      { q: "Vocês vão até a empresa gravar?", a: "Sim, nossa equipe vai até seu local de gravação (incluído no preço para Curitiba/PR)." },
      { q: "Quantos vídeos estão inclusos?", a: "Um vídeo principal de até 3 minutos + 3 versões curtas para redes sociais." },
      { q: "Posso pedir ajustes na edição?", a: "Sim, incluímos 2 rodadas de revisão na edição final." },
      { q: "Recebo os arquivos brutos?", a: "Sim, você recebe todos os arquivos gravados + versões editadas." },
      { q: "Quanto tempo leva?", a: "Entregamos em até 15 dias úteis após a gravação." },
    ],
    keywords: ["vídeos empresariais", "vídeo institucional", "produção de vídeo", "vídeo corporativo"],
    ctaLabel: "Produzir Meu Vídeo",
  },
  "comunicacao-visual": {
    slug: "comunicacao-visual",
    name: "Comunicação Visual",
    category: "Branding",
    title: "Comunicação Visual Profissional · Sua Marca em Todo Lugar · 0WEB",
    h1: "Comunicação Visual Profissional: Sua Marca em Todo Lugar",
    description:
      "Design profissional para materiais impressos e digitais: banners, flyers, cartões, posts para redes sociais e muito mais.",
    serviceType: "Visual Communication Design",
    problems: [
      "Materiais com design amador não passam credibilidade",
      "Você perde tempo tentando fazer designs no Canva sem resultado",
      "Sua marca não tem padrão visual consistente",
    ],
    benefits: [
      "Pacote com 10 peças de comunicação visual",
      "Design profissional e consistente com sua marca",
      "Materiais para impressão (cartões, flyers, banners) + digital (posts, stories)",
      "Arquivos prontos para gráfica e redes sociais",
      "Entrega em até 7 dias úteis",
      "Inclui 2 rodadas de ajustes",
    ],
    process: [
      { step: "Briefing e referências", desc: "1 dia — você envia o que precisa e referências" },
      { step: "Criação das peças", desc: "4 dias — desenvolvemos todos os designs" },
      { step: "Revisão e ajustes", desc: "2 dias — você confere e pede mudanças" },
      { step: "Entrega final", desc: "1 dia — todos os arquivos organizados" },
    ],
    faq: [
      { q: "Quais peças estão inclusas?", a: "10 peças à sua escolha: cartões, flyers, banners, posts para Instagram, stories, capas para Facebook, etc." },
      { q: "Vocês imprimem os materiais?", a: "Não, entregamos os arquivos prontos para gráfica. Indicamos parceiros de confiança." },
      { q: "Posso pedir ajustes?", a: "Sim, incluímos 2 rodadas de ajustes em cada peça." },
      { q: "Recebo os arquivos editáveis?", a: "Sim, você recebe PDF, PNG, JPG e arquivos editáveis (AI/PSD)." },
      { q: "Quanto tempo leva?", a: "Entregamos em até 7 dias úteis após o briefing." },
    ],
    keywords: ["comunicação visual", "design gráfico", "material gráfico", "artes para redes sociais"],
    ctaLabel: "Criar Minha Comunicação Visual",
  },
  "outdoor-digital": {
    slug: "outdoor-digital",
    name: "Outdoor Digital",
    category: "Midia",
    title: "Outdoor Digital · Sua Marca Onde as Pessoas Estão · 0WEB",
    h1: "Outdoor Digital: Sua Marca Onde as Pessoas Estão",
    description:
      "Mídia OOH (Out-of-Home) em telas digitais estratégicas de Curitiba. Alcance milhares de pessoas por dia com impacto visual.",
    serviceType: "Digital Out-of-Home Advertising",
    problems: [
      "Mídia tradicional (TV, rádio) é cara e difícil de mensurar",
      "Você quer aparecer em locais estratégicos mas não sabe como",
      "Concorrentes estão investindo em mídia offline e ganhando visibilidade",
    ],
    benefits: [
      "Exibição em telas digitais estratégicas de Curitiba (shoppings, avenidas, academias)",
      "Alcance de +50.000 pessoas por dia",
      "Criativo em vídeo ou imagem (até 15 segundos)",
      "Relatório mensal de exibição (quantas vezes passou, em quais telas)",
      "Flexibilidade para trocar o criativo quando quiser",
      "Sem fidelidade (cancele quando quiser)",
    ],
    process: [
      { step: "Briefing e locais", desc: "1 dia — definimos onde e quando exibir" },
      { step: "Criação do criativo", desc: "3 dias — produzimos o vídeo/imagem" },
      { step: "Aprovação e agendamento", desc: "1 dia — você aprova e programamos" },
      { step: "Exibição e relatório", desc: "Contínuo — seu outdoor no ar + relatório mensal" },
    ],
    faq: [
      { q: "Onde ficam as telas?", a: "Temos telas em shoppings (Palladium, Park Shopping, etc), avenidas principais, academias e locais de grande circulação em Curitiba." },
      { q: "Quantas vezes meu outdoor passa por dia?", a: "Em média, 120 vezes por dia em cada tela (loop a cada 5 minutos)." },
      { q: "Posso trocar o criativo?", a: "Sim, você pode trocar o criativo quantas vezes quiser (produção cobrada à parte)." },
      { q: "Recebo relatório?", a: "Sim, relatório mensal com quantas vezes passou, em quais telas e horário." },
      { q: "Tem fidelidade?", a: "Não, contrato mensal sem fidelidade. Cancele quando quiser." },
    ],
    keywords: ["outdoor digital", "mídia OOH", "publicidade externa", "outdoor curitiba", "DOOH"],
    ctaLabel: "Quero Aparecer em Outdoor Digital",
  },
};

export const ALL_SERVICE_SLUGS = Object.keys(SERVICES);

/** Subset that has a dedicated City × Service geo page.
 *  Kept conservative for quality; expand here to scale (each new entry
 *  adds N city pages to the sitemap automatically). */
export const GEO_SERVICE_SLUGS: string[] = [
  "criacao-de-sites",
  "landing-pages",
  "loja-virtual",
  "seo",
  "marketing-digital",
  "automacao-com-ia",
  "chatbot-whatsapp",
  "gestao-redes-sociais",
];

export function getService(slug: string): ServiceData | undefined {
  return SERVICES[slug];
}

/** Related services from the same category first, then others. Deterministic. */
export function relatedServices(slug: string, n = 4): ServiceData[] {
  const me = SERVICES[slug];
  if (!me) return Object.values(SERVICES).slice(0, n);
  const same = Object.values(SERVICES).filter((s) => s.slug !== slug && s.category === me.category);
  const others = Object.values(SERVICES).filter((s) => s.slug !== slug && s.category !== me.category);
  return [...same, ...others].slice(0, n);
}
