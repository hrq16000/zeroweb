
CREATE TABLE public.route_404_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  hits INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX route_404_log_path_uidx ON public.route_404_log (path);
CREATE INDEX route_404_log_last_seen_idx ON public.route_404_log (last_seen DESC);

GRANT SELECT ON public.route_404_log TO authenticated;
GRANT ALL ON public.route_404_log TO service_role;

ALTER TABLE public.route_404_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins can read 404 log"
  ON public.route_404_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));
