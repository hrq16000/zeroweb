// Server fns públicas para ler serviços da tabela public.services.
// Faz fallback para o arquivo services-data.ts caso a tabela esteja vazia ou
// o serviço não exista lá ainda. Usado por /servicos e /servicos/$slug.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SERVICES, type ServiceData, type ServiceCategory } from "@/lib/services-data";
import { isServiceSolution } from "@/lib/is-solution";

type DbServiceRow = {
  slug: string;
  name: string;
  category: string;
  title: string;
  h1: string;
  description: string;
  service_type: string;
  problems: unknown;
  benefits: unknown;
  process: unknown;
  faq: unknown;
  keywords: unknown;
  cta_label: string;
  image_path: string | null;
  image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  display_order: number;
  price: number | string | null;
  price_period: string | null;
  delivery_days: string | null;
  conditions: string | null;
  show_in_menu: boolean | null;
  show_in_footer: boolean | null;
  show_in_home_featured: boolean | null;
  show_in_sitemap: boolean | null;
  is_solution: boolean | null;
  funnels: unknown;
  gallery: unknown;
  sections: unknown;
  og_image_path: string | null;
  og_type: string | null;
  schema_jsonld: unknown;
  rich_html: string | null;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asProcess(v: unknown): { step: string; desc: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is { step?: unknown; desc?: unknown } => typeof x === "object" && x !== null)
    .map((x) => ({ step: String(x.step ?? ""), desc: String(x.desc ?? "") }))
    .filter((x) => x.step);
}

function asFaq(v: unknown): { q: string; a: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is { q?: unknown; a?: unknown } => typeof x === "object" && x !== null)
    .map((x) => ({ q: String(x.q ?? ""), a: String(x.a ?? "") }))
    .filter((x) => x.q && x.a);
}

function asGalleryRaw(v: unknown): { path: string; alt: string | null }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is { path?: unknown; alt?: unknown } => typeof x === "object" && x !== null)
    .map((x) => ({ path: String(x.path ?? ""), alt: x.alt == null ? null : String(x.alt) }))
    .filter((x) => x.path);
}

function asSections(v: unknown): { title: string; body: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is { title?: unknown; body?: unknown } => typeof x === "object" && x !== null)
    .map((x) => ({ title: String(x.title ?? ""), body: String(x.body ?? "") }))
    .filter((x) => x.title || x.body);
}

function asFunnels(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string" && val) out[k] = val;
  }
  return out;
}

export type GalleryItem = { path: string; url: string | null; alt: string | null };
// JSON-LD block; typed loosely so TanStack's serialization check accepts it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaBlock = Record<string, any>;
export type PublicServiceFull = ServiceData & {
  imagePath: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  price: number | null;
  pricePeriod: string | null;
  deliveryDays: string | null;
  conditions: string | null;
  showInMenu: boolean;
  showInFooter: boolean;
  showInHomeFeatured: boolean;
  showInSitemap: boolean;
  funnels: Record<string, string>;
  gallery: GalleryItem[];
  sections: { title: string; body: string }[];
  ogImagePath: string | null;
  ogImageUrl: string | null;
  ogType: string;
  schemaJsonLd: SchemaBlock[];
  richHtml: string | null;
};

function asSchemaBlocks(v: unknown): SchemaBlock[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is SchemaBlock => typeof x === "object" && x !== null && !Array.isArray(x));
}

