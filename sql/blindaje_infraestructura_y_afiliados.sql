-- ==============================================================================
-- KLOZET / WARDROBE.AI - BLINDAJE DE INFRAESTRUCTURA, CACHÉ IA Y AFILIADOS
-- Archivo: sql/blindaje_infraestructura_y_afiliados.sql
--
-- Objetivos:
-- 1. Tabla de Caché Multimodal de IA (Zero-Cost Gemini Cache con SHA-256).
-- 2. Cuotas persistentes de IA en perfiles de usuario (evita reseteos en serverless).
-- 3. Campos para modelo de negocio de Afiliados (Shop the Look / Venta comisionada).
-- ==============================================================================

BEGIN;

-- 1. TABLA DE CACHÉ DE ANÁLISIS DE IMÁGENES POR IA
CREATE TABLE IF NOT EXISTS public.ai_image_cache (
  image_hash TEXT PRIMARY KEY,
  category TEXT,
  name TEXT,
  brand TEXT,
  color TEXT,
  color_hex TEXT,
  fabric TEXT,
  season TEXT,
  is_inappropriate BOOLEAN DEFAULT false,
  raw_analysis JSONB NOT NULL,
  hits_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en la tabla de caché
ALTER TABLE public.ai_image_cache ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_cache' AND policyname = 'Allow read for all authenticated users'
  ) THEN
    CREATE POLICY "Allow read for all authenticated users" 
      ON public.ai_image_cache 
      FOR SELECT 
      TO authenticated, service_role 
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_cache' AND policyname = 'Allow insert for authenticated and service_role'
  ) THEN
    CREATE POLICY "Allow insert for authenticated and service_role" 
      ON public.ai_image_cache 
      FOR INSERT 
      TO authenticated, service_role 
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_cache' AND policyname = 'Allow update hit count'
  ) THEN
    CREATE POLICY "Allow update hit count" 
      ON public.ai_image_cache 
      FOR UPDATE 
      TO authenticated, service_role 
      USING (true);
  END IF;
END $$;

-- 2. CUOTAS DE IA PERSISTENTES EN TABLA PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_daily_usage_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_daily_usage_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_lifetime_items_analyzed INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_lifetime_chats INTEGER DEFAULT 0;

-- 3. CAMPOS DE MONETIZACIÓN Y ENLACES DE AFILIADOS (SHOP THE LOOK)
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS brand_domain TEXT;
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS purchase_price NUMERIC;
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS has_affiliate_links BOOLEAN DEFAULT false;

-- 4. RECARGA DE CACHÉ DE POSTGREST
NOTIFY pgrst, 'reload schema';

COMMIT;
