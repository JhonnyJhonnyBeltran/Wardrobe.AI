-- ============================================
-- HABILITAR REALTIME PARA LA TABLA FOLLOWS
-- ============================================
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Habilitar replicación completa para DELETE events
ALTER TABLE follows REPLICA IDENTITY FULL;

-- 2. Añadir la tabla a la publicación de realtime
-- (Si ya existe, esto puede dar error, lo cual está bien)
ALTER PUBLICATION supabase_realtime ADD TABLE follows;

-- 3. Verificar que está habilitado
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
