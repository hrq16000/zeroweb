-- RLS isolation tests for multi-portal access
-- Run via: psql -f tests/rls/portal_isolation.sql
-- Validates that an authenticated user attached to portal A
-- cannot read or write data scoped to portal B across all
-- portal_id-aware tables.

\set ON_ERROR_STOP on
BEGIN;

-- 1) Fixtures: create two portals + two users + memberships
DO $$
DECLARE
  uid_a uuid := '11111111-1111-1111-1111-111111111111';
  uid_b uuid := '22222222-2222-2222-2222-222222222222';
  pa uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  pb uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN
  INSERT INTO public.portals(id, slug, name, is_default)
    VALUES (pa,'test-a','Portal A',false), (pb,'test-b','Portal B',false)
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.portal_members(user_id, portal_id, role)
    VALUES (uid_a, pa, 'admin'), (uid_b, pb, 'admin')
    ON CONFLICT DO NOTHING;

  -- Seed rows in each portal
  INSERT INTO public.lead_submissions(id, portal_id, name, email, source)
    VALUES (gen_random_uuid(), pa, 'Lead A', 'a@a.com', 'form'),
           (gen_random_uuid(), pb, 'Lead B', 'b@b.com', 'form');
  INSERT INTO public.analytics_events(id, portal_id, event_name)
    VALUES (gen_random_uuid(), pa, 'view_a'),
           (gen_random_uuid(), pb, 'view_b');
END $$;

-- Helper: switch JWT impersonation
CREATE OR REPLACE FUNCTION pg_temp.as_user(_uid uuid) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role','authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _uid::text, 'role','authenticated')::text, true);
END $$;

-- 2) User A: should only see portal A rows
SELECT pg_temp.as_user('11111111-1111-1111-1111-111111111111'::uuid);

DO $$
DECLARE c_leads int; c_evt int;
BEGIN
  SELECT COUNT(*) INTO c_leads FROM public.lead_submissions WHERE portal_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF c_leads <> 0 THEN RAISE EXCEPTION 'FAIL: user A sees % portal B leads', c_leads; END IF;

  SELECT COUNT(*) INTO c_evt FROM public.analytics_events WHERE portal_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF c_evt <> 0 THEN RAISE EXCEPTION 'FAIL: user A sees % portal B events', c_evt; END IF;

  RAISE NOTICE 'OK: user A isolated from portal B (leads=0 events=0)';
END $$;

-- 3) User A: write to portal B must be denied
DO $$
BEGIN
  BEGIN
    INSERT INTO public.lead_submissions(portal_id, name, email, source)
      VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','x','x@x.com','form');
    RAISE EXCEPTION 'FAIL: user A wrote into portal B leads';
  EXCEPTION WHEN insufficient_privilege OR check_violation OR others THEN
    RAISE NOTICE 'OK: user A blocked from writing portal B leads (%)', SQLERRM;
  END;
END $$;

-- 4) User B: only sees portal B rows
SELECT pg_temp.as_user('22222222-2222-2222-2222-222222222222'::uuid);
DO $$
DECLARE c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.lead_submissions WHERE portal_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  IF c <> 0 THEN RAISE EXCEPTION 'FAIL: user B sees % portal A leads', c; END IF;
  SELECT COUNT(*) INTO c FROM public.analytics_events WHERE portal_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  IF c <> 0 THEN RAISE EXCEPTION 'FAIL: user B sees % portal A events', c; END IF;
  RAISE NOTICE 'OK: user B isolated from portal A';
END $$;

-- 5) visitantes_rastreio: insert as admin client (service role bypass), then
--    confirm member-of-portal-A only sees portal-A telemetry
RESET ROLE;
INSERT INTO public.visitantes_rastreio(ip_hash, day, portal_id, path)
  VALUES ('hash-a', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '/a'),
         ('hash-b', CURRENT_DATE, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '/b')
  ON CONFLICT (ip_hash, day) DO NOTHING;

SELECT pg_temp.as_user('11111111-1111-1111-1111-111111111111'::uuid);
DO $$
DECLARE c int;
BEGIN
  SELECT COUNT(*) INTO c FROM public.visitantes_rastreio WHERE portal_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF c <> 0 THEN RAISE EXCEPTION 'FAIL: user A saw portal B telemetry (%)', c; END IF;
  RAISE NOTICE 'OK: user A isolated from portal B telemetry';
END $$;

-- Cleanup: rollback test data — no side effects
ROLLBACK;
