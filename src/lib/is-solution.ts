// Regra unificada para decidir se um serviço é uma "Solução" (página sem
// preço/checkout, vive em /solucoes) ou um "Produto" (catálogo /servicos).
//
// Combo combinado escolhido pelo cliente:
// - flag manual `is_solution` PREVALECE (true ou false)
// - se nula/indefinida, fallback automático: preço NULL/0 → solução

export type SolutionFlagInput = {
  is_solution?: boolean | null;
  isSolution?: boolean | null;
  price?: number | string | null;
};

export function isServiceSolution(s: SolutionFlagInput): boolean {
  const flag = s.is_solution ?? s.isSolution ?? null;
  if (flag === true) return true;
  if (flag === false) return false;
  const price = s.price == null ? null : Number(s.price);
  return price == null || !Number.isFinite(price) || price <= 0;
}
