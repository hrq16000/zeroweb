
CREATE TABLE public.lhci_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  environment text NOT NULL DEFAULT 'prod',
  url text NOT NULL,
  commit_sha text,
  branch text,
  performance numeric,
  seo numeric,
  accessibility numeric,
  best_practices numeric,
  lcp_ms numeric,
  cls numeric,
  tbt_ms numeric,
  fcp_ms numeric,
  status text NOT NULL DEFAULT 'pending',
  decision text,
  decision_reason text,
  decided_by uuid,
  decided_at timestamptz,
  logs jsonb,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lhci_runs TO authenticated;
GRANT ALL ON public.lhci_runs TO service_role;
ALTER TABLE public.lhci_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read lhci runs" ON public.lhci_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'admin_integrations'));
CREATE POLICY "Admins can update lhci runs" ON public.lhci_runs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'admin_integrations'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'admin_integrations'));
CREATE INDEX lhci_runs_created_idx ON public.lhci_runs (created_at DESC);
CREATE INDEX lhci_runs_env_idx ON public.lhci_runs (environment, created_at DESC);
