import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Plus, Trash2, Power, Save, X, FlaskConical, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { listForms } from "@/lib/dynamic-funnel-admin.functions";
import {
  listPipelineRules,
  savePipelineRule,
  deletePipelineRule,
  togglePipelineRule,
} from "@/lib/lead-pipeline-rules.functions";
import { simulateRules, type PipelineRule as EvalRule, type MockLead, type SimulationResult } from "@/lib/pipeline-rules-eval";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/funis/pipeline/regras")({
  component: PipelineRulesPage,
});

type Stage = "novo" | "contatado" | "qualificado" | "ganho" | "perdido";
type Intent = "cold" | "warm" | "hot";

const STAGES: { v: Stage; label: string }[] = [
  { v: "novo", label: "Novo" },
  { v: "contatado", label: "Contatado" },
  { v: "qualificado", label: "Qualificado" },
  { v: "ganho", label: "Ganho" },
  { v: "perdido", label: "Perdido" },
];
const INTENTS: Intent[] = ["cold", "warm", "hot"];

type Rule = {
  id?: string;
  form_id: string | null;
  name: string;
  trigger: {
    score_gte?: number;
    score_lte?: number;
    intent_in?: Intent[];
    has_any_tag?: string[];
    answer?: { question_key: string; equals?: string; contains?: string; in?: string[] };
  };
  action: { stage?: Stage; add_tags?: string[]; remove_tags?: string[] };
  priority: number;
  enabled: boolean;
};

const EMPTY_RULE: Rule = {
  form_id: null,
  name: "",
  trigger: {},
  action: {},
  priority: 0,
  enabled: true,
};

function PipelineRulesPage() {
  const fetchRules = useServerFn(listPipelineRules);
  const fetchForms = useServerFn(listForms);
  const save = useServerFn(savePipelineRule);
  const del = useServerFn(deletePipelineRule);
  const toggle = useServerFn(togglePipelineRule);

  const [rules, setRules] = useState<Rule[]>([]);
  const [forms, setForms] = useState<Awaited<ReturnType<typeof listForms>>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [simulating, setSimulating] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [r, f] = await Promise.all([fetchRules(), fetchForms()]);
      setRules(r as Rule[]);
      setForms(f);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const formName = (id: string | null) =>
    id ? forms.find((f) => f.id === id)?.name ?? "—" : "Todos os funis";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link to="/app/funis/leads" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="w-3 h-3" /> Voltar para leads
          </Link>
          <h1 className="text-2xl font-bold font-display">Regras do pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Classifique e marque leads automaticamente quando entram no sistema. A regra com maior prioridade vence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSimulating(true)}>
            <FlaskConical className="w-4 h-4 mr-2" /> Simular
          </Button>
          <Button onClick={() => setEditing({ ...EMPTY_RULE })}>
            <Plus className="w-4 h-4 mr-2" /> Nova regra
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-medium">Nenhuma regra ainda.</p>
            <p className="text-sm mt-1">Crie a primeira regra para automatizar o pipeline.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Prio</th>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Funil</th>
                <th className="text-left p-3">Quando</th>
                <th className="text-left p-3">Então</th>
                <th className="text-center p-3">Ativa</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{r.priority}</td>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formName(r.form_id)}</td>
                  <td className="p-3 text-xs"><TriggerSummary t={r.trigger} /></td>
                  <td className="p-3 text-xs"><ActionSummary a={r.action} /></td>
                  <td className="p-3 text-center">
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={async (v) => {
                        if (!r.id) return;
                        await toggle({ data: { id: r.id, enabled: v } });
                        refresh();
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button title="Editar" onClick={() => setEditing({ ...r })} className="p-2 rounded hover:bg-muted text-xs">Editar</button>
                      <button
                        title="Excluir"
                        onClick={async () => {
                          if (!r.id || !confirm(`Excluir regra "${r.name}"?`)) return;
                          await del({ data: { id: r.id } });
                          toast.success("Regra excluída");
                          refresh();
                        }}
                        className="p-2 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <RuleEditor
          rule={editing}
          forms={forms}
          onCancel={() => setEditing(null)}
          onSave={async (r) => {
            try {
              await save({ data: r });
              toast.success("Regra salva");
              setEditing(null);
              refresh();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Erro ao salvar");
            }
          }}
        />
      )}

      {simulating && (
        <RuleSimulator
          rules={rules as unknown as EvalRule[]}
          forms={forms}
          onClose={() => setSimulating(false)}
        />
      )}
    </div>
  );
}

