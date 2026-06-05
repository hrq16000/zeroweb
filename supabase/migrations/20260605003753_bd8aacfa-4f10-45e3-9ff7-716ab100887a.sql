
-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','cliente','prestador','empresa','parceiro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE POLICY "admins manage user_roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  phone text,
  slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles own write" ON public.profiles FOR ALL TO authenticated USING (auth.uid()=id) WITH CHECK (auth.uid()=id);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.mk_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.mk_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mk_categories TO anon, authenticated;
GRANT ALL ON public.mk_categories TO service_role;
ALTER TABLE public.mk_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.mk_categories FOR SELECT USING (active = true);
CREATE POLICY "admins manage categories" ON public.mk_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SPECIALTIES
CREATE TABLE IF NOT EXISTS public.mk_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.mk_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mk_specialties TO anon, authenticated;
GRANT ALL ON public.mk_specialties TO service_role;
ALTER TABLE public.mk_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "specialties public read" ON public.mk_specialties FOR SELECT USING (true);
CREATE POLICY "admins manage specialties" ON public.mk_specialties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PROVIDERS
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  headline text,
  bio text,
  avatar_url text,
  cover_url text,
  phone text,
  whatsapp text,
  email text,
  city text,
  state text,
  service_regions text[] NOT NULL DEFAULT '{}',
  specialties text[] NOT NULL DEFAULT '{}',
  social jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending', -- pending|active|suspended|blocked
  verified boolean NOT NULL DEFAULT false,
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  views_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.providers TO anon, authenticated;
GRANT INSERT, UPDATE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers public read active" ON public.providers FOR SELECT USING (status = 'active');
CREATE POLICY "providers owner read" ON public.providers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "providers owner write" ON public.providers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "providers admin all" ON public.providers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_providers_state_city ON public.providers(state, city);
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_regions ON public.providers USING gin(service_regions);
CREATE INDEX IF NOT EXISTS idx_providers_specialties ON public.providers USING gin(specialties);

-- COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  trade_name text NOT NULL,
  legal_name text,
  cnpj text,
  logo_url text,
  cover_url text,
  description text,
  phone text,
  whatsapp text,
  email text,
  website text,
  city text,
  state text,
  service_regions text[] NOT NULL DEFAULT '{}',
  categories text[] NOT NULL DEFAULT '{}',
  social jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  views_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon, authenticated;
GRANT INSERT, UPDATE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies public read active" ON public.companies FOR SELECT USING (status='active');
CREATE POLICY "companies owner read" ON public.companies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "companies owner write" ON public.companies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "companies admin all" ON public.companies FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_companies_state_city ON public.companies(state, city);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_regions ON public.companies USING gin(service_regions);

-- N:N category links
CREATE TABLE IF NOT EXISTS public.provider_categories (
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.mk_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, category_id)
);
GRANT SELECT ON public.provider_categories TO anon, authenticated;
GRANT INSERT, DELETE ON public.provider_categories TO authenticated;
GRANT ALL ON public.provider_categories TO service_role;
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc public read" ON public.provider_categories FOR SELECT USING (true);
CREATE POLICY "pc owner write" ON public.provider_categories FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.providers p WHERE p.id=provider_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.providers p WHERE p.id=provider_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE TABLE IF NOT EXISTS public.company_categories (
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.mk_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, category_id)
);
GRANT SELECT ON public.company_categories TO anon, authenticated;
GRANT INSERT, DELETE ON public.company_categories TO authenticated;
GRANT ALL ON public.company_categories TO service_role;
ALTER TABLE public.company_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc public read" ON public.company_categories FOR SELECT USING (true);
CREATE POLICY "cc owner write" ON public.company_categories FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.companies c WHERE c.id=company_id AND (c.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.companies c WHERE c.id=company_id AND (c.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- PORTFOLIO
CREATE TABLE IF NOT EXISTS public.provider_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_portfolio TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.provider_portfolio TO authenticated;
GRANT ALL ON public.provider_portfolio TO service_role;
ALTER TABLE public.provider_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio public read" ON public.provider_portfolio FOR SELECT USING (true);
CREATE POLICY "portfolio owner write" ON public.provider_portfolio FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.providers p WHERE p.id=provider_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.providers p WHERE p.id=provider_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('provider','company')),
  target_id uuid NOT NULL,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  author_email text,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  status text NOT NULL DEFAULT 'pending', -- pending|approved|rejected
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT ON public.reviews TO anon, authenticated;
GRANT UPDATE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public approved read" ON public.reviews FOR SELECT USING (status='approved');
CREATE POLICY "reviews author read" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = author_user_id);
CREATE POLICY "reviews insert any" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews admin all" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_type, target_id);

-- SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_email text,
  requester_phone text,
  title text NOT NULL,
  description text,
  category_slug text,
  city text,
  state text,
  budget_range text,
  status text NOT NULL DEFAULT 'open', -- open|distributed|in_progress|closed|cancelled
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.service_requests TO authenticated;
GRANT INSERT ON public.service_requests TO anon;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests requester read" ON public.service_requests FOR SELECT TO authenticated USING (auth.uid() = requester_user_id);
CREATE POLICY "requests insert any" ON public.service_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests admin all" ON public.service_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_location ON public.service_requests(state, city);

-- REQUEST DISTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.request_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('provider','company')),
  target_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending|accepted|declined|expired
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.request_distributions TO authenticated;
GRANT ALL ON public.request_distributions TO service_role;
ALTER TABLE public.request_distributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dist target read provider" ON public.request_distributions FOR SELECT TO authenticated USING (
  (target_type='provider' AND EXISTS(SELECT 1 FROM public.providers p WHERE p.id=target_id AND p.user_id=auth.uid()))
  OR (target_type='company' AND EXISTS(SELECT 1 FROM public.companies c WHERE c.id=target_id AND c.user_id=auth.uid()))
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "dist admin write" ON public.request_distributions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "dist target update" ON public.request_distributions FOR UPDATE TO authenticated USING (
  (target_type='provider' AND EXISTS(SELECT 1 FROM public.providers p WHERE p.id=target_id AND p.user_id=auth.uid()))
  OR (target_type='company' AND EXISTS(SELECT 1 FROM public.companies c WHERE c.id=target_id AND c.user_id=auth.uid()))
);

-- MODERATION
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL, -- provider|company|review|request
  target_id uuid NOT NULL,
  action text NOT NULL,      -- approve|suspend|block|verify|unverify|reject|reopen
  reason text,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.moderation_actions TO authenticated;
GRANT ALL ON public.moderation_actions TO service_role;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moderation admin all" ON public.moderation_actions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SETTINGS
CREATE TABLE IF NOT EXISTS public.marketplace_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  distribution_mode text NOT NULL DEFAULT 'manual', -- manual|auto_region|auto_category|round_robin
  auto_distribute_limit int NOT NULL DEFAULT 3,
  rr_pointer int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketplace_settings TO authenticated;
GRANT ALL ON public.marketplace_settings TO service_role;
ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings admin all" ON public.marketplace_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.marketplace_settings(singleton) VALUES(true) ON CONFLICT DO NOTHING;

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.mk_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_providers_updated ON public.providers;
CREATE TRIGGER trg_providers_updated BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
DROP TRIGGER IF EXISTS trg_companies_updated ON public.companies;
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
DROP TRIGGER IF EXISTS trg_requests_updated ON public.service_requests;
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
DROP TRIGGER IF EXISTS trg_reviews_updated ON public.reviews;
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- Rating recompute trigger
CREATE OR REPLACE FUNCTION public.mk_recompute_rating() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE t_type text; t_id uuid; avg_r numeric; cnt int;
BEGIN
  t_type := COALESCE(NEW.target_type, OLD.target_type);
  t_id := COALESCE(NEW.target_id, OLD.target_id);
  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO avg_r, cnt FROM public.reviews WHERE target_type=t_type AND target_id=t_id AND status='approved';
  IF t_type='provider' THEN
    UPDATE public.providers SET rating_avg=ROUND(avg_r,2), rating_count=cnt WHERE id=t_id;
  ELSE
    UPDATE public.companies SET rating_avg=ROUND(avg_r,2), rating_count=cnt WHERE id=t_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_reviews_recompute ON public.reviews;
CREATE TRIGGER trg_reviews_recompute AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.mk_recompute_rating();

-- Seed categories
INSERT INTO public.mk_categories(name, slug, description, sort_order) VALUES
  ('Criação de Sites','criacao-de-sites','Sites institucionais, landing pages e e-commerce',10),
  ('Google Meu Negócio','google-meu-negocio','Otimização de perfil Google',20),
  ('Tráfego Pago','trafego-pago','Google Ads, Meta Ads e campanhas',30),
  ('SEO','seo','Otimização para mecanismos de busca',40),
  ('Automação','automacao','Automação de processos e WhatsApp',50),
  ('Desenvolvimento','desenvolvimento','Aplicativos e sistemas sob medida',60)
ON CONFLICT (slug) DO NOTHING;
