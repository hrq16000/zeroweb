import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { OrderSummaryCard } from "@/components/site/OrderSummaryCard";
import { absUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Resumo do pedido · 0WEB";
const DESC = "Acompanhe os itens, status e próximos passos do seu pedido na 0WEB.";

export const Route = createFileRoute("/pedido/$id")({
  params: {
    parse: (raw) => z.object({ id: z.string().uuid() }).parse(raw),
    stringify: (parsed) => ({ id: String(parsed.id) }),
  },
  head: ({ params }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: absUrl(`/pedido/${params.id}`) },
    ],
    links: [{ rel: "canonical", href: absUrl(`/pedido/${params.id}`) }],
  }),
  ssr: false,
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Voltar ao painel
          </Link>
          <h1 className="mt-4 text-3xl font-bold font-display">Resumo do pedido</h1>
          <p className="mt-2 text-muted-foreground">
            Identificador permanente: <span className="font-mono">{id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
        <OrderSummaryCard orderId={id} />
      </main>
      <Footer />
    </div>
  );
}
