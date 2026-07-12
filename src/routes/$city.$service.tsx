import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, CheckCircle2, XCircle, Sparkles, HelpCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";
import { absUrl, ORIGIN, ORG_REF, DEFAULT_OG_IMAGE, breadcrumbLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CITIES, relatedCities, type CityInfo } from "@/lib/geo-data";
import { SERVICES, GEO_SERVICE_SLUGS, relatedServices, type ServiceData } from "@/lib/services-data";
import { heroSubtitle, localContext, combinedFaq, pageTitle, pageDescription } from "@/lib/content-variations";
import { cases } from "@/lib/cases-data";

const GEO_SET = new Set(GEO_SERVICE_SLUGS);

export const Route = createFileRoute("/$city/$service")({
  beforeLoad: ({ params }) => {
    if (!CITIES[params.city] || !GEO_SET.has(params.service) || !SERVICES[params.service]) {
      throw notFound();
    }
  },
  loader: ({ params }) => ({
    city: CITIES[params.city] as CityInfo,
    service: SERVICES[params.service] as ServiceData,
    citySlug: params.city,
    serviceSlug: params.service,
  }),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "0WEB" }] };
    const { city, service } = loaderData;
    const title = pageTitle(city, service);
    const desc = pageDescription(city, service);
    const url = absUrl(`/${params.city}/${params.service}`);
    const faq = combinedFaq(city, service);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: [...service.keywords, city.name, city.state, city.stateCode].join(", ") },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
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
                name: `${service.name} em ${city.name}`,
                description: desc,
                serviceType: service.serviceType,
                category: service.category,
                url,
                areaServed: {
                  "@type": "City",
                  name: city.name,
                  addressRegion: city.state,
                  addressCountry: "BR",
                },
                provider: ORG_REF,
              },
              {
                "@type": "LocalBusiness",
                "@id": `${url}#localbusiness`,
                name: `0WEB · ${service.name} em ${city.name}`,
                url,
                priceRange: "$$",
                areaServed: {
                  "@type": "City",
                  name: city.name,
                  addressRegion: city.state,
                  addressCountry: "BR",
                },
                geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lng },
                address: {
                  "@type": "PostalAddress",
                  addressLocality: city.name,
                  addressRegion: city.state,
                  addressCountry: "BR",
                },
              },
              {
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                mainEntity: faq.map((f: {q:string;a:string}) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "WebPage",
                "@id": url,
                url,
                name: title,
                description: desc,
                inLanguage: "pt-BR",
                isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
              },
              breadcrumbLd([
                { name: "Serviços", path: "/servicos" },
                { name: service.name, path: `/${params.service}` },
                { name: city.state, path: `/estados/${city.stateCode.toLowerCase()}` },
                { name: city.name, path: `/${params.city}/${params.service}` },
              ]),
            ],
          }),
        },
      ],
    };
  },
  component: GeoPage,
});

function GeoPage() {
  const { city, service, citySlug, serviceSlug } = Route.useLoaderData();
  const { open: openFunnel } = useWaFunnel();
  const subtitle = heroSubtitle(city, service);
  const context = localContext(city, service);
  const faq = combinedFaq(city, service);
  const related = relatedCities(city.slug, 6);
  const relatedSvcs = relatedServices(service.slug, 4).filter((s) => GEO_SET.has(s.slug));
  const localCase = cases.find((c) => c.city?.toLowerCase().includes(city.name.toLowerCase().split(" ")[0]));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs
        items={[
          { name: "Serviços", path: "/servicos" },
          { name: service.name, path: `/${serviceSlug}` },
          { name: city.state, path: `/estados/${city.stateCode.toLowerCase()}` },
          { name: city.name, path: `/${citySlug}/${serviceSlug}` },
        ]}
      />
      <main className="pt-6">
        {/* HERO */}
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Atendemos em {city.name} · {city.stateCode}
            </p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              {service.name} em <span className="text-gradient">{city.name}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
            <button
              type="button"
              onClick={() => {
                trackEvent("cta_click", { label: "geo_whatsapp", city: citySlug, service: serviceSlug });
                trackConversion("whatsapp_click", { location: `geo_${citySlug}_${serviceSlug}` });
                openFunnel(`geo_${citySlug}_${serviceSlug}`);
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
            >
              {service.ctaLabel} em {city.name} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* LOCAL CONTEXT */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <p className="text-lg leading-relaxed text-foreground/90">{context}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Região: <strong>{city.region}</strong> · População: <strong>{city.population.toLocaleString("pt-BR")}</strong> · DDD: <strong>{city.ddd}</strong> · Mesorregião: <strong>{city.mesorregiao}</strong>
            </p>
          </div>
        </section>

        {/* PROBLEMS */}
        <section className="py-12 bg-muted/30">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Problemas comuns que resolvemos em {city.name}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {service.problems.map((p: string) => (
                <div key={p} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">O que sua empresa em {city.name} ganha com a 0WEB</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {service.benefits.map((b: string) => (
                <div key={b} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8">Como entregamos {service.name.toLowerCase()} para {city.gentilico}s</h2>
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {service.process.map((p: {step:string;desc:string}, i: number) => (
                <li key={p.step} className="p-5 rounded-2xl border border-border bg-card">
                  <span className="text-xs font-mono text-primary">0{i + 1}</span>
                  <h3 className="mt-2 font-semibold text-lg">{p.step}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* RELATED CASE */}
        {localCase && (
          <section className="py-16">
            <div className="mx-auto max-w-4xl px-5 lg:px-8">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Caso relacionado</p>
              <h2 className="mt-2 text-2xl lg:text-3xl font-bold">{localCase.brand}</h2>
              <p className="mt-3 text-muted-foreground">{localCase.tagline}</p>
              <Link
                to="/cases/$slug"
                params={{ slug: localCase.slug }}
                className="mt-4 inline-flex items-center gap-2 text-primary font-semibold story-link"
              >
                Ver caso completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8 flex items-center gap-3">
              <HelpCircle className="w-7 h-7 text-primary" /> Perguntas frequentes
            </h2>
            <div className="space-y-3">
              {faq.map((f: {q:string;a:string}) => (
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

        {/* INTERLINKS — related services in this city */}
        {relatedSvcs.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-5xl px-5 lg:px-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" /> Outros serviços em {city.name}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {relatedSvcs.map((s) => (
                  <Link
                    key={s.slug}
                    to="/$city/$service"
                    params={{ city: citySlug, service: s.slug }}
                    className="block p-4 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">{s.category}</p>
                    <h3 className="mt-1 font-semibold">{s.name} em {city.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* INTERLINKS — same service in related cities */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">
              {service.name} em outras cidades do Brasil
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  to="/$city/$service"
                  params={{ city: c.slug, service: serviceSlug }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                >
                  <div>
                    <p className="font-semibold">{service.name} em {c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.state} · {c.region}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </Link>
              ))}
            </div>
            <div className="mt-6 text-sm">
              <Link to="/cidades" className="text-primary story-link">Ver todas as cidades atendidas</Link>
              {" · "}
              <Link to="/servicos" className="text-primary story-link">Ver todos os serviços</Link>
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
