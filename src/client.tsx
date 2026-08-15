import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

declare global {
  interface Window {
    $_TSR?: { router?: unknown };
  }
}

const RETRY_KEY = "0web:missing-tsr-retry";

function reportMissingPayload(): void {
  const payload = JSON.stringify({
    reason: "missing_router_payload_before_hydrate",
    detail: "window.$_TSR.router was unavailable at the client entry",
    path: window.location.pathname,
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

function showRecoveryScreen(): void {
  document.body.replaceChildren();

  const main = document.createElement("main");
  main.setAttribute(
    "style",
    "min-height:100vh;display:grid;place-items:center;padding:24px;background:#fff;color:#0b1120;font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:center",
  );
  main.innerHTML =
    '<div style="max-width:430px"><h1 style="font-size:22px;margin:0 0 10px">Não foi possível carregar a página</h1>' +
    '<p style="font-size:15px;line-height:1.55;color:#475569;margin:0 0 20px">A versão do site armazenada no navegador está desatualizada. Atualize para tentar novamente.</p>' +
    '<button type="button" style="border:0;border-radius:8px;padding:12px 20px;background:#0066ff;color:#fff;font:600 15px system-ui;cursor:pointer">Atualizar página</button></div>';

  main.querySelector("button")?.addEventListener("click", () => {
    sessionStorage.removeItem(RETRY_KEY);
    window.location.reload();
  });
  document.body.appendChild(main);
}

function recoverFromMissingPayload(): void {
  reportMissingPayload();

  let alreadyRetried = false;
  try {
    alreadyRetried = sessionStorage.getItem(RETRY_KEY) === "1";
  } catch {
    // Storage can be unavailable in privacy modes.
  }

  if (!alreadyRetried) {
    try {
      sessionStorage.setItem(RETRY_KEY, "1");
    } catch {
      // Continue with a cache-busted navigation.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("__hb", Date.now().toString(36));
    window.location.replace(url);
    return;
  }

  showRecoveryScreen();
}

if (!window.$_TSR?.router) {
  recoverFromMissingPayload();
} else {
  try {
    sessionStorage.removeItem(RETRY_KEY);
  } catch {
    // Hydration can proceed without storage.
  }

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}