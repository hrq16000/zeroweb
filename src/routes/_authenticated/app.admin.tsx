import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListClients,
  adminCreateProject,
  adminUpdateProject,
  adminAddDocument,
  adminListAllTickets,
  adminSetRole,
  PROJECT_STATUSES_LIST,
} from "@/lib/clientarea.functions";
import {
  listSettings,
  upsertSetting,
  listSettingHistory,
  rollbackSetting,
  listIntegrationStatus,
  testIntegration,
  listIntegrationSchemas,
} from "@/lib/settings.functions";
import {
  adminListSections,
  adminListPages,
  adminToggleSection,
  adminUpsertSection,
  adminDeleteSection,
  adminReorderSections,
} from "@/lib/site-sections.functions";
import {
  getUptimeMetrics,
  listCronHistory,
  exportCronHistoryCsv,
  get2faStatus,
  set2faEnabled,
  requestBreakGlass,
  revealSecretWithGrant,
  listBreakGlassGrants,
} from "@/lib/observability.functions";

export const Route = createFileRoute("/_authenticated/app/admin")({
  component: AdminPage,
});

type Tab = "clients" | "tickets" | "settings" | "site" | "observ" | "security" | "visits";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("clients");
  const labels: Record<Tab, string> = {
    clients: "Clientes & Projetos",
    tickets: "Tickets",
    settings: "Integrações",
    site: "Seções do site",
    observ: "Observabilidade",
    security: "Segurança",
    visits: "Visitas & LGPD",
  };
  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold font-display">Administração</h1>
      <p className="mt-1 text-sm text-muted-foreground">Clientes, projetos, suporte, integrações, observabilidade, segurança e privacidade.</p>
      <div className="mt-5 flex gap-1 border-b border-border flex-wrap">
        {(Object.keys(labels) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>
      {tab === "clients" ? <ClientsTab /> :
        tab === "tickets" ? <TicketsTab /> :
        tab === "settings" ? <SettingsTab /> :
        tab === "site" ? <SiteSectionsTab /> :
        tab === "observ" ? <ObservabilityTab /> :
        tab === "visits" ? <VisitsLgpdTab /> :
        <SecurityTab />}
    </div>
  );
}


// Schema-driven integration registry. Loaded from `integration_schemas` table.
type SchemaField = {
  key: string;
  label?: string;
  type?: "text" | "url" | "secret" | "number";
  critical?: boolean;
  required?: boolean;
  placeholder?: string;
};
type IntegrationSchema = {
  key: string;
  label: string;
  description?: string | null;
  testable?: boolean;
  fields?: SchemaField[];
};

