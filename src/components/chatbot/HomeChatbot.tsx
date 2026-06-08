import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, ArrowRight, AlertTriangle, Pencil } from "lucide-react";
import { listServicesNav } from "@/lib/services-nav.functions";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, trackConversion } from "@/lib/analytics";
import {
  STORAGE_KEY,
  initialState,
  maskPhone,
  validateWhatsApp,
  loadState,
  saveState,
  getAttribution,
  type State,
  type Step,
  type Msg,
} from "./chatbot-utils";

// FK to dynamic_forms.id (slug 'home-chatbot')
const FORM_ID = "c2fc4661-b5c1-4bd9-92b0-fc6b803fe686";
const TYPING_MS = 600;
void STORAGE_KEY;


function uid() {
  return Math.random().toString(36).slice(2, 10);
}


export function HomeChatbot() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [state, setState] = useState<State>(() => initialState);
  const [hydrated, setHydrated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [consent, setConsent] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const fetchNav = useServerFn(listServicesNav);
  const { data: nav } = useQuery({
    queryKey: ["services-nav-chatbot"],
    queryFn: () => fetchNav(),
    staleTime: 5 * 60_000,
    enabled: open,
  });

  // Hydrate from sessionStorage on mount (client only)
  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.draftName) setNameInput(s.draftName);
    if (s.draftPhone) {
      // Re-apply mask in case storage format ever changed
      setPhoneInput(maskPhone(s.draftPhone));
    }
    if (s.consent) setConsent(true);
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // Persist draft inputs + consent as user types (Step 3)
  useEffect(() => {
    if (!hydrated) return;
    setState((s) => ({
      ...s,
      draftName: nameInput,
      draftPhone: phoneInput,
      consent,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameInput, phoneInput, consent, hydrated]);

  // Pulse animation: 4s
  useEffect(() => {
    const t = window.setTimeout(() => setPulse(false), 4000);
    return () => window.clearTimeout(t);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, typing, state.step]);

  // Focus management when panel opens
  useEffect(() => {
    if (open && closeBtnRef.current) {
      // Defer to next tick so the panel is mounted
      window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [open]);

  // Focus phone field when a validation error appears
  useEffect(() => {
    if (phoneError && phoneRef.current) phoneRef.current.focus();
  }, [phoneError]);
  useEffect(() => {
    if (nameError && nameRef.current) nameRef.current.focus();
  }, [nameError]);

  // Step 0 opening message (on widget open, if no messages yet)
  useEffect(() => {
    if (!open || !hydrated) return;
    if (state.step !== 0 || state.messages.length > 0) return;
    const t = window.setTimeout(() => {
      pushBot(
        "Olá! 👋 Sou o assistente da 0web. Posso te ajudar a encontrar o serviço ideal. O que você está precisando?",
      );
    }, 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hydrated]);

  function pushBot(text: string) {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setState((s) => ({ ...s, messages: [...s.messages, { id: uid(), role: "bot", text }] }));
    }, TYPING_MS);
  }

  function pushUser(text: string) {
    setState((s) => ({ ...s, messages: [...s.messages, { id: uid(), role: "user", text }] }));
  }

  function handleOpen() {
    setOpen(true);
    setPulse(false);
    trackEvent("chatbot_open", { location: "home", ...getAttribution() });
  }
  function handleClose() {
    setOpen(false);
    trackEvent("chatbot_close", { location: "home", step: state.step });
  }

  function chooseService(slug: string, name: string) {
    pushUser(name);
    setState((s) => ({ ...s, servico: { slug, name }, step: 1 }));
    trackEvent("chatbot_step", { step: 1, servico: slug, ...getAttribution() });
    pushBot(`Ótimo! Esse serviço é para uso pessoal ou empresarial?`);
  }

  function choosePerfil(v: string) {
    pushUser(v);
    setState((s) => ({ ...s, perfil: v, step: 2 }));
    trackEvent("chatbot_step", { step: 2, perfil: v, ...getAttribution() });
    pushBot("Qual é seu prazo?");
  }

  function choosePrazo(v: string) {
    pushUser(v);
    setState((s) => ({ ...s, prazo: v, step: 3 }));
    trackEvent("chatbot_step", { step: 3, prazo: v, ...getAttribution() });
    pushBot(
      "Perfeito! Para te conectar com o especialista certo, preciso do seu nome e WhatsApp:",
    );
  }

  /**
   * Validate Step 3 inputs and move to the review/preview card. The actual
   * insert only happens after the user confirms in the review screen.
   */
  function handleReviewLead() {
    if (submitting) return;
    const nome = nameInput.trim();
    const whatsapp = phoneInput.trim();
    setSubmitError(null);

    const phoneCheck = validateWhatsApp(whatsapp);
    let hasError = false;
    if (nome.length < 2) {
      setNameError("Informe seu nome (mínimo 2 letras).");
      trackEvent("chatbot_input_error", { field: "name", reason: "too_short" });
      hasError = true;
    } else {
      setNameError(null);
    }
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error ?? "Número inválido.");
      trackEvent("chatbot_input_error", {
        field: "whatsapp",
        reason: phoneCheck.error ?? "invalid",
      });
      hasError = true;
    } else {
      setPhoneError(null);
    }
    if (!consent) {
      setSubmitError("Você precisa aceitar o uso dos seus dados para continuar.");
      trackEvent("chatbot_input_error", { field: "consent", reason: "not_checked" });
      return;
    }
    if (hasError) return;

    setState((s) => ({ ...s, reviewing: true, nome, whatsapp }));
    trackEvent("chatbot_step", { step: 3, substep: "review", ...getAttribution() });
  }

  function handleEditFromReview() {
    setState((s) => ({ ...s, reviewing: false }));
    trackEvent("chatbot_review_edit", { ...getAttribution() });
  }

  async function handleSubmitLead() {
    if (submitting) return;
    const nome = (state.nome ?? nameInput).trim();
    const whatsapp = (state.whatsapp ?? phoneInput).trim();
    setSubmitError(null);
    setSubmitting(true);
    trackEvent("chatbot_submit_attempt", { step: 3, ...getAttribution() });


    const attribution = getAttribution();
    const payload = {
      form_id: FORM_ID,
      contact_name: nome,
      contact_phone: whatsapp,
      answers_json: {
        servico_escolhido: state.servico ?? null,
        perfil: state.perfil ?? null,
        prazo: state.prazo ?? null,
        nome,
        whatsapp,
        consent_lgpd: true,
        consent_at: new Date().toISOString(),
      },
      metadata_json: {
        source: "home-chatbot",
        source_url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        submitted_at: new Date().toISOString(),
        attribution,
      },
    };

    try {
      const { error } = await supabase.from("dynamic_form_leads").insert(payload);
      if (error) {
        console.error("[HomeChatbot] insert error", error);
        const isNetwork =
          /network|failed to fetch|load failed/i.test(error.message || "");
        const friendly = isNetwork
          ? "Sem conexão com o servidor. Verifique sua internet e tente novamente."
          : "Não conseguimos registrar agora. Tente novamente em instantes.";
        setSubmitError(friendly);
        trackEvent("chatbot_submit_error", {
          reason: isNetwork ? "network" : "insert_error",
          message: error.message,
        });
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("[HomeChatbot] insert exception", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isNetwork = /network|failed to fetch|load failed/i.test(msg);
      setSubmitError(
        isNetwork
          ? "Sem conexão com o servidor. Verifique sua internet e tente novamente."
          : "Ocorreu um erro inesperado. Tente novamente.",
      );
      trackEvent("chatbot_submit_error", {
        reason: isNetwork ? "network" : "exception",
        message: msg,
      });
      setSubmitting(false);
      return;
    }

    pushUser(`${nome} · ${whatsapp}`);
    trackConversion("chatbot_lead", {
      servico: state.servico?.slug,
      perfil: state.perfil,
      prazo: state.prazo,
      ...attribution,
    });

    setState((s) => ({ ...s, nome, whatsapp, step: 4, reviewing: false }));
    trackEvent("chatbot_step", { step: 4, ...attribution });
    pushBot(
      `Ótimo, ${nome}! 🎉 Vou te direcionar para ${state.servico?.name ?? "o serviço"} agora. Você também pode receber um retorno pelo WhatsApp em breve.`,
    );
    setSubmitting(false);
  }

  function goToService() {
    const slug = state.servico?.slug;
    if (slug) {
      navigate({ to: "/servicos/$slug", params: { slug } });
    } else {
      navigate({ to: "/servicos" });
    }
    trackEvent("chatbot_cta", { target: "service", slug });
    handleClose();
  }

  function goToAllServices() {
    navigate({ to: "/servicos" });
    trackEvent("chatbot_cta", { target: "all_services" });
    handleClose();
  }

  // Services chips
  const servicesChips = useMemo(() => {
    const list = nav?.menu ?? [];
    return list.slice(0, 8);
  }, [nav]);

  const phoneValid = validateWhatsApp(phoneInput).valid;
  const nameValid = nameInput.trim().length >= 2;
  const canSubmit = phoneValid && nameValid && consent && !submitting;

  return (
    <>
      {/* Closed: pill button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="chatbot-pill"
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleOpen}
            aria-label="Abrir chat de ajuda da 0web"
            aria-haspopup="dialog"
            aria-expanded={open}
            className={[
              "fixed bottom-5 left-5 z-[60] inline-flex items-center gap-2.5",
              "rounded-full bg-primary text-primary-foreground font-semibold",
              "pl-4 pr-5 py-3 shadow-xl shadow-primary/30 hover:scale-[1.03] transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
              pulse ? "animate-pulse" : "",
            ].join(" ")}
          >
            <span className="grid place-items-center w-7 h-7 rounded-full bg-primary-foreground/15">
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-sm">Como posso te ajudar?</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Open: panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbot-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={[
              "fixed z-[60] flex flex-col bg-card text-foreground border border-border shadow-2xl overflow-hidden",
              "inset-0 sm:inset-auto sm:bottom-5 sm:left-5 sm:rounded-2xl",
              "sm:w-[360px] sm:h-[480px]",
            ].join(" ")}
            role="dialog"
            aria-modal="false"
            aria-labelledby="chatbot-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") handleClose();
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-primary-foreground/15">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <p id="chatbot-title" className="text-sm font-bold leading-tight">
                    0web Assistente
                  </p>
                  <p className="text-[11px] opacity-80 leading-tight">Resposta em minutos</p>
                </div>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                aria-label="Fechar chat"
                className="grid place-items-center w-8 h-8 rounded-full hover:bg-primary-foreground/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Conversa do chatbot"
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background/40"
            >
              {state.messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} text={m.text} />
              ))}
              {typing && <TypingDots />}

              {/* Step-specific UI */}
              {!typing && state.step === 0 && state.messages.length > 0 && (
                <ChipsRow label="Selecione um serviço">
                  {servicesChips.length === 0 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      Carregando serviços…
                    </span>
                  )}
                  {servicesChips.map((s) => (
                    <Chip key={s.slug} onClick={() => chooseService(s.slug, s.name)}>
                      {s.name}
                    </Chip>
                  ))}
                  <Chip onClick={() => chooseService("", "Outro / Não sei ainda")}>
                    Outro / Não sei ainda
                  </Chip>
                </ChipsRow>
              )}

              {!typing && state.step === 1 && (
                <ChipsRow label="Selecione o perfil">
                  {["Uso pessoal / freela", "Empresa pequena", "Empresa média/grande"].map((v) => (
                    <Chip key={v} onClick={() => choosePerfil(v)}>
                      {v}
                    </Chip>
                  ))}
                </ChipsRow>
              )}

              {!typing && state.step === 2 && (
                <ChipsRow label="Selecione o prazo">
                  {["Urgente — essa semana", "Até 30 dias", "Só estou pesquisando"].map((v) => (
                    <Chip key={v} onClick={() => choosePrazo(v)}>
                      {v}
                    </Chip>
                  ))}
                </ChipsRow>
              )}

              {!typing && state.step === 3 && !state.reviewing && (
                <form
                  className="space-y-2 pt-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReviewLead();
                  }}
                >
                  <label htmlFor="chatbot-name" className="sr-only">
                    Seu nome
                  </label>
                  <input
                    id="chatbot-name"
                    ref={nameRef}
                    type="text"
                    placeholder="Seu nome"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    autoComplete="name"
                    maxLength={80}
                    required
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? "chatbot-name-err" : undefined}
                    className={[
                      "w-full rounded-xl border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2",
                      nameError
                        ? "border-red-400 focus:ring-red-300"
                        : "border-border focus:ring-primary/30",
                    ].join(" ")}
                  />
                  {nameError && (
                    <p id="chatbot-name-err" role="alert" className="text-[11px] text-red-500 -mt-1">
                      {nameError}
                    </p>
                  )}

                  <label htmlFor="chatbot-phone" className="sr-only">
                    WhatsApp com DDD
                  </label>
                  <input
                    id="chatbot-phone"
                    ref={phoneRef}
                    type="tel"
                    placeholder="WhatsApp (com DDD)"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(maskPhone(e.target.value));
                      if (phoneError) setPhoneError(null);
                    }}
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "chatbot-phone-err" : undefined}
                    className={[
                      "w-full rounded-xl border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2",
                      phoneError
                        ? "border-red-400 focus:ring-red-300"
                        : "border-border focus:ring-primary/30",
                    ].join(" ")}
                  />
                  {phoneError && (
                    <p id="chatbot-phone-err" role="alert" className="text-[11px] text-red-500 -mt-1">
                      {phoneError}
                    </p>
                  )}

                  <label className="flex items-start gap-2 pt-1 text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-describedby="chatbot-consent-desc"
                      required
                    />
                    <span id="chatbot-consent-desc">
                      Concordo com o uso dos meus dados para contato comercial conforme a{" "}
                      <a
                        href="/politica-privacidade"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary"
                      >
                        Política de Privacidade
                      </a>
                      .
                    </span>
                  </label>

                  {submitError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-2.5 py-2 text-[11px] text-red-700"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    aria-label="Enviar contato"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 text-sm disabled:opacity-50 hover:opacity-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {submitting ? "Enviando…" : "Enviar"}
                    {!submitting && <Send className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </form>
              )}

              {!typing && state.step === 4 && (
                <div className="space-y-2 pt-1">
                  {state.servico?.slug && (
                    <button
                      type="button"
                      onClick={goToService}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 text-sm hover:opacity-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Ver {state.servico.name} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goToAllServices}
                    className="w-full text-center text-xs font-medium text-primary hover:underline py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                  >
                    Ver todos os serviços
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ role, text }: { role: "bot" | "user"; text: string }) {
  if (role === "bot") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted text-foreground px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start" aria-label="Assistente está digitando">
      <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3 inline-flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChipsRow({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label={label}>
      {children}
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-primary/40 bg-primary/5 text-foreground hover:bg-primary hover:text-primary-foreground transition px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {children}
    </button>
  );
}
