import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getMyProvider, upsertMyProvider } from "@/lib/marketplace.functions";

export const Route = createFileRoute("/_authenticated/app/marketplace/provider")({
  component: ProviderEditor,
});

function ProviderEditor() {
  const get = useServerFn(getMyProvider);
  const upsert = useServerFn(upsertMyProvider);
  const [p, setP] = useState<any>({ display_name: "", headline: "", bio: "", avatar_url: "", phone: "", whatsapp: "", email: "", city: "", state: "", service_regions: [], specialties: [], social: {} });
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void get().then((r) => {
      if ((r as any).provider) setP({ ...(r as any).provider, service_regions: (r as any).provider.service_regions ?? [], specialties: (r as any).provider.specialties ?? [], social: (r as any).provider.social ?? {} });
      setLoaded(true);
    });
  }, [get]);

  if (!loaded) return <p className="text-muted-foreground">Carregando…</p>;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = { ...p };
      ["avatar_url","email"].forEach((k) => { if (!payload[k]) delete payload[k]; });
      await upsert({ data: payload });
      setMsg(p.id ? "Perfil atualizado." : "Perfil criado. Aguardando moderação.");
    } catch (err: any) { setMsg(`Erro: ${err.message}`); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-2">Perfil profissional</h1>
      <p className="text-muted-foreground mb-6">Status: <strong>{p.status ?? "—"}</strong> {p.verified && "· ✓ Verificado"}</p>
      <form onSubmit={onSave} className="space-y-3">
        <input required minLength={2} maxLength={120} placeholder="Nome de exibição" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={p.display_name} onChange={(e) => setP({ ...p, display_name: e.target.value })} />
        <input maxLength={200} placeholder="Headline (ex: Desenvolvedor Web em Curitiba)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={p.headline ?? ""} onChange={(e) => setP({ ...p, headline: e.target.value })} />
        <textarea maxLength={2000} rows={4} placeholder="Bio / descrição" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })} />
        <input maxLength={500} placeholder="URL da foto (https://...)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={p.avatar_url ?? ""} onChange={(e) => setP({ ...p, avatar_url: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input maxLength={30} placeholder="Telefone" className="px-3 py-2 rounded-lg border border-border bg-card" value={p.phone ?? ""} onChange={(e) => setP({ ...p, phone: e.target.value })} />
          <input maxLength={30} placeholder="WhatsApp" className="px-3 py-2 rounded-lg border border-border bg-card" value={p.whatsapp ?? ""} onChange={(e) => setP({ ...p, whatsapp: e.target.value })} />
          <input type="email" maxLength={255} placeholder="E-mail" className="px-3 py-2 rounded-lg border border-border bg-card" value={p.email ?? ""} onChange={(e) => setP({ ...p, email: e.target.value })} />
          <input maxLength={80} placeholder="Cidade" className="px-3 py-2 rounded-lg border border-border bg-card" value={p.city ?? ""} onChange={(e) => setP({ ...p, city: e.target.value })} />
          <input maxLength={2} placeholder="UF" className="px-3 py-2 rounded-lg border border-border bg-card" value={p.state ?? ""} onChange={(e) => setP({ ...p, state: e.target.value.toUpperCase() })} />
        </div>
        <input placeholder="Especialidades (separadas por vírgula)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={p.specialties.join(", ")} onChange={(e) => setP({ ...p, specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <input placeholder="Regiões atendidas (separadas por vírgula)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={p.service_regions.join(", ")} onChange={(e) => setP({ ...p, service_regions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">Salvar</button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
