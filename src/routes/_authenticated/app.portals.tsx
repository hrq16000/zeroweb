import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllPortals, upsertPortal } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/app/portals")({
  component: PortalsAdmin,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">Acesso negado: {error.message}</div>
  ),
});

type PortalRow = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  status: string;
  aliases: string[] | null;
  primary_color: string | null;
  is_default: boolean;
};

function PortalsAdmin() {
  const list = useServerFn(listAllPortals);
  const save = useServerFn(upsertPortal);
  const [rows, setRows] = useState<PortalRow[]>([]);
  const [editing, setEditing] = useState<Partial<PortalRow> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [isSuper, setIsSuper] = useState(false);

  const reload = () =>
    list()
      .then((r) => {
        setRows(r.rows as PortalRow[]);
        setIsSuper(r.isSuper);
      })
      .catch((e: Error) => setErr(e.message));

  useEffect(() => {
    reload();
  }, []);

  if (err) return <div className="text-sm text-destructive">{err}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Portais</h1>
          <p className="text-sm text-muted-foreground">Gestão multi-tenant.</p>
        </div>
        {isSuper && (
          <button
            onClick={() => setEditing({ slug: "", name: "", status: "draft", aliases: [] })}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            Novo portal
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {rows.map((p) => (
          <div key={p.id} className="border border-border rounded-xl p-4 flex items-center justify-between bg-card">
            <div>
              <div className="font-medium">
                {p.name} {p.is_default && <span className="text-xs text-primary">(padrão)</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {p.slug} · {p.domain || "—"} · {p.status}
              </div>
            </div>
            {isSuper && (
              <button
                onClick={() => setEditing(p)}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur grid place-items-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold">{editing.id ? "Editar portal" : "Novo portal"}</h2>
            <Field label="Slug">
              <input
                value={editing.slug || ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Nome">
              <input
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Domínio">
              <input
                value={editing.domain || ""}
                onChange={(e) => setEditing({ ...editing, domain: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Aliases (vírgula)">
              <input
                value={(editing.aliases || []).join(",")}
                onChange={(e) =>
                  setEditing({ ...editing, aliases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                }
                className="input"
              />
            </Field>
            <Field label="Status">
              <select
                value={editing.status || "draft"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="input"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="paused">paused</option>
              </select>
            </Field>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 text-sm rounded-lg border border-border">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await save({
                      data: {
                        id: editing.id,
                        slug: editing.slug!,
                        name: editing.name!,
                        domain: editing.domain || null,
                        aliases: editing.aliases || [],
                        status: (editing.status as "active" | "draft" | "paused") || "draft",
                      },
                    });
                    setEditing(null);
                    reload();
                  } catch (e) {
                    setErr((e as Error).message);
                  }
                }}
                className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;padding:0.5rem 0.75rem;border:1px solid hsl(var(--border));border-radius:0.5rem;background:transparent;font-size:0.875rem}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
