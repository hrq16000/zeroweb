import { describe, expect, test } from "bun:test";
import { hasServicePrice, isCatalogProduct, isServiceSolution } from "./is-solution";

describe("service solution/product classification", () => {
  test("preço real sempre classifica como produto, mesmo se is_solution vier true", () => {
    expect(isServiceSolution({ price: 499, is_solution: true })).toBe(false);
    expect(isCatalogProduct({ price: "1490", is_solution: true })).toBe(true);
  });

  test("sem preço e flag nula vira solução", () => {
    expect(isServiceSolution({ price: null, is_solution: null })).toBe(true);
    expect(isServiceSolution({ price: 0, is_solution: null })).toBe(true);
  });

  test("hasServicePrice só aceita valores positivos e finitos", () => {
    expect(hasServicePrice({ price: 1 })).toBe(true);
    expect(hasServicePrice({ price: "0" })).toBe(false);
    expect(hasServicePrice({ price: "abc" })).toBe(false);
    expect(hasServicePrice({ price: null })).toBe(false);
  });
});