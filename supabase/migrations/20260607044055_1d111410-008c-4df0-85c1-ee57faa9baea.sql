
-- ── profiles: campos usados pelo painel ───────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS email text;

-- helper: admin ou super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_uid) OR public.has_role(_uid, 'admin'::public.app_role);
$$;

-- ── projects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'recebido',
  owner text,
  start_date date,
  due_date date,
  deliverables text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_client_read" ON public.projects FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "projects_admin_write" ON public.projects FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX IF NOT EXISTS projects_client_idx ON public.projects(client_id);

-- ── project_documents ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'arquivo',
  url text,
  file_path text,
  mime_type text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_documents TO authenticated;
GRANT ALL ON public.project_documents TO service_role;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_client_read" ON public.project_documents FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.client_id = auth.uid())
  );
CREATE POLICY "docs_admin_write" ON public.project_documents FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX IF NOT EXISTS docs_project_idx ON public.project_documents(project_id);

-- ── support_tickets ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'aberto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_client_read" ON public.support_tickets FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "tickets_client_insert" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "tickets_update" ON public.support_tickets FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (client_id = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE INDEX IF NOT EXISTS tickets_client_idx ON public.support_tickets(client_id);

-- ── ticket_messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_role text NOT NULL DEFAULT 'client',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tmsg_read" ON public.ticket_messages FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.client_id = auth.uid())
  );
CREATE POLICY "tmsg_insert" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_admin_or_super(auth.uid())
      OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.client_id = auth.uid())
    )
  );
CREATE INDEX IF NOT EXISTS tmsg_ticket_idx ON public.ticket_messages(ticket_id);

-- ── notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_read" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_admin_insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX IF NOT EXISTS notif_user_idx ON public.notifications(user_id, created_at DESC);

-- ── audit_logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
CREATE INDEX IF NOT EXISTS audit_created_idx ON public.audit_logs(created_at DESC);

-- ── updated_at triggers ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_projects_touch ON public.projects;
CREATE TRIGGER trg_projects_touch BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_tickets_touch ON public.support_tickets;
CREATE TRIGGER trg_tickets_touch BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
