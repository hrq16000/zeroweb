// Server fns públicas para ler serviços da tabela public.services.
// Faz fallback para o arquivo services-data.ts caso a tabela esteja vazia ou
// o serviço não exista lá ainda. Usado por /servicos e /servicos/$slug.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SERVICES, type ServiceData, type ServiceCategory } from "@/lib/services-data";

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

function mapRow(row: DbServiceRow): ServiceData & {
  imagePath: string | null;
  imageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
} {
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
    imageAlt: row.image_alt,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

const COLS =
  "slug,name,category,title,h1,description,service_type,problems,benefits,process,faq,keywords,cta_label,image_path,image_alt,seo_title,seo_description,display_order";

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
    const mapped = rows.map(mapRow);
    // Fallback: garante que serviços do arquivo (não-DB) ainda apareçam.
    const seen = new Set(mapped.map((s) => s.slug));
    for (const s of Object.values(SERVICES)) {
      if (!seen.has(s.slug)) mapped.push({
        ...s,
        imagePath: null,
        imageAlt: null,
        seoTitle: null,
        seoDescription: null,
      });
    }
    return { services: mapped };
  } catch (err) {
    console.error("[listServicesPublic] fallback to file", err);
    return {
      services: Object.values(SERVICES).map((s) => ({
        ...s,
        imagePath: null,
        imageAlt: null,
        seoTitle: null,
        seoDescription: null,
      })),
    };
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
      if (row) return { service: mapRow(row as unknown as DbServiceRow), source: "db" as const };
    } catch (err) {
      console.error("[getServicePublic] fallback to file", err);
    }
    const fallback = SERVICES[data.slug];
    if (!fallback) return { service: null, source: "none" as const };
    return {
      service: {
        ...fallback,
        imagePath: null,
        imageAlt: null,
        seoTitle: null,
        seoDescription: null,
      },
      source: "file" as const,
    };
  });

export type PublicService = Awaited<ReturnType<typeof listServicesPublic>>["services"][number];
