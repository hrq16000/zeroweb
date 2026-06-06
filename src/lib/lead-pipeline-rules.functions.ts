import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
    supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabaseAdmin.rpc("is_super_admin", { _uid: userId }),
  ]);
  if (!isAdmin && !isSuper) throw new Error("Acesso restrito a administradores.");
}

const STAGES = ["novo", "contatado", "qualificado", "ganho", "perdido"] as const;

const triggerSchema = z
  .object({
    score_gte: z.number().int().min(0).max(100).optional(),
    score_lte: z.number().int().min(0).max(100).optional(),
    intent_in: z.array(z.enum(["cold", "warm", "hot"])).optional(),
    has_any_tag: z.array(z.string().min(1).max(60)).optional(),
    answer: z
      .object({
        question_key: z.string().min(1).max(80),
        equals: z.string().max(500).optional(),
        contains: z.string().max(200).optional(),
        in: z.array(z.string().max(500)).optional(),
      })
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Defina ao menos uma condição");

const actionSchema = z
  .object({
    stage: z.enum(STAGES).optional(),
    add_tags: z.array(z.string().min(1).max(60)).optional(),
    remove_tags: z.array(z.string().min(1).max(60)).optional(),
  })
  .refine(
    (v) => v.stage || (v.add_tags && v.add_tags.length) || (v.remove_tags && v.remove_tags.length),
    "Defina ao menos uma ação",
  );

const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  form_id: z.string().uuid().nullable(),
  name: z.string().min(1).max(120),
  trigger: triggerSchema,
  action: actionSchema,
  priority: z.number().int().min(0).max(1000).default(0),
  enabled: z.boolean().default(true),
});

export const listPipelineRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("lead_pipeline_rules")
      .select("id, form_id, name, trigger, action, priority, enabled, created_at, updated_at")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const savePipelineRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ruleSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      form_id: data.form_id,
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      priority: data.priority,
      enabled: data.enabled,
      created_by: context.userId,
    };
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("lead_pipeline_rules")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("lead_pipeline_rules")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deletePipelineRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("lead_pipeline_rules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const togglePipelineRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), enabled: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("lead_pipeline_rules")
      .update({ enabled: data.enabled })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
