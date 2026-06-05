import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listLicenses, upsertLicense, setLicenseStatus, snapshotLicenseUsage } from "@/lib/licenses.functions";
import { listAllPortals } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/app/licenses")({
  component: LicensesAdmin,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">Erro: {error.message}</div>,
});

type Row = {
  id: string;
  code: string;
  type: string;
  status: string;
  plan: string;
  portal_id: string;
  portal_name: string;
  portal_slug: string;
  domain: string | null;
  users_count: number;
  leads_count: number;
  starts_at: string;
  renews_at: string | null;
  expires_at: string | null;
  limits: Record<string, unknown>;
};

type Portal = { id: string; name: string; slug: string };

const TYPES = ["master", "franqueadora", "licenciado", "white_label", "trial"] as const;
const STATUSES = ["active", "suspended", "expired", "cancelled", "trial", "pending"] as const;

function LicensesAdmin() {
  const list = useServerFn(listLicenses);
  const save = useServerFn(upsertLicense);
  const setStatus = useServerFn(setLicenseStatus);
  const snap = useServerFn(snapshotLicenseUsage);
  const portals = useServerFn(listAllPortals);

  const [rows, setRows] = useState<Row[]>([]);
  const [portalRows, setPortalRows] = useState<Portal[]>([]);
  const [isSuper, setIsSuper] = useState(false);
  const [editing, setEditing] = useState<Partial<Row> & { type?: string; status?: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = () =>
    list()
      .then((r) => {
        setRows(r.rows as Row[]);
        setIsSuper(r.isSuper);
      })
      .catch((e: Error) => setErr(e.message));

  useEffect(() => {
    reload();
    portals().then((r) => setPortalRows(r.rows as Portal[])).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Licenças & White Label</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de licenciamento, franquias digitais e operações white label.
          </p>
        </div>
        {isSuper && (
          <button
            onClick={() =>
              setEditing({
                code: "",
                type: "licenciado",
                status: "pending",
                plan: "starter",
                portal_id: portalRows[0]?.id,
              })
            }
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            Nova licença
          </button>
        )}
      </div>

      {err && <div className="text-sm text-destructive">{err}</div>}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Total" value={rows.length} />
        <Kpi label="Ativas" value={rows.filter((r) => r.status === "active").length} />
        <Kpi label="Trial" value={rows.filter((r) => r.status === "trial").length} />
        <Kpi label="Suspensas" value={rows.filter((r) => r.status === "suspended").length} />
        <Kpi label="Pendentes" value={rows.filter((r) => r.status === "pending").length} />
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Portal</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Plano</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Usuários</th>
              <th className="text-right p-3">Leads</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{r.code}</td>
                <td className="p-3">
                  <div className="font-medium">{r.portal_name}</div>
                  <div className="text-xs text-muted-foreground">{r.domain || r.portal_slug}</div>
                </td>
                <td className="p-3 text-xs">{r.type}</td>
                <td className="p-3 text-xs">{r.plan}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : r.status === "suspended"
                          ? "bg-amber-500/10 text-amber-600"
                          : r.status === "expired" || r.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right">{r.users_count}</td>
                <td className="p-3 text-right">{r.leads_count}</td>
                <td className="p-3 text-right space-x-1">
                  {isSuper && (
                    <>
                      <button
                        onClick={() => setEditing(r)}
                        className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                      >
                        Editar
                      </button>
                      {r.status !== "active" ? (
                        <button
                          onClick={async () => {
                            await setStatus({ data: { id: r.id, status: "active" } });
                            reload();
                          }}
                          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white"
                        >
                          Ativar
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await setStatus({ data: { id: r.id, status: "suspended" } });
                            reload();
                          }}
                          className="text-xs px-2 py-1 rounded bg-amber-600 text-white"
                        >
                          Suspender
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          await snap({ data: { license_id: r.id } });
                          reload();
                        }}
                        className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                      >
                        Snapshot
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma licença cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur grid place-items-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-3">
            <h2 className="text-lg font-bold">{editing.id ? "Editar licença" : "Nova licença"}</h2>
            <Field label="Portal">
              <select
                value={editing.portal_id || ""}
                onChange={(e) => setEditing({ ...editing, portal_id: e.target.value })}
                className="input"
              >
                {portalRows.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.slug})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Código (A-Z 0-9 _ -)">
              <input
                value={editing.code || ""}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                className="input font-mono"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo">
                <select
                  value={editing.type || "licenciado"}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="input"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={editing.status || "pending"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="input"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Plano">
              <input
                value={editing.plan || ""}
                onChange={(e) => setEditing({ ...editing, plan: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Renovação">
              <input
                type="date"
                value={editing.renews_at ? editing.renews_at.slice(0, 10) : ""}
                onChange={(e) => setEditing({ ...editing, renews_at: e.target.value || null })}
                className="input"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 text-sm rounded-lg border border-border">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await save({
                      data: {
                        id: editing.id,
                        portal_id: editing.portal_id!,
                        code: editing.code!,
                        type: editing.type as never,
                        status: editing.status as never,
                        plan: editing.plan || "starter",
                        renews_at: editing.renews_at || null,
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

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
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
