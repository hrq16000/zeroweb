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

function mapRow(row: DbServiceRow, imageUrl: string | null = null): ServiceData & {
  imagePath: string | null;
  imageUrl: string | null;
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
    imageUrl,
    imageAlt: row.image_alt,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
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

const COLS =
  "slug,name,category,title,h1,description,service_type,problems,benefits,process,faq,keywords,cta_label,image_path,image_alt,seo_title,seo_description,display_order";

// Fallback de capa por slug — para serviços ainda sem registro/imagem no banco.
// Vite resolve estes imports para URLs estáveis no bundle.
import siteExpressCapa from "@/assets/site-express-capa.jpg";
import site24hCapa from "@/assets/site-24h-capa.jpg";
import consultoriaCapa from "@/assets/consultoria-capa.jpg";
import seoCapa from "@/assets/seo-capa.jpg";
import marketplaceCapa from "@/assets/marketplace-capa.jpg";
import parceirosCapa from "@/assets/parceiros-capa.jpg";
import trafegoLocalCapa from "@/assets/trafego-pago-local-capa.jpg";
import trafegoPagoAsset from "@/assets/trafego-pago-499-capa.png.asset.json";
import presencaDigitalAsset from "@/assets/presenca-digital-google-capa.png.asset.json";
import googleMNAsset from "@/assets/google-meu-negocio-capa.png.asset.json";

const FALLBACK_COVERS: Record<string, { url: string; alt: string }> = {
  "site-express": { url: siteExpressCapa, alt: "Capa Site Express em 24h" },
  "site-24h": { url: site24hCapa, alt: "Capa Site em 24 horas" },
  consultoria: { url: consultoriaCapa, alt: "Capa Consultoria Estratégica" },
  seo: { url: seoCapa, alt: "Capa SEO" },
  marketplace: { url: marketplaceCapa, alt: "Capa Marketplace de Serviços" },
  parceiros: { url: parceirosCapa, alt: "Capa Programa de Parceiros" },
  "trafego-pago-local": { url: trafegoLocalCapa, alt: "Capa Tráfego Pago Local" },
  "trafego-pago": { url: trafegoPagoAsset.url, alt: "Capa Tráfego Pago" },
  "presenca-digital": { url: presencaDigitalAsset.url, alt: "Capa Presença Digital" },
  "google-meu-negocio": { url: googleMNAsset.url, alt: "Capa Google Meu Negócio" },
};

const fileFallback = (s: ServiceData) => {
  const cover = FALLBACK_COVERS[s.slug] ?? null;
  return {
    ...s,
    imagePath: null,
    imageUrl: cover?.url ?? null,
    imageAlt: cover?.alt ?? null,
    seoTitle: null,
    seoDescription: null,
  };
};

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
      rows.map(async (r) => mapRow(r, await signImage(supabaseAdmin, r.image_path))),
    );
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
        return { service: mapRow(r, imageUrl), source: "db" as const };
      }
    } catch (err) {
      console.error("[getServicePublic] fallback to file", err);
    }
    const fallback = SERVICES[data.slug];
    if (!fallback) return { service: null, source: "none" as const };
    return { service: fileFallback(fallback), source: "file" as const };
  });

export type PublicService = Awaited<ReturnType<typeof listServicesPublic>>["services"][number];
