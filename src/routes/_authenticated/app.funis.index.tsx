import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, ExternalLink, Trash2, Eye, Archive, Pencil, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listForms, saveForm, setFormStatus, deleteForm } from "@/lib/dynamic-funnel-admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/funis/")({
  component: FunisIndex,
});

type FormRow = Awaited<ReturnType<typeof listForms>>[number];

function FunisIndex() {
  const navigate = useNavigate();
  const list = useServerFn(listForms);
  const save = useServerFn(saveForm);
  const setStatus = useServerFn(setFormStatus);
  const del = useServerFn(deleteForm);
  const [rows, setRows] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "" });

  const refresh = async () => {
    setLoading(true);
    try { setRows(await list()); } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const create = async () => {
    if (!form.slug || !form.name) { toast.error("Slug e nome são obrigatórios"); return; }
    try {
      const r = await save({ data: { slug: form.slug, name: form.name, description: form.description || null, status: "draft", config_json: { auto_advance_ms: 400 }, whatsapp_config: { enabled: false } } });
      toast.success("Funil criado");
      navigate({ to: "/app/funis/$id", params: { id: r.id } });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao criar"); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display">Funis dinâmicos</h1>
          <p className="text-sm text-muted-foreground">Crie, edite e publique funis de captação one-question-at-a-time.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/funis/leads" className="inline-flex items-center gap-2 text-sm rounded-lg border border-border px-3 py-2 hover:bg-muted">
            <Inbox className="w-4 h-4" /> Leads
          </Link>
          <Button onClick={() => setCreating((v) => !v)}><Plus className="w-4 h-4 mr-2" /> Novo funil</Button>
        </div>
      </div>

      {creating && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Diagnóstico 0web" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="diagnostico-0web" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição (opcional)</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button onClick={create}>Criar</Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-medium">Nenhum funil ainda.</p>
            <p className="text-sm mt-1">Clique em "Novo funil" para começar.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Nome</th><th className="text-left p-3">Slug</th><th className="text-left p-3">Status</th><th className="text-left p-3">Perguntas</th><th className="text-left p-3">Leads</th><th className="text-right p-3">Ações</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{r.name}</div>
                    {r.description && <div className="text-xs text-muted-foreground truncate max-w-md">{r.description}</div>}
                  </td>
                  <td className="p-3 font-mono text-xs">{r.slug}</td>
                  <td className="p-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="p-3">{r.questions}</td>
                  <td className="p-3">{r.leads}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <a href={`/f/${r.slug}`} target="_blank" rel="noreferrer" title="Pré-visualizar" className="p-2 rounded hover:bg-muted"><ExternalLink className="w-4 h-4" /></a>
                      <Link to="/app/funis/$id" params={{ id: r.id }} title="Editar" className="p-2 rounded hover:bg-muted"><Pencil className="w-4 h-4" /></Link>
                      {r.status !== "published" ? (
                        <button title="Publicar" onClick={async () => { await setStatus({ data: { id: r.id, status: "published" } }); toast.success("Publicado"); refresh(); }} className="p-2 rounded hover:bg-muted text-emerald-600"><Eye className="w-4 h-4" /></button>
                      ) : (
                        <button title="Despublicar" onClick={async () => { await setStatus({ data: { id: r.id, status: "draft" } }); toast.success("Despublicado"); refresh(); }} className="p-2 rounded hover:bg-muted"><Archive className="w-4 h-4" /></button>
                      )}
                      <button title="Excluir" onClick={async () => { if (!confirm(`Excluir "${r.name}"? Esta ação remove perguntas e leads.`)) return; await del({ data: { id: r.id } }); toast.success("Excluído"); refresh(); }} className="p-2 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    draft: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    archived: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? ""}`}>{status}</span>;
}
