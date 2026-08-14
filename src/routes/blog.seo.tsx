// Sprint 12 — Hub dedicado /blog/seo
import { createFileRoute, notFound } from "@tanstack/react-router";
import { HubPage, buildHubHead } from "@/components/site/HubPage";
import { findCluster } from "@/lib/content-taxonomy";

const CLUSTER_SLUG = "seo";

export const Route = createFileRoute("/blog/seo")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = Number(search.page);
    const page = Number.isFinite(raw) && raw > 1 ? Math.floor(raw) : 1;
    return page > 1 ? { page } : {};
  },
  loader: () => {
    const cluster = findCluster(CLUSTER_SLUG);
    if (!cluster) throw notFound();
    return { cluster };
  },
  head: ({ loaderData, match }) =>
    loaderData
      ? buildHubHead(loaderData.cluster, (match.search as { page?: number }).page ?? 1)
      : { meta: [{ title: "Hub" }] },
  component: HubRoute,
});

function HubRoute() {
  const { cluster } = Route.useLoaderData();
  const { page } = Route.useSearch();
  return <HubPage cluster={cluster} page={page ?? 1} />;
}
