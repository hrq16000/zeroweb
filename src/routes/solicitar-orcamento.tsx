import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { createServiceRequest, listCategories } from "@/lib/marketplace.functions";
import { ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/solicitar-orcamento")({
  head: () => ({
    meta: [
      { title: "Solicitar orçamento | Marketplace 0WEB" },
      { name: "description", content: "Descreva seu projeto e receba propostas de prestadores e empresas verificadas em todo o Brasil." },
      { property: "og:url", content: `${ORIGIN}/solicitar-orcamento` },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/solicitar-orcamento` }],
  }),
  component: RequestPage,
});

function RequestPage() {
  const submit = useServerFn(createServiceRequest);
  const fetchCats = useServerFn(listCategories);
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({ requester_name: "", requester_email: "", requester_phone: "", title: "", description: "", category_slug: "", city: "", state: "", budget_range: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => { void fetchCats().then((r) => setCats((r as any).categories)); }, [fetchCats]);

  if (sent) return (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-display font-bold mb-3">Solicitação recebida</h1>
        <p className="text-muted-foreground mb-6">Vamos analisar e distribuir para prestadores compatíveis em breve.</p>
        <Link to="/servicos/marketplace" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground">Ir ao marketplace</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Solicitar orçamento</h1>
        <p className="text-muted-foreground mt-2 mb-8">Descreva seu projeto e enviaremos para prestadores compatíveis.</p>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          await submit({ data: { ...form, requester_email: form.requester_email || undefined, requester_phone: form.requester_phone || undefined, description: form.description || undefined, category_slug: form.category_slug || undefined, city: form.city || undefined, state: form.state || undefined, budget_range: form.budget_range || undefined } });
          setSent(true);
        }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required minLength={2} maxLength={100} placeholder="Seu nome" className="px-3 py-2 rounded-lg border border-border bg-card" value={form.requester_name} onChange={(e) => setForm({ ...form, requester_name: e.target.value })} />
            <input type="email" maxLength={255} placeholder="E-mail" className="px-3 py-2 rounded-lg border border-border bg-card" value={form.requester_email} onChange={(e) => setForm({ ...form, requester_email: e.target.value })} />
            <input maxLength={30} placeholder="WhatsApp" className="px-3 py-2 rounded-lg border border-border bg-card" value={form.requester_phone} onChange={(e) => setForm({ ...form, requester_phone: e.target.value })} />
            <select className="px-3 py-2 rounded-lg border border-border bg-card" value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })}>
              <option value="">Categoria...</option>
              {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <input maxLength={80} placeholder="Cidade" className="px-3 py-2 rounded-lg border border-border bg-card" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input maxLength={2} placeholder="UF" className="px-3 py-2 rounded-lg border border-border bg-card" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
          </div>
          <input required minLength={3} maxLength={160} placeholder="Título do projeto (ex: Site institucional)" className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea maxLength={2000} rows={5} placeholder="Descreva o que precisa..." className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })}>
            <option value="">Faixa de orçamento (opcional)</option>
            <option>Até R$ 1.000</option><option>R$ 1.000 - R$ 5.000</option><option>R$ 5.000 - R$ 15.000</option><option>Acima de R$ 15.000</option>
          </select>
          <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">Enviar solicitação</button>
        </form>
      </div>
    </div>
  );
}
