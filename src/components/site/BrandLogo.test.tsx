import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrandLogo } from "./BrandLogo";

/**
 * Regressão visual: garante que o logo sempre carrega com aspect-ratio 1:1
 * e object-contain, em qualquer breakpoint (desktop/tablet/mobile). Se
 * algum estilo for removido por engano, o teste quebra.
 */
describe("BrandLogo aspect-ratio", () => {
  const sizes = [
    { label: "mobile", size: 24 },
    { label: "tablet", size: 32 },
    { label: "desktop", size: 72 },
  ];

  for (const { label, size } of sizes) {
    it(`mantém proporção e object-contain em ${label} (${size}px)`, () => {
      const { container } = render(<BrandLogo size={size} priority />);
      const img = container.querySelector("img")!;
      expect(img).toBeTruthy();
      expect(img.getAttribute("width")).toBe(String(size));
      expect(img.getAttribute("height")).toBe(String(size));
      expect(img.className).toContain("object-contain");
      expect(img.className).toContain("shrink-0");
      expect(img.style.aspectRatio.replace(/\s/g, "")).toBe("1/1");
      expect(img.style.width).toBe(`${size}px`);
      expect(img.style.height).toBe(`${size}px`);
    });
  }
});
