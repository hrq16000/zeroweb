UPDATE public.services s
   SET description = st.description,
       seo_description = st.seo_description,
       updated_at = now()
  FROM public._svc_copy_staging st
 WHERE s.slug = st.slug;

DROP TABLE public._svc_copy_staging;