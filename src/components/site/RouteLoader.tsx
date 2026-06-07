import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/logo-0web.png.asset.json";

/**
 * Loader global de navegação. Aparece após 120ms de pending para não
 * piscar em transições instantâneas. Mostra a logo 0WEB pulsando e uma
 * barra de progresso no topo (estilo NProgress).
 */
export function RouteLoader() {
  const isLoading = useRouterState({
    select: (s) => s.isLoading || s.isTransitioning,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, [isLoading]);

  return (
    <>
      {/* Barra de progresso fina sempre visível ao iniciar navegação */}
      <div
        aria-hidden
        className={`fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none transition-opacity duration-200 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-full bg-gradient-to-r from-primary via-accent to-secondary shadow-[0_0_10px_currentColor] ${
            isLoading ? "animate-route-progress" : ""
          }`}
        />
      </div>

      {/* Overlay com logo — só aparece em navegações >120ms */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Carregando página"
        className={`fixed inset-0 z-[99] pointer-events-none grid place-items-center transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center gap-4">
          <img
            src={logoAsset.url}
            alt=""
            width={72}
            height={72}
            className="animate-logo-pulse drop-shadow-[0_8px_30px_color-mix(in_oklab,var(--primary)_40%,transparent)] object-contain"
            style={{ width: 72, height: 72, aspectRatio: "1 / 1" }}
          />
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground">
            Carregando
          </span>
        </div>
      </div>

      <style>{`
        @keyframes route-progress {
          0% { width: 0%; }
          40% { width: 55%; }
          70% { width: 78%; }
          100% { width: 92%; }
        }
        .animate-route-progress {
          animation: route-progress 1.6s ease-out forwards;
        }
        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }
        .animate-logo-pulse {
          animation: logo-pulse 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-route-progress, .animate-logo-pulse { animation: none !important; }
        }
      `}</style>
    </>
  );
}
