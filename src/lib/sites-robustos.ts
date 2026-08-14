// Cluster de conteúdo "Criação de Sites Robustos" — pilar + 5 satélites.
// Fonte única de verdade para rotas, interlinking, "Leia também" e sitemap.

export type ClusterSection = {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ClusterFaq = { q: string; a: string };

export type ClusterArticle = {
  slug: string;
  title: string;
  h1: string;
  seoTitle: string;
  description: string;
  intro: string[];
  sections: ClusterSection[];
  faq: ClusterFaq[];
  readTime: string;
  anchor: string; // texto-âncora usado nos blocos "Leia também"
};

export const CLUSTER_BASE_PATH = "/sites-robustos";
export const CLUSTER_OG_IMAGE = "https://0web.com.br/og-default.jpg";

export const PILLAR = {
  seoTitle: "Criação de Sites Robustos: guia completo para sites que vendem",
  h1: "Criação de sites robustos: velocidade, SEO e conversão no mesmo projeto",
  description:
    "Guia completo de criação de sites robustos: performance, Core Web Vitals, SEO técnico, estrutura de páginas que converte, integrações e manutenção contínua.",
};

export const SATELLITES: ClusterArticle[] = [
  {
    slug: "velocidade-e-core-web-vitals",
    anchor: "velocidade e Core Web Vitals",
    readTime: "9 min",
    title: "Velocidade e Core Web Vitals",
    h1: "Velocidade e Core Web Vitals: como deixar o site rápido de verdade",
    seoTitle: "Velocidade e Core Web Vitals: site rápido que converte | 0WEB",
    description:
      "LCP, INP e CLS explicados sem enrolação: o que mede cada métrica, quanto custa cada segundo de lentidão e o checklist técnico para acelerar o site.",
    intro: [
      "Velocidade não é vaidade técnica: é dinheiro. Cada segundo a mais de carregamento derruba a taxa de conversão, encarece o clique no Google Ads e reduz a quantidade de páginas que o robô do Google consegue rastrear por dia.",
      "Neste artigo você entende as três métricas que o Google usa para julgar a experiência do seu site — LCP, INP e CLS — e sai com um plano prático de correção, na ordem certa de prioridade.",
    ],
    sections: [
      {
        h2: "O que são LCP, INP e CLS",
        paragraphs: [
          "LCP (Largest Contentful Paint) mede quanto tempo leva até o maior elemento visível da dobra aparecer — geralmente a imagem do topo ou o título principal. A meta é abaixo de 2,5 segundos no 4G médio brasileiro, não no wi-fi do escritório.",
          "INP (Interaction to Next Paint) substituiu o antigo FID e mede a resposta real do site ao clique: você toca no menu e o menu abre em quanto tempo? Acima de 200 ms o usuário percebe travamento.",
          "CLS (Cumulative Layout Shift) mede o pulo do conteúdo enquanto a página carrega. É o motivo número um de cliques errados no celular. Meta: 0,1 — e em páginas bem construídas o número real é zero.",
        ],
        bullets: [
          "LCP bom: até 2,5s · precisa melhorar: 2,5s a 4s · ruim: acima de 4s",
          "INP bom: até 200ms · ruim: acima de 500ms",
          "CLS bom: até 0,1 · ruim: acima de 0,25",
        ],
      },
      {
        h2: "As cinco causas mais comuns de lentidão",
        paragraphs: [
          "Na prática, quase todo site lento que auditamos repete o mesmo conjunto de erros. Não é sofisticado: é acúmulo.",
          "Imagens pesadas lideram com folga. Um banner de 2 MB exportado direto do editor gráfico destrói o LCP em qualquer conexão móvel. A correção é converter para WebP ou AVIF, servir tamanhos diferentes por breakpoint e declarar largura e altura no HTML.",
          "Em seguida vêm os plugins e scripts de terceiros. Cada pixel de rastreamento, chat externo e widget de avaliação adiciona requisições bloqueantes. A regra é simples: carregue o essencial no primeiro paint e adie o resto.",
        ],
        bullets: [
          "Imagens sem compressão e sem dimensões declaradas",
          "Fontes externas bloqueando a renderização do texto",
          "Excesso de scripts de terceiros carregados de forma síncrona",
          "Ausência de cache e de CDN na borda",
          "Temas genéricos que carregam CSS e JS de recursos que a página nem usa",
        ],
      },
      {
        h2: "Checklist técnico de aceleração",
        paragraphs: [
          "A ordem importa. Corrigir cache antes de resolver imagens é otimizar o transporte de peso desnecessário. Siga de cima para baixo.",
        ],
        bullets: [
          "Comprimir e converter todas as imagens para formatos modernos",
          "Definir width, height e loading=lazy fora da dobra",
          "Pré-carregar apenas a imagem do LCP com fetchpriority alto",
          "Servir fontes locais com font-display: swap",
          "Dividir o JavaScript por rota e adiar o que está abaixo da dobra",
          "Ativar cache de longa duração para assets versionados",
          "Distribuir o conteúdo por CDN próxima do usuário final",
          "Reservar espaço para banners e embeds para manter o CLS em zero",
        ],
      },
      {
        h2: "Como medir sem se enganar",
        paragraphs: [
          "Teste de laboratório (Lighthouse, PageSpeed) é diagnóstico; dado de campo (CrUX, Search Console) é a verdade. Um site pode marcar 98 no laboratório e reprovar em campo porque a audiência real está em 4G num celular de entrada.",
          "Nosso padrão de entrega é rodar Lighthouse em modo mobile com throttling, comparar com o relatório de Core Web Vitals do Search Console após 28 dias e só então declarar a otimização concluída.",
        ],
      },
    ],
    faq: [
      {
        q: "Quanto tempo leva para melhorar os Core Web Vitals de um site existente?",
        a: "As correções técnicas costumam levar de uma a três semanas. Já o reflexo no relatório de campo do Search Console aparece após 28 dias, porque a métrica é calculada sobre uma janela móvel de visitas reais.",
      },
      {
        q: "Site rápido melhora o posicionamento no Google?",
        a: "Velocidade é um sinal de classificação, mas de peso menor que relevância de conteúdo. O ganho maior é indireto: páginas rápidas têm menos abandono, mais páginas por sessão e melhor taxa de conversão, o que reforça os sinais de qualidade.",
      },
      {
        q: "Vale a pena migrar de WordPress para acelerar?",
        a: "Nem sempre. Muitos sites WordPress lentos melhoram muito só com limpeza de plugins, cache e imagens. A migração se justifica quando o tema é engessado, o site precisa de integrações pesadas ou o custo de manutenção já supera o de reconstrução.",
      },
      {
        q: "CLS zero é possível de verdade?",
        a: "Sim. Basta reservar espaço fixo para imagens, banners, embeds e blocos carregados depois. A maior parte dos sites com CLS alto simplesmente não declara dimensões.",
      },
      {
        q: "Velocidade reduz o custo do Google Ads?",
        a: "Reduz. A experiência da página de destino entra no Índice de Qualidade, e um índice melhor baixa o custo por clique para a mesma posição.",
      },
    ],
  },
  {
    slug: "seo-tecnico-para-sites-institucionais",
    anchor: "SEO técnico para sites institucionais",
    readTime: "10 min",
    title: "SEO técnico para sites institucionais",
    h1: "SEO técnico para sites institucionais: a base que sustenta o ranqueamento",
    seoTitle: "SEO técnico para sites institucionais: guia prático | 0WEB",
    description:
      "Indexação, canonical, dados estruturados, sitemap, arquitetura de URLs e conteúdo local: o SEO técnico que faz um site institucional aparecer no Google.",
    intro: [
      "Conteúdo bom em site tecnicamente quebrado não ranqueia. SEO técnico é a camada invisível que garante que o Google encontre, entenda e confie nas suas páginas.",
      "Este guia cobre o que realmente move o ponteiro em sites institucionais brasileiros — sem truques e sem receita genérica importada.",
    ],
    sections: [
      {
        h2: "Rastreamento e indexação: o pré-requisito",
        paragraphs: [
          "Antes de falar em palavra-chave, garanta que a página pode ser lida. Um robots.txt com Disallow amplo, uma meta noindex esquecida em ambiente de produção ou um conteúdo que só aparece após execução de JavaScript pesado bastam para zerar a visibilidade.",
          "O teste é direto: abra a URL no teste de resultados avançados do Google e confirme que o HTML retornado já contém o texto principal. Se o conteúdo depende de clique ou de scroll, ele provavelmente não está sendo indexado.",
        ],
        bullets: [
          "robots.txt liberando as rotas públicas",
          "Sitemap XML segmentado e atualizado automaticamente",
          "Renderização no servidor para o conteúdo principal",
          "Search Console conectado e monitorando cobertura",
        ],
      },
      {
        h2: "Canonical, duplicidade e paginação",
        paragraphs: [
          "Sites institucionais criam duplicidade sem perceber: a mesma página acessível com e sem barra final, com www e sem www, com parâmetros de campanha e em variações de cidade quase idênticas.",
          "A tag canonical precisa apontar sempre para a própria URL preferida, em versão absoluta e com o domínio definitivo. Canonical apontando para a home é o erro clássico que faz o Google atribuir o conteúdo da página interna à página inicial e simplesmente ignorar todo o restante.",
        ],
      },
      {
        h2: "Dados estruturados que valem a pena",
        paragraphs: [
          "Nem todo schema gera resultado aprimorado. Para site institucional, o conjunto útil é enxuto: Organization ou LocalBusiness no nível do site, BreadcrumbList nas páginas internas, Service nas páginas de serviço e FAQPage quando existe uma seção real de perguntas na página.",
          "Marcar o que não está visível na página é violação de diretriz e pode gerar ação manual. O schema descreve o conteúdo — ele não substitui o conteúdo.",
        ],
        bullets: [
          "Organization / LocalBusiness com NAP consistente",
          "BreadcrumbList em toda página com mais de um nível",
          "Service nas páginas comerciais",
          "FAQPage apenas quando a FAQ existe visivelmente",
        ],
      },
      {
        h2: "Arquitetura de URLs e silos de conteúdo",
        paragraphs: [
          "URL é promessa de conteúdo. Prefira caminhos curtos, em português, sem parâmetros e organizados por tema. Um silo bem montado concentra autoridade: a página pilar recebe links de todos os satélites e devolve links contextualizados para cada um.",
          "Na prática, isso significa agrupar tudo que fala do mesmo assunto sob um mesmo prefixo e cruzar links com texto-âncora descritivo, não com 'clique aqui'.",
        ],
      },
      {
        h2: "Sinais locais para empresas brasileiras",
        paragraphs: [
          "Para negócios com atendimento regional, o SEO técnico se une ao local: perfil do Google Empresa completo, NAP idêntico em todas as citações, páginas por cidade e por bairro com conteúdo genuinamente diferente e incorporação de mapa apenas quando faz sentido.",
          "Páginas de cidade clonadas com troca de nome são detectadas e desvalorizadas. A diferenciação precisa vir de referências reais: bairros, concorrência local, casos e prazos de atendimento daquela região.",
        ],
      },
    ],
    faq: [
      {
        q: "Quanto tempo o SEO técnico leva para dar resultado?",
        a: "Correções de indexação podem aparecer em dias. Ganhos de posicionamento consistentes costumam levar de três a seis meses, porque dependem de rastreamento, reavaliação e acúmulo de sinais.",
      },
      {
        q: "Preciso de blog para ranquear um site institucional?",
        a: "Não é obrigatório, mas ajuda muito. Sem conteúdo novo, o site compete apenas com as páginas de serviço, que atendem um número limitado de intenções de busca.",
      },
      {
        q: "Dados estruturados garantem estrela de avaliação no Google?",
        a: "Não. O schema torna o site elegível ao resultado aprimorado; a exibição é decisão do Google e depende de avaliações legítimas e visíveis na página.",
      },
      {
        q: "Devo criar uma página para cada cidade que atendo?",
        a: "Só se conseguir escrever conteúdo real e diferente para cada uma. Dez páginas fortes valem mais que cem páginas clonadas.",
      },
      {
        q: "O que checar primeiro num site que não aparece no Google?",
        a: "Nessa ordem: indexação no Search Console, meta robots, canonical, sitemap e renderização do conteúdo no HTML servido.",
      },
    ],
  },
  {
    slug: "site-que-converte-estrutura-de-paginas",
    anchor: "estrutura de páginas que converte",
    readTime: "9 min",
    title: "Estrutura de páginas que converte",
    h1: "Site que converte: a estrutura de página que transforma visita em contato",
    seoTitle: "Site que converte: estrutura de páginas passo a passo | 0WEB",
    description:
      "Do herói ao CTA final: a estrutura de página que gera contato. Hierarquia visual, prova social, quebra de objeção e chamadas para ação que funcionam no celular.",
    intro: [
      "Tráfego sem conversão é custo. A diferença entre um site bonito e um site que vende quase nunca está no visual — está na sequência de argumentos e na fricção do caminho até o contato.",
      "Abaixo está a estrutura que usamos como padrão em páginas comerciais, testada em serviços locais, indústrias e prestadores de serviço.",
    ],
    sections: [
      {
        h2: "A dobra decide tudo",
        paragraphs: [
          "O visitante decide em poucos segundos se continua ou volta. A dobra precisa responder três perguntas ao mesmo tempo: o que vocês fazem, para quem e qual é o próximo passo.",
          "Título direto com o benefício, subtítulo com a prova ou o diferencial e um botão de ação visível sem rolagem. No celular, o botão precisa estar acima da dobra de verdade, não escondido depois de uma imagem gigante.",
        ],
        bullets: [
          "H1 com benefício claro e palavra-chave comercial",
          "Subtítulo com diferencial verificável",
          "CTA principal visível sem rolar a tela",
          "Elemento de confiança logo abaixo (números, selos, clientes)",
        ],
      },
      {
        h2: "Ordem das seções que sustenta a decisão",
        paragraphs: [
          "Depois da dobra, cada bloco tem função. Não é decoração: é condução.",
          "Comece pelo problema que o cliente reconhece, apresente a solução em linguagem de resultado, mostre prova social, detalhe o processo para reduzir a percepção de risco, apresente preço ou faixa de investimento e feche com a chamada final.",
        ],
        bullets: [
          "Problema — o cliente precisa se reconhecer no texto",
          "Solução — benefício antes de funcionalidade",
          "Prova — depoimentos, casos, números reais",
          "Processo — o que acontece depois do contato",
          "Investimento — faixa de preço ou critério de orçamento",
          "FAQ — quebra de objeção",
          "CTA final — repetição da ação principal",
        ],
      },
      {
        h2: "Quebra de objeção é conteúdo, não enfeite",
        paragraphs: [
          "As objeções reais são poucas e sempre as mesmas: preço, prazo, confiança e esforço. Se a página não responde as quatro, o visitante sai para pesquisar em outro lugar e raramente volta.",
          "Uma FAQ bem construída aumenta conversão porque antecipa a dúvida no momento exato em que ela aparece. E, quando marcada com FAQPage, ainda ocupa mais espaço na página de resultados.",
        ],
      },
      {
        h2: "Chamadas para ação sem fricção",
        paragraphs: [
          "Formulário longo é o maior ladrão de conversão em serviço. Peça o mínimo para qualificar e deixe o resto para a conversa.",
          "Nosso padrão é um funil curto de poucas perguntas que já classifica a intenção e leva o contato direto para o atendimento, com a mensagem preenchida. O visitante não digita nada além do essencial e o time recebe o contexto completo.",
        ],
        bullets: [
          "Botão sempre com verbo de ação e resultado esperado",
          "Contato flutuante fixo no celular",
          "Formulário com o mínimo de campos possível",
          "Página de agradecimento com próximo passo claro",
        ],
      },
    ],
    faq: [
      {
        q: "Quantos CTAs uma página deve ter?",
        a: "Um objetivo principal, repetido em pontos naturais de decisão: dobra, após a prova social, após o preço e no fechamento. Múltiplos objetivos concorrentes reduzem a conversão.",
      },
      {
        q: "Preço na página aumenta ou diminui conversão?",
        a: "Aumenta a qualidade do lead. Mesmo sem valor fechado, informar faixa ou critério de orçamento filtra contatos incompatíveis e acelera a negociação.",
      },
      {
        q: "Formulário ou contato direto pelo WhatsApp?",
        a: "No Brasil, conversa direta converte mais em serviços. O ideal é um funil curto que qualifica e envia a conversa já contextualizada para o atendimento.",
      },
      {
        q: "Depoimento genérico ajuda?",
        a: "Pouco. Prova social funciona quando é específica: nome, empresa, problema resolvido e resultado. Elogio vago não quebra objeção.",
      },
      {
        q: "Página longa ou curta converte mais?",
        a: "Depende da complexidade e do valor. Compra simples pede página curta; serviço consultivo de ticket alto exige mais argumentação e prova.",
      },
    ],
  },
  {
    slug: "integracoes-e-automacoes",
    anchor: "integrações e automações",
    readTime: "8 min",
    title: "Integrações e automações",
    h1: "Integrações e automações: o site como parte da operação comercial",
    seoTitle: "Integrações e automações para sites empresariais | 0WEB",
    description:
      "CRM, WhatsApp, pagamentos, ERP e automação de atendimento: como integrar o site à operação para não perder lead e reduzir trabalho manual.",
    intro: [
      "Um site robusto não termina no formulário. Ele entrega o lead dentro do processo comercial, no formato certo, com o histórico junto — e sem ninguém copiando dado na mão.",
      "Este artigo mostra as integrações que mais reduzem perda de oportunidade em empresas de pequeno e médio porte.",
    ],
    sections: [
      {
        h2: "O lead precisa cair em algum lugar confiável",
        paragraphs: [
          "E-mail de formulário é o pior destino possível: cai em spam, some na caixa de entrada e não gera histórico. O mínimo aceitável é registrar o contato em banco próprio e espelhar em CRM ou planilha operacional.",
          "Com registro estruturado você consegue medir origem, tempo de resposta e taxa de fechamento por canal — informação que sustenta qualquer decisão de investimento em mídia.",
        ],
        bullets: [
          "Registro persistente de cada contato com origem e página",
          "Notificação imediata para o time comercial",
          "Espelhamento em CRM com estágio de funil",
          "Protocolo visível para o cliente e para o atendimento",
        ],
      },
      {
        h2: "WhatsApp com contexto, não só um botão",
        paragraphs: [
          "O botão flutuante puro joga o visitante numa conversa vazia, e o atendente começa do zero. A versão profissional monta a mensagem automaticamente com serviço de interesse, respostas do funil, localidade e página de origem.",
          "O ganho é duplo: o cliente não repete informação e o time responde já sabendo do que se trata, o que encurta o ciclo de venda.",
        ],
      },
      {
        h2: "Pagamentos e catálogo",
        paragraphs: [
          "Quando parte da oferta é padronizada, vale transformar em produto comprável direto no site: plano mensal, pacote fechado, serviço com escopo único. Isso separa a demanda transacional da consultiva e libera o time para o que exige negociação.",
          "Serviço digital não tem quantidade nem variação de tamanho. Modelar como se fosse produto físico gera carrinho confuso e abandono.",
        ],
      },
      {
        h2: "Automação de rotina",
        paragraphs: [
          "As automações de maior retorno são as mais simples: confirmação automática para o cliente, alerta interno quando um lead fica sem resposta, lembrete de follow-up e relatório semanal de origem de contatos.",
          "Automatizar antes de organizar o processo só acelera a bagunça. Primeiro defina os estágios do funil, depois automatize as passagens entre eles.",
        ],
        bullets: [
          "Confirmação imediata ao visitante",
          "Alerta de lead sem resposta",
          "Distribuição automática por tipo de serviço",
          "Relatório periódico por canal e campanha",
        ],
      },
    ],
    faq: [
      {
        q: "Preciso de um CRM caro para começar?",
        a: "Não. O essencial é ter todo contato registrado com origem, data e status. Um CRM simples ou até um painel próprio resolve nos primeiros meses.",
      },
      {
        q: "Dá para integrar o site ao meu ERP?",
        a: "Sim, quando o ERP oferece API ou exportação. Quando não oferece, o caminho é integração intermediária por arquivo ou automação de importação.",
      },
      {
        q: "Automação substitui o atendimento humano?",
        a: "Não. Ela elimina o trabalho repetitivo e garante que ninguém fique sem resposta. A negociação continua sendo humana.",
      },
      {
        q: "Vender serviço direto no site canibaliza o orçamento personalizado?",
        a: "Ao contrário: separa demandas. Escopo padronizado vira compra imediata e o time foca nos projetos que realmente exigem proposta.",
      },
      {
        q: "Como saber de onde veio cada lead?",
        a: "Gravando a página de origem, os parâmetros de campanha e a sessão do visitante junto com o contato — e não confiando apenas no que o cliente responde.",
      },
    ],
  },
  {
    slug: "manutencao-seguranca-e-escala",
    anchor: "manutenção, segurança e escala",
    readTime: "8 min",
    title: "Manutenção, segurança e escala",
    h1: "Manutenção, segurança e escala: o que mantém um site robusto de pé",
    seoTitle: "Manutenção, segurança e escala de sites empresariais | 0WEB",
    description:
      "Backup, atualizações, monitoramento, LGPD e capacidade de crescimento: o plano de manutenção que evita prejuízo e mantém o site rápido ao longo do tempo.",
    intro: [
      "Site não é obra entregue: é ativo em operação. Sem manutenção, o desempenho degrada, as dependências envelhecem e a exposição a incidentes cresce mês a mês.",
      "Aqui está o que compõe um plano de manutenção sério — e por que ele custa muito menos do que um site fora do ar em plena campanha.",
    ],
    sections: [
      {
        h2: "Backup e recuperação testada",
        paragraphs: [
          "Backup que nunca foi restaurado é esperança, não garantia. O plano precisa definir frequência, retenção, local separado da produção e — principalmente — teste periódico de restauração.",
          "Para site institucional com blog e leads, o padrão razoável é backup diário de banco, semanal completo e retenção de pelo menos trinta dias.",
        ],
      },
      {
        h2: "Segurança prática",
        paragraphs: [
          "A maioria dos incidentes em sites de PME não é ataque sofisticado: é dependência desatualizada, senha fraca e permissão excessiva.",
          "O básico bem feito resolve quase tudo: HTTPS obrigatório, cabeçalhos de segurança configurados, atualização periódica de dependências, autenticação forte no painel e princípio do menor privilégio no banco de dados.",
        ],
        bullets: [
          "HTTPS com redirecionamento forçado",
          "Cabeçalhos de segurança (CSP, HSTS, Referrer-Policy)",
          "Atualização mensal de dependências",
          "Acesso administrativo com autenticação forte",
          "Regras de permissão restritas por perfil de usuário",
        ],
      },
      {
        h2: "Monitoramento que avisa antes do cliente",
        paragraphs: [
          "Descobrir queda pelo telefone do cliente é o pior cenário. Monitoramento de disponibilidade, de erro de aplicação e de Core Web Vitals fecha o ciclo entre entrega e operação.",
          "Complementa o pacote um acompanhamento mensal de cobertura de indexação: página importante que saiu do índice é perda de receita silenciosa.",
        ],
      },
      {
        h2: "LGPD e tratamento de dados",
        paragraphs: [
          "Todo site que capta contato trata dado pessoal. Isso exige política de privacidade real, base legal declarada, canal para solicitação de exclusão e coleta limitada ao necessário.",
          "Dados de navegação e localidade estimada também entram nessa conta e precisam estar descritos com clareza na política — não em letra miúda genérica.",
        ],
      },
      {
        h2: "Escala sem retrabalho",
        paragraphs: [
          "Escalar é conseguir dobrar o número de páginas, produtos ou regiões atendidas sem reconstruir o site. Isso depende de componentes reutilizáveis, conteúdo em base de dados e rotas geradas por padrão, não copiadas à mão.",
          "Quando cada nova página exige um desenvolvedor, o crescimento trava. Quando a estrutura é modelada, o time comercial publica sozinho.",
        ],
      },
    ],
    faq: [
      {
        q: "Com que frequência um site precisa de manutenção?",
        a: "Verificações automáticas contínuas e uma revisão humana mensal cobrem bem a maioria dos sites institucionais.",
      },
      {
        q: "Site simples também precisa de plano de segurança?",
        a: "Sim. Ataques automatizados não escolhem alvo por porte — eles varrem a internet procurando versões vulneráveis conhecidas.",
      },
      {
        q: "O que fazer se o site sair do ar?",
        a: "Ter backup recente testado, acesso à hospedagem documentado e um responsável definido. Sem isso, o tempo de recuperação vira refém de terceiros.",
      },
      {
        q: "Preciso de política de privacidade mesmo sem loja?",
        a: "Precisa. Basta existir formulário, chat, analytics ou pixel de campanha para haver tratamento de dado pessoal.",
      },
      {
        q: "Quando o site precisa ser refeito em vez de mantido?",
        a: "Quando cada alteração simples exige esforço desproporcional, a base tecnológica não recebe mais atualizações ou o desempenho não melhora nem após otimização.",
      },
    ],
  },
];

export function getSatellite(slug: string): ClusterArticle | undefined {
  return SATELLITES.find((s) => s.slug === slug);
}

/** Blocos "Leia também": demais artigos do cluster, com texto-âncora descritivo. */
export function relatedArticles(currentSlug?: string): ClusterArticle[] {
  return SATELLITES.filter((s) => s.slug !== currentSlug);
}
