
-- Atomic consumer for whatsapp_redirect_tokens.
-- Single UPDATE decides eligibility (not expired AND (never used OR within reuse window)).
-- If UPDATE matches: first use returns 'ok_first', subsequent within window return 'ok_reuse'.
-- Otherwise we look up why and return 'expired' / 'used_out_of_window' / 'not_found'.
CREATE OR REPLACE FUNCTION public.consume_whatsapp_redirect_token(
  p_token text,
  p_reuse_window_ms integer DEFAULT 60000
) RETURNS TABLE(
  status text,
  lead_id uuid,
  funnel_session_id uuid,
  destination_digits text,
  message text,
  use_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.whatsapp_redirect_tokens%ROWTYPE;
  now_ts timestamptz := now();
  window_interval interval := make_interval(secs => (p_reuse_window_ms::numeric) / 1000.0);
BEGIN
  UPDATE public.whatsapp_redirect_tokens t
     SET use_count = t.use_count + 1,
         used_at = COALESCE(t.used_at, now_ts),
         last_used_at = now_ts
   WHERE t.token = p_token
     AND t.expires_at > now_ts
     AND (t.used_at IS NULL OR (now_ts - t.used_at) < window_interval)
  RETURNING t.* INTO r;

  IF FOUND THEN
    RETURN QUERY SELECT
      CASE WHEN r.use_count = 1 THEN 'ok_first' ELSE 'ok_reuse' END,
      r.lead_id,
      r.funnel_session_id,
      r.destination_digits,
      r.message,
      r.use_count;
    RETURN;
  END IF;

  SELECT * INTO r FROM public.whatsapp_redirect_tokens WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'not_found'::text, NULL::uuid, NULL::uuid, NULL::text, NULL::text, 0::integer;
    RETURN;
  END IF;
  IF r.expires_at <= now_ts THEN
    RETURN QUERY SELECT 'expired'::text, r.lead_id, r.funnel_session_id, NULL::text, NULL::text, r.use_count;
    RETURN;
  END IF;
  RETURN QUERY SELECT 'used_out_of_window'::text, r.lead_id, r.funnel_session_id, NULL::text, NULL::text, r.use_count;
END $$;

REVOKE ALL ON FUNCTION public.consume_whatsapp_redirect_token(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_whatsapp_redirect_token(text, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_whatsapp_redirect_token(text, integer) TO service_role;

-- Idempotent server-only session status transition to whatsapp_redirected.
-- Won't overwrite abandoned; sets redirected_at once.
CREATE OR REPLACE FUNCTION public.mark_visitor_funnel_redirected(
  p_session_id text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated int;
BEGIN
  UPDATE public.visitor_funnel_sessions
     SET status = 'whatsapp_redirected'::visitor_funnel_status,
         redirected_at = COALESCE(redirected_at, now())
   WHERE session_id = p_session_id
     AND status <> 'abandoned'::visitor_funnel_status;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END $$;

REVOKE ALL ON FUNCTION public.mark_visitor_funnel_redirected(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_visitor_funnel_redirected(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_visitor_funnel_redirected(text) TO service_role;
