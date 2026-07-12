import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, XCircle, HelpCircle, MapPin, Timer, BadgeCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { ServiceCTA } from "@/components/site/ServiceCTA";
import { absUrl, ORIGIN, DEFAULT_OG_IMAGE, breadcrumbLd } from "@/lib/seo";
import { GEO_SERVICE_SLUGS, relatedServices } from "@/lib/services-data";
import { CITIES } from "@/lib/geo-data";
import { getServicePublic, type PublicServiceFull, type GalleryItem } from "@/lib/services-public.functions";
import { AddToCartButton } from "@/components/site/AddToCartButton";
import { ServicePurchasePanel } from "@/components/site/ServicePurchasePanel";
import { RelatedServicesCarousel } from "@/components/site/RelatedServicesCarousel";
import { ProductGallery } from "@/components/site/ProductGallery";


const GEO_SET = new Set(GEO_SERVICE_SLUGS);

// Garante que toda Offer emitida no JSON-LD tenha priceValidUntil + seller,
// evitando erros intermitentes no Schema Validator caso algum bloco extra
// (vindo do painel SEO) ou variação futura omita esses campos.
const DEFAULT_PRICE_VALID_UNTIL = "2026-12-31";
const SELLER_REF = { "@id": `${ORIGIN}/#org` };

type OfferLike = Record<string, unknown> & {
  "@type"?: string;
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  priceValidUntil?: string;
  seller?: unknown;
  url?: string;
};

function withOfferDefaults(offer: OfferLike, fallbackUrl: string): OfferLike {
  return {
    "@type": "Offer",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    url: fallbackUrl,
    ...offer,
    priceValidUntil: offer.priceValidUntil || DEFAULT_PRICE_VALID_UNTIL,
    seller: offer.seller ?? SELLER_REF,
  };
}

function buildSingleOffer(basePrice: number, url: string): OfferLike[] {
  // Serviços digitais têm preço único por escopo — sem inventar variantes
  // "Essencial/Pro/Avançado" no schema (o Google reprova Offers fictícias).
  return [withOfferDefaults({ price: basePrice.toString() }, url)];
}

export const Route = createFileRoute("/servicos/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug === "site-24h") {
      throw redirect({ to: "/servicos/site-express", statusCode: 301, replace: true });
    }
  },
  loader: async ({ params }) => {
    const { service } = await getServicePublic({ data: { slug: params.slug } });
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Serviço · 0WEB" }] };
    const url = absUrl(`/servicos/${params.slug}`);
    const ogImage = loaderData.ogImageUrl || loaderData.imageUrl || DEFAULT_OG_IMAGE;
    const ogAlt = loaderData.imageAlt || loaderData.h1;
    const ogType = loaderData.ogType || "website";
    const baseGraph = [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: loaderData.title,
        description: loaderData.description,
        inLanguage: "pt-BR",
        isPartOf: { "@type": "WebSite", "@id": `${ORIGIN}/#website` },
        publisher: { "@id": `${ORIGIN}/#org` },
        primaryImageOfPage: loaderData.imageUrl ? { "@type": "ImageObject", url: loaderData.imageUrl } : undefined,
        mainEntity: { "@id": `${url}#service` },
        ...(loaderData.faq?.length ? { hasPart: { "@id": `${url}#faq` } } : {}),
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: loaderData.h1,
        description: loaderData.description,
        serviceType: loaderData.serviceType,
        category: loaderData.category,
        url,
        ...(loaderData.imageUrl ? { image: loaderData.imageUrl } : {}),
        areaServed: { "@type": "Country", name: "BR" },
        provider: { "@id": `${ORIGIN}/#org` },
        ...(typeof loaderData.price === "number" && loaderData.price > 0
          ? { offers: buildSingleOffer(loaderData.price, url) }
          : {}),
      },
      ...(loaderData.faq?.length
        ? [{
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            inLanguage: "pt-BR",
            about: { "@id": `${url}#service` },
            isPartOf: { "@id": url },
            mainEntity: loaderData.faq.map((f: { q: string; a: string }) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }]
        : []),
      breadcrumbLd([
        { name: "Serviços", path: "/servicos" },
        { name: loaderData.name, path: `/servicos/${params.slug}` },
      ]),
    ];
    // Blocos JSON-LD adicionais editáveis pelo painel (aba SEO).
    // Normaliza qualquer Offer presente para garantir priceValidUntil + seller.
    const rawExtra = Array.isArray(loaderData.schemaJsonLd) ? loaderData.schemaJsonLd : [];
    const extraGraph = rawExtra.map((node: Record<string, unknown>) => {
      if (!node || typeof node !== "object") return node;
      const offers = (node as { offers?: unknown }).offers;
      if (Array.isArray(offers)) {
        return { ...node, offers: offers.map((o) => withOfferDefaults(o as OfferLike, url)) };
      }
      if (offers && typeof offers === "object") {
        return { ...node, offers: withOfferDefaults(offers as OfferLike, url) };
      }
      return node;
    });
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { name: "keywords", content: loaderData.keywords.join(", ") },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: ogType },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { property: "og:image:alt", content: ogAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.description },
        { name: "twitter:image", content: ogImage },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "pt-BR", href: url },
        { rel: "alternate", hrefLang: "x-default", href: url },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [...baseGraph, ...extraGraph],
          }),
        },
      ],
    };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <Link to="/" className="text-primary underline">Voltar ao início</Link>
    </div>
  ),
});

