-- ══════════════════════════════════════════════════════════════
-- Migración de contenido existente (semanas 1-3) a Supabase
-- Ejecutar DESPUÉS de 001_schema.sql y 002_rls.sql
-- ══════════════════════════════════════════════════════════════

-- ─── Semana 1: Assets ────────────────────────────────────────
INSERT INTO public.week_assets (week_id, file_name, storage_path, file_type, display_name, sort_order)
VALUES
  ((SELECT id FROM public.weeks WHERE week_number = 1),
   'Sem01_Arquitectura_de_Software_Resumen.pdf',
   '../assets/archivos/Sem01_Arquitectura_de_Software_Resumen.pdf',
   'pdf', 'Resumen de Arquitectura de Software.pdf', 1),

  ((SELECT id FROM public.weeks WHERE week_number = 1),
   'Sem01_Arquitectura_de_Software_Resumen.docx',
   '../assets/archivos/Sem01_Arquitectura_de_Software_Resumen.docx',
   'word', 'Resumen de Arquitectura de Software.docx', 2);

-- ─── Semana 2: Assets ────────────────────────────────────────
INSERT INTO public.week_assets (week_id, file_name, storage_path, file_type, display_name, sort_order)
VALUES
  ((SELECT id FROM public.weeks WHERE week_number = 2),
   'Sem02_ERS_IEEE830_SISEXP_UPLA.pdf',
   '../assets/archivos/Sem02_ERS_IEEE830_SISEXP_UPLA.pdf',
   'pdf', 'ERS IEEE 830 — SISEXP UPLA.pdf', 1),

  ((SELECT id FROM public.weeks WHERE week_number = 2),
   'Sem02_ERS_IEEE830_SISEXP_UPLA.docx',
   '../assets/archivos/Sem02_ERS_IEEE830_SISEXP_UPLA.docx',
   'word', 'ERS IEEE 830 — SISEXP UPLA.docx', 2),

  ((SELECT id FROM public.weeks WHERE week_number = 2),
   'Sem02_imagen_portada.png',
   '../assets/images/Sem02_imagen_portada.png',
   'image', 'Portada Semana 2', 3),

  ((SELECT id FROM public.weeks WHERE week_number = 2),
   'sem02_01.png',
   '../assets/images/sem02_01.png',
   'image', 'Estándares de arquitectura', 4),

  ((SELECT id FROM public.weeks WHERE week_number = 2),
   'sem02_02.png',
   '../assets/images/sem02_02.png',
   'image', 'Modelos de calidad', 5);

-- ─── Semana 3: Actualizar título y descripción ──────────────
UPDATE public.weeks SET
  title = 'Semana 03 - Diseño del Sistema (SDD)',
  summary = 'Documento de diseño del sistema, mapas conceptuales y diagramas de arquitectura de software.',
  description = 'Elaboración del documento SDD (Software Design Document), mapas conceptuales y diagramas de arquitectura de software.'
WHERE week_number = 3;

-- ─── Semana 3: Assets ────────────────────────────────────────
INSERT INTO public.week_assets (week_id, file_name, storage_path, file_type, display_name, sort_order)
VALUES
  ((SELECT id FROM public.weeks WHERE week_number = 3),
   'Sem03_1777402809247-SDD_dise_o_del_sistema.pdf',
   '../assets/archivos/Sem03_1777402809247-SDD_dise_o_del_sistema.pdf',
   'pdf', 'SDD — Diseño del Sistema.pdf', 1),

  ((SELECT id FROM public.weeks WHERE week_number = 3),
   'Sem03_1777402815831-SDD_dise_o_del_sistema.docx',
   '../assets/archivos/Sem03_1777402815831-SDD_dise_o_del_sistema.docx',
   'word', 'SDD — Diseño del Sistema.docx', 2),

  ((SELECT id FROM public.weeks WHERE week_number = 3),
   'Sem03_mapa_1.jpg',
   '../assets/images/Sem03_mapa_1.jpg',
   'image', 'Mapa conceptual 1', 3),

  ((SELECT id FROM public.weeks WHERE week_number = 3),
   'Sem03_mapa_2.png',
   '../assets/images/Sem03_mapa_2.png',
   'image', 'Mapa conceptual 2', 4);
