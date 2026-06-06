import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download, RefreshCcw, Filter, Flame, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listForms, listLeads, updateLeadStage, bulkUpdateLeads } from "@/lib/dynamic-funnel-admin.functions";
import { toast } from "sonner";

const STAGES = [
  { v: "novo", label: "Novo", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  { v: "contatado", label: "Contatado", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  { v: "qualificado", label: "Qualificado", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  { v: "ganho", label: "Ganho", cls: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-semibold" },
  { v: "perdido", label: "Perdido", cls: "bg-destructive/15 text-destructive" },
] as const;
type Stage = typeof STAGES[number]["v"];

export const Route = createFileRoute("/_authenticated/app/funis/leads")({
  component: LeadsDashboard,
});

type Lead = Awaited<ReturnType<typeof listLeads>>[number];

function LeadsDashboard() {
  const fetchForms = useServerFn(listForms);
  const fetchLeads = useServerFn(listLeads);
  const setStage = useServerFn(updateLeadStage);
  const bulkUpdate = useServerFn(bulkUpdateLeads);
  const [forms, setForms] = useState<Awaited<ReturnType<typeof listForms>>>([]);
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{ form_id: string; status: string; stage: string; from: string; to: string; q: string }>({ form_id: "", status: "all", stage: "", from: "", to: "", q: "" });

  const refresh = async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const f: any = { ...filters, limit: 200 };
      if (!f.form_id) delete f.form_id;
      if (!f.from) delete f.from; if (!f.to) delete f.to; if (!f.q) delete f.q; delete f.stage;
      let data = await fetchLeads({ data: f });
      if (filters.stage) data = data.filter((r: any) => r.pipeline_stage === filters.stage);
      setRows(data);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void fetchForms().then(setForms); /* eslint-disable-next-line */ }, []);
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const stats = useMemo(() => ({
    total: rows.length,
    sent: rows.filter((r) => r.whatsapp_alert_status === "sent").length,
    failed: rows.filter((r) => r.whatsapp_alert_status === "failed").length,
  }), [rows]);

  const exportCsv = () => {
    if (rows.length === 0) { toast.error("Nada para exportar"); return; }
    const headers = ["id","data","funil","nome","email","telefone","status","cidade","estado","pais","utm_source","utm_medium","utm_campaign","page_url","referrer","respostas"];
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    for (const r of rows) {
      const m = (r.metadata_json ?? {}) as Record<string, any>;
      const utm = (m.utm ?? {}) as Record<string, string>;
      lines.push([
        r.id, r.created_at, r.form?.name ?? r.form_id,
        r.contact_name ?? "", r.contact_email ?? "", r.contact_phone ?? "",
        r.whatsapp_alert_status ?? "", m.city ?? "", m.region ?? "", m.country ?? "",
        utm.utm_source ?? "", utm.utm_medium ?? "", utm.utm_campaign ?? "",
        m.page_url ?? "", m.referrer ?? "",
        JSON.stringify(r.answers_json ?? {}),
      ].map(escape).join(","));
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-funis-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/app/funis" className="p-2 rounded hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold font-display">Leads dos funis</h1>
            <p className="text-xs text-muted-foreground">{stats.total} resultados · {stats.sent} alertas enviados · {stats.failed} falhas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}><RefreshCcw className="w-4 h-4 mr-2" /> Atualizar</Button>
          <Button onClick={exportCsv}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 grid sm:grid-cols-6 gap-3">
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={filters.form_id} onChange={(e) => setFilters({ ...filters, form_id: e.target.value })}>
          <option value="">Todos os funis</option>
          {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
          <option value="">Todos estágios</option>
          {STAGES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="all">Todos status WA</option>
          <option value="sent">Alerta enviado</option>
          <option value="failed">Alerta falhou</option>
          <option value="pending">Pendente</option>
          <option value="disabled">Sem alerta</option>
        </select>
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <Input placeholder="Buscar nome/e-mail/telefone" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <div className="sm:col-span-6 flex justify-end">
          <Button size="sm" onClick={refresh}><Filter className="w-4 h-4 mr-2" /> Aplicar</Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">{selected.size} selecionado(s)</span>
          <select className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            onChange={async (e) => {
              const stage = e.target.value as Stage;
              if (!stage) return;
              try { await bulkUpdate({ data: { ids: Array.from(selected), stage } }); toast.success("Estágio atualizado"); refresh(); }
              catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
              e.target.value = "";
            }}>
            <option value="">Mover para estágio…</option>
            {STAGES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpar seleção</Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum lead encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3 w-8">
                  <input type="checkbox" aria-label="Selecionar todos"
                    checked={selected.size === rows.length && rows.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} />
                </th>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Contato</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Tags</th>
                <th className="text-left p-3">Estágio</th>
                <th className="text-left p-3">WA</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const m = (r.metadata_json ?? {}) as Record<string, any>;
                const utm = (m.utm ?? {}) as Record<string, string>;
                const intent = (r.intent_level ?? "cold") as "cold" | "warm" | "hot";
                const intentCls = intent === "hot" ? "text-red-600 dark:text-red-400" : intent === "warm" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";
                return (
                  <Fragment key={r.id}>
                    <tr className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <input type="checkbox" aria-label={`Selecionar ${r.contact_name ?? r.id}`}
                          checked={selected.has(r.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(r.id); else next.delete(r.id);
                            setSelected(next);
                          }} />
                      </td>
                      <td className="p-3 whitespace-nowrap text-xs">
                        <div>{new Date(r.created_at).toLocaleDateString("pt-BR")}</div>
                        <div className="text-muted-foreground">{r.form?.name ?? "—"}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{r.contact_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.contact_email ?? ""} {r.contact_phone ? `· ${r.contact_phone}` : ""}</div>
                      </td>
                      <td className="p-3">
                        <div className={`inline-flex items-center gap-1 font-bold ${intentCls}`}>
                          {intent === "hot" && <Flame className="w-3.5 h-3.5" />}
                          {r.score ?? 0}
                        </div>
                        <div className="text-[10px] uppercase text-muted-foreground">{intent}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(r.tags ?? []).filter((t: string) => !t.startsWith("intent:")).slice(0, 3).map((t: string) => (
                            <span key={t} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted">
                              <Tag className="w-2.5 h-2.5" />{t}
                            </span>
                          ))}
                          {(r.tags ?? []).length > 3 && <span className="text-[10px] text-muted-foreground">+{r.tags.length - 3}</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <select className="h-7 rounded border border-input bg-transparent text-xs px-1"
                          value={r.pipeline_stage ?? "novo"}
                          onChange={async (e) => {
                            try { await setStage({ data: { id: r.id, stage: e.target.value as Stage } }); refresh(); }
                            catch (err) { toast.error(err instanceof Error ? err.message : "Erro"); }
                          }}>
                          {STAGES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="p-3"><StatusBadge status={r.whatsapp_alert_status ?? "disabled"} /></td>
                      <td className="p-3 text-right">
                        <button className="text-xs text-primary hover:underline" onClick={() => setOpen(open === r.id ? null : r.id)}>
                          {open === r.id ? "Fechar" : "Detalhes"}
                        </button>
                      </td>
                    </tr>
                    {open === r.id && (
                      <tr className="bg-muted/20"><td colSpan={8} className="p-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Respostas</h4>
                            <pre className="text-xs bg-background border border-border rounded p-3 overflow-auto max-h-64">{JSON.stringify(r.answers_json, null, 2)}</pre>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Metadados</h4>
                            <pre className="text-xs bg-background border border-border rounded p-3 overflow-auto max-h-64">{JSON.stringify(r.metadata_json, null, 2)}</pre>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Score breakdown</h4>
                            <pre className="text-xs bg-background border border-border rounded p-3 overflow-auto max-h-64">{JSON.stringify(r.score_breakdown ?? {}, null, 2)}</pre>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {utm.utm_source && <div>UTM: {utm.utm_source}/{utm.utm_medium ?? "?"}</div>}
                              {m.city && <div>{m.city} - {m.region}</div>}
                            </div>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    failed: "bg-destructive/15 text-destructive",
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    disabled: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? ""}`}>{status}</span>;
}
