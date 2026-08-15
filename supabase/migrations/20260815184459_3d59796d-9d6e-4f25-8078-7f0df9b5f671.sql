CREATE TABLE IF NOT EXISTS public.landing_overrides_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  override_id uuid NOT NULL REFERENCES public.landing_overrides(id) ON DELETE CASCADE,
  scope text NOT NULL,
  key text NOT NULL,
  value jsonb,
  action text NOT NULL CHECK (action IN ('publish','unpublish','rollback')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.landing_overrides_history TO authenticated;
GRANT ALL ON public.landing_overrides_history TO service_role;

ALTER TABLE public.landing_overrides_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read landing overrides history"
ON public.landing_overrides_history FOR SELECT TO authenticated
USING (public.is_admin_or_super(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_landing_overrides_history_override
  ON public.landing_overrides_history (override_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','opened','resolved','expired')),
  funnel_session_id uuid REFERENCES public.visitor_funnel_sessions(id) ON DELETE SET NULL,
  ip_hash text,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  use_count integer NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.order_support_requests TO authenticated;
GRANT ALL ON public.order_support_requests TO service_role;

ALTER TABLE public.order_support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read order support requests"
ON public.order_support_requests FOR SELECT TO authenticated
USING (public.is_admin_or_super(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_order_support_requests_order
  ON public.order_support_requests (order_id, created_at DESC);

CREATE TRIGGER trg_order_support_requests_updated_at
BEFORE UPDATE ON public.order_support_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_wa_tokens_lead
  ON public.whatsapp_redirect_tokens (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_tokens_session
  ON public.whatsapp_redirect_tokens (funnel_session_id, created_at DESC);