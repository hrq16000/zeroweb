/**
 * E2E Funnel-first: CTA → modal → respostas → lead → token → redirect WhatsApp.
 *
 * Valida o contrato completo sem depender de layout:
 *  - a página pública NÃO expõe wa.me/mailto/tel;
 *  - o CTA abre o modal do funil (não navega para /contato);
 *  - o funil conclui e produz protocolo + link tokenizado /r/whatsapp/<token>;
 *  - o token resolve para wa.me apenas no servidor (redirect 30x/302).
 */
import { chromium } from "playwright";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.E2E_BASE_URL || "http://localhost:8080";
const ROUTES = ["/", "/servicos/google-ads-299"];

const bundled = chromium.executablePath();
const root = "/opt/ms-playwright";
const installed = existsSync(root)
  ? readdirSync(root)
      .filter((n) => n.startsWith("chromium-") && !n.includes("headless"))
      .map((n) => join(root, n, "chrome-linux", "chrome"))
      .find((p) => existsSync(p))
  : undefined;

const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(bundled) ? bundled : installed,
});

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.error(`✗ ${msg}`);
};
const ok = (msg) => console.log(`✓ ${msg}`);

async function answerCurrentStep(page) {
  const option = page.locator('[data-testid="funnel-option"]').first();
  if (await option.count()) {
    await option.click();
    return true;
  }
  const input = page.locator('[data-testid="funnel-input"]').first();
  if (await input.count()) {
    const tag = await input.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      await input.selectOption({ index: 1 }).catch(async () => {
        await input.evaluate((el) => {
          const opt = Array.from(el.options).find((o) => o.value);
          if (opt) {
            el.value = opt.value;
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
      const nextSel = page.locator('[data-testid="funnel-next"]');
      if (await nextSel.count()) await nextSel.click();
      return true;
    }
    const type = (await input.getAttribute("type")) || "";
    const mode = (await input.getAttribute("inputmode")) || "";
    const value = type === "email" ? "teste-e2e@example.test" : mode === "tel" ? "41999990000" : "Teste E2E 0WEB";
    await input.fill(value);
  }
  const next = page.locator('[data-testid="funnel-next"]');
  if (await next.count()) {
    await next.click();
    return true;
  }
  return false;
}

try {
  for (const route of ROUTES) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    // aguarda a hidratação: antes dela o CTA é um <a> puro e navegaria para /contato
    await page
      .waitForFunction(() => Boolean(window.__0web_hydrated ?? window.$_TSR), null, { timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(1500);

    // 1) nenhum contato público no HTML renderizado
    const html = await page.content();
    for (const [re, name] of [
      [/wa\.me\/\d+/, "wa.me/<numero>"],
      [/mailto:[^"'\s]+@0web/i, "mailto 0web"],
      [/tel:\+?\d[\d\s().-]{7,}/i, "tel:"],
    ]) {
      if (re.test(html)) fail(`${route}: HTML expõe ${name}`);
    }
    ok(`${route}: HTML sem contatos públicos`);

    // 2) CTA abre o modal do funil
    const cta = page.locator('[data-testid="funnel-cta"]').first();
    if (!(await cta.count())) {
      fail(`${route}: nenhum [data-testid="funnel-cta"] encontrado`);
      await context.close();
      continue;
    }
    await cta.click();
    const modal = page.locator('[data-testid="funnel-modal"]');
    try {
      await modal.waitFor({ state: "visible", timeout: 8000 });
    } catch {
      fail(`${route}: CTA não abriu o modal do funil (URL atual ${page.url()})`);
      await context.close();
      continue;
    }
    if (/\/contato/.test(page.url())) fail(`${route}: CTA navegou para /contato`);
    ok(`${route}: CTA abriu o modal (${await modal.getAttribute("data-funnel-slug")})`);

    // 3) percorrer o funil até a conclusão
    let steps = 0;
    while (steps < 25) {
      if (await page.locator('[data-testid="funnel-done"]').count()) break;
      const advanced = await answerCurrentStep(page);
      if (!advanced) break;
      steps += 1;
      await page.waitForTimeout(450);
    }
    const done = page.locator('[data-testid="funnel-done"]');
    try {
      await done.waitFor({ state: "visible", timeout: 20000 });
    } catch {
      fail(`${route}: funil não concluiu após ${steps} passos`);
      await context.close();
      continue;
    }

    // 4) protocolo + link tokenizado
    const protocol = (await page.locator('[data-testid="funnel-protocol"]').textContent().catch(() => null))?.trim();
    if (!protocol) fail(`${route}: conclusão sem protocolo`);
    else ok(`${route}: protocolo ${protocol}`);

    const link = page.locator('[data-testid="funnel-whatsapp-link"]');
    const hasRedirect = (await done.getAttribute("data-redirect")) === "1";
    if (!hasRedirect || !(await link.count())) {
      fail(`${route}: conclusão sem link de redirect tokenizado`);
      await context.close();
      continue;
    }
    const href = await link.getAttribute("href");
    if (!/^\/r\/whatsapp\/[A-Za-z0-9._-]+$/.test(href || "")) {
      fail(`${route}: href inesperado "${href}" (esperado /r/whatsapp/<token>)`);
    } else {
      ok(`${route}: link tokenizado ${href}`);
      // 5) o token resolve no servidor para wa.me, sem expor o número no client
      const res = await context.request.get(`${baseUrl}${href}`, { maxRedirects: 0 });
      const location = res.headers()["location"] || "";
      if (res.status() >= 300 && res.status() < 400 && /wa\.me\/\d+/.test(location)) {
        ok(`${route}: token resolveu server-side (${res.status()} → wa.me)`);
      } else {
        fail(`${route}: token não redirecionou para wa.me (status ${res.status()}, location "${location.slice(0, 60)}")`);
      }
    }

    const relevant = consoleErrors.filter((e) => !/favicon|third-party|ResizeObserver/i.test(e));
    if (relevant.length) fail(`${route}: erros de console → ${relevant.slice(0, 3).join(" | ")}`);

    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n✗ E2E funil falhou com ${failures.length} problema(s).`);
  process.exit(1);
}
console.log("\n✓ E2E funil: CTA → modal → lead → token → redirect validado.");
