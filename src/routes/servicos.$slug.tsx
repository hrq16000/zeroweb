import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, XCircle, HelpCircle, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";
import { absUrl, ORIGIN, ORG_REF, DEFAULT_OG_IMAGE, breadcrumbLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GEO_SERVICE_SLUGS, relatedServices } from "@/lib/services-data";
import { CITIES } from "@/lib/geo-data";
import { getServicePublic } from "@/lib/services-public.functions";

const GEO_SET = new Set(GEO_SERVICE_SLUGS);

export const Route = createFileRoute("/servicos/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug === "site-express") {
      throw redirect({ to: "/servicos/site-express" });
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
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { name: "keywords", content: loaderData.keywords.join(", ") },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.description },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                "@id": `${url}#service`,
                name: loaderData.h1,
                description: loaderData.description,
                serviceType: loaderData.serviceType,
                category: loaderData.category,
                url,
                areaServed: { "@type": "Country", name: "BR" },
                provider: ORG_REF,
              },
              {
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                mainEntity: loaderData.faq.map((f: { q: string; a: string }) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "WebPage",
                "@id": url,
                url,
                name: loaderData.title,
                description: loaderData.description,
                inLanguage: "pt-BR",
                isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
              },
              breadcrumbLd([
                { name: "Serviços", path: "/servicos" },
                { name: loaderData.name, path: `/servicos/${params.slug}` },
              ]),
            ],
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
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { open: openFunnel } = useWaFunnel();
  const otherSvcs = relatedServices(slug, 4);
  const hasGeo = GEO_SET.has(slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Serviços", path: "/servicos" }, { name: data.name, path: `/servicos/${slug}` }]} />
      <main className="pt-6">
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">{data.category}</p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              {data.h1.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-gradient">{data.h1.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">{data.description}</p>
            <button
              type="button"
              onClick={() => {
                trackEvent("cta_click", { label: "service_whatsapp", location: slug });
                trackConversion("whatsapp_click", { location: `service_${slug}` });
                openFunnel(`service_${slug}`);
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
            >
              {data.ctaLabel} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

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
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Serviços relacionados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {otherSvcs.map((s) => (
                <Link
                  key={s.slug}
                  to="/servicos/$slug"
                  params={{ slug: s.slug }}
                  className="block p-4 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                >
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold">{s.category}</p>
                  <h3 className="mt-1 font-semibold">{s.name}</h3>
                </Link>
              ))}
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
