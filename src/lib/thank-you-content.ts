export type LeadSource =
  | "contact_form_whatsapp"
  | "servicos_form_whatsapp"
  | "trafego_pago_local_form"
  | "site_express"
  | string;

export type Testimonial = { name: string; role: string; text: string };
export type Stat = { n: string; l: string };

export type ThankYouContent = {
  title: string;
  subtitle: string;
  whatsappMessage: string;
  planosLabel: string;
  finalCtaTo: "/solicitar-orcamento" | "/trafego-pago-local" | "/planos" | "/servicos/site-express";
  finalCtaLabel: string;
  channel: "contato" | "servicos" | "trafego_pago_local" | "site_express" | "outro";
  stats: Stat[];
  testimonials: Testimonial[];
  socialProofHeadline: string;
  /** Optional service-specific status timeline. */
  status?: { label: string; eta: string; desc: string }[];
  /** Optional SLA badge (e.g. "Em até 24h"). */
  slaBadge?: string;
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
    finalCtaTo: "/trafego-pago-local",
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
};

export function getThankYouContent(source?: string | null): ThankYouContent {
  if (!source) return DEFAULT;
  return MAP[source] ?? DEFAULT;
}
