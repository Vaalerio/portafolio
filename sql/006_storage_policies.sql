-- ══════════════════════════════════════════════════════════════
-- FIX: Políticas de Storage para el bucket course-assets
-- ══════════════════════════════════════════════════════════════
-- Sin estas políticas, los usuarios autenticados no pueden
-- subir ni eliminar archivos aunque el bucket sea público.
-- Ejecutar en Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════

-- Lectura pública (cualquiera puede descargar/ver archivos)
CREATE POLICY "course_assets_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'course-assets');

-- Upload solo para usuarios autenticados
CREATE POLICY "course_assets_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-assets');

-- Update solo para usuarios autenticados
CREATE POLICY "course_assets_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-assets');

-- Delete solo para usuarios autenticados
CREATE POLICY "course_assets_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-assets');
