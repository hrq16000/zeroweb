import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyProjects, PROJECT_STATUSES_LIST } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/projects")({
  component: ProjectsPage,
});

const LABEL: Record<string, string> = {
  recebido: "Recebido",
  planejamento: "Planejamento",
  producao: "Produção",
  revisao: "Revisão",
  publicacao: "Publicação",
  concluido: "Concluído",
};

function ProjectsPage() {
  const fp = useServerFn(listMyProjects);
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    void fp().then((r) => setRows(r.rows as any[]));
  }, [fp]);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold font-display">Projetos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Acompanhe o andamento de cada projeto.</p>

      <div className="mt-6 space-y-3">
        {rows.map((p) => {
          const stepIdx = PROJECT_STATUSES_LIST.indexOf(p.status as never);
          const pct = ((Math.max(0, stepIdx) + 1) / PROJECT_STATUSES_LIST.length) * 100;
          return (
            <Link
              key={p.id}
              to="/app/projects/$id"
              params={{ id: p.id }}
              className="block rounded-xl border border-border bg-card p-5 hover:border-primary transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description || "Sem descrição"}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{LABEL[p.status] || p.status}</span>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Resp.: {p.owner || "—"}</span>
                <span>Previsão: {p.due_date ? new Date(p.due_date).toLocaleDateString("pt-BR") : "—"}</span>
              </div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum projeto associado à sua conta.
          </div>
        )}
      </div>
    </div>
  );
}
