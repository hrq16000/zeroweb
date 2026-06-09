import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ArrowRight, Sparkles, TrendingUp, Tag } from "lucide-react";
import { listServicesNav } from "@/lib/services-nav.functions";
import { trackEvent } from "@/lib/analytics";

type Props = {
  open: boolean;
  onClose: () => void;
  source?: string;
};

const QUICK_LINKS = [
  { label: "Catálogo de Serviços", to: "/servicos" },
  { label: "Soluções", to: "/solucoes" },
  { label: "Planos", to: "/planos" },
  { label: "Cases", to: "/cases" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/faq" },
  { label: "Contato", to: "/contato" },
];

const TRENDING = [
  "criação de sites",
  "landing page",
  "SEO local",
  "google meu negócio",
  "tráfego pago",
  "chatbot whatsapp",
  "loja virtual",
];

export function GlobalSearch({ open, onClose, source = "header" }: Props) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["services-nav"],
    queryFn: () => listServicesNav(),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const allServices = useMemo(() => {
    const arr = [...(data?.menu ?? []), ...(data?.solutions ?? [])];
    const seen = new Set<string>();
    return arr.filter((s) => (seen.has(s.slug) ? false : (seen.add(s.slug), true)));
  }, [data]);

  const term = q.trim().toLowerCase();
  const serviceResults = useMemo(() => {
    if (!term) return [];
    return allServices
      .map((s) => {
        const hay = `${s.name} ${s.category} ${s.description}`.toLowerCase();
        let score = 0;
        if (s.name.toLowerCase() === term) score += 100;
        else if (s.name.toLowerCase().startsWith(term)) score += 60;
        else if (s.name.toLowerCase().includes(term)) score += 40;
        if (s.category.toLowerCase().includes(term)) score += 15;
        if (hay.includes(term)) score += 5;
        return { s, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.s);
  }, [allServices, term]);

  const linkResults = useMemo(
    () => (term ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(term)) : []),
    [term],
  );

  // Flat list for keyboard nav
  const flatItems = useMemo(() => {
    const items: Array<{ key: string; to: string; label: string }> = [];
    serviceResults.forEach((s) =>
      items.push({ key: `s:${s.slug}`, to: `/servicos/${s.slug}`, label: s.name }),
    );
    linkResults.forEach((l) =>
      items.push({ key: `l:${l.to}`, to: l.to, label: l.label }),
    );
    return items;
  }, [serviceResults, linkResults]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      trackEvent("global_search_open", { source });
    }
  }, [open, source]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, Math.max(0, flatItems.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const target = flatItems[active];
        if (target) {
          go(target.to, target.label);
        } else if (term) {
          go(`/servicos?q=${encodeURIComponent(term)}`, `busca:${term}`);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flatItems, active, term]);

  const go = (to: string, label: string) => {
    trackEvent("global_search_submit", { source, term, label, route: to });
    onClose();
    navigate({ to });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Busca global"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mx-auto mt-[10vh] w-[min(680px,92vw)] rounded-2xl border border-border bg-card shadow-elegant overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Buscar serviços, soluções, blog, planos…"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
                aria-label="Buscar no site"
                autoComplete="off"
              />
              <kbd className="hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar busca"
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!term && (
                <div className="p-3 space-y-5">
                  <div>
                    <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" /> Em alta
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map((t) => (
                        <button
                          key={t}
                          onClick={() => setQ(t)}
                          className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary hover:text-primary transition"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Atalhos
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {QUICK_LINKS.map((l) => (
                        <button
                          key={l.to}
                          onClick={() => go(l.to, l.label)}
                          className="text-left text-sm px-3 py-2 rounded-lg hover:bg-muted transition inline-flex items-center justify-between"
                        >
                          {l.label}
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {term && flatItems.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nada encontrado para “{q}”. Pressione Enter para ver o catálogo.
                </div>
              )}

              {term && serviceResults.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Serviços
                  </div>
                  {serviceResults.map((s, idx) => {
                    const isActive = idx === active;
                    return (
                      <button
                        key={s.slug}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(`/servicos/${s.slug}`, s.name)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition ${
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        <span className="w-8 h-8 rounded-md bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
                          <Tag className="w-4 h-4" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{s.name}</span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {s.category} · {s.description}
                          </span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}

              {term && linkResults.length > 0 && (
                <div className="p-2 border-t border-border mt-2">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Páginas
                  </div>
                  {linkResults.map((l, i) => {
                    const idx = serviceResults.length + i;
                    const isActive = idx === active;
                    return (
                      <button
                        key={l.to}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(l.to, l.label)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition ${
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        {l.label}
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                <kbd className="px-1 rounded border border-border">↑</kbd>{" "}
                <kbd className="px-1 rounded border border-border">↓</kbd> navegar ·{" "}
                <kbd className="px-1 rounded border border-border">↵</kbd> abrir
              </span>
              <span className="hidden sm:inline">Busca global · 0WEB</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
