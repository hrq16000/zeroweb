import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Painel admin de `landing_overrides`.
 * Fluxo: draft → publish → unpublish, com histórico versionado
 * (`landing_overrides_history`) para preview e rollback. O front público lê
 * apenas `published_value` (via a view `landing_overrides_public`).
 */

const KeySchema = z.string().min(1).max(160);
const ScopeSchema = z.string().min(1).max(120).default("global");

const SaveDraftSchema = z.object({
  scope: ScopeSchema,
  key: KeySchema,
  draftValue: z.string().max(20_000),
});

const TargetSchema = z.object({ id: z.string().uuid() });
const RollbackSchema = z.object({ id: z.string().uuid(), historyId: z.string().uuid() });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado: requer admin.");
}

function parseJsonValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Conteúdo inválido: informe um JSON válido.");
  }
}

async function recordHistory(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  entry: {
    override_id: string;
    scope: string;
    key: string;
    value: unknown;
    action: "publish" | "unpublish" | "rollback";
    created_by: string;
  },
) {
  const { error } = await supabaseAdmin.from("landing_overrides_history").insert(entry);
  if (error) console.warn("[landing-overrides] history insert failed", error.message);
}

export const adminListLandingOverrides = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("landing_overrides")
      .select("id, scope, key, draft_value, published_value, published_at, updated_at, updated_by")
      .order("scope", { ascending: true })
      .order("key", { ascending: true })
      .limit(500);

    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

/** Preview: devolve o rascunho e o publicado lado a lado, sem alterar nada. */
export const adminPreviewLandingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TargetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("landing_overrides")
      .select("id, scope, key, draft_value, published_value, published_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return {
      id: row.id,
      scope: row.scope,
      key: row.key,
      draft: row.draft_value ?? null,
      published: row.published_value ?? null,
      publishedAt: row.published_at ?? null,
    };
  });

export const adminListLandingOverrideHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TargetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("landing_overrides_history")
      .select("id, action, value, created_at, created_by")
      .eq("override_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    type HistoryRow = {
      id: string;
      action: string;
      value: unknown;
      created_at: string;
      created_by: string | null;
    };
    // `value` é serializado como texto JSON para atravessar o RPC com segurança.
    return {
      rows: ((rows ?? []) as HistoryRow[]).map((r) => ({
        id: r.id,
        action: r.action,
        valueJson: JSON.stringify(r.value ?? null, null, 2),
        created_at: r.created_at,
        created_by: r.created_by,
      })),
    };
  });


export const adminSaveLandingOverrideDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveDraftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const draft = parseJsonValue(data.draftValue);

    const { data: row, error } = await supabaseAdmin
      .from("landing_overrides")
      .upsert(
        {
          scope: data.scope,
          key: data.key,
          draft_value: draft as never,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      )
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: row?.id ?? null, status: "draft" as const };
  });

export const adminPublishLandingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TargetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: current, error: readError } = await supabaseAdmin
      .from("landing_overrides")
      .select("scope, key, draft_value")
      .eq("id", data.id)
      .single();
    if (readError) throw new Error(readError.message);
    if (current?.draft_value === null || current?.draft_value === undefined) {
      throw new Error("Nada para publicar: rascunho vazio.");
    }

    const { error } = await supabaseAdmin
      .from("landing_overrides")
      .update({
        published_value: current.draft_value,
        published_at: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    await recordHistory(supabaseAdmin, {
      override_id: data.id,
      scope: current.scope,
      key: current.key,
      value: current.draft_value,
      action: "publish",
      created_by: userId,
    });

    return { status: "published" as const };
  });

export const adminUnpublishLandingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TargetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: current } = await supabaseAdmin
      .from("landing_overrides")
      .select("scope, key, published_value")
      .eq("id", data.id)
      .single();

    const { error } = await supabaseAdmin
      .from("landing_overrides")
      .update({
        published_value: null,
        published_at: null,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    if (current) {
      await recordHistory(supabaseAdmin, {
        override_id: data.id,
        scope: current.scope,
        key: current.key,
        value: current.published_value ?? null,
        action: "unpublish",
        created_by: userId,
      });
    }

    return { status: "unpublished" as const };
  });

/** Rollback: republica uma versão anterior do histórico. */
export const adminRollbackLandingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RollbackSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: version, error: readError } = await (supabaseAdmin as any)
      .from("landing_overrides_history")
      .select("id, override_id, scope, key, value")
      .eq("id", data.historyId)
      .eq("override_id", data.id)
      .single();
    if (readError) throw new Error(readError.message);
    if (!version || version.value === null || version.value === undefined) {
      throw new Error("Versão inválida para rollback.");
    }

    const { error } = await supabaseAdmin
      .from("landing_overrides")
      .update({
        published_value: version.value,
        draft_value: version.value,
        published_at: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    await recordHistory(supabaseAdmin, {
      override_id: data.id,
      scope: version.scope,
      key: version.key,
      value: version.value,
      action: "rollback",
      created_by: userId,
    });

    return { status: "rolled-back" as const };
  });
