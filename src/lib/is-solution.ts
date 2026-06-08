// Regra unificada para decidir se um serviço é uma "Solução" (página sem
// preço/checkout, vive em /solucoes) ou um "Produto" (catálogo /servicos).
//
// Padrão atual:
// - preço real (> 0) SEMPRE vence e envia o item para a loja (/servicos)
// - sem preço real, `is_solution` definido ainda pode documentar a intenção
// - sem preço + flag nula vira solução automaticamente

export type SolutionFlagInput = {
  is_solution?: boolean | null;
  isSolution?: boolean | null;
  price?: number | string | null;
};

export function servicePriceNumber(s: Pick<SolutionFlagInput, "price">): number | null {
  if (s.price == null || s.price === "") return null;
  const price = Number(s.price);
  return Number.isFinite(price) ? price : null;
}

export function hasServicePrice(s: Pick<SolutionFlagInput, "price">): boolean {
  const price = servicePriceNumber(s);
  return price != null && price > 0;
}

export function isServiceSolution(s: SolutionFlagInput): boolean {
  const flag = s.is_solution ?? s.isSolution ?? null;
  if (hasServicePrice(s)) return false;
  if (flag === true) return true;
  if (flag === false) return false;
  return true;
}

export function isCatalogProduct(s: SolutionFlagInput): boolean {
  return hasServicePrice(s) && !isServiceSolution(s);
}
