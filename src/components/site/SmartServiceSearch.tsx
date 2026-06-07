import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, TrendingUp, Tag } from "lucide-react";

export type SearchableService = {
  slug: string;
  name: string;
  category: string;
  description: string;
  keywords?: string[];
};

type Props = {
  services: SearchableService[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  trending?: string[];
};

function scoreMatch(s: SearchableService, term: string): number {
  if (!term) return 0;
  const t = term.toLowerCase();
  let score = 0;
  const name = s.name.toLowerCase();
  if (name === t) score += 100;
  else if (name.startsWith(t)) score += 60;
  else if (name.includes(t)) score += 40;
  if (s.category.toLowerCase().includes(t)) score += 20;
  for (const k of s.keywords ?? []) {
    if (k.toLowerCase().includes(t)) {
      score += 15;
      break;
    }
  }
  if (s.description.toLowerCase().includes(t)) score += 5;
  return score;
}

export function SmartServiceSearch({
  services,
  value,
  onChange,
  placeholder = "Buscar por serviço, categoria ou palavra-chave...",
  trending,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const term = value.trim();
    if (!term) return [];
    return services
      .map((s) => ({ s, score: scoreMatch(s, term) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.s);
  }, [services, value]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.category));
    return Array.from(set).slice(0, 6);
  }, [services]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [value]);

  const showPanel = open && (suggestions.length > 0 || (!value && (categories.length > 0 || (trending?.length ?? 0) > 0)));

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <label className="relative block">
        <span className="sr-only">Buscar serviços</span>
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            } else if (e.key === "ArrowDown" && suggestions.length > 0) {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp" && suggestions.length > 0) {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && suggestions[highlight]) {
              e.preventDefault();
              window.location.href = `/servicos/${suggestions[highlight].slug}`;
            }
          }}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={showPanel}
          className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-border bg-card text-base shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </label>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden">
          {suggestions.length > 0 ? (
            <ul role="listbox" className="max-h-[60vh] overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={s.slug} role="option" aria-selected={i === highlight}>
                  <Link
                    to="/servicos/$slug"
                    params={{ slug: s.slug }}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition ${
                      i === highlight ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <Search className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {s.category} · {s.description}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 space-y-4">
              {(trending?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Mais procurados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trending!.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onChange(t)}
                        className="px-3 py-1.5 rounded-full text-xs border border-border bg-card hover:border-primary hover:text-primary transition"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Categorias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onChange(c)}
                        className="px-3 py-1.5 rounded-full text-xs border border-border bg-card hover:border-primary hover:text-primary transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
