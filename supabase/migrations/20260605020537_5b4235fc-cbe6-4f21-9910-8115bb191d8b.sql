CREATE TABLE public.visitor_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  day DATE NOT NULL DEFAULT (now()::date),
  ip_hash TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  asn TEXT,
  user_agent TEXT,
  ua_browser TEXT,
  ua_os TEXT,
  ua_device TEXT,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  method TEXT,
  path TEXT,
  query TEXT,
  referer TEXT,
  landing_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  fbclid TEXT,
  tenant_slug TEXT,
  portal_id UUID,
  visitor_id TEXT,
  session_id TEXT,
  blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  risk_score INT NOT NULL DEFAULT 0,
  status_code INT
);

GRANT SELECT ON public.visitor_events TO authenticated;
GRANT ALL ON public.visitor_events TO service_role;

ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visitor_events_admin_read" ON public.visitor_events
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_visitor_events_created_at ON public.visitor_events (created_at DESC);
CREATE INDEX idx_visitor_events_day ON public.visitor_events (day);
CREATE INDEX idx_visitor_events_ip_hash_created ON public.visitor_events (ip_hash, created_at DESC);
CREATE INDEX idx_visitor_events_blocked ON public.visitor_events (blocked) WHERE blocked = true;
CREATE INDEX idx_visitor_events_country ON public.visitor_events (country);
CREATE INDEX idx_visitor_events_utm_source ON public.visitor_events (utm_source);

-- Retention purge for append-only stream (30 days raw)
CREATE OR REPLACE FUNCTION public.purge_visitor_events_old()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c integer;
BEGIN
  WITH d AS (DELETE FROM public.visitor_events WHERE created_at < now() - interval '30 days' RETURNING 1)
  SELECT COUNT(*) INTO c FROM d;
  RETURN COALESCE(c,0);
END $$;