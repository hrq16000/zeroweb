import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFunnel, resetFunnel, EXPECTED_EVENT_SCHEMA, CONVERSION_EVENTS } from "@/lib/analytics";
import { getAllAssignments, resetAssignments } from "@/lib/ab-testing";

export const Route = createFileRoute("/qa-events")({
  head: () => ({
    meta: [
      { title: "QA · Eventos · 0WEB" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QAEvents,
});

type LogItem = { ts: string; event: string; payload: Record<string, unknown> };

function QAEvents() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [funnel, setFunnel] = useState(getFunnel());
  const [ab, setAb] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setAb(getAllAssignments());
    const dl = (window.dataLayer = window.dataLayer || []);

    // Seed with existing entries
    const seed: LogItem[] = dl
      .filter((e: Record<string, unknown>) => typeof e?.event === "string")
      .map((e: Record<string, unknown>) => ({
        ts: new Date().toISOString(),
        event: String(e.event),
        payload: e,
      }));
    setLogs(seed);

    // Monkey-patch push to capture new events live
    const orig = dl.push.bind(dl);
    dl.push = (...args: Record<string, unknown>[]) => {
      args.forEach((e) => {
        if (e && typeof e.event === "string") {
          setLogs((prev) => [
            { ts: new Date().toISOString(), event: String(e.event), payload: e },
            ...prev,
          ].slice(0, 500));
          setFunnel(getFunnel());
        }
      });
      return orig(...args);
    };

    return () => {
      dl.push = orig;
    };
  }, []);

  const filtered = filter
    ? logs.filter((l) => l.event.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Interno</p>
            <h1 className="text-3xl font-bold">QA de Eventos · dataLayer</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Captura ao vivo todos os <code>dataLayer.push</code> em qualquer rota. Use junto ao GA4 DebugView e GTM Preview.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { resetFunnel(); setFunnel(getFunnel()); }}
              className="rounded-full bg-muted px-4 py-2 text-sm hover:bg-muted/70"
            >
              Reset funil
            </button>
            <button
              onClick={() => { resetAssignments(); setAb({}); }}
              className="rounded-full bg-muted px-4 py-2 text-sm hover:bg-muted/70"
            >
              Reset A/B
            </button>
            <button
              onClick={() => setLogs([])}
              className="rounded-full bg-foreground text-background px-4 py-2 text-sm"
            >
              Limpar logs
            </button>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border p-5">
            <h2 className="font-semibold">Funil acumulado</h2>
            <ul className="mt-3 text-sm space-y-1.5">
              {Object.entries(funnel.totals).length === 0 && (
                <li className="text-muted-foreground">Sem eventos ainda. Interaja com o site.</li>
              )}
              {Object.entries(funnel.totals).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono font-semibold">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-5">
            <h2 className="font-semibold">Atribuição A/B</h2>
            <ul className="mt-3 text-sm space-y-1.5">
              {Object.entries(ab).length === 0 && (
                <li className="text-muted-foreground">Sem experimentos ativos.</li>
              )}
              {Object.entries(ab).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono font-semibold">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-5">
            <h2 className="font-semibold">Checklist GA4 / GTM</h2>
            <ul className="mt-3 text-xs text-muted-foreground space-y-1.5">
              <li>✓ <code>cta_click</code> dispara em todos CTAs</li>
              <li>✓ <code>whatsapp_click</code> marca conversão</li>
              <li>✓ <code>form_submit</code> marca conversão</li>
              <li>✓ <code>scroll_depth</code> em 25/50/75/100</li>
              <li>✓ <code>experiment_view</code> nas variantes A/B</li>
              <li>· Marcar como conversion no GA4 Admin → Events</li>
            </ul>
          </div>
        </div>

        {/* Expected vs Captured comparison */}
        <ExpectedVsCaptured logs={logs} />



        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Stream de eventos ({filtered.length})</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por nome do evento…"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm"
            />
          </div>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
              {filtered.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">
                  Aguardando eventos… Navegue, role a página, clique em um CTA.
                </div>
              )}
              {filtered.map((l, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between gap-4 px-5 py-3 cursor-pointer hover:bg-muted/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {l.ts.slice(11, 19)}
                      </span>
                      <span className="font-mono text-sm font-semibold truncate">{l.event}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {Object.keys(l.payload).length} chaves
                    </span>
                  </summary>
                  <pre className="bg-muted/30 text-xs p-4 overflow-x-auto">
{JSON.stringify(l.payload, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpectedVsCaptured({ logs }: { logs: LogItem[] }) {
  const expected = Object.keys(EXPECTED_EVENT_SCHEMA);
  const seen = new Map<string, LogItem>();
  for (const l of logs) if (!seen.has(l.event)) seen.set(l.event, l);

  return (
    <div className="mt-8 rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold">Esperado vs Capturado</h2>
        <span className="text-xs text-muted-foreground">
          Conferência completa do dataLayer por evento — não altera a captura.
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="text-left">
              <th className="py-2 px-4">Evento</th>
              <th className="py-2 px-4">Conversão GA4?</th>
              <th className="py-2 px-4">Capturado?</th>
              <th className="py-2 px-4">Campos esperados</th>
              <th className="py-2 px-4">Campos faltantes</th>
              <th className="py-2 px-4">Último payload</th>
            </tr>
          </thead>
          <tbody>
            {expected.map((ev) => {
              const fields = EXPECTED_EVENT_SCHEMA[ev];
              const log = seen.get(ev);
              const captured = !!log;
              const present = log ? Object.keys(log.payload) : [];
              const missing = fields.filter((f) => !present.includes(f));
              const isConversion = (CONVERSION_EVENTS as readonly string[]).includes(ev);
              return (
                <tr key={ev} className="border-t border-border align-top">
                  <td className="py-3 px-4 font-mono text-xs font-semibold">{ev}</td>
                  <td className="py-3 px-4">
                    {isConversion ? (
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] px-2 py-0.5 font-semibold">
                        SIM
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">não</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {captured ? (
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] px-2 py-0.5 font-semibold">
                        ✓ ok
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 text-amber-600 text-[11px] px-2 py-0.5 font-semibold">
                        aguardando
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {fields.map((f) => (
                      <code key={f} className="mr-1.5 rounded bg-muted px-1.5 py-0.5">
                        {f}
                      </code>
                    ))}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {missing.length === 0 && captured ? (
                      <span className="text-emerald-600">—</span>
                    ) : (
                      missing.map((f) => (
                        <code
                          key={f}
                          className="mr-1.5 rounded bg-rose-500/10 text-rose-600 px-1.5 py-0.5"
                        >
                          {f}
                        </code>
                      ))
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono max-w-[20rem] truncate">
                    {log ? JSON.stringify(log.payload) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

