export type LeadSource =
  | "contact_form_whatsapp"
  | "servicos_form_whatsapp"
  | "trafego_pago_local_form"
  | string;

export type ThankYouContent = {
  title: string;
  subtitle: string;
  whatsappMessage: string;
  planosLabel: string;
  finalCtaTo: "/solicitar-orcamento" | "/trafego-pago-local" | "/planos";
  finalCtaLabel: string;
  channel: "contato" | "servicos" | "trafego_pago_local" | "outro";
};

const DEFAULT: ThankYouContent = {
  title: "Recebemos seu contato!",
  subtitle: "Nossa equipe responde em até 1 hora útil. Enquanto isso, dê uma olhada nas opções abaixo.",
  whatsappMessage: "Acabei de enviar um formulário pelo site da 0WEB. Pode confirmar o recebimento?",
  planosLabel: "Pacotes a partir de R$499/mês",
  finalCtaTo: "/solicitar-orcamento",
  finalCtaLabel: "Solicitar diagnóstico",
  channel: "outro",
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
  },
};

export function getThankYouContent(source?: string | null): ThankYouContent {
  if (!source) return DEFAULT;
  return MAP[source] ?? DEFAULT;
}
