export type LeadSource =
  | "contact_form_whatsapp"
  | "servicos_form_whatsapp"
  | "trafego_pago_local_form"
  | "site_express"
  | string;

export type Testimonial = { name: string; role: string; text: string };
export type Stat = { n: string; l: string };
export type FAQ = { q: string; a: string };
export type CTACard = {
  icon: "layers" | "help" | "file" | "sparkles" | "message" | "package";
  title: string;
  desc: string;
  to: "/solicitar-orcamento" | "/servicos" | "/planos" | "/faq" | "/cases" | "/app" | "/contato";
  label: string;
  id: string;
  event: string;
};

export type ThankYouContent = {
  title: string;
  subtitle: string;
  whatsappMessage: string;
  planosLabel: string;
  finalCtaTo: "/solicitar-orcamento" | "/servicos/trafego-pago-local" | "/planos" | "/servicos/site-express";
  finalCtaLabel: string;
  channel: "contato" | "servicos" | "trafego_pago_local" | "site_express" | "outro";
  stats: Stat[];
  testimonials: Testimonial[];
  socialProofHeadline: string;
  /** Optional service-specific status timeline. */
  status?: { label: string; eta: string; desc: string }[];
  /** Optional SLA badge (e.g. "Em até 24h"). */
  slaBadge?: string;
  /** Optional FAQ adapted to the checkout method. */
  faq?: FAQ[];
  /** Optional source-specific CTA cards (overrides defaults). */
  ctaCards?: CTACard[];
};


const DEFAULT_STATS: Stat[] = [
  { n: "+200", l: "clientes ativos" },
  { n: "R$ 28M+", l: "em vendas geradas" },
  { n: "98%", l: "de satisfação" },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Carla M.", role: "Clínica de Estética · SP", text: "Em 45 dias dobramos os agendamentos com tráfego pago e site novo." },
  { name: "Rafael T.", role: "Escritório de Advocacia · RJ", text: "A 0WEB nos colocou no topo do Google em buscas locais. Recomendo!" },
  { name: "Juliana P.", role: "Loja de Móveis · MG", text: "Atendimento humano, relatórios claros e vendas reais todo mês." },
];

const DEFAULT: ThankYouContent = {
  title: "Recebemos seu contato!",
  subtitle: "Nossa equipe responde em até 1 hora útil. Enquanto isso, dê uma olhada nas opções abaixo.",
  whatsappMessage: "Acabei de enviar um formulário pelo site da 0WEB. Pode confirmar o recebimento?",
  planosLabel: "Pacotes a partir de R$499/mês",
  finalCtaTo: "/solicitar-orcamento",
  finalCtaLabel: "Solicitar diagnóstico",
  channel: "outro",
  stats: DEFAULT_STATS,
  testimonials: DEFAULT_TESTIMONIALS,
  socialProofHeadline: "Quem confia na 0WEB cresce todo mês",
};

