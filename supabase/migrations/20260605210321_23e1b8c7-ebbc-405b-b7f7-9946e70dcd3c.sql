
-- ============ dynamic_forms ============
CREATE TABLE public.dynamic_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  whatsapp_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- whatsapp_config shape:
  -- {
  --   "redirect_phone": "+5511999999999",        // wa.me redirect for the user
  --   "user_message_template": "Olá! ...",       // pre-filled message for user
  --   "alert_phone": "+5511988887777",           // internal team alert number
  --   "alert_message_template": "*Novo lead*\n{{answers}}\n{{metadata}}",
  --   "provider": "uazapi",                      // or evolution, zapi, custom
  --   "api_base_url": "https://...",             // overrides server secret when set
  --   "api_token": null,                         // managed via admin only (encrypted at app level)
  --   "enabled": true
  -- }
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dynamic_forms_status_idx ON public.dynamic_forms(status);

GRANT SELECT ON public.dynamic_forms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dynamic_forms TO authenticated;
GRANT ALL ON public.dynamic_forms TO service_role;
ALTER TABLE public.dynamic_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published forms" ON public.dynamic_forms
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

CREATE POLICY "admins manage forms" ON public.dynamic_forms
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- ============ dynamic_form_questions ============
CREATE TABLE public.dynamic_form_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.dynamic_forms(id) ON DELETE CASCADE,
  key text NOT NULL,
  type text NOT NULL CHECK (type IN ('short_text','long_text','email','phone','select','radio','checkbox','number','statement')),
  label text NOT NULL,
  hint text,
  placeholder text,
  order_index integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT false,
  options_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- options shape: [{ "value": "sim", "label": "Sim", "emoji": "✅" }, ...]
  validation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_id, key)
);
CREATE INDEX dynamic_form_questions_form_idx ON public.dynamic_form_questions(form_id, order_index);

GRANT SELECT ON public.dynamic_form_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dynamic_form_questions TO authenticated;
GRANT ALL ON public.dynamic_form_questions TO service_role;
ALTER TABLE public.dynamic_form_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read questions of published forms" ON public.dynamic_form_questions
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dynamic_forms f
    WHERE f.id = form_id
      AND (f.status = 'published' OR public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  ));

CREATE POLICY "admins manage questions" ON public.dynamic_form_questions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- ============ dynamic_form_conditions ============
CREATE TABLE public.dynamic_form_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.dynamic_forms(id) ON DELETE CASCADE,
  from_question_id uuid NOT NULL REFERENCES public.dynamic_form_questions(id) ON DELETE CASCADE,
  operator text NOT NULL CHECK (operator IN ('equals','not_equals','contains','in','not_in','is_empty','is_not_empty')),
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  action text NOT NULL CHECK (action IN ('skip_to','end_form')),
  target_question_id uuid REFERENCES public.dynamic_form_questions(id) ON DELETE SET NULL,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dynamic_form_conditions_form_idx ON public.dynamic_form_conditions(form_id, from_question_id, priority);

GRANT SELECT ON public.dynamic_form_conditions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dynamic_form_conditions TO authenticated;
GRANT ALL ON public.dynamic_form_conditions TO service_role;
ALTER TABLE public.dynamic_form_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read conditions of published forms" ON public.dynamic_form_conditions
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dynamic_forms f
    WHERE f.id = form_id
      AND (f.status = 'published' OR public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  ));

CREATE POLICY "admins manage conditions" ON public.dynamic_form_conditions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- ============ dynamic_form_leads ============
CREATE TABLE public.dynamic_form_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.dynamic_forms(id) ON DELETE CASCADE,
  answers_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- metadata shape:
  -- { ip, isp, city, region, country, user_agent, referrer, page_url, utm:{...}, gclid, fbclid, started_at, completed_at }
  contact_name text,
  contact_email text,
  contact_phone text,
  whatsapp_user_url text,
  whatsapp_alert_status text DEFAULT 'pending' CHECK (whatsapp_alert_status IN ('pending','sent','failed','disabled')),
  whatsapp_alert_error text,
  whatsapp_alert_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dynamic_form_leads_form_idx ON public.dynamic_form_leads(form_id, created_at DESC);

GRANT INSERT ON public.dynamic_form_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.dynamic_form_leads TO authenticated;
GRANT ALL ON public.dynamic_form_leads TO service_role;
ALTER TABLE public.dynamic_form_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit leads to published forms" ON public.dynamic_form_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dynamic_forms f WHERE f.id = form_id AND f.status = 'published'
  ));

CREATE POLICY "admins read/manage leads" ON public.dynamic_form_leads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- ============ updated_at triggers ============
CREATE TRIGGER dynamic_forms_touch BEFORE UPDATE ON public.dynamic_forms
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
CREATE TRIGGER dynamic_form_questions_touch BEFORE UPDATE ON public.dynamic_form_questions
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
