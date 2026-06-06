
CREATE TABLE public.index_coverage_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid NOT NULL REFERENCES public.index_coverage_issues(id) ON DELETE CASCADE,
  action_key text NOT NULL,
  notes text,
  actor uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_index_coverage_actions_issue ON public.index_coverage_actions(issue_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.index_coverage_actions TO authenticated;
GRANT ALL ON public.index_coverage_actions TO service_role;
ALTER TABLE public.index_coverage_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage index_coverage_actions"
  ON public.index_coverage_actions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));
