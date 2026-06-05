// Admin CRUD for landing plans. Lives inside /painel (gated).
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, X, Star, Eye, EyeOff } from "lucide-react";
import {
  listPlansAdmin,
  upsertPlan,
  deletePlan,
  reorderPlans,
  formatPrice,
  type PlanRow,
} from "@/lib/plans.functions";

const emptyPlan: Omit<PlanRow, "id"> & { id?: string } = {
  slug: "",
  name: "",
  description: "",
  price_cents: 0,
  price_label: null,
  period: "month",
  features: [],
  highlight: false,
  cta_label: "Quero esse plano",
  cta_href: "#contato",
  sort_order: 100,
  active: true,
};

export function PlansAdmin() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listPlansAdmin);
  const upsertFn = useServerFn(upsertPlan);
  const deleteFn = useServerFn(deletePlan);
  const reorderFn = useServerFn(reorderPlans);

  const { data, isLoading, error } = useQuery({
    queryKey: ["plans-admin"],
    queryFn: () => fetchAll(),
  });

  const plans = useMemo<PlanRow[]>(() => (data?.plans ?? []) as PlanRow[], [data]);
  const [editing, setEditing] = useState<(Partial<PlanRow> & { id?: string }) | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["plans-admin"] });
    qc.invalidateQueries({ queryKey: ["plans-public"] });
  };

  const mUpsert = useMutation({
    mutationFn: (p: PlanRow) =>
      upsertFn({
        data: {
          id: p.id?.startsWith("f") ? undefined : p.id,
          slug: p.slug,
          name: p.name,
          description: p.description || null,
          price_cents: p.price_label ? null : (p.price_cents ?? 0),
          price_label: p.price_label || null,
          period: p.period,
          features: p.features,
          highlight: p.highlight,
          cta_label: p.cta_label,
          cta_href: p.cta_href,
          sort_order: p.sort_order,
          active: p.active,
        },
      }),
    onSuccess: () => { invalidate(); setEditing(null); },
  });

  const mDelete = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
  });

  const mReorder = useMutation({
    mutationFn: (order: { id: string; sort_order: number }[]) => reorderFn({ data: { order } }),
    onSuccess: invalidate,
  });

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...plans];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    mReorder.mutate(next.map((p, i) => ({ id: p.id, sort_order: (i + 1) * 10 })));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold font-display">Planos da landing</h3>
          <p className="text-xs text-muted-foreground">Criados, editados e excluídos aqui — a landing reflete em até 60s (cache).</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyPlan, sort_order: (plans.length + 1) * 10 })}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background text-sm font-semibold px-4 py-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Novo plano
        </button>
      </div>

      {isLoading && <div className="mt-6 text-sm text-muted-foreground">Carregando…</div>}
      {error && <div className="mt-6 text-sm text-destructive">Erro: {(error as Error).message}</div>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 text-left">Ordem</th>
              <th className="py-2 text-left">Plano</th>
              <th className="py-2 text-left">Preço</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p, i) => {
              const fp = formatPrice(p);
              return (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-muted" aria-label="Subir"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-muted" aria-label="Descer"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <span className="text-xs text-muted-foreground ml-1">{p.sort_order}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {p.highlight && <Star className="w-3.5 h-3.5 text-primary fill-primary" />}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.slug} · {p.features.length} recursos</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{fp.price}<span className="text-xs text-muted-foreground">{fp.period}</span></td>
                  <td className="py-3">
                    {p.active
                      ? <span className="inline-flex items-center gap-1 text-emerald-600 text-xs"><Eye className="w-3 h-3" /> Ativo</span>
                      : <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><EyeOff className="w-3 h-3" /> Inativo</span>}
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditing(p)} className="p-1.5 rounded hover:bg-muted" aria-label="Editar"><Pencil className="w-4 h-4" /></button>
                    <button
                      onClick={() => { if (confirm(`Excluir o plano "${p.name}"?`)) mDelete.mutate(p.id); }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive ml-1"
                      aria-label="Excluir"
                    ><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && plans.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">Nenhum plano cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <PlanEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => mUpsert.mutate(p)}
          saving={mUpsert.isPending}
          error={mUpsert.error ? (mUpsert.error as Error).message : null}
        />
      )}
    </div>
  );
}

