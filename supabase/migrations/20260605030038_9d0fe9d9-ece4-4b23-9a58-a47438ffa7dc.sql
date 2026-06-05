
-- ============ 1. IP BLOCKLIST (consultado pelo middleware) ============
CREATE TABLE IF NOT EXISTS public.ip_blocklist (
  ip_hash text PRIMARY KEY,
  block_reason text NOT NULL,
  risk_score int NOT NULL DEFAULT 90,
  asn text,
  country text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  hits int NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_expires ON public.ip_blocklist(expires_at);

GRANT SELECT ON public.ip_blocklist TO authenticated;
GRANT ALL ON public.ip_blocklist TO service_role;
ALTER TABLE public.ip_blocklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read blocklist" ON public.ip_blocklist FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- ============ 2. BLOCKED ASNS ============
CREATE TABLE IF NOT EXISTS public.blocked_asns (
  asn text PRIMARY KEY,
  org text NOT NULL,
  category text NOT NULL DEFAULT 'datacenter',
  reason text NOT NULL DEFAULT 'datacenter_asn',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blocked_asns TO authenticated, anon;
GRANT ALL ON public.blocked_asns TO service_role;
ALTER TABLE public.blocked_asns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read blocked_asns" ON public.blocked_asns FOR SELECT USING (true);
CREATE POLICY "admins manage blocked_asns" ON public.blocked_asns FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.blocked_asns(asn, org, category) VALUES
  ('AS16509','Amazon AWS','datacenter'),
  ('AS14618','Amazon AWS','datacenter'),
  ('AS15169','Google Cloud','datacenter'),
  ('AS396982','Google Cloud','datacenter'),
  ('AS8075','Microsoft Azure','datacenter'),
  ('AS8068','Microsoft Azure','datacenter'),
  ('AS14061','DigitalOcean','datacenter'),
  ('AS16276','OVH','datacenter'),
  ('AS24940','Hetzner','datacenter'),
  ('AS63949','Linode/Akamai','datacenter'),
  ('AS20473','Vultr/Choopa','datacenter'),
  ('AS12876','Scaleway','datacenter'),
  ('AS45102','Alibaba Cloud','datacenter'),
  ('AS132203','Tencent Cloud','datacenter'),
  ('AS210079','Stark Industries','abuse'),
  ('AS53667','FranTech/PONYNET','abuse')
ON CONFLICT (asn) DO NOTHING;

-- ============ 3. SAVED FILTERS ============
CREATE TABLE IF NOT EXISTS public.visitor_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vsf_user ON public.visitor_saved_filters(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_saved_filters TO authenticated;
GRANT ALL ON public.visitor_saved_filters TO service_role;
ALTER TABLE public.visitor_saved_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner or shared read" ON public.visitor_saved_filters FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_shared = true);
CREATE POLICY "owner write" ON public.visitor_saved_filters FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_vsf_updated BEFORE UPDATE ON public.visitor_saved_filters
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ============ 4. SEO MONITOR RUNS ============
CREATE TABLE IF NOT EXISTS public.seo_monitor_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz NOT NULL DEFAULT now(),
  sitemap_ok boolean NOT NULL DEFAULT false,
  sitemap_url_count int,
  robots_ok boolean NOT NULL DEFAULT false,
  jsonld_ok boolean NOT NULL DEFAULT false,
  jsonld_routes_checked int DEFAULT 0,
  jsonld_routes_failed int DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  alerted boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_seo_runs_at ON public.seo_monitor_runs(run_at DESC);
GRANT SELECT ON public.seo_monitor_runs TO authenticated;
GRANT ALL ON public.seo_monitor_runs TO service_role;
ALTER TABLE public.seo_monitor_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read seo runs" ON public.seo_monitor_runs FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- ============ 5. ANOMALY ALERTS ============
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  value numeric,
  threshold numeric,
  zscore numeric,
  channel text,
  status text NOT NULL DEFAULT 'pending',
  message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.anomaly_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_kind_status ON public.anomaly_alerts(kind, status);
GRANT SELECT ON public.anomaly_alerts TO authenticated;
GRANT ALL ON public.anomaly_alerts TO service_role;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read alerts" ON public.anomaly_alerts FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- ============ 6. TRIGGER: feed ip_blocklist quando visitor_events.blocked = true ============
CREATE OR REPLACE FUNCTION public.feed_ip_blocklist()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.blocked IS TRUE AND NEW.ip_hash IS NOT NULL THEN
    INSERT INTO public.ip_blocklist(ip_hash, block_reason, risk_score, asn, country, hits, expires_at)
    VALUES (NEW.ip_hash, COALESCE(NEW.block_reason,'auto'), COALESCE(NEW.risk_score,90), NEW.asn, NEW.country, 1,
            now() + (CASE WHEN COALESCE(NEW.risk_score,90) >= 95 THEN interval '7 days'
                          WHEN COALESCE(NEW.risk_score,90) >= 80 THEN interval '24 hours'
                          ELSE interval '2 hours' END))
    ON CONFLICT (ip_hash) DO UPDATE SET
      hits = ip_blocklist.hits + 1,
      block_reason = EXCLUDED.block_reason,
      risk_score = GREATEST(ip_blocklist.risk_score, EXCLUDED.risk_score),
      expires_at = GREATEST(ip_blocklist.expires_at, EXCLUDED.expires_at);
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_feed_blocklist ON public.visitor_events;
CREATE TRIGGER trg_feed_blocklist AFTER INSERT ON public.visitor_events
  FOR EACH ROW EXECUTE FUNCTION public.feed_ip_blocklist();

-- ============ 7. MATERIALIZED VIEWS ============
DROP MATERIALIZED VIEW IF EXISTS public.mv_visitors_daily;
CREATE MATERIALIZED VIEW public.mv_visitors_daily AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COUNT(*)::int AS total,
  COUNT(DISTINCT ip_hash)::int AS unique_visitors,
  SUM(CASE WHEN is_bot THEN 1 ELSE 0 END)::int AS bots,
  SUM(CASE WHEN blocked THEN 1 ELSE 0 END)::int AS blocked,
  SUM(CASE WHEN NOT is_bot AND NOT blocked THEN 1 ELSE 0 END)::int AS humans,
  COUNT(DISTINCT country) FILTER (WHERE country IS NOT NULL)::int AS countries
FROM public.visitor_events
WHERE created_at > now() - interval '90 days'
GROUP BY 1;
CREATE UNIQUE INDEX idx_mv_vd_day ON public.mv_visitors_daily(day);

DROP MATERIALIZED VIEW IF EXISTS public.mv_visitors_hourly;
CREATE MATERIALIZED VIEW public.mv_visitors_hourly AS
SELECT
  date_trunc('hour', created_at) AS hour,
  COUNT(*)::int AS total,
  SUM(CASE WHEN is_bot THEN 1 ELSE 0 END)::int AS bots,
  SUM(CASE WHEN blocked THEN 1 ELSE 0 END)::int AS blocked,
  SUM(CASE WHEN NOT is_bot AND NOT blocked THEN 1 ELSE 0 END)::int AS humans
FROM public.visitor_events
WHERE created_at > now() - interval '7 days'
GROUP BY 1;
CREATE UNIQUE INDEX idx_mv_vh_hour ON public.mv_visitors_hourly(hour);

DROP MATERIALIZED VIEW IF EXISTS public.mv_block_reasons_daily;
CREATE MATERIALIZED VIEW public.mv_block_reasons_daily AS
SELECT
  date_trunc('day', created_at)::date AS day,
  COALESCE(block_reason,'unknown') AS reason,
  COUNT(*)::int AS hits
FROM public.visitor_events
WHERE blocked = true AND created_at > now() - interval '30 days'
GROUP BY 1,2;
CREATE UNIQUE INDEX idx_mv_br_day_reason ON public.mv_block_reasons_daily(day, reason);

GRANT SELECT ON public.mv_visitors_daily, public.mv_visitors_hourly, public.mv_block_reasons_daily TO authenticated, service_role;

-- ============ 8. REFRESH FUNCTION ============
CREATE OR REPLACE FUNCTION public.refresh_visitor_mvs()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_visitors_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_visitors_hourly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_block_reasons_daily;
END$$;

-- ============ 9. CLEANUP EXPIRED BLOCKLIST ============
CREATE OR REPLACE FUNCTION public.purge_ip_blocklist()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c integer;
BEGIN
  WITH d AS (DELETE FROM public.ip_blocklist WHERE expires_at < now() RETURNING 1)
  SELECT COUNT(*) INTO c FROM d;
  RETURN COALESCE(c,0);
END$$;

-- ============ 10. CRON ============
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('refresh-visitor-mvs') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='refresh-visitor-mvs');
SELECT cron.schedule('refresh-visitor-mvs','*/15 * * * *', $$SELECT public.refresh_visitor_mvs()$$);

SELECT cron.unschedule('purge-ip-blocklist') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='purge-ip-blocklist');
SELECT cron.schedule('purge-ip-blocklist','7 * * * *', $$SELECT public.purge_ip_blocklist()$$);
