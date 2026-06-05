// Sprint 12 — Painel editorial autenticado (/app/editorial)
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getEditorialPlan,
  getCommercialOpportunities,
  getContentMetricsSummary,
} from "@/lib/editorial.functions";
import { CLUSTERS, totalSubclusters, commercialSubclusters } from "@/lib/content-taxonomy";

export const Route = createFileRoute("/_authenticated/app/editorial")({
  head: () => ({ meta: [{ title: "Editorial — 0WEB Painel" }, { name: "robots", content: "noindex" }] }),
  component: EditorialPanel,
});

function EditorialPanel() {
  const [bucket, setBucket] = useState<"top100" | "top300" | "top1000">("top100");
  const planFn = useServerFn(getEditorialPlan);
  const commFn = useServerFn(getCommercialOpportunities);
  const metricsFn = useServerFn(getContentMetricsSummary);

  const plan = useQuery({ queryKey: ["editorial-plan", bucket], queryFn: () => planFn({ data: { bucket } }) });
  const comm = useQuery({ queryKey: ["editorial-commercial"], queryFn: () => commFn() });
  const metrics = useQuery({ queryKey: ["content-metrics"], queryFn: () => metricsFn() });

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Editorial · Autoridade Temática</h1>
        <p className="mt-2 text-muted-foreground">
          {CLUSTERS.length} clusters · {totalSubclusters()} tópicos mapeados · {commercialSubclusters().length} oportunidades comerciais
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Clusters", value: CLUSTERS.length },
          { label: "Tópicos no mapa", value: totalSubclusters() },
          { label: "Oportunidades comerciais", value: comm.data?.total ?? "—" },
          { label: "Métricas registradas", value: metrics.data?.recent?.length ?? 0 },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold">Plano editorial</h2>
          {(["top100", "top300", "top1000"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBucket(b)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                bucket === b ? "bg-foreground text-background" : "bg-muted"
              }`}
            >
              {b.replace("top", "")}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">Título</th>
                <th className="p-3">Cluster</th>
                <th className="p-3">Funil</th>
                <th className="p-3">Intent</th>
                <th className="p-3">Template</th>
                <th className="p-3 text-right">Vol</th>
                <th className="p-3 text-right">CV</th>
              </tr>
            </thead>
            <tbody>
              {(plan.data?.items ?? []).slice(0, 50).map((p) => (
                <tr key={p.slug} className="border-t border-border">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.clusterTitle}</td>
                  <td className="p-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.funnel}</span></td>
                  <td className="p-3 text-xs">{p.intent}</td>
                  <td className="p-3 text-xs">{p.template}</td>
                  <td className="p-3 text-right tabular-nums">{p.estimatedVolume}</td>
                  <td className="p-3 text-right tabular-nums">{p.commercialValue}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Mostrando 50 de {plan.data?.items?.length ?? 0}. Bucket {bucket}.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Clusters monitorados</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLUSTERS.map((c) => {
            const m = metrics.data?.byCluster?.[c.slug];
            return (
              <Link
                key={c.slug}
                to="/blog/cluster/$cluster"
                params={{ cluster: c.slug }}
                className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition"
              >
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{c.subclusters.length} tópicos</p>
                {m ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {m.samples} amostras · {m.clicks} cliques · {m.conversions} conv.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">Sem métricas</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
