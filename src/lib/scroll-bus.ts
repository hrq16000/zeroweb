/**
 * Barramento único de scroll: um listener passivo global, throttling via rAF,
 * publish/subscribe. Substitui listeners individuais em ScrollTracker,
 * SocialProof e ExitIntent para reduzir jank de rolagem.
 */
export type ScrollSnapshot = {
  y: number;
  dir: "up" | "down" | "idle";
  pct: number; // 0..1 do documento rolado
  ts: number;
};

type Sub = (s: ScrollSnapshot) => void;

const subs = new Set<Sub>();
let last: ScrollSnapshot = { y: 0, dir: "idle", pct: 0, ts: 0 };
let started = false;
let rafPending = false;
let prevY = 0;

function compute(): ScrollSnapshot {
  const y = typeof window === "undefined" ? 0 : window.scrollY || 0;
  const doc = typeof document === "undefined" ? null : document.documentElement;
  const max = doc ? Math.max(1, doc.scrollHeight - window.innerHeight) : 1;
  const dir: ScrollSnapshot["dir"] =
    y === prevY ? "idle" : y > prevY ? "down" : "up";
  prevY = y;
  return { y, dir, pct: Math.min(1, Math.max(0, y / max)), ts: Date.now() };
}

function flush() {
  rafPending = false;
  last = compute();
  subs.forEach((fn) => {
    try {
      fn(last);
    } catch {
      /* isolar assinantes */
    }
  });
}

function onScroll() {
  if (rafPending) return;
  rafPending = true;
  window.requestAnimationFrame(flush);
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // primeira medição
  flush();
}

export function subscribeScroll(fn: Sub): () => void {
  ensureStarted();
  subs.add(fn);
  // entrega imediata do último snapshot para o assinante
  try {
    fn(last);
  } catch {
    /* noop */
  }
  return () => {
    subs.delete(fn);
  };
}

export function getScrollSnapshot(): ScrollSnapshot {
  return last;
}
