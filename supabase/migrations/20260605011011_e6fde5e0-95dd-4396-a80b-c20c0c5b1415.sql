
-- Enable scheduling extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Index to speed up rate-limit lookups on recent hits per ip_hash
CREATE INDEX IF NOT EXISTS visitantes_rastreio_iphash_created_idx
  ON public.visitantes_rastreio (ip_hash, created_at DESC);

-- Cleanup function: delete rows older than 180 days, keeping anonymous aggregate via summary table
CREATE TABLE IF NOT EXISTS public.visitantes_rastreio_daily_agg (
  day date PRIMARY KEY,
  total_visits integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  blocked_count integer NOT NULL DEFAULT 0,
  bot_count integer NOT NULL DEFAULT 0,
  top_country text,
  top_utm_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.visitantes_rastreio_daily_agg TO authenticated;
GRANT ALL ON public.visitantes_rastreio_daily_agg TO service_role;
ALTER TABLE public.visitantes_rastreio_daily_agg ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vragg_admin_read" ON public.visitantes_rastreio_daily_agg;
CREATE POLICY "vragg_admin_read" ON public.visitantes_rastreio_daily_agg
  FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.purge_visitantes_rastreio_old()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE deleted_count integer;
BEGIN
  -- Aggregate to daily summary before deletion
  INSERT INTO public.visitantes_rastreio_daily_agg(day, total_visits, unique_visitors, blocked_count, bot_count, top_country, top_utm_source)
  SELECT
    day,
    COUNT(*)::int,
    COUNT(DISTINCT ip_hash)::int,
    SUM(CASE WHEN blocked THEN 1 ELSE 0 END)::int,
    SUM(CASE WHEN is_bot THEN 1 ELSE 0 END)::int,
    (SELECT country FROM public.visitantes_rastreio v2 WHERE v2.day = v.day AND v2.country IS NOT NULL GROUP BY country ORDER BY COUNT(*) DESC LIMIT 1),
    (SELECT utm_source FROM public.visitantes_rastreio v3 WHERE v3.day = v.day AND v3.utm_source IS NOT NULL GROUP BY utm_source ORDER BY COUNT(*) DESC LIMIT 1)
  FROM public.visitantes_rastreio v
  WHERE created_at < now() - interval '180 days'
  GROUP BY day
  ON CONFLICT (day) DO NOTHING;

  WITH d AS (
    DELETE FROM public.visitantes_rastreio WHERE created_at < now() - interval '180 days' RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM d;

  RETURN COALESCE(deleted_count,0);
END $$;

-- Schedule daily at 03:15 UTC
DO $$
BEGIN
  PERFORM cron.unschedule('visitantes_rastreio_purge');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'visitantes_rastreio_purge',
  '15 3 * * *',
  $$SELECT public.purge_visitantes_rastreio_old();$$
);