function SettingsTab() {
  const ls = useServerFn(listSettings);
  const us = useServerFn(upsertSetting);
  const lis = useServerFn(listIntegrationStatus);
  const ti = useServerFn(testIntegration);
  const lsch = useServerFn(listIntegrationSchemas);
  const [rows, setRows] = useState<any[]>([]);
  const [schemas, setSchemas] = useState<IntegrationSchema[]>([]);
  const [status, setStatus] = useState<Record<string, any>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const load = async () => {
    try {
      const [r, st, sc] = await Promise.all([ls(), lis(), lsch()]);
      setRows(r.rows as any[]);
      const init: Record<string, string> = {};
      (r.rows as any[]).forEach((s) => {
        init[s.key] = s.is_secret ? "" : s.value ?? "";
      });
      setEdits(init);
      const map: Record<string, any> = {};
      (st.rows as any[]).forEach((x) => (map[x.key] = x));
      setStatus(map);
      setSchemas((sc.rows as IntegrationSchema[]) ?? []);
    } catch (e: any) {
      setErr(e.message);
    }
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err)
    return (
      <p className="text-sm text-destructive mt-5">
        {err}. (Sua conta precisa do papel <code>admin</code> ou <code>admin_integrations</code>.)
      </p>
    );

  const settingMap = new Map(rows.map((r) => [r.key, r]));
  const isCritical = (key: string, field?: SchemaField) =>
    !!field?.critical || !!settingMap.get(key)?.is_critical;

  const save = async (key: string, is_secret: boolean, critical: boolean) => {
    let reason: string | null = null;
    if (critical) {
      reason = window.prompt(
        `Chave crítica "${key}".\nDescreva o motivo da alteração (mín. 5 caracteres):`,
      );
      if (!reason || reason.trim().length < 5) {
        setMsg("Alteração cancelada — motivo obrigatório.");
        return;
      }
    }
    setSaving(key);
    setMsg(null);
    try {
      const value = edits[key] ?? "";
      await us({ data: { key, value: value === "" ? null : value, is_secret, reason } });
      setMsg(`Salvo: ${key}${reason ? ` (motivo registrado)` : ""}`);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(null);
    }
  };

  const runTest = async (key: string) => {
    setTesting(key);
    setMsg(null);
    try {
      const r = await ti({ data: { key } });
      setMsg(`${key}: ${r.ok ? "OK" : "FALHA"} — ${r.message}`);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Integrações</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Schema declarativo: novas integrações são registradas em <code>integration_schemas</code>.
          Chaves marcadas como críticas exigem motivo na auditoria. Health-check automático a cada 15 min.
        </p>
      </div>
      {msg && <p className="text-xs text-primary">{msg}</p>}
      {schemas.map((sch) => {
        const st = status[sch.key];
        const fields = sch.fields ?? [];
        return (
          <div key={sch.key} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold text-sm">{sch.label}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{sch.key}.*</div>
                {sch.description && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">{sch.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                {st && (
                  <span
                    className={`px-2 py-0.5 rounded ${
                      st.last_status === "ok"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : st.last_status === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                    title={st.last_message ?? ""}
                  >
                    {st.last_status === "ok" ? "OK" : st.last_status === "error" ? "ERRO" : "—"}
                  </span>
                )}
                {st?.last_tested_at && (
                  <span className="text-muted-foreground">
                    {new Date(st.last_tested_at).toLocaleString("pt-BR")}
                  </span>
                )}
                {sch.testable && (
                  <button
                    onClick={() => runTest(sch.key)}
                    disabled={testing === sch.key}
                    className="px-2 py-1 rounded border border-border hover:bg-accent disabled:opacity-50"
                  >
                    {testing === sch.key ? "…" : "Testar conexão"}
                  </button>
                )}
              </div>
            </div>
            {st?.last_message && (
              <div className="text-[11px] text-muted-foreground font-mono break-all">
                {st.last_message}
              </div>
            )}
            {fields.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">
                Sem chaves configuráveis nesta integração.
              </div>
            ) : (
              fields.map((f) => {
                const s = settingMap.get(f.key) ?? {
                  key: f.key,
                  is_secret: f.type === "secret",
                  has_value: false,
                  description: f.label,
                };
                const critical = isCritical(f.key, f);
                return (
                  <div key={f.key} className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-mono text-xs">{f.key}</div>
                        {(f.label || s.description) && (
                          <div className="text-[11px] text-muted-foreground">
                            {f.label ?? s.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        {critical && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            crítica
                          </span>
                        )}
                        {s.is_secret && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            segredo
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded ${
                            s.has_value
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {s.has_value ? "configurado" : "vazio"}
                        </span>
                        <button
                          onClick={() => setOpenHistory(openHistory === f.key ? null : f.key)}
                          className="px-2 py-0.5 rounded border border-border hover:bg-accent"
                        >
                          {openHistory === f.key ? "Fechar" : "Histórico"}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={s.is_secret ? "password" : f.type === "number" ? "number" : "text"}
                        value={edits[f.key] ?? ""}
                        onChange={(e) =>
                          setEdits((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        placeholder={
                          s.is_secret && s.has_value
                            ? "•••••••• (deixe em branco para manter)"
                            : f.placeholder ?? "valor"
                        }
                        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                      />
                      <button
                        onClick={() => save(f.key, !!s.is_secret, critical)}
                        disabled={saving === f.key || (s.is_secret && (edits[f.key] ?? "") === "")}
                        className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
                      >
                        {saving === f.key ? "…" : "Salvar"}
                      </button>
                    </div>
                    {openHistory === f.key && (
                      <HistoryPanel
                        settingKey={f.key}
                        critical={critical}
                        onAfterRollback={load}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

function HistoryPanel({
  settingKey,
  critical,
  onAfterRollback,
}: {
  settingKey: string;
  critical: boolean;
  onAfterRollback: () => Promise<void>;
}) {
  const lh = useServerFn(listSettingHistory);
  const rb = useServerFn(rollbackSetting);
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [openDiff, setOpenDiff] = useState<string | null>(null);

  const load = () =>
    lh({ data: { key: settingKey, limit: 20 } })
      .then((r) => setRows(r.rows as any[]))
      .catch((e) => setErr(e.message));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingKey]);

  const doRollback = async (id: string) => {
    let reason: string | null = null;
    if (critical) {
      reason = window.prompt(
        `Rollback de chave crítica "${settingKey}".\nMotivo (mín. 5 caracteres):`,
      );
      if (!reason || reason.trim().length < 5) return;
    } else if (!confirm("Reverter para esta versão?")) {
      return;
    }
    setBusy(id);
    try {
      await rb({ data: { history_id: id, reason } });
      await load();
      await onAfterRollback();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-border bg-background/50 p-3 space-y-2">
      {err && <p className="text-xs text-destructive">{err}</p>}
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Sem histórico.</p>
      ) : (
        <ul className="space-y-1.5 text-xs">
          {rows.map((r) => (
            <li
              key={r.id}
              className="border-b border-border/50 pb-1.5 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex gap-2 items-center text-[10px] flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded uppercase ${
                        r.action === "rollback"
                          ? "bg-amber-500/10 text-amber-600"
                          : r.action === "delete"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {r.action}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(r.changed_at).toLocaleString("pt-BR")}
                    </span>
                    {r.reason && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        title={r.reason}
                      >
                        motivo: {String(r.reason).slice(0, 40)}
                        {String(r.reason).length > 40 ? "…" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setOpenDiff(openDiff === r.id ? null : r.id)}
                    className="px-2 py-1 rounded border border-border hover:bg-accent text-[10px]"
                  >
                    {openDiff === r.id ? "Fechar diff" : "Ver diff"}
                  </button>
                  <button
                    onClick={() => doRollback(r.id)}
                    disabled={busy === r.id}
                    className="px-2 py-1 rounded border border-border hover:bg-accent text-[10px] disabled:opacity-50"
                  >
                    {busy === r.id ? "…" : "Reverter"}
                  </button>
                </div>
              </div>
              {openDiff === r.id && <SideBySideDiff before={r.old_value} after={r.new_value} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SideBySideDiff({ before, after }: { before: string | null; after: string | null }) {
  const a = (before ?? "").split(/\r?\n/);
  const b = (after ?? "").split(/\r?\n/);
  const n = Math.max(a.length, b.length, 1);
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
      <div className="rounded border border-border bg-destructive/5 p-2 overflow-x-auto">
        <div className="text-[10px] uppercase text-muted-foreground mb-1">antes</div>
        {Array.from({ length: n }).map((_, i) => {
          const line = a[i] ?? "";
          const changed = line !== (b[i] ?? "");
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap break-all ${
                changed && line ? "bg-destructive/15 text-destructive" : ""
              }`}
            >
              {line || <span className="text-muted-foreground">·</span>}
            </div>
          );
        })}
      </div>
      <div className="rounded border border-border bg-emerald-500/5 p-2 overflow-x-auto">
        <div className="text-[10px] uppercase text-muted-foreground mb-1">depois</div>
        {Array.from({ length: n }).map((_, i) => {
          const line = b[i] ?? "";
          const changed = line !== (a[i] ?? "");
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap break-all ${
                changed && line ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : ""
              }`}
            >
              {line || <span className="text-muted-foreground">·</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}






function ClientsTab() {
  const fl = useServerFn(adminListClients);
  const cp = useServerFn(adminCreateProject);
  const up = useServerFn(adminUpdateProject);
  const ad = useServerFn(adminAddDocument);
  const sr = useServerFn(adminSetRole);
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () => fl().then((r) => setRows(r.rows as any[])).catch((e) => setErr(e.message));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err)
    return <p className="text-sm text-destructive mt-5">{err}. (Sua conta precisa do papel admin.)</p>;

  return (
    <div className="mt-5 space-y-3">
      {rows.map((c) => (
        <details key={c.id} className="rounded-xl border border-border bg-card" open={open === c.id}>
          <summary
            onClick={(e) => {
              e.preventDefault();
              setOpen(open === c.id ? null : c.id);
            }}
            className="cursor-pointer p-4 flex justify-between items-center gap-3"
          >
            <div>
              <div className="font-medium">{c.full_name || c.email}</div>
              <div className="text-xs text-muted-foreground">
                {c.email} · {c.company || "—"} · {c.projects.length} projeto(s)
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {c.roles.map((r: string) => (
                <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {r}
                </span>
              ))}
            </div>
          </summary>
          {open === c.id && (
            <div className="border-t border-border p-4 space-y-5">
              <RoleControls
                userId={c.id}
                roles={c.roles}
                onChange={async (action, role) => {
                  await sr({ data: { user_id: c.id, role, action } });
                  await load();
                }}
              />
              <NewProjectForm
                clientId={c.id}
                onCreate={async (data) => {
                  await cp({ data: { ...data, client_id: c.id } });
                  await load();
                }}
              />
              <ul className="space-y-2">
                {c.projects.map((p: any) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    onUpdate={async (patch) => {
                      await up({ data: { id: p.id, ...patch } });
                      await load();
                    }}
                    onAddDoc={async (data) => {
                      await ad({ data: { project_id: p.id, ...data } });
                    }}
                  />
                ))}
              </ul>
            </div>
          )}
        </details>
      ))}
      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Sem clientes ainda. Convide via /auth (signup) ou adicione manualmente.
        </div>
      )}
    </div>
  );
}

function RoleControls({
  roles,
  onChange,
}: {
  userId: string;
  roles: string[];
  onChange: (action: "add" | "remove", role: "admin" | "collaborator" | "client" | "admin_integrations") => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs items-center">
      <span className="text-muted-foreground">Papéis:</span>
      {(["admin", "admin_integrations", "collaborator", "client"] as const).map((r) => {
        const has = roles.includes(r);
        return (
          <button
            key={r}
            onClick={() => onChange(has ? "remove" : "add", r)}
            className={`px-2 py-1 rounded border ${has ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
          >
            {has ? "✓ " : "+ "}
            {r}
          </button>
        );
      })}
    </div>
  );
}

function NewProjectForm({
  clientId,
  onCreate,
}: {
  clientId: string;
  onCreate: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", description: "", owner: "", due_date: "" });
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!form.name) return;
        setBusy(true);
        try {
          await onCreate(form);
          setForm({ name: "", description: "", owner: "", due_date: "" });
        } finally {
          setBusy(false);
        }
      }}
      className="grid md:grid-cols-4 gap-2 text-sm"
    >
      <input
        required
        placeholder="Nome do projeto"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="px-3 py-2 rounded-lg border border-border bg-background"
      />
      <input
        placeholder="Responsável"
        value={form.owner}
        onChange={(e) => setForm({ ...form, owner: e.target.value })}
        className="px-3 py-2 rounded-lg border border-border bg-background"
      />
      <input
        type="date"
        value={form.due_date}
        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        className="px-3 py-2 rounded-lg border border-border bg-background"
      />
      <button disabled={busy} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">
        {busy ? "..." : "+ Projeto"}
      </button>
      <input
        placeholder="Descrição"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="md:col-span-4 px-3 py-2 rounded-lg border border-border bg-background"
      />
    </form>
  );
}

