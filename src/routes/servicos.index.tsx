import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowRight, Sparkles, Zap, Clock, HelpCircle, Search, AlertCircle, Timer } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Skeleton } from "@/components/ui/skeleton";
import { absUrl, ORIGIN, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SERVICES } from "@/lib/services-data";
import { SocialProofBlock } from "@/components/site/SocialProofBlock";
import { RelatedLinksGrid } from "@/components/site/RelatedLinksGrid";
import { ServiceCTA } from "@/components/site/ServiceCTA";
import { ShopHero } from "@/components/site/ShopHero";
import { ServiceImageFallback } from "@/components/site/ServiceImageFallback";

import {
  SITE_EXPRESS_FAQ_KEYS,
  normalizeFaqKey,
} from "@/lib/site-express-faq";

const SERVICE_LIST = Object.values(SERVICES);


type ServicosSearch = { q?: string; cat?: string; sort?: SortKey; page?: number };

export const Route = createFileRoute("/servicos/")({
  validateSearch: (raw: Record<string, unknown>): ServicosSearch => {
    const q = typeof raw.q === "string" ? raw.q.slice(0, 100) : undefined;
    const cat = typeof raw.cat === "string" ? raw.cat.slice(0, 60) : undefined;
    const sortRaw = typeof raw.sort === "string" ? raw.sort : undefined;
    const sort: SortKey | undefined =
      sortRaw === "shop" || sortRaw === "recent" || sortRaw === "alpha" || sortRaw === "relevance"
        ? sortRaw
        : undefined;
    const pageNum = Number(raw.page);
    const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : undefined;
    return { q, cat, sort, page };
  },
  head: () => {
    const url = absUrl("/servicos");
    const title = "Serviços da 0WEB · Sites, SEO, IA, Marketing Digital e Sistemas";
    const desc =
      "Catálogo completo de serviços da 0WEB: criação de sites, landing pages, e-commerce, SEO, marketing digital, automação com IA, chatbot WhatsApp, SaaS e sistemas web sob medida.";

    // FAQ agregado: exclui perguntas que já pertencem ao Site Express,
    // que terão seu próprio FAQPage dedicado no mesmo @graph.
    const seenQ = new Set<string>(SITE_EXPRESS_FAQ_KEYS);
    const faqItems: { q: string; a: string }[] = [];
    for (const s of SERVICE_LIST) {
      if (s.slug === "site-express") continue; // tratado separadamente
      for (const f of s.faq ?? []) {
        const key = normalizeFaqKey(f.q);
        if (seenQ.has(key)) continue;
        seenQ.add(key);
        faqItems.push(f);
        if (faqItems.length >= 20) break;
      }
      if (faqItems.length >= 20) break;
    }

    const itemList = {
      "@type": "ItemList",
      "@id": `${url}#services`,
      name: "Serviços 0WEB",
      numberOfItems: SERVICE_LIST.length,
      itemListElement: SERVICE_LIST.map((s, i) => {
        const sUrl = absUrl(`/servicos/${s.slug}`);
        const sId = `${sUrl}#service`;
        return {
          "@type": "ListItem",
          position: i + 1,
          url: sUrl,
          item: {
            "@type": "Service",
            "@id": sId,
            name: s.name,
            serviceType: s.serviceType,
            description: s.description,
            category: s.category,
            url: sUrl,
            areaServed: { "@type": "Country", name: "Brasil" },
            provider: { "@id": `${ORIGIN}/#org` },
          },
        };
      }),
    };

    // FAQPage do Site Express vive na página dedicada do produto
    // (/servicos/site-express) para evitar duplicar schema FAQ entre URLs.


    // FAQPage agregado dos demais serviços (sem duplicar Site Express)
    const aggregatedFaqPage = faqItems.length
      ? {
          "@type": "FAQPage",
          "@id": `${url}#faq-servicos`,
          name: "Perguntas sobre os demais serviços",
          inLanguage: "pt-BR",
          isPartOf: { "@id": url },
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

    const graph: unknown[] = [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        description: desc,
        inLanguage: "pt-BR",
        isPartOf: { "@type": "WebSite", "@id": `${ORIGIN}/#website` },
        publisher: { "@id": `${ORIGIN}/#org` },
        about: SERVICE_LIST.map((s) => ({ "@type": "Service", name: s.name })),
        mainEntity: { "@id": `${url}#services` },
      },
      breadcrumbLd([{ name: "Serviços", path: "/servicos" }]),
      itemList,

    ];
    if (aggregatedFaqPage) graph.push(aggregatedFaqPage);

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: "serviços digitais, criação de sites, SEO, marketing digital, automação IA, chatbot WhatsApp, e-commerce, landing page, 0WEB" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "0WEB" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:image:alt", content: "Catálogo de serviços da 0WEB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "pt-BR", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
        },
      ],
    };
  },
  loader: async () => {
    const { listServicesPublic } = await import("@/lib/services-public.functions");
    const { listHeroSlides } = await import("@/lib/hero-slides.functions");
    const [{ services: allServices }, { slides }] = await Promise.all([
      listServicesPublic(),
      listHeroSlides({ data: { page: "servicos" } }),
    ]);
    // Catálogo /servicos lista apenas PRODUTOS. Soluções vão para /solucoes.
    const services = allServices.filter((s) => !s.isSolution);
    return { services, slides };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
        <h1 className="mt-4 text-2xl font-bold">Não foi possível carregar o catálogo</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">Voltar ao início</Link>
      </div>
    </div>
  ),
  component: ServicosHub,
});