function PlanEditor({
  initial, onCancel, onSave, saving, error,
}: {
  initial: Partial<PlanRow> & { id?: string };
  onCancel: () => void;
  onSave: (p: PlanRow) => void;
  saving: boolean;
  error: string | null;
}) {
  const [p, setP] = useState<Partial<PlanRow> & { id?: string }>({
    ...emptyPlan,
    ...initial,
    features: initial.features ?? [],
  });
  const [featDraft, setFeatDraft] = useState("");
  const isCustom = p.period === "custom" || !!p.price_label;
  const priceReais = (p.price_cents ?? 0) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-lg font-semibold font-display">{p.id ? "Editar plano" : "Novo plano"}</h4>
          <button onClick={onCancel} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome">
            <input className="input" value={p.name ?? ""} onChange={(e) => setP({ ...p, name: e.target.value })} />
          </Field>
          <Field label="Slug (URL-friendly)">
            <input className="input" value={p.slug ?? ""} onChange={(e) => setP({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="ex: pro-anual" />
          </Field>
          <Field label="Descrição" full>
            <textarea className="input min-h-[64px]" value={p.description ?? ""} onChange={(e) => setP({ ...p, description: e.target.value })} />
          </Field>

          <Field label="Período">
            <select className="input" value={p.period} onChange={(e) => setP({ ...p, period: e.target.value as PlanRow["period"] })}>
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
              <option value="project">Por projeto</option>
              <option value="custom">Personalizado / Sob consulta</option>
            </select>
          </Field>

          {!isCustom ? (
            <Field label="Preço (R$)">
              <input
                className="input"
                type="number" step="0.01" min={0}
                value={priceReais}
                onChange={(e) => setP({ ...p, price_cents: Math.round(parseFloat(e.target.value || "0") * 100), price_label: null })}
              />
            </Field>
          ) : (
            <Field label="Rótulo de preço">
              <input className="input" value={p.price_label ?? "Sob consulta"} onChange={(e) => setP({ ...p, price_label: e.target.value, price_cents: null })} />
            </Field>
          )}

          <Field label="Texto do botão">
            <input className="input" value={p.cta_label ?? ""} onChange={(e) => setP({ ...p, cta_label: e.target.value })} />
          </Field>
          <Field label="Link do botão">
            <input className="input" value={p.cta_href ?? ""} onChange={(e) => setP({ ...p, cta_href: e.target.value })} placeholder="#contato ou https://..." />
          </Field>

          <Field label="Ordem">
            <input className="input" type="number" value={p.sort_order ?? 0} onChange={(e) => setP({ ...p, sort_order: parseInt(e.target.value || "0", 10) })} />
          </Field>
          <Field label="Opções">
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!p.highlight} onChange={(e) => setP({ ...p, highlight: e.target.checked })} />
                Plano em destaque (Mais escolhido)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.active ?? true} onChange={(e) => setP({ ...p, active: e.target.checked })} />
                Visível na landing
              </label>
            </div>
          </Field>

          <Field label="Recursos / features" full>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={featDraft}
                onChange={(e) => setFeatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && featDraft.trim()) {
                    e.preventDefault();
                    setP({ ...p, features: [...(p.features ?? []), featDraft.trim()] });
                    setFeatDraft("");
                  }
                }}
                placeholder="Adicionar e teclar Enter"
              />
              <button
                type="button"
                onClick={() => { if (featDraft.trim()) { setP({ ...p, features: [...(p.features ?? []), featDraft.trim()] }); setFeatDraft(""); } }}
                className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
              >Adicionar</button>
            </div>
            <ul className="mt-2 space-y-1">
              {(p.features ?? []).map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded px-2 py-1">
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => setP({ ...p, features: (p.features ?? []).filter((_, j) => j !== i) })}
                    className="text-destructive hover:underline text-xs"
                  >remover</button>
                </li>
              ))}
            </ul>
          </Field>
        </div>

        {error && <div className="mt-4 text-sm text-destructive">{error}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancelar</button>
          <button
            disabled={saving || !p.name || !p.slug}
            onClick={() => onSave({
              id: p.id ?? "",
              slug: p.slug!, name: p.name!,
              description: p.description ?? null,
              price_cents: p.price_label ? null : (p.price_cents ?? 0),
              price_label: p.price_label ?? null,
              period: p.period ?? "month",
              features: p.features ?? [],
              highlight: !!p.highlight,
              cta_label: p.cta_label || "Quero esse plano",
              cta_href: p.cta_href || "#contato",
              sort_order: p.sort_order ?? 100,
              active: p.active ?? true,
            })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      <style>{`.input{width:100%;padding:.55rem .75rem;border-radius:.5rem;background:hsl(var(--background));border:1px solid hsl(var(--border));font-size:.875rem;color:hsl(var(--foreground))}.input:focus{outline:2px solid hsl(var(--primary));outline-offset:1px}`}</style>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
