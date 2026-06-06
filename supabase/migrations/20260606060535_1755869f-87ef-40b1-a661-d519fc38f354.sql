
-- 1) Auto-grant super_admin to bootstrap admin email on profile creation
CREATE OR REPLACE FUNCTION public.grant_bootstrap_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_default_portal uuid;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  IF lower(coalesce(v_email,'')) = 'hrq16000@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role)
      VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    SELECT id INTO v_default_portal FROM public.portals WHERE is_default = true LIMIT 1;
    IF v_default_portal IS NOT NULL THEN
      INSERT INTO public.portal_members(user_id, portal_id, role)
        VALUES (NEW.id, v_default_portal, 'super_admin')
        ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_grant_bootstrap_admin ON public.profiles;
CREATE TRIGGER trg_grant_bootstrap_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.grant_bootstrap_admin();

-- 2) Backfill if profile already exists (no-op if not yet signed in)
DO $$
DECLARE v_uid uuid; v_portal uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email)='hrq16000@gmail.com' LIMIT 1;
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (v_uid, 'admin') ON CONFLICT DO NOTHING;
    SELECT id INTO v_portal FROM public.portals WHERE is_default = true LIMIT 1;
    IF v_portal IS NOT NULL THEN
      INSERT INTO public.portal_members(user_id, portal_id, role)
        VALUES (v_uid, v_portal, 'super_admin') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- 3) Lock whatsapp_config column from anon via column-level grants
REVOKE SELECT ON public.dynamic_forms FROM anon;
GRANT  SELECT (id, slug, name, description, status, config_json,
               current_version, published_version_id, created_at, updated_at)
       ON public.dynamic_forms TO anon;
-- authenticated/service_role keep full access (existing grants); ensure admins still see it
GRANT  SELECT ON public.dynamic_forms TO authenticated;
GRANT  ALL    ON public.dynamic_forms TO service_role;
