
CREATE TABLE public.content_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_slug TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER,
  ctr NUMERIC(5,4),
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX content_metrics_cluster_idx ON public.content_metrics(cluster_slug, recorded_at DESC);
CREATE INDEX content_metrics_url_idx ON public.content_metrics(url);
GRANT SELECT, INSERT ON public.content_metrics TO authenticated;
GRANT ALL ON public.content_metrics TO service_role;
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read content_metrics" ON public.content_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert content_metrics" ON public.content_metrics FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.editorial_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  cluster_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  intent TEXT NOT NULL,
  funnel TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 2,
  commercial_value INTEGER NOT NULL DEFAULT 3,
  template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  scheduled_for DATE,
  published_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX editorial_calendar_cluster_idx ON public.editorial_calendar(cluster_slug);
CREATE INDEX editorial_calendar_status_idx ON public.editorial_calendar(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_calendar TO authenticated;
GRANT ALL ON public.editorial_calendar TO service_role;
ALTER TABLE public.editorial_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated manage editorial_calendar" ON public.editorial_calendar FOR ALL TO authenticated USING (true) WITH CHECK (true);
