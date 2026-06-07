// Server fn pública para ler hero_slides de uma página (ex.: 'servicos').
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type HeroSlide = {
  id: string;
  page: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string | null;
  bgGradient: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  ctaSecondaryLabel: string | null;
  ctaSecondaryHref: string | null;
};

type Row = {
  id: string;
  page: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  badge: string | null;
  image_path: string | null;
  image_url: string | null;
  bg_gradient: string | null;
  cta_label: string | null;
  cta_href: string | null;
  cta_secondary_label: string | null;
  cta_secondary_href: string | null;
};

export const listHeroSlides = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ page: z.string().min(1).max(40).default("servicos") }).parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<{ slides: HeroSlide[] }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin
        .from("hero_slides")
        .select(
          "id,page,eyebrow,title,subtitle,badge,image_path,image_url,bg_gradient,cta_label,cta_href,cta_secondary_label,cta_secondary_href",
        )
        .eq("page", data.page)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;

      const slides: HeroSlide[] = await Promise.all(
        ((rows ?? []) as Row[]).map(async (r) => {
          let imageUrl = r.image_url;
          if (!imageUrl && r.image_path) {
            try {
              const { data: signed } = await supabaseAdmin.storage
                .from("service-images")
                .createSignedUrl(r.image_path, 60 * 60 * 24 * 7);
              imageUrl = signed?.signedUrl ?? null;
            } catch {
              imageUrl = null;
            }
          }
          return {
            id: r.id,
            page: r.page,
            eyebrow: r.eyebrow,
            title: r.title,
            subtitle: r.subtitle,
            badge: r.badge,
            imageUrl,
            bgGradient: r.bg_gradient,
            ctaLabel: r.cta_label,
            ctaHref: r.cta_href,
            ctaSecondaryLabel: r.cta_secondary_label,
            ctaSecondaryHref: r.cta_secondary_href,
          };
        }),
      );

      return { slides };
    } catch (err) {
      console.error("[listHeroSlides] falhou", err);
      return { slides: [] };
    }
  });
