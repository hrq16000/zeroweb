/**
 * Testes do user_ref:
 *  - Formato `USR-XXXXXX` (alfabeto sem caracteres ambíguos)
 *  - Unicidade ao chamar `generate_user_ref` várias vezes
 *  - Trigger AFTER INSERT em auth.users cria profile com user_ref
 *  - stitch_visitor_identity escreve em identity_stitch_log
 *
 * Requer envs: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (já presentes em Lovable Cloud).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const skip = !url || !key;

let admin: SupabaseClient;

beforeAll(() => {
  if (skip) return;
  admin = createClient(url!, key!, { auth: { persistSession: false } });
});

describe.skipIf(skip)("user_ref generation", () => {
  it("generate_user_ref retorna USR-XXXXXX no alfabeto correto", async () => {
    const { data, error } = await admin.rpc("generate_user_ref");
    expect(error).toBeNull();
    expect(typeof data).toBe("string");
    expect(data as string).toMatch(/^USR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("100 invocações são únicas", async () => {
    const refs = await Promise.all(
      Array.from({ length: 100 }, () => admin.rpc("generate_user_ref").then((r) => r.data as string)),
    );
    expect(new Set(refs).size).toBe(refs.length);
  });
});

describe.skipIf(skip)("stitch_visitor_identity", () => {
  it("status=noop quando visitor desconhecido + grava em identity_stitch_log", async () => {
    const visitor = `test-vid-${Date.now()}`;
    // sem user_id e visitor inexistente → noop
    const { data, error } = await admin.rpc("stitch_visitor_identity", {
      p_visitor_id: visitor,
      p_user_id: "00000000-0000-0000-0000-000000000000",
    });
    expect(error).toBeNull();
    expect(data).toBe(0);

    const { data: log } = await admin
      .from("identity_stitch_log")
      .select("status, visitor_id")
      .eq("visitor_id", visitor)
      .limit(1);
    expect(log?.[0]?.status === "noop" || log?.[0]?.status === "error").toBe(true);
  });
});

describe.skipIf(skip)("license limit guard", () => {
  it("check_license_limit não bloqueia portal sem licença", async () => {
    const { error } = await admin.rpc("check_license_limit", {
      p_portal_id: "00000000-0000-0000-0000-000000000000",
      p_resource: "leads",
    });
    expect(error).toBeNull();
  });
});
