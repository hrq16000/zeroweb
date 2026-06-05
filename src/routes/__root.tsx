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

import appCss from "../styles.css?url";
import faviconAsset from "../assets/favicon-0web.png.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { WaFunnelProvider } from "../components/site/WaFunnelModal";
import { AnalyticsBootstrap } from "../components/site/AnalyticsBootstrap";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
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
              email: "contato@0web.com.br",
              telephone: "+55-41-99745-2053",
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
              telephone: "+55-41-99745-2053",
              email: "contato@0web.com.br",
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                addressCountry: "BR",
                addressRegion: "PR",
                addressLocality: "Curitiba",
              },
              areaServed: "BR",
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
    if (hash) return; // preserve in-page anchor scrolling
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, hash]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <WaFunnelProvider>
        <AnalyticsBootstrap />
        <ScrollToTop />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </WaFunnelProvider>
    </QueryClientProvider>
  );
}
