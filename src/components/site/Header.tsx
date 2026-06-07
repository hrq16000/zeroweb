import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, MessageCircle, LogIn, ChevronDown } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trackEvent } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";
import { listServicesNav } from "@/lib/services-nav.functions";
import logoAsset from "@/assets/logo-0web.png.asset.json";

const staticNav: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/cases", label: "Cases" },
  { to: "/planos", label: "Planos" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/contato", label: "Contato" },
];


export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { open: openFunnel } = useWaFunnel();
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: navData } = useQuery({
    queryKey: ["services-nav"],
    queryFn: () => listServicesNav(),
    staleTime: 5 * 60 * 1000,
  });
  const menuServices = navData?.menu ?? [];


  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [pathname]);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          scrolled ? "h-14 lg:h-16" : "h-20 lg:h-28"
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
                      Ver catálogo completo →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {staticNav.slice(1).map((n) => (
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
            onClick={() => openFunnel("header")}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            <MessageCircle className="w-4 h-4 text-accent" />
            WhatsApp
          </button>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground border border-border rounded-full px-4 py-2"
          >
            <LogIn className="w-4 h-4" /> Conectar
          </Link>
          <Link
            to="/contato"
            onClick={() => trackEvent("cta_click", { label: "solicitar_diagnostico", location: "header" })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 shadow-glow-primary hover:opacity-95 transition"
          >
            Solicitar Diagnóstico
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="lg:hidden p-2 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden glass border-t border-border"
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-foreground/80 hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-2 text-center rounded-full border border-border font-medium px-5 py-2.5 inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Conectar
              </Link>
              <Link
                to="/contato"
                onClick={() => {
                  trackEvent("cta_click", { label: "solicitar_diagnostico", location: "mobile_menu" });
                  setOpen(false);
                }}
                className="text-center rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-3"
              >
                Solicitar Diagnóstico
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