function ProjectRow({
  project,
  onUpdate,
  onAddDoc,
}: {
  project: any;
  onUpdate: (patch: any) => Promise<void>;
  onAddDoc: (data: { title: string; kind: any; url?: string }) => Promise<void>;
}) {
  const [doc, setDoc] = useState({ title: "", url: "", kind: "arquivo" as const });
  return (
    <li className="rounded-lg border border-border p-3 bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-medium text-sm">{project.name}</div>
        <select
          value={project.status}
          onChange={(e) => void onUpdate({ status: e.target.value })}
          className="text-xs px-2 py-1 rounded border border-border bg-background"
        >
          {PROJECT_STATUSES_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!doc.title) return;
          await onAddDoc(doc);
          setDoc({ title: "", url: "", kind: "arquivo" });
        }}
        className="mt-2 grid md:grid-cols-4 gap-2 text-xs"
      >
        <input
          placeholder="Título do doc"
          value={doc.title}
          onChange={(e) => setDoc({ ...doc, title: e.target.value })}
          className="px-2 py-1.5 rounded border border-border bg-background"
        />
        <select
          value={doc.kind}
          onChange={(e) => setDoc({ ...doc, kind: e.target.value as never })}
          className="px-2 py-1.5 rounded border border-border bg-background"
        >
          <option value="arquivo">Arquivo</option>
          <option value="proposta">Proposta</option>
          <option value="contrato">Contrato</option>
          <option value="briefing">Briefing</option>
          <option value="relatorio">Relatório</option>
        </select>
        <input
          placeholder="URL"
          value={doc.url}
          onChange={(e) => setDoc({ ...doc, url: e.target.value })}
          className="px-2 py-1.5 rounded border border-border bg-background"
        />
        <button className="px-2 py-1.5 rounded bg-primary text-primary-foreground">+ Documento</button>
      </form>
    </li>
  );
}

