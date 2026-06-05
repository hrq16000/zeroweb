
-- ── Health-check history ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.integration_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  status text NOT NULL CHECK (status IN ('ok','error')),
  message text,
  latency_ms integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'cron'
);
CREATE INDEX IF NOT EXISTS idx_ihc_key_time ON public.integration_health_checks(key, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_ihc_time ON public.integration_health_checks(checked_at DESC);
GRANT SELECT, INSERT ON public.integration_health_checks TO authenticated;
GRANT ALL ON public.integration_health_checks TO service_role;
ALTER TABLE public.integration_health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings managers read healthchecks" ON public.integration_health_checks
  FOR SELECT TO authenticated USING (public.can_manage_settings(auth.uid()));
CREATE POLICY "settings managers insert healthchecks" ON public.integration_health_checks
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_settings(auth.uid()));

-- ── Settings change rate-limit log ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  key text,
  action text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_settings_change_log_user_time ON public.settings_change_log(user_id, at DESC);
GRANT SELECT, INSERT ON public.settings_change_log TO authenticated;
GRANT ALL ON public.settings_change_log TO service_role;
ALTER TABLE public.settings_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "managers read change log" ON public.settings_change_log
  FOR SELECT TO authenticated USING (public.can_manage_settings(auth.uid()));
CREATE POLICY "managers insert change log" ON public.settings_change_log
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_settings(auth.uid()));

-- ── Break-glass: temporary secret-reveal grants ──────────────────────
CREATE TABLE IF NOT EXISTS public.break_glass_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  reason text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revealed_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_bg_user_time ON public.break_glass_grants(user_id, granted_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.break_glass_grants TO authenticated;
GRANT ALL ON public.break_glass_grants TO service_role;
ALTER TABLE public.break_glass_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "managers read break-glass" ON public.break_glass_grants
  FOR SELECT TO authenticated USING (public.can_manage_settings(auth.uid()));
CREATE POLICY "managers write break-glass" ON public.break_glass_grants
  FOR ALL TO authenticated USING (public.can_manage_settings(auth.uid()))
  WITH CHECK (public.can_manage_settings(auth.uid()));

-- ── Lightweight 2FA enforcement flag on profiles ─────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS twofa_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS twofa_enabled_at timestamptz;
