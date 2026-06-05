import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getMyCompany, upsertMyCompany } from "@/lib/marketplace.functions";

export const Route = createFileRoute("/_authenticated/app/marketplace/company")({
  component: CompanyEditor,
});

function CompanyEditor() {
  const get = useServerFn(getMyCompany);
  const upsert = useServerFn(upsertMyCompany);
  const [c, setC] = useState<any>({ trade_name: "", legal_name: "", cnpj: "", logo_url: "", description: "", phone: "", whatsapp: "", email: "", website: "", city: "", state: "", service_regions: [], categories: [], social: {} });
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void get().then((r) => {
      if ((r as any).company) setC({ ...(r as any).company, service_regions: (r as any).company.service_regions ?? [], categories: (r as any).company.categories ?? [], social: (r as any).company.social ?? {} });
      setLoaded(true);
    });
  }, [get]);

  if (!loaded) return <p className="text-muted-foreground">Carregando…</p>;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = { ...c };
      ["logo_url","email","website"].forEach((k) => { if (!payload[k]) delete payload[k]; });
      await upsert({ data: payload });
      setMsg(c.id ? "Empresa atualizada." : "Empresa criada. Aguardando moderação.");
    } catch (err: any) { setMsg(`Erro: ${err.message}`); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-2">Perfil da empresa</h1>
      <p className="text-muted-foreground mb-6">Status: <strong>{c.status ?? "—"}</strong> {c.verified && "· ✓ Verificada"}</p>
      <form onSubmit={onSave} className="space-y-3">
        <input required minLength={2} maxLength={160} placeholder="Nome fantasia" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={c.trade_name} onChange={(e) => setC({ ...c, trade_name: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input maxLength={200} placeholder="Razão social" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.legal_name ?? ""} onChange={(e) => setC({ ...c, legal_name: e.target.value })} />
          <input maxLength={20} placeholder="CNPJ" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.cnpj ?? ""} onChange={(e) => setC({ ...c, cnpj: e.target.value })} />
        </div>
        <input maxLength={500} placeholder="URL do logo (https://...)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={c.logo_url ?? ""} onChange={(e) => setC({ ...c, logo_url: e.target.value })} />
        <textarea maxLength={2000} rows={4} placeholder="Descrição" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={c.description ?? ""} onChange={(e) => setC({ ...c, description: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input maxLength={30} placeholder="Telefone" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.phone ?? ""} onChange={(e) => setC({ ...c, phone: e.target.value })} />
          <input maxLength={30} placeholder="WhatsApp" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.whatsapp ?? ""} onChange={(e) => setC({ ...c, whatsapp: e.target.value })} />
          <input type="email" maxLength={255} placeholder="E-mail" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.email ?? ""} onChange={(e) => setC({ ...c, email: e.target.value })} />
          <input maxLength={255} placeholder="Website (https://...)" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.website ?? ""} onChange={(e) => setC({ ...c, website: e.target.value })} />
          <input maxLength={80} placeholder="Cidade" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.city ?? ""} onChange={(e) => setC({ ...c, city: e.target.value })} />
          <input maxLength={2} placeholder="UF" className="px-3 py-2 rounded-lg border border-border bg-card" value={c.state ?? ""} onChange={(e) => setC({ ...c, state: e.target.value.toUpperCase() })} />
        </div>
        <input placeholder="Categorias (slugs separados por vírgula: criacao-de-sites, seo...)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={c.categories.join(", ")} onChange={(e) => setC({ ...c, categories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <input placeholder="Áreas atendidas (separadas por vírgula)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={c.service_regions.join(", ")} onChange={(e) => setC({ ...c, service_regions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">Salvar</button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
