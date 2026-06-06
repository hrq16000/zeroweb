import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

// Lê o Header.tsx e valida que a config de navegação:
// 1) Contém todos os itens esperados (incluindo /servicos e /servicos/automacao-com-ia)
// 2) Não tem links órfãos que iriam 404 nas páginas legadas
// 3) Mantém o handler de fechar ao clicar fora + Escape
const headerSrc = readFileSync(
  resolve(__dirname, "../Header.tsx"),
  "utf8",
);

describe("Header menu", () => {
  test("inclui Serviços e IA com slugs do catálogo", () => {
    expect(headerSrc).toMatch(/{\s*to:\s*"\/servicos"\s*,\s*label:\s*"Serviços"\s*}/);
    expect(headerSrc).toMatch(/{\s*to:\s*"\/servicos\/automacao-com-ia"\s*,\s*label:\s*"IA"\s*}/);
  });

  test("não usa rotas legadas /ia, /seo, /criacao-sites no nav", () => {
    // Procura tokens isolados, não comentários acidentais.
    const navBlock = headerSrc.split("const nav")[1]?.split("];")[0] ?? "";
    expect(navBlock).not.toMatch(/to:\s*"\/ia"/);
    expect(navBlock).not.toMatch(/to:\s*"\/seo"/);
    expect(navBlock).not.toMatch(/to:\s*"\/criacao-sites"/);
  });

  test("fecha menu ao trocar de rota (useEffect depende de pathname)", () => {
    expect(headerSrc).toMatch(/useEffect\(\(\)\s*=>\s*{\s*setOpen\(false\);\s*}\s*,\s*\[pathname\]\)/);
  });

  test("fecha menu ao clicar fora (mousedown/touchstart) e Escape", () => {
    expect(headerSrc).toMatch(/addEventListener\("mousedown"/);
    expect(headerSrc).toMatch(/addEventListener\("touchstart"/);
    expect(headerSrc).toMatch(/e\.key === "Escape"/);
  });
});

describe("Footer service links", () => {
  const footerSrc = readFileSync(
    resolve(__dirname, "../Footer.tsx"),
    "utf8",
  );

  test("todos os links de Soluções/Tecnologia usam /servicos/{slug}", () => {
    // Extrai os links via regex simples.
    const linkRe = /label:\s*"[^"]+",\s*to:\s*"([^"]+)"/g;
    const tos: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(footerSrc))) tos.push(m[1]);
    const serviceLikePaths = tos.filter((t) =>
      /^\/(criacao-sites|landing-pages|seo|automacao|ia|desenvolvimento|redes-sociais)$/.test(t),
    );
    expect(serviceLikePaths).toEqual([]);
  });
});
