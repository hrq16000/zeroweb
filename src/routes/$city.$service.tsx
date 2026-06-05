import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

import { absUrl, ORIGIN, ORG_REF, DEFAULT_OG_IMAGE, breadcrumbLd, SERVICES_DICT, CITIES_DICT } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

// Only a subset of services has a dedicated geo page (avoids thin combinations).
const GEO_SERVICE_SLUGS = new Set([
  "criacao-de-sites",
  "landing-pages",
  "loja-virtual",
  "seo",
  "marketing-digital",
  "automacao-com-ia",
]);

export const Route = createFileRoute("/$city/$service")({
  beforeLoad: ({ params }) => {
    if (!CITIES_DICT[params.city] || !GEO_SERVICE_SLUGS.has(params.service) || !SERVICES_DICT[params.service]) {
      throw notFound();
    }
  },
  loader: ({ params }) => ({
    city: CITIES_DICT[params.city],
    service: SERVICES_DICT[params.service].name,
    serviceInfo: SERVICES_DICT[params.service],
    citySlug: params.city,
    serviceSlug: params.service,
  }),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "0WEB" }] };
    const title = `${loaderData.service} em ${loaderData.city} · 0WEB`;
    const desc = `${loaderData.service} em ${loaderData.city}: agência com time sênior, foco em performance e conversão. Solicite orçamento sem compromisso.`;
    const url = absUrl(`/${params.city}/${params.service}`);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
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
                name: `${loaderData.service} em ${loaderData.city}`,
                description: desc,
                serviceType: loaderData.serviceInfo.serviceType,
                url,
                areaServed: { "@type": "City", name: loaderData.city, addressCountry: "BR" },
                provider: ORG_REF,
              },
              {
                "@type": "LocalBusiness",
                "@id": `${url}#localbusiness`,
                name: `0WEB · ${loaderData.service} em ${loaderData.city}`,
                url,
                telephone: ORG_REF.telephone,
                email: ORG_REF.email,
                priceRange: "$$",
                areaServed: { "@type": "City", name: loaderData.city, addressCountry: "BR" },
                address: { "@type": "PostalAddress", addressLocality: loaderData.city, addressCountry: "BR" },
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
                { name: "Serviços", path: "/#solutions" },
                { name: loaderData.service, path: `/${params.service}` },
                { name: loaderData.city, path: `/${params.city}/${params.service}` },
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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[
        { name: "Serviços", path: "/#solutions" },
        { name: service, path: `/${serviceSlug}` },
        { name: city, path: `/${citySlug}/${serviceSlug}` },
      ]} />
      <main className="pt-6">

        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Atendemos em {city}
            </p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              {service} em <span className="text-gradient">{city}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Agência especializada em {service.toLowerCase()} para empresas em {city}.
              Time sênior, entrega ágil e foco em resultado real.
            </p>
            <button
              type="button"
              onClick={() => {
                trackEvent("cta_click", { label: "geo_whatsapp", city: citySlug, service: serviceSlug });
                trackConversion("whatsapp_click", { location: `geo_${citySlug}_${serviceSlug}` });
                openFunnel(`geo_${citySlug}_${serviceSlug}`);
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
            >
              Orçamento para {city} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Por que escolher a 0WEB em {city}?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                `Atendimento focado em empresas de ${city}`,
                "Time sênior com +20 anos de mercado",
                "Suporte rápido e dedicado",
                "Cases comprovados em diversos segmentos",
              ].map((b) => (
                <div key={b} className="flex items-start gap-3 p-5 rounded-2xl border border-border bg-card">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{b}</span>
                </div>
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
