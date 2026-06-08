// Server fns para o histórico persistido de seo-diff e auditoria de links legacy.
// Tudo gated por admin role. Usado por /app/seo-404s (UI) e pelos scripts
// scripts/run-seo-diff.mjs + legacy-audit.functions.ts (gravação).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ensureAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin")) {
    const { data: pm } = await supabaseAdmin
      .from("portal_members")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!pm) throw new Error("forbidden");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SeoAuditRow = {
  id: string;
  kind: "seo_diff" | "legacy_links";
  ran_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  delta_pct: number | null;
  status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
};

export const adminListSeoAuditHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        kind: z.enum(["seo_diff", "legacy_links"]).optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(200).default(50),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("seo_audit_history")
      .select("id,kind,ran_at,summary,details,delta_pct,status,approved_by,approved_at,notes")
      .order("ran_at", { ascending: false })
      .limit(data.limit);
    if (data.kind) q = q.eq("kind", data.kind);
    if (data.status) q = q.eq("status", data.status);
    if (data.from) q = q.gte("ran_at", data.from);
    if (data.to) q = q.lte("ran_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { rows: (rows ?? []) as SeoAuditRow[] };
  });

export const adminApproveSeoAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["approved", "rejected", "pending"]),
        notes: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch = {
      status: data.status,
      notes: data.notes ?? null,
      approved_by:
        data.status === "approved" || data.status === "rejected" ? context.userId : null,
      approved_at:
        data.status === "approved" || data.status === "rejected"
          ? new Date().toISOString()
          : null,
    };
    const { error } = await supabaseAdmin
      .from("seo_audit_history")
      .update(patch)
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Helper interno (chamado pelo script run-seo-diff e pela serverFn de legacy-audit).
// Não exposto como serverFn pública — usa supabaseAdmin direto.
export async function recordSeoAuditEntry(input: {
  kind: "seo_diff" | "legacy_links";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  delta_pct?: number | null;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("seo_audit_history")
    .insert({
      kind: input.kind,
      summary: input.summary,
      details: input.details,
      delta_pct: input.delta_pct ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}
