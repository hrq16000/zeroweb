import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, MessageCircle, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";
import logoAsset from "@/assets/logo-0web.png.asset.json";

const nav: { to: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/ia", label: "IA" },
  { to: "/cases", label: "Cases" },
  { to: "/planos", label: "Planos" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openFunnel } = useWaFunnel();
  const headerRef = useRef<HTMLElement | null>(null);

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
          {nav.map((n) => (
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
          <a
            href="/#contato"
            onClick={() => trackEvent("cta_click", { label: "solicitar_diagnostico", location: "header" })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 shadow-glow-primary hover:opacity-95 transition"
          >
            Solicitar Diagnóstico
          </a>
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
              <a
                href="/#contato"
                onClick={() => {
                  trackEvent("cta_click", { label: "solicitar_diagnostico", location: "mobile_menu" });
                  setOpen(false);
                }}
                className="text-center rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-3"
              >
                Solicitar Diagnóstico
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
