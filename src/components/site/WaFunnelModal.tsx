import { useEffect, useState, type ReactNode, createContext, useContext, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowRight, ArrowLeft, MessageCircle, Check } from "lucide-react";
import { getFunnelConfig, renderTemplate, type FunnelConfig } from "@/lib/wa-funnel";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { persistWaFunnelOpen, persistWaFunnelStep, persistWaFunnelComplete } from "@/lib/persistence";
import { WHATSAPP, getActiveUtms } from "@/lib/site-config";

type Ctx = { open: (location: string) => void };
const FunnelCtx = createContext<Ctx>({ open: () => {} });

export function useWaFunnel() {
  return useContext(FunnelCtx);
}

export function WaFunnelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [location, setLocation] = useState("unknown");
  const [cfg, setCfg] = useState<FunnelConfig>(() => getFunnelConfig());

  useEffect(() => {
    const sync = () => setCfg(getFunnelConfig());
    window.addEventListener("0web:wa_funnel", sync);
    return () => window.removeEventListener("0web:wa_funnel", sync);
  }, []);

  const open = useCallback((loc: string) => {
    setLocation(loc);
    setOpen(true);
    trackEvent("wa_funnel_open", { location: loc });
    void persistWaFunnelOpen(cfg.steps.length);
  }, [cfg.steps.length]);

  return (
    <FunnelCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && cfg.enabled && (
          <FunnelModal cfg={cfg} location={location} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </FunnelCtx.Provider>
  );
}

function FunnelModal({ cfg, location, onClose }: { cfg: FunnelConfig; location: string; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const current = cfg.steps[step];
  const total = cfg.steps.length;
  const progress = ((step + (done ? 1 : 0)) / total) * 100;

  const setAns = (v: string) => setAnswers((a) => ({ ...a, [current.id]: v }));

  function next() {
    const val = answers[current.id]?.trim();
    if (current.required && !val) return;
    trackEvent("wa_funnel_step", { step: step + 1, total, field: current.id, location });
    void persistWaFunnelStep(step + 1, answers);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  function finish() {
    setDone(true);
    trackConversion("wa_funnel_complete", { location, steps: total });
    void persistWaFunnelComplete(answers);
    const utms = getActiveUtms();
    const tail =
      "\n\n—\nOrigem: " + Object.entries(utms).map(([k, v]) => `${k}=${v}`).join(" · ") + ` · location=${location}`;
    const text = encodeURIComponent(renderTemplate(cfg.whatsappTemplate, answers) + tail);
    trackConversion("whatsapp_click", { location: `wa_funnel:${location}` });
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP.number}?text=${text}`, "_blank");
    }, 700);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-end sm:place-items-center bg-foreground/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border shadow-elegant overflow-hidden"
      >
        <div className="relative p-6 pb-5 bg-gradient-primary text-primary-foreground">
          <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 p-1.5 rounded-full bg-background/15 hover:bg-background/25">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-background/80">
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp 0WEB
          </div>
          <h3 className="mt-2 text-xl font-bold font-display leading-tight">{cfg.title}</h3>
          <p className="mt-1 text-sm text-background/80">{cfg.subtitle}</p>
          <div className="mt-4 h-1.5 bg-background/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-background"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
          <p className="mt-1 text-[11px] text-background/70">Passo {Math.min(step + 1, total)} de {total}</p>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto grid place-items-center w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600">
                <Check className="w-7 h-7" />
              </div>
              <p className="mt-4 font-semibold">{cfg.successMessage}</p>
              <p className="mt-1 text-sm text-muted-foreground">Se a janela não abrir, libere pop-ups do seu navegador.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-semibold text-foreground">{current.question}</label>

                {current.type === "choice" ? (
                  <div className="mt-3 grid gap-2">
                    {current.options?.map((opt) => {
                      const active = answers[current.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setAns(opt);
                            setTimeout(() => next(), 180);
                          }}
                          className={`text-left rounded-xl border px-4 py-3 text-sm transition ${
                            active
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    autoFocus
                    type={current.type === "tel" ? "tel" : current.type === "email" ? "email" : "text"}
                    inputMode={current.type === "tel" ? "tel" : undefined}
                    value={answers[current.id] ?? ""}
                    onChange={(e) => setAns(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    placeholder={current.placeholder}
                    className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                )}

                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30 hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-2.5 shadow-glow-primary hover:opacity-95"
                  >
                    {step === total - 1 ? "Falar no WhatsApp" : "Continuar"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
