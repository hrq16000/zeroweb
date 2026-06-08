import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { listServicesNav } from "@/lib/services-nav.functions";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent, trackConversion } from "@/lib/analytics";

// FK to dynamic_forms.id (slug 'home-chatbot')
const FORM_ID = "c2fc4661-b5c1-4bd9-92b0-fc6b803fe686";
const STORAGE_KEY = "0web_chatbot_state";
const TYPING_MS = 600;

type Msg =
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "user"; text: string };

type Step = 0 | 1 | 2 | 3 | 4;

type State = {
  step: Step;
  messages: Msg[];
  servico?: { slug: string; name: string };
  perfil?: string;
  prazo?: string;
  nome?: string;
  whatsapp?: string;
};

const initialState: State = { step: 0, messages: [] };

const BR_DDD = new Set([
  11,12,13,14,15,16,17,18,19,
  21,22,24,27,28,
  31,32,33,34,35,37,38,
  41,42,43,44,45,46,47,48,49,
  51,53,54,55,
  61,62,63,64,65,66,67,68,69,
  71,73,74,75,77,79,
  81,82,83,84,85,86,87,88,89,
  91,92,93,94,95,96,97,98,99,
]);

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validateWhatsApp(raw: string): { valid: boolean; error?: string } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) {
    return { valid: false, error: "Informe o DDD + número completo." };
  }
  if (digits.length > 11) {
    return { valid: false, error: "Número com muitos dígitos." };
  }
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (!BR_DDD.has(ddd)) {
    return { valid: false, error: "DDD inválido. Verifique o código de área." };
  }
  if (digits.length === 11 && digits[2] !== "9") {
    return { valid: false, error: "Celular deve começar com 9 após o DDD." };
  }
  return { valid: true };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadState(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as State;
    if (parsed.step >= 4) return initialState; // completed → fresh
    return parsed;
  } catch {
    return initialState;
  }
}

