/**
 * Agregador em memória de falhas de hidratação, por rota.
 *
 * Objetivo: responder rápido "quais rotas chegaram ao cliente sem
 * `window.$_TSR.router`?" sem depender de banco. O estado vive no processo
 * do worker/servidor e é exposto em GET /api/public/hydration-report.
 */

export type HydrationReport = {
  reason: string;
  detail: string;
  path: string;
  search: string;
  mode: "hydrate" | "client-only";
  ua: string;
  correlationId: string;
};

type RouteStats = {
  route: string;
  total: number;
  clientOnlyFallbacks: number;
  missingPayload: number;
  reasons: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  lastCorrelationId: string;
};

const MAX_ROUTES = 200;
const stats = new Map<string, RouteStats>();
let totalReports = 0;
const startedAt = new Date().toISOString();

export function recordHydrationReport(report: HydrationReport): RouteStats {
  const route = report.path || "/";
  const now = new Date().toISOString();
  const existing = stats.get(route);

  const entry: RouteStats = existing ?? {
    route,
    total: 0,
    clientOnlyFallbacks: 0,
    missingPayload: 0,
    reasons: {},
    firstSeen: now,
    lastSeen: now,
    lastCorrelationId: report.correlationId,
  };

  entry.total += 1;
  entry.lastSeen = now;
  entry.lastCorrelationId = report.correlationId;
  entry.reasons[report.reason] = (entry.reasons[report.reason] ?? 0) + 1;
  if (report.mode === "client-only") entry.clientOnlyFallbacks += 1;
  if (report.reason.includes("missing_router_payload")) entry.missingPayload += 1;

  if (!existing && stats.size >= MAX_ROUTES) {
    // Evita crescimento ilimitado: descarta a rota mais antiga.
    const oldest = [...stats.values()].sort((a, b) => a.lastSeen.localeCompare(b.lastSeen))[0];
    if (oldest) stats.delete(oldest.route);
  }
  stats.set(route, entry);
  totalReports += 1;

  return entry;
}

export function hydrationTelemetrySnapshot() {
  const routes = [...stats.values()].sort((a, b) => b.total - a.total);
  return {
    startedAt,
    totalReports,
    routesTracked: routes.length,
    routes,
  };
}