function ServicePage() {
  const data = Route.useLoaderData() as PublicServiceFull;
  const { slug } = Route.useParams();
  const otherSvcs = relatedServices(slug, 6);
  const hasGeo = GEO_SET.has(slug);
  const funnels = data.funnels ?? {};
  const isTrafegoPago = slug === "trafego-pago";

  const priceLabel =
    isTrafegoPago
      ? "Sob consulta"
      : data.price == null
      ? null
      : data.price === 0
        ? "Sob consulta"
        : `R$ ${Number(data.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

  const isProduct = !isTrafegoPago && data.price != null && data.price > 0;

  // Constrói galeria da loja: imagem principal + imagens da galeria (sem duplicar).
  const shopImages = (() => {
    const arr: { url: string; alt?: string }[] = [];
    if (data.imageUrl) arr.push({ url: data.imageUrl, alt: data.imageAlt || data.h1 });
    for (const g of data.gallery) {
      if (g.url && !arr.some((a) => a.url === g.url)) {
        arr.push({ url: g.url, alt: g.alt || data.name });
      }
    }
    return arr;
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-6">
        {isProduct && shopImages.length > 0 ? (
          // Layout estilo loja virtual: galeria à esquerda, info do produto à direita.
          <section className="py-10 lg:py-14">
            <div className="mx-auto max-w-6xl px-5 lg:px-8">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">{data.category}</p>
              <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-8 lg:gap-12 items-start">
                <div>
                  <ProductGallery images={shopImages} productName={data.name} />
                </div>
                <aside className="space-y-5 lg:sticky lg:top-24">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                    {data.h1}
                  </h1>
                  <p className="text-base text-muted-foreground leading-relaxed">{data.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {priceLabel && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        <BadgeCheck className="w-4 h-4" />
                        A partir de {priceLabel}
                        {data.pricePeriod ? <span className="opacity-70">/{data.pricePeriod}</span> : null}
                      </span>
                    )}
                    {data.deliveryDays && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                        <Timer className="w-4 h-4" /> {data.deliveryDays}
                      </span>
                    )}
                  </div>

                  <ServicePurchasePanel
                    item={{
                      slug,
                      name: data.name,
                      category: data.category,
                      price: data.price!,
                      pricePeriod: data.pricePeriod ?? null,
                      imageUrl: data.imageUrl ?? null,
                    }}
                  />

                  <div className="pt-1">
                    <ServiceCTA
                      serviceSlug={slug}
                      funnels={funnels}
                      location="hero"
                      label="Tirar dúvida sobre este produto"
                    />
                  </div>

                  {data.conditions && (
                    <p className="text-xs text-muted-foreground whitespace-pre-line pt-2 border-t border-border">
                      {data.conditions}
                    </p>
                  )}
                </aside>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16 bg-hero">
            <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">{data.category}</p>
              <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
                {data.h1.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-gradient">{data.h1.split(" ").slice(-2).join(" ")}</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">{data.description}</p>

              {(priceLabel || data.deliveryDays) && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {priceLabel && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      <BadgeCheck className="w-4 h-4" />
                      {priceLabel}
                      {data.pricePeriod ? <span className="opacity-70">/{data.pricePeriod}</span> : null}
                    </span>
                  )}
                  {data.deliveryDays && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
                      <Timer className="w-4 h-4" /> {data.deliveryDays}
                    </span>
                  )}
                </div>
              )}

              {data.imageUrl && (
                <a
                  href={data.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir imagem em tamanho real: ${data.imageAlt || data.h1}`}
                  className="mt-8 mx-auto max-w-3xl block overflow-hidden rounded-3xl border border-border shadow-elegant bg-muted cursor-zoom-in group"
                >
                  <img
                    src={data.imageUrl}
                    alt={data.imageAlt || data.h1}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </a>
              )}
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
                <ServiceCTA
                  serviceSlug={slug}
                  funnels={funnels}
                  location="hero"
                  label={data.ctaLabel}
                />
              </div>
              {data.conditions && (
                <p className="mt-4 text-xs text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
                  {data.conditions}
                </p>
              )}
            </div>
          </section>
        )}




        <section className="py-12 bg-muted/30">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">O que costuma travar o resultado</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.problems.map((p: string) => (
                <div key={p} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Benefícios incluídos</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.benefits.map((b: string) => (
                <div key={b} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8">Como entregamos</h2>
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.process.map((p: { step: string; desc: string }, i: number) => (
                <li key={p.step} className="p-5 rounded-2xl border border-border bg-card">
                  <span className="text-xs font-mono text-primary">0{i + 1}</span>
                  <h3 className="mt-2 font-semibold text-lg">{p.step}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {data.richHtml && data.richHtml.trim().length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-3xl px-5 lg:px-8">
              {/* Bloco rico migrado de rotas literais; editável no painel (aba SEO). */}
              <div
                className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: data.richHtml }}
              />
            </div>
          </section>
        )}


        {data.gallery.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-6xl px-5 lg:px-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">Galeria</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.gallery
                  .filter((g: GalleryItem) => g.url)
                  .map((g: GalleryItem, i: number) => (
                    <a
                      key={`${g.path}-${i}`}
                      href={g.url ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir em tamanho real: ${g.alt || `${data.name} — imagem ${i + 1}`}`}
                      className="block overflow-hidden rounded-2xl border border-border bg-muted cursor-zoom-in group"
                    >
                      <img
                        src={g.url ?? ""}
                        alt={g.alt || `${data.name} — imagem ${i + 1}`}
                        loading="lazy"
                        className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </a>
                  ))}
              </div>
            </div>
          </section>
        )}

        {data.sections.length > 0 && (
          <section className="py-16 bg-muted/20">
            <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-10">
              {data.sections.map((sec: { title: string; body: string }, i: number) => (
                <article key={`${sec.title}-${i}`}>
                  {sec.title && <h2 className="text-2xl lg:text-3xl font-bold mb-4">{sec.title}</h2>}
                  {sec.body && (
                    <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground leading-relaxed">
                      {sec.body}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}



        <section className="py-16">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8 flex items-center gap-3">
              <HelpCircle className="w-7 h-7 text-primary" /> Perguntas frequentes
            </h2>
            <div className="space-y-3">
              {data.faq.map((f: { q: string; a: string }) => (
                <details key={f.q} className="group p-5 rounded-2xl border border-border bg-card">
                  <summary className="cursor-pointer font-semibold list-none flex justify-between items-center">
                    {f.q}
                    <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {hasGeo && (
          <section className="py-16 bg-muted/30">
            <div className="mx-auto max-w-5xl px-5 lg:px-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" /> {data.name} por cidade
              </h2>
              <p className="text-muted-foreground mb-6">Páginas dedicadas com contexto local para empresas em cada região.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(CITIES).map((c) => (
                  <Link
                    key={c.slug}
                    to="/$city/$service"
                    params={{ city: c.slug, service: slug }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{data.name} em {c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.state} · {c.region}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-sm">
                <Link to="/cidades" className="text-primary story-link">Ver todas as cidades</Link>
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold">Você também pode gostar</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Recomendações que combinam com {data.name.toLowerCase()}.
                </p>
              </div>
            </div>
            <RelatedServicesCarousel items={otherSvcs} />
            <div className="mt-10 flex justify-center">
              <ServiceCTA
                serviceSlug={slug}
                funnels={funnels}
                location="detail"
                label={data.ctaLabel}
              />
            </div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
