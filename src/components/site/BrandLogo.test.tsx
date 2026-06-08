import { describe, expect, test } from "bun:test";
import { BrandLogo } from "./BrandLogo";

/**
 * Regressão visual leve: garante que o BrandLogo sempre é renderizado
 * com aspect-ratio 1:1, object-contain e dimensões coerentes em
 * mobile/tablet/desktop. Se alguém remover por engano essas regras,
 * o teste quebra antes do logo aparecer achatado em produção.
 */
describe("BrandLogo aspect-ratio invariantes", () => {
  const breakpoints = [
    { label: "mobile", size: 24 },
    { label: "tablet", size: 32 },
    { label: "desktop", size: 72 },
  ];

  for (const { label, size } of breakpoints) {
    test(`${label} (${size}px) mantém object-contain + aspect-ratio 1/1`, () => {
      const el = BrandLogo({ size, priority: true }) as {
        props: {
          width: number;
          height: number;
          className: string;
          style: { width: number; height: number; aspectRatio: string };
        };
      };
      expect(el.props.width).toBe(size);
      expect(el.props.height).toBe(size);
      expect(el.props.className).toContain("object-contain");
      expect(el.props.className).toContain("shrink-0");
      expect(el.props.style.width).toBe(size);
      expect(el.props.style.height).toBe(size);
      expect(el.props.style.aspectRatio.replace(/\s/g, "")).toBe("1/1");
    });
  }
});