type SortKey = "shop" | "recent" | "alpha" | "relevance";

function ServicosHub() {
  const { services, slides } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/servicos" });
  type Svc = (typeof services)[number];
  const [q, setQ] = useState(search.q ?? "");
  const [page, setPage] = useState(search.page ?? 1);
  const [sort, setSort] = useState<SortKey>(search.sort ?? "shop");
  const [activeCat, setActiveCat] = useState<string>(search.cat ?? "all");
  const [isPending, startTransition] = useTransition();
  const PER_PAGE = 12;

  // Sincroniza estado → URL (debounced para a busca) para preservar SEO,
  // navegação back/forward e compartilhamento de links filtrados.
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({
        search: () => ({
          q: q.trim() ? q.trim() : undefined,
          cat: activeCat !== "all" ? activeCat : undefined,
          sort: sort !== "shop" ? sort : undefined,
          page: page > 1 ? page : undefined,
        }),
        replace: true,
        resetScroll: false,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q, activeCat, sort, page, navigate]);

  const allCategories = useMemo(() => {
    const s = new Set<string>();
    services.forEach((x: Svc) => s.add(x.category));
    return Array.from(s);
  }, [services]);

  const filtered = useMemo<Svc[]>(() => {
    const term = q.trim().toLowerCase();
    let list = services as Svc[];
    if (activeCat !== "all") list = list.filter((s) => s.category === activeCat);
    if (term) {
      list = list.filter((s) =>
        [s.name, s.description, s.category, ...(s.keywords ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    }
    // Base "recentes primeiro" (loader vem em display_order asc → invertemos)
    const recentFirst = [...list].reverse();
    if (sort === "alpha") return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "relevance") return list;
    if (sort === "recent") return recentFirst;
    // "shop" (default): vitrine em ordem estável, sem embaralhar.
    return recentFirst;
  }, [services, q, sort, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  // Index global (na lista filtrada) para badge "Novo" nos 3 primeiros.
  const newSet = new Set(filtered.slice(0, 3).map((s) => s.slug));


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-6">
        <h1 className="sr-only">Loja de serviços 0WEB</h1>
        <ShopHero slides={slides} />

        <section className="px-5 pt-8">
          <div className="mx-auto max-w-6xl rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Projetos sem preço fechado foram movidos para a página de soluções consultivas.
            </p>
            <Link to="/solucoes" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Ver Soluções <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Busca inteligente agora vive no header sticky (servicos.tsx) e
            permanece presente em todas as páginas da loja virtual. */}

        {/* DESTAQUE: Site Express */}
        <section className="py-12 px-5">
          <div className="mx-auto max-w-6xl">
            <Link
              to="/servicos/site-express"
              className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-500 text-white p-8 lg:p-12 shadow-2xl shadow-orange-600/20 hover:shadow-orange-600/40 transition-shadow"
            >
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" /> Novo · Mais procurado
                  </span>
                  <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                    Site Express em 24h <span className="opacity-90">· a partir de R$ 499</span>
                  </h2>
                  <p className="mt-3 text-white/90 max-w-xl">
                    Site profissional sob medida, mobile-first e focado em WhatsApp, no ar em até
                    24 horas. Briefing de 5 minutos.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15">
                      <Clock className="w-3.5 h-3.5" /> Entrega 24h
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/15">Pagamento único</span>
                    <span className="px-3 py-1 rounded-full bg-white/15">Domínio + SSL</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-orange-600 font-bold uppercase tracking-wide px-6 py-4 text-sm shadow-lg group-hover:scale-105 transition-transform">
                    Quero meu site <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* FAQ do Site Express movida para a página dedicada do produto:
            /servicos/site-express. Mantemos apenas um link de acesso rápido. */}
        <section className="py-10 px-5">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              to="/servicos/site-express"
              hash="faq"
              className="inline-flex items-center gap-2 text-orange-600 font-semibold story-link"
            >
              <HelpCircle className="w-4 h-4" />
              Perguntas frequentes sobre o Site Express
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>






        <section className="py-16" id="catalogo" aria-labelledby="catalogo-title">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 id="catalogo-title" className="text-2xl sm:text-3xl font-bold">
                  Catálogo de serviços
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filtered.length} serviço{filtered.length === 1 ? "" : "s"} disponíve{filtered.length === 1 ? "l" : "is"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <label className="relative flex-1 sm:w-72">
                  <span className="sr-only">Buscar serviço</span>
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => {
                      const v = e.target.value;
                      startTransition(() => {
                        setQ(v);
                        setPage(1);
                      });
                    }}
                    placeholder="Buscar por nome, categoria..."
                    className="w-full h-10 pl-9 pr-3 rounded-full border border-border bg-card text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <label className="relative">
                  <span className="sr-only">Ordenar serviços</span>
                  <select
                    value={sort}
                    onChange={(e) => {
                      const v = e.target.value as SortKey;
                      startTransition(() => {
                        setSort(v);
                        setPage(1);
                      });
                    }}
                    className="h-10 px-3 rounded-full border border-border bg-card text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="shop">Vitrine</option>
                    <option value="recent">Mais recentes</option>
                    <option value="alpha">Alfabética (A→Z)</option>
                    <option value="relevance">Relevância</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
              <button
                type="button"
                onClick={() => startTransition(() => { setActiveCat("all"); setPage(1); })}
                aria-pressed={activeCat === "all"}
                className={`px-3 h-8 text-xs rounded-full border transition-colors ${
                  activeCat === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                Todas ({services.length})
              </button>
              {allCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => startTransition(() => { setActiveCat(c); setPage(1); })}
                  aria-pressed={activeCat === c}
                  className={`px-3 h-8 text-xs rounded-full border transition-colors ${
                    activeCat === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {isPending ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4" aria-busy="true" aria-live="polite">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-5 space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="mx-auto max-w-2xl text-center py-14 rounded-3xl border border-dashed border-border bg-card px-6">
                <AlertCircle className="w-9 h-9 text-muted-foreground mx-auto" />
                <h3 className="mt-4 text-xl font-bold">Nenhum produto com preço publicado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  A vitrine exibe apenas produtos com valor cadastrado. Se você quer publicar um novo item, solicite o cadastramento.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/contato"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold"
                  >
                    Solicitar cadastramento <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/solucoes" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                    Ver soluções sem preço
                  </Link>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="mt-3 text-muted-foreground">
                  Nenhum serviço encontrado{q ? ` para "${q}"` : ""}.
                </p>
                <button
                  type="button"
                  onClick={() => { setQ(""); setActiveCat("all"); setPage(1); }}
                  className="mt-3 text-sm text-primary underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {paginated.map((s) => (
                  <Link
                    key={s.slug}
                    to="/servicos/$slug"
                    params={{ slug: s.slug }}
                    className="group relative flex flex-col rounded-2xl border border-border bg-card hover:border-primary hover:-translate-y-1 hover:shadow-elegant transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Ver detalhes do serviço ${s.name}`}
                  >
                    {newSet.has(s.slug) && (
                      <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                        <Sparkles className="w-3 h-3" /> Novo
                      </span>
                    )}
                    {s.imageUrl ? (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={s.imageUrl}
                          alt={s.imageAlt || s.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <ServiceImageFallback slug={s.slug} name={s.name} category={s.category} />
                    )}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary font-bold line-clamp-1">{s.category}</p>
                      <h4 className="mt-1 font-semibold text-sm sm:text-base leading-snug line-clamp-2">{s.name}</h4>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">{s.description}</p>

                      <div className="mt-auto pt-3">
                        {(() => {
                          // Tráfego Pago: público "sob consulta" (gestão sob escopo);
                          // preço interno (R$1.490 ref) não exibido no card.
                          const isTrafegoPago = s.slug === "trafego-pago";
                          const showPrice = isTrafegoPago || s.price != null;
                          if (!showPrice && !s.deliveryDays) return null;
                          return (
                            <div className="flex flex-wrap items-center gap-1.5 text-xs mb-2">
                              {showPrice && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                                  {isTrafegoPago || s.price === 0
                                    ? "Sob consulta"
                                    : `R$ ${Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
                                  {!isTrafegoPago && s.pricePeriod ? <span className="opacity-70">/{s.pricePeriod}</span> : null}
                                </span>
                              )}
                              {s.deliveryDays && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                  <Timer className="w-3 h-3" /> {s.deliveryDays}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <span
                          className="inline-flex items-center justify-center w-full gap-1 text-sm font-semibold rounded-full bg-foreground text-background px-3 py-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          title={s.name}
                        >
                          <span className="truncate">{s.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-2"
                aria-label="Paginação do catálogo"
              >
                <button
                  type="button"
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 h-9 rounded-full border border-border text-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === safePage ? "page" : undefined}
                    className={`w-9 h-9 rounded-full border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      p === safePage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 h-9 rounded-full border border-border text-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Próxima
                </button>
              </nav>
            )}
          </div>
        </section>

        <section className="py-16 bg-muted/20" aria-labelledby="especialidades-title">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center mb-10">
              <h2 id="especialidades-title" className="text-2xl sm:text-3xl font-bold">
                Especialidades complementares
              </h2>
              <p className="mt-2 text-muted-foreground">
                Páginas dedicadas a frentes específicas de crescimento digital.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { to: "/servicos/presenca-digital", title: "Presença Digital", desc: "Estratégia completa para sua marca existir e converter online." },
                { to: "/servicos/trafego-pago", title: "Tráfego Pago", desc: "Campanhas Google Ads e Meta com foco em ROI." },
                { to: "/servicos/trafego-pago-local", title: "Tráfego Pago Local", desc: "Anúncios geolocalizados para negócios físicos." },
                { to: "/servicos/google-meu-negocio", title: "Google Meu Negócio", desc: "Otimização do seu perfil para aparecer nas buscas locais." },
                { to: "/seo", title: "SEO", desc: "Posicionamento orgânico no Google de forma sustentável." },
                { to: "/servicos/consultoria", title: "Consultoria", desc: "Diagnóstico estratégico para acelerar resultados digitais." },
              ].map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="group block rounded-2xl border border-border bg-card hover:border-primary transition-colors p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <h4 className="font-semibold text-lg">{s.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                    Acessar página <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <SocialProofBlock ctxId="servicos_page" />

        <RelatedLinksGrid
          title="Continue explorando a 0WEB"
          subtitle="Páginas pensadas para responder dúvidas e acelerar sua decisão."
          only={["/planos", "/faq", "/cases", "/servicos/trafego-pago-local", "/servicos/seo", "/contato"]}
        />

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <div className="text-center rounded-3xl border border-border bg-card/60 backdrop-blur p-8 lg:p-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Receba uma proposta personalizada</h2>
              <p className="mt-3 text-muted-foreground">Responda no WhatsApp em poucos minutos e te enviamos um plano sob medida.</p>
              <div className="mt-6 flex justify-center">
                <ServiceCTA
                  serviceSlug="servicos"
                  location="footer"
                  label="Falar com um especialista"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-muted-foreground">Procura serviço por cidade?</p>
            <Link to="/cidades" className="mt-2 inline-flex items-center gap-2 text-primary font-semibold story-link">
              Ver cidades atendidas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
