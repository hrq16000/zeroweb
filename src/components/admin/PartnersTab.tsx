// Sprint 13 — Aba admin de parceiros
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPartnersAdmin, setPartnerStatus, getPartnerRanking, computePendingCommissions } from "@/lib/partners.functions";
import { Check, Ban, PauseCircle } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  email: string;
  kind: string;
  status: string;
  city: string | null;
  state: string | null;
  created_at: string;
};

type RankingRow = {
  partner_id: string;
  name: string;
  kind: string;
  clicks_30d: number;
  leads_30d: number;
  conversions_30d: number;
  revenue_cents_30d: number;
};

export function PartnersTab() {
  const list = useServerFn(listPartnersAdmin);
  const setStatus = useServerFn(setPartnerStatus);
  const rank = useServerFn(getPartnerRanking);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await list({ data: filter ? { status: filter as "pendente" | "aprovado" | "suspenso" | "bloqueado" } : {} });
    setPartners(r.partners as Partner[]);
    try {
      const k = await rank();
      setRanking(k.ranking as RankingRow[]);
    } catch { /* */ }
    setLoading(false);
  }, [list, rank, filter]);

  useEffect(() => { refresh(); }, [refresh]);

  async function changeStatus(id: string, status: "aprovado" | "suspenso" | "bloqueado") {
    await setStatus({ data: { id, status } });
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Parceiros</h2>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={async () => {
                const r = await computePendingCommissions();
                alert(`Comissões calculadas: ${r.processed} ok, ${r.errors} erros`);
              }}
              className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm"
            >
              Calcular comissões pendentes
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="suspenso">Suspensos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Local</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </td>
                    <td className="p-3">{p.kind}</td>
                    <td className="p-3">{[p.city, p.state].filter(Boolean).join(" / ")}</td>
                    <td className="p-3">{p.status}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => changeStatus(p.id, "aprovado")} className="rounded-md border border-border p-1.5 hover:bg-emerald-500/10" title="Aprovar">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => changeStatus(p.id, "suspenso")} className="rounded-md border border-border p-1.5 hover:bg-amber-500/10" title="Suspender">
                        <PauseCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => changeStatus(p.id, "bloqueado")} className="rounded-md border border-border p-1.5 hover:bg-destructive/10" title="Bloquear">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold">Ranking 30 dias</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Parceiro</th>
                <th className="text-right p-3">Cliques</th>
                <th className="text-right p-3">Leads</th>
                <th className="text-right p-3">Vendas</th>
                <th className="text-right p-3">Receita</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.partner_id} className="border-t border-border">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.kind}</div>
                  </td>
                  <td className="p-3 text-right">{r.clicks_30d}</td>
                  <td className="p-3 text-right">{r.leads_30d}</td>
                  <td className="p-3 text-right">{r.conversions_30d}</td>
                  <td className="p-3 text-right">R$ {(r.revenue_cents_30d / 100).toFixed(2)}</td>
                </tr>
              ))}
              {ranking.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Sem dados nos últimos 30 dias.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
