import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Painel admin de `landing_overrides`.
 * Fluxo: draft → publish → unpublish. O front público lê apenas
 * `published_value` (via a view `landing_overrides_public`).
 */

const KeySchema = z.string().min(1).max(160);
const ScopeSchema = z.string().min(1).max(120).default("global");

const SaveDraftSchema = z.object({
  scope: ScopeSchema,
  key: KeySchema,
  draftValue: z.string().max(20_000),
});

const TargetSchema = z.object({ id: z.string().uuid() });

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
      .select("draft_value")
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
    return { status: "published" as const };
  });

export const adminUnpublishLandingOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TargetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
    return { status: "unpublished" as const };
  });
