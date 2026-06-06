import { useMemo, useState } from "react";
import { Play, RotateCcw, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { simulatePath, type Answers, type PreviewCondition, type PreviewQuestion } from "./funnel-preview-eval";

/**
 * Logic Tester: lets the admin set a value for every question and run a full
 * traversal simulation to validate skip_to / end_form paths automatically.
 */
export function LogicTester({
  questions,
  conditions,
}: {
  questions: PreviewQuestion[];
  conditions: PreviewCondition[];
}) {
  const ordered = useMemo(
    () => [...questions].sort((a, b) => a.order_index - b.order_index),
    [questions],
  );
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ReturnType<typeof simulatePath> | null>(null);

  if (ordered.length === 0) {
    return <div className="text-sm text-muted-foreground text-center p-6 border border-dashed rounded-xl">
      Adicione perguntas para testar a lógica.
    </div>;
  }

  const run = () => setResult(simulatePath(ordered, conditions, answers));
  const reset = () => { setAnswers({}); setResult(null); };

  const setVal = (key: string, v: Answers[string]) => setAnswers((a) => ({ ...a, [key]: v }));

  // Conflicts: questions with multiple conditions sharing the same priority
  const conflicts = useMemo(() => {
    const map = new Map<string, Map<number, number>>();
    for (const c of conditions) {
      const m = map.get(c.from_question_id) ?? new Map<number, number>();
      m.set(c.priority, (m.get(c.priority) ?? 0) + 1);
      map.set(c.from_question_id, m);
    }
    const out: Array<{ questionId: string; priority: number; count: number }> = [];
    map.forEach((m, qid) => m.forEach((count, priority) => {
      if (count > 1) out.push({ questionId: qid, priority, count });
    }));
    return out;
  }, [conditions]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Testador de regras</h3>
            <p className="text-xs text-muted-foreground">Preencha respostas e valide automaticamente o caminho com skip_to/end_form.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Limpar</Button>
            <Button size="sm" onClick={run}><Play className="w-3.5 h-3.5 mr-1.5" /> Simular</Button>
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-700 dark:text-amber-400">Conflitos de prioridade detectados</div>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {conflicts.map((c, i) => {
                  const q = ordered.find((x) => x.id === c.questionId);
                  return <li key={i}>· <b>{q?.label ?? "?"}</b>: {c.count} regras com prioridade {c.priority}</li>;
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {ordered.map((q) => (
            <div key={q.id} className="space-y-1">
              <div className="text-xs">
                <span className="font-medium">{q.label}</span>{" "}
                <span className="text-muted-foreground font-mono">({q.key})</span>
              </div>
              <LogicInput q={q} value={answers[q.key]} onChange={(v) => setVal(q.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            Resultado da simulação
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${result.endedEarly ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {result.endedEarly ? "encerrado por regra" : "fluxo completo"}
            </span>
          </h3>

          <div className="text-xs text-muted-foreground mb-2">{result.visited.length} pergunta(s) visitadas</div>

          <ol className="space-y-2">
            {result.visited.map((v, i) => {
              const matched = v.eval.steps.find((s) => s.matched);
              return (
                <li key={i} className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">#{i + 1}</span>
                    <span className="font-medium">{v.q.label}</span>
                    <span className="text-xs text-muted-foreground">({v.q.key})</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className={`text-xs px-2 py-0.5 rounded ${v.nextReason === "linear" ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary font-medium"}`}>
                      {v.nextReason}
                    </span>
                  </div>
                  {v.eval.steps.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs">
                      {v.eval.steps.map((s, j) => (
                        <li key={j} className={`font-mono ${s.matched ? "text-primary" : "text-muted-foreground"}`}>
                          {s.matched ? "✓" : "·"} {s.operator} {JSON.stringify(s.expected)} vs {JSON.stringify(s.actual)} → {s.action}{s.target ? `(${ordered.find((q) => q.id === s.target)?.key ?? s.target})` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!matched && v.eval.steps.length > 0 && (
                    <div className="mt-1 text-[11px] text-muted-foreground">Nenhuma regra casou — avançou linearmente.</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function LogicInput({ q, value, onChange }: {
  q: PreviewQuestion;
  value: Answers[string] | undefined;
  onChange: (v: Answers[string]) => void;
}) {
  const opts = q.options_json ?? [];
  if (q.type === "statement") return <div className="text-xs text-muted-foreground italic">sem input</div>;
  if (q.type === "radio" || q.type === "select") {
    return (
      <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm">
        <option value="">— vazio —</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (q.type === "checkbox") {
    const arr = (Array.isArray(value) ? value : []) as string[];
    return (
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => {
          const sel = arr.includes(o.value);
          return (
            <button key={o.value} type="button"
              onClick={() => onChange(sel ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
              className={`text-xs px-2 py-1 rounded border ${sel ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }
  return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
    placeholder={q.placeholder ?? ""} className="h-9 text-sm" />;
}
