import { queryOptions } from "@tanstack/react-query";
import { listServicesNav } from "@/lib/services-nav.functions";

/**
 * Fonte única da query de navegação de serviços.
 * Usada no loader (SSR) e nos componentes, garantindo que servidor e cliente
 * renderizem exatamente o mesmo HTML (sem hydration mismatch).
 */
export const servicesNavQuery = queryOptions({
  queryKey: ["services-nav"],
  queryFn: () => listServicesNav(),
  staleTime: 5 * 60 * 1000,
});
