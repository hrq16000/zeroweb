
-- =========================================================================
-- Entrega 1+2: identity stitch audit, license limit guard, snapshot helper
-- =========================================================================

-- 1) Identity stitching audit log
CREATE TABLE IF NOT EXISTS public.identity_stitch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  user_id uuid,
  user_ref text,
  stitched_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ok', -- ok | noop | error
  error_message text,
  source text, -- oauth_callback | manual | trigger
  actor uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_identity_stitch_log_created ON public.identity_stitch_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_identity_stitch_log_user ON public.identity_stitch_log(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_stitch_log_visitor ON public.identity_stitch_log(visitor_id);

GRANT SELECT ON public.identity_stitch_log TO authenticated;
GRANT ALL ON public.identity_stitch_log TO service_role;

ALTER TABLE public.identity_stitch_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "identity_stitch_log_super_select" ON public.identity_stitch_log;
CREATE POLICY "identity_stitch_log_super_select" ON public.identity_stitch_log
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- 2) Modify stitch_visitor_identity to write audit + status
CREATE OR REPLACE FUNCTION public.stitch_visitor_identity(p_visitor_id text, p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ref text;
  v_count integer := 0;
  v_status text := 'ok';
  v_err text;
BEGIN
  BEGIN
    IF p_visitor_id IS NULL OR p_user_id IS NULL THEN
      v_status := 'noop';
    ELSE
      SELECT user_ref INTO v_ref FROM public.profiles WHERE id = p_user_id;
      IF v_ref IS NULL THEN
        v_ref := public.generate_user_ref();
        UPDATE public.profiles SET user_ref = v_ref WHERE id = p_user_id AND user_ref IS NULL;
      END IF;

      WITH u AS (
        UPDATE public.visitantes_rastreio
           SET user_id = p_user_id,
               user_ref = v_ref
         WHERE visitor_id = p_visitor_id
         RETURNING 1
      )
      SELECT COUNT(*) INTO v_count FROM u;

      IF v_count = 0 THEN v_status := 'noop'; END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_status := 'error';
    v_err := SQLERRM;
  END;

  INSERT INTO public.identity_stitch_log(visitor_id, user_id, user_ref, stitched_count, status, error_message, source, actor)
    VALUES (p_visitor_id, p_user_id, v_ref, COALESCE(v_count, 0), v_status, v_err, 'rpc', auth.uid());

  RETURN COALESCE(v_count, 0);
END $function$;

-- 3) License limit guard
-- Reads license.limits jsonb and current counts; raises if exceeded.
CREATE OR REPLACE FUNCTION public.check_license_limit(p_portal_id uuid, p_resource text)
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_license public.licenses%ROWTYPE;
  v_limit int;
  v_current int;
BEGIN
  SELECT * INTO v_license
    FROM public.licenses
   WHERE portal_id = p_portal_id
     AND status IN ('active', 'trial')
   ORDER BY created_at DESC
   LIMIT 1;

  -- No license = unrestricted (legacy portals)
  IF v_license.id IS NULL THEN RETURN; END IF;

  v_limit := NULLIF((v_license.limits ->> p_resource), '')::int;
  IF v_limit IS NULL THEN RETURN; END IF;

  IF p_resource = 'users' THEN
    SELECT COUNT(*) INTO v_current FROM public.portal_members WHERE portal_id = p_portal_id;
  ELSIF p_resource = 'leads' THEN
    SELECT COUNT(*) INTO v_current FROM public.lead_submissions WHERE portal_id = p_portal_id;
  ELSIF p_resource = 'service_requests' THEN
    SELECT COUNT(*) INTO v_current FROM public.service_requests WHERE portal_id = p_portal_id;
  ELSIF p_resource = 'projects' THEN
    -- placeholder until projects.portal_id exists
    v_current := 0;
  ELSE
    RETURN;
  END IF;

  IF v_current >= v_limit THEN
    RAISE EXCEPTION 'license_limit_exceeded:%:%/%', p_resource, v_current, v_limit
      USING ERRCODE = 'check_violation';
  END IF;
END $function$;

-- 4) BEFORE INSERT triggers enforcing limits
CREATE OR REPLACE FUNCTION public.enforce_license_limit_leads()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$ BEGIN
  IF NEW.portal_id IS NOT NULL THEN PERFORM public.check_license_limit(NEW.portal_id, 'leads'); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_lead_submissions_license_limit ON public.lead_submissions;
CREATE TRIGGER trg_lead_submissions_license_limit
  BEFORE INSERT ON public.lead_submissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_license_limit_leads();

CREATE OR REPLACE FUNCTION public.enforce_license_limit_members()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$ BEGIN
  PERFORM public.check_license_limit(NEW.portal_id, 'users');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_portal_members_license_limit ON public.portal_members;
CREATE TRIGGER trg_portal_members_license_limit
  BEFORE INSERT ON public.portal_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_license_limit_members();

CREATE OR REPLACE FUNCTION public.enforce_license_limit_requests()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$ BEGIN
  IF NEW.portal_id IS NOT NULL THEN PERFORM public.check_license_limit(NEW.portal_id, 'service_requests'); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_service_requests_license_limit ON public.service_requests;
CREATE TRIGGER trg_service_requests_license_limit
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.enforce_license_limit_requests();
