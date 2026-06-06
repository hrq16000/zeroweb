/**
 * Persists the lead attribution payload at submit-time so /obrigado, the
 * ThankYouModal, GA4/Pixel events, and the WhatsApp return fallback all
 * resolve to the SAME source/channel/UTM — even after a hard refresh, a
 * back navigation, or after the original UTM dropped off the URL.
 *
 * sessionStorage (not localStorage) so it does not leak across tabs/users.
 */
import type { LeadAttribution } from "@/lib/lead-attribution";

const KEY = "0web_last_lead_attr_v1";
const TTL_MS = 30 * 60 * 1000; // 30 min

type Envelope = { value: LeadAttribution; expires_at: number };

export function saveAttributionSnapshot(attr: LeadAttribution) {
  if (typeof window === "undefined") return;
  try {
    const env: Envelope = { value: attr, expires_at: Date.now() + TTL_MS };
    sessionStorage.setItem(KEY, JSON.stringify(env));
  } catch {
    /* quota or disabled storage — best-effort */
  }
}

export function loadAttributionSnapshot(): LeadAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope;
    if (!env?.expires_at || env.expires_at < Date.now()) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return env.value;
  } catch {
    return null;
  }
}

export function clearAttributionSnapshot() {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(KEY); } catch { /* noop */ }
}
