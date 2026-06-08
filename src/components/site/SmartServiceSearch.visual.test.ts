import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regressão visual leve da SmartServiceSearch.
 *
 * O bug que esta suíte previne é o "header pulando" durante o carregamento:
 * se alguém remover a altura fixa do input, a largura/altura do ícone, ou
 * o `object-contain` do loader/ícone, o cabeçalho da página de busca passa
 * a sofrer reflow (CLS) ao montar/desmontar o painel de sugestões.
 *
 * Como a SmartServiceSearch usa as MESMAS classes Tailwind em todos os
 * breakpoints (sem código condicional por viewport), checar as invariantes
 * no markup cobre desktop, tablet e mobile de uma vez.
 */
const FILE = readFileSync(
  join(import.meta.dir, "SmartServiceSearch.tsx"),
  "utf8",
);

describe("SmartServiceSearch — invariantes de layout (anti-CLS)", () => {
  test("input tem altura fixa h-14 (sem reflow ao abrir/fechar painel)", () => {
    // Procura pela classe h-14 no input principal.
    expect(FILE).toContain("h-14");
  });

  test("ícone de busca tem dimensões fixas w-5 h-5 (sem squish)", () => {
    expect(FILE).toMatch(/<Search[^>]*className="w-5 h-5/);
  });

  test("ícone secundário (lista) usa shrink-0 para não distorcer", () => {
    // Garante aspect ratio durante o render dos items de sugestão.
    expect(FILE).toMatch(/<Search[^>]*shrink-0/);
  });

  test("wrapper reserva largura máxima previsível (max-w-2xl, mx-auto)", () => {
    // Sem isto, o input estica/encolhe conforme o conteúdo dos chips
    // de SEO, gerando reflow horizontal no cabeçalho de /servicos.
    expect(FILE).toMatch(/max-w-2xl[\s\S]{0,40}mx-auto|mx-auto[\s\S]{0,40}max-w-2xl/);
  });

  test("input aplica font-size inline controlado (auto-fit, sem layout shift)", () => {
    // O auto-fit ajusta fontPx no estilo inline; sem isto, o placeholder
    // longo causaria overflow horizontal em mobile.
    expect(FILE).toMatch(/style=\{\{\s*fontSize:\s*`?\$\{fontPx\}px`?\s*\}\}/);
  });

  test("painel de sugestões usa position absolute (não empurra o header)", () => {
    // O painel não deve participar do fluxo do cabeçalho.
    expect(FILE).toMatch(/absolute[\s\S]{0,200}suggestions|suggestions[\s\S]{0,200}absolute/i);
  });
});

describe("SmartServiceSearch — invariantes equivalentes a object-contain", () => {
  test("não força aspect-ratio 1/1 no ícone (regressão do ícone espremido)", () => {
    expect(FILE).not.toMatch(/<Search[^>]*aspect-\[1\/1\]/);
    expect(FILE).not.toMatch(/<Search[^>]*aspect-square/);
  });

  test("não usa width/height percentuais no ícone (que causariam squish)", () => {
    expect(FILE).not.toMatch(/<Search[^>]*className="[^"]*w-full/);
  });
});
