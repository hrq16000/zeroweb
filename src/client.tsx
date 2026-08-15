import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";

declare global {
  interface Window {
    $_TSR?: { router?: unknown };
  }
}

const PAYLOAD_WAIT_MS = 1_500;

function reportHydrationState(reason: string, detail: string, mode: "hydrate" | "client-only"): void {
  const payload = JSON.stringify({
    reason,
    detail,
    path: window.location.pathname,
    search: window.location.search.slice(0, 300),
    mode,
    ua: navigator.userAgent.slice(0, 200),
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
  document.documentElement.dataset.renderMode = "ssr-hydrated";
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

  const router = getRouter();
  await router.load();
  document.documentElement.dataset.renderMode = "client-only-fallback";
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