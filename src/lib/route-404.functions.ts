import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PathSchema = z
  .string()
  .min(1)
  .max(2048)
  .regex(/^\/[\x20-\x7E]*$/, "invalid path");

/**
 * Registra um acesso 404 (fire-and-forget). Pública: usa service_role
 * para fazer upsert agregado por path.
 */
export const logNotFound = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        path: PathSchema,
        referrer: z.string().max(2048).optional().nullable(),
        userAgent: z.string().max(1024).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = data.path.split("?")[0].split("#")[0].slice(0, 2048);

    // Ignora paths internos / de assets
    if (
      path.startsWith("/@") ||
      path.startsWith("/_") ||
      path.startsWith("/api/") ||
      /\.(js|css|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i.test(path)
    ) {
      return { skipped: true };
    }

    const { data: existing } = await supabaseAdmin
      .from("route_404_log")
      .select("id,hits")
      .eq("path", path)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("route_404_log")
        .update({
          hits: (existing.hits ?? 0) + 1,
          last_seen: new Date().toISOString(),
          referrer: data.referrer ?? null,
          user_agent: data.userAgent ?? null,
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("route_404_log").insert({
        path,
        referrer: data.referrer ?? null,
        user_agent: data.userAgent ?? null,
      });
    }
    return { ok: true };
  });

/** Lista admin: top 404s (admin/super_admin only). */
export const listNotFound = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ limit: z.number().int().min(1).max(500).default(100) }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("route_404_log")
      .select("path,hits,referrer,user_agent,first_seen,last_seen")
      .order("hits", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

/** Lista admin: redirects 301 cadastrados + hits. */
export const listRedirects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("redirects")
      .select("from_path,to_path,status_code,enabled,hits,last_hit_at,notes")
      .order("hits", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

/** Lista admin: snapshots de cobertura de indexação (últimos 30 dias). */
export const listIndexCoverage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("index_coverage_snapshots")
      .select("day,issue_type,count,open_count")
      .order("day", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

