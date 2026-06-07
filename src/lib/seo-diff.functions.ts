// Server fn que compara SEO da rota servida (literal ou dinâmica) com
// o que seria gerado a partir do banco. Usado pela página /app/servicos.seo-diff.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getServicePublic } from "@/lib/services-public.functions";
import { ORIGIN } from "@/lib/seo";

export type SeoSnapshot = {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogType: string | null;
  ogImage: string | null;
  canonical: string | null;
  jsonLd: unknown[];
  raw: string | null;
};

function pickMeta(html: string, attr: "name" | "property", key: string): string | null {
  // Tenta os dois formatos: <meta name="..." content="..."> e o reverso.
  const re1 = new RegExp(
    `<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`,
    "i",
  );
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function parseHead(html: string): SeoSnapshot {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonMatch =
    html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ??
    html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);

  const jsonLd: unknown[] = [];
  const ldRe =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html))) {
    try {
      jsonLd.push(JSON.parse(m[1].trim()));
    } catch {
      jsonLd.push({ _parseError: true, raw: m[1].slice(0, 200) });
    }
  }

  return {
    title: titleMatch?.[1]?.trim() ?? null,
    description: pickMeta(html, "name", "description"),
    ogTitle: pickMeta(html, "property", "og:title"),
    ogDescription: pickMeta(html, "property", "og:description"),
    ogType: pickMeta(html, "property", "og:type"),
    ogImage: pickMeta(html, "property", "og:image"),
    canonical: canonMatch?.[1] ?? null,
    jsonLd,
    raw: null,
  };
}

function fromDb(service: Awaited<ReturnType<typeof getServicePublic>>["service"]): SeoSnapshot {
  if (!service) {
    return {
      title: null,
      description: null,
      ogTitle: null,
      ogDescription: null,
      ogType: null,
      ogImage: null,
      canonical: null,
      jsonLd: [],
      raw: null,
    };
  }
  const url = `${ORIGIN}/servicos/${service.slug}`;
  return {
    title: service.title,
    description: service.description,
    ogTitle: service.title,
    ogDescription: service.description,
    ogType: service.ogType,
    ogImage: service.ogImageUrl || service.imageUrl || null,
    canonical: url,
    // O conteúdo final vai concatenar este array com os blocos auto-gerados
    // (WebPage, Service, FAQPage, BreadcrumbList) — aqui só listamos os extras.
    jsonLd: service.schemaJsonLd ?? [],
    raw: null,
  };
}

export const getServiceSeoDiff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const url = `${ORIGIN}/servicos/${data.slug}`;
    let live: SeoSnapshot = {
      title: null,
      description: null,
      ogTitle: null,
      ogDescription: null,
      ogType: null,
      ogImage: null,
      canonical: null,
      jsonLd: [],
      raw: null,
    };
    let fetchError: string | null = null;
    try {
      const resp = await fetch(url, {
        headers: { "user-agent": "0web-seo-diff/1.0" },
        // 8s teto pra não travar a UI do painel.
        signal: AbortSignal.timeout(8000),
      });
      const html = await resp.text();
      live = parseHead(html);
    } catch (e) {
      fetchError = (e as Error).message;
    }

    const { service, source } = await getServicePublic({ data: { slug: data.slug } });
    const db = fromDb(service);
    return {
      url,
      source, // "db" | "file" | "none"
      live,
      db,
      fetchError,
    };
  });
