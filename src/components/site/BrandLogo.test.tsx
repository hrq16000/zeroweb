import { describe, expect, test } from "bun:test";
import { BrandLogo, LOGO_ASPECT_RATIO } from "./BrandLogo";

/**
 * Regressão visual leve: garante que o BrandLogo (wordmark) sempre é
 * renderizado com `object-contain`, altura controlada e largura derivada
 * da proporção real (≈ 3.25:1). Se alguém voltar a forçar 1:1 — o que
 * deixava o logo achatado — este teste quebra antes de chegar a produção.
 *
 * Cobre mobile/tablet/desktop e o tamanho do overlay de loading (RouteLoader),
 * o ponto mais sensível ao reflow do cabeçalho durante navegação.
 */
describe("BrandLogo — proporção natural em todos os breakpoints", () => {
  const breakpoints = [
    { label: "mobile-header", size: 24 },
    { label: "tablet-header", size: 32 },
    { label: "checkout", size: 40 },
    { label: "desktop-loader", size: 72 },
  ];

  for (const { label, size } of breakpoints) {
    test(`${label} (h=${size}px) mantém object-contain + aspect-ratio natural`, () => {
      const el = BrandLogo({ size, priority: true }) as {
        props: {
          width: number;
          height: number;
          className: string;
          style: { width: number; height: number; aspectRatio: string };
        };
      };
      const expectedWidth = Math.round(size * LOGO_ASPECT_RATIO);

      // Altura controlada, largura derivada da proporção real do wordmark.
      expect(el.props.height).toBe(size);
      expect(el.props.width).toBe(expectedWidth);
      expect(el.props.style.height).toBe(size);
      expect(el.props.style.width).toBe(expectedWidth);

      // Aspect ratio explícito reserva o espaço antes do carregamento,
      // evitando reflow do cabeçalho (CLS).
      expect(el.props.style.aspectRatio).toBe(`${expectedWidth} / ${size}`);

      // Classes invariantes para não-distorção e estabilidade do layout.
      expect(el.props.className).toContain("object-contain");
      expect(el.props.className).toContain("shrink-0");
      expect(el.props.className).toContain("block");
    });
  }

  test("nunca usa aspect-ratio 1/1 (regressão do logo espremido)", () => {
    const el = BrandLogo({ size: 32 }) as { props: { style: { aspectRatio: string } } };
    expect(el.props.style.aspectRatio.replace(/\s/g, "")).not.toBe("1/1");
  });
});
