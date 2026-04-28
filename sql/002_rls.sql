-- ══════════════════════════════════════════════════════════════
-- PORTAFOLIO CMS — Políticas RLS (Row Level Security)
-- Ejecutar DESPUÉS de 001_schema.sql
-- ══════════════════════════════════════════════════════════════

-- ─── Función helper: verificar si el usuario actual es admin ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════
-- Activar RLS en todas las tablas
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_assets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_videos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_links      ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════════════════════════════

-- Cualquiera puede leer perfiles (necesario para verificar roles)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════
-- UNITS (solo lectura pública, admin puede modificar)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "units_select_public"
  ON public.units FOR SELECT
  USING (true);

CREATE POLICY "units_admin_all"
  ON public.units FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- WEEKS (lectura pública, admin puede modificar)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "weeks_select_public"
  ON public.weeks FOR SELECT
  USING (true);

CREATE POLICY "weeks_admin_insert"
  ON public.weeks FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "weeks_admin_update"
  ON public.weeks FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "weeks_admin_delete"
  ON public.weeks FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- WEEK_ACTIVITIES (lectura pública, admin puede modificar)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "activities_select_public"
  ON public.week_activities FOR SELECT
  USING (true);

CREATE POLICY "activities_admin_insert"
  ON public.week_activities FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "activities_admin_update"
  ON public.week_activities FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "activities_admin_delete"
  ON public.week_activities FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- WEEK_ASSETS (lectura pública, admin puede modificar)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "assets_select_public"
  ON public.week_assets FOR SELECT
  USING (true);

CREATE POLICY "assets_admin_insert"
  ON public.week_assets FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "assets_admin_update"
  ON public.week_assets FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "assets_admin_delete"
  ON public.week_assets FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- WEEK_VIDEOS (lectura pública, admin puede modificar)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "videos_select_public"
  ON public.week_videos FOR SELECT
  USING (true);

CREATE POLICY "videos_admin_insert"
  ON public.week_videos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "videos_admin_update"
  ON public.week_videos FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "videos_admin_delete"
  ON public.week_videos FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- WEEK_LINKS (lectura pública, admin puede modificar)
-- ══════════════════════════════════════════════════════════════

CREATE POLICY "links_select_public"
  ON public.week_links FOR SELECT
  USING (true);

CREATE POLICY "links_admin_insert"
  ON public.week_links FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "links_admin_update"
  ON public.week_links FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "links_admin_delete"
  ON public.week_links FOR DELETE
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
-- STORAGE: Políticas para el bucket 'course-assets'
-- ══════════════════════════════════════════════════════════════

-- Lectura pública de archivos (el bucket ya es público)
CREATE POLICY "storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-assets');

-- Solo admin puede subir archivos
CREATE POLICY "storage_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-assets'
    AND public.is_admin()
  );

-- Solo admin puede actualizar archivos
CREATE POLICY "storage_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course-assets'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'course-assets'
    AND public.is_admin()
  );

-- Solo admin puede eliminar archivos
CREATE POLICY "storage_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-assets'
    AND public.is_admin()
  );
