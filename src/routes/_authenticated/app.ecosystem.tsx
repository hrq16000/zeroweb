import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listEcosystems,
  upsertEcosystem,
  linkPortalToEcosystem,
  unlinkPortal,
  backfillIdentitiesFromLeads,
  computeBiSnapshot,
  detectCrossSell,
  getBiDashboard,
  listCrossSellOpportunities,
  searchIdentities,
  getIdentity360,
  listRoutingRules,
  upsertRoutingRule,
  deleteRoutingRule,
} from "@/lib/ecosystem.functions";
import { listAllPortals } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/app/ecosystem")({
  component: EcosystemPage,
});

type Tab = "overview" | "ecosystems" | "customer360" | "routing" | "crosssell" | "bi";

function EcosystemPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Visão Geral" },
    { id: "ecosystems", label: "Ecossistemas" },
    { id: "customer360", label: "Customer 360°" },
    { id: "routing", label: "Distribuição" },
    { id: "crosssell", label: "Cross-Sell" },
    { id: "bi", label: "BI Executivo" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Ecossistema Nacional</h1>
        <p className="text-sm text-muted-foreground">
          Operação unificada multi-portal: CRM, marketplace, parceiros, analytics e BI consolidados.
        </p>
      </div>
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
              tab === t.id ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "ecosystems" && <EcosystemsTab />}
      {tab === "customer360" && <CustomerTab />}
      {tab === "routing" && <RoutingTab />}
      {tab === "crosssell" && <CrossSellTab />}
      {tab === "bi" && <BiTab />}
    </div>
  );
}

