import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProjectDetail, getDocumentSignedUrl, PROJECT_STATUSES_LIST } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/projects/$id")({
  component: ProjectDetail,
});

const LABEL: Record<string, string> = {
  recebido: "Recebido",
  planejamento: "Planejamento",
  producao: "Produção",
  revisao: "Revisão",
  publicacao: "Publicação",
  concluido: "Concluído",
};

function ProjectDetail() {
  const { id } = Route.useParams();
  const fd = useServerFn(getProjectDetail);
  const fs = useServerFn(getDocumentSignedUrl);
  const [data, setData] = useState<{ project: any; documents: any[] } | null>(null);

  useEffect(() => {
    void fd({ data: { id } }).then((r) => setData(r as never));
  }, [fd, id]);

  const open = async (docId: string) => {
    const r = await fs({ data: { id: docId } });
    window.open(r.url, "_blank");
  };

  if (!data) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  const p = data.project;
  const stepIdx = PROJECT_STATUSES_LIST.indexOf(p.status as never);

  return (
    <div className="max-w-5xl">
      <Link to="/app/projects" className="text-xs text-muted-foreground hover:text-foreground">
        ← Projetos
      </Link>
      <h1 className="mt-2 text-3xl font-bold font-display">{p.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{p.description || "—"}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium mb-4">Andamento</h2>
        <ol className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {PROJECT_STATUSES_LIST.map((s, i) => (
            <li
              key={s}
              className={`text-xs text-center py-2 rounded-lg border ${
                i <= stepIdx ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
              }`}
            >
              {LABEL[s]}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <Info label="Responsável" value={p.owner} />
        <Info label="Status" value={LABEL[p.status] || p.status} />
        <Info label="Início" value={p.start_date ? new Date(p.start_date).toLocaleDateString("pt-BR") : "—"} />
        <Info label="Previsão" value={p.due_date ? new Date(p.due_date).toLocaleDateString("pt-BR") : "—"} />
        <Info label="Entregáveis" value={p.deliverables} full />
        <Info label="Observações" value={p.notes} full />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium">Documentos</h2>
        <ul className="mt-3 space-y-2">
          {data.documents.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium">{d.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{d.kind}</div>
              </div>
              <button onClick={() => void open(d.id)} className="text-sm text-primary hover:underline">
                Abrir
              </button>
            </li>
          ))}
          {data.documents.length === 0 && (
            <li className="text-xs text-muted-foreground">Nenhum documento ainda.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: any; full?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${full ? "md:col-span-2" : ""}`}>
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm mt-1 whitespace-pre-wrap">{value || "—"}</div>
    </div>
  );
}
