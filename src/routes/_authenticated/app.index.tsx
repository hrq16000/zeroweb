import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyProjects, listMyTickets, getMyReports } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/")({
  component: AppHome,
});

function AppHome() {
  const fp = useServerFn(listMyProjects);
  const ft = useServerFn(listMyTickets);
  const fr = useServerFn(getMyReports);
  const [projects, setProjects] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [reports, setReports] = useState<any | null>(null);

  useEffect(() => {
    void fp().then((r) => setProjects(r.rows as any[]));
    void ft().then((r) => setTickets(r.rows as any[]));
    void fr().then(setReports);
  }, [fp, ft, fr]);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold font-display">Início</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumo da sua conta.</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Projetos" value={projects.length} link="/app/projects" />
        <Stat label="Em produção" value={projects.filter((p) => p.status === "producao").length} />
        <Stat label="Suporte aberto" value={tickets.filter((t) => !["resolvido", "fechado"].includes(t.status)).length} link="/app/support" />
        <Stat label="Visitas (30d)" value={reports?.visits ?? 0} link="/app/reports" />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium">Projetos recentes</h2>
          <ul className="mt-3 space-y-2">
            {projects.slice(0, 5).map((p) => (
              <li key={p.id} className="text-sm flex justify-between border-b border-border/40 pb-2">
                <Link to="/app/projects/$id" params={{ id: p.id }} className="hover:underline">
                  {p.name}
                </Link>
                <span className="text-xs text-muted-foreground capitalize">{p.status}</span>
              </li>
            ))}
            {projects.length === 0 && <li className="text-xs text-muted-foreground">Nenhum projeto ainda.</li>}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium">Suporte recente</h2>
          <ul className="mt-3 space-y-2">
            {tickets.slice(0, 5).map((t) => (
              <li key={t.id} className="text-sm flex justify-between border-b border-border/40 pb-2">
                <Link to="/app/support/$id" params={{ id: t.id }} className="hover:underline truncate">
                  {t.subject}
                </Link>
                <span className="text-xs text-muted-foreground capitalize">{t.status.replace("_", " ")}</span>
              </li>
            ))}
            {tickets.length === 0 && (
              <li className="text-xs text-muted-foreground">Sem solicitações abertas.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, link }: { label: string; value: number | string; link?: string }) {
  const inner = (
    <div className="rounded-xl border border-border bg-card p-4 h-full">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}