function OverviewTab() {
  const fetchBi = useServerFn(getBiDashboard);
  const backfill = useServerFn(backfillIdentitiesFromLeads);
  const snapshot = useServerFn(computeBiSnapshot);
  const detect = useServerFn(detectCrossSell);
  const [data, setData] = useState<{ totals: { identities: number; pending_opportunities: number }; ecosystems: { id: string }[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => fetchBi().then((r) => setData(r as never));
  useEffect(() => { void load(); }, []);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key); setMsg(null);
    try {
      const r = await fn();
      setMsg(`${key}: ${JSON.stringify(r)}`);
      await load();
    } catch (e) { setMsg(`Erro: ${(e as Error).message}`); }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="Ecossistemas" value={data?.ecosystems?.length ?? 0} />
        <Card label="Identidades unificadas" value={data?.totals?.identities ?? 0} />
        <Card label="Oportunidades pendentes" value={data?.totals?.pending_opportunities ?? 0} />
        <Card label="Snapshots BI" value={(data as { snapshots?: unknown[] } | null)?.snapshots?.length ?? 0} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold">Rotinas operacionais</h2>
        <p className="text-xs text-muted-foreground">
          Execute manualmente as rotinas que normalizam dados, calculam KPIs e geram oportunidades.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button disabled={!!busy} onClick={() => run("backfill", () => backfill())} className="px-3 py-2 text-xs rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
            {busy === "backfill" ? "Processando…" : "Backfill identidades (leads)"}
          </button>
          <button disabled={!!busy} onClick={() => run("snapshot", () => snapshot({ data: {} }))} className="px-3 py-2 text-xs rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
            {busy === "snapshot" ? "Calculando…" : "Gerar snapshot BI"}
          </button>
          <button disabled={!!busy} onClick={() => run("detect", () => detect())} className="px-3 py-2 text-xs rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
            {busy === "detect" ? "Analisando…" : "Detectar cross-sell"}
          </button>
        </div>
        {msg && <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap bg-muted/30 p-2 rounded">{msg}</pre>}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function EcosystemsTab() {
  const fetchE = useServerFn(listEcosystems);
  const fetchP = useServerFn(listAllPortals);
  const upsert = useServerFn(upsertEcosystem);
  const link = useServerFn(linkPortalToEcosystem);
  const unlink = useServerFn(unlinkPortal);
  const [ecos, setEcos] = useState<{ ecosystems: { id: string; slug: string; name: string; status: string }[]; links: { ecosystem_id: string; portal_id: string; portals: { name: string; slug: string } }[] } | null>(null);
  const [portals, setPortals] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [form, setForm] = useState({ slug: "", name: "" });

  const load = async () => {
    const [e, p] = await Promise.all([fetchE(), fetchP()]);
    setEcos(e as never);
    setPortals(((p as { rows: { id: string; name: string; slug: string }[] }).rows) ?? []);
  };
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await upsert({ data: { slug: form.slug, name: form.name } });
          setForm({ slug: "", name: "" });
          await load();
        }}
        className="rounded-xl border border-border bg-card p-4 flex gap-2 flex-wrap items-end"
      >
        <div>
          <label className="text-xs text-muted-foreground">Slug</label>
          <input className="block px-2 py-1.5 text-sm bg-background border border-border rounded" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="grupo-x" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Nome</label>
          <input className="block px-2 py-1.5 text-sm bg-background border border-border rounded" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <button className="px-3 py-2 text-xs rounded bg-primary text-primary-foreground">Criar ecossistema</button>
      </form>
      <div className="space-y-3">
        {(ecos?.ecosystems ?? []).map((eco) => {
          const eLinks = (ecos?.links ?? []).filter((l) => l.ecosystem_id === eco.id);
          return (
            <div key={eco.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{eco.name}</div>
                  <div className="text-xs text-muted-foreground">{eco.slug} · {eco.status}</div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Portais vinculados</div>
                <div className="flex gap-2 flex-wrap">
                  {eLinks.map((l) => (
                    <span key={l.portal_id} className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {l.portals?.name ?? l.portal_id}
                      <button onClick={() => unlink({ data: { ecosystem_id: eco.id, portal_id: l.portal_id } }).then(load)} className="text-destructive">×</button>
                    </span>
                  ))}
                </div>
                <select
                  className="px-2 py-1 text-xs bg-background border border-border rounded"
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    await link({ data: { ecosystem_id: eco.id, portal_id: e.target.value, role: "member" } });
                    e.target.value = "";
                    await load();
                  }}
                  defaultValue=""
                >
                  <option value="">+ Adicionar portal…</option>
                  {portals
                    .filter((p) => !eLinks.find((l) => l.portal_id === p.id))
                    .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomerTab() {
  const search = useServerFn(searchIdentities);
  const get360 = useServerFn(getIdentity360);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<{ id: string; primary_email: string | null; primary_phone: string | null; full_name: string | null; last_seen_at: string }[]>([]);
  const [selected, setSelected] = useState<{ identity: { primary_email: string | null; full_name: string | null }; links: { portal_id: string | null; entity_type: string }[]; touchpoints: { kind: string; title: string | null; occurred_at: string }[] } | null>(null);

  const doSearch = async () => {
    const r = await search({ data: { q } });
    setRows((r as { rows: typeof rows }).rows);
  };
  useEffect(() => { void doSearch(); }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex gap-2 mb-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar email, telefone ou nome…" className="flex-1 px-2 py-1.5 text-sm bg-background border border-border rounded" />
          <button onClick={doSearch} className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground">Buscar</button>
        </div>
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={async () => setSelected(await get360({ data: { id: r.id } }) as never)}
              className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted"
            >
              <div className="font-medium">{r.full_name || r.primary_email || r.primary_phone || r.id.slice(0, 8)}</div>
              <div className="text-muted-foreground">{r.primary_email} · {r.primary_phone}</div>
            </button>
          ))}
          {!rows.length && <p className="text-xs text-muted-foreground">Nenhuma identidade. Rode o backfill em Visão Geral.</p>}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        {!selected ? (
          <p className="text-xs text-muted-foreground">Selecione uma identidade para ver a linha do tempo.</p>
        ) : (
          <div>
            <div className="font-semibold">{selected.identity?.full_name || selected.identity?.primary_email}</div>
            <div className="text-xs text-muted-foreground mb-3">
              {selected.links?.length ?? 0} vínculos · {selected.touchpoints?.length ?? 0} eventos
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(selected.touchpoints ?? []).map((t, i) => (
                <div key={i} className="text-xs border-l-2 border-primary/30 pl-3 py-1">
                  <div className="font-medium">{t.kind}</div>
                  <div className="text-muted-foreground">{t.title} · {new Date(t.occurred_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RoutingTab() {
  const fetchR = useServerFn(listRoutingRules);
  const upsert = useServerFn(upsertRoutingRule);
  const del = useServerFn(deleteRoutingRule);
  const [rows, setRows] = useState<{ id: string; name: string; priority: number; enabled: boolean; match_city: string | null; match_category: string | null; target_kind: string; strategy: string }[]>([]);
  const [form, setForm] = useState({ name: "", priority: 100, match_city: "", match_category: "", target_kind: "queue", strategy: "round_robin" });

  const load = async () => {
    const r = await fetchR();
    setRows((r as { rows: typeof rows }).rows);
  };
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await upsert({
            data: {
              name: form.name,
              priority: Number(form.priority),
              match_city: form.match_city || null,
              match_category: form.match_category || null,
              target_kind: form.target_kind as "queue" | "partner" | "provider" | "company" | "user",
              strategy: form.strategy as "round_robin" | "first_match" | "highest_score",
              enabled: true,
            },
          });
          setForm({ name: "", priority: 100, match_city: "", match_category: "", target_kind: "queue", strategy: "round_robin" });
          await load();
        }}
        className="rounded-xl border border-border bg-card p-4 grid grid-cols-2 lg:grid-cols-6 gap-2 items-end"
      >
        <Field label="Nome" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
        <Field label="Prioridade" type="number" value={String(form.priority)} onChange={(v) => setForm((f) => ({ ...f, priority: Number(v) }))} />
        <Field label="Cidade" value={form.match_city} onChange={(v) => setForm((f) => ({ ...f, match_city: v }))} />
        <Field label="Categoria" value={form.match_category} onChange={(v) => setForm((f) => ({ ...f, match_category: v }))} />
        <div>
          <label className="text-xs text-muted-foreground">Destino</label>
          <select value={form.target_kind} onChange={(e) => setForm((f) => ({ ...f, target_kind: e.target.value }))} className="block px-2 py-1.5 text-sm bg-background border border-border rounded w-full">
            <option value="queue">Fila</option>
            <option value="partner">Parceiro</option>
            <option value="provider">Prestador</option>
            <option value="company">Empresa</option>
            <option value="user">Usuário</option>
          </select>
        </div>
        <button className="px-3 py-2 text-xs rounded bg-primary text-primary-foreground">Salvar regra</button>
      </form>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr><th className="text-left p-2">Nome</th><th className="text-left p-2">Prioridade</th><th className="text-left p-2">Cidade</th><th className="text-left p-2">Categoria</th><th className="text-left p-2">Destino</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2 font-medium">{r.name}</td>
                <td className="p-2">{r.priority}</td>
                <td className="p-2">{r.match_city || "—"}</td>
                <td className="p-2">{r.match_category || "—"}</td>
                <td className="p-2">{r.target_kind} ({r.strategy})</td>
                <td className="p-2"><button onClick={() => del({ data: { id: r.id } }).then(load)} className="text-destructive">excluir</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhuma regra configurada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="block px-2 py-1.5 text-sm bg-background border border-border rounded w-full" />
    </div>
  );
}

function CrossSellTab() {
  const fetchX = useServerFn(listCrossSellOpportunities);
  const [rows, setRows] = useState<{ id: string; score: number; status: string; offer_title: string | null; reason: string | null; customer_identities: { primary_email: string | null; full_name: string | null } | null; portals: { name: string } | null }[]>([]);
  useEffect(() => { fetchX().then((r) => setRows((r as { rows: typeof rows }).rows)); }, []);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/30">
          <tr><th className="text-left p-2">Identidade</th><th className="text-left p-2">Para portal</th><th className="text-left p-2">Oferta</th><th className="text-left p-2">Score</th><th className="text-left p-2">Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-2">{r.customer_identities?.full_name || r.customer_identities?.primary_email || "—"}</td>
              <td className="p-2">{r.portals?.name || "—"}</td>
              <td className="p-2">{r.offer_title}</td>
              <td className="p-2">{r.score}</td>
              <td className="p-2">{r.status}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhuma oportunidade. Clique em "Detectar cross-sell" na Visão Geral.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function BiTab() {
  const fetchBi = useServerFn(getBiDashboard);
  const [data, setData] = useState<{ snapshots: { id: string; snapshot_date: string; kpis: { leads: number; won: number; events: number; conversion_rate: number }; ecosystems: { name: string } | null }[] } | null>(null);
  useEffect(() => { fetchBi().then((r) => setData(r as never)); }, []);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/30">
          <tr><th className="text-left p-2">Data</th><th className="text-left p-2">Ecossistema</th><th className="text-left p-2">Leads</th><th className="text-left p-2">Ganhos</th><th className="text-left p-2">Eventos</th><th className="text-left p-2">Conversão</th></tr>
        </thead>
        <tbody>
          {(data?.snapshots ?? []).map((s) => (
            <tr key={s.id} className="border-t border-border">
              <td className="p-2">{s.snapshot_date}</td>
              <td className="p-2">{s.ecosystems?.name || "—"}</td>
              <td className="p-2">{s.kpis?.leads ?? 0}</td>
              <td className="p-2">{s.kpis?.won ?? 0}</td>
              <td className="p-2">{s.kpis?.events ?? 0}</td>
              <td className="p-2">{s.kpis?.conversion_rate ?? 0}%</td>
            </tr>
          ))}
          {!data?.snapshots?.length && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum snapshot. Gere o primeiro em Visão Geral.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
