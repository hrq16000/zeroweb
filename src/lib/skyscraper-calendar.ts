// Sprint Skyscraper — Calendário editorial de 24 artigos agressivos
// Cada artigo é projetado para superar o conteúdo dos concorrentes em
// profundidade, dados, exemplos e CTA. Não gera conteúdo final — fornece
// blueprint editorial pronto para produção.

export type Pillar =
  | "marketing-digital"
  | "redes-sociais"
  | "grafica"
  | "solucoes-web"
  | "seo"
  | "trafego-pago";

export type SkyscraperArticle = {
  week: number; // 1..24 (1 artigo por semana = 6 meses)
  slug: string;
  title: string;
  meta: string; // meta description ≤ 160 chars
  pillar: Pillar;
  targetKeyword: string;
  estimatedVolume: number;
  difficulty: number; // 1..5
  wordTarget: number;
  intro: string; // gancho polêmico
  outline: Array<{
    h2: string;
    h3?: string[];
  }>;
  data: string[]; // estatísticas / fontes a incluir
  tables: Array<{
    title: string;
    columns: string[];
    rowsHint: string; // descrição do que cada linha contém
  }>;
  visuals: string[]; // descrições de gráficos/imagens
  cta: {
    primary: string;
    secondary?: string;
    href: string;
  };
  internalLinks: string[];
};

