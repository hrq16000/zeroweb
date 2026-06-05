// Sprint 12 — Hub dedicado /blog/marketing-local
import { createFileRoute, notFound } from "@tanstack/react-router";
import { HubPage, buildHubHead } from "@/components/site/HubPage";
import { findCluster } from "@/lib/content-taxonomy";

const CLUSTER_SLUG = "marketing-local";

export const Route = createFileRoute("/blog/marketing-local")({
  loader: () => {
    const cluster = findCluster(CLUSTER_SLUG);
    if (!cluster) throw notFound();
    return { cluster };
  },
  head: ({ loaderData }) => (loaderData ? buildHubHead(loaderData.cluster) : { meta: [{ title: "Hub" }] }),
  component: HubRoute,
});

function HubRoute() {
  const { cluster } = Route.useLoaderData();
  return <HubPage cluster={cluster} />;
}
