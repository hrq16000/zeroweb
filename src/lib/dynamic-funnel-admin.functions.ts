import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ------- helpers -------
async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
    supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabaseAdmin.rpc("is_super_admin", { _uid: userId }),
  ]);
  if (!isAdmin && !isSuper) throw new Error("Acesso restrito a administradores.");
}

const QUESTION_TYPES = [
  "short_text","long_text","email","phone","select","radio","checkbox","number","statement",
] as const;

const optionSchema = z.object({
  value: z.string().min(1).max(120),
  label: z.string().min(1).max(200),
  emoji: z.string().max(8).optional(),
});

const questionSchema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/i, "Use apenas letras, números e _"),
  type: z.enum(QUESTION_TYPES),
  label: z.string().min(1).max(500),
  hint: z.string().max(500).nullable().optional(),
  placeholder: z.string().max(200).nullable().optional(),
  required: z.boolean().default(false),
  order_index: z.number().int().min(0),
  options: z.array(optionSchema).default([]),
});

const conditionSchema = z.object({
  id: z.string().uuid().optional(),
  from_question_id: z.string().uuid(),
  operator: z.enum(["equals","not_equals","contains","in","not_in","is_empty","is_not_empty"]),
  value: z.any().optional(),
  action: z.enum(["skip_to","end_form"]),
  target_question_id: z.string().uuid().nullable().optional(),
  priority: z.number().int().min(0).default(0),
});

// ------- listForms -------
export const listForms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("dynamic_forms")
      .select("id, slug, name, description, status, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (data ?? []).map((f) => f.id);
    let counts: Record<string, { questions: number; leads: number }> = {};
    if (ids.length) {
      const [{ data: qs }, { data: ls }] = await Promise.all([
        supabaseAdmin.from("dynamic_form_questions").select("form_id").in("form_id", ids),
        supabaseAdmin.from("dynamic_form_leads").select("form_id").in("form_id", ids),
      ]);
      counts = ids.reduce((acc, id) => {
        acc[id] = {
          questions: (qs ?? []).filter((r) => r.form_id === id).length,
          leads: (ls ?? []).filter((r) => r.form_id === id).length,
        };
        return acc;
      }, {} as typeof counts);
    }
    return (data ?? []).map((f) => ({ ...f, ...(counts[f.id] ?? { questions: 0, leads: 0 }) }));
  });

// ------- getForm -------
export const getForm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: form, error } = await supabaseAdmin
      .from("dynamic_forms")
      .select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!form) throw new Error("Funil não encontrado");
    const [{ data: qs }, { data: cs }] = await Promise.all([
      supabaseAdmin.from("dynamic_form_questions")
        .select("*").eq("form_id", form.id).order("order_index", { ascending: true }),
      supabaseAdmin.from("dynamic_form_conditions")
        .select("*").eq("form_id", form.id).order("priority", { ascending: true }),
    ]);
    return { form, questions: qs ?? [], conditions: cs ?? [] };
  });

// ------- saveForm (meta) -------
const formMetaSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/i, "Use letras, números e hífens"),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["draft","published","archived"]).default("draft"),
  config_json: z.record(z.string(), z.any()).default({}),
  whatsapp_config: z.record(z.string(), z.any()).default({}),
});

