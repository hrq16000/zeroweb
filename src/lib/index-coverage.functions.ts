import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IssueType = z.enum(["404","soft_404","redirect","excluded","server_error","blocked_robots","noindex","other"]);

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("forbidden");
  }
}

export const listIndexIssues = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { type?: string; from?: string; to?: string; onlyOpen?: boolean; limit?: number }) =>
    z.object({
      type: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      onlyOpen: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    let q = supabase
      .from("index_coverage_issues")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(data.limit ?? 200);
    if (data.type && data.type !== "all") q = q.eq("issue_type", data.type);
    if (data.from) q = q.gte("detected_at", data.from);
    if (data.to) q = q.lte("detected_at", data.to);
    if (data.onlyOpen) q = q.is("resolved_at", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const indexIssuesSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { from?: string; to?: string }) =>
    z.object({ from: z.string().optional(), to: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    let q = supabase.from("index_coverage_issues").select("issue_type, detected_at, resolved_at");
    if (data.from) q = q.gte("detected_at", data.from);
    if (data.to) q = q.lte("detected_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const byType: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    let open = 0;
    for (const r of rows ?? []) {
      byType[r.issue_type] = (byType[r.issue_type] ?? 0) + 1;
      const day = new Date(r.detected_at).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
      if (!r.resolved_at) open += 1;
    }
    return { byType, byDay, open, total: rows?.length ?? 0 };
  });

export const upsertIndexIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string; issue_type: string; status_code?: number; message?: string; source?: string }) =>
    z.object({
      url: z.string().url().max(2000),
      issue_type: IssueType,
      status_code: z.number().int().optional(),
      message: z.string().max(2000).optional(),
      source: z.string().max(60).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("index_coverage_issues").insert({
      url: data.url,
      issue_type: data.issue_type,
      status_code: data.status_code ?? null,
      message: data.message ?? null,
      source: data.source ?? "manual",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resolveIndexIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("index_coverage_issues")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
