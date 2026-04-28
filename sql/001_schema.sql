-- ══════════════════════════════════════════════════════════════
-- PORTAFOLIO CMS — Esquema completo para Supabase
-- Ejecutar este script COMPLETO en el SQL Editor de Supabase.
-- ══════════════════════════════════════════════════════════════

-- ─── 1. TABLA: units (4 unidades fijas) ──────────────────────
CREATE TABLE IF NOT EXISTS public.units (
  id          serial       PRIMARY KEY,
  number      smallint     NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 4),
  name        text         NOT NULL,
  color_var   text         NOT NULL DEFAULT 'var(--unit1)',
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- ─── 2. TABLA: weeks (16 semanas fijas) ──────────────────────
CREATE TABLE IF NOT EXISTS public.weeks (
  id           serial       PRIMARY KEY,
  unit_id      int          NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  week_number  smallint     NOT NULL UNIQUE CHECK (week_number BETWEEN 1 AND 16),
  title        text         NOT NULL DEFAULT '',
  summary      text         NOT NULL DEFAULT '',
  description  text         NOT NULL DEFAULT '',
  cover_image  text         NOT NULL DEFAULT '',   -- ruta en Storage o URL
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

-- ─── 3. TABLA: week_activities ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.week_activities (
  id          serial       PRIMARY KEY,
  week_id     int          NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  title       text         NOT NULL DEFAULT '',
  description text         NOT NULL DEFAULT '',
  sort_order  smallint     NOT NULL DEFAULT 0,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- ─── 4. TABLA: week_assets (archivos: pdf, word, zip, image) ─
CREATE TABLE IF NOT EXISTS public.week_assets (
  id            serial       PRIMARY KEY,
  week_id       int          NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  file_name     text         NOT NULL,
  storage_path  text         NOT NULL,               -- ruta dentro del bucket
  file_type     text         NOT NULL DEFAULT 'other' CHECK (file_type IN ('image','pdf','word','zip','other')),
  file_size     bigint       NOT NULL DEFAULT 0,
  display_name  text         NOT NULL DEFAULT '',     -- nombre visible al usuario
  sort_order    smallint     NOT NULL DEFAULT 0,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

-- ─── 5. TABLA: week_videos (YouTube embeds) ──────────────────
CREATE TABLE IF NOT EXISTS public.week_videos (
  id          serial       PRIMARY KEY,
  week_id     int          NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  url         text         NOT NULL,
  title       text         NOT NULL DEFAULT '',
  sort_order  smallint     NOT NULL DEFAULT 0,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- ─── 6. TABLA: week_links (enlaces externos) ─────────────────
CREATE TABLE IF NOT EXISTS public.week_links (
  id          serial       PRIMARY KEY,
  week_id     int          NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  url         text         NOT NULL,
  label       text         NOT NULL DEFAULT '',
  sort_order  smallint     NOT NULL DEFAULT 0,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- ─── 7. Trigger: actualizar updated_at automáticamente ───────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_weeks_updated_at ON public.weeks;
CREATE TRIGGER set_weeks_updated_at
  BEFORE UPDATE ON public.weeks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════
-- DATOS SEMILLA
-- ══════════════════════════════════════════════════════════════

-- Unidades (4 fijas)
INSERT INTO public.units (number, name, color_var) VALUES
  (1, 'Unidad 1 — Fundamentos',     'var(--unit1)'),
  (2, 'Unidad 2 — Patrones',        'var(--unit2)'),
  (3, 'Unidad 3 — Diseño',          'var(--unit3)'),
  (4, 'Unidad 4 — Proyecto Final',  'var(--unit4)')
ON CONFLICT (number) DO NOTHING;

-- Semanas (16 fijas, vacías por defecto)
INSERT INTO public.weeks (unit_id, week_number, title, summary, description) VALUES
  ((SELECT id FROM public.units WHERE number = 1),  1, 'Semana 01 - Resumen de Arquitectura de Software', 'Presentación del curso, concepto de arquitectura de software y su importancia en el desarrollo.', 'Presentación del curso, objetivos y metodología. Concepto de arquitectura de software: qué es, por qué importa y cómo se diferencia del diseño.'),
  ((SELECT id FROM public.units WHERE number = 1),  2, 'Semana 02 - Importancia de los estándares en la arquitectura de software', 'Normas internacionales, modelos de calidad y buenas prácticas aplicadas a arquitectura de software.', 'Importancia de los estándares en arquitectura de software: normas internacionales, modelos de calidad, procesos y buenas prácticas en desarrollo.'),
  ((SELECT id FROM public.units WHERE number = 1),  3, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 1),  4, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 2),  5, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 2),  6, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 2),  7, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 2),  8, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 3),  9, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 3), 10, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 3), 11, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 3), 12, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 4), 13, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 4), 14, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 4), 15, '', '', ''),
  ((SELECT id FROM public.units WHERE number = 4), 16, '', '', '')
ON CONFLICT (week_number) DO NOTHING;
