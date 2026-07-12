-- Turno 1: Minimize whatsapp_redirect_tokens (backward compatible)

-- 1) New columns
ALTER TABLE public.whatsapp_redirect_tokens
  ADD COLUMN IF NOT EXISTS funnel_session_id uuid,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;

-- 2) Deprecate legacy columns: allow NULL for new tokens (legacy rows keep values)
ALTER TABLE public.whatsapp_redirect_tokens
  ALTER COLUMN destination_digits DROP NOT NULL,
  ALTER COLUMN message DROP NOT NULL;

COMMENT ON COLUMN public.whatsapp_redirect_tokens.destination_digits IS 'DEPRECATED (legacy tokens only). New tokens resolve the number server-side at consumption time.';
COMMENT ON COLUMN public.whatsapp_redirect_tokens.message IS 'DEPRECATED (legacy tokens only). New tokens rebuild the message server-side at consumption time.';
COMMENT ON COLUMN public.whatsapp_redirect_tokens.use_count IS 'Number of times the token was consumed (0 = never used).';
COMMENT ON COLUMN public.whatsapp_redirect_tokens.last_used_at IS 'Timestamp of most recent consumption (double-tap tolerance window).';
COMMENT ON COLUMN public.whatsapp_redirect_tokens.funnel_session_id IS 'Links the token to the originating visitor_funnel_sessions row.';

-- 3) Constraints (guarded so re-runs are safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'whatsapp_redirect_tokens_use_count_nonneg'
  ) THEN
    ALTER TABLE public.whatsapp_redirect_tokens
      ADD CONSTRAINT whatsapp_redirect_tokens_use_count_nonneg
      CHECK (use_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'whatsapp_redirect_tokens_expires_after_created'
  ) THEN
    ALTER TABLE public.whatsapp_redirect_tokens
      ADD CONSTRAINT whatsapp_redirect_tokens_expires_after_created
      CHECK (expires_at > created_at);
  END IF;
END $$;

-- 4) Foreign key to visitor_funnel_sessions (nullable, ON DELETE SET NULL to preserve audit trail)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'whatsapp_redirect_tokens_funnel_session_fkey'
  ) THEN
    ALTER TABLE public.whatsapp_redirect_tokens
      ADD CONSTRAINT whatsapp_redirect_tokens_funnel_session_fkey
      FOREIGN KEY (funnel_session_id)
      REFERENCES public.visitor_funnel_sessions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 5) Indexes
CREATE INDEX IF NOT EXISTS whatsapp_redirect_tokens_lead_idx
  ON public.whatsapp_redirect_tokens (lead_id);
CREATE INDEX IF NOT EXISTS whatsapp_redirect_tokens_funnel_session_idx
  ON public.whatsapp_redirect_tokens (funnel_session_id);

-- 6) Purge function (server-side only; no arbitrary SQL/interval from callers)
CREATE OR REPLACE FUNCTION public.purge_whatsapp_redirect_tokens()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  WITH d AS (
    DELETE FROM public.whatsapp_redirect_tokens
     WHERE expires_at < now() - interval '24 hours'
     RETURNING 1
  )
  SELECT COUNT(*) INTO removed FROM d;
  RETURN COALESCE(removed, 0);
END $$;

-- Lock down execution: only service_role / definer contexts
REVOKE ALL ON FUNCTION public.purge_whatsapp_redirect_tokens() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_whatsapp_redirect_tokens() FROM anon;
REVOKE ALL ON FUNCTION public.purge_whatsapp_redirect_tokens() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.purge_whatsapp_redirect_tokens() TO service_role;

-- 7) Confirm RLS still enabled (no-op if already on)
ALTER TABLE public.whatsapp_redirect_tokens ENABLE ROW LEVEL SECURITY;

-- 8) Ensure no anon/authenticated grants exist on the table
REVOKE ALL ON public.whatsapp_redirect_tokens FROM anon;
REVOKE ALL ON public.whatsapp_redirect_tokens FROM authenticated;
GRANT ALL ON public.whatsapp_redirect_tokens TO service_role;