function TriggerSummary({ t }: { t: Rule["trigger"] }) {
  const parts: string[] = [];
  if (t.score_gte != null) parts.push(`score ≥ ${t.score_gte}`);
  if (t.score_lte != null) parts.push(`score ≤ ${t.score_lte}`);
  if (t.intent_in?.length) parts.push(`intenção: ${t.intent_in.join(", ")}`);
  if (t.has_any_tag?.length) parts.push(`tem tag: ${t.has_any_tag.join(", ")}`);
  if (t.answer?.question_key) {
    const k = t.answer.question_key;
    if (t.answer.equals) parts.push(`${k} = "${t.answer.equals}"`);
    else if (t.answer.contains) parts.push(`${k} contém "${t.answer.contains}"`);
    else if (t.answer.in?.length) parts.push(`${k} em [${t.answer.in.join(", ")}]`);
  }
  return <span className="text-muted-foreground">{parts.join(" e ") || "—"}</span>;
}

function ActionSummary({ a }: { a: Rule["action"] }) {
  const parts: string[] = [];
  if (a.stage) parts.push(`mover para "${a.stage}"`);
  if (a.add_tags?.length) parts.push(`+tags: ${a.add_tags.join(", ")}`);
  if (a.remove_tags?.length) parts.push(`-tags: ${a.remove_tags.join(", ")}`);
  return <span>{parts.join(" · ") || "—"}</span>;
}

