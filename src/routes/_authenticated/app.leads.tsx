import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listUnifiedLeads, type UnifiedLead } from "@/lib/unified-leads.functions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Inbox, Filter, ShoppingCart, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const fetchLeads = useServerFn(listUnifiedLeads);
  const [origem, setOrigem] = useState<"all" | "carrinho" | "funil">("all");
  const [etapa, setEtapa] = useState<string>("all");
  const [open, setOpen] = useState<UnifiedLead | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["unified-leads", origem, etapa],
    queryFn: () => fetchLeads({ data: { origem, etapa } }),
  });

  const leads = data?.leads ?? [];
  const etapas = data?.etapas ?? [];

  const stats = useMemo(() => {
    const total = leads.length;
    const carrinho = leads.filter((l) => l.origem === "carrinho").length;
    const funil = leads.filter((l) => l.origem === "funil").length;
    return { total, carrinho, funil };
  }, [leads]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" /> Leads Unificados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Carrinho + funis dinâmicos em uma única tabela. Clique num lead para ver os dados completos.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted"
        >
          Atualizar
        </button>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Total" value={stats.total} />
        <Stat label="Carrinho" value={stats.carrinho} icon={<ShoppingCart className="w-4 h-4" />} />
        <Stat label="Funis" value={stats.funil} icon={<ClipboardList className="w-4 h-4" />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={origem}
          onChange={(e) => setOrigem(e.target.value as any)}
          className="text-sm rounded-lg border border-border bg-background px-3 py-2"
        >
          <option value="all">Todas as origens</option>
          <option value="carrinho">Carrinho</option>
          <option value="funil">Funis dinâmicos</option>
        </select>
        <select
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
          className="text-sm rounded-lg border border-border bg-background px-3 py-2"
        >
          <option value="all">Todas as etapas</option>
          {etapas.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Origem</th>
              <th className="text-left px-4 py-3">Etapa</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Atualizado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && leads.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum lead encontrado para os filtros atuais.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={`${l.origem}-${l.id_lead}`} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{l.nome}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      l.origem === "carrinho"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {l.origem === "carrinho" ? <ShoppingCart className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                    {l.origem}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {l.etapa_atual}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {new Date(l.updated_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setOpen(l)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{open?.nome}</SheetTitle>
          </SheetHeader>
          {open && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Origem" value={open.origem} />
                <Field label="Etapa" value={open.etapa_atual} />
                <Field label="Criado" value={new Date(open.created_at).toLocaleString("pt-BR")} />
                <Field label="Atualizado" value={new Date(open.updated_at).toLocaleString("pt-BR")} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Dados extras</p>
                <pre className="bg-muted/40 rounded-lg p-3 text-xs overflow-auto max-h-[60vh]">
                  {JSON.stringify(open.dados_extras, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}
