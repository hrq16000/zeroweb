import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listVisitors, visitorsAggregate, exportVisitorsCsv } from "@/lib/visitors.functions";

export const Route = createFileRoute("/_authenticated/app/visitantes")({
  component: VisitorsPage,
});

type Filters = {
  from?: string | null;
  to?: string | null;
  portal_id?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  country?: string | null;
  only_blocked?: boolean;
  only_bots?: boolean;
};

function VisitorsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [rows, setRows] = useState<any[]>([]);
  const [agg, setAgg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const list = useServerFn(listVisitors);
  const aggregate = useServerFn(visitorsAggregate);
  const exportCsv = useServerFn(exportVisitorsCsv);

  const payload = useMemo(() => ({ ...filters, limit: 500 }), [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const [l, a] = await Promise.all([
        list({ data: payload }),
        aggregate({ data: payload }),
      ]);
      setRows(l.rows ?? []);
      setAgg(a ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExport = async () => {
    const res = await exportCsv({ data: payload });
    if (!res.csv) return;
    const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitantes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const set = (k: keyof Filters) => (e: any) => {
    const v = e?.target?.type === "checkbox" ? e.target.checked : e?.target?.value || null;
    setFilters((f) => ({ ...f, [k]: v }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Visitantes</h1>
          <p className="text-sm text-muted-foreground">Funil, origens (UTM/GCLID/FBCLID) e distribuição por portal.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted">
            {loading ? "Carregando..." : "Atualizar"}
          </button>
          <button onClick={() => void onExport()} className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 p-4 rounded-xl border border-border bg-card">
        <input type="date" value={filters.from ?? ""} onChange={set("from")} className="px-2 py-1.5 text-sm rounded border border-border bg-background" />
        <input type="date" value={filters.to ?? ""} onChange={set("to")} className="px-2 py-1.5 text-sm rounded border border-border bg-background" />
        <input placeholder="portal_id" value={filters.portal_id ?? ""} onChange={set("portal_id")} className="px-2 py-1.5 text-sm rounded border border-border bg-background" />
        <input placeholder="utm_source" value={filters.utm_source ?? ""} onChange={set("utm_source")} className="px-2 py-1.5 text-sm rounded border border-border bg-background" />
        <input placeholder="utm_campaign" value={filters.utm_campaign ?? ""} onChange={set("utm_campaign")} className="px-2 py-1.5 text-sm rounded border border-border bg-background" />
        <input placeholder="country" value={filters.country ?? ""} onChange={set("country")} className="px-2 py-1.5 text-sm rounded border border-border bg-background" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!filters.only_blocked} onChange={set("only_blocked")} /> Bloqueados</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!filters.only_bots} onChange={set("only_bots")} /> Bots</label>
      </div>

      {agg?.funnel && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            ["Total", agg.funnel.total],
            ["Humanos", agg.funnel.humans],
            ["Bots", agg.funnel.bots],
            ["Bloqueados", agg.funnel.blocked],
            ["UTM", agg.funnel.with_utm],
            ["GCLID", agg.funnel.with_gclid],
            ["FBCLID", agg.funnel.with_fbclid],
          ].map(([l, v]) => (
            <div key={l as string} className="p-4 rounded-xl border border-border bg-card">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-bold mt-1">{v as number}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["Origens (utm_source)", agg?.sources],
          ["Campanhas", agg?.campaigns],
          ["Portais", agg?.portals],
          ["Países", agg?.countries],
          ["Landing pages", agg?.landing],
        ].map(([title, list]) => (
          <div key={title as string} className="p-4 rounded-xl border border-border bg-card">
            <div className="text-sm font-semibold mb-2">{title as string}</div>
            <ul className="text-xs space-y-1">
              {(list as any[] | undefined)?.slice(0, 10).map((r) => (
                <li key={r.key} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">{r.key}</span>
                  <span className="font-mono">{r.count}</span>
                </li>
              )) || <li className="text-muted-foreground">—</li>}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 text-sm font-semibold border-b border-border">Últimas visitas ({rows.length})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-left">
                {["Data","Portal","País","Device","Path","UTM","GCLID","Bot","Blocked","Motivo"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-1.5">{new Date(r.created_at).toLocaleString("pt-BR", { timeZone: "UTC" })}</td>
                  <td className="px-3 py-1.5 font-mono truncate max-w-[120px]">{r.portal_id?.slice(0, 8) || "—"}</td>
                  <td className="px-3 py-1.5">{r.country || "—"}</td>
                  <td className="px-3 py-1.5">{r.ua_device || "—"}</td>
                  <td className="px-3 py-1.5 truncate max-w-[200px]">{r.path}</td>
                  <td className="px-3 py-1.5 truncate max-w-[120px]">{r.utm_source || "—"}</td>
                  <td className="px-3 py-1.5">{r.gclid ? "✓" : ""}</td>
                  <td className="px-3 py-1.5">{r.is_bot ? "🤖" : ""}</td>
                  <td className="px-3 py-1.5">{r.blocked ? "🚫" : ""}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{r.block_reason || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