function RuleEditor({
  rule,
  forms,
  onSave,
  onCancel,
}: {
  rule: Rule;
  forms: Awaited<ReturnType<typeof listForms>>;
  onSave: (r: Rule) => void;
  onCancel: () => void;
}) {
  const [r, setR] = useState<Rule>(rule);
  const t = r.trigger;
  const a = r.action;

  const update = (patch: Partial<Rule>) => setR((p) => ({ ...p, ...patch }));
  const updT = (patch: Partial<Rule["trigger"]>) => update({ trigger: { ...t, ...patch } });
  const updA = (patch: Partial<Rule["action"]>) => update({ action: { ...a, ...patch } });

  const addTagsStr = useMemo(() => (a.add_tags ?? []).join(", "), [a.add_tags]);
  const removeTagsStr = useMemo(() => (a.remove_tags ?? []).join(", "), [a.remove_tags]);
  const hasTagsStr = useMemo(() => (t.has_any_tag ?? []).join(", "), [t.has_any_tag]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-xl my-8 animate-scale-in">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">{r.id ? "Editar regra" : "Nova regra"}</h2>
          <button onClick={onCancel} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Identificação */}
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome</label>
              <Input value={r.name} onChange={(e) => update({ name: e.target.value })} placeholder="Lead quente → qualificado" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
              <Input type="number" min={0} max={1000} value={r.priority} onChange={(e) => update({ priority: Number(e.target.value) || 0 })} className="w-24" />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch checked={r.enabled} onCheckedChange={(v) => update({ enabled: v })} />
              <span className="text-xs">{r.enabled ? "Ativa" : "Inativa"}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Funil (opcional)</label>
            <select
              value={r.form_id ?? ""}
              onChange={(e) => update({ form_id: e.target.value || null })}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Todos os funis</option>
              {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* Quando */}
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Power className="w-3.5 h-3.5" /> Quando (condições — todas devem casar)</h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <NumField label="Score ≥" value={t.score_gte} onChange={(v) => updT({ score_gte: v })} />
              <NumField label="Score ≤" value={t.score_lte} onChange={(v) => updT({ score_lte: v })} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Nível de intenção</label>
              <div className="flex gap-2 mt-1">
                {INTENTS.map((i) => {
                  const on = t.intent_in?.includes(i) ?? false;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const cur = new Set(t.intent_in ?? []);
                        on ? cur.delete(i) : cur.add(i);
                        updT({ intent_in: cur.size ? Array.from(cur) as Intent[] : undefined });
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs capitalize ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <CsvField
              label="Tem alguma das tags (separe por vírgula)"
              value={hasTagsStr}
              onChange={(arr) => updT({ has_any_tag: arr.length ? arr : undefined })}
              placeholder="hot, google-ads"
            />

            <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Resposta específica (opcional)</div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Input
                  placeholder="chave da pergunta (ex: investimento)"
                  value={t.answer?.question_key ?? ""}
                  onChange={(e) => updT({ answer: { ...(t.answer ?? { question_key: "" }), question_key: e.target.value } })}
                />
                <select
                  value={t.answer?.equals != null ? "equals" : t.answer?.contains != null ? "contains" : t.answer?.in != null ? "in" : ""}
                  onChange={(e) => {
                    const op = e.target.value;
                    if (!t.answer?.question_key) return;
                    const base = { question_key: t.answer.question_key };
                    if (op === "equals") updT({ answer: { ...base, equals: "" } });
                    else if (op === "contains") updT({ answer: { ...base, contains: "" } });
                    else if (op === "in") updT({ answer: { ...base, in: [] } });
                    else updT({ answer: undefined });
                  }}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">— operador —</option>
                  <option value="equals">igual a</option>
                  <option value="contains">contém</option>
                  <option value="in">está em</option>
                </select>
              </div>
              {t.answer?.equals != null && (
                <Input value={t.answer.equals} onChange={(e) => updT({ answer: { ...t.answer!, equals: e.target.value } })} placeholder="valor exato" />
              )}
              {t.answer?.contains != null && (
                <Input value={t.answer.contains} onChange={(e) => updT({ answer: { ...t.answer!, contains: e.target.value } })} placeholder="texto contido" />
              )}
              {t.answer?.in != null && (
                <CsvField
                  label=""
                  value={(t.answer.in ?? []).join(", ")}
                  onChange={(arr) => updT({ answer: { ...t.answer!, in: arr } })}
                  placeholder="valor1, valor2, valor3"
                />
              )}
            </div>
          </section>

          {/* Então */}
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Então (ações)</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Mover para etapa</label>
              <select
                value={a.stage ?? ""}
                onChange={(e) => updA({ stage: (e.target.value || undefined) as Stage | undefined })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">— não alterar —</option>
                {STAGES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </div>

            <CsvField
              label="Adicionar tags"
              value={addTagsStr}
              onChange={(arr) => updA({ add_tags: arr.length ? arr : undefined })}
              placeholder="prioritario, vip"
            />
            <CsvField
              label="Remover tags"
              value={removeTagsStr}
              onChange={(arr) => updA({ remove_tags: arr.length ? arr : undefined })}
              placeholder="cold"
            />
          </section>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={() => onSave(r)}><Save className="w-4 h-4 mr-2" /> Salvar regra</Button>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        type="number"
        min={0}
        max={100}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        placeholder="—"
      />
    </div>
  );
}

function CsvField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (arr: string[]) => void; placeholder?: string }) {
  const [raw, setRaw] = useState(value);
  useEffect(() => setRaw(value), [value]);
  return (
    <div>
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <Input
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={() => onChange(raw.split(",").map((s) => s.trim()).filter(Boolean))}
        placeholder={placeholder}
      />
    </div>
  );
}
