
-- ============ seo_audit_history ============
DO $$ BEGIN
  CREATE TYPE public.seo_audit_kind AS ENUM ('seo_diff','legacy_links');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.seo_audit_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.seo_audit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.seo_audit_kind NOT NULL,
  ran_at timestamptz NOT NULL DEFAULT now(),
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  delta_pct numeric(6,2),
  status public.seo_audit_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_audit_history_kind_ran_at ON public.seo_audit_history(kind, ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_audit_history_status ON public.seo_audit_history(status);

GRANT SELECT ON public.seo_audit_history TO authenticated;
GRANT ALL ON public.seo_audit_history TO service_role;
ALTER TABLE public.seo_audit_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seo_audit_admin_read" ON public.seo_audit_history;
CREATE POLICY "seo_audit_admin_read" ON public.seo_audit_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "seo_audit_admin_update" ON public.seo_audit_history;
CREATE POLICY "seo_audit_admin_update" ON public.seo_audit_history
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- ============ cart_funnel_progress ============
DO $$ BEGIN
  CREATE TYPE public.cart_payment_channel AS ENUM ('site','whatsapp','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cart_payment_status AS ENUM ('open','pending','paid','failed','cancelled','handoff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.cart_funnel_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_id text,
  session_key text NOT NULL,
  step text NOT NULL DEFAULT 'cart_open',
  cart_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_status public.cart_payment_status NOT NULL DEFAULT 'open',
  payment_channel public.cart_payment_channel NOT NULL DEFAULT 'unknown',
  payment_ref text,
  total_amount numeric(12,2),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_key)
);

CREATE INDEX IF NOT EXISTS idx_cart_funnel_user ON public.cart_funnel_progress(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_funnel_visitor ON public.cart_funnel_progress(visitor_id);
CREATE INDEX IF NOT EXISTS idx_cart_funnel_status ON public.cart_funnel_progress(payment_status);

GRANT SELECT, INSERT, UPDATE ON public.cart_funnel_progress TO authenticated;
GRANT ALL ON public.cart_funnel_progress TO service_role;
ALTER TABLE public.cart_funnel_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_funnel_owner_read" ON public.cart_funnel_progress;
CREATE POLICY "cart_funnel_owner_read" ON public.cart_funnel_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "cart_funnel_owner_write" ON public.cart_funnel_progress;
CREATE POLICY "cart_funnel_owner_write" ON public.cart_funnel_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "cart_funnel_owner_update" ON public.cart_funnel_progress;
CREATE POLICY "cart_funnel_owner_update" ON public.cart_funnel_progress
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_cart_funnel_updated_at ON public.cart_funnel_progress;
CREATE TRIGGER trg_cart_funnel_updated_at
  BEFORE UPDATE ON public.cart_funnel_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
