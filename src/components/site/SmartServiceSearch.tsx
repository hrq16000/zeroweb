import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, TrendingUp, Tag, Sparkles } from "lucide-react";

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

/**
 * Pool de intenções de busca para SEO agressivo. Cobre prestadores
 * (eletricista, frete, pintor…) e termos comerciais ("quero criar meu
 * portfólio de serviços"). Usadas para placeholder rotativo e
 * auto-sugestões quando o campo está vazio.
 */
const SEO_INTENTS: string[] = [
  "preciso de um site em 24 horas",
  "quero criar meu portfólio de serviços",
  "site rápido e profissional para minha empresa",
  "preciso de tráfego pago para vender mais",
  "como aparecer no Google Meu Negócio",
  "eletricista perto de mim com site próprio",
  "frete e mudanças — quero divulgar online",
  "pintor residencial precisa de site",
  "encanador 24h com agendamento online",
  "diarista e faxineira — quero captar clientes",
  "personal trainer quero meu site de serviços",
  "consultório odontológico no Google",
  "loja virtual com pagamento integrado",
  "landing page para campanha no Instagram",
  "SEO local para minha cidade",
  "automação no WhatsApp para meu negócio",
  "quero meu portfólio profissional online",
  "site institucional para advogado",
  "marketplace de serviços para autônomos",
  "presença digital completa para PMEs",
];

function expandKeywords(s: SearchableService): string[] {
  const base = [s.name, s.category, ...(s.keywords ?? [])];
  const lower = s.name.toLowerCase();
  // Variações comerciais comuns
  const variants = [
    `quero ${lower}`,
    `preciso de ${lower}`,
    `${lower} perto de mim`,
    `${lower} para minha empresa`,
    `melhor ${lower}`,
  ];
  return [...base, ...variants];
}

function scoreMatch(s: SearchableService, term: string): number {
  if (!term) return 0;
  const t = term.toLowerCase();
  let score = 0;
  const name = s.name.toLowerCase();
  if (name === t) score += 100;
  else if (name.startsWith(t)) score += 60;
  else if (name.includes(t)) score += 40;
  if (s.category.toLowerCase().includes(t)) score += 20;
  for (const k of expandKeywords(s)) {
    if (k.toLowerCase().includes(t)) {
      score += 15;
      break;
    }
  }
  if (s.description.toLowerCase().includes(t)) score += 5;
  return score;
}

/** Placeholder com efeito "typing" que cicla intenções SEO. */
function useTypingPlaceholder(active: boolean, phrases: string[]): string {
  const [text, setText] = useState(phrases[0] ?? "");
  const idxRef = useRef(0);
  const charRef = useRef(0);
  const dirRef = useRef<"type" | "pause" | "erase">("type");

  useEffect(() => {
    if (!active || phrases.length === 0) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const phrase = phrases[idxRef.current % phrases.length];
      if (dirRef.current === "type") {
        charRef.current += 1;
        setText(phrase.slice(0, charRef.current));
        if (charRef.current >= phrase.length) {
          dirRef.current = "pause";
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 45 + Math.random() * 35);
      } else if (dirRef.current === "pause") {
        dirRef.current = "erase";
        setTimeout(tick, 30);
      } else {
        charRef.current -= 2;
        if (charRef.current <= 0) {
          charRef.current = 0;
          idxRef.current += 1;
          dirRef.current = "type";
        }
        setText(phrase.slice(0, Math.max(0, charRef.current)));
        setTimeout(tick, 20);
      }
    };
    const t = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [active, phrases]);

  return text;
}

export function SmartServiceSearch({
  services,
  value,
  onChange,
  placeholder,
  trending,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [fontPx, setFontPx] = useState(16);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typing = useTypingPlaceholder(!focused && !value, SEO_INTENTS);
  // O typing animado sempre vence quando o campo está vazio e sem foco.
  // `placeholder` (estático) vira apenas fallback para leitores de tela.
  const livePlaceholder = !focused && !value ? `${typing}▍` : placeholder ?? "";

  // Auto-fit: encolhe a fonte do input quando a frase (placeholder ou valor)
  // ultrapassa a área visível. Mantém legibilidade em mobile sem cortar texto.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const input = inputRef.current;
    if (!input) return;
    const text = (value || livePlaceholder).replace(/▍$/, "");
    if (!text) {
      setFontPx(16);
      return;
    }
    // Espaço útil: largura do input menos paddings (pl-12 + pr-12 ≈ 96px).
    const available = Math.max(0, input.clientWidth - 96);
    const canvas = document.createElement("canvas");
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const family = getComputedStyle(input).fontFamily || "sans-serif";
    let size = 16;
    const min = 11;
    while (size > min) {
      ctx2d.font = `${size}px ${family}`;
      if (ctx2d.measureText(text).width <= available) break;
      size -= 0.5;
    }
    setFontPx(size);
  }, [value, livePlaceholder]);

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

  // Sugestões SEO mostradas quando a busca está vazia (chips clicáveis).
  const seoChips = useMemo(() => SEO_INTENTS.slice(0, 8), []);

  useEffect(() => {
    function onAway(e: Event) {
      const target = e.target as Node | null;
      if (!target) return;
      if (!ref.current?.contains(target)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // pointerdown cobre mouse + touch + caneta; touchstart como fallback em iOS antigo.
    document.addEventListener("pointerdown", onAway, true);
    document.addEventListener("touchstart", onAway, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onAway, true);
      document.removeEventListener("touchstart", onAway);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [value]);

  const showPanel =
    open &&
    (suggestions.length > 0 ||
      (!value && (categories.length > 0 || seoChips.length > 0 || (trending?.length ?? 0) > 0)));

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <label className="relative block group">
        <span className="sr-only">Buscar serviços</span>
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition group-focus-within:text-primary" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setOpen(true);
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
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
          placeholder={livePlaceholder}
          aria-autocomplete="list"
          aria-expanded={showPanel}
          className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-border bg-card text-base shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition placeholder:text-muted-foreground/80"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary"
          >
            <Sparkles className="w-3 h-3" /> IA
          </span>
        )}
      </label>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden animate-fade-in">
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
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Pessoas pesquisam por
                </p>
                <div className="flex flex-wrap gap-2">
                  {seoChips.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onChange(t)}
                      className="px-3 py-1.5 rounded-full text-xs border border-border bg-card hover:border-primary hover:text-primary transition text-left"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
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
