import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FunnelRunner } from "@/components/funnel/FunnelRunner";
import { getPublicFunnel, type FunnelDefinition } from "@/lib/dynamic-funnel.functions";
import { parseContactIntent, resolveFunnelFromIntent } from "@/lib/contact-intent";

const TITLE = "Contato 0WEB · Diagnóstico pelo funil";
const DESC = "Inicie um diagnóstico com a 0WEB por formulário seguro. Sem exposição pública de e-mail, telefone ou canais diretos.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://0web.com.br/contato" },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "https://0web.com.br/og-default.jpg" },
      { property: "og:image:alt", content: "Fale com a 0WEB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/og-default.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/contato" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ContactPage",
              "@id": "https://0web.com.br/contato#contactpage",
              url: "https://0web.com.br/contato",
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
              mainEntity: {
                "@type": "Organization",
                name: "0WEB",
                url: "https://0web.com.br/",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                { "@type": "ListItem", position: 2, name: "Contato", item: "https://0web.com.br/contato" },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const fetchFunnel = useServerFn(getPublicFunnel);
  const [funnel, setFunnel] = useState<FunnelDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = parseContactIntent(params);
    const slug = intent ? resolveFunnelFromIntent(intent) : "diagnostico-0web";
    fetchFunnel({ data: { slug } })
      .then((f) => {
        if (!f) setError("Funil indisponível no momento. Tente novamente em alguns instantes.");
        else setFunnel(f);
      })
      .catch(() => setError("Não foi possível carregar o formulário agora."));
  }, [fetchFunnel]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-4xl px-5 lg:px-8">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-wider text-primary font-semibold">
            Diagnóstico seguro
          </motion.p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold font-display">Conte seu cenário pelo funil da 0WEB</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Este é o fallback técnico dos CTAs. Em páginas públicas, o clique normal abre o mesmo funil em modal.
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-card overflow-hidden">
            {error ? (
              <div className="p-8 text-center">
                <ShieldCheck className="w-8 h-8 mx-auto text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">{error}</p>
              </div>
            ) : funnel ? (
              <FunnelRunner funnel={funnel} embedded />
            ) : (
              <div className="min-h-[320px] grid place-items-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
