-- ============================================
-- KLOZET - CONFIGURACIÓN DE REALTIME
-- ============================================
-- Habilita actualizaciones en tiempo real
-- Ejecutar DESPUÉS de messaging.sql si usas mensajería
-- ============================================

-- ============================================
-- 1. REPLICA IDENTITY para DELETE events
-- ============================================
-- Necesario para que realtime funcione con DELETE
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- ============================================
-- 2. AÑADIR TABLAS A REALTIME PUBLICATION
-- ============================================
-- Nota: Estos comandos pueden dar error si ya están añadidas
-- Eso está bien, significa que ya están configuradas

DO $$
BEGIN
  -- Follows
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  -- Messages
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  -- Conversations
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- ============================================
-- 3. VERIFICAR CONFIGURACIÓN
-- ============================================
-- Ejecuta esta query para verificar qué tablas tienen realtime:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- ¡REALTIME CONFIGURADO!
-- ============================================
