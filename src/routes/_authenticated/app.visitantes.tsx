import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listVisitors,
  visitorsAggregate,
  exportVisitorsCsv,
  visitorEventsHistogram,
} from "@/lib/visitors.functions";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";


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

const GEO_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

function WorldMap({ countries }: { countries: { key: string; count: number }[] }) {
  const max = Math.max(1, ...countries.map((c) => c.count));
  const byIso = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of countries) m.set((c.key || "").toUpperCase(), c.count);
    return m;
  }, [countries]);
  const colorFor = (v: number) => {
    if (!v) return "hsl(var(--muted))";
    const t = Math.min(1, v / max);
    // primary tint scale
    const a = 0.15 + t * 0.85;
    return `hsl(var(--primary) / ${a.toFixed(2)})`;
  };

  return (
    <div className="w-full">
      <ComposableMap projectionConfig={{ scale: 140 }} height={380} style={{ width: "100%", height: "auto" }}>
        <Sphere id="sphere" stroke="hsl(var(--border))" strokeWidth={0.5} fill="transparent" />
        <Graticule stroke="hsl(var(--border))" strokeWidth={0.3} />
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo: any) => {
              const iso2 = (geo.properties.ISO_A2 || geo.properties.iso_a2 || "").toUpperCase();
              const v = byIso.get(iso2) ?? 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorFor(v)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.3}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "hsl(var(--primary))" },
                    pressed: { outline: "none" },
                  }}
                >
                  <title>{`${geo.properties.name || iso2}: ${v}`}</title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

function VisitorsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [rows, setRows] = useState<any[]>([]);
  const [agg, setAgg] = useState<any>(null);
  const [hist, setHist] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const list = useServerFn(listVisitors);
  const aggregate = useServerFn(visitorsAggregate);
  const histogram = useServerFn(visitorEventsHistogram);
  const exportCsv = useServerFn(exportVisitorsCsv);

  const payload = useMemo(() => ({ ...filters, limit: 500 }), [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const [l, a, h] = await Promise.all([
        list({ data: payload }),
        aggregate({ data: payload }),
        histogram({ data: payload }),
      ]);
      setRows(l.rows ?? []);
      setAgg(a ?? null);
      setHist(h ?? null);
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
          <p className="text-sm text-muted-foreground">
            Funil, origens (UTM/GCLID/FBCLID), histogramas de ataques e distribuição geográfica.
          </p>
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

      {/* Time series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-semibold mb-2">Visitas por dia</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={agg?.series ?? []}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#g1)" name="Total" />
                <Line type="monotone" dataKey="bots" stroke="#f59e0b" name="Bots" dot={false} />
                <Line type="monotone" dataKey="blocked" stroke="#ef4444" name="Bloqueados" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-semibold mb-2">Histograma por hora (eventos crus)</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={(hist?.hours ?? []).slice(-48)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} hide />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" />
                <Bar dataKey="blocked" fill="#ef4444" name="Bloqueados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bars by source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-semibold mb-2">Top origens (utm_source)</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={(agg?.sources ?? []).slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="key" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-semibold mb-2">Motivos de bloqueio</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={hist?.reasons ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="key" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* World map */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Distribuição geográfica</div>
          <div className="text-xs text-muted-foreground">Densidade por país (ISO_A2)</div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WorldMap countries={agg?.countries ?? []} />
          </div>
          <div>
            <div className="text-xs font-semibold mb-2 text-muted-foreground">Top países</div>
            <ul className="text-xs space-y-1">
              {((agg?.countries as any[]) ?? []).slice(0, 15).map((r) => (
                <li key={r.key} className="flex justify-between gap-2">
                  <span className="truncate">{r.key}</span>
                  <span className="font-mono">{r.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["Campanhas", agg?.campaigns],
          ["Portais", agg?.portals],
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
