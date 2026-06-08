/**
 * SEO Importer / Rebuilder
 * ------------------------
 * Server-fn admin-only que (re)gera `rich_html` e `schema_jsonld` para os
 * serviços a partir dos campos estruturados já existentes na tabela
 * `public.services` (problems, benefits, process, faq, sections, conditions).
 *
 * Substitui o conteúdo SEO das rotas literais `src/routes/servicos.<slug>.tsx`
 * por conteúdo equivalente persistido no banco — fonte única de verdade,
 * editável no painel.
 *
 * Idempotente: por padrão só preenche quando vazio. `force: true` reescreve.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ORIGIN = "https://0web.com.br";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}

async function assertAdmin(userId: string) {
  const sb = await getAdmin();
  const [{ data: roles }, { data: portal }] = await Promise.all([
    sb.from("user_roles").select("role").eq("user_id", userId),
    sb.from("portal_members").select("role").eq("user_id", userId).eq("role", "super_admin"),
  ]);
  const ok =
    (roles ?? []).some((r: { role: string }) => r.role === "admin") ||
    (portal ?? []).length > 0;
  if (!ok) throw new Error("Forbidden: admin role required");
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asStringArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
}

function asObjArr<T = Row>(v: unknown): T[] {
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as T[]) : [];
}

/** Gera HTML rico a partir dos campos estruturados do serviço. */
function buildRichHtml(row: Row): string {
  const parts: string[] = [];
  const name = String(row.name ?? "");
  const description = String(row.description ?? "");
  const problems = asStringArr(row.problems);
  const benefits = asStringArr(row.benefits);
  const process = asObjArr<{ step?: string; desc?: string }>(row.process);
  const sections = asObjArr<{ title?: string; body?: string }>(row.sections);
  const conditions = row.conditions ? String(row.conditions) : "";

  // Intro
  if (description) {
    parts.push(
      `<section class="rich-intro"><p class="lead">${esc(description)}</p></section>`,
    );
  }

  // Problemas
  if (problems.length) {
    parts.push(
      `<section class="rich-problems"><h2>O que costuma travar o resultado</h2><ul class="grid-list">${problems
        .map((p) => `<li>${esc(p)}</li>`)
        .join("")}</ul></section>`,
    );
  }

  // Benefícios
  if (benefits.length) {
    parts.push(
      `<section class="rich-benefits"><h2>Benefícios incluídos em ${esc(name)}</h2><ul class="grid-list">${benefits
        .map((b) => `<li><strong>${esc(b)}</strong></li>`)
        .join("")}</ul></section>`,
    );
  }

  // Processo
  if (process.length) {
    parts.push(
      `<section class="rich-process"><h2>Como entregamos</h2><ol class="process-list">${process
        .map(
          (p, i) =>
            `<li><span class="step-num">0${i + 1}</span><h3>${esc(
              String(p.step ?? ""),
            )}</h3><p>${esc(String(p.desc ?? ""))}</p></li>`,
        )
        .join("")}</ol></section>`,
    );
  }

  // Garantia (padrão para todos os serviços ativos)
  parts.push(
    `<section class="rich-guarantee"><h2>Nossa garantia</h2><p>Trabalhamos com transparência total: você recebe relatórios, acessos e prazos claros. Se o escopo combinado não for entregue, devolvemos o investimento proporcional. Sem letras miúdas.</p></section>`,
  );

  // Seções livres (já preenchidas no painel)
  for (const sec of sections) {
    const title = sec.title ? `<h2>${esc(String(sec.title))}</h2>` : "";
    const body = sec.body
      ? `<div class="rich-section-body">${esc(String(sec.body)).replace(/\n+/g, "</p><p>")}</div>`
      : "";
    if (title || body) parts.push(`<section class="rich-section">${title}<p>${body}</p></section>`);
  }

  // Condições
  if (conditions) {
    parts.push(
      `<section class="rich-conditions"><h3>Condições</h3><p>${esc(conditions).replace(/\n+/g, "<br/>")}</p></section>`,
    );
  }

  return parts.join("\n");
}

/** Gera blocos JSON-LD adicionais (Service + FAQPage + BreadcrumbList). */
function buildSchemaJsonLd(row: Row): Row[] {
  const slug = String(row.slug ?? "");
  const url = `${ORIGIN}/servicos/${slug}`;
  const name = String(row.name ?? "");
  const description = String(row.description ?? "");
  const faq = asObjArr<{ q?: string; a?: string }>(row.faq);
  const price = row.price != null ? Number(row.price) : null;

  const blocks: Row[] = [];

  // Service / Offer
  const serviceBlock: Row = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    serviceType: row.service_type ?? row.category,
    areaServed: { "@type": "Country", name: "BR" },
    provider: {
      "@type": "Organization",
      name: "0WEB",
      url: ORIGIN,
    },
  };
  if (price != null && price > 0) {
    serviceBlock.offers = {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url,
    };
  }
  blocks.push(serviceBlock);

  // FAQ
  if (faq.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: String(f.q ?? ""),
        acceptedAnswer: { "@type": "Answer", text: String(f.a ?? "") },
      })),
    });
  }

  // Breadcrumb
  blocks.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: ORIGIN },
      { "@type": "ListItem", position: 2, name: "Serviços", item: `${ORIGIN}/servicos` },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  });

  return blocks;
}

export type RebuildResult = {
  slug: string;
  name: string;
  updated: boolean;
  reason: "rebuilt" | "skipped_has_content";
  richBytes: number;
  schemaBlocks: number;
};

export const rebuildServiceSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(120).optional(),
        force: z.boolean().optional().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getAdmin();

    let q = sb
      .from("services")
      .select(
        "id,slug,name,category,title,h1,description,service_type,problems,benefits,process,faq,sections,conditions,price,rich_html,schema_jsonld,is_active",
      );
    if (data.slug) q = q.eq("slug", data.slug);
    const { data: rows, error } = await q;
    if (error) throw error;

    const results: RebuildResult[] = [];
    for (const row of (rows ?? []) as Row[]) {
      const hasRich = typeof row.rich_html === "string" && row.rich_html.trim().length > 30;
      const hasSchema = Array.isArray(row.schema_jsonld) && row.schema_jsonld.length > 0;
      if (!data.force && hasRich && hasSchema) {
        results.push({
          slug: row.slug,
          name: row.name,
          updated: false,
          reason: "skipped_has_content",
          richBytes: (row.rich_html ?? "").length,
          schemaBlocks: (row.schema_jsonld ?? []).length,
        });
        continue;
      }
      const rich = buildRichHtml(row);
      const schema = buildSchemaJsonLd(row);
      const { error: upErr } = await sb
        .from("services")
        .update({ rich_html: rich, schema_jsonld: schema, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (upErr) throw upErr;
      results.push({
        slug: row.slug,
        name: row.name,
        updated: true,
        reason: "rebuilt",
        richBytes: rich.length,
        schemaBlocks: schema.length,
      });
    }

    return {
      total: results.length,
      updated: results.filter((r) => r.updated).length,
      skipped: results.filter((r) => !r.updated).length,
      results,
    };
  });
