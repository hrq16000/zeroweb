/**
 * Agregador em memória de falhas de hidratação, por rota.
 *
 * Objetivo: responder rápido "quais rotas chegaram ao cliente sem
 * `window.$_TSR.router`?" sem depender de banco. O estado vive no processo
 * do worker/servidor e é consumido pelo painel admin `/app/hydration`.
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

export type RouteStats = {
  route: string;
  total: number;
  clientOnlyFallbacks: number;
  missingPayload: number;
  reasons: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  lastCorrelationId: string;
};

export type CorrelationGroup = {
  correlationId: string;
  events: number;
  routes: string[];
  reasons: string[];
  firstSeen: string;
  lastSeen: string;
};

const MAX_ROUTES = 200;
const MAX_CORRELATIONS = 300;
const MAX_RECENT = 100;

const stats = new Map<string, RouteStats>();
const correlations = new Map<string, CorrelationGroup>();
const recent: Array<HydrationReport & { at: string }> = [];
let totalReports = 0;
const startedAt = new Date().toISOString();

function evictOldest<T extends { lastSeen: string }>(map: Map<string, T>, max: number) {
  if (map.size < max) return;
  let oldestKey: string | null = null;
  let oldest = "";
  for (const [k, v] of map) {
    if (!oldest || v.lastSeen < oldest) {
      oldest = v.lastSeen;
      oldestKey = k;
    }
  }
  if (oldestKey) map.delete(oldestKey);
}

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

  if (!existing) evictOldest(stats, MAX_ROUTES);
  stats.set(route, entry);

  // Agrupamento por correlationId (rastro de uma sessão/carregamento).
  const cid = report.correlationId || "sem-correlacao";
  const group = correlations.get(cid) ?? {
    correlationId: cid,
    events: 0,
    routes: [],
    reasons: [],
    firstSeen: now,
    lastSeen: now,
  };
  group.events += 1;
  group.lastSeen = now;
  if (!group.routes.includes(route)) group.routes.push(route);
  if (!group.reasons.includes(report.reason)) group.reasons.push(report.reason);
  if (!correlations.has(cid)) evictOldest(correlations, MAX_CORRELATIONS);
  correlations.set(cid, group);

  recent.unshift({ ...report, at: now });
  if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;

  totalReports += 1;
  return entry;
}

export function hydrationTelemetrySnapshot() {
  const routes = [...stats.values()].sort((a, b) => b.total - a.total);
  const totalFallbacks = routes.reduce((acc, r) => acc + r.clientOnlyFallbacks, 0);
  return {
    startedAt,
    generatedAt: new Date().toISOString(),
    totalReports,
    totalClientOnlyFallbacks: totalFallbacks,
    fallbackRate: totalReports ? Number((totalFallbacks / totalReports).toFixed(4)) : 0,
    routesTracked: routes.length,
    routes,
    correlations: [...correlations.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)),
    recent: [...recent],
  };
}

export type HydrationSnapshot = ReturnType<typeof hydrationTelemetrySnapshot>;
