import { useEffect, useRef, useState, type ReactNode, createContext, useContext, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowRight, MessageCircle, Check, Sparkles, ExternalLink } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import {
  getFunnelConfig,
  renderTemplate,
  getEffectiveMode,
  validateAnswer,
  type FunnelConfig,
  type FunnelStep,
} from "@/lib/wa-funnel";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { persistWaFunnelOpen, persistWaFunnelStep, persistWaFunnelComplete } from "@/lib/persistence";
import { FunnelModalWrapper } from "@/components/funnel/FunnelModalWrapper";
import type { ContactIntent } from "@/lib/contact-intent";
import { getLeadAttribution } from "@/lib/lead-attribution";
import { saveAttributionSnapshot } from "@/lib/lead-attribution-snapshot";

type Ctx = { open: (location: string) => void };
const FunnelCtx = createContext<Ctx>({ open: () => {} });

export function useWaFunnel() {
  return useContext(FunnelCtx);
}

export function WaFunnelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [location, setLocation] = useState("unknown");
  const [cfg, setCfg] = useState<FunnelConfig>(() => getFunnelConfig());
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  const intent: ContactIntent = {
    purpose: location.includes("partner") ? "partnership" : "diagnosis",
    source: location,
    pagePath: pathname || "/",
    placement: location.includes("footer") ? "footer" : location.includes("hero") ? "hero" : location.includes("floating") ? "sticky-mobile" : "section",
  };

  return (
    <FunnelCtx.Provider value={{ open }}>
      {children}
      <FunnelModalWrapper
        open={isOpen && cfg.enabled}
        onClose={() => setOpen(false)}
        funnelSlug="diagnostico-0web"
        intent={intent}
      />
    </FunnelCtx.Provider>
  );
}

type ChatMsg =
  | { who: "bot"; kind: "question"; step: FunnelStep }
  | { who: "bot"; kind: "text"; text: string }
  | { who: "user"; text: string };

function ChatbotModal({
  cfg,
  mode,
  location,
  onClose,
}: {
  cfg: FunnelConfig;
  mode: "short" | "ai";
  location: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const total = cfg.steps.length;
  const current = cfg.steps[step];
  const progress = ((step + (done ? 1 : 0)) / total) * 100;

  // Show greeting + first question on mount
  useEffect(() => {
    setTyping(true);
    const t1 = setTimeout(() => {
      setMessages([{ who: "bot", kind: "text", text: cfg.subtitle }]);
    }, 350);
    const t2 = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { who: "bot", kind: "question", step: cfg.steps[0] }]);
    }, 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, done]);

  const commitAnswer = useCallback((value: string) => {
    if (!current) return;
    const err = validateAnswer(current, value);
    if (err) {
      setHint(err);
      // Pisca dica como bolha do bot
      setMessages((m) => [...m, { who: "user", text: value }, { who: "bot", kind: "text", text: err }]);
      return;
    }
    setHint(null);
    const nextAnswers = { ...answers, [current.id]: value };
    setAnswers(nextAnswers);
    setMessages((m) => [...m, { who: "user", text: value }]);
    setDraft("");
    trackEvent("wa_funnel_step", { step: step + 1, total, field: current.id, location });
    void persistWaFunnelStep(step + 1, nextAnswers);

    if (step < total - 1) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const ns = step + 1;
        setStep(ns);
        setMessages((m) => [...m, { who: "bot", kind: "question", step: cfg.steps[ns] }]);
      }, 650);
    } else {
      finish(nextAnswers);
    }
  }, [current, answers, step, total, cfg.steps, location]);

  function finish(finalAnswers: Record<string, string>) {
    setDone(true);
    setTyping(true);
    setMessages((m) => [...m, { who: "bot", kind: "text", text: cfg.successMessage }]);
    setTimeout(() => setTyping(false), 500);
    trackConversion("wa_funnel_complete", { location, steps: total, mode });
    void persistWaFunnelComplete(finalAnswers);
    try { saveAttributionSnapshot(getLeadAttribution(`wa_funnel:${location}`, `wa_funnel_${location}`)); } catch { /* noop */ }
    trackConversion("funnel_complete", { location: `legacy_adapter:${location}` });
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
        className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border shadow-elegant overflow-hidden flex flex-col h-[88vh] sm:h-[640px]"
      >
        {/* Header */}
        <div className="relative p-4 pb-3 bg-gradient-primary text-primary-foreground shrink-0">
          <button onClick={onClose} aria-label="Fechar" className="absolute top-3 right-3 p-1.5 rounded-full bg-background/15 hover:bg-background/25">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 grid place-items-center rounded-full bg-background/20">
                {mode === "ai" ? <Sparkles className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[hsl(var(--primary))]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm font-display leading-tight truncate">{cfg.title}</div>
              <div className="text-[11px] text-background/80">Online agora · responde em segundos</div>
            </div>
          </div>
          <div className="mt-3 h-1 bg-background/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-background"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
        </div>

        {/* Chat body */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-muted/30">
          {messages.map((m, i) => (
            <ChatBubble key={i} msg={m} />
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-background p-3 shrink-0">
          {done ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-medium">
              <Check className="w-4 h-4" /> Conversa enviada ao WhatsApp
            </div>
          ) : !current || typing ? (
            <div className="text-[11px] text-muted-foreground text-center py-2">Aguarde…</div>
          ) : current.type === "choice" ? (
            <div className="grid gap-1.5 max-h-44 overflow-y-auto">
              {current.options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => commitAnswer(opt)}
                  className="text-left rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 px-3 py-2 text-sm transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); commitAnswer(draft); }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                type={current.type === "tel" ? "tel" : current.type === "email" ? "email" : "text"}
                inputMode={current.type === "tel" ? "tel" : undefined}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); if (hint) setHint(null); }}
                placeholder={current.placeholder ?? "Digite sua resposta…"}
                className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="grid place-items-center w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow-primary hover:opacity-95"
                aria-label="Enviar"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
          {hint && !typing && !done && (
            <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-500">{hint}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.who === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] bg-gradient-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2 text-sm shadow-sm">
          {msg.text}
        </div>
      </motion.div>
    );
  }
  const text = msg.kind === "question" ? msg.step.question : msg.text;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[80%] bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm shadow-sm">
        {text}
      </div>
    </motion.div>
  );
}

// === Diagnostic mode: redirects to the dynamic funnel page ===
function DiagnosticRedirect({
  cfg,
  location,
  onClose,
}: {
  cfg: FunnelConfig;
  location: string;
  onClose: () => void;
}) {
  const slug = cfg.diagnosticSlug || "diagnostico-0web";
  useEffect(() => {
    trackEvent("wa_funnel_diagnostic_redirect", { location, slug });
  }, [location, slug]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-foreground/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-background border border-border rounded-3xl shadow-elegant p-6 text-center"
      >
        <div className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-lg">Diagnóstico completo</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vamos abrir o questionário detalhado para te orientar melhor.
        </p>
        <a
          href={`/f/${slug}`}
          className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-2.5 shadow-glow-primary"
        >
          Começar diagnóstico <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={onClose}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Agora não
        </button>
      </motion.div>
    </motion.div>
  );
}
