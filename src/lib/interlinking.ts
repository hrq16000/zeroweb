// Sprint 12 — Sugestão automática de links internos
import { CLUSTERS, CLUSTER_RELATIONS, type Cluster } from "@/lib/content-taxonomy";

export type InternalLink = {
  href: string;
  label: string;
  kind: "hub" | "service" | "article" | "city" | "case";
  weight: number; // ordenação descendente
};

/** Retorna sugestões para um artigo (por categoria/cluster). */
export function suggestLinksForArticle(opts: {
  clusterSlug?: string;
  category?: string;
  city?: string;
  limit?: number;
}): InternalLink[] {
  const limit = opts.limit ?? 8;
  const cluster =
    CLUSTERS.find((c) => c.slug === opts.clusterSlug) ??
    CLUSTERS.find((c) => c.title.toLowerCase() === (opts.category ?? "").toLowerCase());

  const links: InternalLink[] = [];

  if (cluster) {
    links.push({ href: cluster.hubPath, label: `Hub: ${cluster.title}`, kind: "hub", weight: 10 });
    for (const s of cluster.relatedServices) {
      links.push({ href: s, label: `Serviço: ${s.replace("/", "").replace(/-/g, " ")}`, kind: "service", weight: 9 });
    }
    for (const r of CLUSTER_RELATIONS[cluster.slug] ?? []) {
      const rc = CLUSTERS.find((c) => c.slug === r);
      if (rc) links.push({ href: rc.hubPath, label: `Hub relacionado: ${rc.title}`, kind: "hub", weight: 6 });
    }
    if (cluster.relatedCities && opts.city) {
      links.push({
        href: `/cidade/${opts.city}`,
        label: `${cluster.title} em ${opts.city}`,
        kind: "city",
        weight: 7,
      });
    }
  }

  // dedup + sort
  const seen = new Set<string>();
  return links
    .filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

/** Sugestões para uma página de serviço (linka para hubs relevantes). */
export function suggestLinksForService(servicePath: string): InternalLink[] {
  const matches: Cluster[] = CLUSTERS.filter((c) => c.relatedServices.includes(servicePath));
  return matches.map((c, i) => ({
    href: c.hubPath,
    label: `Aprenda mais: ${c.title}`,
    kind: "hub" as const,
    weight: 10 - i,
  }));
}
