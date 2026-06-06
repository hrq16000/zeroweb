import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { scoreLead } from "./lead-scoring";

// ============ Types (also used by the client UI) ============
export type FunnelQuestionType =
  | "short_text" | "long_text" | "email" | "phone"
  | "select" | "radio" | "checkbox" | "number" | "statement";

export interface FunnelOption { value: string; label: string; emoji?: string }
export interface FunnelQuestion {
  id: string;
  key: string;
  type: FunnelQuestionType;
  label: string;
  hint: string | null;
  placeholder: string | null;
  required: boolean;
  order_index: number;
  options: FunnelOption[];
}
export interface FunnelCondition {
  id: string;
  from_question_id: string;
  operator: "equals" | "not_equals" | "contains" | "in" | "not_in" | "is_empty" | "is_not_empty";
  value: any;
  action: "skip_to" | "end_form";
  target_question_id: string | null;
  priority: number;
}
export interface FunnelDefinition {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  config: Record<string, any>;
  whatsapp_enabled: boolean;
  questions: FunnelQuestion[];
  conditions: FunnelCondition[];
}

// ============ getPublicFunnel ============
export const getPublicFunnel = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }): Promise<FunnelDefinition | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: form, error } = await supabaseAdmin
      .from("dynamic_forms")
      .select("id, slug, name, description, status, config_json, whatsapp_config")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!form) return null;

    const [{ data: qs }, { data: cs }] = await Promise.all([
      supabaseAdmin
        .from("dynamic_form_questions")
        .select("id, key, type, label, hint, placeholder, required, order_index, options_json")
        .eq("form_id", form.id)
        .order("order_index", { ascending: true }),
      supabaseAdmin
        .from("dynamic_form_conditions")
        .select("id, from_question_id, operator, value, action, target_question_id, priority")
        .eq("form_id", form.id)
        .order("priority", { ascending: true }),
    ]);

    const wa = (form.whatsapp_config ?? {}) as Record<string, unknown>;
    return {
      id: form.id,
      slug: form.slug,
      name: form.name,
      description: form.description,
      config: (form.config_json ?? {}) as Record<string, any>,
      whatsapp_enabled: Boolean(wa.enabled) && Boolean(wa.redirect_phone),
      questions: (qs ?? []).map((q) => ({
        id: q.id,
        key: q.key,
        type: q.type as FunnelQuestionType,
        label: q.label,
        hint: q.hint,
        placeholder: q.placeholder,
        required: q.required,
        order_index: q.order_index,
        options: Array.isArray(q.options_json) ? (q.options_json as unknown as FunnelOption[]) : [],
      })),
      conditions: (cs ?? []).map((c) => ({
        id: c.id,
        from_question_id: c.from_question_id,
        operator: c.operator as FunnelCondition["operator"],
        value: c.value,
        action: c.action as FunnelCondition["action"],
        target_question_id: c.target_question_id,
        priority: c.priority,
      })),
    };
  });

// ============ submitFunnel ============
const submitSchema = z.object({
  form_id: z.string().uuid(),
  answers: z.record(z.string(), z.any()),
  client_metadata: z
    .object({
      page_url: z.string().max(2000).optional(),
      referrer: z.string().max(2000).optional(),
      utm: z.record(z.string(), z.string().max(255)).optional(),
      gclid: z.string().max(255).optional(),
      fbclid: z.string().max(255).optional(),
      started_at: z.string().max(50).optional(),
    })
    .optional(),
});

async function lookupGeo(ip: string | null): Promise<Record<string, unknown>> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return {};
  try {
    const r = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(2500) });
    if (!r.ok) return {};
    const j = (await r.json()) as Record<string, unknown>;
    if (j && j.success === false) return {};
    return {
      city: j.city, region: j.region, country: j.country,
      isp: (j.connection as Record<string, unknown> | undefined)?.isp,
      org: (j.connection as Record<string, unknown> | undefined)?.org,
    };
  } catch { return {}; }
}

function fmtAnswers(answers: Record<string, unknown>, questions: { key: string; label: string; options: FunnelOption[] }[]): string {
  return questions
    .filter((q) => answers[q.key] !== undefined && answers[q.key] !== null && answers[q.key] !== "")
    .map((q) => {
      const raw = answers[q.key];
      const display = Array.isArray(raw)
        ? raw.map((v) => q.options.find((o) => o.value === v)?.label ?? String(v)).join(", ")
        : q.options.find((o) => o.value === raw)?.label ?? String(raw);
      return `• *${q.label}*: ${display}`;
    })
    .join("\n");
}

function fmtMetadata(meta: Record<string, unknown>): string {
  const lines: string[] = [];
  if (meta.city || meta.region) lines.push(`📍 ${meta.city ?? "?"} - ${meta.region ?? "?"} ${meta.country ? `(${meta.country})` : ""}`);
  if (meta.isp) lines.push(`🌐 ISP: ${meta.isp}`);
  if (meta.ip) lines.push(`🔢 IP: ${meta.ip}`);
  if (meta.page_url) lines.push(`📄 Página: ${meta.page_url}`);
  if (meta.referrer) lines.push(`↩️ Referrer: ${meta.referrer}`);
  const utm = meta.utm as Record<string, string> | undefined;
  if (utm && Object.keys(utm).length) {
    lines.push(`🎯 UTM: ${Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(" | ")}`);
  }
  return lines.join("\n");
}

function applyTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

