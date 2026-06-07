// Server fn pública para navegação (menu, rodapé, destaques da home).
// Lê services com flags de visibilidade. Inclui imagem assinada apenas para
// destaques (cards visuais). Header/Footer apenas precisam de slug/nome/category.
import { createServerFn } from "@tanstack/react-start";

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
  display_order: number;
};

export const listServicesNav = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("services")
      .select(
        "slug,name,category,description,image_path,image_alt,show_in_menu,show_in_footer,show_in_home_featured,show_in_sitemap,display_order",
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as unknown as Row[];

    const featured = rows.filter((r) => r.show_in_home_featured ?? true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signed = await Promise.all(
      featured.map(async (r) => {
        let imageUrl: string | null = null;
        if (r.image_path) {
          try {
            const { data: sig } = await supabaseAdmin.storage
              .from("service-images")
              .createSignedUrl(r.image_path, 60 * 60 * 24 * 7);
            imageUrl = sig?.signedUrl ?? null;
          } catch {
            imageUrl = null;
          }
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
      menu: rows.filter((r) => r.show_in_menu ?? true).map(toNav),
      footer: rows.filter((r) => r.show_in_footer ?? true).map(toNav),
      homeFeatured: featured.map(toNav),
      sitemap: rows.filter((r) => r.show_in_sitemap ?? true).map((r) => r.slug),
    };
  } catch (err) {
    console.error("[listServicesNav] failed", err);
    return { menu: [], footer: [], homeFeatured: [], sitemap: [] };
  }
});
