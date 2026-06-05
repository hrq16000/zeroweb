import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyDocuments, getDocumentSignedUrl } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const fd = useServerFn(listMyDocuments);
  const fs = useServerFn(getDocumentSignedUrl);
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    void fd().then((r) => setRows(r.rows as any[]));
  }, [fd]);

  const groups: Record<string, any[]> = {};
  for (const d of rows.filter((r) => !filter || r.title.toLowerCase().includes(filter.toLowerCase()))) {
    const k = d.projects?.name || "Sem projeto";
    (groups[k] = groups[k] ?? []).push(d);
  }

  const open = async (id: string) => {
    const r = await fs({ data: { id } });
    window.open(r.url, "_blank");
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold font-display">Documentos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Propostas, contratos, briefings, relatórios e arquivos.</p>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Buscar"
        className="mt-5 w-full md:w-80 px-4 py-2 rounded-xl border border-border bg-background text-sm"
      />

      <div className="mt-6 space-y-6">
        {Object.entries(groups).map(([project, docs]) => (
          <section key={project}>
            <h3 className="text-sm font-medium text-muted-foreground">{project}</h3>
            <ul className="mt-2 space-y-2">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {d.kind} · {new Date(d.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <button onClick={() => void open(d.id)} className="text-sm text-primary hover:underline">
                    Abrir
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum documento disponível.
          </div>
        )}
      </div>
    </div>
  );
}
