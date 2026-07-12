CREATE TABLE IF NOT EXISTS public.whatsapp_redirect_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  lead_id uuid REFERENCES public.dynamic_form_leads(id) ON DELETE SET NULL,
  destination_digits text NOT NULL,
  message text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  used_at timestamptz,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_redirect_tokens_token_idx ON public.whatsapp_redirect_tokens(token);
CREATE INDEX IF NOT EXISTS whatsapp_redirect_tokens_expires_idx ON public.whatsapp_redirect_tokens(expires_at);

GRANT ALL ON public.whatsapp_redirect_tokens TO service_role;

ALTER TABLE public.whatsapp_redirect_tokens ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: table is service_role only.
-- Deny-by-default via RLS with no matching policies.
CREATE POLICY "service_role manages redirect tokens"
  ON public.whatsapp_redirect_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);