function mapRow(
  row: DbServiceRow,
  imageUrl: string | null = null,
  gallery: GalleryItem[] = [],
  ogImageUrl: string | null = null,
): PublicServiceFull {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as ServiceCategory,
    title: row.seo_title || row.title,
    h1: row.h1,
    description: row.seo_description || row.description,
    serviceType: row.service_type,
    problems: asStringArray(row.problems),
    benefits: asStringArray(row.benefits),
    process: asProcess(row.process),
    faq: asFaq(row.faq),
    keywords: asStringArray(row.keywords),
    ctaLabel: row.cta_label,
    imagePath: row.image_path,
    imageUrl,
    imageAlt: row.image_alt,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    price: row.price == null ? null : Number(row.price),
    pricePeriod: row.price_period,
    deliveryDays: row.delivery_days,
    conditions: row.conditions,
    showInMenu: row.show_in_menu ?? true,
    showInFooter: row.show_in_footer ?? true,
    showInHomeFeatured: row.show_in_home_featured ?? true,
    showInSitemap: row.show_in_sitemap ?? true,
    funnels: asFunnels(row.funnels),
    gallery,
    sections: asSections(row.sections),
    ogImagePath: row.og_image_path,
    ogImageUrl: ogImageUrl ?? imageUrl,
    ogType: row.og_type || "website",
    schemaJsonLd: asSchemaBlocks(row.schema_jsonld),
    richHtml: row.rich_html,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function signImage(sb: any, path: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    const { data } = await sb.storage
      .from("service-images")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function signGallery(sb: any, raw: unknown): Promise<GalleryItem[]> {
  const items = asGalleryRaw(raw);
  return Promise.all(
    items.map(async (it) => ({
      path: it.path,
      alt: it.alt,
      url: await signImage(sb, it.path),
    })),
  );
}

const COLS =
  "slug,name,category,title,h1,description,service_type,problems,benefits,process,faq,keywords,cta_label,image_path,image_alt,seo_title,seo_description,display_order,price,price_period,delivery_days,conditions,show_in_menu,show_in_footer,show_in_home_featured,show_in_sitemap,funnels,gallery,sections,og_image_path,og_type,schema_jsonld,rich_html";

// Sem fallbacks de imagem: capa vem 100% do painel administrativo
// (coluna image_path da tabela services + bucket service-images).
const fileFallback = (s: ServiceData): PublicServiceFull => ({
  ...s,
  imagePath: null,
  imageUrl: null,
  imageAlt: null,
  seoTitle: null,
  seoDescription: null,
  price: null,
  pricePeriod: null,
  deliveryDays: null,
  conditions: null,
  showInMenu: true,
  showInFooter: true,
  showInHomeFeatured: true,
  showInSitemap: true,
  funnels: {},
  gallery: [],
  sections: [],
  ogImagePath: null,
  ogImageUrl: null,
  ogType: "website",
  schemaJsonLd: [],
  richHtml: null,
});

export const listServicesPublic = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("services")
      .select(COLS)
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as unknown as DbServiceRow[];
    const mapped = await Promise.all(
      rows.map(async (r) =>
        mapRow(
          r,
          await signImage(supabaseAdmin, r.image_path),
          await signGallery(supabaseAdmin, r.gallery),
          await signImage(supabaseAdmin, r.og_image_path),
        ),
      ),
    );
    // Banco é a única fonte de verdade. Slugs antigos do arquivo só aparecem
    // se ainda não foram migrados (legado de SEO city pages).
    const seen = new Set(mapped.map((s) => s.slug));
    for (const s of Object.values(SERVICES)) {
      if (!seen.has(s.slug)) mapped.push(fileFallback(s));
    }
    return { services: mapped };
  } catch (err) {
    console.error("[listServicesPublic] fallback to file", err);
    return { services: Object.values(SERVICES).map(fileFallback) };
  }
});


export const getServicePublic = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("services")
        .select(COLS)
        .eq("slug", data.slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (row) {
        const r = row as unknown as DbServiceRow;
        const imageUrl = await signImage(supabaseAdmin, r.image_path);
        const gallery = await signGallery(supabaseAdmin, r.gallery);
        const ogImageUrl = await signImage(supabaseAdmin, r.og_image_path);
        return { service: mapRow(r, imageUrl, gallery, ogImageUrl), source: "db" as const };
      }
    } catch (err) {
      console.error("[getServicePublic] fallback to file", err);
    }
    const fallback = SERVICES[data.slug];
    if (!fallback) return { service: null, source: "none" as const };
    return { service: fileFallback(fallback), source: "file" as const };
  });

export type PublicService = Awaited<ReturnType<typeof listServicesPublic>>["services"][number];
