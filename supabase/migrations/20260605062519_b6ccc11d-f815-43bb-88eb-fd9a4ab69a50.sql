
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id bigserial PRIMARY KEY,
  scope text NOT NULL,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.rate_limit_buckets TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rate_limit_buckets_id_seq TO service_role;

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rl_service_only" ON public.rate_limit_buckets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_lookup
  ON public.rate_limit_buckets(scope, ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_scope text,
  p_ip_hash text,
  p_window_seconds integer,
  p_max_hits integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
    FROM public.rate_limit_buckets
   WHERE scope = p_scope
     AND ip_hash = p_ip_hash
     AND created_at > now() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max_hits THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_buckets(scope, ip_hash) VALUES (p_scope, p_ip_hash);
  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.check_and_record_rate_limit(text, text, integer, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.purge_rate_limit_buckets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c integer;
BEGIN
  WITH d AS (DELETE FROM public.rate_limit_buckets WHERE created_at < now() - interval '24 hours' RETURNING 1)
  SELECT COUNT(*) INTO c FROM d;
  RETURN COALESCE(c, 0);
END $$;
