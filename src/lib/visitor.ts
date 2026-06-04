// Visitor + session identifiers (no PII, no IP).
const V_KEY = "0web_visitor_id";
const S_KEY = "0web_session_id";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let v = localStorage.getItem(V_KEY);
    if (!v) {
      v = uid();
      localStorage.setItem(V_KEY, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let s = sessionStorage.getItem(S_KEY);
    if (!s) {
      s = uid();
      sessionStorage.setItem(S_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
