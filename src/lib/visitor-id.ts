/**
 * Identidade anônima first-party para o funil.
 *
 * - `visitorId`: persistente em localStorage (~1 ano de retenção lógica),
 *    NÃO usa IP nem fingerprint. Apenas um random opaco.
 * - `sessionId`: por aba/sessão em sessionStorage.
 * - `funnelSessionId`: chave idempotente por instância de funil aberto,
 *    para evitar criar registros duplicados a cada re-render.
 *
 * Uso: server functions criam/atualizam `visitor_funnel_sessions` pela
 * chave `funnelSessionId`. Nada é enviado a analytics de terceiros.
 */

const VISITOR_KEY = "0web_visitor_id";
const SESSION_KEY = "0web_session_id";

function isBrowser() {
  return typeof window !== "undefined";
}

function randomId(prefix: string): string {
  // 128-bit aleatório sem dependências
  const bytes = new Uint8Array(16);
  if (isBrowser() && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

export function getVisitorId(): string {
  if (!isBrowser()) return "server";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId("v");
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return randomId("v");
  }
}

export function getSessionId(): string {
  if (!isBrowser()) return "server";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = randomId("s");
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return randomId("s");
  }
}

export function newFunnelSessionId(): string {
  return randomId("f");
}

/**
 * Contexto técnico mínimo, sem fingerprint invasivo.
 * NÃO coletar: canvas/webgl/audio/plugin list/battery/etc.
 */
export function collectTechnicalContext(): Record<string, unknown> {
  if (!isBrowser()) return {};
  const nav = window.navigator;
  const scr = window.screen;
  return {
    language: nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localTimestamp: new Date().toISOString(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: scr?.width,
    screenHeight: scr?.height,
    devicePixelRatio: window.devicePixelRatio,
  };
}
