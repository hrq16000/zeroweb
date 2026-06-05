import { createFileRoute, notFound } from "@tanstack/react-router";
import { FunnelRunner } from "@/components/funnel/FunnelRunner";
import { getPublicFunnel } from "@/lib/dynamic-funnel.functions";

export const Route = createFileRoute("/f/$slug")({
  ssr: false,
  loader: async ({ params }) => {
    const funnel = await getPublicFunnel({ data: { slug: params.slug } });
    if (!funnel) throw notFound();
    return { funnel };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.funnel ? `${loaderData.funnel.name} — 0web` : "Funil — 0web" },
      { name: "description", content: loaderData?.funnel?.description ?? "Diagnóstico rápido com a 0web." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Funil não encontrado</h1>
        <p className="text-muted-foreground">Verifique o link ou volte para a página inicial.</p>
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
  component: FunnelPage,
});

function FunnelPage() {
  const { funnel } = Route.useLoaderData();
  return <FunnelRunner funnel={funnel} />;
}
