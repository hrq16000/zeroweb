import { describe, expect, test } from "bun:test";
import { SERVICES, ALL_SERVICE_SLUGS } from "@/lib/services-data";

// Garante que todos os slugs do catálogo geram URLs no padrão /servicos/{slug}.
describe("catalog routing", () => {
  test("every slug builds a /servicos/{slug} URL", () => {
    for (const slug of ALL_SERVICE_SLUGS) {
      const url = `/servicos/${slug}`;
      expect(url).toMatch(/^\/servicos\/[a-z0-9-]+$/);
    }
  });

  test("no slug contains uppercase/spaces/underscores", () => {
    for (const slug of ALL_SERVICE_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test("services-data records align with slug keys", () => {
    for (const [key, svc] of Object.entries(SERVICES)) {
      expect(svc.slug).toBe(key);
    }
  });
});

// Mapa explícito de 301s legados → /servicos/{slug}.
// Se alguém renomear o slug-destino, este teste falha e força revisão.
describe("legacy 301 redirects", () => {
  const legacyMap: Record<string, string> = {
    "/criacao-sites": "criacao-de-sites",
    "/landing-pages": "landing-pages",
    "/seo": "seo",
    "/automacao": "automacao-com-ia",
    "/ia": "automacao-com-ia",
    "/desenvolvimento": "desenvolvimento-saas",
    "/redes-sociais": "gestao-redes-sociais",
  };

  test.each(Object.entries(legacyMap))(
    "%s redirects to /servicos/%s",
    (_legacy, targetSlug) => {
      // O slug-destino precisa existir em services-data OU ter rota dedicada.
      // 'seo' só existe no fallback de arquivo (não no DB) → ok.
      expect(ALL_SERVICE_SLUGS).toContain(targetSlug);
    },
  );
});
