import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FunnelRunner } from "@/components/funnel/FunnelRunner";
import { getPublicFunnel } from "@/lib/dynamic-funnel.functions";

const SLUG = "diagnostico-0web";
const URL_PAGE = "https://0web.com.br/solicitar-diagnostico";
const TITLE = "Solicitar Diagnóstico Digital Gratuito · 0WEB";
const DESC =
  "Responda algumas perguntas rápidas e receba um diagnóstico personalizado de marketing digital, SEO local e WhatsApp para a sua empresa.";

export const Route = createFileRoute("/solicitar-diagnostico")({
  ssr: false,
  loader: async () => {
    const funnel = await getPublicFunnel({ data: { slug: SLUG } });
    if (!funnel) throw notFound();
    return { funnel };
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL_PAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL_PAGE }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: DESC,
          url: URL_PAGE,
          inLanguage: "pt-BR",
          isPartOf: { "@type": "WebSite", name: "0WEB", url: "https://0web.com.br" },
        }),
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Diagnóstico indisponível</h1>
        <p className="text-muted-foreground">Tente novamente em instantes ou fale conosco no WhatsApp.</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">Voltar para o início</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center text-center p-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Algo deu errado</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: SolicitarDiagnosticoPage,
});

function SolicitarDiagnosticoPage() {
  const { funnel } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-28 lg:pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <header className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Diagnóstico em 2 minutos</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold font-display">
              Vamos descobrir o melhor caminho para a sua empresa
            </h1>
            <p className="mt-3 text-muted-foreground">
              Uma pergunta por vez. No final, montamos um plano com sites, SEO local, anúncios e WhatsApp sob medida.
            </p>
          </header>
          <FunnelRunner funnel={funnel} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
