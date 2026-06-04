import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent } from "@/lib/analytics";

const CITIES: Record<string, string> = {
  "curitiba": "Curitiba",
  "sao-paulo": "São Paulo",
  "rio-de-janeiro": "Rio de Janeiro",
  "belo-horizonte": "Belo Horizonte",
  "porto-alegre": "Porto Alegre",
  "fortaleza": "Fortaleza",
  "salvador": "Salvador",
  "brasilia": "Brasília",
  "florianopolis": "Florianópolis",
  "recife": "Recife",
};

const SERVICES: Record<string, string> = {
  "criacao-de-sites": "Criação de Sites",
  "landing-pages": "Landing Pages",
  "loja-virtual": "Loja Virtual",
  "seo": "SEO",
  "marketing-digital": "Marketing Digital",
  "automacao-com-ia": "Automação com IA",
};

export const Route = createFileRoute("/$city/$service")({
  beforeLoad: ({ params }) => {
    if (!CITIES[params.city] || !SERVICES[params.service]) throw notFound();
  },
  loader: ({ params }) => ({
    city: CITIES[params.city],
    service: SERVICES[params.service],
    citySlug: params.city,
    serviceSlug: params.service,
  }),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "0WEB" }] };
    const title = `${loaderData.service} em ${loaderData.city} · 0WEB`;
    const desc = `${loaderData.service} em ${loaderData.city}: agência especializada em resultado, performance e conversão. Solicite orçamento.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `https://0web.com.br/${params.city}/${params.service}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: `0WEB · ${loaderData.service} ${loaderData.city}`,
          areaServed: loaderData.city,
          url: `https://0web.com.br/${params.city}/${params.service}`,
        }),
      }],
    };
  },
  component: GeoPage,
});

function GeoPage() {
  const { city, service, citySlug, serviceSlug } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32">
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
            <a
              href={whatsappUrl(`Quero ${service} em ${city}.`, `geo_${citySlug}_${serviceSlug}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { label: "geo_whatsapp", city: citySlug, service: serviceSlug })}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
            >
              Orçamento para {city} <ArrowRight className="w-4 h-4" />
            </a>
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
