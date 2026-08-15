import { chromium } from "playwright";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:8080";
const routes = [
  "/",
  "/servicos",
  "/servicos/google-ads-299",
  "/solucoes",
  "/blog",
  "/sobre",
  "/lgpd",
  "/politica-privacidade",
];
const invariant = /Expected to find a dehydrated data|Invariant failed.*dehydrated|\$_TSR\.router/i;
const bundledExecutable = chromium.executablePath();
const browserRoot = "/opt/ms-playwright";
const installedExecutable = existsSync(browserRoot)
  ? readdirSync(browserRoot)
      .filter((name) => name.startsWith("chromium-") && !name.includes("headless"))
      .map((name) => join(browserRoot, name, "chrome-linux", "chrome"))
      .find((path) => existsSync(path))
  : undefined;
const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(bundledExecutable) ? bundledExecutable : installedExecutable,
});

try {
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    await page.waitForTimeout(250);

    const state = await page.evaluate(() => ({
      bodyText: document.body?.innerText.trim() || "",
      hasRouterPayload: Boolean(window.$_TSR?.router),
      renderMode: window.__0WEB_RENDER_MODE__ || "unknown",
    }));
    const hydrationErrors = [...consoleErrors, ...pageErrors].filter((message) => invariant.test(message));

    if (!response?.ok()) throw new Error(`${route}: HTTP ${response?.status() ?? "sem resposta"}`);
    if (hydrationErrors.length) throw new Error(`${route}: invariant de hidratação: ${hydrationErrors.join(" | ")}`);
    if (state.bodyText.length < 40) throw new Error(`${route}: blank screen (${state.bodyText.length} caracteres)`);
    if (state.renderMode === "unknown") throw new Error(`${route}: bootstrap não concluiu`);
    if (consoleErrors.length) throw new Error(`${route}: console errors: ${consoleErrors.join(" | ")}`);
    if (pageErrors.length) throw new Error(`${route}: page errors: ${pageErrors.join(" | ")}`);

    console.log(`✓ ${route} payload=${state.hasRouterPayload} mode=${state.renderMode}`);
    await context.close();
  }
} finally {
  await browser.close();
}