export const saveForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => formMetaSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { error } = await supabaseAdmin.from("dynamic_forms").update({
        slug: data.slug, name: data.name, description: data.description ?? null,
        status: data.status, config_json: data.config_json, whatsapp_config: data.whatsapp_config,
        updated_at: new Date().toISOString(),
      }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin.from("dynamic_forms").insert({
      slug: data.slug, name: data.name, description: data.description ?? null,
      status: data.status, config_json: data.config_json, whatsapp_config: data.whatsapp_config,
      created_by: context.userId,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const setFormStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["draft","published","archived"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dynamic_forms")
      .update({ status: data.status, updated_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dynamic_forms").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------- questions -------
export const upsertQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ form_id: z.string().uuid(), question: questionSchema }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = data.question;
    const payload = {
      form_id: data.form_id, key: q.key, type: q.type, label: q.label,
      hint: q.hint ?? null, placeholder: q.placeholder ?? null,
      required: q.required, order_index: q.order_index, options_json: q.options,
      updated_at: new Date().toISOString(),
    };
    if (q.id) {
      const { error } = await supabaseAdmin.from("dynamic_form_questions").update(payload).eq("id", q.id);
      if (error) throw new Error(error.message);
      return { id: q.id };
    }
    const { data: row, error } = await supabaseAdmin.from("dynamic_form_questions")
      .insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dynamic_form_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    form_id: z.string().uuid(),
    order: z.array(z.string().uuid()).min(1),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < data.order.length; i++) {
      const { error } = await supabaseAdmin.from("dynamic_form_questions")
        .update({ order_index: i, updated_at: new Date().toISOString() })
        .eq("id", data.order[i]).eq("form_id", data.form_id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ------- conditions -------
export const upsertCondition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ form_id: z.string().uuid(), condition: conditionSchema }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const c = data.condition;
    const payload = {
      form_id: data.form_id,
      from_question_id: c.from_question_id,
      operator: c.operator,
      value: c.value ?? null,
      action: c.action,
      target_question_id: c.target_question_id ?? null,
      priority: c.priority,
    };
    if (c.id) {
      const { error } = await supabaseAdmin.from("dynamic_form_conditions").update(payload).eq("id", c.id);
      if (error) throw new Error(error.message);
      return { id: c.id };
    }
    const { data: row, error } = await supabaseAdmin.from("dynamic_form_conditions")
      .insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCondition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dynamic_form_conditions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------- leads -------
const leadsFilterSchema = z.object({
  form_id: z.string().uuid().optional(),
  status: z.enum(["all","sent","failed","pending","disabled"]).default("all"),
  from: z.string().max(40).optional(),
  to: z.string().max(40).optional(),
  q: z.string().max(120).optional(),
  limit: z.number().int().min(1).max(500).default(100),
});

export const listLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => leadsFilterSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("dynamic_form_leads")
      .select("id, form_id, answers_json, metadata_json, contact_name, contact_email, contact_phone, whatsapp_alert_status, whatsapp_user_url, score, score_breakdown, tags, intent_level, pipeline_stage, assigned_to, created_at")
      .order("created_at", { ascending: false }).limit(data.limit);
    if (data.form_id) q = q.eq("form_id", data.form_id);
    if (data.status !== "all") q = q.eq("whatsapp_alert_status", data.status);
    if (data.from) q = q.gte("created_at", new Date(data.from).toISOString());
    if (data.to) q = q.lte("created_at", new Date(data.to).toISOString());
    if (data.q) {
      const term = `%${data.q}%`;
      q = q.or(`contact_name.ilike.${term},contact_email.ilike.${term},contact_phone.ilike.${term}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const { data: forms } = await supabaseAdmin
      .from("dynamic_forms").select("id, name, slug");
    const formsById = Object.fromEntries((forms ?? []).map((f) => [f.id, f]));
    return (rows ?? []).map((r) => ({ ...r, form: formsById[r.form_id] ?? null }));
  });

const PIPELINE_STAGES = ["novo","contatado","qualificado","perdido","ganho"] as const;

export const updateLeadStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    stage: z.enum(PIPELINE_STAGES),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dynamic_form_leads")
      .update({ pipeline_stage: data.stage }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bulkUpdateLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    ids: z.array(z.string().uuid()).min(1).max(500),
    stage: z.enum(PIPELINE_STAGES).optional(),
    add_tags: z.array(z.string().min(1).max(40)).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.stage) {
      const { error } = await supabaseAdmin.from("dynamic_form_leads")
        .update({ pipeline_stage: data.stage }).in("id", data.ids);
      if (error) throw new Error(error.message);
    }
    if (data.add_tags?.length) {
      // append unique tags
      const { data: rows } = await supabaseAdmin.from("dynamic_form_leads")
        .select("id, tags").in("id", data.ids);
      for (const r of rows ?? []) {
        const merged = Array.from(new Set([...((r as any).tags ?? []), ...data.add_tags!]));
        await supabaseAdmin.from("dynamic_form_leads").update({ tags: merged }).eq("id", r.id);
      }
    }
    return { ok: true, count: data.ids.length };
  });
