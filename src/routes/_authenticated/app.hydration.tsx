import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminHydrationTelemetry } from "@/lib/hydration-telemetry.functions";

export const Route = createFileRoute("/_authenticated/app/hydration")({
  component: HydrationDashboard,
});

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function HydrationDashboard() {
  const fetchSnapshot = useServerFn(adminHydrationTelemetry);
  const snapshot = useQuery({
    queryKey: ["admin", "hydration-telemetry"],
    queryFn: () => fetchSnapshot({ data: undefined }),
    refetchInterval: 30_000,
  });

  const data = snapshot.data;
  const routes = data?.routes ?? [];
  const max = Math.max(1, ...routes.map((r) => r.total));

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Telemetria de hidratação</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Rotas que chegaram ao navegador sem o payload de SSR, com taxa de fallback
            client-only e agrupamento por correlação.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void snapshot.refetch()}>
            Atualizar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!data}
            onClick={() =>
              data &&
              download(
                `hydration-${stamp}.json`,
                JSON.stringify(data, null, 2),
                "application/json",
              )
            }
          >
            Baixar JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!data}
            onClick={() => {
              if (!data) return;
              const csv = [
                "rota,total,client_only,sem_payload,ultima_ocorrencia,ultima_correlacao",
                ...routes.map((r) =>
                  [
                    r.route,
                    r.total,
                    r.clientOnlyFallbacks,
                    r.missingPayload,
                    r.lastSeen,
                    r.lastCorrelationId,
                  ].join(","),
                ),
              ].join("\n");
              download(`hydration-${stamp}.csv`, csv, "text/csv");
            }}
          >
            Baixar CSV
          </Button>
        </div>
      </header>

      {snapshot.isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {snapshot.isError && (
        <p className="text-sm text-destructive">
          {(snapshot.error as Error)?.message ?? "Falha ao carregar telemetria."}
        </p>
      )}

      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Relatórios", value: data.totalReports },
              { label: "Fallbacks client-only", value: data.totalClientOnlyFallbacks },
              { label: "Taxa de fallback", value: `${(data.fallbackRate * 100).toFixed(1)}%` },
              { label: "Rotas afetadas", value: data.routesTracked },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Por rota</h2>
            {routes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma falha registrada neste processo do servidor.
              </p>
            )}
            <div className="space-y-2">
              {routes.map((r) => (
                <div key={r.route} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm">{r.route}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.total} evento(s) · {r.clientOnlyFallbacks} client-only ·{" "}
                      {r.missingPayload} sem payload
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${Math.round((r.total / max) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(r.reasons).map(([reason, count]) => (
                      <Badge key={reason} variant="outline" className="text-[11px]">
                        {reason} · {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Por correlação</h2>
            <div className="space-y-2">
              {data.correlations.map((c) => (
                <div
                  key={c.correlationId}
                  className="rounded-lg border border-border p-3 text-sm space-y-1"
                >
                  <p className="font-mono text-xs">{c.correlationId}</p>
                  <p className="text-muted-foreground text-xs">
                    {c.events} evento(s) · {c.routes.join(", ")} · {c.reasons.join(", ")}
                  </p>
                  <p className="text-muted-foreground text-xs">último: {c.lastSeen}</p>
                </div>
              ))}
              {data.correlations.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem correlações registradas.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
