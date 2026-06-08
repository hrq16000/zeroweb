// Server fn pública para navegação (menu, rodapé, destaques da home,
// sitemap, /solucoes). Lê services com flags de visibilidade.
// Solução vs Produto: combo manual `is_solution` + fallback automático
// (price NULL/0). Soluções são EXCLUÍDAS de menu/footer/featured/sitemap
// de serviços — vivem em /solucoes.
import { createServerFn } from "@tanstack/react-start";
import { isServiceSolution } from "@/lib/is-solution";

export type NavService = {
  slug: string;
  name: string;
  category: string;
  imageUrl: string | null;
  imageAlt: string | null;
  description: string;
};

type Row = {
  slug: string;
  name: string;
  category: string;
  description: string;
  image_path: string | null;
  image_alt: string | null;
  show_in_menu: boolean | null;
  show_in_footer: boolean | null;
  show_in_home_featured: boolean | null;
  show_in_sitemap: boolean | null;
  is_solution: boolean | null;
  price: number | string | null;
  display_order: number;
};

export const listServicesNav = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("services")
      .select(
        "slug,name,category,description,image_path,image_alt,show_in_menu,show_in_footer,show_in_home_featured,show_in_sitemap,is_solution,price,display_order",
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as unknown as Row[];

    // Particiona produtos vs soluções com base na regra unificada.
    const products = rows.filter((r) => !isServiceSolution(r));
    const solutions = rows.filter((r) => isServiceSolution(r));

    const featured = products.filter((r) => r.show_in_home_featured ?? true);
    // Assina imagens só para featured + soluções (cards visuais).
    const toSign = new Set<string>([
      ...featured.map((r) => r.slug),
      ...solutions.map((r) => r.slug),
    ]);
    const signed = await Promise.all(
      rows
        .filter((r) => toSign.has(r.slug) && r.image_path)
        .map(async (r) => {
          let imageUrl: string | null = null;
          try {
            const { data: sig } = await supabaseAdmin.storage
              .from("service-images")
              .createSignedUrl(r.image_path as string, 60 * 60 * 24 * 7);
            imageUrl = sig?.signedUrl ?? null;
          } catch {
            imageUrl = null;
          }
          return [r.slug, imageUrl] as const;
        }),
    );
    const signedMap = new Map(signed);

    const toNav = (r: Row): NavService => ({
      slug: r.slug,
      name: r.name,
      category: r.category,
      description: r.description,
      imageUrl: signedMap.get(r.slug) ?? null,
      imageAlt: r.image_alt,
    });

    return {
      menu: products.filter((r) => r.show_in_menu ?? true).map(toNav),
      footer: products.filter((r) => r.show_in_footer ?? true).map(toNav),
      homeFeatured: featured.map(toNav),
      sitemap: products.filter((r) => r.show_in_sitemap ?? true).map((r) => r.slug),
      solutions: solutions.map(toNav),
      solutionsSitemap: solutions
        .filter((r) => r.show_in_sitemap ?? true)
        .map((r) => r.slug),
    };
  } catch (err) {
    console.error("[listServicesNav] failed", err);
    return {
      menu: [],
      footer: [],
      homeFeatured: [],
      sitemap: [],
      solutions: [],
      solutionsSitemap: [],
    };
  }
});
