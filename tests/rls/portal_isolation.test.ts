/**
 * Integration test: RLS isolation across portals.
 *
 * Creates two real users in two portals, then verifies each can only
 * read/write rows tagged with their own portal_id across the main
 * portal-aware tables.
 *
 * Run:
 *   bun tests/rls/portal_isolation.test.ts
 *
 * Requires server env:
 *   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!URL || !ANON || !SRK) {
  console.error("Missing SUPABASE_URL / PUBLISHABLE_KEY / SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(URL, SRK, { auth: { persistSession: false } });

function ok(label: string) { console.log("✓", label); }
function fail(label: string, extra?: unknown): never {
  console.error("✗", label, extra ?? "");
  process.exit(1);
}

async function main() {
  const stamp = Date.now();
  const emailA = `rls-a-${stamp}@example.com`;
  const emailB = `rls-b-${stamp}@example.com`;
  const password = "Rls-Test!123";

  // 1. Create two users + two portals
  const { data: ua, error: ea } = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
  if (ea) fail("create user A", ea.message);
  const { data: ub, error: eb } = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
  if (eb) fail("create user B", eb.message);
  const uidA = ua.user!.id;
  const uidB = ub.user!.id;

  const { data: portals, error: ep } = await admin.from("portals")
    .insert([
      { slug: `t-a-${stamp}`, name: "Test Portal A", is_default: false },
      { slug: `t-b-${stamp}`, name: "Test Portal B", is_default: false },
    ]).select("id, slug");
  if (ep) fail("insert portals", ep.message);
  const pA = portals![0].id, pB = portals![1].id;

  await admin.from("portal_members").insert([
    { user_id: uidA, portal_id: pA, role: "portal_admin" },
    { user_id: uidB, portal_id: pB, role: "portal_admin" },
  ]);

  await admin.from("lead_submissions").insert([
    { portal_id: pA, name: "A", email: "a@a.com", source: "form" },
    { portal_id: pB, name: "B", email: "b@b.com", source: "form" },
  ]);
  await admin.from("analytics_events").insert([
    { portal_id: pA, event_name: "view_a" },
    { portal_id: pB, event_name: "view_b" },
  ]);

  // 2. Sign in as user A using anon client
  const clientA = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: sa } = await clientA.auth.signInWithPassword({ email: emailA, password });
  if (sa) fail("sign-in A", sa.message);

  // 2a. Lead submissions: A must not see B
  const { data: leadsSeen } = await clientA.from("lead_submissions").select("id, portal_id").eq("portal_id", pB);
  if ((leadsSeen?.length ?? 0) !== 0) fail("user A leaked portal-B leads", leadsSeen);
  ok("user A cannot read portal B lead_submissions");

  // 2b. Analytics events: A must not see B
  const { data: evSeen } = await clientA.from("analytics_events").select("id").eq("portal_id", pB);
  if ((evSeen?.length ?? 0) !== 0) fail("user A leaked portal-B events", evSeen);
  ok("user A cannot read portal B analytics_events");

  // 2c. Write: A cannot insert into portal B
  const { error: insErr } = await clientA.from("lead_submissions")
    .insert({ portal_id: pB, name: "x", email: "x@x.com", source: "form" });
  if (!insErr) fail("user A wrote into portal B (RLS hole)");
  ok("user A blocked from writing portal B lead_submissions");

  // 3. User B
  const clientB = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: sb } = await clientB.auth.signInWithPassword({ email: emailB, password });
  if (sb) fail("sign-in B", sb.message);
  const { data: leadsB } = await clientB.from("lead_submissions").select("id").eq("portal_id", pA);
  if ((leadsB?.length ?? 0) !== 0) fail("user B leaked portal-A leads", leadsB);
  ok("user B cannot read portal A lead_submissions");

  // 4. visitantes_rastreio isolation
  await admin.from("visitantes_rastreio").upsert([
    { ip_hash: `hash-a-${stamp}`, day: new Date().toISOString().slice(0, 10), portal_id: pA, path: "/a" },
    { ip_hash: `hash-b-${stamp}`, day: new Date().toISOString().slice(0, 10), portal_id: pB, path: "/b" },
  ], { onConflict: "ip_hash,day" });
  const { data: telA } = await clientA.from("visitantes_rastreio").select("id").eq("portal_id", pB);
  if ((telA?.length ?? 0) !== 0) fail("user A saw portal B telemetry", telA);
  ok("user A cannot read portal B visitantes_rastreio");

  // 5. Cleanup
  await admin.from("visitantes_rastreio").delete().in("ip_hash", [`hash-a-${stamp}`, `hash-b-${stamp}`]);
  await admin.from("lead_submissions").delete().in("portal_id", [pA, pB]);
  await admin.from("analytics_events").delete().in("portal_id", [pA, pB]);
  await admin.from("portal_members").delete().in("user_id", [uidA, uidB]);
  await admin.from("portals").delete().in("id", [pA, pB]);
  await admin.auth.admin.deleteUser(uidA);
  await admin.auth.admin.deleteUser(uidB);

  console.log("\nAll RLS isolation assertions passed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
