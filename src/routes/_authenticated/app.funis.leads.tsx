import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download, RefreshCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listForms, listLeads } from "@/lib/dynamic-funnel-admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/funis/leads")({
  component: LeadsDashboard,
});

type Lead = Awaited<ReturnType<typeof listLeads>>[number];

function LeadsDashboard() {
  const fetchForms = useServerFn(listForms);
  const fetchLeads = useServerFn(listLeads);
  const [forms, setForms] = useState<Awaited<ReturnType<typeof listForms>>>([]);
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ form_id: string; status: string; from: string; to: string; q: string }>({ form_id: "", status: "all", from: "", to: "", q: "" });

  const refresh = async () => {
    setLoading(true);
    try {
      const f: any = { ...filters, limit: 200 };
      if (!f.form_id) delete f.form_id;
      if (!f.from) delete f.from; if (!f.to) delete f.to; if (!f.q) delete f.q;
      setRows(await fetchLeads({ data: f }));
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

      <div className="rounded-2xl border border-border bg-card p-4 grid sm:grid-cols-5 gap-3">
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={filters.form_id} onChange={(e) => setFilters({ ...filters, form_id: e.target.value })}>
          <option value="">Todos os funis</option>
          {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="all">Todos status</option>
          <option value="sent">Alerta enviado</option>
          <option value="failed">Alerta falhou</option>
          <option value="pending">Pendente</option>
          <option value="disabled">Sem alerta</option>
        </select>
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <Input placeholder="Buscar nome/e-mail/telefone" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <div className="sm:col-span-5 flex justify-end">
          <Button size="sm" onClick={refresh}><Filter className="w-4 h-4 mr-2" /> Aplicar</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum lead encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Funil</th><th className="text-left p-3">Contato</th><th className="text-left p-3">Origem</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const m = (r.metadata_json ?? {}) as Record<string, any>;
                const utm = (m.utm ?? {}) as Record<string, string>;
                return (
                  <>
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                      <td className="p-3">{r.form?.name ?? "—"}</td>
                      <td className="p-3">
                        <div className="font-medium">{r.contact_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.contact_email ?? ""} {r.contact_phone ? `· ${r.contact_phone}` : ""}</div>
                      </td>
                      <td className="p-3 text-xs">
                        {utm.utm_source ? <div><span className="text-muted-foreground">utm:</span> {utm.utm_source}/{utm.utm_medium ?? "?"}</div> : null}
                        {m.city ? <div className="text-muted-foreground">{m.city} - {m.region}</div> : null}
                      </td>
                      <td className="p-3"><StatusBadge status={r.whatsapp_alert_status ?? "disabled"} /></td>
                      <td className="p-3 text-right">
                        <button className="text-xs text-primary hover:underline" onClick={() => setOpen(open === r.id ? null : r.id)}>
                          {open === r.id ? "Fechar" : "Detalhes"}
                        </button>
                      </td>
                    </tr>
                    {open === r.id && (
                      <tr className="bg-muted/20"><td colSpan={6} className="p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Respostas</h4>
                            <pre className="text-xs bg-background border border-border rounded p-3 overflow-auto max-h-64">{JSON.stringify(r.answers_json, null, 2)}</pre>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Metadados</h4>
                            <pre className="text-xs bg-background border border-border rounded p-3 overflow-auto max-h-64">{JSON.stringify(r.metadata_json, null, 2)}</pre>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </>
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
