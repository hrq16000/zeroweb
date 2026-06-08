/**
 * Auditoria de links legacy: varre src/routes/** e o conteúdo do banco
 * (rich_html, cta_target dos serviços, hero_slides) buscando referências
 * a rotas legacy fora do espaço /servicos/$slug.
 *
 * Admin-only. Resultado consumido em /app/seo-404s.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Rotas legacy conhecidas (mapeiam para /servicos/<slug>).
export const LEGACY_PATHS = [
  "/seo",
  "/criacao-sites",
  "/landing-pages",
  "/trafego-pago",
  "/trafego-pago-local",
  "/google-meu-negocio",
  "/presenca-digital",
  "/redes-sociais",
  "/automacao",
  "/ia",
  "/desenvolvimento",
  "/consultoria",
] as const;

export type LegacyHit = {
  source: "route" | "rich_html" | "cta_target" | "hero_slide";
  location: string; // file path or db row identifier
  path: string;     // legacy path matched
  context: string;  // short snippet
};

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: roles }, { data: portal }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    supabaseAdmin
      .from("portal_members")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin"),
  ]);
  const ok =
    (roles ?? []).some((r: { role: string }) => r.role === "admin") ||
    (portal ?? []).length > 0;
  if (!ok) throw new Error("Forbidden: admin role required");
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries: { name: string; isDirectory(): boolean }[];
  try {
    entries = (await readdir(dir, { withFileTypes: true })) as unknown as {
      name: string; isDirectory(): boolean;
    }[];
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(tsx?|jsx?|mdx?)$/.test(e.name)) yield full;
  }
}

function findHits(haystack: string, source: LegacyHit["source"], location: string): LegacyHit[] {
  const hits: LegacyHit[] = [];
  for (const p of LEGACY_PATHS) {
    // Casa "/seo" como início de href/to/href= mas não "/servicos/seo" nem "/seo-extra".
    const re = new RegExp(`(?:href|to|url)\\s*[=:]\\s*["'\`]${p}(?=["'\`/?#])`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(haystack)) !== null) {
      const start = Math.max(0, m.index - 30);
      const end = Math.min(haystack.length, m.index + 80);
      hits.push({
        source,
        location,
        path: p,
        context: haystack.slice(start, end).replace(/\s+/g, " ").trim(),
      });
      if (hits.length > 50) return hits;
    }
  }
  return hits;
}

export const auditLegacyLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin((context as { userId: string }).userId);

    const hits: LegacyHit[] = [];

    // 1) Varre src/routes/** procurando refs em arquivos que NÃO sejam de redirect/legacy intencional.
    const ROUTES_DIR = join(process.cwd(), "src", "routes");
    for await (const file of walk(ROUTES_DIR)) {
      const rel = file.replace(process.cwd() + "/", "");
      // Ignora os próprios arquivos legacy (que vão ser redirecionados/excluídos depois)
      // e arquivos de teste.
      if (/\.test\.[tj]sx?$/.test(rel)) continue;
      const base = rel.split("/").pop() ?? "";
      const isLegacySelf = LEGACY_PATHS.some(
        (p) => base === `${p.slice(1)}.tsx` || base === `${p.slice(1)}.ts`,
      );
      if (isLegacySelf) continue;
      try {
        const src = await readFile(file, "utf8");
        hits.push(...findHits(src, "route", rel));
      } catch { /* ignore */ }
      if (hits.length > 200) break;
    }

    // 2) DB — services.rich_html + cta_target
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: services } = await supabaseAdmin
      .from("services")
      .select("slug, name, rich_html, cta_target");
    for (const row of (services ?? []) as Array<{
      slug: string; name: string; rich_html: string | null; cta_target: string | null;
    }>) {
      if (row.rich_html) hits.push(...findHits(row.rich_html, "rich_html", `services:${row.slug}`));
      if (row.cta_target) {
        for (const p of LEGACY_PATHS) {
          if (row.cta_target.startsWith(p)) {
            hits.push({
              source: "cta_target",
              location: `services:${row.slug}`,
              path: p,
              context: row.cta_target,
            });
          }
        }
      }
    }

    // 3) hero_slides.cta_url
    const { data: slides } = await supabaseAdmin
      .from("hero_slides")
      .select("id, title, cta_url, cta_secondary_url");
    for (const row of (slides ?? []) as Array<{
      id: string; title: string; cta_url: string | null; cta_secondary_url: string | null;
    }>) {
      for (const url of [row.cta_url, row.cta_secondary_url]) {
        if (!url) continue;
        for (const p of LEGACY_PATHS) {
          if (url.startsWith(p)) {
            hits.push({
              source: "hero_slide",
              location: `hero_slides:${row.id} (${row.title})`,
              path: p,
              context: url,
            });
          }
        }
      }
    }

    // Agrupa por path
    const byPath = new Map<string, number>();
    for (const h of hits) byPath.set(h.path, (byPath.get(h.path) ?? 0) + 1);

    return {
      total: hits.length,
      byPath: Array.from(byPath.entries()).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count),
      hits: hits.slice(0, 500), // hard cap
      scannedAt: new Date().toISOString(),
    };
  });
