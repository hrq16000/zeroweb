import { subscribeScroll } from "@/lib/scroll-bus";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, ShoppingCart, LogIn, ChevronDown } from "lucide-react";
import { cartCount, openCart } from "@/lib/cart";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trackEvent } from "@/lib/analytics";

import { listServicesNav } from "@/lib/services-nav.functions";
const GlobalSearch = lazy(() =>
  import("@/components/site/GlobalSearch").then((m) => ({ default: m.GlobalSearch })),
);
import logoAsset from "@/assets/logo-0web.png.asset.json";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

// Desktop nav (Cases, Planos, FAQ ficam só no footer — Header enxuto)
const desktopNav: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/solucoes", label: "Soluções" },
  { to: "/sobre", label: "Sobre" },
  { to: "/blog", label: "Blog" },
];

// Mobile mantém todos os links de suporte
const mobileNav: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/solucoes", label: "Soluções" },
  { to: "/cases", label: "Cases" },
  { to: "/planos", label: "Planos" },
  { to: "/sobre", label: "Sobre" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/contato", label: "Contato" },
];


export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [cartQty, setCartQty] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  // WhatsApp removido do header; o botão flutuante mantém o canal.
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: navData } = useQuery({
    queryKey: ["services-nav"],
    queryFn: () => listServicesNav(),
    staleTime: 5 * 60 * 1000,
  });
  const menuServices = navData?.menu ?? [];

  const isLojaArea =
    pathname.startsWith("/servicos") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/categoria") ||
    pathname.startsWith("/marketplace");

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLojaArea) return;
    const update = () => setCartQty(cartCount());
    update();
    window.addEventListener("0web:cart-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("0web:cart-changed", update);
      window.removeEventListener("storage", update);
    };
  }, [isLojaArea]);


  useEffect(() => {
    return subscribeScroll((s) => setScrolled(s.y > 12));
  }, []);

  // Global ⌘K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        trackEvent("search_icon_click", {
          location: "keyboard",
          source: pathname === "/" ? "home" : "other",
          route: pathname,
        });
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (t && headerRef.current && !headerRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-elegant" : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-5 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20"
        }`}
      >
        <Link to="/" aria-label="0WEB — Início" className="flex items-center">
          <img
            src={logoAsset.url}
            alt="0WEB — do zero ao digital"
            width={920}
            height={250}
            className={`w-auto transition-all duration-300 ${
              scrolled ? "h-8 lg:h-10" : "h-12 lg:h-20"
            }`}
            fetchPriority="high"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Início
          </Link>

          {/* Dropdown Serviços (gerenciado pelo painel via show_in_menu) */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <Link
              to="/servicos"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              onClick={() => setServicesOpen(false)}
            >
              Serviços
              {menuServices.length > 0 && <ChevronDown className="w-3.5 h-3.5" />}
            </Link>
            <AnimatePresence>
              {servicesOpen && menuServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
                >
                  <div className="w-[28rem] max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-elegant p-3 grid grid-cols-2 gap-1">
                    {menuServices.map((s) => (
                      <Link
                        key={s.slug}
                        to="/servicos/$slug"
                        params={{ slug: s.slug }}
                        onClick={() => setServicesOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground/80 hover:text-foreground transition-colors"
                      >
                        <span className="block font-medium">{s.name}</span>
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.category}
                        </span>
                      </Link>
                    ))}
                    <Link
                      to="/servicos"
                      onClick={() => setServicesOpen(false)}
                      className="col-span-2 mt-1 text-center text-sm font-semibold text-primary hover:underline py-2"
                    >
                      Ver Serviços →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {desktopNav.slice(1).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>


        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              trackEvent("search_icon_click", {
                location: "header",
                source: pathname === "/" ? "home" : "other",
                route: pathname,
              });
              setSearchOpen(true);
            }}
            aria-label="Buscar no site"
            title="Buscar (⌘K)"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="w-4 h-4" />
          </button>
          {isLojaArea && (
            <button
              type="button"
              onClick={() => {
                trackEvent("cart_icon_click", {
                  location: "header",
                  source: pathname === "/" ? "home" : "loja",
                  route: pathname,
                  qty: cartQty,
                });
                openCart();
              }}
              aria-label={`Abrir carrinho (${cartQty} itens)`}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted transition"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartQty > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                  {cartQty}
                </span>
              )}
            </button>
          )}
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground border border-border rounded-full px-4 py-2"
          >
            <LogIn className="w-4 h-4" /> Conectar
          </Link>
          <FunnelCTAButton
            intent={{ purpose: "diagnosis", source: "header", pagePath: "/", placement: "header" }}
            label="Solicitar Diagnóstico"
            location="header"
            showArrow={false}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 shadow-glow-primary hover:opacity-95 transition"
          />
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              trackEvent("search_icon_click", {
                location: "header_mobile",
                source: pathname === "/" ? "home" : "other",
                route: pathname,
              });
              setSearchOpen(true);
            }}
            aria-label="Buscar no site"
            className="p-2 rounded-lg hover:bg-muted text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="w-5 h-5" />
          </button>
          {isLojaArea && (
            <button
              type="button"
              onClick={() => {
                trackEvent("cart_icon_click", {
                  location: "header_mobile",
                  source: "loja",
                  route: pathname,
                  qty: cartQty,
                });
                openCart();
              }}
              aria-label={`Abrir carrinho (${cartQty} itens)`}
              className="relative p-2 rounded-lg hover:bg-muted text-foreground/80"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartQty > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                  {cartQty}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="p-2 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-x-0 bottom-0 top-[64px] bg-background/70 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              key="panel"
              id="mobile-nav"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="lg:hidden absolute left-0 right-0 top-full z-50 bg-background border-t border-border shadow-elegant max-h-[calc(100vh-64px)] overflow-y-auto"
            >
              <nav className="px-5 py-5 flex flex-col gap-1">
                <Link
                  to="/servicos"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl bg-muted/60 text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  <span>Serviços</span>
                  <span className="text-xs font-mono text-primary">{menuServices.length || "—"}</span>
                </Link>
                <div className="mt-1 mb-2 grid gap-0.5">
                  {menuServices.slice(0, 10).map((s, i) => (
                    <motion.div
                      key={s.slug}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + i * 0.025 }}
                    >
                      <Link
                        to="/servicos/$slug"
                        params={{ slug: s.slug }}
                        onClick={() => setOpen(false)}
                        className="block pl-6 pr-3 py-2 text-sm text-foreground/85 hover:text-primary hover:bg-muted/40 rounded-lg transition-colors"
                      >
                        {s.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="h-px bg-border my-2" />

                {mobileNav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-foreground/85 hover:text-foreground hover:bg-muted/40 font-medium transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}

                <div className="h-px bg-border my-2" />

                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="text-center rounded-full border border-border font-medium px-5 py-2.5 inline-flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Conectar
                </Link>
                <FunnelCTAButton
                  intent={{ purpose: "diagnosis", source: "mobile_menu", pagePath: "/", placement: "header" }}
                  label="Solicitar Diagnóstico"
                  location="mobile_menu"
                  showArrow={false}
                  className="mt-1 justify-center text-center rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-3 shadow-glow-primary hover:opacity-95 transition inline-flex items-center"
                />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Suspense fallback={null}>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} source={pathname === "/" ? "home" : "other"} />
      </Suspense>
    </header>
  );
}
