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
import { listSettings, upsertSetting } from "@/lib/settings.functions";

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

function SettingsTab() {
  const ls = useServerFn(listSettings);
  const us = useServerFn(upsertSetting);
  const [rows, setRows] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () =>
    ls()
      .then((r) => {
        setRows(r.rows as any[]);
        const init: Record<string, string> = {};
        (r.rows as any[]).forEach((s) => {
          init[s.key] = s.is_secret ? "" : s.value ?? "";
        });
        setEdits(init);
      })
      .catch((e) => setErr(e.message));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err) return <p className="text-sm text-destructive mt-5">{err}. (Sua conta precisa do papel admin.)</p>;

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

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Integrações</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configurações usadas em runtime (cache de 60s). Campos marcados como segredo não exibem o valor atual após salvo.
        </p>
      </div>
      {msg && <p className="text-xs text-primary">{msg}</p>}
      <div className="space-y-2">
        {rows.map((s) => (
          <div key={s.key} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-sm">{s.key}</div>
                {s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                {s.is_secret && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    segredo
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded ${
                    s.has_value ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.has_value ? "configurado" : "vazio"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type={s.is_secret ? "password" : "text"}
                value={edits[s.key] ?? ""}
                onChange={(e) => setEdits((p) => ({ ...p, [s.key]: e.target.value }))}
                placeholder={s.is_secret && s.has_value ? "•••••••• (deixe em branco para manter)" : "valor"}
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
          </div>
        ))}
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
  onChange: (action: "add" | "remove", role: "admin" | "collaborator" | "client") => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs items-center">
      <span className="text-muted-foreground">Papéis:</span>
      {(["admin", "collaborator", "client"] as const).map((r) => {
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
