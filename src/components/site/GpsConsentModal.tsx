import { MapPin, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId, getSessionId } from "@/lib/visitor";

const LS_KEY = "0web_gps_consent_v1";

export type GpsDecision = "granted" | "denied" | "dismissed";

export function getStoredGpsDecision(): GpsDecision | null {
  if (typeof window === "undefined") return null;
  try { return (localStorage.getItem(LS_KEY) as GpsDecision) || null; } catch { return null; }
}

export function storeGpsDecision(d: GpsDecision) {
  try { localStorage.setItem(LS_KEY, d); } catch { /* noop */ }
  void supabase.from("gps_consent_log").insert({
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    decision: d,
    page: typeof window !== "undefined" ? window.location.pathname : null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
  });
}

type Props = {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
};

export function GpsConsentModal({ open, onAccept, onDecline, onDismiss }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gps-consent-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 relative">
        <button
          onClick={() => { storeGpsDecision("dismissed"); onDismiss(); }}
          aria-label="Fechar"
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 grid place-items-center rounded-xl bg-primary/10 text-primary">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 id="gps-consent-title" className="mt-4 font-display text-xl font-bold">
          Podemos confirmar sua localização?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Usamos sua localização <strong>apenas para indicar a equipe e o atendimento certos</strong> para você (cidade/região).
          Nada é compartilhado com terceiros. Você pode recusar — manteremos uma estimativa aproximada por IP.
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary shrink-0" /> Coletamos apenas cidade e estado (não rastreamos rotas).</li>
          <li className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary shrink-0" /> Sua decisão é registrada para conformidade com a LGPD.</li>
          <li className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary shrink-0" /> Você pode revogar a qualquer momento limpando os dados do navegador.</li>
        </ul>
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
          <button
            onClick={() => { storeGpsDecision("denied"); onDecline(); }}
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Usar localização por IP
          </button>
          <button
            onClick={() => { storeGpsDecision("granted"); onAccept(); }}
            className="flex-1 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-glow-primary"
          >
            Permitir GPS
          </button>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground text-center">
          Leia mais na nossa <a href="/politica-privacidade" className="underline">política de privacidade</a>.
        </p>
      </div>
    </div>
  );
}
