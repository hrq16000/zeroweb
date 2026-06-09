import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { persistLead } from "@/lib/persistence";
import { trackConversion } from "@/lib/analytics";

const STORAGE_KEY = "0web_lead_widget_v1";
const TOTAL_STEPS = 4;

type WidgetState = {
  step: number;
  service: string | null;
  serviceLabel: string | null;
  name: string;
  phone: string;
  budget: string | null;
  email: string;
  message: string;
  done?: boolean;
};

const initial: WidgetState = {
  step: 0,
  service: null,
  serviceLabel: null,
  name: "",
  phone: "",
  budget: null,
  email: "",
  message: "",
};

const BUDGETS = [
  { id: "ate_2k", label: "Até R$ 2 mil" },
  { id: "2k_5k", label: "R$ 2 – 5 mil" },
  { id: "5k_10k", label: "R$ 5 – 10 mil" },
  { id: "10k_mais", label: "Acima de R$ 10 mil" },
  { id: "indef", label: "Ainda não sei" },
];

const FALLBACK_SERVICES = [
  { slug: "criacao-de-sites", title: "Criação de sites" },
  { slug: "landing-pages", title: "Landing pages" },
  { slug: "lojas-virtuais", title: "Loja virtual" },
  { slug: "seo", title: "SEO" },
  { slug: "trafego-pago", title: "Tráfego pago" },
  { slug: "automacao", title: "Automação / IA" },
];

const phoneSchema = z
  .string()
  .trim()
  .min(8, "WhatsApp inválido")
  .max(40)
  .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe DDD + número");
const nameSchema = z.string().trim().min(2, "Informe seu nome").max(120);
const emailSchema = z.string().trim().email("E-mail inválido").max(255);

function maskPhoneBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function loadState(): WidgetState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<WidgetState>;
    return { ...initial, ...parsed };
  } catch {
    return initial;
  }
}

