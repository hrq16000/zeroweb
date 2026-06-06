CREATE TABLE IF NOT EXISTS public.index_coverage_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  issue_type text NOT NULL,
  count int NOT NULL DEFAULT 0,
  open_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day, issue_type)
);

CREATE INDEX IF NOT EXISTS idx_ics_day ON public.index_coverage_snapshots(day DESC);
CREATE INDEX IF NOT EXISTS idx_ics_type ON public.index_coverage_snapshots(issue_type);

GRANT SELECT ON public.index_coverage_snapshots TO authenticated;
GRANT ALL ON public.index_coverage_snapshots TO service_role;

ALTER TABLE public.index_coverage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read snapshots"
  ON public.index_coverage_snapshots
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));
