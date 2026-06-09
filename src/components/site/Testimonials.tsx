import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, ChevronLeft, ChevronRight, Star, Pause, Play } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  text: string;
  highlight?: boolean;
};

const ITEMS: Testimonial[] = [
  {
    name: "Marcelo R.",
    role: "Dono de loja, Curitiba",
    text: "Em 3 meses dobramos os pedidos pelo site. O time da 0WEB entrega rápido e sem enrolação.",
    highlight: true,
  },
  {
    name: "Aline F.",
    role: "Clínica estética",
    text: "Agendamentos pelo WhatsApp triplicaram depois da landing nova. Estrutura, copy e tráfego no ponto.",
  },
  {
    name: "Rodrigo S.",
    role: "Indústria B2B",
    text: "Saímos da invisibilidade no Google. Hoje recebemos cotações qualificadas todos os dias.",
    highlight: true,
  },
  {
    name: "Bianca M.",
    role: "Restaurante",
    text: "Site rápido, cardápio fácil de atualizar e fila no delivery. Atendimento que parece da casa.",
  },
  {
    name: "Tiago N.",
    role: "SaaS local",
    text: "Migramos para uma stack moderna e o LCP caiu para 1.2s. SEO técnico fez diferença de verdade.",
  },
];

const AGGREGATE = {
  ratingValue: 4.9,
  reviewCount: 137,
};

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = ITEMS.length;
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % total), 6500);
    return () => clearInterval(id);
  }, [total, paused]);

  const go = (d: number) => setI((p) => (p + d + total) % total);
  const cur = ITEMS[i];

  // Keyboard navigation when section is focused/visible
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "0WEB — Serviços digitais",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: AGGREGATE.ratingValue,
      reviewCount: AGGREGATE.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: ITEMS.map((t) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      author: { "@type": "Person", name: t.name },
      reviewBody: t.text,
    })),
  };

  return (
    <section
      ref={rootRef}
      className="py-24 bg-surface relative overflow-hidden"
      id="depoimentos"
      aria-roledescription="carrossel"
      aria-label="Depoimentos de clientes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Depoimentos</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
              Quem confia, <span className="text-gradient">cresce com a gente.</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Retomar carrossel" : "Pausar carrossel"}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary transition"
          >
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {paused ? "Retomar" : "Pausar"}
          </button>
        </div>

        <div className="mt-12 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div
            className="relative min-h-[260px]"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only" role="status">
              Depoimento {i + 1} de {total}: {cur.name}, {cur.role}.
            </span>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                className={`relative rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-elegant ${
                  cur.highlight ? "ring-2 ring-primary/40" : ""
                }`}
                aria-roledescription="slide"
                aria-label={`Depoimento ${i + 1} de ${total}`}
              >
                <Quote className="w-8 h-8 text-primary/40 absolute top-6 right-6" />
                <div className="flex gap-0.5 text-primary" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-lg sm:text-xl leading-relaxed text-foreground">
                  “{cur.text}”
                </p>
                <footer className="mt-6">
                  <div className="font-semibold">{cur.name}</div>
                  <div className="text-sm text-muted-foreground">{cur.role}</div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex lg:flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Depoimento anterior"
              className="w-10 h-10 grid place-items-center rounded-full border border-border bg-background hover:border-primary hover:text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex lg:flex-col gap-1.5" role="tablist">
              {ITEMS.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={k === i}
                  onClick={() => setI(k)}
                  aria-label={`Ir para depoimento ${k + 1}`}
                  className={`w-2 h-2 rounded-full transition ${
                    k === i ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próximo depoimento"
              className="w-10 h-10 grid place-items-center rounded-full border border-border bg-background hover:border-primary hover:text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
