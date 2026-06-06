-- Companies: hide CNPJ from the public Data API while keeping the rest of
-- the active-company row readable. Telefone/WhatsApp/email stay public per
-- operator decision.
REVOKE SELECT (cnpj) ON public.companies FROM anon;
REVOKE SELECT (cnpj) ON public.companies FROM authenticated;
GRANT SELECT (cnpj) ON public.companies TO service_role;

-- Reviews: hide reviewer email from any browser caller. Admin/server code
-- still reads it via service_role.
REVOKE SELECT (author_email) ON public.reviews FROM anon;
REVOKE SELECT (author_email) ON public.reviews FROM authenticated;
GRANT SELECT (author_email) ON public.reviews TO service_role;