const MAP: Record<string, ThankYouContent> = {
  contact_form_whatsapp: {
    ...DEFAULT,
    channel: "contato",
    title: "Mensagem enviada! 🚀",
    subtitle: "Nosso time comercial vai te chamar no WhatsApp em até 1 hora útil com uma proposta sob medida.",
    whatsappMessage: "Olá! Enviei um formulário no site e quero falar com um especialista da 0WEB.",
    finalCtaTo: "/solicitar-orcamento",
    finalCtaLabel: "Solicitar diagnóstico",
    socialProofHeadline: "Empresas que escolheram a 0WEB como parceira",
    stats: [
      { n: "+200", l: "empresas atendidas" },
      { n: "< 1h", l: "tempo médio de resposta" },
      { n: "98%", l: "de satisfação" },
    ],
  },
  servicos_form_whatsapp: {
    ...DEFAULT,
    channel: "servicos",
    title: "Sua proposta de serviços está a caminho",
    subtitle: "Vamos montar um pacote ideal de site + SEO + tráfego para o seu negócio. Resposta em até 1h útil.",
    whatsappMessage: "Olá! Enviei um formulário na página de serviços. Quero uma proposta personalizada da 0WEB.",
    planosLabel: "Compare planos e pacotes",
    finalCtaTo: "/planos",
    finalCtaLabel: "Ver planos completos",
    socialProofHeadline: "Pacotes completos que entregam resultado",
    stats: [
      { n: "+300", l: "sites entregues" },
      { n: "+5x", l: "ROI médio em 6 meses" },
      { n: "4.9/5", l: "nota dos clientes" },
    ],
    testimonials: [
      { name: "Marcos R.", role: "Restaurante · Curitiba", text: "Novo site + SEO triplicou as reservas em 3 meses." },
      { name: "Patrícia L.", role: "Estúdio de Pilates · BH", text: "Pacote completo, equipe presente. Vale cada centavo." },
      { name: "Eduardo S.", role: "Clínica Odontológica · POA", text: "Em 90 dias, 70% dos novos pacientes vieram do Google." },
    ],
  },
  trafego_pago_local_form: {
    ...DEFAULT,
    channel: "trafego_pago_local",
    title: "Pronto para vender mais com tráfego pago!",
    subtitle: "Vamos configurar suas campanhas no Google e Meta Ads. Em até 1h útil entramos em contato no WhatsApp.",
    whatsappMessage: "Olá! Quero começar com o tráfego pago local da 0WEB a partir de R$499/mês.",
    planosLabel: "Tráfego pago a partir de R$499/mês",
    finalCtaTo: "/servicos/trafego-pago-local",
    finalCtaLabel: "Ver detalhes do pacote",
    socialProofHeadline: "Negócios locais vendendo mais com tráfego pago",
    stats: [
      { n: "R$ 0,87", l: "custo médio por lead" },
      { n: "+7x", l: "ROAS médio" },
      { n: "72h", l: "para receber primeiros leads" },
    ],
    testimonials: [
      { name: "Anderson G.", role: "Auto Center · Campinas", text: "Saí de 5 para 40 orçamentos por semana com Google Ads." },
      { name: "Bruna F.", role: "Salão de Beleza · BSB", text: "Cada R$ 1 investido virou R$ 9 em serviços. Surreal." },
      { name: "Igor M.", role: "Imobiliária · Floripa", text: "Tráfego pago bem feito mudou meu funil. 3 vendas no 1º mês." },
    ],
  },
  site_express: {
    ...DEFAULT,
    channel: "site_express",
    title: "Pedido recebido! Seu site fica pronto em até 24h 🚀",
    subtitle: "Já recebemos seu briefing do Site Express. Vamos te chamar no WhatsApp em minutos para confirmar e iniciar a produção.",
    whatsappMessage: "Olá! Acabei de pedir meu Site Express em 24h pelo site da 0WEB. Pode confirmar o recebimento?",
    planosLabel: "Site Express · R$ 499 · entrega em 24h",
    finalCtaTo: "/servicos/site-express",
    finalCtaLabel: "Ver detalhes do Site Express",
    socialProofHeadline: "Negócios que saíram do zero ao site profissional em 24h",
    slaBadge: "Próximo contato em até 1 hora útil · Site no ar em até 24h",
    status: [
      { label: "1. Confirmação", eta: "Em até 1h útil", desc: "Te chamamos no WhatsApp para confirmar briefing, escopo e pagamento." },
      { label: "2. Produção", eta: "Mesmo dia", desc: "Nosso time monta seu site sob medida e te envia o link de prévia." },
      { label: "3. No ar", eta: "Em até 24h", desc: "Aprovou? Publicamos imediatamente com domínio, SSL e WhatsApp integrado." },
    ],
    stats: [
      { n: "< 24h", l: "para o site no ar" },
      { n: "R$ 499", l: "pagamento único" },
      { n: "4.9/5", l: "satisfação dos clientes" },
    ],
    testimonials: [
      { name: "Diego R.", role: "Assistência técnica · SP", text: "Mandei áudio no WhatsApp de manhã, à noite meu site já estava recebendo cliente." },
      { name: "Camila T.", role: "Salão de beleza · RJ", text: "Achei que ia ser template pronto. Veio sob medida, lindo e rápido." },
      { name: "Felipe N.", role: "Eletricista · BH", text: "Em 2 dias depois do site no ar já fechei 3 orçamentos novos pelo WhatsApp." },
    ],
  },
  "checkout-whatsapp": {
    ...DEFAULT,
    channel: "contato",
    title: "Pedido registrado! Fechamos pelo WhatsApp",
    subtitle: "Seu pedido foi salvo. Nosso time vai te chamar no WhatsApp em até 1h útil para confirmar o escopo e enviar a proposta.",
    whatsappMessage: "Olá! Finalizei meu pedido no site da 0WEB. Quero confirmar o escopo e receber a proposta.",
    planosLabel: "Conheça nossos planos",
    finalCtaTo: "/planos",
    finalCtaLabel: "Ver planos",
    slaBadge: "Resposta em até 1h útil",
    status: [
      { label: "1. Pedido registrado", eta: "Agora", desc: "Seu pedido foi salvo em nosso sistema e nosso time já foi notificado." },
      { label: "2. Proposta no WhatsApp", eta: "Em até 1h útil", desc: "Te chamamos no WhatsApp para confirmar o escopo e enviar a proposta final." },
      { label: "3. Aprovação e início", eta: "Após aprovação", desc: "Assim que você aprovar, iniciamos o projeto conforme o prazo combinado." },
    ],
    stats: DEFAULT_STATS,
    testimonials: DEFAULT_TESTIMONIALS,
    faq: [
      { q: "Em quanto tempo recebo a proposta no WhatsApp?", a: "Nosso time comercial responde em até 1 hora útil (seg–sex, 9h–18h). Fora desse horário, retornamos no próximo expediente." },
      { q: "Já paguei alguma coisa neste pedido?", a: "Não. Esse pedido está salvo como pendente. O pagamento (Pix, cartão ou boleto) é combinado com o consultor no WhatsApp antes de iniciar o projeto." },
      { q: "Posso ajustar o escopo antes de fechar?", a: "Sim. A conversa no WhatsApp serve exatamente para ajustar pacote, prazos e formas de pagamento ao seu cenário." },
      { q: "Como acompanho meu pedido depois?", a: "Você pode abrir o resumo do pedido no link enviado nesta página ou acessar o painel do cliente em /app a qualquer momento." },
    ],
    ctaCards: [
      { icon: "message", title: "Continuar pelo WhatsApp", desc: "Fale agora com um consultor e adiante a proposta.", to: "/contato", label: "Abrir WhatsApp", id: "thankyou_whatsapp_card", event: "thank_you_cta_whatsapp" },
      { icon: "package", title: "Ver meu pedido", desc: "Acompanhe status, itens e valor total deste pedido.", to: "/app", label: "Abrir painel", id: "thankyou_order_card", event: "thank_you_cta_order" },
      { icon: "help", title: "Dúvidas frequentes", desc: "Prazos, contratos, formas de pagamento e entregáveis.", to: "/faq", label: "Ir para FAQ", id: "thankyou_faq_card", event: "thank_you_cta_faq" },
    ],
  },
  "checkout-stripe": {
    ...DEFAULT,
    channel: "servicos",
    title: "Pagamento confirmado! 🎉",
    subtitle: "Recebemos seu pagamento com segurança. Nosso time vai entrar em contato em até 1h útil para iniciar o briefing.",
    whatsappMessage: "Olá! Meu pagamento foi confirmado na 0WEB. Quero agendar o briefing de início do projeto.",
    planosLabel: "Conheça nossos planos",
    finalCtaTo: "/planos",
    finalCtaLabel: "Ver planos",
    slaBadge: "Briefing em até 1h útil",
    status: [
      { label: "1. Pagamento confirmado", eta: "Agora", desc: "Seu pagamento foi processado com segurança pelo Stripe." },
      { label: "2. Briefing de início", eta: "Em até 1h útil", desc: "Entramos em contato para alinhar o escopo final e iniciar a produção." },
      { label: "3. Execução do projeto", eta: "Conforme prazo", desc: "Após o briefing, começamos a entrega conforme o pacote escolhido." },
    ],
    stats: DEFAULT_STATS,
    testimonials: DEFAULT_TESTIMONIALS,
    faq: [
      { q: "Meu pagamento já foi confirmado?", a: "Sim. O Stripe confirmou a transação com segurança. Você também receberá o recibo por e-mail nos próximos minutos." },
      { q: "Quando começa o projeto?", a: "Em até 1h útil entramos em contato para o briefing de início. A execução começa logo após o alinhamento do escopo." },
      { q: "Preciso enviar mais alguma coisa?", a: "Tenha em mãos logo, textos e referências do negócio. Quanto mais material no briefing, mais rápida a primeira entrega." },
      { q: "Quero a nota fiscal — como recebo?", a: "Emitimos NF-e no início da execução e enviamos pelo e-mail do cadastro. Caso precise de dados específicos, informe no WhatsApp." },
    ],
    ctaCards: [
      { icon: "package", title: "Ver meu pedido", desc: "Resumo, status do pagamento e próximos marcos.", to: "/app", label: "Abrir painel", id: "thankyou_order_card", event: "thank_you_cta_order" },
      { icon: "sparkles", title: "Agendar briefing", desc: "Acelere o início enviando suas referências agora.", to: "/contato", label: "Enviar briefing", id: "thankyou_briefing_card", event: "thank_you_cta_briefing" },
      { icon: "layers", title: "Conheça outros serviços", desc: "Combine pacotes para potencializar resultados.", to: "/servicos", label: "Ver catálogo", id: "thankyou_catalog_card", event: "thank_you_cta_catalog" },
    ],
  },
};


export function getThankYouContent(source?: string | null): ThankYouContent {
  if (!source) return DEFAULT;
  return MAP[source] ?? DEFAULT;
}
