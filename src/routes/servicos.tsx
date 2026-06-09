import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "motion/react";
import { SmartServiceSearch, type SearchableService } from "@/components/site/SmartServiceSearch";
import { ServicosBreadcrumbs } from "@/components/site/ServicosBreadcrumbs";


/**
 * Layout da loja virtual (/servicos/*). Barra de busca + carrinho aparece
 * com animação suave abaixo do header. Páginas filhas renderizam no <Outlet />.
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
  const prefersReducedMotion = useReducedMotion();

  // Scroll-shrink suave: a barra reduz levemente nos primeiros 120px de rolagem.
  const { scrollY } = useScroll();
  const rawScale = useTransform(scrollY, [0, 120], [1, 0.96]);
  const rawOpacity = useTransform(scrollY, [0, 120], [1, 0.92]);
  const scale = useSpring(rawScale, { stiffness: 220, damping: 28, mass: 0.4 });
  const opacity = useSpring(rawOpacity, { stiffness: 220, damping: 28, mass: 0.4 });

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

  const cartLabel = `Carrinho (${cartCount} ite${cartCount === 1 ? "m" : "ns"})`;

  return (
    <>
      <motion.nav
        aria-label="Busca de serviços e carrinho"
        initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pt-page-tight"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div
            style={prefersReducedMotion ? undefined : { scale, opacity, transformOrigin: "top center", willChange: "transform" }}
            className="group relative rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.18)] hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.28)] focus-within:border-primary/60 focus-within:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.35)] transition-shadow"
          >
            <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5">
              <div className="flex-1 min-w-0">
                <SmartServiceSearch
                  services={searchable}
                  value={q}
                  onChange={setQ}
                  trending={["Site Express", "Tráfego pago", "SEO", "Google Meu Negócio"]}
                />
              </div>

              <div className="h-7 w-px bg-border/60 hidden sm:block" aria-hidden="true" />

              <button
                type="button"
                aria-label={cartLabel}
                onClick={() => window.dispatchEvent(new CustomEvent("0web:cart-open"))}
                className="relative shrink-0 grid place-items-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border bg-background/70 text-foreground/80 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 transition"
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold tracking-tight grid place-items-center shadow-sm"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      <Outlet />
    </>
  );
}
