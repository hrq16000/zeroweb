// CRUD de redirects 301/308 gerenciados pelo painel.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin(): Promise<AnyClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function assertAdmin(userId: string) {
  const sb = await getAdmin();
  const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", userId);
  const ok = (roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!ok) throw new Error("Forbidden: admin role required");
}

export interface RedirectRow {
  id: string;
  from_path: string;
  to_path: string;
  status_code: 301 | 302 | 307 | 308;
  enabled: boolean;
  hits: number;
  last_hit_at: string | null;
  notes: string | null;
  updated_at?: string;
}

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  from_path: z
    .string()
    .min(1)
    .max(2048)
    .regex(/^\//, "deve começar com /"),
  to_path: z.string().min(1).max(2048),
  status_code: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
  enabled: z.boolean(),
  notes: z.string().max(500).nullable().optional(),
});

export const listRedirects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("redirects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { redirects: (data ?? []) as RedirectRow[] };
  });

export const upsertRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const payload = {
      from_path: data.from_path,
      to_path: data.to_path,
      status_code: data.status_code,
      enabled: data.enabled,
      notes: data.notes ?? null,
    };
    if (data.id) {
      const { data: out, error } = await sb
        .from("redirects")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { redirect: out as RedirectRow };
    }
    const { data: out, error } = await sb
      .from("redirects")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { redirect: out as RedirectRow };
  });

export const deleteRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const { error } = await sb.from("redirects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
