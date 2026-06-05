import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PainelGate } from "@/components/site/PainelGate";
import {
  listLeads,
  getLeadDetail,
  updateLead,
  addLeadHistory,
  getCrmSettings,
  updateCrmSettings,
  getCrmSummary,
  CRM_STATUSES,
  type CrmStatus,
} from "@/lib/crm.functions";

export const Route = createFileRoute("/painel-crm")({
  head: () => ({
    meta: [
      { title: "CRM · Pipeline comercial · 0WEB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <PainelGate>
      <CrmPage />
    </PainelGate>
  ),
  ssr: false,
});

const STATUS_LABEL: Record<CrmStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  qualificado: "Qualificado",
  proposta: "Proposta enviada",
  negociacao: "Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
  arquivado: "Arquivado",
};

type LeadRow = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  status: CrmStatus;
  assignee: string | null;
  notes: string | null;
  last_interaction: string | null;
  score: number;
  score_label: string;
};

type Summary = {
  novos: number;
  sem_responsavel: number;
  parados: number;
  fechados: number;
  perdidos: number;
  total: number;
  taxa_fechamento: number;
  tempo_medio_dias: number;
};

type Settings = {
  distribution_mode: "manual" | "round_robin" | "fixed";
  assignees: string[];
  fixed_assignee: string | null;
};

function CrmPage() {
  const [tab, setTab] = useState<"pipeline" | "list" | "config">("pipeline");
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filters, setFilters] = useState({
    days: 90,
    status: "" as "" | CrmStatus,
    assignee: "",
    source: "",
    campaign: "",
    city: "",
    service: "",
    search: "",
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [l, s, st] = await Promise.all([
        listLeads({
          data: {
            days: filters.days,
            status: filters.status || undefined,
            assignee: filters.assignee || undefined,
            source: filters.source || undefined,
            campaign: filters.campaign || undefined,
            city: filters.city || undefined,
            service: filters.service || undefined,
            search: filters.search || undefined,
            limit: 500,
          },
        }),
        getCrmSummary(),
        getCrmSettings(),
      ]);
      setRows(l.rows as LeadRow[]);
      setSummary(s);
      setSettings({
        distribution_mode: st.distribution_mode,
        assignees: st.assignees ?? [],
        fixed_assignee: st.fixed_assignee ?? null,
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byStatus = useMemo(() => {
    const m: Record<CrmStatus, LeadRow[]> = Object.fromEntries(
      CRM_STATUSES.map((s) => [s, [] as LeadRow[]])
    ) as Record<CrmStatus, LeadRow[]>;
    for (const r of rows) m[r.status].push(r);
    return m;
  }, [rows]);

  const exportRows = (format: "csv" | "json") => {
    if (format === "json") {
      downloadFile("leads.json", JSON.stringify(rows, null, 2), "application/json");
      return;
    }
    const cols = [
      "id",
      "created_at",
      "name",
      "email",
      "phone",
      "company",
      "source",
      "landing_page",
      "utm_source",
      "utm_campaign",
      "status",
      "assignee",
      "score",
      "score_label",
      "last_interaction",
    ];
    const esc = (v: unknown) =>
      v == null ? "" : `"${String(v).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as any)[c])).join(","))].join("\n");
    downloadFile("leads.csv", csv, "text/csv");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-5 py-10 max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">CRM comercial</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pipeline, distribuição e histórico dos leads.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <button onClick={() => void load()} className="px-3 py-2 rounded-lg border border-border hover:bg-muted">
              {loading ? "..." : "Atualizar"}
            </button>
            <button onClick={() => exportRows("csv")} className="px-3 py-2 rounded-lg border border-border hover:bg-muted">
              Export CSV
            </button>
            <button onClick={() => exportRows("json")} className="px-3 py-2 rounded-lg border border-border hover:bg-muted">
              Export JSON
            </button>
          </div>
        </div>

        {summary && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <SumCard label="Novos" value={summary.novos} />
            <SumCard label="Sem responsável" value={summary.sem_responsavel} accent="warn" />
            <SumCard label="Parados >7d" value={summary.parados} accent="warn" />
            <SumCard label="Fechados" value={summary.fechados} accent="ok" />
            <SumCard label="Perdidos" value={summary.perdidos} />
            <SumCard label="Taxa fechamento" value={`${summary.taxa_fechamento}%`} />
            <SumCard label="Tempo médio" value={`${summary.tempo_medio_dias}d`} />
          </div>
        )}

        <div className="mt-6 flex gap-1 border-b border-border">
          {(["pipeline", "list", "config"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "pipeline" ? "Pipeline" : t === "list" ? "Lista & filtros" : "Configurações"}
            </button>
          ))}
        </div>

        {tab !== "config" && (
          <Filters filters={filters} setFilters={setFilters} onApply={() => void load()} />
        )}

        {tab === "pipeline" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRM_STATUSES.map((s) => (
              <div key={s} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{STATUS_LABEL[s]}</h3>
                  <span className="text-xs text-muted-foreground">{byStatus[s].length}</span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {byStatus[s].map((r) => (
                    <LeadCard key={r.id} row={r} onOpen={() => setSelected(r.id)} />
                  ))}
                  {byStatus[s].length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">vazio</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "list" && (
          <LeadsTable rows={rows} onOpen={setSelected} />
        )}

        {tab === "config" && settings && (
          <ConfigTab settings={settings} onChange={setSettings} onSaved={() => void load()} />
        )}
      </main>
      <Footer />
      {selected && (
        <LeadDrawer
          id={selected}
          assignees={settings?.assignees ?? []}
          onClose={() => setSelected(null)}
          onChanged={() => void load()}
        />
      )}
    </div>
  );
}

function SumCard({ label, value, accent }: { label: string; value: string | number; accent?: "ok" | "warn" }) {
  const tone =
    accent === "warn" ? "text-amber-500" : accent === "ok" ? "text-emerald-500" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
  );
}

function Filters({
  filters,
  setFilters,
  onApply,
}: {
  filters: any;
  setFilters: (f: any) => void;
  onApply: () => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-sm">
      <input
        placeholder="Buscar nome/email/tel"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="col-span-2 px-3 py-2 rounded-lg border border-border bg-background"
      />
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      >
        <option value="">Status</option>
        {CRM_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <input
        placeholder="Responsável"
        value={filters.assignee}
        onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      />
      <input
        placeholder="Origem"
        value={filters.source}
        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      />
      <input
        placeholder="Campanha"
        value={filters.campaign}
        onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      />
      <input
        placeholder="Cidade"
        value={filters.city}
        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      />
      <input
        placeholder="Serviço"
        value={filters.service}
        onChange={(e) => setFilters({ ...filters, service: e.target.value })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      />
      <select
        value={filters.days}
        onChange={(e) => setFilters({ ...filters, days: Number(e.target.value) })}
        className="px-2 py-2 rounded-lg border border-border bg-background"
      >
        {[7, 30, 60, 90, 180, 365].map((d) => (
          <option key={d} value={d}>
            {d}d
          </option>
        ))}
      </select>
      <button onClick={onApply} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">
        Aplicar
      </button>
    </div>
  );
}

function LeadCard({ row, onOpen }: { row: LeadRow; onOpen: () => void }) {
  const scoreColor =
    row.score_label === "alta" ? "bg-emerald-500/15 text-emerald-500" : row.score_label === "media" ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground";
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-primary transition"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-sm truncate">{row.name || "Sem nome"}</div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${scoreColor}`}>{row.score_label}</span>
      </div>
      <div className="text-xs text-muted-foreground truncate mt-1">{row.email || row.phone || "—"}</div>
      <div className="text-[11px] text-muted-foreground mt-1 flex justify-between">
        <span>{row.assignee || "sem resp."}</span>
        <span>{new Date(row.created_at).toLocaleDateString("pt-BR")}</span>
      </div>
    </button>
  );
}

function LeadsTable({ rows, onOpen }: { rows: LeadRow[]; onOpen: (id: string) => void }) {
  return (
    <div className="mt-5 rounded-xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-3 py-2">Data</th>
            <th className="text-left px-3 py-2">Nome</th>
            <th className="text-left px-3 py-2">Contato</th>
            <th className="text-left px-3 py-2">Origem</th>
            <th className="text-left px-3 py-2">Resp.</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onOpen(r.id)} className="border-t border-border hover:bg-muted/30 cursor-pointer">
              <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
              <td className="px-3 py-2">{r.name || "—"}</td>
              <td className="px-3 py-2 text-xs">{r.email || r.phone || "—"}</td>
              <td className="px-3 py-2 text-xs">{r.source || "—"}</td>
              <td className="px-3 py-2 text-xs">{r.assignee || "—"}</td>
              <td className="px-3 py-2 text-xs">{STATUS_LABEL[r.status]}</td>
              <td className="px-3 py-2 text-xs">{r.score} · {r.score_label}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
                Sem leads para os filtros atuais.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ConfigTab({
  settings,
  onChange,
  onSaved,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onSaved: () => void;
}) {
  const [raw, setRaw] = useState(settings.assignees.join("\n"));
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const list = raw.split("\n").map((s) => s.trim()).filter(Boolean);
      await updateCrmSettings({
        data: {
          distribution_mode: settings.distribution_mode,
          assignees: list,
          fixed_assignee: settings.fixed_assignee,
        },
      });
      onChange({ ...settings, assignees: list });
      onSaved();
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-5 max-w-2xl space-y-4">
      <div>
        <label className="text-sm font-medium">Modo de distribuição</label>
        <div className="mt-2 flex gap-2">
          {(["manual", "round_robin", "fixed"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onChange({ ...settings, distribution_mode: m })}
              className={`px-3 py-2 rounded-lg text-sm border ${
                settings.distribution_mode === m ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {m === "manual" ? "Manual" : m === "round_robin" ? "Round-robin" : "Responsável fixo"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Responsáveis (um por linha)</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
        />
      </div>

      {settings.distribution_mode === "fixed" && (
        <div>
          <label className="text-sm font-medium">Responsável fixo</label>
          <input
            value={settings.fixed_assignee ?? ""}
            onChange={(e) => onChange({ ...settings, fixed_assignee: e.target.value || null })}
            className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2">Integrações (preparado)</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>· WhatsApp — link direto via campo telefone do lead</li>
          <li>· Webhook — endpoint /api/public/lead-webhook (stub)</li>
          <li>· Resend — envio transacional via secret RESEND_API_KEY</li>
          <li>· CRM externo — exportação CSV/JSON disponível na barra superior</li>
        </ul>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
      >
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  );
}

function LeadDrawer({
  id,
  assignees,
  onClose,
  onChanged,
}: {
  id: string;
  assignees: string[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = useState<{ lead: any; history: any[] } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await getLeadDetail({ data: { id } });
    setData(r);
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async (patch: any) => {
    setBusy(true);
    try {
      await updateLead({ data: { id, ...patch } });
      await load();
      onChanged();
    } finally {
      setBusy(false);
    }
  };
  const addNote = async (kind: "note" | "contact" | "action") => {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await addLeadHistory({ data: { lead_id: id, kind, note } });
      setNote("");
      await load();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!data && <div className="p-6 text-sm text-muted-foreground">Carregando…</div>}
        {data && (
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold font-display">{data.lead.name || "Sem nome"}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Criado em {new Date(data.lead.created_at).toLocaleString("pt-BR")} · Score {data.lead.score} ({data.lead.score_label})
                </p>
              </div>
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Email" value={data.lead.email} />
              <Info label="Telefone" value={data.lead.phone} />
              <Info label="Empresa" value={data.lead.company} />
              <Info label="Origem" value={data.lead.source} />
              <Info label="UTM source" value={data.lead.utm_source} />
              <Info label="Campanha" value={data.lead.utm_campaign} />
              <Info label="Landing" value={data.lead.landing_page} />
              <Info label="Variant" value={`${data.lead.hero_variant || "—"} / ${data.lead.cta_variant || "—"}`} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <label className="text-xs">
                <span className="text-muted-foreground">Status</span>
                <select
                  value={data.lead.status}
                  onChange={(e) => void save({ status: e.target.value })}
                  disabled={busy}
                  className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {CRM_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                <span className="text-muted-foreground">Responsável</span>
                <select
                  value={data.lead.assignee ?? ""}
                  onChange={(e) => void save({ assignee: e.target.value || null })}
                  disabled={busy}
                  className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">— sem responsável —</option>
                  {assignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                  {data.lead.assignee && !assignees.includes(data.lead.assignee) && (
                    <option value={data.lead.assignee}>{data.lead.assignee}</option>
                  )}
                </select>
              </label>
            </div>

            <div className="mt-3">
              <label className="text-xs text-muted-foreground">Empresa</label>
              <input
                defaultValue={data.lead.company ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (data.lead.company ?? "")) void save({ company: e.target.value || null });
                }}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            <div className="mt-3">
              <label className="text-xs text-muted-foreground">Observações internas</label>
              <textarea
                defaultValue={data.lead.notes ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (data.lead.notes ?? "")) void save({ notes: e.target.value || null });
                }}
                rows={3}
                className="mt-1 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-medium">Registrar interação</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Anote contato, ação ou observação…"
                className="mt-2 w-full px-2 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={() => void addNote("contact")} disabled={busy} className="px-3 py-1.5 rounded-lg border border-border text-xs">
                  + Contato
                </button>
                <button onClick={() => void addNote("action")} disabled={busy} className="px-3 py-1.5 rounded-lg border border-border text-xs">
                  + Ação
                </button>
                <button onClick={() => void addNote("note")} disabled={busy} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs">
                  + Nota
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Histórico</h3>
              <ul className="space-y-2">
                {data.history.map((h: any) => (
                  <li key={h.id} className="text-xs border-l-2 border-border pl-3 py-1">
                    <div className="text-muted-foreground">
                      {new Date(h.created_at).toLocaleString("pt-BR")} · <span className="uppercase">{h.kind}</span> · {h.actor || "—"}
                    </div>
                    {h.from_value || h.to_value ? (
                      <div>
                        {h.from_value || "∅"} → <strong>{h.to_value || "∅"}</strong>
                      </div>
                    ) : null}
                    {h.note && <div className="mt-1">{h.note}</div>}
                  </li>
                ))}
                {data.history.length === 0 && (
                  <li className="text-xs text-muted-foreground">Sem eventos registrados.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm truncate">{value || "—"}</div>
    </div>
  );
}

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
