import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";

declare global {
  interface Window {
    $_TSR?: { router?: unknown };
    __0WEB_RENDER_MODE__?: "ssr-hydrated" | "client-only-fallback";
  }
}

const PAYLOAD_WAIT_MS = 1_500;

/** Correlaciona todos os relatórios de hidratação do mesmo carregamento. */
const CORRELATION_ID = (() => {
  try {
    return crypto.randomUUID();
  } catch {
    return `cid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
})();

function reportHydrationState(reason: string, detail: string, mode: "hydrate" | "client-only"): void {
  const payload = JSON.stringify({
    reason,
    detail,
    path: window.location.pathname,
    search: window.location.search.slice(0, 300),
    mode,
    ua: navigator.userAgent.slice(0, 200),
    cid: CORRELATION_ID,
    ts: Date.now(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/public/hydration-report",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/public/hydration-report", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Telemetry must never prevent recovery.
  }
}

function hydrateFromServerPayload(): void {
  window.__0WEB_RENDER_MODE__ = "ssr-hydrated";
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}

async function renderClientOnly(): Promise<void> {
  reportHydrationState(
    "missing_router_payload_before_hydrate",
    `window.$_TSR.router remained unavailable after ${PAYLOAD_WAIT_MS}ms`,
    "client-only",
  );

  console.warn(
    `[hydration-fallback] cid=${CORRELATION_ID} route=${window.location.pathname} render=client-only`,
  );
  const router = getRouter();
  await router.load();
  window.__0WEB_RENDER_MODE__ = "client-only-fallback";
  createRoot(document).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

async function waitForServerPayload(): Promise<boolean> {
  if (window.$_TSR?.router) return true;

  const startedAt = performance.now();
  while (performance.now() - startedAt < PAYLOAD_WAIT_MS) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 25));
    if (window.$_TSR?.router) return true;
  }
  return false;
}

void waitForServerPayload().then((hasPayload) => {
  if (hasPayload) {
    hydrateFromServerPayload();
    return;
  }

  void renderClientOnly().catch((error: unknown) => {
    console.error("[hydration-fallback] client-only render failed", error);
    reportHydrationState(
      "client_only_fallback_failed",
      error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
      "client-only",
    );
  });
});