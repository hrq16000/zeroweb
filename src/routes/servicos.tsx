import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Sparkles, Zap, Clock, HelpCircle, Search, AlertCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { absUrl, ORIGIN, breadcrumbLd, DEFAULT_OG_IMAGE, ORG_REF } from "@/lib/seo";
import { SERVICES } from "@/lib/services-data";
import { SocialProofBlock } from "@/components/site/SocialProofBlock";
import { RelatedLinksGrid } from "@/components/site/RelatedLinksGrid";
import { ContactFormWhatsApp } from "@/components/site/ContactFormWhatsApp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SITE_EXPRESS_FAQ,
  SITE_EXPRESS_FAQ_KEYS,
  normalizeFaqKey,
} from "@/lib/site-express-faq";

const SERVICE_LIST = Object.values(SERVICES);
const SITE_EXPRESS_URL = absUrl("/servicos/site-express");
const SITE_EXPRESS_SERVICE_ID = `${SITE_EXPRESS_URL}#service`;

export const Route = createFileRoute("/servicos")({
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
            provider: ORG_REF,
          },
        };
      }),
    };

    // FAQPage dedicado do Site Express, vinculado ao Service via `about`
    const siteExpressFaqPage = {
      "@type": "FAQPage",
      "@id": `${url}#faq-site-express`,
      name: "Perguntas sobre o Site Express",
      inLanguage: "pt-BR",
      about: { "@id": SITE_EXPRESS_SERVICE_ID },
      isPartOf: { "@id": url },
      mainEntity: SITE_EXPRESS_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

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
        isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
        about: SERVICE_LIST.map((s) => ({ "@type": "Service", name: s.name })),
        mainEntity: { "@id": `${url}#services` },
      },
      breadcrumbLd([{ name: "Serviços", path: "/servicos" }]),
      itemList,
      ORG_REF,
      siteExpressFaqPage,
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
      links: [{ rel: "canonical", href: url }],
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
    const { services } = await listServicesPublic();
    return { services };
  },
  component: ServicosHub,
});

function ServicosHub() {
  const { services } = Route.useLoaderData();
  type Svc = (typeof services)[number];
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const filtered = useMemo<Svc[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return services;
    return services.filter((s: Svc) =>
      [s.name, s.description, s.category, ...(s.keywords ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [services, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const byCategory: Record<string, Svc[]> = {};
  for (const s of paginated) {
    (byCategory[s.category] ||= []).push(s);
  }
  const categories = Object.keys(byCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Serviços", path: "/servicos" }]} />
      <main className="pt-6">
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Catálogo completo
            </p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              Serviços <span className="text-gradient">0WEB</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo o que sua empresa precisa para crescer no digital — em um único parceiro.
            </p>
          </div>
        </section>

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

        {/* FAQ dedicado do Site Express (mesmo conteúdo do JSON-LD #faq-site-express) */}
        <section id="faq-site-express" className="py-12 px-5 bg-muted/20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
                <HelpCircle className="w-3.5 h-3.5" /> FAQ · Site Express
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                Perguntas frequentes sobre o Site Express
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tudo o que você precisa saber antes de pedir seu site de 24h.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {SITE_EXPRESS_FAQ.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`se-${i}`}
                  className="rounded-xl border border-border bg-card px-4"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-6 text-center">
              <Link
                to="/servicos/site-express"
                className="inline-flex items-center gap-2 text-orange-600 font-semibold story-link"
              >
                Ver página completa do Site Express <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
              <label className="relative w-full sm:w-80">
                <span className="sr-only">Buscar serviço</span>
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar por nome, categoria..."
                  className="w-full h-10 pl-9 pr-3 rounded-full border border-border bg-card text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhum serviço encontrado para "{q}".
              </p>
            ) : (
              <div className="space-y-12">
                {categories.map((cat) => (
                  <div key={cat}>
                    <h3 className="text-xl font-bold mb-4">{cat}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {byCategory[cat].map((s) => (
                        <Link
                          key={s.slug}
                          to="/servicos/$slug"
                          params={{ slug: s.slug }}
                          className="group block rounded-2xl border border-border bg-card hover:border-primary transition-colors overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Ver detalhes do serviço ${s.name}`}
                        >
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
                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <Sparkles className="w-10 h-10 text-primary/40" />
                            </div>
                          )}
                          <div className="p-5">
                            <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{s.category}</p>
                            <h4 className="mt-1 font-semibold text-lg">{s.name}</h4>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                              Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 h-9 rounded-full border border-border text-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Próxima
                </button>
              </nav>
            )}
          </div>
        </section>

        <SocialProofBlock ctxId="servicos_page" />

        <RelatedLinksGrid
          title="Continue explorando a 0WEB"
          subtitle="Páginas pensadas para responder dúvidas e acelerar sua decisão."
          only={["/planos", "/faq", "/cases", "/trafego-pago-local", "/seo", "/contato"]}
        />

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <ContactFormWhatsApp
              source="servicos_form_whatsapp"
              ctx="servicos_page"
              title="Receba uma proposta personalizada"
              defaultMessage="Olá! Vi os serviços da 0WEB e quero uma proposta personalizada."
              useModal
            />
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
