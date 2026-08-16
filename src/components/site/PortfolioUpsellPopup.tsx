import { useEffect, useRef, useState } from "react";
import { X, Sparkles, CalendarClock, Share2 } from "lucide-react";
import { FunnelModalWrapper } from "@/components/funnel/FunnelModalWrapper";
import { subscribeScroll } from "@/lib/scroll-bus";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "0web:portfolio-upsell-dismissed";

/**
 * Pop-up de captação exibido nas páginas de portfólio.
 * Dispara após 10s de leitura OU ao rolar até ~90% da página.
 * O CTA abre o funil/quiz já existente do portal.
 */
export function PortfolioUpsellPopup({ pageName = "portfolio" }: { pageName?: string }) {
  const [visible, setVisible] = useState(false);
  const [funnelOpen, setFunnelOpen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* noop */
    }

    const fire = (trigger: "timer" | "scroll") => {
      if (firedRef.current) return;
      firedRef.current = true;
      setVisible(true);
      trackEvent("popup_view", { label: "portfolio_upsell", location: pageName, trigger });
    };

    const t = window.setTimeout(() => fire("timer"), 10000);
    const unsub = subscribeScroll((s) => {
      if (s.pct >= 0.9) fire("scroll");
    });

    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, [pageName]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
  };

  if (!visible) {
    return (
      <FunnelModalWrapper
        open={funnelOpen}
        onClose={() => setFunnelOpen(false)}
        funnelSlug="diagnostico-0web"
        intent={{
          purpose: "diagnosis",
          source: `portfolio_upsell_${pageName}`,
          pagePath: typeof window === "undefined" ? "/portfolio" : window.location.pathname,
          placement: "section",
        }}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none">
        <div
          role="dialog"
          aria-label="Tenha um site próprio com a 0WEB"
          className="pointer-events-auto mx-auto w-full max-w-xl rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-5 animate-in slide-in-from-bottom-6 fade-in duration-300"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="absolute right-3 top-3 sm:right-5 sm:top-5 grid place-items-center w-8 h-8 rounded-full bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pr-8">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" /> Gostou dessa página?
            </p>
            <h2 className="mt-1.5 text-lg sm:text-xl font-bold leading-snug text-foreground">
              Tenha um site <span className="text-primary">.com.br</span> você também!
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CalendarClock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                Planos e condições especiais com até <strong className="text-foreground">90 dias para começar a pagar</strong>.
              </li>
              <li className="flex gap-2">
                <Share2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                Gestão de redes sociais com artes e postagens regulares, a partir de <strong className="text-foreground">4 postagens por mês</strong>.
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_click", { label: "portfolio_upsell", location: pageName });
                  setVisible(false);
                  setFunnelOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition"
              >
                Saiba mais — clique aqui
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>

      <FunnelModalWrapper
        open={funnelOpen}
        onClose={() => setFunnelOpen(false)}
        funnelSlug="diagnostico-0web"
        intent={{
          purpose: "diagnosis",
          source: `portfolio_upsell_${pageName}`,
          pagePath: typeof window === "undefined" ? "/portfolio" : window.location.pathname,
          placement: "section",
        }}
      />
    </>
  );
}
