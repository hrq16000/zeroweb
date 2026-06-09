import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { SmartServiceSearch, type SearchableService } from "@/components/site/SmartServiceSearch";


/**
 * Layout da loja virtual (/servicos/*). Renderiza uma barra sticky com
 * logo + busca inteligente + ícone do carrinho — presente em /servicos,
 * /servicos/$slug e demais subrotas. As páginas filhas renderizam dentro
 * do <Outlet />.
 */
export const Route = createFileRoute("/servicos")({
  loader: async () => {
    const { listServicesPublic } = await import("@/lib/services-public.functions");
    const { services } = await listServicesPublic();
    const searchable: SearchableService[] = services.map((s) => ({
      slug: s.slug,
      name: s.name,
      category: s.category,
      description: s.description,
      keywords: s.keywords,
    }));
    return { searchable };
  },
  component: ServicosLayout,
});

function ServicosLayout() {
  const { searchable } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // Lê contador do carrinho do localStorage (será populado na Onda 2).
  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem("0web_cart");
        if (!raw) return setCartCount(0);
        const arr = JSON.parse(raw);
        setCartCount(Array.isArray(arr) ? arr.reduce((s, i) => s + (i?.qty ?? 1), 0) : 0);
      } catch {
        setCartCount(0);
      }
    }
    read();
    window.addEventListener("storage", read);
    window.addEventListener("0web:cart-changed", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("0web:cart-changed", read);
    };
  }, []);

  return (
    <>
      <div className="sticky top-16 z-40 mt-16 border-b border-border bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-5 py-3 flex items-center gap-3 min-h-[68px]">

          <div className="flex-1 min-w-0">
            <SmartServiceSearch
              services={searchable}
              value={q}
              onChange={setQ}
              trending={["Site Express", "Tráfego pago", "SEO", "Google Meu Negócio"]}
            />
          </div>

          <button
            type="button"
            aria-label={`Carrinho (${cartCount} ite${cartCount === 1 ? "m" : "ns"})`}
            onClick={() => window.dispatchEvent(new CustomEvent("0web:cart-open"))}
            className="relative shrink-0 grid place-items-center w-11 h-11 rounded-full border border-border bg-card hover:border-primary hover:text-primary active:scale-95 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold grid place-items-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <Outlet />
    </>
  );
}
