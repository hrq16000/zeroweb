// Admin UI para gerenciar redirects 301/308.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Save, X, Pencil, ExternalLink } from "lucide-react";
import {
  listRedirects,
  upsertRedirect,
  deleteRedirect,
  type RedirectRow,
} from "@/lib/redirects.functions";

type Draft = Partial<RedirectRow> & { id?: string };

const empty: Draft = {
  from_path: "/",
  to_path: "/",
  status_code: 308,
  enabled: true,
  notes: "",
};

export function RedirectsAdmin() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listRedirects);
  const upsertFn = useServerFn(upsertRedirect);
  const deleteFn = useServerFn(deleteRedirect);

  const { data, isLoading, error } = useQuery({
    queryKey: ["redirects-admin"],
    queryFn: () => fetchAll(),
  });

  const rows = useMemo<RedirectRow[]>(() => (data?.redirects ?? []) as RedirectRow[], [data]);
  const [editing, setEditing] = useState<Draft | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["redirects-admin"] });

  const mUpsert = useMutation({
    mutationFn: (r: Draft) =>
      upsertFn({
        data: {
          id: r.id,
          from_path: (r.from_path ?? "").trim(),
          to_path: (r.to_path ?? "").trim(),
          status_code: (r.status_code ?? 308) as 301 | 302 | 307 | 308,
          enabled: r.enabled ?? true,
          notes: r.notes?.trim() || null,
        },
      }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
    },
  });

  const mDelete = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Redirects 301 / 308</h2>
          <p className="text-sm text-muted-foreground mt-1">
            URLs antigas → novas. O middleware aplica automaticamente em cada request.
            Consolidação de host (www → sem-www) e trailing slash já é automática.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Novo redirect
        </button>
      </div>

      {isLoading && <div className="mt-6 text-sm text-muted-foreground">Carregando…</div>}
      {error && (
        <div className="mt-6 text-sm text-destructive">
          {(error as Error).message ?? "Erro ao carregar"}
        </div>
      )}

      {editing && (
        <div className="mt-6 rounded-2xl border border-border p-4 bg-background grid sm:grid-cols-2 gap-3">
          <label className="text-xs">
            <span className="text-muted-foreground">De (path, ex: /antigo)</span>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={editing.from_path ?? ""}
              onChange={(e) => setEditing({ ...editing, from_path: e.target.value })}
            />
          </label>
          <label className="text-xs">
            <span className="text-muted-foreground">Para (path ou URL completa)</span>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={editing.to_path ?? ""}
              onChange={(e) => setEditing({ ...editing, to_path: e.target.value })}
            />
          </label>
          <label className="text-xs">
            <span className="text-muted-foreground">Status</span>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={editing.status_code ?? 308}
              onChange={(e) => setEditing({ ...editing, status_code: Number(e.target.value) as 301 })}
            >
              <option value={308}>308 — Permanent (preserva método)</option>
              <option value={301}>301 — Moved Permanently</option>
              <option value={307}>307 — Temporary</option>
              <option value={302}>302 — Found (temporário)</option>
            </select>
          </label>
          <label className="text-xs flex items-center gap-2 mt-5">
            <input
              type="checkbox"
              checked={editing.enabled ?? true}
              onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
            />
            <span>Ativo</span>
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="text-muted-foreground">Notas (opcional)</span>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={editing.notes ?? ""}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            />
          </label>

          <div className="sm:col-span-2 flex items-center gap-2">
            <button
              onClick={() => mUpsert.mutate(editing)}
              disabled={mUpsert.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
            <button
              onClick={() => setEditing(null)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            {mUpsert.error && (
              <span className="text-xs text-destructive">
                {(mUpsert.error as Error).message}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3">De</th>
              <th className="text-left py-2 pr-3">Para</th>
              <th className="text-left py-2 pr-3">Status</th>
              <th className="text-left py-2 pr-3">Hits</th>
              <th className="text-left py-2 pr-3">Último</th>
              <th className="text-right py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/50">
                <td className="py-2 pr-3 font-mono text-xs">{r.from_path}</td>
                <td className="py-2 pr-3 font-mono text-xs">
                  <span className="inline-flex items-center gap-1">
                    {r.to_path} <ExternalLink className="w-3 h-3 opacity-50" />
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      r.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status_code} {r.enabled ? "" : "· off"}
                  </span>
                </td>
                <td className="py-2 pr-3">{r.hits}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">
                  {r.last_hit_at ? new Date(r.last_hit_at).toLocaleString("pt-BR") : "—"}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => setEditing(r)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs mr-1"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir redirect ${r.from_path}?`)) mDelete.mutate(r.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-destructive"
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum redirect cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
