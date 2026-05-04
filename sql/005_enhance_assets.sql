-- ══════════════════════════════════════════════════════════════
-- MEJORA: Columnas document_group y description en week_assets
-- ══════════════════════════════════════════════════════════════

-- document_group: agrupa múltiples archivos como un "documento".
-- Todos los assets con el mismo document_group para un week_id
-- pertenecen al mismo documento. El valor es el título del documento.
ALTER TABLE public.week_assets ADD COLUMN IF NOT EXISTS document_group text DEFAULT NULL;

-- description: descripción individual del asset (para imágenes)
-- o descripción del documento (en el primer asset del grupo).
ALTER TABLE public.week_assets ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

-- ── Migrar datos existentes: agrupar archivos de semanas 1-3 ──

-- Semana 1: agrupar PDF + DOCX como un documento
UPDATE public.week_assets
SET document_group = 'Resumen de Arquitectura de Software',
    description = 'Documento de resumen elaborado durante la primera semana del curso.'
WHERE file_name LIKE 'Sem01%' AND file_type IN ('pdf','word') AND description = '';

-- Semana 2: agrupar PDF + DOCX como un documento
UPDATE public.week_assets
SET document_group = 'ERS IEEE 830 — SISEXP UPLA',
    description = 'Especificación de requisitos de software siguiendo el estándar IEEE 830.'
WHERE file_name LIKE 'Sem02%' AND file_type IN ('pdf','word') AND description = '';

-- Semana 2: agregar descripciones a imágenes
UPDATE public.week_assets SET description = 'Portada de la semana 2'
WHERE file_name = 'Sem02_imagen_portada.png' AND description = '';
UPDATE public.week_assets SET description = 'Principales normas internacionales en arquitectura de software'
WHERE file_name = 'sem02_01.png' AND description = '';
UPDATE public.week_assets SET description = 'Modelos, procesos y buenas prácticas en desarrollo'
WHERE file_name = 'sem02_02.png' AND description = '';

-- Semana 3: agrupar PDF + DOCX como un documento
UPDATE public.week_assets
SET document_group = 'SDD — Diseño del Sistema',
    description = 'Documento de diseño del sistema (Software Design Document).'
WHERE file_name LIKE 'Sem03%' AND file_type IN ('pdf','word') AND description = '';

-- Semana 3: agregar descripciones a imágenes
UPDATE public.week_assets SET description = 'Mapa conceptual 1 — Fundamentos de diseño'
WHERE file_name = 'Sem03_mapa_1.jpg' AND description = '';
UPDATE public.week_assets SET description = 'Mapa conceptual 2 — Estructura del sistema'
WHERE file_name = 'Sem03_mapa_2.png' AND description = '';
