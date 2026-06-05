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

// Group setting keys by integration prefix (e.g. "uazapi.token" → "uazapi").
// "supabase" and "lovable_ai" appear in the status panel even without keys.
const INTEGRATION_LABELS: Record<string, string> = {
  uazapi: "uazapi (WhatsApp)",
  supabase: "Lovable Cloud (banco)",
  lovable_ai: "Lovable AI Gateway",
};
const TESTABLE = new Set(["uazapi", "supabase", "lovable_ai"]);

function SettingsTab() {
  const ls = useServerFn(listSettings);
  const us = useServerFn(upsertSetting);
  const lis = useServerFn(listIntegrationStatus);
  const ti = useServerFn(testIntegration);
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<Record<string, any>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await ls();
      setRows(r.rows as any[]);
      const init: Record<string, string> = {};
      (r.rows as any[]).forEach((s) => {
        init[s.key] = s.is_secret ? "" : s.value ?? "";
      });
      setEdits(init);
      const st = await lis();
      const map: Record<string, any> = {};
      (st.rows as any[]).forEach((x) => (map[x.key] = x));
      setStatus(map);
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

  const save = async (key: string, is_secret: boolean) => {
    setSaving(key);
    setMsg(null);
    try {
      const value = edits[key] ?? "";
      await us({ data: { key, value: value === "" ? null : value, is_secret } });
      setMsg(`Salvo: ${key}`);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(null);
    }
  };

  const runTest = async (key: "uazapi" | "supabase" | "lovable_ai") => {
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

  // Group settings by prefix before the first "."
  const grouped: Record<string, any[]> = {};
  rows.forEach((s) => {
    const prefix = s.key.includes(".") ? s.key.split(".")[0] : s.key;
    (grouped[prefix] ||= []).push(s);
  });
  // Ensure testable integrations show up even with no settings
  TESTABLE.forEach((k) => {
    if (!grouped[k]) grouped[k] = [];
  });

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Integrações</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Tudo gerenciável pelo painel. Cada alteração é registrada em histórico (auditoria + rollback).
          Cache de leitura em runtime: 60s. Campos de segredo não exibem o valor após salvar.
        </p>
      </div>
      {msg && <p className="text-xs text-primary">{msg}</p>}
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, items]) => {
          const st = status[group];
          const testable = TESTABLE.has(group);
          return (
            <div key={group} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-sm">{INTEGRATION_LABELS[group] ?? group}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{group}.*</div>
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
                  {testable && (
                    <button
                      onClick={() => runTest(group as any)}
                      disabled={testing === group}
                      className="px-2 py-1 rounded border border-border hover:bg-accent disabled:opacity-50"
                    >
                      {testing === group ? "…" : "Testar conexão"}
                    </button>
                  )}
                </div>
              </div>
              {st?.last_message && (
                <div className="text-[11px] text-muted-foreground font-mono break-all">
                  {st.last_message}
                </div>
              )}
              {items.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">
                  Sem chaves configuráveis nesta integração.
                </div>
              ) : (
                items.map((s: any) => (
                  <div key={s.key} className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-mono text-xs">{s.key}</div>
                        {s.description && (
                          <div className="text-[11px] text-muted-foreground">{s.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
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
                          onClick={() => setOpenHistory(openHistory === s.key ? null : s.key)}
                          className="px-2 py-0.5 rounded border border-border hover:bg-accent"
                        >
                          {openHistory === s.key ? "Fechar" : "Histórico"}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={s.is_secret ? "password" : "text"}
                        value={edits[s.key] ?? ""}
                        onChange={(e) => setEdits((p) => ({ ...p, [s.key]: e.target.value }))}
                        placeholder={
                          s.is_secret && s.has_value
                            ? "•••••••• (deixe em branco para manter)"
                            : "valor"
                        }
                        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                      />
                      <button
                        onClick={() => save(s.key, !!s.is_secret)}
                        disabled={saving === s.key || (s.is_secret && (edits[s.key] ?? "") === "")}
                        className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
                      >
                        {saving === s.key ? "…" : "Salvar"}
                      </button>
                    </div>
                    {openHistory === s.key && (
                      <HistoryPanel settingKey={s.key} onAfterRollback={load} />
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
    </div>
  );
}

function HistoryPanel({
  settingKey,
  onAfterRollback,
}: {
  settingKey: string;
  onAfterRollback: () => Promise<void>;
}) {
  const lh = useServerFn(listSettingHistory);
  const rb = useServerFn(rollbackSetting);
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () =>
    lh({ data: { key: settingKey, limit: 20 } })
      .then((r) => setRows(r.rows as any[]))
      .catch((e) => setErr(e.message));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingKey]);

  const doRollback = async (id: string) => {
    if (!confirm("Reverter para esta versão? O valor atual também será preservado no histórico.")) return;
    setBusy(id);
    try {
      await rb({ data: { history_id: id } });
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
            <li key={r.id} className="flex items-start justify-between gap-3 border-b border-border/50 pb-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex gap-2 items-center text-[10px]">
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
                </div>
                <div className="font-mono text-[11px] mt-1 break-all">
                  <span className="text-muted-foreground">antes:</span> {r.old_value ?? "—"}
                </div>
                <div className="font-mono text-[11px] break-all">
                  <span className="text-muted-foreground">depois:</span> {r.new_value ?? "—"}
                </div>
              </div>
              <button
                onClick={() => doRollback(r.id)}
                disabled={busy === r.id}
                className="px-2 py-1 rounded border border-border hover:bg-accent text-[10px] disabled:opacity-50 shrink-0"
              >
                {busy === r.id ? "…" : "Reverter"}
              </button>
            </li>
          ))}
        </ul>
      )}
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
