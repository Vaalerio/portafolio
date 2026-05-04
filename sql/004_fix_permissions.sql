-- ══════════════════════════════════════════════════════════════
-- FIX: Permisos de esquema para roles anon y authenticated
-- ──────────────────────────────────────────────────────────────
-- Error: "permission denied for schema public"
-- Causa: los roles anon/authenticated no tienen USAGE en el esquema.
-- Ejecutar en Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════

-- 1. Dar acceso al esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Lectura pública (anon) en todas las tablas existentes
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Acceso completo para usuarios autenticados
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- 4. Acceso a secuencias (necesario para INSERT con serial PKs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Aplicar los mismos permisos a tablas/secuencias futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
