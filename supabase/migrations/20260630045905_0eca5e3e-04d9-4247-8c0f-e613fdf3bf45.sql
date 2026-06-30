
CREATE TABLE IF NOT EXISTS public.landing_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  scope text NOT NULL DEFAULT 'service',
  draft_value jsonb,
  published_value jsonb,
  published_at timestamptz,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_overrides_scope ON public.landing_overrides(scope);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_overrides TO authenticated;
GRANT ALL ON public.landing_overrides TO service_role;

ALTER TABLE public.landing_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read landing_overrides"
  ON public.landing_overrides FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins write landing_overrides"
  ON public.landing_overrides FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_landing_overrides_touch
  BEFORE UPDATE ON public.landing_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Public view: somente published_value (nunca expõe draft)
CREATE OR REPLACE VIEW public.landing_overrides_public AS
  SELECT key, scope, published_value, published_at
  FROM public.landing_overrides
  WHERE published_value IS NOT NULL;

GRANT SELECT ON public.landing_overrides_public TO anon, authenticated;
