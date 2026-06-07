import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getProviderBySlug, createReview } from "@/lib/marketplace.functions";
import { ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/profissional/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | Profissional verificado | 0WEB` },
      { name: "description", content: `Perfil profissional ${params.slug} no marketplace 0WEB. Veja portfólio, especialidades, avaliações e entre em contato.` },
      { property: "og:url", content: `${ORIGIN}/profissional/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/profissional/${params.slug}` }],
  }),
  component: ProviderPage,
});

function ProviderPage() {
  const { slug } = Route.useParams();
  const fetchProvider = useServerFn(getProviderBySlug);
  const submitReview = useServerFn(createReview);
  const [data, setData] = useState<any>(null);
  const [review, setReview] = useState({ rating: 5, comment: "", author_name: "", author_email: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => { void fetchProvider({ data: { slug } }).then(setData); }, [fetchProvider, slug]);

  if (!data) return <div className="p-12 text-center text-muted-foreground">Carregando…</div>;
  if (!data.provider) return <div className="p-12 text-center"><h1 className="text-2xl font-display">Profissional não encontrado</h1><Link to="/servicos/marketplace" className="text-primary mt-4 inline-block">Voltar ao marketplace</Link></div>;

  const p = data.provider;
  const wa = p.whatsapp?.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-5 py-10">
        <Link to="/servicos/marketplace" className="text-sm text-muted-foreground hover:text-foreground">← Marketplace</Link>
        <header className="flex flex-col md:flex-row gap-6 mt-6 pb-8 border-b border-border">
          {p.avatar_url ? <img src={p.avatar_url} alt={p.display_name} className="w-32 h-32 rounded-full object-cover" /> : <div className="w-32 h-32 rounded-full bg-muted" />}
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold">{p.display_name} {p.verified && <span className="text-primary text-base">✓ Verificado</span>}</h1>
            {p.headline && <p className="text-lg text-muted-foreground mt-1">{p.headline}</p>}
            <p className="text-sm text-muted-foreground mt-2">{[p.city, p.state].filter(Boolean).join(", ")}</p>
            <div className="text-sm mt-2">★ {Number(p.rating_avg).toFixed(1)} ({p.rating_count} avaliações)</div>
            <div className="flex gap-3 mt-4 flex-wrap">
              {wa && <a href={`https://wa.me/55${wa}`} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">WhatsApp</a>}
              {p.phone && <a href={`tel:${p.phone}`} className="px-4 py-2 rounded-lg border border-border text-sm">Telefone</a>}
              {p.email && <a href={`mailto:${p.email}`} className="px-4 py-2 rounded-lg border border-border text-sm">E-mail</a>}
            </div>
          </div>
        </header>

        {p.bio && <section className="py-8"><h2 className="font-display text-xl mb-2">Sobre</h2><p className="text-muted-foreground whitespace-pre-line">{p.bio}</p></section>}

        {p.specialties?.length > 0 && (
          <section className="py-4">
            <h2 className="font-display text-xl mb-3">Especialidades</h2>
            <div className="flex flex-wrap gap-2">{p.specialties.map((s: string) => <span key={s} className="px-3 py-1 rounded-full bg-muted text-sm">{s}</span>)}</div>
          </section>
        )}

        {p.service_regions?.length > 0 && (
          <section className="py-4">
            <h2 className="font-display text-xl mb-3">Regiões atendidas</h2>
            <div className="flex flex-wrap gap-2">{p.service_regions.map((s: string) => <span key={s} className="px-3 py-1 rounded-full bg-muted text-sm">{s}</span>)}</div>
          </section>
        )}

        {data.portfolio?.length > 0 && (
          <section className="py-6">
            <h2 className="font-display text-xl mb-4">Portfólio</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.portfolio.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-border overflow-hidden">
                  {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />}
                  <div className="p-4"><div className="font-medium">{item.title}</div>{item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-8 border-t border-border">
          <h2 className="font-display text-xl mb-4">Avaliações</h2>
          {data.reviews?.length === 0 && <p className="text-muted-foreground text-sm mb-6">Ainda sem avaliações aprovadas. Seja o primeiro!</p>}
          <div className="space-y-4 mb-8">
            {data.reviews?.map((r: any) => (
              <div key={r.id} className="rounded-lg border border-border p-4">
                <div className="flex justify-between text-sm"><strong>{r.author_name}</strong><span className="text-muted-foreground">★ {r.rating}</span></div>
                {r.comment && <p className="text-sm mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>

          {sent ? (
            <div className="rounded-lg bg-primary/10 text-primary p-4 text-sm">Obrigado! Sua avaliação está em moderação.</div>
          ) : (
            <form className="rounded-xl border border-border p-5 space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              await submitReview({ data: { ...review, target_type: "provider", target_id: p.id, author_email: review.author_email || undefined, comment: review.comment || undefined } });
              setSent(true);
            }}>
              <h3 className="font-medium">Deixe sua avaliação</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input required minLength={2} maxLength={100} placeholder="Seu nome" className="px-3 py-2 rounded-lg border border-border bg-card" value={review.author_name} onChange={(e) => setReview({ ...review, author_name: e.target.value })} />
                <input type="email" maxLength={255} placeholder="E-mail (opcional)" className="px-3 py-2 rounded-lg border border-border bg-card" value={review.author_email} onChange={(e) => setReview({ ...review, author_email: e.target.value })} />
              </div>
              <select className="px-3 py-2 rounded-lg border border-border bg-card" value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n}</option>)}
              </select>
              <textarea maxLength={1000} placeholder="Comentário" rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium">Enviar avaliação</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
