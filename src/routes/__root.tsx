import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowRight, Globe, Megaphone, Search, Bot } from "lucide-react";

import appCss from "../styles.css?url";
import faviconAsset from "../assets/favicon-0web.png.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { WaFunnelProvider } from "../components/site/WaFunnelModal";
import { AnalyticsBootstrap } from "../components/site/AnalyticsBootstrap";
import { ErrorState } from "../components/site/ErrorState";
import { RouteLoader } from "../components/site/RouteLoader";
import { CartDrawer } from "../components/site/CartDrawer";
import { AuthErrorGuard } from "../components/site/AuthErrorGuard";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { Toaster } from "../components/ui/sonner";
import { SpacingDebugOverlay } from "../components/site/SpacingDebugOverlay";
import { logNotFound } from "../lib/route-404.functions";
import { primeGeoSilently } from "@/lib/geo-location";
import { HYDRATION_GUARD_SCRIPT } from "@/lib/hydration-guard";

const NOT_FOUND_SERVICES: Array<{ slug: string; name: string; desc: string; Icon: typeof Globe }> = [
  { slug: "criacao-de-sites", name: "Criação de Sites", desc: "Sites profissionais, rápidos e prontos para converter.", Icon: Globe },
  { slug: "seo", name: "SEO", desc: "Primeiras posições no Google com tráfego orgânico recorrente.", Icon: Search },
  { slug: "trafego-pago", name: "Tráfego Pago", desc: "Campanhas Google e Meta Ads com CPA otimizado.", Icon: Megaphone },
  { slug: "automacao-com-ia", name: "Automação com IA", desc: "Atendimento e qualificação de leads no WhatsApp.", Icon: Bot },
];

function NotFoundComponent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const path = window.location.pathname + window.location.search;
      const key = `404-logged:${path}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      void logNotFound({
        data: {
          path: window.location.pathname,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent || null,
        },
      }).catch(() => {});
    } catch {
      /* noop */
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-32 lg:pt-40 pb-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Erro 404</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold font-display">
            Página não encontrada
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Mas você pode encontrar o que precisa aqui:
          </p>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {NOT_FOUND_SERVICES.map((s) => (
              <Link
                key={s.slug}
                to="/servicos/$slug"
                params={{ slug: s.slug }}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-elegant transition"
              >
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                  <s.Icon className="w-5 h-5" />
                </span>
                <h2 className="mt-4 font-semibold">{s.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Ver serviço <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
            >
              Ir para o início
            </Link>
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold hover:bg-muted transition"
            >
              Ver Serviços
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const isDev = import.meta.env.DEV;
  const message = error?.message ?? "";
  const looksLikeMissingRoute = /Failed to (load|fetch dynamically imported|resolve).*\/routes\//i.test(
    message,
  );

  const diagnostics = isDev ? (
    <>
      <p className="font-mono text-[11px] leading-relaxed text-foreground/80 break-words">
        {error?.name}: {message}
      </p>
      {looksLikeMissingRoute ? (
        <p className="text-foreground/80">
          Parece que um arquivo de rota foi renomeado/removido. Limpe o cache do Vite e reinicie:
          <code className="mt-1 block rounded bg-background px-2 py-1 text-foreground">
            rm -rf node_modules/.vite .vite .output && bun run dev
          </code>
        </p>
      ) : null}
    </>
  ) : null;

  return (
    <ErrorState
      kind="500"
      onRetry={() => {
        router.invalidate();
        reset();
      }}
      diagnostics={diagnostics}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0066FF" },
      { title: "0WEB · Tecnologia que gera crescimento" },
      { name: "description", content: "Sites, sistemas, IA e marketing digital para empresas que querem crescer." },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      // Geo targeting (Curitiba/PR/BR + RMC)
      { name: "geo.region", content: "BR-PR" },
      { name: "geo.placename", content: "Curitiba" },
      { name: "geo.position", content: "-25.4284;-49.2733" },
      { name: "ICBM", content: "-25.4284, -49.2733" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: faviconAsset.url },
      { rel: "apple-touch-icon", href: faviconAsset.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
    scripts: [
      { children: HYDRATION_GUARD_SCRIPT },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://0web.com.br/#org",
              name: "0WEB",
              url: "https://0web.com.br",
              logo: "https://0web.com.br/favicon.ico",
              taxID: "41.723.708/0001-58",
              sameAs: [
                "https://www.instagram.com/0web.com.br",
                "https://www.linkedin.com/company/0web",
              ],
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://0web.com.br/#localbusiness",
              name: "0WEB",
              image: "https://0web.com.br/favicon.ico",
              url: "https://0web.com.br",
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                addressCountry: "BR",
                addressRegion: "PR",
                addressLocality: "Curitiba",
              },
              geo: { "@type": "GeoCoordinates", latitude: -25.4284, longitude: -49.2733 },
              areaServed: [
                { "@type": "Country", name: "Brasil" },
                { "@type": "City", name: "Curitiba", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "São José dos Pinhais", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Colombo", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Araucária", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Pinhais", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Fazenda Rio Grande", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Campo Largo", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Almirante Tamandaré", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Piraquara", address: { "@type": "PostalAddress", addressRegion: "PR", addressCountry: "BR" } },
                { "@type": "City", name: "Belo Horizonte", address: { "@type": "PostalAddress", addressRegion: "MG", addressCountry: "BR" } },
              ],
              openingHoursSpecification: [{
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                opens: "09:00",
                closes: "18:00",
              }],
            },
            {
              "@type": "WebSite",
              "@id": "https://0web.com.br/#website",
              url: "https://0web.com.br",
              name: "0WEB",
              inLanguage: "pt-BR",
              publisher: { "@id": "https://0web.com.br/#org" },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://0web.com.br/blog?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* GTM noscript fallback is injected client-side by AnalyticsBootstrap when a valid GTM ID is configured. */}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hash) return; // preserve in-page anchor scrolling
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    // Se estiver muito longe do topo, faz um salto instantâneo para evitar
    // animação longa e travada; caso contrário, sobe de forma suave.
    if (reduce || currentY > 2400) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [pathname, hash]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Estimativa de localidade por IP, em background e silenciosa. Sem prompt
  // de GPS, sem exibição ao visitante e sem impacto se falhar.
  useEffect(() => {
    primeGeoSilently();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <WaFunnelProvider>
        <AnalyticsBootstrap />
        <AuthErrorGuard />
        <ScrollToTop />
        <RouteLoader />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CartDrawer />
        <Toaster position="top-center" richColors />
        <SpacingDebugOverlay />
      </WaFunnelProvider>
    </QueryClientProvider>
  );
}
