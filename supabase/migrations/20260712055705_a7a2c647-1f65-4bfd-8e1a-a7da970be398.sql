-- Enum de status
DO $$ BEGIN
  CREATE TYPE public.visitor_funnel_status AS ENUM (
    'session_created',
    'funnel_opened',
    'funnel_started',
    'cart_suggested',
    'cart_accepted',
    'cart_declined',
    'form_submitted',
    'whatsapp_redirected',
    'abandoned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.visitor_funnel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  session_id text NOT NULL UNIQUE,
  status public.visitor_funnel_status NOT NULL DEFAULT 'session_created',
  funnel_slug text,
  origin_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  cart_snapshot_open jsonb,
  cart_snapshot_final jsonb,
  partial_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  technical_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  network_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  consent_state jsonb NOT NULL DEFAULT '{"necessary":true}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  referrer text,
  page_path text,
  page_url text,
  service_slug text,
  product_id uuid,
  product_slug text,
  city_slug text,
  last_step integer NOT NULL DEFAULT 0,
  lead_id uuid REFERENCES public.lead_submissions(id) ON DELETE SET NULL,
  protocol text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  submitted_at timestamptz,
  redirected_at timestamptz,
  abandoned_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vfs_visitor_id ON public.visitor_funnel_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_vfs_status ON public.visitor_funnel_sessions(status);
CREATE INDEX IF NOT EXISTS idx_vfs_created_at ON public.visitor_funnel_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vfs_lead_id ON public.visitor_funnel_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_vfs_expires_at ON public.visitor_funnel_sessions(expires_at);

-- GRANTS: apenas service_role e admin autenticado. Nada para anon.
GRANT ALL ON public.visitor_funnel_sessions TO service_role;
GRANT SELECT ON public.visitor_funnel_sessions TO authenticated;

ALTER TABLE public.visitor_funnel_sessions ENABLE ROW LEVEL SECURITY;

-- Somente admins podem ler
CREATE POLICY "admins_read_visitor_funnel_sessions"
  ON public.visitor_funnel_sessions
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- service_role já bypassa RLS; nenhuma policy para anon

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_vfs_updated_at ON public.visitor_funnel_sessions;
CREATE TRIGGER trg_vfs_updated_at
  BEFORE UPDATE ON public.visitor_funnel_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Purge de sessões expiradas
CREATE OR REPLACE FUNCTION public.purge_visitor_funnel_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c integer;
BEGIN
  WITH d AS (
    DELETE FROM public.visitor_funnel_sessions
    WHERE expires_at < now()
      AND status IN ('session_created','funnel_opened','funnel_started','abandoned')
    RETURNING 1
  )
  SELECT COUNT(*) INTO c FROM d;
  RETURN COALESCE(c, 0);
END $$;