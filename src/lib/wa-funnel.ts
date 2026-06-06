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
  /** dica/fallback quando a resposta não casa com o esperado */
  fallbackHint?: string;
};

export type FunnelMode = "short" | "diagnostic" | "ai";

export type FunnelConfig = {
  version: number;
  enabled: boolean;
  title: string;
  subtitle: string;
  successMessage: string;
  steps: FunnelStep[];
  /** mensagem enviada ao WhatsApp ao final, com {placeholders} dos step.id */
  whatsappTemplate: string;
  /** modo padrão do widget flutuante */
  mode?: FunnelMode;
  /** overrides por rota: pathname → modo */
  pageOverrides?: Record<string, FunnelMode>;
  /** slug do funil dinâmico usado quando mode === 'diagnostic' */
  diagnosticSlug?: string;
};

export const DEFAULT_FUNNEL: FunnelConfig = {
  version: 2,
  enabled: true,
  mode: "short",
  diagnosticSlug: "diagnostico-0web",
  pageOverrides: {},
  title: "Vamos te ajudar em 30 segundos 👋",
  subtitle: "Responda 5 perguntas rápidas e fale com um especialista no WhatsApp.",
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
      fallbackHint: "Escolha a opção que mais se aproxima — refinamos no chat.",
    },
    {
      id: "urgencia",
      question: "Qual a urgência?",
      type: "choice",
      required: true,
      options: [
        "Pra ontem — preciso agora",
        "Próximos 7 dias",
        "Próximas 2-4 semanas",
        "Estou pesquisando ainda",
      ],
      fallbackHint: "Selecione a janela que melhor encaixa na sua agenda.",
    },
    {
      id: "segmento",
      question: "Em qual segmento você atua?",
      type: "text",
      placeholder: "Ex.: clínica, ecommerce, prestador de serviço…",
      required: true,
      fallbackHint: "Pode escrever em poucas palavras — só pra contextualizar.",
    },
    {
      id: "nome",
      question: "Como podemos te chamar?",
      type: "text",
      placeholder: "Seu nome",
      required: true,
      fallbackHint: "Use apenas seu primeiro nome se preferir.",
    },
    {
      id: "whatsapp",
      question: "Qual o melhor WhatsApp para retorno?",
      type: "tel",
      placeholder: "(00) 0 0000-0000",
      required: true,
      fallbackHint: "Formato esperado: DDD + número, com pelo menos 10 dígitos.",
    },
  ],
  whatsappTemplate:
    "Olá, 0WEB! Vim pelo funil do site:\n\n• Objetivo: {objetivo}\n• Urgência: {urgencia}\n• Segmento: {segmento}\n• Nome: {nome}\n• WhatsApp: {whatsapp}\n\nGostaria de um diagnóstico gratuito.",
};

const KEY = "0web_wa_funnel_v1";

export function getFunnelConfig(): FunnelConfig {
  if (typeof window === "undefined") return DEFAULT_FUNNEL;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_FUNNEL;
    const parsed = JSON.parse(raw) as FunnelConfig;
    if (!parsed.steps?.length) return DEFAULT_FUNNEL;
    // Garante campos novos em configs antigas
    return {
      mode: "short",
      pageOverrides: {},
      diagnosticSlug: DEFAULT_FUNNEL.diagnosticSlug,
      ...parsed,
    };
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

/** Modo efetivo considerando overrides por rota. */
export function getEffectiveMode(cfg: FunnelConfig, pathname: string): FunnelMode {
  const overrides = cfg.pageOverrides ?? {};
  if (overrides[pathname]) return overrides[pathname];
  // prefixo: /blog → /blog/*
  for (const key of Object.keys(overrides)) {
    if (key.endsWith("/*") && pathname.startsWith(key.slice(0, -2))) return overrides[key];
  }
  return cfg.mode ?? "short";
}

/** Validação leve por tipo. Retorna null se ok, ou string de hint. */
export function validateAnswer(step: FunnelStep, raw: string): string | null {
  const v = raw.trim();
  if (!v) return step.required ? (step.fallbackHint ?? "Responda para continuar.") : null;
  if (step.type === "tel") {
    const digits = v.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return step.fallbackHint ?? "Digite um telefone válido com DDD.";
    }
  }
  if (step.type === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return step.fallbackHint ?? "Digite um e-mail válido (ex.: nome@exemplo.com).";
    }
  }
  if (step.type === "choice" && step.options && !step.options.includes(v)) {
    return step.fallbackHint ?? "Selecione uma das opções disponíveis.";
  }
  return null;
}
