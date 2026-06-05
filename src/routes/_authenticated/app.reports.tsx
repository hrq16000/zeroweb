import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyReports } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const f = useServerFn(getMyReports);
  const [r, setR] = useState<any | null>(null);
  useEffect(() => {
    void f().then(setR);
  }, [f]);
  if (!r) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const cards = [
    { label: "Visitas (30d)", value: r.visits },
    { label: "Cliques em CTA", value: r.cta_clicks },
    { label: "Cliques WhatsApp", value: r.wa_clicks },
    { label: "Leads gerados", value: r.leads },
    { label: "Conversões", value: r.conversoes },
    { label: "Projetos ativos", value: (r.projects ?? []).filter((p: any) => p.status !== "concluido").length },
  ];
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold font-display">Relatórios</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumo dos últimos 30 dias.</p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="text-lg font-medium">Projetos</h2>
        <ul className="mt-3 space-y-2">
          {(r.projects ?? []).map((p: any) => (
            <li key={p.id} className="text-sm flex justify-between border border-border rounded-lg bg-card px-4 py-3">
              <span>{p.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{p.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
