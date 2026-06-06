import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Check, RotateCcw, Sparkles, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  evaluateConditionsFor,
  type Answers,
  type PreviewCondition,
  type PreviewQuestion,
} from "./funnel-preview-eval";

/**
 * In-editor preview that simulates an anonymous visitor going through the funnel.
 * No network submit — pure client-side walk through questions + conditions.
 * Exposes a debug panel showing the current path, conditions matched and answers.
 */
export function FunnelPreview({
  questions,
  conditions,
  name,
}: {
  questions: PreviewQuestion[];
  conditions: PreviewCondition[];
  name: string;
}) {
  const ordered = useMemo(
    () => [...questions].sort((a, b) => a.order_index - b.order_index),
    [questions],
  );
  const [stack, setStack] = useState<number[]>([0]);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { reason: "complete" | "end_form" }>(null);
  const [debug, setDebug] = useState(true);
  const [trail, setTrail] = useState<Array<{ key: string; matched?: string; via: string }>>([]);

  const reset = () => {
    setStack([0]); setAnswers({}); setError(null); setDone(null); setTrail([]);
  };

  // Reset if questions list shape changes
  useEffect(() => { reset(); /* eslint-disable-next-line */ }, [questions.length, conditions.length]);

  if (ordered.length === 0) {
    return <div className="text-center text-sm text-muted-foreground p-10 border border-dashed rounded-xl">
      Adicione perguntas para visualizar o preview.
    </div>;
  }

  const currentIdx = stack[stack.length - 1];
  const current = ordered[currentIdx];
  const total = ordered.length;
  const progress = Math.round(((currentIdx + 1) / total) * 100);

  const validate = (q: PreviewQuestion, value: unknown): string | null => {
    if (q.type === "statement") return null;
    const empty = value == null || value === "" || (Array.isArray(value) && value.length === 0);
    if (q.required && empty) return "Este campo é obrigatório.";
    if (empty) return null;
    if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return "E-mail inválido.";
    if (q.type === "phone" && String(value).replace(/\D/g, "").length < 10) return "Telefone inválido.";
    return null;
  };

  const goNext = (overrideValue?: unknown) => {
    setError(null);
    const value = overrideValue !== undefined ? overrideValue : answers[current.key];
    const err = validate(current, value);
    if (err) { setError(err); return; }
    const nextAnswers = overrideValue !== undefined
      ? { ...answers, [current.key]: overrideValue as Answers[string] }
      : answers;
    if (overrideValue !== undefined) setAnswers(nextAnswers);

    const ev = evaluateConditionsFor(current, nextAnswers, conditions);
    const matched = ev.steps.find((s) => s.matched);

    if (ev.end) {
      setTrail((t) => [...t, { key: current.key, matched: matched?.conditionId, via: "end_form" }]);
      setDone({ reason: "end_form" });
      return;
    }
    let nextIdx = currentIdx + 1;
    if (ev.skipTo) {
      const f = ordered.findIndex((q) => q.id === ev.skipTo);
      if (f >= 0) nextIdx = f;
    }
    setTrail((t) => [...t, { key: current.key, matched: matched?.conditionId, via: ev.skipTo ? "skip_to" : "linear" }]);
    if (nextIdx >= ordered.length) { setDone({ reason: "complete" }); return; }
    setStack([...stack, nextIdx]);
  };

  const goBack = () => { if (stack.length > 1) { setStack(stack.slice(0, -1)); setTrail((t) => t.slice(0, -1)); setError(null); } };
  const setValue = (val: Answers[string]) => setAnswers((a) => ({ ...a, [current.key]: val }));

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* progress */}
        <div className="h-1 bg-muted/40">
          <motion.div className="h-full bg-primary" initial={false}
            animate={{ width: done ? "100%" : `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        <div className="px-6 pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> {name} <span className="opacity-60">· pré-visualização</span>
          </span>
          <span>{done ? "fim" : `${currentIdx + 1} / ${total}`}</span>
        </div>

        <div className="p-6 min-h-[360px] flex items-center justify-center">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 max-w-md">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 grid place-items-center"><Check className="h-7 w-7 text-primary" /></div>
              <h3 className="text-xl font-semibold">
                {done.reason === "end_form" ? "Funil encerrado por regra (end_form)" : "Funil completo 🚀"}
              </h3>
              <p className="text-sm text-muted-foreground">Nada foi enviado — modo simulação.</p>
              <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-4 h-4 mr-2" /> Reiniciar</Button>
            </motion.div>
          ) : (
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div key={current.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight leading-snug">
                      {current.label}{current.required && current.type !== "statement" && <span className="text-primary"> *</span>}
                    </h3>
                    {current.hint && <p className="mt-1.5 text-sm text-muted-foreground">{current.hint}</p>}
                  </div>
                  <PreviewInput q={current} value={answers[current.key]} onChange={setValue}
                    onAutoAdvance={(v) => setTimeout(() => goNext(v), 250)} />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" onClick={goBack} disabled={stack.length <= 1} className="text-muted-foreground">
                      <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                    </Button>
                    {current.type !== "radio" && (
                      <Button onClick={() => goNext()}>
                        {currentIdx === ordered.length - 1 ? <>Concluir <Check className="ml-2 h-4 w-4" /></> : <>Continuar <ArrowRight className="ml-2 h-4 w-4" /></>}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* debug panel */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-muted-foreground">
            <Bug className="w-3.5 h-3.5" /> Debug
          </span>
          <button onClick={() => setDebug((d) => !d)} className="text-[10px] underline text-muted-foreground">
            {debug ? "ocultar" : "mostrar"}
          </button>
        </div>
        {debug && (
          <>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Caminho</div>
              <div className="flex flex-wrap gap-1">
                {stack.map((i, k) => (
                  <span key={k} className="font-mono px-1.5 py-0.5 rounded bg-card border border-border">
                    {ordered[i]?.key ?? "?"}
                  </span>
                ))}
                {done && <span className="font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary">{done.reason}</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Respostas</div>
              <pre className="text-[11px] bg-card rounded p-2 border border-border overflow-x-auto">
                {JSON.stringify(answers, null, 2)}
              </pre>
            </div>
            {trail.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Trilha</div>
                <ul className="space-y-1">
                  {trail.map((t, i) => (
                    <li key={i} className="flex gap-1.5 items-center">
                      <span className="font-mono">{t.key}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={`px-1.5 py-0.5 rounded ${t.via === "linear" ? "bg-card border border-border" : "bg-primary/15 text-primary"}`}>
                        {t.via}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={reset} size="sm" variant="outline" className="w-full"><RotateCcw className="w-3 h-3 mr-1.5" /> Reiniciar simulação</Button>
          </>
        )}
      </div>
    </div>
  );
}

function PreviewInput({ q, value, onChange, onAutoAdvance }: {
  q: PreviewQuestion;
  value: Answers[string] | undefined;
  onChange: (v: Answers[string]) => void;
  onAutoAdvance: (v: Answers[string]) => void;
}) {
  const opts = q.options_json ?? [];
  switch (q.type) {
    case "statement":
      return <div className="text-muted-foreground text-sm">Continue para avançar.</div>;
    case "long_text":
      return <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={q.placeholder ?? ""} />;
    case "short_text":
    case "email":
    case "phone":
    case "number":
      return <Input type={q.type === "email" ? "email" : q.type === "number" ? "number" : "text"} value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder ?? ""} className="h-11" />;
    case "radio":
      return (
        <div className="grid gap-2">
          {opts.map((o) => {
            const sel = value === o.value;
            return (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); onAutoAdvance(o.value); }}
                className={`text-left px-4 py-3 rounded-lg border transition ${sel ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60"}`}>
                <span className="text-sm font-medium">{o.emoji ? `${o.emoji} ` : ""}{o.label}</span>
              </button>
            );
          })}
        </div>
      );
    case "select":
      return (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-3 rounded-md border border-input bg-background">
          <option value="" disabled>Selecione…</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "checkbox": {
      const arr = (Array.isArray(value) ? value : []) as string[];
      const toggle = (v: string) => {
        const s = new Set(arr);
        s.has(v) ? s.delete(v) : s.add(v);
        onChange(Array.from(s));
      };
      return (
        <div className="grid gap-2">
          {opts.map((o) => {
            const c = arr.includes(o.value);
            return (
              <label key={o.value} className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer ${c ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60"}`}>
                <Checkbox checked={c} onCheckedChange={() => toggle(o.value)} />
                <span className="text-sm">{o.emoji ? `${o.emoji} ` : ""}{o.label}</span>
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
