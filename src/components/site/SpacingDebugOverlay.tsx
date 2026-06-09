import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Spacing debug overlay. Ativa com `?debug=spacing` na URL (qualquer rota) e
 * destaca bordas de seções/elementos + exibe padding/margin/dimensões do
 * elemento sob o cursor em tempo real. Não persiste e não aparece sem o param.
 *
 * - Sem dependências externas.
 * - Zero impacto fora do modo debug (early-return + listeners removidos).
 * - Compatível com SSR (toda lógica corre dentro de useEffect).
 */
type Info = {
  tag: string;
  cls: string;
  w: number;
  h: number;
  pt: string; pr: string; pb: string; pl: string;
  mt: string; mr: string; mb: string; ml: string;
};

function pxRound(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? `${Math.round(n)}px` : v;
}

export function SpacingDebugOverlay() {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const [active, setActive] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(search || window.location.search);
    const on = params.get("debug") === "spacing";
    setActive(on);
    const root = document.documentElement;
    if (on) root.setAttribute("data-debug-spacing", "1");
    else root.removeAttribute("data-debug-spacing");
    return () => root.removeAttribute("data-debug-spacing");
  }, [search]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      if (!el || el.closest("[data-spacing-debug-hud]")) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        setInfo({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute("class") || "").slice(0, 90),
          w: Math.round(r.width),
          h: Math.round(r.height),
          pt: pxRound(cs.paddingTop), pr: pxRound(cs.paddingRight),
          pb: pxRound(cs.paddingBottom), pl: pxRound(cs.paddingLeft),
          mt: pxRound(cs.marginTop), mr: pxRound(cs.marginRight),
          mb: pxRound(cs.marginBottom), ml: pxRound(cs.marginLeft),
        });
      });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      data-spacing-debug-hud
      className="fixed bottom-4 right-4 z-[9999] max-w-sm rounded-xl border border-pink-400/60 bg-black/85 text-white text-xs font-mono shadow-2xl backdrop-blur p-3 pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="font-semibold text-pink-300">SPACING DEBUG</span>
        <span className="text-white/50">?debug=spacing</span>
      </div>
      {info ? (
        <div className="space-y-1">
          <div><span className="text-pink-300">{info.tag}</span> <span className="text-white/60">{info.cls}</span></div>
          <div>size: {info.w}×{info.h}</div>
          <div>padding: <span className="text-amber-300">T {info.pt}</span> R {info.pr} B {info.pb} L {info.pl}</div>
          <div>margin:  <span className="text-amber-300">T {info.mt}</span> R {info.mr} B {info.mb} L {info.ml}</div>
        </div>
      ) : (
        <div className="text-white/60">Passe o mouse sobre um elemento…</div>
      )}
    </div>
  );
}
