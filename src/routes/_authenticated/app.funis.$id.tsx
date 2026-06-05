import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getForm, saveForm, upsertQuestion, deleteQuestion, reorderQuestions,
  upsertCondition, deleteCondition,
} from "@/lib/dynamic-funnel-admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/funis/$id")({
  component: FunisEditor,
});

type LoadedForm = Awaited<ReturnType<typeof getForm>>;
type Q = LoadedForm["questions"][number];
type C = LoadedForm["conditions"][number];

const TYPES = [
  ["short_text", "Texto curto"],
  ["long_text", "Texto longo"],
  ["email", "E-mail"],
  ["phone", "Telefone"],
  ["number", "Número"],
  ["radio", "Escolha única (cards)"],
  ["select", "Lista suspensa"],
  ["checkbox", "Múltipla escolha"],
  ["statement", "Mensagem (sem input)"],
] as const;

function FunisEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const load = useServerFn(getForm);
  const saveMeta = useServerFn(saveForm);
  const saveQ = useServerFn(upsertQuestion);
  const delQ = useServerFn(deleteQuestion);
  const reorder = useServerFn(reorderQuestions);
  const saveC = useServerFn(upsertCondition);
  const delC = useServerFn(deleteCondition);

  const [data, setData] = useState<LoadedForm | null>(null);
  const [tab, setTab] = useState<"meta" | "questions" | "logic" | "whatsapp">("meta");
  const [meta, setMeta] = useState({ slug: "", name: "", description: "", status: "draft" as "draft" | "published" | "archived" });
  const [wa, setWa] = useState<Record<string, any>>({});

  const refresh = async () => {
    const r = await load({ data: { id } });
    setData(r);
    setMeta({ slug: r.form.slug, name: r.form.name, description: r.form.description ?? "", status: r.form.status as any });
    setWa((r.form.whatsapp_config ?? {}) as Record<string, any>);
  };
  useEffect(() => { void refresh().catch((e) => toast.error(e.message)); /* eslint-disable-next-line */ }, [id]);

  if (!data) return <div className="p-10 text-center text-muted-foreground">Carregando…</div>;

  const saveMetaBtn = async () => {
    try {
      await saveMeta({ data: { id, slug: meta.slug, name: meta.name, description: meta.description || null, status: meta.status, config_json: (data.form.config_json as any) ?? {}, whatsapp_config: wa } });
      toast.success("Salvo");
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/app/funis" className="p-2 rounded hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold font-display">{data.form.name}</h1>
            <p className="text-xs text-muted-foreground">/f/{data.form.slug} · <span className="font-medium">{data.form.status}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/f/${data.form.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm rounded-lg border border-border px-3 py-2 hover:bg-muted"><ExternalLink className="w-4 h-4" /> Abrir</a>
          <Button onClick={saveMetaBtn}><Save className="w-4 h-4 mr-2" /> Salvar</Button>
        </div>
      </div>

      <div className="border-b border-border flex gap-1">
        {([["meta", "Geral"], ["questions", "Perguntas"], ["logic", "Lógica"], ["whatsapp", "WhatsApp"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "meta" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 max-w-2xl">
          <Field label="Nome"><Input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} /></Field>
          <Field label="Slug"><Input value={meta.slug} onChange={(e) => setMeta({ ...meta, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></Field>
          <Field label="Descrição"><Textarea rows={3} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} /></Field>
          <Field label="Status">
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value as any })}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </Field>
        </div>
      )}

      {tab === "questions" && (
        <QuestionsTab
          formId={id}
          questions={data.questions as Q[]}
          onSave={async (q) => { await saveQ({ data: { form_id: id, question: q as any } }); refresh(); }}
          onDelete={async (qid) => { if (!confirm("Excluir esta pergunta?")) return; await delQ({ data: { id: qid } }); refresh(); }}
          onReorder={async (order) => { await reorder({ data: { form_id: id, order } }); refresh(); }}
        />
      )}

      {tab === "logic" && (
        <LogicTab
          formId={id}
          questions={data.questions as Q[]}
          conditions={data.conditions as C[]}
          onSave={async (c) => { await saveC({ data: { form_id: id, condition: c as any } }); refresh(); }}
          onDelete={async (cid) => { await delC({ data: { id: cid } }); refresh(); }}
        />
      )}

      {tab === "whatsapp" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 max-w-2xl">
          <p className="text-sm text-muted-foreground">As credenciais UAZAPI vêm das secrets do servidor por padrão. Você pode sobrescrever aqui por funil.</p>
          <Field label="Habilitado">
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={String(!!wa.enabled)} onChange={(e) => setWa({ ...wa, enabled: e.target.value === "true" })}>
              <option value="false">Não</option><option value="true">Sim</option>
            </select>
          </Field>
          <Field label="Telefone redirecionamento (apenas dígitos com DDI)"><Input value={wa.redirect_phone ?? ""} onChange={(e) => setWa({ ...wa, redirect_phone: e.target.value })} placeholder="5511999999999" /></Field>
          <Field label="Telefone alerta interno"><Input value={wa.alert_phone ?? ""} onChange={(e) => setWa({ ...wa, alert_phone: e.target.value })} placeholder="5511999999999" /></Field>
          <Field label="Template mensagem usuário (use {{answers}}, {{metadata}}, {{name}})"><Textarea rows={4} value={wa.user_message_template ?? ""} onChange={(e) => setWa({ ...wa, user_message_template: e.target.value })} /></Field>
          <Field label="Template alerta interno"><Textarea rows={4} value={wa.alert_message_template ?? ""} onChange={(e) => setWa({ ...wa, alert_message_template: e.target.value })} /></Field>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>{children}</label>;
}

// =================== Questions Tab ===================
function QuestionsTab({ formId, questions, onSave, onDelete, onReorder }: {
  formId: string;
  questions: Q[];
  onSave: (q: Partial<Q> & { key: string; type: string; label: string; order_index: number; required: boolean; options: any[] }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (order: string[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<any | null>(null);

  const startNew = () => {
    setEditing("new");
    setDraft({ key: `pergunta_${questions.length + 1}`, type: "short_text", label: "", hint: "", placeholder: "", required: false, order_index: questions.length, options: [] });
  };
  const startEdit = (q: Q) => {
    setEditing(q.id);
    setDraft({ ...q, hint: q.hint ?? "", placeholder: q.placeholder ?? "", options: q.options_json ?? [] });
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[idx], next[j]] = [next[j], next[idx]];
    await onReorder(next.map((q) => q.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{questions.length} perguntas</h2>
        <Button onClick={startNew} size="sm"><Plus className="w-4 h-4 mr-1" /> Nova pergunta</Button>
      </div>

      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} className="p-0.5 hover:bg-muted rounded"><ChevronUp className="w-3 h-3" /></button>
              <button onClick={() => move(i, 1)} className="p-0.5 hover:bg-muted rounded"><ChevronDown className="w-3 h-3" /></button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground flex gap-2">
                <span className="font-mono">{q.key}</span>·<span>{q.type}</span>{q.required && <span className="text-primary">obrigatório</span>}
              </div>
              <div className="font-medium truncate">{q.label}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => startEdit(q)}>Editar</Button>
            <button onClick={() => onDelete(q.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {editing && draft && (
        <div className="rounded-2xl border border-primary/40 bg-card p-5 space-y-3">
          <h3 className="font-semibold">{editing === "new" ? "Nova pergunta" : "Editar pergunta"}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Chave (key)"><Input value={draft.key} onChange={(e) => setDraft({ ...draft, key: e.target.value.replace(/[^a-z0-9_]/gi, "_") })} /></Field>
            <Field label="Tipo">
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Pergunta"><Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></Field>
          <Field label="Dica (opcional)"><Input value={draft.hint} onChange={(e) => setDraft({ ...draft, hint: e.target.value })} /></Field>
          {!["radio","select","checkbox","statement"].includes(draft.type) && (
            <Field label="Placeholder"><Input value={draft.placeholder} onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })} /></Field>
          )}
          {["radio","select","checkbox"].includes(draft.type) && (
            <Field label="Opções (uma por linha — valor|rótulo)">
              <Textarea rows={5} value={(draft.options ?? []).map((o: any) => `${o.value}|${o.label}`).join("\n")}
                onChange={(e) => setDraft({ ...draft, options: e.target.value.split("\n").map((line) => { const [v, l] = line.split("|"); const vv = (v ?? "").trim(); const ll = (l ?? v ?? "").trim(); return vv ? { value: vv, label: ll } : null; }).filter(Boolean) })}
                placeholder="sim|Sim, quero saber mais&#10;nao|Ainda não" />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.required} onChange={(e) => setDraft({ ...draft, required: e.target.checked })} />
            Obrigatório
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => { setEditing(null); setDraft(null); }}>Cancelar</Button>
            <Button onClick={async () => {
              if (!draft.label || !draft.key) { toast.error("Chave e pergunta são obrigatórias"); return; }
              try {
                await onSave({ ...draft, id: editing === "new" ? undefined : (draft.id as string) });
                toast.success("Salvo");
                setEditing(null); setDraft(null);
              } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
            }}>Salvar</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =================== Logic Tab ===================
const OPS = [
  ["equals", "é igual a"], ["not_equals", "é diferente de"],
  ["contains", "contém"], ["in", "está em (lista)"], ["not_in", "não está em (lista)"],
  ["is_empty", "está vazio"], ["is_not_empty", "não está vazio"],
] as const;

function LogicTab({ formId, questions, conditions, onSave, onDelete }: {
  formId: string;
  questions: Q[];
  conditions: C[];
  onSave: (c: Partial<C> & { from_question_id: string; operator: string; action: string; priority: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<any | null>(null);
  const qById = (id: string) => questions.find((q) => q.id === id);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold">{conditions.length} regras</h2>
          <p className="text-xs text-muted-foreground">Quando a resposta de uma pergunta bater na regra, pular para outra pergunta ou encerrar o funil.</p>
        </div>
        <Button onClick={() => setDraft({ from_question_id: questions[0]?.id ?? "", operator: "equals", value: "", action: "skip_to", target_question_id: questions[0]?.id ?? null, priority: conditions.length })} size="sm" disabled={questions.length === 0}><Plus className="w-4 h-4 mr-1" /> Nova regra</Button>
      </div>

      <div className="space-y-2">
        {conditions.length === 0 && <p className="text-sm text-muted-foreground text-center p-6 border border-dashed rounded-xl">Nenhuma regra. Adicione uma para criar fluxos condicionais.</p>}
        {conditions.map((c) => {
          const from = qById(c.from_question_id);
          const tgt = c.target_question_id ? qById(c.target_question_id) : null;
          const valDisplay = c.value === null || c.value === "" ? "—" : (typeof c.value === "object" ? JSON.stringify(c.value) : String(c.value));
          return (
            <div key={c.id} className="rounded-xl border border-border bg-card p-3 text-sm flex items-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">#{c.priority}</span>
              <span>Se <b>{from?.label ?? "?"}</b></span>
              <span className="px-2 py-0.5 rounded bg-muted text-xs">{OPS.find((o) => o[0] === c.operator)?.[1] ?? c.operator}</span>
              {!["is_empty","is_not_empty"].includes(c.operator) && <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">{valDisplay}</span>}
              <span>→</span>
              <span className="font-medium">{c.action === "end_form" ? "Encerrar funil" : `Pular para "${tgt?.label ?? "?"}"`}</span>
              <div className="ml-auto flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setDraft({ ...c, value: c.value ?? "" })}>Editar</Button>
                <button onClick={async () => { await onDelete(c.id); toast.success("Removida"); }} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {draft && (
        <div className="rounded-2xl border border-primary/40 bg-card p-5 space-y-3">
          <h3 className="font-semibold">{draft.id ? "Editar regra" : "Nova regra"}</h3>
          <Field label="Quando a pergunta">
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={draft.from_question_id} onChange={(e) => setDraft({ ...draft, from_question_id: e.target.value })}>
              {questions.map((q) => <option key={q.id} value={q.id}>{q.label}</option>)}
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Operador">
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={draft.operator} onChange={(e) => setDraft({ ...draft, operator: e.target.value })}>
                {OPS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            {!["is_empty","is_not_empty"].includes(draft.operator) && (
              <Field label={["in","not_in"].includes(draft.operator) ? "Valores (separados por vírgula)" : "Valor"}>
                <Input value={Array.isArray(draft.value) ? draft.value.join(",") : (draft.value ?? "")} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
              </Field>
            )}
          </div>
          <Field label="Ação">
            <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })}>
              <option value="skip_to">Pular para…</option>
              <option value="end_form">Encerrar funil</option>
            </select>
          </Field>
          {draft.action === "skip_to" && (
            <Field label="Pular para">
              <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={draft.target_question_id ?? ""} onChange={(e) => setDraft({ ...draft, target_question_id: e.target.value })}>
                {questions.map((q) => <option key={q.id} value={q.id}>{q.label}</option>)}
              </select>
            </Field>
          )}
          <Field label="Prioridade (menor = avaliada primeiro)">
            <Input type="number" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) || 0 })} />
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
            <Button onClick={async () => {
              let value: any = draft.value;
              if (["in","not_in"].includes(draft.operator) && typeof value === "string") {
                value = value.split(",").map((s) => s.trim()).filter(Boolean);
              }
              if (["is_empty","is_not_empty"].includes(draft.operator)) value = null;
              try {
                await onSave({ ...draft, value });
                toast.success("Regra salva"); setDraft(null);
              } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
            }}>Salvar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
