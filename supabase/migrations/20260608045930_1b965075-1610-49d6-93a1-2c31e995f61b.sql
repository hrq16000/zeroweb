
-- is_solution manual override
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_solution boolean;

-- Unified leads view (regular view; runs as caller, RLS of underlying tables applies)
CREATE OR REPLACE VIEW public.vw_unified_leads
WITH (security_invoker = true) AS
SELECT
  c.id::text AS id_lead,
  COALESCE(
    NULLIF(c.metadata->>'name',''),
    NULLIF(c.cart_snapshot->>'contact_name',''),
    'Visitante ' || COALESCE(c.visitor_id, substr(c.id::text,1,6))
  ) AS nome,
  'carrinho'::text AS origem,
  c.step AS etapa_atual,
  jsonb_build_object(
    'cart_snapshot', c.cart_snapshot,
    'payment_status', c.payment_status,
    'payment_channel', c.payment_channel,
    'total_amount', c.total_amount,
    'visitor_id', c.visitor_id,
    'user_id', c.user_id,
    'metadata', c.metadata
  ) AS dados_extras,
  c.created_at,
  c.updated_at
FROM public.cart_funnel_progress c
UNION ALL
SELECT
  d.id::text,
  COALESCE(NULLIF(d.contact_name,''), NULLIF(d.contact_email,''), 'Lead ' || substr(d.id::text,1,6)),
  'funil'::text,
  COALESCE(d.pipeline_stage, 'novo'),
  jsonb_build_object(
    'form_id', d.form_id,
    'answers', d.answers_json,
    'metadata', d.metadata_json,
    'contact_email', d.contact_email,
    'contact_phone', d.contact_phone,
    'whatsapp_user_url', d.whatsapp_user_url,
    'score', d.score,
    'tags', d.tags,
    'intent_level', d.intent_level,
    'assigned_to', d.assigned_to
  ),
  d.created_at,
  d.created_at
FROM public.dynamic_form_leads d;

GRANT SELECT ON public.vw_unified_leads TO authenticated;
GRANT ALL    ON public.vw_unified_leads TO service_role;

-- Security fix: is_super_admin now derives from user_roles (not portal_members)
CREATE OR REPLACE FUNCTION public.is_super_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
     WHERE user_id = _uid AND role = 'super_admin'::public.app_role
  )
$$;

-- Backfill existing super_admins from portal_members
INSERT INTO public.user_roles(user_id, role)
SELECT DISTINCT pm.user_id, 'super_admin'::public.app_role
  FROM public.portal_members pm
 WHERE pm.role = 'super_admin'
ON CONFLICT (user_id, role) DO NOTHING;
