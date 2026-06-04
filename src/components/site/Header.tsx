import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, MessageCircle } from "lucide-react";

const nav = [
  { href: "#inicio", label: "Início" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#servicos", label: "Serviços" },
  { href: "#ia", label: "IA" },
  { href: "#cases", label: "Cases" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
  { href: "#blog", label: "Blog" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-elegant" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        <a href="#inicio" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
            0
          </span>
          <span className="tracking-tight">
            0<span className="text-gradient">WEB</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-foreground transition-colors">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://wa.me/5500000000000"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            <MessageCircle className="w-4 h-4 text-accent" />
            WhatsApp
          </a>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 shadow-glow-primary hover:opacity-95 transition"
          >
            Solicitar Diagnóstico
          </a>
        </div>

        <button
          aria-label="Abrir menu"
          className="lg:hidden p-2 rounded-lg hover:bg-muted"
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
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-foreground/80 hover:text-foreground"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#contato"
                className="mt-2 text-center rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-3"
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
