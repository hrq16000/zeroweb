
-- Restrict partner_links reads: drop public policy, add owner/admin read policy.
DROP POLICY IF EXISTS partner_links_read_all ON public.partner_links;

CREATE POLICY partner_links_owner_read
ON public.partner_links
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.id = partner_links.partner_id
      AND (
        p.user_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.is_super_admin(auth.uid())
      )
  )
);

-- Harden function: pin search_path.
CREATE OR REPLACE FUNCTION public.normalize_phone(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $function$
  SELECT NULLIF(regexp_replace(COALESCE(p,''), '\D', '', 'g'), '')
$function$;
