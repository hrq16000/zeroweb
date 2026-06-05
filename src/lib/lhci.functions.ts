// LHCI runs admin server fns.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function canManage(userId: string) {
  const sb = await getAdmin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some(
    (r: { role: string }) => r.role === "admin" || r.role === "admin_integrations",
  );
}

export const listLhciRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        environment: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    let q = sb
      .from("lhci_runs")
      .select(
        "id,environment,url,commit_sha,branch,performance,seo,accessibility,best_practices,lcp_ms,cls,tbt_ms,fcp_ms,status,decision,decision_reason,decided_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 25);
    if (data.environment) q = q.eq("environment", data.environment);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const getLhciRun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: row, error } = await sb
      .from("lhci_runs")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { row };
  });

export const decideLhciRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        reason: z.string().max(500).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb
      .from("lhci_runs")
      .update({
        decision: data.decision,
        decision_reason: data.reason ?? null,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
        status: data.decision === "approved" ? "approved" : "rejected",
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
