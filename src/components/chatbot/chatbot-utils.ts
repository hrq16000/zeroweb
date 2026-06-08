// Pure helpers extracted from HomeChatbot so they can be unit-tested
// without rendering the React tree.

export const STORAGE_KEY = "0web_chatbot_state";

export type Msg =
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "user"; text: string };

export type Step = 0 | 1 | 2 | 3 | 4;

export type State = {
  step: Step;
  messages: Msg[];
  servico?: { slug: string; name: string };
  perfil?: string;
  prazo?: string;
  nome?: string;
  whatsapp?: string;
  /** Persisted draft inputs so a refresh on Step 3 keeps what user typed. */
  draftName?: string;
  draftPhone?: string;
  consent?: boolean;
  /** When true, Step 3 is showing the review/confirm card instead of the form. */
  reviewing?: boolean;
};

export const initialState: State = { step: 0, messages: [] };

export const BR_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function validateWhatsApp(raw: string): { valid: boolean; error?: string } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return { valid: false, error: "Informe o DDD + número completo." };
  if (digits.length > 11) return { valid: false, error: "Número com muitos dígitos." };
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (!BR_DDD.has(ddd)) return { valid: false, error: "DDD inválido. Verifique o código de área." };
  if (digits.length === 11 && digits[2] !== "9") {
    return { valid: false, error: "Celular deve começar com 9 após o DDD." };
  }
  return { valid: true };
}

export function loadState(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return JSON.parse(raw) as State;
  } catch {
    return initialState;
  }
}

export function saveState(s: State): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/**
 * Canonical attribution shape attached to EVERY chatbot tracking event.
 * Always emits utm_source / utm_medium / utm_campaign / page_path so the
 * analytics layer can group by these fields without null-handling.
 */
export type Attribution = {
  page_path: string;
  page_url: string;
  referrer: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
};

export function getAttribution(): Attribution {
  if (typeof window === "undefined") {
    return {
      page_path: "/",
      page_url: "",
      referrer: null,
      utm_source: "(direct)",
      utm_medium: "(none)",
      utm_campaign: "(none)",
    };
  }
  try {
    const url = new URL(window.location.href);
    const get = (k: string) => url.searchParams.get(k) || undefined;
    const out: Attribution = {
      page_path: url.pathname + url.search,
      page_url: window.location.href,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source: get("utm_source") || "(direct)",
      utm_medium: get("utm_medium") || "(none)",
      utm_campaign: get("utm_campaign") || "(none)",
    };
    const term = get("utm_term");
    const content = get("utm_content");
    if (term) out.utm_term = term;
    if (content) out.utm_content = content;
    return out;
  } catch {
    return {
      page_path: "/",
      page_url: "",
      referrer: null,
      utm_source: "(direct)",
      utm_medium: "(none)",
      utm_campaign: "(none)",
    };
  }
}
