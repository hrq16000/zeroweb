import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import {
  submitFunnel,
  type FunnelDefinition,
  type FunnelQuestion,
} from "@/lib/dynamic-funnel.functions";
import {
  createVisitorFunnelSession,
  updateVisitorFunnelSession,
} from "@/lib/visitor-funnel.functions";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { getLeadAttribution } from "@/lib/lead-attribution";
import { saveAttributionSnapshot } from "@/lib/lead-attribution-snapshot";
import { getVisitorId, newFunnelSessionId, collectTechnicalContext } from "@/lib/visitor-id";
import { readCart } from "@/lib/cart";
import { getGeoForLead, inferNeighborhoodSlug, slugifyGeo } from "@/lib/geo-location";

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const utm: Record<string, string> = {};
  const url = new URL(window.location.href);
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach((k) => {
    const v = url.searchParams.get(k); if (v) utm[k] = v;
  });
  return utm;
}

type Answers = Record<string, string | string[] | number>;

function evaluateCondition(
  q: FunnelQuestion,
  answers: Answers,
  funnel: FunnelDefinition,
): { skipTo?: string; end?: boolean } {
  const conds = funnel.conditions
    .filter((c) => c.from_question_id === q.id)
    .sort((a, b) => a.priority - b.priority);
  const a = answers[q.key];
  for (const c of conds) {
    let match = false;
    switch (c.operator) {
      case "equals": match = a === c.value; break;
      case "not_equals": match = a !== c.value; break;
      case "contains": match = Array.isArray(a) ? a.includes(c.value as string) : String(a ?? "").includes(String(c.value)); break;
      case "in": match = Array.isArray(c.value) && (c.value as unknown[]).includes(a); break;
      case "not_in": match = Array.isArray(c.value) && !(c.value as unknown[]).includes(a); break;
      case "is_empty": match = a == null || a === "" || (Array.isArray(a) && a.length === 0); break;
      case "is_not_empty": match = !(a == null || a === "" || (Array.isArray(a) && a.length === 0)); break;
    }
    if (match) {
      if (c.action === "end_form") return { end: true };
      if (c.action === "skip_to" && c.target_question_id) return { skipTo: c.target_question_id };
    }
  }
  return {};
}

function validate(q: FunnelQuestion, value: unknown): string | null {
  if (q.type === "statement") return null;
  const empty = value == null || value === "" || (Array.isArray(value) && value.length === 0);
  if (q.required && empty) return "Este campo é obrigatório.";
  if (empty) return null;
  if (q.type === "email") {
    const ok = z.string().email().safeParse(value).success;
    if (!ok) return "Informe um e-mail válido.";
  }
  if (q.type === "phone") {
    const digits = String(value).replace(/\D/g, "");
    if (digits.length < 10) return "Informe um telefone válido com DDD.";
  }
  return null;
}

