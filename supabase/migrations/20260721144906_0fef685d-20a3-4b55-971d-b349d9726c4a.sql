
-- ============ Reviews: hide author_email from public ============
DROP POLICY IF EXISTS "reviews public approved read" ON public.reviews;

-- Public view without author_email
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = true) AS
SELECT id, target_type, target_id, author_name, rating, comment, status, created_at, updated_at
FROM public.reviews
WHERE status = 'approved';

GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Keep author self-read (already present) and admin ALL (already present).
-- Also allow authenticated users to read approved reviews via base table WITHOUT email? No — force via view.
-- (No new base-table SELECT policy for public/authenticated.)

-- ============ wa_funnel_sessions: scoped update via RPC ============
DROP POLICY IF EXISTS "anon_update_waf" ON public.wa_funnel_sessions;
DROP POLICY IF EXISTS "auth_update_waf" ON public.wa_funnel_sessions;

CREATE OR REPLACE FUNCTION public.wa_funnel_update_session(
  p_id uuid,
  p_session_id text,
  p_current_step integer DEFAULT NULL,
  p_answers jsonb DEFAULT NULL,
  p_completed boolean DEFAULT NULL,
  p_completed_at timestamptz DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int;
BEGIN
  IF p_id IS NULL OR p_session_id IS NULL OR length(p_session_id) < 8 THEN
    RETURN false;
  END IF;

  UPDATE public.wa_funnel_sessions
     SET current_step = COALESCE(p_current_step, current_step),
         answers_json = COALESCE(p_answers, answers_json),
         completed = COALESCE(p_completed, completed),
         completed_at = COALESCE(p_completed_at, completed_at)
   WHERE id = p_id
     AND session_id = p_session_id
     AND created_at > (now() - interval '24 hours');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END $$;

REVOKE ALL ON FUNCTION public.wa_funnel_update_session(uuid, text, integer, jsonb, boolean, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wa_funnel_update_session(uuid, text, integer, jsonb, boolean, timestamptz) TO anon, authenticated;
