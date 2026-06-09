import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ArrowRight, TrendingUp, Tag } from "lucide-react";
import { listServicesNav } from "@/lib/services-nav.functions";
import { trackEvent } from "@/lib/analytics";

type Props = {
  open: boolean;
  onClose: () => void;
  source?: string;
};

type SuggestionKind = "service" | "page" | "trending" | "quick_link" | "freeform";

const QUICK_LINKS = [
  { label: "Catálogo", to: "/servicos" },
  { label: "Soluções", to: "/solucoes" },
  { label: "Planos", to: "/planos" },
  { label: "Cases", to: "/cases" },
  { label: "Blog", to: "/blog" },
  { label: "Contato", to: "/contato" },
];

const TRENDING = [
  "criação de sites",
  "landing page",
  "SEO local",
  "google meu negócio",
  "tráfego pago",
  "chatbot whatsapp",
];

export function GlobalSearch({ open, onClose, source = "header" }: Props) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
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
      .slice(0, 5)
      .map((x) => x.s);
  }, [allServices, term]);

  const linkResults = useMemo(
    () => (term ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(term)).slice(0, 3) : []),
    [term],
  );

  const flatItems = useMemo(() => {
    const items: Array<{ key: string; to: string; label: string; kind: SuggestionKind }> = [];
    serviceResults.forEach((s) =>
      items.push({ key: `s:${s.slug}`, to: `/servicos/${s.slug}`, label: s.name, kind: "service" }),
    );
    linkResults.forEach((l) =>
      items.push({ key: `l:${l.to}`, to: l.to, label: l.label, kind: "page" }),
    );
    return items;
  }, [serviceResults, linkResults]);

  // Open: snapshot last focused, focus input, fire event
  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    setQ("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    trackEvent("global_search_open", { source });
    return () => clearTimeout(t);
  }, [open, source]);

  // Close: restore focus to opener
  useEffect(() => {
    if (open) return;
    const el = lastFocusedRef.current;
    if (el && typeof el.focus === "function") {
      // microtask so React/Radix doesn't steal focus first
      requestAnimationFrame(() => el.focus());
    }
  }, [open]);

  // Keyboard: ESC, ↑↓, Enter, and focus-trap (Tab cycles inside panel)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, Math.max(0, flatItems.length - 1)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const target = flatItems[active];
        if (target) {
          go(target.to, target.label, target.kind);
        } else if (term) {
          go(`/servicos?q=${encodeURIComponent(term)}`, term, "freeform");
        }
        return;
      }
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flatItems, active, term]);

  const go = (to: string, label: string, kind: SuggestionKind) => {
    trackEvent("global_search_suggestion_click", { source, kind, term, label, route: to });
    trackEvent("global_search_submit", { source, term, label, route: to, kind });
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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mx-auto mt-[6vh] w-[min(360px,88vw)] rounded-lg border border-border bg-card shadow-elegant overflow-hidden text-[12px]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Busca global"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Buscar…"
                className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-foreground"
                aria-label="Buscar no site"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar busca"
                className="p-0.5 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-[44vh] overflow-y-auto">
              {!term && (
                <div className="p-1.5 space-y-1.5">
                  {allServices.length > 0 && (
                    <div>
                      <div className="px-1.5 pt-0.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> Rápidos
                      </div>
                      <div className="grid">
                        {allServices.slice(0, 3).map((s) => (
                          <button
                            key={s.slug}
                            onClick={() => go(`/servicos/${s.slug}`, s.name, "service")}
                            className="w-full text-left px-1.5 py-1 rounded hover:bg-muted transition flex items-center gap-1.5"
                          >
                            <span className="w-4 h-4 rounded bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
                              <Tag className="w-2 h-2" />
                            </span>
                            <span className="flex-1 min-w-0 text-[12px] font-medium truncate">{s.name}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="px-1.5 pb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" /> Em alta
                    </div>
                    <div className="flex flex-wrap gap-1 px-1">
                      {TRENDING.slice(0, 5).map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            trackEvent("global_search_suggestion_click", {
                              source, kind: "trending", label: t, term: "",
                            });
                            setQ(t);
                            setActive(0);
                            inputRef.current?.focus();
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:border-primary hover:text-primary transition"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="px-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Atalhos
                    </div>
                    <div className="grid grid-cols-3 gap-0.5">
                      {QUICK_LINKS.map((l) => (
                        <button
                          key={l.to}
                          onClick={() => go(l.to, l.label, "quick_link")}
                          className="text-left text-[11px] px-1.5 py-1 rounded hover:bg-muted transition truncate"
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {term && flatItems.length === 0 && (
                <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                  Nada para “{q}”. Enter p/ catálogo.
                </div>
              )}

              {term && serviceResults.length > 0 && (
                <div className="p-1">
                  <div className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Serviços</div>
                  {serviceResults.map((s, idx) => {
                    const isActive = idx === active;
                    return (
                      <button
                        key={s.slug}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(`/servicos/${s.slug}`, s.name, "service")}
                        className={`w-full text-left px-1.5 py-1 rounded flex items-center gap-1.5 transition ${
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        <span className="w-4 h-4 rounded bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
                          <Tag className="w-2 h-2" />
                        </span>
                        <span className="flex-1 min-w-0 text-[12px] font-medium truncate">{s.name}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}

              {term && linkResults.length > 0 && (
                <div className="p-1 border-t border-border">
                  <div className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Páginas</div>
                  {linkResults.map((l, i) => {
                    const idx = serviceResults.length + i;
                    const isActive = idx === active;
                    return (
                      <button
                        key={l.to}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(l.to, l.label, "page")}
                        className={`w-full text-left px-1.5 py-1 rounded text-[12px] flex items-center justify-between transition ${
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        {l.label}
                        <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-2 py-1 border-t border-border bg-muted/30 text-[9px] text-muted-foreground flex items-center justify-between">
              <span>
                <kbd className="px-1 rounded border border-border">↑↓</kbd>{" "}
                <kbd className="px-1 rounded border border-border">↵</kbd>{" "}
                <kbd className="px-1 rounded border border-border">ESC</kbd>
              </span>
              <span className="hidden sm:inline">0WEB</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
