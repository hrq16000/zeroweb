// LHCI runs admin: list, detail, decide, trends. RBAC: admin can decide; admin/admin_integrations/dev can view.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getSettingValue } from "@/lib/settings.functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function getRoles(userId: string): Promise<string[]> {
  const sb = await getAdmin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return ((data ?? []) as { role: string }[]).map((r) => r.role);
}

function canView(roles: string[]) {
  return roles.some((r) => ["admin", "admin_integrations", "dev"].includes(r));
}
function canDecide(roles: string[]) {
  return roles.includes("admin");
}

export const listLhciRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        environment: z.string().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!canView(roles)) throw new Error("Acesso negado");
    const sb = await getAdmin();
    let q = sb
      .from("lhci_runs")
      .select(
        "id,environment,url,commit_sha,branch,performance,seo,accessibility,best_practices,lcp_ms,cls,tbt_ms,fcp_ms,status,decision,decision_reason,decided_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 30);
    if (data.environment) q = q.eq("environment", data.environment);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], canDecide: canDecide(roles) };
  });

export const getLhciRun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!canView(roles)) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: row, error } = await sb
      .from("lhci_runs")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { row };
  });

async function notifyDecision(run: any, decision: string, reason: string | null, actor: string) {
  const msg = `🛰️ LHCI build ${decision.toUpperCase()}\nURL: ${run.url}\nEnv: ${run.environment}\nPerf: ${run.performance ?? "—"} · SEO: ${run.seo ?? "—"} · LCP: ${run.lcp_ms ?? "—"}ms · CLS: ${run.cls ?? "—"}\nMotivo: ${reason ?? "—"}\nPor: ${actor}`;

  // Slack webhook
  const slackUrl = await getSettingValue("alerts.slack_webhook_url");
  if (slackUrl) {
    try {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg }),
      });
    } catch { /* ignore */ }
  }

  // Email via Resend (connector)
  const to = await getSettingValue("alerts.email_to");
  const lk = process.env.LOVABLE_API_KEY;
  const rk = process.env.RESEND_API_KEY;
  if (to && lk && rk) {
    try {
      await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lk}`,
          "X-Connection-Api-Key": rk,
        },
        body: JSON.stringify({
          from: "0WEB LHCI <onboarding@resend.dev>",
          to: [to],
          subject: `LHCI ${decision.toUpperCase()} — ${run.url}`,
          html: `<pre>${msg.replace(/</g, "&lt;")}</pre>`,
        }),
      });
    } catch { /* ignore */ }
  }

  // WhatsApp fallback
  try {
    const { sendWhatsAppAlert } = await import("@/lib/alerts.functions");
    await sendWhatsAppAlert(msg);
  } catch { /* ignore */ }
}

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
    const roles = await getRoles(context.userId);
    if (!canDecide(roles)) throw new Error("Apenas admin pode aprovar/reprovar builds");
    const sb = await getAdmin();
    const { data: run, error: re } = await sb
      .from("lhci_runs")
      .update({
        decision: data.decision,
        decision_reason: data.reason ?? null,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
        status: data.decision === "approved" ? "approved" : "rejected",
      })
      .eq("id", data.id)
      .select("*")
      .maybeSingle();
    if (re) throw new Error(re.message);
    if (run) await notifyDecision(run, data.decision, data.reason ?? null, context.userId);
    return { ok: true };
  });

export const lhciTrends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        environment: z.string().optional(),
        limit: z.number().int().min(5).max(200).optional(),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!canView(roles)) throw new Error("Acesso negado");
    const sb = await getAdmin();
    let q = sb
      .from("lhci_runs")
      .select("created_at,performance,seo,lcp_ms,cls,tbt_ms,environment")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.environment) q = q.eq("environment", data.environment);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return {
      rows: (rows ?? []).reverse().map((r: any) => ({
        t: new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        perf: r.performance != null ? Math.round(r.performance * 100) : null,
        seo: r.seo != null ? Math.round(r.seo * 100) : null,
        lcp: r.lcp_ms,
        cls: r.cls,
        tbt: r.tbt_ms,
      })),
    };
  });