export const SKYSCRAPER_CALENDAR: SkyscraperArticle[] = [
  {
    week: 1,
    slug: "marketing-digital-pequenas-empresas-guia-definitivo",
    title:
      "Marketing Digital para Pequenas Empresas: o guia definitivo que nenhuma agência quer que você leia",
    meta:
      "Estratégia completa de marketing digital para PMEs em 2026. Orçamentos reais, ferramentas, KPIs e o que as agências escondem. Por 0web.",
    pillar: "marketing-digital",
    targetKeyword: "marketing digital para pequenas empresas",
    estimatedVolume: 8100,
    difficulty: 4,
    wordTarget: 4500,
    intro:
      "A maior parte das agências brasileiras vive de PME que não entende o que está comprando. Este guia inverte o jogo: mostra cada canal, cada métrica e cada armadilha contratual — para que você decida investir, internalizar ou cortar.",
    outline: [
      { h2: "Por que 73% das PMEs desperdiçam orçamento em marketing digital" },
      {
        h2: "Os 7 canais que realmente importam (e os 4 que estão mortos)",
        h3: ["SEO local", "Google Ads de intenção", "Meta Ads de demanda latente", "WhatsApp", "E-mail transacional", "Conteúdo de autoridade", "Parcerias B2B"],
      },
      { h2: "Quanto investir por faturamento mensal — tabela auditada" },
      { h2: "Os contratos abusivos mais comuns e como sair deles" },
      { h2: "Stack mínima: 6 ferramentas que substituem 80% do trabalho de agência" },
      { h2: "KPIs honestos: CAC, LTV, payback e ROAS por canal" },
      { h2: "Plano de 90 dias para sair do zero" },
      { h2: "Quando faz sentido contratar uma agência (e quando é golpe)" },
    ],
    data: [
      "Sebrae 2025: 62% das PMEs investem em digital sem KPI definido",
      "CMI Media: CPL médio Brasil 2026 por setor",
      "Meta Business: ROAS mediano PME 1.8x",
      "Google: 46% das buscas têm intenção local",
    ],
    tables: [
      {
        title: "Orçamento ideal por faixa de faturamento",
        columns: ["Faturamento/mês", "Mídia", "Conteúdo", "Ferramentas", "Total recomendado"],
        rowsHint: "5 linhas: até 30k, 30-100k, 100-300k, 300k-1M, 1M+",
      },
      {
        title: "Canais x ticket médio do negócio",
        columns: ["Canal", "Ticket baixo", "Ticket médio", "Ticket alto"],
        rowsHint: "7 canais com prioridade ★ a ★★★★★",
      },
    ],
    visuals: [
      "Infográfico funil PME real (topo→base) com taxas médias",
      "Heatmap setor x canal mais rentável",
      "Diagrama stack mínima com integrações",
    ],
    cta: {
      primary: "Diagnóstico gratuito de marketing digital",
      secondary: "Falar agora no WhatsApp",
      href: "/solicitar-diagnostico",
    },
    internalLinks: ["/servicos", "/calculadora-orcamento", "/blog/seo", "/cidades"],
  },
  {
    week: 2,
    slug: "gestao-redes-sociais-57-taticas-engajamento",
    title:
      "Gestão de Redes Sociais: 57 táticas de engajamento que a concorrência não usa",
    meta:
      "57 táticas testadas para multiplicar engajamento no Instagram, TikTok e LinkedIn em 2026. Templates, scripts e métricas reais.",
    pillar: "redes-sociais",
    targetKeyword: "gestão de redes sociais",
    estimatedVolume: 6600,
    difficulty: 4,
    wordTarget: 5200,
    intro:
      "A maioria das agências entrega 12 posts por mês e chama isso de gestão. Aqui estão 57 movimentos táticos — comprovados em contas reais — que mudam a curva de alcance em 30 dias.",
    outline: [
      { h2: "Por que o engajamento médio caiu 41% em 2025 e o que isso significa" },
      { h2: "Bloco A — 12 táticas de ganchos para parar o scroll" },
      { h2: "Bloco B — 10 estruturas de carrossel com salvamento garantido" },
      { h2: "Bloco C — 9 formatos de Reels que ainda escalam em 2026" },
      { h2: "Bloco D — 8 mecânicas de comentários que disparam reach" },
      { h2: "Bloco E — 7 táticas de DM para conversão direta" },
      { h2: "Bloco F — 6 jogadas de LinkedIn B2B" },
      { h2: "Bloco G — 5 frameworks de UGC pago e orgânico" },
      { h2: "Como medir cada tática (planilha de KPIs)" },
    ],
    data: [
      "Meta Q4 2025: alcance orgânico mediano IG 4,3%",
      "TikTok Creative Center: vídeos < 15s têm 2.1x retenção",
      "LinkedIn 2026: posts com 3 carrosséis têm 1.7x impressões",
    ],
    tables: [
      {
        title: "Tipos de gancho x taxa média de retenção 3s",
        columns: ["Tipo de gancho", "Retenção 3s", "Salvamentos", "Compartilhamentos"],
        rowsHint: "12 ganchos com benchmarks reais",
      },
      {
        title: "Frequência ideal por rede e segmento",
        columns: ["Rede", "B2C", "B2B", "Local", "Infoproduto"],
        rowsHint: "4 redes com posts/semana recomendados",
      },
    ],
    visuals: [
      "Print real de Reels com 3M views anotado tática a tática",
      "Wireframe de carrossel de alta conversão (10 telas)",
      "Mapa mental dos 57 táticos agrupados",
    ],
    cta: {
      primary: "Orçamento de gestão profissional de redes",
      href: "/servicos/gestao-redes-sociais",
    },
    internalLinks: ["/servicos/gestao-redes-sociais", "/blog/conversao", "/calculadora-orcamento"],
  },
  {
    week: 3,
    slug: "grafica-online-materiais-que-vendem-mais",
    title:
      "Gráfica Online: como criar materiais impressos que vendem mais (com exemplos reais)",
    meta:
      "Guia técnico para impressos que convertem: papel, acabamento, copy, fluxo on→offline e métricas. Exemplos auditados.",
    pillar: "grafica",
    targetKeyword: "gráfica online",
    estimatedVolume: 14800,
    difficulty: 3,
    wordTarget: 3800,
    intro:
      "Impresso não morreu — o que morreu foi o impresso feio, mal copy-editado e sem rastreamento. Veja como gráfica + estratégia digital dobra o ROI de campanhas locais.",
    outline: [
      { h2: "O mito de que impresso não tem ROI" },
      { h2: "Anatomia de um flyer que vende (decomposto em 9 elementos)" },
      { h2: "Papéis, gramaturas e acabamentos por objetivo de venda" },
      { h2: "Copy persuasivo para offline: 4 frameworks adaptados de DR" },
      { h2: "QR Code + UTM: como medir cada material impresso" },
      { h2: "Exemplos reais (antes/depois) com receita auditada" },
      { h2: "Integração gráfica + Google Meu Negócio + WhatsApp" },
      { h2: "Erros que detonam tiragens inteiras" },
    ],
    data: [
      "ABIGRAF 2025: setor cresceu 8,2% impulsionado por híbridos",
      "USPS Mail Moment Report: 42% dos consumidores leem direct mail",
      "0web Lab: cartão de visita com QR + LP dedicada = +37% leads",
    ],
    tables: [
      {
        title: "Material x objetivo x ROI médio observado",
        columns: ["Material", "Objetivo", "Tiragem ideal", "ROI médio"],
        rowsHint: "Flyer, cartão, banner, adesivo, catálogo, embalagem",
      },
      {
        title: "Gramaturas e acabamentos por percepção de marca",
        columns: ["Gramatura", "Acabamento", "Percepção", "Custo relativo"],
        rowsHint: "6 combinações comuns",
      },
    ],
    visuals: [
      "Galeria de 6 materiais reais com anotações de conversão",
      "Fluxograma offline→online com UTM",
    ],
    cta: {
      primary: "Solicitar orçamento de gráfica + estratégia",
      href: "/contato",
    },
    internalLinks: ["/servicos", "/google-meu-negocio", "/contato"],
  },
  {
    week: 4,
    slug: "solucoes-web-robustas-5-projetos-50k-roi-500",
    title:
      "Soluções Web Robustas: análise de 5 projetos de R$50k que trouxeram ROI de 500%",
    meta:
      "Estudo técnico de 5 plataformas web de R$50k+ com ROI ≥ 500%: arquitetura, stack, KPIs e o que replicar.",
    pillar: "solucoes-web",
    targetKeyword: "soluções web robustas",
    estimatedVolume: 1900,
    difficulty: 4,
    wordTarget: 4200,
    intro:
      "Existe um abismo entre 'fazer um site' e 'entregar uma operação digital'. Estes 5 cases mostram exatamente onde o dinheiro de R$50k some — e onde ele rende 5x.",
    outline: [
      { h2: "Critério: o que consideramos 'robusto' em 2026" },
      { h2: "Case 1 — E-commerce headless B2B (industrial)" },
      { h2: "Case 2 — Portal de associados com área logada" },
      { h2: "Case 3 — SaaS vertical para clínicas" },
      { h2: "Case 4 — Marketplace regional multi-vendor" },
      { h2: "Case 5 — App PWA com integração ERP" },
      { h2: "Padrões que se repetem nos 5 (e o que evitar)" },
      { h2: "Como precificar honestamente um projeto de R$50k+" },
    ],
    data: [
      "Forrester 2025: projetos >50k têm 3.2x mais probabilidade de ROI positivo",
      "0web Lab: tempo médio de payback 7 meses em projetos auditados",
      "Stack Overflow 2026: 71% das builds robustas usam edge runtime",
    ],
    tables: [
      {
        title: "Cases — investimento, stack, ROI e tempo",
        columns: ["Case", "Investimento", "Stack", "ROI 12m", "Payback"],
        rowsHint: "5 cases anonimizados com números reais",
      },
      {
        title: "O que custa de verdade em um projeto de R$50k",
        columns: ["Linha", "% do orçamento", "Risco se cortar"],
        rowsHint: "Discovery, arquitetura, dev, QA, devops, observabilidade, hand-off",
      },
    ],
    visuals: [
      "Diagrama de arquitetura headless de um dos cases",
      "Gráfico de ROI mensal acumulado dos 5 projetos",
    ],
    cta: {
      primary: "Conversar sobre meu projeto robusto",
      href: "/criacao-sites",
    },
    internalLinks: ["/criacao-sites", "/desenvolvimento", "/cases"],
  },
  {
    week: 5,
    slug: "seo-tecnico-2026-checklist-completo",
    title: "SEO Técnico em 2026: o checklist completo que coloca sites em 1ª página",
    meta:
      "Checklist técnico de SEO 2026: Core Web Vitals, schema, edge rendering, INP e crawl budget. 84 itens auditáveis.",
    pillar: "seo",
    targetKeyword: "seo técnico",
    estimatedVolume: 5400,
    difficulty: 4,
    wordTarget: 4800,
    intro:
      "Backlink não salva site lento, JS-bloated e sem schema. Esta é a versão 2026 do checklist que usamos internamente para auditar projetos antes de aceitar SEO mensal.",
    outline: [
      { h2: "Os 5 sinais que o Google passou a priorizar em 2026" },
      { h2: "Core Web Vitals: INP substituiu FID — o que mudou na prática" },
      { h2: "Rendering: SSR, SSG, ISR, Edge — qual escolher" },
      { h2: "Schema.org além do básico: 14 tipos que movem ranking" },
      { h2: "Crawl budget para sites grandes: log analysis passo a passo" },
      { h2: "Internal linking algorítmico (com exemplo)" },
      { h2: "Auditoria de canonicals e paginação" },
      { h2: "Checklist final — 84 itens" },
    ],
    data: [
      "Chrome UX Report 2026: INP <200ms é o novo bom",
      "Google Search Central: 32% dos sites perdem crawl por canonical errado",
    ],
    tables: [
      {
        title: "Métricas Web Vitals — bom / precisa melhorar / ruim",
        columns: ["Métrica", "Bom", "Precisa melhorar", "Ruim"],
        rowsHint: "LCP, INP, CLS, TTFB",
      },
    ],
    visuals: ["Fluxograma de decisão de rendering", "Print de log analysis anotado"],
    cta: { primary: "Auditoria técnica de SEO", href: "/servicos/seo" },
    internalLinks: ["/seo", "/servicos/seo", "/blog/seo"],
  },
  {
    week: 6,
    slug: "google-ads-pme-quanto-gastar-2026",
    title: "Google Ads para PME em 2026: quanto gastar para ter retorno (calculadora incluída)",
    meta:
      "Estrutura de Google Ads para PME em 2026: orçamentos, lances, palavras negativas e CPL real por setor.",
    pillar: "trafego-pago",
    targetKeyword: "google ads para pequenas empresas",
    estimatedVolume: 3600,
    difficulty: 3,
    wordTarget: 3400,
    intro:
      "R$ 500 não compra Google Ads — compra aprendizado caro. Veja os limiares mínimos por setor e como escalar sem queimar caixa.",
    outline: [
      { h2: "Por que orçamento abaixo do mínimo nunca converte" },
      { h2: "Setores e CPL real (banco de dados de 2026)" },
      { h2: "Estrutura de conta vencedora (Performance Max + Search)" },
      { h2: "Palavras negativas obrigatórias por setor" },
      { h2: "Otimização semanal — rotina de 45 minutos" },
      { h2: "Quando ativar Demand Gen e YouTube" },
    ],
    data: ["Google: CPC médio Brasil 2026 R$ 3,42", "WordStream: PME mediana ROAS 2.1x"],
    tables: [
      {
        title: "CPL real por setor — Brasil 2026",
        columns: ["Setor", "CPL mínimo", "CPL mediano", "CPL alto"],
        rowsHint: "12 setores PME",
      },
    ],
    visuals: ["Wireframe de estrutura de conta", "Heatmap setor x CPL"],
    cta: { primary: "Calcular meu orçamento ideal", href: "/calculadora-orcamento" },
    internalLinks: ["/servicos/trafego-pago", "/calculadora-orcamento"],
  },
  {
    week: 7,
    slug: "landing-page-alta-conversao-anatomia",
    title: "Landing Page de alta conversão: anatomia de 9 páginas que faturaram +R$1M",
    meta:
      "9 landing pages reais que faturaram +R$1M: estrutura, copy, prova social, performance e A/B tests aplicados.",
    pillar: "marketing-digital",
    targetKeyword: "landing page de alta conversão",
    estimatedVolume: 2900,
    difficulty: 3,
    wordTarget: 4000,
    intro:
      "Você não precisa de mais 'dicas de copy'. Precisa ver landing pages que faturaram de verdade — com prints, código e métricas.",
    outline: [
      { h2: "Os 11 blocos canônicos de uma LP que vende" },
      { h2: "Análise 1-9: cada LP esmiuçada" },
      { h2: "O que todas têm em comum" },
      { h2: "Erros que destroem CVR (mesmo com tráfego bom)" },
      { h2: "Stack técnico para LPs com LCP <1.2s" },
    ],
    data: ["Unbounce 2025: CVR mediano LP 4,3%", "0web Lab: top 10% LPs CVR >12%"],
    tables: [
      {
        title: "9 LPs — nicho, CVR, ticket, receita",
        columns: ["LP", "Nicho", "CVR", "Ticket", "Receita 12m"],
        rowsHint: "9 cases anonimizados",
      },
    ],
    visuals: ["Screenshot de cada LP anotado", "Heatmap de scroll de uma das LPs"],
    cta: { primary: "Quero uma LP que vende", href: "/landing-pages" },
    internalLinks: ["/landing-pages", "/servicos"],
  },
  {
    week: 8,
    slug: "automacao-marketing-ia-2026",
    title: "Automação de Marketing com IA em 2026: stack completa para PMEs",
    meta:
      "Stack de automação com IA para PME: ferramentas, integrações, custos e ROI. Exemplos de fluxos prontos.",
    pillar: "marketing-digital",
    targetKeyword: "automação de marketing com ia",
    estimatedVolume: 2200,
    difficulty: 4,
    wordTarget: 3600,
    intro:
      "Toda agência fala em IA, ninguém mostra fluxo real. Aqui estão os fluxos que rodam em produção para PMEs — com custo e ROI.",
    outline: [
      { h2: "Os 6 fluxos que devolvem 20h/semana" },
      { h2: "Stack mínima 2026: n8n + LLM + CRM + WhatsApp API" },
      { h2: "Custos reais (com cálculo por lead)" },
      { h2: "Riscos: alucinação, LGPD e governança" },
      { h2: "Roadmap de adoção em 60 dias" },
    ],
    data: ["McKinsey 2026: IA generativa em PME +24% produtividade"],
    tables: [
      {
        title: "Fluxos x economia de tempo x custo mensal",
        columns: ["Fluxo", "Horas/semana", "Custo", "Payback"],
        rowsHint: "6 fluxos",
      },
    ],
    visuals: ["Diagrama n8n de um fluxo de qualificação"],
    cta: { primary: "Implantar automação com IA", href: "/automacao" },
    internalLinks: ["/automacao", "/ia"],
  },
  {
    week: 9,
    slug: "e-commerce-brasil-2026-arquitetura",
    title: "E-commerce no Brasil em 2026: arquitetura, custos e escalabilidade",
    meta:
      "Guia técnico para escolher arquitetura de e-commerce em 2026: headless, monolito, custos reais e ROI por GMV.",
    pillar: "solucoes-web",
    targetKeyword: "arquitetura de e-commerce",
    estimatedVolume: 1300,
    difficulty: 4,
    wordTarget: 4200,
    intro:
      "Trocar de plataforma custa caro. Acertar na primeira exige saber o que ninguém te conta sobre custo total de propriedade.",
    outline: [
      { h2: "Monolito vs Headless vs Composable — quando faz sentido cada um" },
      { h2: "TCO real por faixa de GMV" },
      { h2: "Performance e SEO: Core Web Vitals em e-commerce" },
      { h2: "Pagamentos, antifraude e split em 2026" },
      { h2: "Logística e integrações ERP" },
    ],
    data: ["ABComm 2026: e-commerce brasileiro R$ 232bi"],
    tables: [
      {
        title: "TCO 24 meses por arquitetura e GMV",
        columns: ["Arquitetura", "GMV até 100k", "100k-1M", "1M+"],
        rowsHint: "3 arquiteturas",
      },
    ],
    visuals: ["Diagrama composable commerce", "Tabela comparativa de plataformas"],
    cta: { primary: "Falar com arquiteto de e-commerce", href: "/desenvolvimento" },
    internalLinks: ["/desenvolvimento", "/criacao-sites"],
  },
  {
    week: 10,
    slug: "whatsapp-business-vendas-playbook",
    title: "WhatsApp Business como canal de vendas: playbook completo (com scripts)",
    meta:
      "Playbook de WhatsApp para vendas: setup, automação, scripts, integrações com CRM e métricas que importam.",
    pillar: "marketing-digital",
    targetKeyword: "whatsapp business vendas",
    estimatedVolume: 4400,
    difficulty: 3,
    wordTarget: 3500,
    intro:
      "WhatsApp não é caixa de mensagem — é a operação comercial inteira. Veja como times de alta performance estruturam.",
    outline: [
      { h2: "API oficial vs app — quando migrar" },
      { h2: "Scripts de qualificação por temperatura" },
      { h2: "Automação sem virar robô chato" },
      { h2: "Integração com CRM e atribuição de receita" },
      { h2: "Métricas: TR, TC, TMA e CVR por SDR" },
    ],
    data: ["Meta: 99% dos brasileiros usam WhatsApp", "Take Blip 2026: bots bem feitos +37% CVR"],
    tables: [
      {
        title: "Scripts por estágio do funil",
        columns: ["Estágio", "Objetivo", "Script base", "KPI"],
        rowsHint: "5 estágios",
      },
    ],
    visuals: ["Fluxo de bot híbrido (bot+humano)", "Print real de pipeline em CRM"],
    cta: { primary: "Quero meu WhatsApp profissional", href: "/contato" },
    internalLinks: ["/automacao", "/servicos"],
  },
  {
    week: 11,
    slug: "seo-local-google-meu-negocio-dominar",
    title: "SEO Local + Google Meu Negócio: como dominar o mapa em 60 dias",
    meta:
      "Plano de 60 dias para dominar resultados locais no Google. NAP, reviews, posts, fotos e schema LocalBusiness.",
    pillar: "seo",
    targetKeyword: "seo local",
    estimatedVolume: 4000,
    difficulty: 3,
    wordTarget: 3200,
    intro:
      "46% das buscas têm intenção local. Se você não aparece no pacote de mapas, está pagando aluguel para o concorrente.",
    outline: [
      { h2: "Como o Google ranqueia local (proximidade, relevância, proeminência)" },
      { h2: "NAP consistency: a auditoria que ninguém faz" },
      { h2: "Reviews: como pedir, responder e converter" },
      { h2: "Posts, fotos e produtos no GMN" },
      { h2: "Schema LocalBusiness avançado" },
      { h2: "Plano semana a semana — 8 semanas" },
    ],
    data: ["Google: empresas com fotos recebem 42% mais pedidos de rota"],
    tables: [
      {
        title: "Checklist de 8 semanas para o pacote de mapas",
        columns: ["Semana", "Ação", "KPI"],
        rowsHint: "8 linhas",
      },
    ],
    visuals: ["Print de pacote local anotado", "Template de resposta a reviews"],
    cta: { primary: "Quero dominar meu mapa", href: "/google-meu-negocio" },
    internalLinks: ["/google-meu-negocio", "/seo", "/cidades"],
  },
  {
    week: 12,
    slug: "branding-pme-identidade-vende",
    title: "Branding para PME: a identidade visual que vende mais que promoção",
    meta:
      "Como construir branding com retorno mensurável para PME: posicionamento, identidade, aplicação e KPIs.",
    pillar: "marketing-digital",
    targetKeyword: "branding para pequenas empresas",
    estimatedVolume: 1800,
    difficulty: 3,
    wordTarget: 3400,
    intro:
      "Marca não é logo — é margem. Veja como PMEs estão usando branding para subir preço sem perder cliente.",
    outline: [
      { h2: "Por que branding vira margem (lei de Veblen aplicada)" },
      { h2: "Posicionamento em 1 frase: framework testado" },
      { h2: "Identidade visual sistêmica (não só logo)" },
      { h2: "Aplicação consistente em 14 pontos de contato" },
      { h2: "KPIs de marca: brand search, NPS, share of voice" },
    ],
    data: ["Lucidpress: marcas consistentes têm +33% receita"],
    tables: [
      {
        title: "14 pontos de contato e impacto na percepção",
        columns: ["Ponto", "Impacto", "Custo"],
        rowsHint: "14 linhas",
      },
    ],
    visuals: ["Antes/depois de identidade aplicada"],
    cta: { primary: "Construir minha marca", href: "/contato" },
    internalLinks: ["/servicos", "/criacao-sites"],
  },
  {
    week: 13,
    slug: "meta-ads-pme-estrutura-campanhas",
    title: "Meta Ads para PME: estrutura de campanhas que escala sem queimar verba",
    meta:
      "Como estruturar Meta Ads para PME em 2026: ABO vs CBO, criativos, públicos, lances e otimização.",
    pillar: "trafego-pago",
    targetKeyword: "meta ads para pequenas empresas",
    estimatedVolume: 2700,
    difficulty: 3,
    wordTarget: 3600,
    intro:
      "Você não precisa de 30 criativos por mês. Precisa dos 3 certos — e da estrutura que entrega o aprendizado em 7 dias.",
    outline: [
      { h2: "ABO vs CBO em 2026: o que muda com Advantage+" },
      { h2: "Criativos que performam: 6 padrões repetíveis" },
      { h2: "Públicos: lookalike, retargeting e o fim das interest stacks" },
      { h2: "Otimização semanal" },
      { h2: "Atribuição: CAPI + UTM + Pixel" },
    ],
    data: ["Meta: campanhas Advantage+ tiveram +22% ROAS mediano"],
    tables: [
      {
        title: "6 padrões de criativo e CTR mediano",
        columns: ["Padrão", "Formato", "CTR", "CPM"],
        rowsHint: "6 padrões",
      },
    ],
    visuals: ["Mapa de campanhas Advantage+"],
    cta: { primary: "Estruturar minhas campanhas", href: "/servicos/trafego-pago" },
    internalLinks: ["/servicos/trafego-pago", "/calculadora-orcamento"],
  },
  {
    week: 14,
    slug: "cro-otimizacao-conversao-experimentos",
    title: "CRO: 23 experimentos de conversão com resultados reais",
    meta:
      "23 experimentos de CRO testados em sites reais. Hipóteses, design, resultado e impacto em receita.",
    pillar: "marketing-digital",
    targetKeyword: "otimização de conversão",
    estimatedVolume: 1200,
    difficulty: 4,
    wordTarget: 4400,
    intro:
      "Toda landing pode dobrar de CVR — desde que você teste a hipótese certa. Aqui estão 23 vencedoras e por que funcionaram.",
    outline: [
      { h2: "Como priorizar hipóteses (ICE/PIE)" },
      { h2: "Experimentos 1-23" },
      { h2: "Análise estatística: chega de 'achismo'" },
      { h2: "Stack de CRO 2026" },
    ],
    data: ["Optimizely: 1 em 8 testes vence; só 30% replica"],
    tables: [
      {
        title: "23 experimentos x uplift médio",
        columns: ["Exp", "Hipótese", "Uplift", "Receita"],
        rowsHint: "23 linhas",
      },
    ],
    visuals: ["Print A vs B de 5 experimentos"],
    cta: { primary: "Auditar meu CRO", href: "/contato" },
    internalLinks: ["/blog/conversao", "/landing-pages"],
  },
  {
    week: 15,
    slug: "design-sistemas-marca-coerente",
    title: "Design Systems para marcas: a estrutura que dá escala visual",
    meta:
      "Como construir um design system para marcas: tokens, componentes, governança e ROI.",
    pillar: "solucoes-web",
    targetKeyword: "design system",
    estimatedVolume: 1900,
    difficulty: 4,
    wordTarget: 3800,
    intro:
      "Toda marca que escala precisa de um design system — ou paga retrabalho em cada nova peça.",
    outline: [
      { h2: "Tokens: cor, tipo, espaçamento e motion" },
      { h2: "Componentes acessíveis (WCAG 2.2)" },
      { h2: "Governança e versionamento" },
      { h2: "ROI: economia em peças e velocidade" },
    ],
    data: ["Forrester: DS reduz custo de design em 47%"],
    tables: [
      {
        title: "Camadas do DS e responsáveis",
        columns: ["Camada", "Output", "Time"],
        rowsHint: "5 camadas",
      },
    ],
    visuals: ["Anatomia de token em código"],
    cta: { primary: "Construir meu DS", href: "/desenvolvimento" },
    internalLinks: ["/desenvolvimento", "/criacao-sites"],
  },
  {
    week: 16,
    slug: "instagram-pequenas-empresas-2026",
    title: "Instagram para pequenas empresas em 2026: o que ainda funciona",
    meta:
      "Estratégia atual de Instagram para PME: formatos, frequência, copy, criativos e métricas que importam.",
    pillar: "redes-sociais",
    targetKeyword: "instagram para pequenas empresas",
    estimatedVolume: 7200,
    difficulty: 3,
    wordTarget: 3400,
    intro:
      "Esquece dancinha. Em 2026, o Instagram que vende para PME tem 4 movimentos — e nenhum deles é 'postar todo dia'.",
    outline: [
      { h2: "Os 4 formatos que ainda escalam" },
      { h2: "Frequência ideal por segmento" },
      { h2: "Copy + CTA: estruturas que convertem em DM" },
      { h2: "Bio e destaques: o setup que captura lead" },
      { h2: "Métricas: salvos > curtidas" },
    ],
    data: ["Meta: Reels têm 22% mais alcance vs feed estático"],
    tables: [
      {
        title: "Segmento x frequência ideal",
        columns: ["Segmento", "Reels/sem", "Carrossel/sem", "Stories/dia"],
        rowsHint: "8 segmentos",
      },
    ],
    visuals: ["Print de bio otimizada"],
    cta: { primary: "Gestão profissional do meu Instagram", href: "/servicos/gestao-redes-sociais" },
    internalLinks: ["/servicos/gestao-redes-sociais"],
  },
  {
    week: 17,
    slug: "tiktok-para-empresas-locais",
    title: "TikTok para empresas locais: como gerar fila de clientes na porta",
    meta:
      "Como negócios locais estão usando TikTok para gerar fila de cliente. Formatos, ganchos e mensuração.",
    pillar: "redes-sociais",
    targetKeyword: "tiktok para empresas",
    estimatedVolume: 1600,
    difficulty: 3,
    wordTarget: 3000,
    intro:
      "Restaurante, salão, clínica, oficina: o TikTok virou Google de bairro. Veja os 9 formatos que multiplicam visita física.",
    outline: [
      { h2: "Por que o TikTok virou descoberta local" },
      { h2: "9 formatos que funcionam para local" },
      { h2: "Mensuração: como saber se trouxe gente" },
      { h2: "Integração com GMN" },
    ],
    data: ["TikTok: 75% dos usuários descobrem negócios locais no app"],
    tables: [
      {
        title: "9 formatos x esforço x retorno",
        columns: ["Formato", "Esforço", "Reach médio", "Visitas geradas"],
        rowsHint: "9 linhas",
      },
    ],
    visuals: ["Galeria de 9 exemplos reais"],
    cta: { primary: "Quero TikTok que traz cliente", href: "/servicos/gestao-redes-sociais" },
    internalLinks: ["/servicos/gestao-redes-sociais", "/google-meu-negocio"],
  },
  {
    week: 18,
    slug: "marketing-de-conteudo-pilares-clusters",
    title: "Marketing de Conteúdo: como construir pilares e clusters que ranqueiam",
    meta:
      "Estratégia de pilares e clusters para SEO em 2026: pesquisa, arquitetura, calendário e mensuração.",
    pillar: "seo",
    targetKeyword: "marketing de conteúdo",
    estimatedVolume: 4900,
    difficulty: 4,
    wordTarget: 4200,
    intro:
      "Conteúdo solto não ranqueia mais. O Google quer ver autoridade temática — pilares + clusters interligados. Veja como construir.",
    outline: [
      { h2: "Como o Google avalia autoridade temática em 2026" },
      { h2: "Pesquisa: do keyword research ao topic modeling" },
      { h2: "Arquitetura: hub + spoke + glossário" },
      { h2: "Calendário editorial de 12 meses" },
      { h2: "Mensuração: cobertura, posições e receita atribuída" },
    ],
    data: ["Ahrefs: clusters bem feitos +89% tráfego em 6 meses"],
    tables: [
      {
        title: "Estrutura de um cluster — pilar + 8 spokes",
        columns: ["Tipo", "Tamanho", "Internal links", "Refresh"],
        rowsHint: "Pilar e tipos de spoke",
      },
    ],
    visuals: ["Mapa de cluster anotado"],
    cta: { primary: "Construir meu cluster", href: "/blog" },
    internalLinks: ["/blog", "/servicos/seo"],
  },
  {
    week: 19,
    slug: "email-marketing-pme-2026",
    title: "E-mail Marketing em 2026: o canal mais subestimado do digital",
    meta:
      "Por que e-mail ainda é o canal de maior ROI em 2026. Segmentação, automação, deliverability e métricas.",
    pillar: "marketing-digital",
    targetKeyword: "e-mail marketing",
    estimatedVolume: 6600,
    difficulty: 3,
    wordTarget: 3400,
    intro:
      "Todo mundo grita social, mas o e-mail entrega 42:1 de ROI. Aqui está o playbook que ainda funciona em 2026.",
    outline: [
      { h2: "Deliverability: SPF, DKIM, DMARC e BIMI" },
      { h2: "Segmentação que vende" },
      { h2: "Automações essenciais (boas-vindas, abandono, reativação)" },
      { h2: "Copy e design para inbox em 2026" },
      { h2: "KPIs reais: open rate pós-Apple MPP" },
    ],
    data: ["Litmus: ROI mediano e-mail 36:1; top performers 42:1"],
    tables: [
      {
        title: "Automações essenciais e impacto",
        columns: ["Automação", "Trigger", "Receita típica"],
        rowsHint: "6 automações",
      },
    ],
    visuals: ["Print de fluxo de e-mail"],
    cta: { primary: "Implantar e-mail marketing", href: "/automacao" },
    internalLinks: ["/automacao", "/servicos"],
  },
  {
    week: 20,
    slug: "lgpd-marketing-digital-conformidade",
    title: "LGPD no marketing digital: conformidade sem perder conversão",
    meta:
      "Guia prático de LGPD para times de marketing: consentimento, base legal, retenção e auditoria.",
    pillar: "marketing-digital",
    targetKeyword: "lgpd marketing digital",
    estimatedVolume: 1100,
    difficulty: 4,
    wordTarget: 3200,
    intro:
      "Multa de LGPD destrói margem. E dá para ser conforme sem matar a captação. Veja o que muda em 2026.",
    outline: [
      { h2: "O que a ANPD passou a fiscalizar em 2025-2026" },
      { h2: "Bases legais para marketing (legítimo interesse vs consentimento)" },
      { h2: "Banner de cookies que não destrói CVR" },
      { h2: "Retenção e direitos do titular" },
      { h2: "Auditoria: checklist de 22 itens" },
    ],
    data: ["ANPD: +47% sanções em 2025 vs 2024"],
    tables: [
      {
        title: "Operações comuns x base legal recomendada",
        columns: ["Operação", "Base legal", "Risco"],
        rowsHint: "10 operações",
      },
    ],
    visuals: ["Wireframe de banner conforme"],
    cta: { primary: "Auditar minha conformidade", href: "/contato" },
    internalLinks: ["/politica-privacidade", "/servicos"],
  },
  {
    week: 21,
    slug: "performance-web-core-web-vitals",
    title: "Performance Web em 2026: como atingir LCP <1s em sites reais",
    meta:
      "Técnicas reais para LCP <1s: edge rendering, preload, fonts, imagens e JS budget. Com benchmarks.",
    pillar: "solucoes-web",
    targetKeyword: "core web vitals",
    estimatedVolume: 2400,
    difficulty: 4,
    wordTarget: 3800,
    intro:
      "LCP <1s não é mito — é arquitetura. Aqui estão as decisões técnicas que tiram seus segundos.",
    outline: [
      { h2: "Edge rendering vs SSR vs SSG" },
      { h2: "Imagens: AVIF, fetchpriority, sizes responsivos" },
      { h2: "Fontes: subset, preload, font-display" },
      { h2: "JS budget e island architecture" },
      { h2: "Cache de borda e revalidação" },
    ],
    data: ["Chrome UX: sites com LCP <1.5s convertem 23% mais"],
    tables: [
      {
        title: "Decisão técnica x impacto típico em LCP",
        columns: ["Decisão", "Impacto LCP", "Esforço"],
        rowsHint: "10 decisões",
      },
    ],
    visuals: ["Waterfall antes/depois"],
    cta: { primary: "Acelerar meu site", href: "/desenvolvimento" },
    internalLinks: ["/desenvolvimento", "/seo"],
  },
  {
    week: 22,
    slug: "marketplace-vs-loja-propria-roi",
    title: "Marketplace vs Loja Própria: análise de ROI por segmento",
    meta:
      "Quando vender em marketplace, quando ter loja própria e quando fazer os dois. Análise por segmento.",
    pillar: "solucoes-web",
    targetKeyword: "marketplace vs loja própria",
    estimatedVolume: 1500,
    difficulty: 3,
    wordTarget: 3400,
    intro:
      "Marketplace é aluguel; loja própria é patrimônio. Veja em que ponto da maturidade o jogo vira para cada um.",
    outline: [
      { h2: "Estrutura de custos comparada" },
      { h2: "Take rate real por marketplace 2026" },
      { h2: "Quando migrar para loja própria" },
      { h2: "Estratégia híbrida que escala" },
    ],
    data: ["NIQ: marketplaces respondem por 78% do e-commerce BR"],
    tables: [
      {
        title: "Take rate efetivo por marketplace",
        columns: ["Marketplace", "Comissão", "Frete", "Publi", "Take real"],
        rowsHint: "6 marketplaces",
      },
    ],
    visuals: ["Gráfico de margem ao longo do crescimento"],
    cta: { primary: "Estratégia híbrida para meu e-commerce", href: "/marketplace" },
    internalLinks: ["/marketplace", "/desenvolvimento"],
  },
  {
    week: 23,
    slug: "ia-generativa-aplicada-marketing",
    title: "IA generativa aplicada ao marketing: 14 usos com ROI mensurável",
    meta:
      "14 aplicações reais de IA generativa em marketing com ROI. Prompts, ferramentas e guardrails.",
    pillar: "marketing-digital",
    targetKeyword: "ia generativa marketing",
    estimatedVolume: 2100,
    difficulty: 4,
    wordTarget: 3800,
    intro:
      "Esqueça hype. Aqui estão 14 usos de IA que entregaram economia ou receita auditável em 2025-2026.",
    outline: [
      { h2: "Os 14 usos (com case real para cada)" },
      { h2: "Stack de IA para marketing 2026" },
      { h2: "Guardrails para evitar marca queimada" },
      { h2: "Mensuração de ROI por uso" },
    ],
    data: ["Gartner: 38% dos times de marketing usam IA generativa em produção"],
    tables: [
      {
        title: "14 usos x economia x receita",
        columns: ["Uso", "Economia/mês", "Receita/mês", "Ferramentas"],
        rowsHint: "14 linhas",
      },
    ],
    visuals: ["Print de prompt avançado anotado"],
    cta: { primary: "Implantar IA no meu marketing", href: "/ia" },
    internalLinks: ["/ia", "/automacao"],
  },
  {
    week: 24,
    slug: "como-escolher-agencia-marketing-2026",
    title: "Como escolher uma agência de marketing em 2026: 27 perguntas que separam profissionais de picaretas",
    meta:
      "27 perguntas obrigatórias para entrevistar agência. Critérios, red flags e modelo de contrato auditável.",
    pillar: "marketing-digital",
    targetKeyword: "como escolher agência de marketing",
    estimatedVolume: 1700,
    difficulty: 3,
    wordTarget: 3600,
    intro:
      "Trocar de agência custa 4 a 6 meses de aprendizado. Faça as 27 perguntas certas antes de assinar — não depois.",
    outline: [
      { h2: "Por que 68% das PMEs trocam de agência em <12 meses" },
      { h2: "Bloco 1 — 9 perguntas técnicas" },
      { h2: "Bloco 2 — 9 perguntas comerciais" },
      { h2: "Bloco 3 — 9 perguntas contratuais" },
      { h2: "Red flags imperdoáveis" },
      { h2: "Modelo de contrato auditável (template)" },
    ],
    data: ["Sebrae: 68% das PMEs trocam de agência em menos de 12 meses"],
    tables: [
      {
        title: "27 perguntas e o que cada resposta revela",
        columns: ["Pergunta", "Resposta boa", "Red flag"],
        rowsHint: "27 linhas",
      },
    ],
    visuals: ["Checklist imprimível em PDF"],
    cta: { primary: "Conhecer a 0web sem compromisso", href: "/contato" },
    internalLinks: ["/contato", "/sobre", "/cases"],
  },
];

export const SKYSCRAPER_TOTALS = {
  articles: SKYSCRAPER_CALENDAR.length,
  totalWords: SKYSCRAPER_CALENDAR.reduce((a, x) => a + x.wordTarget, 0),
  byPillar: SKYSCRAPER_CALENDAR.reduce<Record<string, number>>((acc, x) => {
    acc[x.pillar] = (acc[x.pillar] ?? 0) + 1;
    return acc;
  }, {}),
};
