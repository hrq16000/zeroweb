import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { ORIGIN } from "@/lib/seo";
import { trackConversion, trackWhatsAppClick } from "@/lib/analytics";
import { persistLead } from "@/lib/persistence";
import { ThankYouModal } from "@/components/site/ThankYouModal";
import { getLeadAttribution, attributionToEventParams } from "@/lib/lead-attribution";
import { saveAttributionSnapshot } from "@/lib/lead-attribution-snapshot";
import { getIpGeo, requestGpsThenFallback, formatLocation, type GeoInfo } from "@/lib/geo-location";
import { GpsConsentModal, getStoredGpsDecision } from "@/components/site/GpsConsentModal";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().min(8, "Informe um telefone válido").max(40),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Conte um pouco do seu projeto").max(1000),
});

type Props = {
  source?: string;
  ctx?: string;
  title?: string;
  defaultMessage?: string;
  /** If provided, redirects to this path after submit (legacy). */
  redirectTo?: string;
  /** Show thank-you modal in-place instead of redirecting (default: true when no redirectTo). */
  useModal?: boolean;
  /** Show LGPD consent checkbox (required to submit when true). */
  requireConsent?: boolean;
};

export function ContactFormWhatsApp({
  source = "contact_form_whatsapp",
  ctx = "contact_form",
  title = "Fale com a 0WEB e receba uma proposta",
  defaultMessage = "Quero uma proposta da 0WEB.",
  redirectTo,
  useModal,
  requireConsent = false,
}: Props) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "asking" | "ok" | "denied">("idle");
  const [gpsConsentOpen, setGpsConsentOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const shouldUseModal = useModal ?? !redirectTo;

  // Subliminal IP geo on mount
  useEffect(() => {
    void getIpGeo().then((g) => { if (g) setGeo(g); });
  }, []);

  const performGps = async () => {
    setGpsStatus("asking");
    const g = await requestGpsThenFallback();
    if (g) { setGeo(g); setGpsStatus(g.source.includes("gps") ? "ok" : "denied"); }
    else setGpsStatus("denied");
  };

  const askGps = () => {
    const prev = getStoredGpsDecision();
    if (prev === "granted") { void performGps(); return; }
    setGpsConsentOpen(true);
  };

  return (
    <>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const raw = {
            name: String(fd.get("name") || ""),
            email: String(fd.get("email") || ""),
            phone: String(fd.get("phone") || ""),
            company: String(fd.get("company") || ""),
            message: String(fd.get("message") || ""),
          };
          const parsed = schema.safeParse(raw);
          if (!parsed.success) {
            const errs: Record<string, string> = {};
            for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
            setErrors(errs);
            return;
          }
          if (requireConsent && !consent) {
            setErrors({ consent: "É necessário aceitar para enviar." });
            return;
          }
          setErrors({});
          const d = parsed.data;
          const attr = getLeadAttribution(source, ctx);
          const content = attr.content;
          const evtAttr = attributionToEventParams(attr);
          // Persist a snapshot so /obrigado, ThankYouModal and the WhatsApp
          // return fallback all resolve to the SAME attribution payload.
          saveAttributionSnapshot(attr);
          trackConversion("form_submit", {
            form_name: source,
            event_category: "lead",
            ...evtAttr,
          });
          void persistLead({
            name: d.name,
            email: d.email,
            phone: d.phone,
            company: d.company || undefined,
            source,
            payload: {
              message: d.message,
              consent: requireConsent ? consent : undefined,
              consent_at: requireConsent && consent ? new Date().toISOString() : undefined,
              channel: attr.channel,
              ctx: attr.ctx,
              origin_page: attr.page_path,
              landing_page: attr.landing_page,
              referrer: attr.referrer,
              utm_source: attr.utm_source,
              utm_medium: attr.utm_medium,
              utm_campaign: attr.utm_campaign,
              utm_term: attr.utm_term,
              utm_content: attr.utm_content,
              gclid: attr.gclid,
              fbclid: attr.fbclid,
              geo_city: geo?.city,
              geo_region: geo?.region,
              geo_country: geo?.country,
              geo_lat: geo?.latitude,
              geo_lng: geo?.longitude,
              geo_source: geo?.source,
            },
          });
          const ctaUrl = `${ORIGIN}${content.finalCtaTo}`;
          const loc = formatLocation(geo);
          const interest = defaultMessage.replace(/\.$/, "");
          const lines = [
            `Olá! Sou ${d.name}.`,
            loc ? `📍 ${loc}` : "",
            `💡 Interesse: ${interest}`,
            d.company ? `🏢 Empresa: ${d.company}` : "",
            `✉️ E-mail: ${d.email}`,
            `📱 WhatsApp: ${d.phone}`,
            "",
            d.message,
            "",
            `👉 Próximo passo: ${content.finalCtaLabel} — ${ctaUrl}`,
          ].filter((l) => l !== "" || true).filter(Boolean);
          // Remove falsy lines but preserve intentional blank separators
          const msg = lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
          trackConversion("contact_form_captured", { form_name: source, next_step: ctaUrl, loc, interest, message_length: msg.length });
          setSent(true);
          if (shouldUseModal) {
            setModalOpen(true);
          } else if (redirectTo) {
            navigate({ to: redirectTo, search: { source } as never });
          }
        }}
        className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-3"
        aria-labelledby="contact-form-title"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 id="contact-form-title" className="text-xl font-bold font-display">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">Enviamos no WhatsApp e respondemos em até 1 hora útil.</p>

        {[
          { name: "name", label: "Seu nome", type: "text", required: true },
          { name: "company", label: "Empresa (opcional)", type: "text", required: false },
          { name: "email", label: "E-mail", type: "email", required: true },
          { name: "phone", label: "WhatsApp", type: "tel", required: true },
        ].map((f) => (
          <div key={f.name}>
            <label htmlFor={`cf-${f.name}`} className="sr-only">{f.label}</label>
            <input
              id={`cf-${f.name}`}
              name={f.name}
              type={f.type}
              required={f.required}
              placeholder={f.label}
              aria-invalid={!!errors[f.name]}
              aria-describedby={errors[f.name] ? `cf-${f.name}-err` : undefined}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
            {errors[f.name] && (
              <p id={`cf-${f.name}-err`} className="mt-1 text-xs text-destructive">{errors[f.name]}</p>
            )}
          </div>
        ))}
        <div>
          <label htmlFor="cf-message" className="sr-only">Mensagem</label>
          <textarea
            id="cf-message"
            name="message"
            required
            rows={4}
            placeholder="Conte rapidamente sobre seu projeto"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "cf-message-err" : undefined}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          {errors.message && (
            <p id="cf-message-err" className="mt-1 text-xs text-destructive">{errors.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {geo?.city ? <>Detectamos <strong className="text-foreground">{formatLocation(geo)}</strong></> : <>Localização não detectada</>}
            {geo?.source.includes("gps") && <span className="ml-1 text-emerald-600">· confirmado por GPS</span>}
          </span>
          {gpsStatus !== "ok" && (
            <button type="button" onClick={askGps} className="underline hover:text-primary" aria-label="Confirmar localização por GPS">
              {gpsStatus === "asking" ? "Localizando…" : "Confirmar por GPS"}
            </button>
          )}
        </div>
        {requireConsent && (
          <div className="pt-1">
            <label htmlFor="cf-consent" className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                id="cf-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? "cf-consent-err" : undefined}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <span>
                Concordo em receber contato da 0WEB pelos canais informados e com o tratamento
                dos meus dados conforme a <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Política de Privacidade</a> (LGPD).
              </span>
            </label>
            {errors.consent && (
              <p id="cf-consent-err" className="mt-1 text-xs text-destructive">{errors.consent}</p>
            )}
          </div>
        )}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
        >
          Enviar pelo WhatsApp <ArrowRight className="w-4 h-4" />
        </button>
        {sent && (
          <p className="text-xs text-emerald-600 text-center" role="status">
            ✓ Abrimos o WhatsApp com sua mensagem e registramos seu contato.
          </p>
        )}
      </form>

      {shouldUseModal && (
        <ThankYouModal open={modalOpen} onOpenChange={setModalOpen} source={source} />
      )}
      <GpsConsentModal
        open={gpsConsentOpen}
        onAccept={() => { setGpsConsentOpen(false); void performGps(); }}
        onDecline={() => { setGpsConsentOpen(false); setGpsStatus("denied"); }}
        onDismiss={() => setGpsConsentOpen(false)}
      />
    </>
  );
}
