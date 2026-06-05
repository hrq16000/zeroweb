// Sprint 13 — Painel do parceiro (self-service)
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { getMyPartner, createPartnerLink, listPartnerMaterials } from "@/lib/partners.functions";
import { Copy, Plus, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/parceiro")({
  head: () => ({ meta: [{ title: "Painel do Parceiro · 0WEB" }] }),
  component: PartnerDashboard,
});

type Link = { id: string; code: string; label: string | null; target_path: string; campaign: string | null };
type Partner = { id: string; name: string; kind: string; status: string; email: string };
type Material = { id: string; title: string; kind: string; url: string; description: string | null };

function PartnerDashboard() {
  const getMine = useServerFn(getMyPartner);
  const newLink = useServerFn(createPartnerLink);
  const getMats = useServerFn(listPartnerMaterials);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [metrics, setMetrics] = useState<{ clicks_30d: number; leads_30d: number; sales_30d: number; revenue_cents_30d: number } | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await getMine();
    setPartner(r.partner as Partner | null);
    setLinks(r.links as Link[]);
    setMetrics(r.metrics);
    try {
      const m = await getMats();
      setMaterials(m.materials as Material[]);
    } catch { /* sem acesso */ }
    setLoading(false);
  }, [getMine, getMats]);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) return <div className="p-8">Carregando…</div>;

  if (!partner) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Você ainda não é um parceiro</h1>
        <p className="mt-3 text-muted-foreground">
          Cadastre-se publicamente em <Link to="/parceiros" className="text-primary">/parceiros</Link> para começar.
        </p>
      </div>
    );
  }

  async function handleNewLink() {
    setCreating(true);
    try {
      const label = prompt("Rótulo do link (ex: Instagram Maio)") ?? "";
      const target_path = prompt("Página de destino (ex: /seo)", "/") ?? "/";
      await newLink({ data: { label, target_path } });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setCreating(false);
    }
  }

  const base = typeof window !== "undefined" ? window.location.origin : "https://0web.com.br";
  const approved = partner.status === "aprovado";

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Painel do parceiro</p>
          <h1 className="mt-1 text-3xl font-bold">{partner.name}</h1>
          <p className="text-sm text-muted-foreground">
            {partner.kind} · status:{" "}
            <span className={approved ? "text-emerald-500" : "text-amber-500"}>{partner.status}</span>
          </p>
        </div>
        {approved && (
          <button onClick={handleNewLink} disabled={creating} className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Novo link
          </button>
        )}
      </div>

      <section className="mt-8 grid sm:grid-cols-4 gap-3">
        <Kpi label="Cliques 30d" value={metrics?.clicks_30d ?? 0} />
        <Kpi label="Leads 30d" value={metrics?.leads_30d ?? 0} />
        <Kpi label="Vendas 30d" value={metrics?.sales_30d ?? 0} />
        <Kpi label="Receita 30d" value={`R$ ${((metrics?.revenue_cents_30d ?? 0) / 100).toFixed(2)}`} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Meus links</h2>
        {links.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {approved ? "Crie seu primeiro link." : "Disponível após aprovação."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {links.map((l) => {
              const url = `${base}/r/${l.code}`;
              return (
                <li key={l.id} className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <p className="text-sm font-semibold">{l.label || l.code}</p>
                    <p className="text-xs text-muted-foreground">→ {l.target_path}</p>
                    <code className="text-xs">{url}</code>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(url)} className="rounded-full border border-border px-3 py-1.5 text-xs inline-flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                    <a href={url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5 text-xs inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Abrir
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {materials.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Materiais comerciais</h2>
          <ul className="mt-4 grid sm:grid-cols-2 gap-3">
            {materials.map((m) => (
              <li key={m.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase text-muted-foreground">{m.kind}</p>
                <h3 className="mt-1 font-semibold">{m.title}</h3>
                {m.description && <p className="text-sm text-muted-foreground mt-1">{m.description}</p>}
                <a href={m.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                  Acessar <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