function digitsOnly(p: string): string { return p.replace(/\D/g, ""); }

export const submitFunnel = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: form, error: fErr } = await supabaseAdmin
      .from("dynamic_forms")
      .select("id, name, slug, status, whatsapp_config")
      .eq("id", data.form_id)
      .maybeSingle();
    if (fErr) throw new Error(fErr.message);
    if (!form || form.status !== "published") throw new Error("Funil não disponível");

    const { data: qs } = await supabaseAdmin
      .from("dynamic_form_questions")
      .select("key, label, type, options_json")
      .eq("form_id", form.id)
      .order("order_index", { ascending: true });
    const questions = (qs ?? []).map((q) => ({
      key: q.key, label: q.label, type: q.type,
      options: Array.isArray(q.options_json) ? (q.options_json as unknown as FunnelOption[]) : [],
    }));

    // ---- metadata ----
    let ip: string | null = null;
    try { ip = getRequestIP({ xForwardedFor: true }) ?? null; } catch { /* no req ctx */ }
    let user_agent = ""; let referrer = "";
    try {
      const req = getRequest();
      user_agent = req.headers.get("user-agent") ?? "";
      referrer = getRequestHeader("referer") ?? "";
    } catch { /* */ }

    const geo = await lookupGeo(ip);
    const metadata: Record<string, unknown> = {
      ip, user_agent,
      referrer: data.client_metadata?.referrer ?? referrer,
      page_url: data.client_metadata?.page_url,
      utm: data.client_metadata?.utm ?? {},
      gclid: data.client_metadata?.gclid,
      fbclid: data.client_metadata?.fbclid,
      started_at: data.client_metadata?.started_at,
      completed_at: new Date().toISOString(),
      ...geo,
    };

    // pull contact fields
    const contact_name = (data.answers.nome ?? data.answers.name ?? null) as string | null;
    const contact_email = (data.answers.email ?? null) as string | null;
    const contact_phone = (data.answers.telefone ?? data.answers.phone ?? data.answers.whatsapp ?? null) as string | null;

    // ---- WhatsApp ----
    const wa = (form.whatsapp_config ?? {}) as Record<string, unknown>;
    const answersText = fmtAnswers(data.answers, questions);
    const metadataText = fmtMetadata(metadata);

    let whatsapp_user_url: string | null = null;
    if (wa.enabled && wa.redirect_phone) {
      const tpl = (wa.user_message_template as string) || "Olá! Acabei de preencher o formulário.\n\n{{answers}}";
      const msg = applyTemplate(tpl, { answers: answersText, metadata: metadataText, name: contact_name ?? "" });
      whatsapp_user_url = `https://wa.me/${digitsOnly(String(wa.redirect_phone))}?text=${encodeURIComponent(msg)}`;
    }

    // ---- Scoring + tags ----
    const scoring = scoreLead(data.answers);

    // ---- Insert lead ----
    const { data: lead, error: insErr } = await supabaseAdmin
      .from("dynamic_form_leads")
      .insert({
        form_id: form.id,
        answers_json: data.answers,
        metadata_json: metadata as any,
        contact_name, contact_email, contact_phone,
        whatsapp_user_url,
        whatsapp_alert_status: wa.enabled && wa.alert_phone ? "pending" : "disabled",
        score: scoring.score,
        score_breakdown: scoring.breakdown,
        tags: scoring.tags,
        intent_level: scoring.intent,
        pipeline_stage: scoring.intent === "hot" ? "qualificado" : "novo",
      } as any)
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    // ---- Internal alert (best-effort, non-blocking semantics) ----
    let alertStatus: "sent" | "failed" | "disabled" = "disabled";
    let alertError: string | null = null;
    if (wa.enabled && wa.alert_phone) {
      try {
        const tpl = (wa.alert_message_template as string) ||
          "*Novo lead — {{form}}*\n\n{{answers}}\n\n{{metadata}}";
        const msg = applyTemplate(tpl, { answers: answersText, metadata: metadataText, form: form.name });

        const baseUrl = (wa.api_base_url as string) || process.env.UAZAPI_BASE_URL || "";
        const token = (wa.api_token as string) || process.env.UAZAPI_TOKEN || "";
        const provider = (wa.provider as string) || "uazapi";

        if (baseUrl && token && provider === "uazapi") {
          const r = await fetch(`${baseUrl.replace(/\/$/, "")}/send/text`, {
            method: "POST",
            headers: { "Content-Type": "application/json", token },
            body: JSON.stringify({ number: digitsOnly(String(wa.alert_phone)), text: msg }),
            signal: AbortSignal.timeout(5000),
          });
          if (!r.ok) { alertStatus = "failed"; alertError = `HTTP ${r.status}`; }
          else { alertStatus = "sent"; }
        } else {
          alertStatus = "failed";
          alertError = "Provider/credenciais não configurados";
        }
      } catch (e) {
        alertStatus = "failed";
        alertError = e instanceof Error ? e.message : "Erro desconhecido";
      }

      await supabaseAdmin.from("dynamic_form_leads").update({
        whatsapp_alert_status: alertStatus,
        whatsapp_alert_error: alertError,
        whatsapp_alert_sent_at: alertStatus === "sent" ? new Date().toISOString() : null,
      }).eq("id", lead.id);
    }

    return {
      lead_id: lead.id,
      whatsapp_user_url,
      alert_status: alertStatus,
    };
  });
