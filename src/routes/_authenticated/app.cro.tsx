import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Activity, RefreshCcw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminListCroEvents, CRO_EVENTS } from "@/lib/cro-events-admin.functions";

export const Route = createFileRoute("/_authenticated/app/cro")({
  head: () => ({
    meta: [
      { title: "CRO · Eventos · Admin 0WEB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CroEventsAdminPage,
});

type EventRow = {
  id: string;
  created_at: string;
  event_name: string;
  page: string | null;
  path: string | null;
  location: string | null;
  device_type: string | null;
  visitor_id: string | null;
  session_id: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  metadata_json: Record<string, unknown> | null;
};

const EVENT_LABEL: Record<string, string> = {
  add_to_cart: "Add ao carrinho",
  cart_open: "Carrinho aberto",
  cart_remove: "Remover do carrinho",
  cart_checkout_click: "Checkout (CTA)",
  whatsapp_click: "WhatsApp clicado",
  checkout_whatsapp_handoff: "Handoff WhatsApp",
  checkout_stripe_start: "Stripe iniciado",
  cta_click: "CTA genérico",
};

const DEVICES = ["", "mobile", "tablet", "desktop"];
const WINDOWS = [
  { days: 1, label: "24h" },
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

function fmtDate(s: string) {
  return new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function CroEventsAdminPage() {
  const fetchList = useServerFn(adminListCroEvents);
  const [event, setEvent] = useState<string>("");
  const [device, setDevice] = useState<string>("");
  const [path, setPath] = useState<string>("");
  const [pathInput, setPathInput] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [windowDays, setWindowDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState<Record<string, number>>({});

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function load() {
    setLoading(true);
    try {
      const r = await fetchList({
        data: {
          page,
          pageSize,
          event: event || undefined,
          device: device || undefined,
          path: path || undefined,
          fromDays: windowDays,
        },
      });
      setRows(r.rows as EventRow[]);
      setTotal(r.total);
      setKpis(r.kpis);
    } catch (e) {
      toast.error("Falha ao carregar eventos", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, event, device, path, windowDays]);

  const topEvents = useMemo(
    () => CRO_EVENTS.slice().sort((a, b) => (kpis[b] ?? 0) - (kpis[a] ?? 0)),
    [kpis],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> CRO · Eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            Auditoria de cliques em CTAs, ações no carrinho e handoff para WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              onClick={() => {
                setWindowDays(w.days);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                windowDays === w.days
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary"
              }`}
            >
              {w.label}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topEvents.slice(0, 8).map((ev) => (
          <button
            key={ev}
            onClick={() => {
              setEvent(event === ev ? "" : ev);
              setPage(1);
            }}
            className={`text-left rounded-xl border p-3 transition ${
              event === ev ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {EVENT_LABEL[ev] ?? ev}
            </div>
            <div className="text-2xl font-bold mt-1">{kpis[ev] ?? 0}</div>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <select
          value={event}
          onChange={(e) => {
            setEvent(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">Todos os eventos</option>
          {CRO_EVENTS.map((ev) => (
            <option key={ev} value={ev}>
              {EVENT_LABEL[ev] ?? ev}
            </option>
          ))}
        </select>
        <select
          value={device}
          onChange={(e) => {
            setDevice(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          {DEVICES.map((d) => (
            <option key={d || "all"} value={d}>
              {d ? d : "Todos os dispositivos"}
            </option>
          ))}
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPath(pathInput.trim());
            setPage(1);
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Filtrar por path (ex: /servicos)"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            className="h-9 w-64"
          />
          <Button type="submit" size="sm" variant="outline">
            Aplicar
          </Button>
          {path && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setPath("");
                setPathInput("");
                setPage(1);
              }}
            >
              Limpar
            </Button>
          )}
        </form>
        <div className="ml-auto text-xs text-muted-foreground">
          {total} evento{total === 1 ? "" : "s"} na janela de {windowDays}d
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Quando</th>
                <th className="px-3 py-2 text-left">Evento</th>
                <th className="px-3 py-2 text-left">Página</th>
                <th className="px-3 py-2 text-left">Local</th>
                <th className="px-3 py-2 text-left">Disp.</th>
                <th className="px-3 py-2 text-left">UTM</th>
                <th className="px-3 py-2 text-left">Visitor</th>
                <th className="px-3 py-2 text-left">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-muted-foreground">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum evento encontrado nesta janela / filtros.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30 align-top">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{fmtDate(r.created_at)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {EVENT_LABEL[r.event_name] ?? r.event_name}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-mono truncate max-w-[220px]" title={r.path ?? ""}>
                        {r.path ?? "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.location ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{r.device_type ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      <div className="truncate max-w-[140px]" title={r.utm_campaign ?? ""}>
                        {r.utm_source ?? "—"}
                        {r.utm_campaign ? ` · ${r.utm_campaign}` : ""}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono text-muted-foreground">
                      {r.visitor_id ? r.visitor_id.slice(0, 8) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-primary hover:underline">ver</summary>
                        <pre className="mt-1 p-2 rounded bg-muted text-[11px] overflow-x-auto max-w-[320px]">
                          {JSON.stringify(r.metadata_json ?? {}, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