export function FunnelRunner({ funnel, embedded = false, onComplete }: { funnel: FunnelDefinition; embedded?: boolean; onComplete?: () => void }) {
  const submit = useServerFn(submitFunnel);
  const createSession = useServerFn(createVisitorFunnelSession);
  const updateSession = useServerFn(updateVisitorFunnelSession);
  const ordered = useMemo(
    () => [...funnel.questions].sort((a, b) => a.order_index - b.order_index),
    [funnel.questions],
  );
  const [stack, setStack] = useState<number[]>([0]);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | {
    nextPath: string;
    redirectPath: string | null;
    protocol: string | null;
    redirectFailed?: boolean;
  }>(null);
  const [startedAt] = useState(() => new Date().toISOString());
  const [funnelSessionId] = useState<string>(() => newFunnelSessionId());
  const [sessionStarted, setSessionStarted] = useState(false);

  // Fire-and-forget: cria a visitor_funnel_session ao abrir o funil.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const utm = readUtm();
    const cartSnap = readCart().map((c) => ({
      slug: c.slug,
      name: c.name,
      price: c.price ?? null,
      qty: c.qty,
    }));
    const neighborhoodSlug = inferNeighborhoodSlug(window.location.pathname);
    void getGeoForLead().then((geo) =>
    createSession({
      data: {
        visitor_id: getVisitorId(),
        session_id: funnelSessionId,
        funnel_slug: funnel.slug,
        origin: {
          city_slug: slugifyGeo(geo?.city),
          neighborhood_slug: neighborhoodSlug,
          geo_city: geo?.city,
          geo_region: geo?.region,
          geo_source: geo?.source,
          page_path: window.location.pathname,
          page_url: window.location.href,
          referrer: document.referrer || undefined,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          gclid: url.searchParams.get("gclid") ?? undefined,
          fbclid: url.searchParams.get("fbclid") ?? undefined,
          funnel_slug: funnel.slug,
        },
        technical_context: collectTechnicalContext(),
        cart_snapshot_open: cartSnap.length ? cartSnap : undefined,
      },
    }).catch((err) => {
      console.warn("[FunnelRunner] createVisitorFunnelSession failed", err);
    }));
  }, [createSession, funnel.slug, funnelSessionId]);


  const currentIdx = stack[stack.length - 1];
  const current = ordered[currentIdx];
  const total = ordered.length;
  const progress = Math.round(((currentIdx + 1) / total) * 100);
  const autoAdvanceMs = Number((funnel.config as { auto_advance_ms?: number }).auto_advance_ms ?? 400);

  // Track question view whenever the current question changes
  useEffect(() => {
    if (!current || done) return;
    const utm = readUtm();
    trackEvent("funnel_question_view", {
      funnel_slug: funnel.slug,
      funnel_id: funnel.id,
      question_key: current.key,
      question_type: current.type,
      question_index: currentIdx,
      total_questions: total,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    });
  }, [current, currentIdx, done, funnel.id, funnel.slug, total]);

  const finalize = useCallback(async (finalAnswers: Answers) => {
    setSubmitting(true);
    try {
      const utm = readUtm();
      const url = new URL(window.location.href);
      const result = await submit({
        data: {
          form_id: funnel.id,
          answers: finalAnswers,
          client_metadata: {
            page_url: window.location.href,
            referrer: document.referrer || undefined,
            utm,
            gclid: url.searchParams.get("gclid") ?? undefined,
            fbclid: url.searchParams.get("fbclid") ?? undefined,
            started_at: startedAt,
          },
        },
      });
      trackConversion("funnel_complete", {
        funnel_slug: funnel.slug,
        funnel_id: funnel.id,
        total_questions: total,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
      });
      // Persist attribution snapshot so /obrigado + ThankYouModal show the
      // same source/channel/UTM as this submission.
      try {
        const attr = getLeadAttribution(`funnel:${funnel.slug}`, `funnel_${funnel.slug}`);
        saveAttributionSnapshot(attr);
      } catch { /* noop */ }

      const nextPath = result.nextPath ?? "/obrigado";
      const redirectPath =
        (result as { redirectPath?: string | null }).redirectPath ?? null;
      const protocol = (result as { protocol?: string | null }).protocol ?? null;

      setDone({ nextPath, redirectPath, protocol });

      // Persist submitted status to the pre-lead session.
      updateSession({
        data: {
          session_id: funnelSessionId,
          status: "form_submitted",
          partial_answers: finalAnswers as Record<string, unknown>,
          protocol: protocol ?? undefined,
          cart_snapshot_final: readCart().map((c) => ({
            slug: c.slug, name: c.name, price: c.price ?? null, qty: c.qty,
          })),
        },
      }).catch((err) => console.warn("[FunnelRunner] update form_submitted failed", err));

      // IMPORTANT: when we have a tokenized redirect, we OWN the completion UI
      // (auto-redirect + fallback button). Never hand control back to the
      // wrapper, or it will replace this UI with a static "Tudo certo" screen
      // and the redirect never happens.
      if (onComplete && !redirectPath) setTimeout(() => onComplete(), 1500);

      // Auto-redirect to WhatsApp (tokenized, server-side). If unavailable,
      // fall back to /obrigado where the user can also reach support.
      if (redirectPath) {
        trackEvent("whatsapp_redirect_requested", {
          funnel_slug: funnel.slug,
          protocol: protocol ?? undefined,
        });
        updateSession({
          data: { session_id: funnelSessionId, status: "whatsapp_redirected" },
        }).catch(() => { /* noop */ });
        // Small delay so the transition frame is visible.
        setTimeout(() => {
          try {
            window.location.href = redirectPath;
          } catch {
            setDone((prev) =>
              prev ? { ...prev, redirectFailed: true } : prev,
            );
          }
        }, 700);
        // If we're still on this page after ~4s, treat as blocked and show fallback.
        setTimeout(() => {
          setDone((prev) =>
            prev && !prev.redirectFailed ? { ...prev, redirectFailed: true } : prev,
          );
        }, 4000);
      } else if (!embedded) {
        setTimeout(() => { window.location.href = nextPath; }, 900);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar. Tente novamente.");
      setSubmitting(false);
    }
  }, [funnel.id, funnel.slug, submit, startedAt, total, embedded, onComplete, updateSession, funnelSessionId]);

  const goNext = useCallback((overrideValue?: unknown) => {
    setError(null);
    const value = overrideValue !== undefined ? overrideValue : answers[current.key];
    const err = validate(current, value);
    if (err) { setError(err); return; }
    const nextAnswers = overrideValue !== undefined
      ? { ...answers, [current.key]: overrideValue as Answers[string] }
      : answers;
    if (overrideValue !== undefined) setAnswers(nextAnswers);

    // Track answer
    const utm = readUtm();
    trackEvent("funnel_answer", {
      funnel_slug: funnel.slug,
      funnel_id: funnel.id,
      question_key: current.key,
      question_type: current.type,
      question_index: currentIdx,
      answer_preview: Array.isArray(value) ? value.join(",").slice(0, 80) : String(value ?? "").slice(0, 80),
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    });

    // First answer triggers funnel_started + partial persistence.
    if (!sessionStarted) {
      setSessionStarted(true);
      updateSession({
        data: {
          session_id: funnelSessionId,
          status: "funnel_started",
          last_step: currentIdx,
          partial_answers: nextAnswers as Record<string, unknown>,
        },
      }).catch(() => { /* noop */ });
    } else {
      // Debounced-ish: only send partial when moving forward.
      updateSession({
        data: {
          session_id: funnelSessionId,
          last_step: currentIdx,
          partial_answers: nextAnswers as Record<string, unknown>,
        },
      }).catch(() => { /* noop */ });
    }

    const cond = evaluateCondition(current, nextAnswers, funnel);
    if (cond.end) { void finalize(nextAnswers); return; }
    let nextIdx = currentIdx + 1;
    if (cond.skipTo) {
      const found = ordered.findIndex((q) => q.id === cond.skipTo);
      if (found >= 0) nextIdx = found;
    }
    if (nextIdx >= ordered.length) { void finalize(nextAnswers); return; }
    setStack([...stack, nextIdx]);
  }, [answers, current, currentIdx, finalize, funnel, ordered, stack, sessionStarted, updateSession, funnelSessionId]);

  const goBack = () => {
    setError(null);
    if (stack.length > 1) setStack(stack.slice(0, -1));
  };

  const setValue = (val: Answers[string]) => setAnswers((a) => ({ ...a, [current.key]: val }));

  // keyboard: Enter to advance (except in textarea)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || submitting) return;
      if (e.key === "Enter" && !e.shiftKey && current?.type !== "long_text") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, done, submitting, goNext]);

  if (done) {
    const hasRedirect = Boolean(done.redirectPath);
    const showFallback = done.redirectFailed || !hasRedirect;
    return (
      <div className={`${embedded ? "py-10" : "min-h-screen"} flex items-center justify-center px-6 bg-background text-foreground`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center space-y-6"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/15 grid place-items-center">
            {showFallback ? (
              <Check className="h-8 w-8 text-primary" />
            ) : (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {showFallback ? "Solicitação registrada" : "Abrindo o WhatsApp…"}
          </h2>
          <p className="text-muted-foreground">
            {showFallback
              ? hasRedirect
                ? "Se o WhatsApp não abriu automaticamente, use o botão abaixo para continuar."
                : "Recebemos sua solicitação. Nossa equipe entrará em contato em instantes."
              : "Estamos preparando sua mensagem com o resumo da solicitação."}
          </p>
          {done.protocol && (
            <p className="text-xs text-muted-foreground">
              Protocolo: <span className="font-mono">{done.protocol}</span>
            </p>
          )}
          {hasRedirect && (
            <a
              href={done.redirectPath!}
              rel="noopener"
              onClick={() =>
                trackEvent("whatsapp_redirect_requested", {
                  funnel_slug: funnel.slug,
                  protocol: done.protocol ?? undefined,
                  source: "fallback_button",
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary hover:opacity-95 transition-opacity"
            >
              Continuar no WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
          {!hasRedirect && (
            <a
              href={done.nextPath}
              className="text-sm text-primary hover:underline"
            >
              Voltar ao site
            </a>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? "" : "min-h-screen"} bg-background text-foreground flex flex-col`}>
      {/* Progress */}
      <div className={`${embedded ? "sticky top-0" : "fixed top-0 left-0 right-0"} h-1 bg-muted/40 z-50`}>
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <header className={`${embedded ? "px-5 pt-4" : "px-6 pt-6"} flex items-center justify-between text-xs text-muted-foreground`}>
        <span className="inline-flex items-center gap-2 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> {funnel.name}
        </span>
        <span>{currentIdx + 1} / {total}</span>
      </header>

      <main className={`flex-1 flex items-center justify-center ${embedded ? "px-5 py-6" : "px-6"}`}>
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                  {current.label}
                  {current.required && current.type !== "statement" && <span className="text-primary"> *</span>}
                </h2>
                {current.hint && (
                  <p className="mt-2 text-sm text-muted-foreground">{current.hint}</p>
                )}
              </div>

              <QuestionInput
                question={current}
                value={answers[current.key]}
                onChange={setValue}
                onAutoAdvance={(v) => {
                  setTimeout(() => goNext(v), autoAdvanceMs);
                }}
              />

              {error && (
                <p className="text-sm text-destructive" role="alert">{error}</p>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={goBack}
                  disabled={stack.length <= 1 || submitting}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                </Button>
                {current.type !== "radio" && (
                  <Button onClick={() => goNext()} disabled={submitting} size="lg">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" />
                      : currentIdx === ordered.length - 1
                        ? <>Enviar <Check className="ml-2 h-4 w-4" /></>
                        : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                )}
                {current.type === "radio" && (
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> para avançar
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-[11px] text-muted-foreground">
        Protegido por 0web — seus dados são tratados com segurança.
      </footer>
    </div>
  );
}

function QuestionInput({
  question, value, onChange, onAutoAdvance,
}: {
  question: FunnelQuestion;
  value: Answers[string] | undefined;
  onChange: (v: Answers[string]) => void;
  onAutoAdvance: (v: Answers[string]) => void;
}) {
  switch (question.type) {
    case "statement":
      return <div className="text-muted-foreground">Pressione continuar para começar.</div>;
    case "long_text":
      return (
        <Textarea
          autoFocus
          placeholder={question.placeholder ?? ""}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="text-lg"
        />
      );
    case "short_text":
    case "email":
    case "phone":
    case "number":
      return (
        <Input
          autoFocus
          type={question.type === "email" ? "email" : question.type === "number" ? "number" : "text"}
          inputMode={question.type === "phone" ? "tel" : question.type === "email" ? "email" : undefined}
          placeholder={question.placeholder ?? ""}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 text-lg"
        />
      );
    case "radio":
      return (
        <div className="grid gap-3">
          {question.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); onAutoAdvance(opt.value); }}
                className={[
                  "w-full text-left px-5 py-4 rounded-xl border transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  selected ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-border bg-card",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                  <span className="text-base font-medium">{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    case "select":
      return (
        <select
          autoFocus
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 rounded-md border border-input bg-background text-lg"
        >
          <option value="" disabled>Selecione…</option>
          {question.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "checkbox": {
      const arr = (Array.isArray(value) ? value : []) as string[];
      const toggle = (v: string) => {
        const set = new Set(arr);
        if (set.has(v)) set.delete(v); else set.add(v);
        onChange(Array.from(set));
      };
      return (
        <div className="grid gap-3">
          {question.options.map((opt) => {
            const checked = arr.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={[
                  "flex items-center gap-3 px-5 py-4 rounded-xl border cursor-pointer transition-all",
                  checked ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60",
                ].join(" ")}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(opt.value)} />
                {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                <span className="text-base font-medium">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    default:
      return null;
  }
}
