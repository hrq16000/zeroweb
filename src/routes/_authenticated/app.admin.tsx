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

export const Route = createFileRoute("/_authenticated/app/admin")({
  component: AdminPage,
});

type Tab = "clients" | "tickets" | "settings";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("clients");
  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold font-display">Administração</h1>
      <p className="mt-1 text-sm text-muted-foreground">Clientes, projetos, suporte e integrações.</p>
      <div className="mt-5 flex gap-1 border-b border-border">
        {(["clients", "tickets", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
            }`}
          >
            {t === "clients" ? "Clientes & Projetos" : t === "tickets" ? "Tickets" : "Integrações"}
          </button>
        ))}
      </div>
      {tab === "clients" ? <ClientsTab /> : tab === "tickets" ? <TicketsTab /> : <SettingsTab />}
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