function saveState(s: State) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function HomeChatbot() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [state, setState] = useState<State>(() => initialState);
  const [hydrated, setHydrated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

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
    trackEvent("chatbot_open", { location: "home" });
  }
  function handleClose() {
    setOpen(false);
    trackEvent("chatbot_close", { location: "home", step: state.step });
  }

  function chooseService(slug: string, name: string) {
    pushUser(name);
    setState((s) => ({ ...s, servico: { slug, name }, step: 1 }));
    trackEvent("chatbot_step", { step: 1, servico: slug });
    pushBot(`Ótimo! Esse serviço é para uso pessoal ou empresarial?`);
  }

  function choosePerfil(v: string) {
    pushUser(v);
    setState((s) => ({ ...s, perfil: v, step: 2 }));
    trackEvent("chatbot_step", { step: 2, perfil: v });
    pushBot("Qual é seu prazo?");
  }

  function choosePrazo(v: string) {
    pushUser(v);
    setState((s) => ({ ...s, prazo: v, step: 3 }));
    trackEvent("chatbot_step", { step: 3, prazo: v });
    pushBot(
      "Perfeito! Para te conectar com o especialista certo, preciso do seu nome e WhatsApp:",
    );
  }

  async function handleSubmitLead() {
    if (submitting) return;
    const nome = nameInput.trim();
    const whatsapp = phoneInput.trim();

    const phoneCheck = validateWhatsApp(whatsapp);
    if (nome.length < 2 || !phoneCheck.valid) {
      if (!phoneCheck.valid) {
        setPhoneError(phoneCheck.error ?? "Número inválido.");
        trackEvent("chatbot_input_error", { field: "whatsapp", reason: phoneCheck.error ?? "invalid" });
      }
      if (nome.length < 2) {
        trackEvent("chatbot_input_error", { field: "name", reason: "too_short" });
      }
      return;
    }
    setPhoneError(null);
    setSubmitting(true);
    trackEvent("chatbot_submit_attempt", { step: 3 });

    pushUser(`${nome} · ${whatsapp}`);

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
      },
      metadata_json: {
        source: "home-chatbot",
        source_url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        submitted_at: new Date().toISOString(),
      },
    };

    try {
      const { error } = await supabase.from("dynamic_form_leads").insert(payload);
      if (error) console.error("[HomeChatbot] insert error", error);
    } catch (err) {
      console.error("[HomeChatbot] insert exception", err);
    }

    trackConversion("chatbot_lead", {
      servico: state.servico?.slug,
      perfil: state.perfil,
      prazo: state.prazo,
    });

    setState((s) => ({ ...s, nome, whatsapp, step: 4 }));
    trackEvent("chatbot_step", { step: 4 });
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
    // Cap to a reasonable number to keep chip list readable
    return list.slice(0, 8);
  }, [nav]);

  const phoneValid = phoneInput.replace(/\D/g, "").length >= 10;
  const nameValid = nameInput.trim().length >= 2;
  const canSubmit = phoneValid && nameValid && !submitting;

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
            aria-label="Abrir chat de ajuda"
            className={[
              "fixed bottom-5 left-5 z-[60] inline-flex items-center gap-2.5",
              "rounded-full bg-primary text-primary-foreground font-semibold",
              "pl-4 pr-5 py-3 shadow-xl shadow-primary/30 hover:scale-[1.03] transition",
              pulse ? "animate-pulse" : "",
            ].join(" ")}
          >
            <span className="grid place-items-center w-7 h-7 rounded-full bg-primary-foreground/15">
              <MessageCircle className="w-4 h-4" />
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
              // Mobile fullscreen / Desktop floating panel
              "inset-0 sm:inset-auto sm:bottom-5 sm:left-5 sm:rounded-2xl",
              "sm:w-[360px] sm:h-[480px]",
            ].join(" ")}
            role="dialog"
            aria-label="Chat 0web"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-primary-foreground/15">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">0web Assistente</p>
                  <p className="text-[11px] opacity-80 leading-tight">Resposta em minutos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar chat"
                className="grid place-items-center w-8 h-8 rounded-full hover:bg-primary-foreground/15 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background/40"
            >
              {state.messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} text={m.text} />
              ))}
              {typing && <TypingDots />}

              {/* Step-specific UI */}
              {!typing && state.step === 0 && state.messages.length > 0 && (
                <ChipsRow>
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
                <ChipsRow>
                  {["Uso pessoal / freela", "Empresa pequena", "Empresa média/grande"].map((v) => (
                    <Chip key={v} onClick={() => choosePerfil(v)}>
                      {v}
                    </Chip>
                  ))}
                </ChipsRow>
              )}

              {!typing && state.step === 2 && (
                <ChipsRow>
                  {["Urgente — essa semana", "Até 30 dias", "Só estou pesquisando"].map((v) => (
                    <Chip key={v} onClick={() => choosePrazo(v)}>
                      {v}
                    </Chip>
                  ))}
                </ChipsRow>
              )}

              {!typing && state.step === 3 && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (com DDD)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(maskPhone(e.target.value))}
                    inputMode="tel"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitLead}
                    disabled={!canSubmit}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 text-sm disabled:opacity-50 hover:opacity-95 transition"
                  >
                    {submitting ? "Enviando…" : "Enviar"}
                    {!submitting && <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {!typing && state.step === 4 && (
                <div className="space-y-2 pt-1">
                  {state.servico?.slug && (
                    <button
                      type="button"
                      onClick={goToService}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 text-sm hover:opacity-95 transition"
                    >
                      Ver {state.servico.name} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goToAllServices}
                    className="w-full text-center text-xs font-medium text-primary hover:underline py-1.5"
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
    <div className="flex justify-start">
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

function ChipsRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 pt-1">{children}</div>;
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-primary/40 bg-primary/5 text-foreground hover:bg-primary hover:text-primary-foreground transition px-3 py-1.5 text-xs font-medium"
    >
      {children}
    </button>
  );
}
