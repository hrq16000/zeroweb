
CREATE TABLE IF NOT EXISTS public.index_coverage_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  issue_type text NOT NULL CHECK (issue_type IN ('404','soft_404','redirect','excluded','server_error','blocked_robots','noindex','other')),
  status_code integer,
  message text,
  source text NOT NULL DEFAULT 'manual',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ici_type_date ON public.index_coverage_issues(issue_type, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_ici_url ON public.index_coverage_issues(url);
CREATE INDEX IF NOT EXISTS idx_ici_unresolved ON public.index_coverage_issues(detected_at DESC) WHERE resolved_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.index_coverage_issues TO authenticated;
GRANT ALL ON public.index_coverage_issues TO service_role;

ALTER TABLE public.index_coverage_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_select_ici" ON public.index_coverage_issues FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins_write_ici" ON public.index_coverage_issues FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_ici_touch BEFORE UPDATE ON public.index_coverage_issues
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- GPS consent log
CREATE TABLE IF NOT EXISTS public.gps_consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  session_id text,
  decision text NOT NULL CHECK (decision IN ('granted','denied','dismissed')),
  page text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gps_consent_visitor ON public.gps_consent_log(visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_consent_decision ON public.gps_consent_log(decision, created_at DESC);

GRANT INSERT ON public.gps_consent_log TO anon, authenticated;
GRANT SELECT ON public.gps_consent_log TO authenticated;
GRANT ALL ON public.gps_consent_log TO service_role;

ALTER TABLE public.gps_consent_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_gps_consent" ON public.gps_consent_log FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins_select_gps_consent" ON public.gps_consent_log FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));
