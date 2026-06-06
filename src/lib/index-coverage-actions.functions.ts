import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ACTION_KEYS = [
  "review_canonical",
  "update_robots_meta",
  "mark_redirect_applied",
  "resubmit_search_console",
  "internal_links_updated",
  "content_improved",
] as const;
export type ActionKey = (typeof ACTION_KEYS)[number];

export const ACTION_LABELS: Record<ActionKey, string> = {
  review_canonical: "Revisar canonical",
  update_robots_meta: "Atualizar robots/meta",
  mark_redirect_applied: "Marcar redirect aplicado",
  resubmit_search_console: "Reenviar ao Search Console",
  internal_links_updated: "Atualizar links internos",
  content_improved: "Conteúdo melhorado",
};

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) throw new Error("forbidden");
}

export const listIndexActions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { issueId: string }) =>
    z.object({ issueId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("index_coverage_actions")
      .select("id, action_key, notes, actor, created_at")
      .eq("issue_id", data.issueId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const addIndexAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { issueId: string; action_key: string; notes?: string }) =>
    z
      .object({
        issueId: z.string().uuid(),
        action_key: z.enum(ACTION_KEYS),
        notes: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("index_coverage_actions").insert({
      issue_id: data.issueId,
      action_key: data.action_key,
      notes: data.notes ?? null,
      actor: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteIndexAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("index_coverage_actions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
