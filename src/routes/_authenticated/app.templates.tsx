import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listTemplates, upsertTemplate, deleteTemplate } from "@/lib/templates.functions";
import { listAllPortals } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/app/templates")({
  component: TemplatesAdmin,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">Erro: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Não encontrado.</div>,
});

type Tpl = {
  id: string;
  portal_id: string | null;
  kind: "landing_page" | "funnel" | "page" | "email" | "material" | "config";
  slug: string;
  name: string;
  description: string | null;
  is_global: boolean;
  payload: Record<string, unknown> | null;
  preview_url: string | null;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  updated_at: string;
};

type Portal = { id: string; name: string; slug: string };

const KINDS = ["landing_page", "funnel", "page", "email", "material", "config"] as const;
const STATUSES = ["draft", "published", "archived"] as const;

function TemplatesAdmin() {
  const list = useServerFn(listTemplates);
  const save = useServerFn(upsertTemplate);
  const del = useServerFn(deleteTemplate);
  const portals = useServerFn(listAllPortals);

  const [rows, setRows] = useState<Tpl[]>([]);
  const [portalRows, setPortalRows] = useState<Portal[]>([]);
  const [editing, setEditing] = useState<Partial<Tpl> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<string>("");

  const reload = () =>
    list({ data: { portal_id: null, kind: filterKind || undefined } })
      .then((r) => setRows((r as { rows: Tpl[] }).rows))
      .catch((e) => setErr(e.message));

  useEffect(() => {
    void reload();
    void portals().then((r) => setPortalRows((r as { rows: Portal[] }).rows));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKind]);

  const submit = async () => {
    if (!editing) return;
    setErr(null);
    try {
      await save({
        data: {
          id: editing.id,
          portal_id: editing.is_global ? null : editing.portal_id ?? null,
          kind: editing.kind ?? "landing_page",
          slug: editing.slug ?? "",
          name: editing.name ?? "",
          description: editing.description ?? null,
          is_global: !!editing.is_global,
          payload: editing.payload ?? {},
          preview_url: editing.preview_url ?? null,
          tags: editing.tags ?? [],
          status: editing.status ?? "draft",
        },
      });
      setEditing(null);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground">Gerencie templates globais ou por portal/ecossistema.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background text-sm"
          >
            <option value="">Todos os tipos</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <button
            onClick={() => setEditing({ kind: "landing_page", status: "draft", is_global: true })}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            + Novo template
          </button>
        </div>
      </header>

      {err && <div className="p-3 rounded-md border border-destructive/40 bg-destructive/5 text-sm text-destructive">{err}</div>}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left">
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Escopo</th>
              <th className="p-3">Status</th>
              <th className="p-3">Atualizado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.slug}</div>
                </td>
                <td className="p-3">{r.kind}</td>
                <td className="p-3">
                  {r.is_global ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Global</span>
                  ) : (
                    <span className="text-xs">{portalRows.find((p) => p.id === r.portal_id)?.name ?? "Portal"}</span>
                  )}
                </td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(r.updated_at).toLocaleString("pt-BR")}</td>
                <td className="p-3 text-right space-x-2">
                  <button className="text-xs underline" onClick={() => setEditing(r)}>Editar</button>
                  <button
                    className="text-xs text-destructive underline"
                    onClick={async () => {
                      if (!confirm(`Remover ${r.name}?`)) return;
                      await del({ data: { id: r.id } });
                      await reload();
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum template ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing.id ? "Editar template" : "Novo template"}</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Nome</span>
                <input className="w-full px-3 py-2 rounded-md border border-border bg-background" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Slug</span>
                <input className="w-full px-3 py-2 rounded-md border border-border bg-background" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Tipo</span>
                <select className="w-full px-3 py-2 rounded-md border border-border bg-background" value={editing.kind ?? "landing_page"} onChange={(e) => setEditing({ ...editing, kind: e.target.value as Tpl["kind"] })}>
                  {KINDS.map((k) => (<option key={k} value={k}>{k}</option>))}
                </select>
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Status</span>
                <select className="w-full px-3 py-2 rounded-md border border-border bg-background" value={editing.status ?? "draft"} onChange={(e) => setEditing({ ...editing, status: e.target.value as Tpl["status"] })}>
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </label>
              <label className="text-sm space-y-1 col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={!!editing.is_global} onChange={(e) => setEditing({ ...editing, is_global: e.target.checked })} />
                <span>Publicar como global (todos os portais)</span>
              </label>
              {!editing.is_global && (
                <label className="text-sm space-y-1 col-span-2">
                  <span className="text-muted-foreground">Portal</span>
                  <select className="w-full px-3 py-2 rounded-md border border-border bg-background" value={editing.portal_id ?? ""} onChange={(e) => setEditing({ ...editing, portal_id: e.target.value || null })}>
                    <option value="">— selecione —</option>
                    {portalRows.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </label>
              )}
              <label className="text-sm space-y-1 col-span-2">
                <span className="text-muted-foreground">Descrição</span>
                <textarea rows={3} className="w-full px-3 py-2 rounded-md border border-border bg-background" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </label>
              <label className="text-sm space-y-1 col-span-2">
                <span className="text-muted-foreground">Payload (JSON)</span>
                <textarea rows={6} className="w-full px-3 py-2 rounded-md border border-border bg-background font-mono text-xs"
                  value={JSON.stringify(editing.payload ?? {}, null, 2)}
                  onChange={(e) => {
                    try { setEditing({ ...editing, payload: JSON.parse(e.target.value) }); } catch { /* ignore */ }
                  }} />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-border text-sm">Cancelar</button>
              <button onClick={submit} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
