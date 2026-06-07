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
      ? "inline-flex items-center gap-2 rounded-full bg-white text-foreground font-bold px-6 py-3 shadow-lg hover:scale-[1.02] transition"
      : "inline-flex items-center gap-2 rounded-full border border-white/40 text-white font-medium px-5 py-3 hover:bg-white/10 transition";
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

export function ShopHero({ slides, intervalMs = 6000 }: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [count, paused, intervalMs]);

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
      <div
        className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center transition-[background] duration-700"
        style={{ background: current.bgGradient ?? "linear-gradient(135deg,#1e3a8a,#4f46e5)" }}
      >
        {current.imageUrl && (
          <img
            src={current.imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none"
          />
        )}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-black/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-5 lg:px-8 py-16 lg:py-20 text-white w-full">
          <div className="max-w-3xl">
            {current.badge && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> {current.badge}
              </span>
            )}
            {current.eyebrow && (
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">
                {current.eyebrow}
              </p>
            )}
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
              {current.title}
            </h2>
            {current.subtitle && (
              <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl">{current.subtitle}</p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <SlideCta href={current.ctaHref} label={current.ctaLabel} variant="primary" />
              <SlideCta href={current.ctaSecondaryHref} label={current.ctaSecondaryLabel} variant="secondary" />
            </div>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + count) % count)}
              aria-label="Slide anterior"
              className="hidden sm:grid place-items-center absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % count)}
              aria-label="Próximo slide"
              className="hidden sm:grid place-items-center absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Ir para slide ${i + 1}`}
                  aria-current={i === idx}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
