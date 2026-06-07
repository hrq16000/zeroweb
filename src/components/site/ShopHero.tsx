import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import type { HeroSlide } from "@/lib/hero-slides.functions";

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
};

function isExternal(href: string | null | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:");
}

function SlideCta({
  href,
  label,
  variant,
}: {
  href: string | null;
  label: string | null;
  variant: "primary" | "secondary";
}) {
  if (!href || !label) return null;
  const cls =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-full bg-white text-foreground font-bold px-6 py-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
      : "inline-flex items-center gap-2 rounded-full border border-white/40 text-white font-medium px-5 py-3 hover:bg-white/10 active:scale-[0.98] transition";
  const Icon = variant === "primary" ? ArrowRight : MessageCircle;
  if (isExternal(href)) {
    return (
      <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">
        {label}
        <Icon className="w-4 h-4" />
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {label}
      <Icon className="w-4 h-4" />
    </Link>
  );
}

/**
 * Hero da loja em crossfade elegante. Cada slide é uma camada absoluta;
 * a troca anima opacidade + escala leve (Ken Burns) e respeita
 * prefers-reduced-motion. Pré-carrega a próxima imagem.
 */
export function ShopHero({ slides, intervalMs = 7000 }: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [count, paused, intervalMs]);

  // Pré-carrega próxima imagem para crossfade sem flash
  useEffect(() => {
    if (count <= 1) return;
    const next = slides[(idx + 1) % count];
    if (next?.imageUrl) {
      const img = new Image();
      img.src = next.imageUrl;
    }
  }, [idx, count, slides]);

  if (count === 0) return null;
  const current = slides[idx];

  return (
    <section
      className="relative isolate overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Destaques da loja"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">
        {/* Camadas de slide em crossfade absoluto */}
        {slides.map((s, i) => {
          const active = i === idx;
          return (
            <div
              key={s.id}
              aria-hidden={!active}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform]"
              style={{
                opacity: active ? 1 : 0,
                background: s.bgGradient ?? "linear-gradient(135deg,#1e3a8a,#4f46e5)",
                pointerEvents: active ? "auto" : "none",
              }}
            >
              {s.imageUrl && (
                <img
                  src={s.imageUrl}
                  alt=""
                  aria-hidden
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none transition-transform duration-[8000ms] ease-out"
                  style={{
                    transform: active ? "scale(1.06)" : "scale(1.0)",
                  }}
                />
              )}
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-black/20 blur-3xl pointer-events-none" />

              <div
                className="relative mx-auto max-w-6xl px-5 lg:px-8 py-16 lg:py-20 text-white w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  transform: active ? "translateY(0)" : "translateY(14px)",
                  opacity: active ? 1 : 0,
                }}
              >
                <div className="max-w-3xl">
                  {s.badge && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> {s.badge}
                    </span>
                  )}
                  {s.eyebrow && (
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">
                      {s.eyebrow}
                    </p>
                  )}
                  <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
                    {s.title}
                  </h2>
                  {s.subtitle && (
                    <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl">{s.subtitle}</p>
                  )}
                  <div className="mt-7 flex flex-wrap gap-3">
                    <SlideCta href={s.ctaHref} label={s.ctaLabel} variant="primary" />
                    <SlideCta href={s.ctaSecondaryHref} label={s.ctaSecondaryLabel} variant="secondary" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + count) % count)}
              aria-label="Slide anterior"
              className="hidden sm:grid place-items-center absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white backdrop-blur transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % count)}
              aria-label="Próximo slide"
              className="hidden sm:grid place-items-center absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white backdrop-blur transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Ir para slide ${i + 1}`}
                  aria-current={i === idx}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === idx ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <style>{`
          @media (prefers-reduced-motion: reduce) {
            section[aria-roledescription="carousel"] * {
              transition-duration: 0.001ms !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
