// Lead funnel WhatsApp — gerenciável via /painel (aba Funil WhatsApp).
// Armazenado em localStorage para não exigir backend. Pode ser exportado/importado em JSON.

export type FunnelStep = {
  id: string;
  question: string;
  /** "text" = input livre · "choice" = botões */
  type: "text" | "choice" | "tel" | "email";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type FunnelConfig = {
  version: number;
  enabled: boolean;
  title: string;
  subtitle: string;
  successMessage: string;
  steps: FunnelStep[];
  /** mensagem enviada ao WhatsApp ao final, com {placeholders} dos step.id */
  whatsappTemplate: string;
};

export const DEFAULT_FUNNEL: FunnelConfig = {
  version: 1,
  enabled: true,
  title: "Vamos te ajudar em 30 segundos 👋",
  subtitle: "Responda 4 perguntas e fale com um especialista no WhatsApp.",
  successMessage: "Perfeito! Estamos abrindo o WhatsApp com sua resposta.",
  steps: [
    {
      id: "objetivo",
      question: "Qual seu principal objetivo hoje?",
      type: "choice",
      required: true,
      options: [
        "Criar / refazer meu site",
        "Aparecer no Google (SEO / Ads)",
        "Vender mais pelo WhatsApp",
        "Automação / IA para o meu negócio",
      ],
    },
    {
      id: "segmento",
      question: "Em qual segmento você atua?",
      type: "text",
      placeholder: "Ex.: clínica, ecommerce, prestador de serviço…",
      required: true,
    },
    {
      id: "nome",
      question: "Como podemos te chamar?",
      type: "text",
      placeholder: "Seu nome",
      required: true,
    },
    {
      id: "whatsapp",
      question: "Qual o melhor WhatsApp para retorno?",
      type: "tel",
      placeholder: "(00) 0 0000-0000",
      required: true,
    },
  ],
  whatsappTemplate:
    "Olá, 0WEB! Vim pelo funil do site:\n\n• Objetivo: {objetivo}\n• Segmento: {segmento}\n• Nome: {nome}\n• WhatsApp: {whatsapp}\n\nGostaria de um diagnóstico gratuito.",
};

const KEY = "0web_wa_funnel_v1";

export function getFunnelConfig(): FunnelConfig {
  if (typeof window === "undefined") return DEFAULT_FUNNEL;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_FUNNEL;
    const parsed = JSON.parse(raw) as FunnelConfig;
    if (!parsed.steps?.length) return DEFAULT_FUNNEL;
    return parsed;
  } catch {
    return DEFAULT_FUNNEL;
  }
}

export function saveFunnelConfig(cfg: FunnelConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent("0web:wa_funnel"));
}

export function resetFunnelConfig() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("0web:wa_funnel"));
}

export function renderTemplate(tpl: string, answers: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => answers[k] ?? "—");
}