function saveState(s: WidgetState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function LeadWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<WidgetState>(initial);
  const [services, setServices] = useState<Array<{ slug: string; title: string }>>(FALLBACK_SERVICES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pulse, setPulse] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from sessionStorage
  useEffect(() => {
    const s = loadState();
    setState(s);
    hydrated.current = true;
    // Auto-open if user has progress (but not if already done)
    if (s.step > 0 && !s.done) {
      const t = setTimeout(() => setPulse(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated.current) return;
    saveState(state);
  }, [state]);

  // Fetch real services for chips
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("services")
          .select("slug,title")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .limit(8);
        if (!cancelled && data && data.length > 0) {
          setServices(data as Array<{ slug: string; title: string }>);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch: Partial<WidgetState>) => setState((s) => ({ ...s, ...patch }));

  const progress = useMemo(() => Math.min(100, (state.step / TOTAL_STEPS) * 100), [state.step]);

  const goNext = () => {
    const errs: Record<string, string> = {};
    if (state.step === 0 && !state.service) errs.service = "Escolha um serviço";
    if (state.step === 1) {
      const n = nameSchema.safeParse(state.name);
      if (!n.success) errs.name = n.error.issues[0]?.message ?? "Nome inválido";
      const p = phoneSchema.safeParse(state.phone);
      if (!p.success) errs.phone = p.error.issues[0]?.message ?? "WhatsApp inválido";
    }
    if (state.step === 2 && !state.budget) errs.budget = "Selecione uma faixa";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    update({ step: state.step + 1 });
  };

  const goBack = () => {
    setErrors({});
    update({ step: Math.max(0, state.step - 1) });
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (state.email.trim().length > 0) {
      const e = emailSchema.safeParse(state.email);
      if (!e.success) errs.email = e.error.issues[0]?.message ?? "E-mail inválido";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await persistLead({
        name: state.name,
        email: state.email || undefined,
        phone: state.phone,
        source: "lead_widget",
        offer_slug: state.service ?? undefined,
        audience_tag: state.budget ?? undefined,
        payload: {
          widget: "bottom_left_v1",
          service_slug: state.service,
          service_label: state.serviceLabel,
          budget: state.budget,
          message: state.message,
        },
      });
      trackConversion("lead_widget_submit", {
        service: state.service ?? undefined,
        budget: state.budget ?? undefined,
      });
      update({ step: TOTAL_STEPS, done: true });
    } catch {
      setErrors({ submit: "Não foi possível enviar agora. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setState(initial);
    setErrors({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 print:hidden">
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setOpen(true);
              setPulse(false);
            }}
            aria-label="Receber proposta personalizada"
            className="group relative flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-elegant px-4 h-12 font-medium text-sm hover:shadow-glow-primary transition-shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Proposta em 1 min</span>
            <span className="sm:hidden">Proposta</span>
            {(state.step > 0 && !state.done) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent ring-2 ring-background" />
            )}
            {pulse && (
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" aria-hidden="true" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            role="dialog"
            aria-label="Solicitar proposta"
            className="w-[min(360px,calc(100vw-2.5rem))] rounded-2xl border border-border bg-card shadow-elegant overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <p className="text-sm font-semibold">
                  {state.done ? "Recebido!" : "Proposta em 1 minuto"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="rounded-full p-1 hover:bg-white/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress */}
            {!state.done && (
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                />
              </div>
            )}

            {/* Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {state.done ? (
                <div className="text-center py-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 grid place-items-center mb-3">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Obrigado, {state.name.split(" ")[0]}!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vamos te chamar no WhatsApp em instantes com a proposta personalizada.
                  </p>
                  <button
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Enviar outro pedido
                  </button>
                </div>
              ) : state.step === 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">O que você precisa?</h3>
                  <p className="text-xs text-muted-foreground mb-3">Selecione o serviço de interesse.</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => {
                      const active = state.service === s.slug;
                      return (
                        <button
                          key={s.slug}
                          onClick={() => update({ service: s.slug, serviceLabel: s.title })}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          {s.title}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => update({ service: "outro", serviceLabel: "Outro" })}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        state.service === "outro"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      Outro
                    </button>
                  </div>
                  {errors.service && <p className="text-xs text-destructive mt-2">{errors.service}</p>}
                </div>
              ) : state.step === 1 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Como te chamamos?</h3>
                  <div>
                    <label className="text-xs text-muted-foreground" htmlFor="lw-name">Nome</label>
                    <input
                      id="lw-name"
                      type="text"
                      autoComplete="name"
                      value={state.name}
                      onChange={(e) => update({ name: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Seu nome"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground" htmlFor="lw-phone">WhatsApp</label>
                    <input
                      id="lw-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={state.phone}
                      onChange={(e) => update({ phone: maskPhoneBR(e.target.value) })}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="(41) 99999-9999"
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>
              ) : state.step === 2 ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Qual o orçamento?</h3>
                  <p className="text-xs text-muted-foreground mb-3">Apenas para alinhar a proposta.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {BUDGETS.map((b) => {
                      const active = state.budget === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => update({ budget: b.id })}
                          className={`px-3 py-2 rounded-md text-sm text-left border transition-colors ${
                            active
                              ? "bg-primary/10 text-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.budget && <p className="text-xs text-destructive mt-2">{errors.budget}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Quase lá!</h3>
                  <div>
                    <label className="text-xs text-muted-foreground" htmlFor="lw-email">E-mail (opcional)</label>
                    <input
                      id="lw-email"
                      type="email"
                      autoComplete="email"
                      value={state.email}
                      onChange={(e) => update({ email: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground" htmlFor="lw-msg">Algo mais? (opcional)</label>
                    <textarea
                      id="lw-msg"
                      value={state.message}
                      onChange={(e) => update({ message: e.target.value.slice(0, 500) })}
                      rows={3}
                      className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Conte rapidamente do seu projeto"
                    />
                  </div>
                  {errors.submit && <p className="text-xs text-destructive">{errors.submit}</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            {!state.done && (
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-background/40">
                <button
                  onClick={goBack}
                  disabled={state.step === 0 || submitting}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Voltar
                </button>
                {state.step < TOTAL_STEPS - 1 ? (
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 h-9 hover:shadow-glow-primary transition-shadow"
                  >
                    Continuar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 h-9 hover:shadow-glow-primary transition-shadow disabled:opacity-60"
                  >
                    {submitting ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando…</>
                    ) : (
                      <>Enviar <Check className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LeadWidget;