function TicketsTab() {
  const fl = useServerFn(adminListAllTickets);
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    void fl()
      .then((r) => setRows(r.rows as any[]))
      .catch((e) => setErr(e.message));
  }, [fl]);
  if (err) return <p className="text-sm text-destructive mt-5">{err}</p>;
  return (
    <ul className="mt-5 space-y-2">
      {rows.map((t) => (
        <li key={t.id}>
          <a
            href={"/app/support/" + t.id}
            className="block rounded-xl border border-border bg-card p-4 hover:border-primary"
          >
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-medium">{t.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {t.profiles?.full_name || t.profiles?.email} · {t.profiles?.company || "—"}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary capitalize">{t.status}</span>
            </div>
          </a>
        </li>
      ))}
      {rows.length === 0 && (
        <li className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nenhum ticket.
        </li>
      )}
    </ul>
  );
}

// ── Site sections management ──────────────────────────────────────────
function SiteSectionsTab() {
  const lp = useServerFn(adminListPages);
  const ls = useServerFn(adminListSections);
  const tog = useServerFn(adminToggleSection);
  const ups = useServerFn(adminUpsertSection);
  const del = useServerFn(adminDeleteSection);
  const reo = useServerFn(adminReorderSections);

  const [pages, setPages] = useState<string[]>([]);
  const [page, setPage] = useState<string>("home");
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newRow, setNewRow] = useState({ key: "", label: "", sort_order: 999 });

  const loadPages = async () => {
    try {
      const r: any = await lp();
      const ps = r.pages?.length ? r.pages : ["home"];
      setPages(ps);
      if (!ps.includes(page)) setPage(ps[0]);
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao carregar páginas");
    }
  };
  const loadRows = async () => {
    try {
      const r: any = await ls({ data: { page } });
      setRows(r.rows ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao carregar seções");
    }
  };
  useEffect(() => { loadPages(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { loadRows(); /* eslint-disable-next-line */ }, [page]);

  const toggle = async (id: string, enabled: boolean) => {
    setBusy(true); setErr(null);
    try { await tog({ data: { id, enabled } }); await loadRows(); }
    catch (e: any) { setErr(e?.message ?? "Falha"); }
    finally { setBusy(false); }
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= rows.length) return;
    const a = rows[idx], b = rows[next];
    setBusy(true);
    try {
      await reo({ data: { items: [
        { id: a.id, sort_order: b.sort_order },
        { id: b.id, sort_order: a.sort_order },
      ] } });
      await loadRows();
    } catch (e: any) { setErr(e?.message ?? "Falha"); }
    finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir esta seção?")) return;
    setBusy(true);
    try { await del({ data: { id } }); await loadRows(); }
    catch (e: any) { setErr(e?.message ?? "Falha"); }
    finally { setBusy(false); }
  };
  const create = async () => {
    if (!newRow.key || !newRow.label) return;
    setBusy(true); setErr(null);
    try {
      await ups({ data: { page, key: newRow.key, label: newRow.label, sort_order: newRow.sort_order, enabled: true } });
      setNewRow({ key: "", label: "", sort_order: 999 });
      await loadRows();
    } catch (e: any) { setErr(e?.message ?? "Falha"); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Página:</label>
        <select
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="px-3 py-1.5 rounded border border-border bg-background text-sm"
        >
          {pages.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={loadRows} className="text-xs text-primary underline">Recarregar</button>
      </div>

      {err && <div className="rounded border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">{err}</div>}

      <div className="rounded-xl border border-border divide-y">
        {rows.map((r, idx) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground w-12">{r.sort_order}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{r.label}</div>
              <div className="text-xs text-muted-foreground font-mono">{r.key}</div>
            </div>
            <button disabled={busy} onClick={() => move(idx, -1)} className="px-2 py-1 text-xs rounded border border-border">↑</button>
            <button disabled={busy} onClick={() => move(idx, +1)} className="px-2 py-1 text-xs rounded border border-border">↓</button>
            <button
              disabled={busy}
              onClick={() => toggle(r.id, !r.enabled)}
              className={`px-3 py-1 text-xs rounded-full font-medium ${r.enabled ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}
            >
              {r.enabled ? "Ativa" : "Desativada"}
            </button>
            <button disabled={busy} onClick={() => remove(r.id)} className="px-2 py-1 text-xs text-destructive">Excluir</button>
          </div>
        ))}
        {rows.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma seção cadastrada para esta página.</div>}
      </div>

      <div className="rounded-xl border border-border p-4 space-y-2">
        <div className="text-sm font-medium">Adicionar seção</div>
        <div className="grid sm:grid-cols-4 gap-2">
          <input
            placeholder="chave (ex: faq)"
            value={newRow.key}
            onChange={(e) => setNewRow({ ...newRow, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
            className="px-3 py-1.5 rounded border border-border bg-background text-sm font-mono"
          />
          <input
            placeholder="Rótulo"
            value={newRow.label}
            onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
            className="px-3 py-1.5 rounded border border-border bg-background text-sm sm:col-span-2"
          />
          <input
            type="number"
            placeholder="Ordem"
            value={newRow.sort_order}
            onChange={(e) => setNewRow({ ...newRow, sort_order: Number(e.target.value) || 0 })}
            className="px-3 py-1.5 rounded border border-border bg-background text-sm"
          />
        </div>
        <button
          onClick={create}
          disabled={busy || !newRow.key || !newRow.label}
          className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          Adicionar
        </button>
        <p className="text-xs text-muted-foreground">
          Após adicionar, registre a renderização da seção no código da página correspondente (verificando <code>on("&lt;chave&gt;")</code>).
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sprint 18 — Observabilidade
// ─────────────────────────────────────────────────────────────
function ObservabilityTab() {
  const um = useServerFn(getUptimeMetrics);
  const lh = useServerFn(listCronHistory);
  const ex = useServerFn(exportCronHistoryCsv);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [filterKey, setFilterKey] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toIso = (d: string) => (d ? new Date(d).toISOString() : undefined);

  const reload = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [m, h] = await Promise.all([
        um(),
        lh({ data: { key: filterKey || undefined, from: toIso(from), to: toIso(to), limit } }),
      ]);
      setMetrics(m.metrics as any[]);
      setHistory(h.rows as any[]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void reload(); /* eslint-disable-next-line */ }, []);

  const doExport = async () => {
    setExporting(true);
    try {
      const r = await ex({ data: { key: filterKey || undefined, from: toIso(from), to: toIso(to), limit: Math.max(limit, 1000) } });
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cron-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setExporting(false);
    }
  };

  if (err) return <p className="text-sm text-destructive mt-5">{err}</p>;

  return (
    <div className="mt-6 space-y-6">
      <section>
        <h2 className="text-lg font-semibold">Uptime por integração</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma execução do health-check ainda. O cron roda a cada 15 min.</p>}
          {metrics.map((m) => (
            <div key={m.key} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.key}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${m.uptime_24h == null ? "bg-muted text-muted-foreground" : m.uptime_24h >= 99 ? "bg-emerald-500/15 text-emerald-700" : m.uptime_24h >= 90 ? "bg-amber-500/15 text-amber-700" : "bg-destructive/15 text-destructive"}`}>
                  {m.uptime_24h == null ? "—" : `${m.uptime_24h}%`} 24h
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><dt>7d</dt><dd className="text-foreground">{m.uptime_7d ?? "—"}%</dd></div>
                <div><dt>Checks 24h</dt><dd className="text-foreground">{m.checks_24h}</dd></div>
                <div><dt>Checks 7d</dt><dd className="text-foreground">{m.checks_7d}</dd></div>
                <div><dt>Latência média</dt><dd className="text-foreground">{m.avg_latency_ms ?? "—"} ms</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Últimas execuções do cron</h2>
        <div className="mt-3 flex flex-wrap gap-2 items-end">
          <label className="text-xs text-muted-foreground flex flex-col">
            Integração
            <input value={filterKey} onChange={(e) => setFilterKey(e.target.value)} placeholder="ex.: uazapi" className="mt-1 h-8 px-2 rounded border border-input bg-background text-sm" />
          </label>
          <label className="text-xs text-muted-foreground flex flex-col">
            De
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-8 px-2 rounded border border-input bg-background text-sm" />
          </label>
          <label className="text-xs text-muted-foreground flex flex-col">
            Até
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-8 px-2 rounded border border-input bg-background text-sm" />
          </label>
          <label className="text-xs text-muted-foreground flex flex-col">
            Limite
            <input type="number" min={1} max={500} value={limit} onChange={(e) => setLimit(Number(e.target.value) || 100)} className="mt-1 h-8 px-2 rounded border border-input bg-background text-sm w-24" />
          </label>
          <button onClick={() => void reload()} disabled={loading} className="h-8 px-3 rounded bg-primary text-primary-foreground text-sm">
            {loading ? "Carregando…" : "Aplicar filtros"}
          </button>
          <button onClick={() => void doExport()} disabled={exporting} className="h-8 px-3 rounded border border-border text-sm">
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr><th className="px-3 py-2">Quando</th><th className="px-3 py-2">Integração</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Latência</th><th className="px-3 py-2">Origem</th><th className="px-3 py-2">Mensagem</th></tr>
            </thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-muted-foreground text-center">Sem execuções no período.</td></tr>}
              {history.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(r.checked_at).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{r.key}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${r.status === "ok" ? "bg-emerald-500/15 text-emerald-700" : "bg-destructive/15 text-destructive"}`}>{r.status}</span></td>
                  <td className="px-3 py-2">{r.latency_ms ?? "—"} ms</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.source}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[300px]" title={r.message}>{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sprint 19 — Segurança (2FA + Break-glass)
// ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const get2 = useServerFn(get2faStatus);
  const set2 = useServerFn(set2faEnabled);
  const req = useServerFn(requestBreakGlass);
  const rev = useServerFn(revealSecretWithGrant);
  const lst = useServerFn(listBreakGlassGrants);

  const [twofa, setTwofa] = useState<any>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [bgKey, setBgKey] = useState("");
  const [bgReason, setBgReason] = useState("");
  const [bgMinutes, setBgMinutes] = useState(10);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const [a, b] = await Promise.all([get2(), lst()]);
      setTwofa(a);
      setGrants(b.rows as any[]);
    } catch (e: any) { setErr(e.message); }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const toggle2fa = async () => {
    setMsg(null); setErr(null);
    try {
      await set2({ data: { enabled: !twofa?.enabled } });
      await load();
      setMsg(twofa?.enabled ? "2FA desativado." : "2FA ativado.");
    } catch (e: any) { setErr(e.message); }
  };

  const createGrant = async () => {
    setMsg(null); setErr(null);
    try {
      const r = await req({ data: { setting_key: bgKey.trim(), reason: bgReason.trim(), minutes: bgMinutes } });
      setMsg(`Grant criado. Expira em ${new Date(r.expires_at).toLocaleString("pt-BR")}.`);
      setBgKey(""); setBgReason("");
      await load();
    } catch (e: any) { setErr(e.message); }
  };

  const reveal = async (id: string) => {
    setErr(null);
    try {
      const r = await rev({ data: { grant_id: id } });
      setRevealed((m) => ({ ...m, [id]: r.value ?? "(vazio)" }));
      await load();
    } catch (e: any) { setErr(e.message); }
  };

  if (err && !twofa) return <p className="text-sm text-destructive mt-5">{err}</p>;

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Autenticação em dois fatores</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Obrigatório para o papel <code>admin</code> ao alterar configurações. (TOTP completo: roadmap.)
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${twofa?.enabled ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"}`}>
            {twofa?.enabled ? "Ativado" : "Desativado"}
          </span>
          {twofa?.enabled_at && <span className="text-xs text-muted-foreground">desde {new Date(twofa.enabled_at).toLocaleString("pt-BR")}</span>}
          <button onClick={() => void toggle2fa()} className="h-8 px-3 rounded border border-border text-sm">
            {twofa?.enabled ? "Desativar" : "Ativar"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Break-glass — revelar segredo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Concede a si mesmo (admin) acesso temporário para revelar uma chave secreta. Toda concessão e revelação ficam auditadas.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_120px_auto]">
          <input value={bgKey} onChange={(e) => setBgKey(e.target.value)} placeholder="ex.: uazapi.token" className="h-9 px-3 rounded border border-input bg-background text-sm" />
          <input value={bgReason} onChange={(e) => setBgReason(e.target.value)} placeholder="Motivo (mín. 10 caracteres)" className="h-9 px-3 rounded border border-input bg-background text-sm" />
          <input type="number" min={1} max={60} value={bgMinutes} onChange={(e) => setBgMinutes(Number(e.target.value) || 10)} className="h-9 px-3 rounded border border-input bg-background text-sm" />
          <button onClick={() => void createGrant()} className="h-9 px-3 rounded bg-primary text-primary-foreground text-sm">Solicitar</button>
        </div>
        {msg && <p className="mt-2 text-xs text-emerald-700">{msg}</p>}
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

        <div className="mt-4 rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr><th className="px-3 py-2">Chave</th><th className="px-3 py-2">Motivo</th><th className="px-3 py-2">Concedido</th><th className="px-3 py-2">Expira</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Ação</th></tr>
            </thead>
            <tbody>
              {grants.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-muted-foreground text-center">Nenhum break-glass registrado.</td></tr>}
              {grants.map((g) => {
                const expired = new Date(g.expires_at).getTime() < Date.now();
                const status = g.revoked_at ? "revogado" : g.revealed_at ? "usado" : expired ? "expirado" : "ativo";
                return (
                  <tr key={g.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{g.setting_key}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[260px]" title={g.reason}>{g.reason}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{new Date(g.granted_at).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{new Date(g.expires_at).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${status === "ativo" ? "bg-emerald-500/15 text-emerald-700" : status === "usado" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{status}</span></td>
                    <td className="px-3 py-2">
                      {status === "ativo" && (
                        <button onClick={() => void reveal(g.id)} className="h-7 px-2 rounded border border-border text-xs">Revelar</button>
                      )}
                      {revealed[g.id] && (
                        <code className="ml-2 px-2 py-0.5 rounded bg-muted text-xs break-all">{revealed[g.id]}</code>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ===========================================================================
// Visits & LGPD tab — visit analytics by page + retention controls
// ===========================================================================
import {
  getVisitsByPage,
  exportVisitsCsv,
  getRecentConsentLogs,
  runLgpdMaintenance,
  getLgpdSettings,
} from "@/lib/visitor-analytics.functions";

function VisitsLgpdTab() {
  const gv = useServerFn(getVisitsByPage);
  const ex = useServerFn(exportVisitsCsv);
  const gc = useServerFn(getRecentConsentLogs);
  const rm = useServerFn(runLgpdMaintenance);
  const gs = useServerFn(getLgpdSettings);
  const us = useServerFn(upsertSetting);

  const today = new Date().toISOString().slice(0, 10);
  const past = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(past);
  const [endDate, setEndDate] = useState(today);
  const [pathLike, setPathLike] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [pages, setPages] = useState<{ path: string; visits: number; uniqueVisitors: number; daysSeen: number }[]>([]);
  const [timeline, setTimeline] = useState<{ day: string; visits: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [consentRows, setConsentRows] = useState<{ created_at: string; decision: string; source: string; path: string | null }[]>([]);
  const [consentStats, setConsentStats] = useState<{ total: number; granted: number; denied: number }>({ total: 0, granted: 0, denied: 0 });
  const [lgpd, setLgpd] = useState<{ anonymizeAfterDays: number; purgeAfterDays: number; contactEmail: string }>({ anonymizeAfterDays: 30, purgeAfterDays: 180, contactEmail: "" });
  const [maintMsg, setMaintMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setBusy(true); setErr(null);
    try {
      const r = await gv({ data: { startDate, endDate, pathLike: pathLike || null, utmSource: utmSource || null, limit: 100 } });
      setPages(r.pages); setTimeline(r.timeline);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }
  async function loadAux() {
    try {
      const [c, s] = await Promise.all([gc(), gs()]);
      setConsentRows(c.rows); setConsentStats({ total: c.total, granted: c.granted, denied: c.denied });
      setLgpd(s);
    } catch (e) { console.warn(e); }
  }
  useEffect(() => { refresh(); loadAux(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function download() {
    setBusy(true);
    try {
      const r = await ex({ data: { startDate, endDate, pathLike: pathLike || null, utmSource: utmSource || null, limit: 100 } });
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `visitas-${startDate}-a-${endDate}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function runMaint() {
    setMaintMsg("Executando…");
    try {
      const r = await rm();
      setMaintMsg(`Anonimizados: ${r.anonymized} · Apagados: ${r.purged}`);
    } catch (e) { setMaintMsg(`Erro: ${(e as Error).message}`); }
  }

  async function saveLgpdSetting(key: string, value: string) {
    try {
      await us({ data: { key, value, reason: "Atualização painel LGPD" } });
      setMaintMsg("Configuração salva.");
      await loadAux();
    } catch (e) { setMaintMsg(`Erro: ${(e as Error).message}`); }
  }

  const maxTl = Math.max(1, ...timeline.map((d) => d.visits));

  return (
    <div className="mt-6 space-y-8">
      {/* Filters */}
      <section className="border border-border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <label className="text-xs">De
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full text-sm border border-border rounded px-2 py-1 bg-background"/>
          </label>
          <label className="text-xs">Até
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full text-sm border border-border rounded px-2 py-1 bg-background"/>
          </label>
          <label className="text-xs">Path contém
            <input value={pathLike} onChange={(e) => setPathLike(e.target.value)} placeholder="/blog" className="mt-1 w-full text-sm border border-border rounded px-2 py-1 bg-background"/>
          </label>
          <label className="text-xs">UTM source
            <input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="google" className="mt-1 w-full text-sm border border-border rounded px-2 py-1 bg-background"/>
          </label>
          <div className="flex items-end gap-2">
            <button onClick={refresh} disabled={busy} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50">Atualizar</button>
            <button onClick={download} disabled={busy} className="px-3 py-2 text-sm border border-border rounded disabled:opacity-50">CSV</button>
          </div>
        </div>
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      </section>

      {/* Timeline sparkline */}
      <section>
        <h2 className="text-sm font-semibold mb-2">Visitas por dia</h2>
        {timeline.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados no período.</p> : (
          <div className="flex items-end gap-1 h-24 border border-border rounded p-2">
            {timeline.map((d) => (
              <div key={d.day} title={`${d.day}: ${d.visits} visitas`} className="flex-1 bg-primary rounded-t" style={{ height: `${(d.visits / maxTl) * 100}%`, minHeight: 2 }}/>
            ))}
          </div>
        )}
      </section>

      {/* Pages table */}
      <section>
        <h2 className="text-sm font-semibold mb-2">Top páginas</h2>
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase">
              <tr><th className="p-2">Path</th><th className="p-2 text-right">Visitas</th><th className="p-2 text-right">Únicos</th><th className="p-2 text-right">Dias</th></tr>
            </thead>
            <tbody>
              {pages.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Sem dados.</td></tr>
                : pages.map((p) => (
                  <tr key={p.path} className="border-t border-border">
                    <td className="p-2 font-mono truncate max-w-md">{p.path}</td>
                    <td className="p-2 text-right">{p.visits}</td>
                    <td className="p-2 text-right">{p.uniqueVisitors}</td>
                    <td className="p-2 text-right">{p.daysSeen}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Consent audit */}
      <section className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Auditoria de consentimento</h2>
          <div className="text-xs text-muted-foreground">
            Últimos 100: <strong>{consentStats.granted}</strong> aceitos · <strong>{consentStats.denied}</strong> negados
          </div>
        </div>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground"><tr><th className="p-1">Quando</th><th className="p-1">Decisão</th><th className="p-1">Origem</th><th className="p-1">Path</th></tr></thead>
            <tbody>
              {consentRows.length === 0 ? <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">Sem registros ainda.</td></tr>
                : consentRows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-1">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                    <td className="p-1"><span className={r.decision === "granted" ? "text-emerald-600" : "text-destructive"}>{r.decision}</span></td>
                    <td className="p-1">{r.source}</td>
                    <td className="p-1 font-mono">{r.path || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* LGPD retention controls */}
      <section className="border border-border rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Retenção LGPD (gerenciada pelo painel)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">Anonimizar após (dias)</label>
            <div className="flex gap-2 mt-1">
              <input type="number" min={1} max={365} defaultValue={lgpd.anonymizeAfterDays} onBlur={(e) => saveLgpdSetting("lgpd_anonymize_after_days", e.target.value)} className="w-full border border-border rounded px-2 py-1 bg-background"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Apagar após (dias)</label>
            <input type="number" min={1} max={3650} defaultValue={lgpd.purgeAfterDays} onBlur={(e) => saveLgpdSetting("lgpd_purge_after_days", e.target.value)} className="mt-1 w-full border border-border rounded px-2 py-1 bg-background"/>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">E-mail de contato LGPD</label>
            <input type="email" defaultValue={lgpd.contactEmail} onBlur={(e) => saveLgpdSetting("lgpd_privacy_contact", JSON.stringify(e.target.value))} className="mt-1 w-full border border-border rounded px-2 py-1 bg-background"/>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={runMaint} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded">Executar anonimização + purga agora</button>
          {maintMsg && <span className="text-xs text-muted-foreground">{maintMsg}</span>}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Os mesmos prazos são publicados em <a href="/privacidade" className="underline">/privacidade</a>. Um cron diário também executa essa rotina automaticamente.
        </p>
      </section>
    </div>
  );
}
