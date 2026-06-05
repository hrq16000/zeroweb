// Sprint 12 — Hub dedicado /blog/seo
import { createFileRoute, notFound } from "@tanstack/react-router";
import { HubPage, buildHubHead } from "@/components/site/HubPage";
import { findCluster } from "@/lib/content-taxonomy";

const CLUSTER_SLUG = "seo";

export const Route = createFileRoute("/blog/seo")({
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
