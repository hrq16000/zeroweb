import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
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
import { ErrorState } from "../components/site/ErrorState";
import { RouteLoader } from "../components/site/RouteLoader";
import { CartDrawer } from "../components/site/CartDrawer";
import { AuthErrorGuard } from "../components/site/AuthErrorGuard";
import { Toaster } from "../components/ui/sonner";
import { logNotFound } from "../lib/route-404.functions";

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
  return <ErrorState kind="404" />;
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
        <AuthErrorGuard />
        <ScrollToTop />
        <RouteLoader />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CartDrawer />
        <Toaster position="top-center" richColors />
      </WaFunnelProvider>
    </QueryClientProvider>
  );
}
