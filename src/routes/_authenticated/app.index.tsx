import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Shield, Briefcase, Users, BarChart3, PlusCircle, ArrowRight } from "lucide-react";
import {
  listMyProjects,
  listMyTickets,
  getMyReports,
  getMyProfile,
} from "@/lib/clientarea.functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export const Route = createFileRoute("/_authenticated/app/")({
  component: AppHome,
});

function AppHome() {
  const fp = useServerFn(listMyProjects);
  const ft = useServerFn(listMyTickets);
  const fr = useServerFn(getMyReports);
  const fme = useServerFn(getMyProfile);
  const [projects, setProjects] = useState<Row[]>([]);
  const [tickets, setTickets] = useState<Row[]>([]);
  const [reports, setReports] = useState<Row | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    void fp().then((r) => setProjects(r.rows as Row[])).catch(() => setProjects([]));
    void ft().then((r) => setTickets(r.rows as Row[])).catch(() => setTickets([]));
    void fr().then(setReports).catch(() => setReports(null));
    void fme().then((r) => setRoles(r.roles ?? [])).catch(() => setRoles([]));
  }, [fp, ft, fr, fme]);

  const isAdmin = roles.includes("admin") || roles.includes("dev");
  const openTickets = tickets.filter((t) => !["resolvido", "fechado"].includes(t.status)).length;

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold font-display">Início</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isAdmin ? "Visão geral administrativa." : "Resumo da sua conta."}
      </p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={isAdmin ? "Projetos (todos)" : "Projetos"} value={projects.length} link="/app/projects" />
        <Stat label="Em produção" value={projects.filter((p) => p.status === "producao").length} link="/app/projects" />
        <Stat label="Suporte aberto" value={openTickets} link="/app/support" />
        <Stat label="Visitas (30d)" value={reports?.visits ?? 0} link="/app/reports" />
      </div>

      {isAdmin && (
        <section className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-base">Painel administrativo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atalhos rápidos para as áreas de gestão. {projects.length === 0 && "Comece criando o primeiro projeto."}
              </p>
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                <AdminLink to="/app/admin" icon={Users} label="Clientes & usuários" />
                <AdminLink to="/app/servicos" icon={Briefcase} label="Catálogo de serviços" />
                <AdminLink to="/app/master" icon={BarChart3} label="Dashboard Master" />
                <AdminLink to="/app/projects" icon={PlusCircle} label="Novo projeto" />
                <AdminLink to="/app/seo-404s" icon={ArrowRight} label="404s / Redirects" />
                <AdminLink to="/app/indexacao" icon={ArrowRight} label="Indexação SEO" />
              </div>
            </div>
          </div>
        </section>
      )}

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
                <span className="text-xs text-muted-foreground capitalize">{String(t.status).replace("_", " ")}</span>
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

function AdminLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
