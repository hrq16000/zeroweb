
-- Public read for service images (bucket is private but objects readable)
CREATE POLICY "service_images_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'service-images');

CREATE POLICY "service_images_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'service-images'
    AND (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  );

CREATE POLICY "service_images_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'service-images'
    AND (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  );

CREATE POLICY "service_images_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'service-images'
    AND (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  );
