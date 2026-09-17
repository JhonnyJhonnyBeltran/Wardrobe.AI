-- ==============================================================================
-- KLOZET - SCRIPT DEFINITIVO DE SINCRONIZACIÓN DE COLUMNAS PARA TABLA PROFILES
-- ==============================================================================
-- Ejecuta este script en el SQL Editor del panel de Supabase para asegurar que
-- todas las columnas requeridas por el frontend existan y la caché de PostgREST
-- se recargue inmediatamente.
-- ==============================================================================

-- 1. Crear la tabla si no existe (con clave foránea a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Asegurar todas las columnas de Onboarding, Estilo y Preferencias
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_range TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_styles TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uses_accessories BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accessories_style TEXT DEFAULT 'ninguno';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visual_style_preferences TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS style_completed BOOLEAN DEFAULT false;

-- 3. Morfología, Colorimetría y Características Físicas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS morphology TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS colorimetry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hair_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skin_tone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS body_shape TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_colors TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occasions_preferences TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- 4. Fotos de Referencia Física (3 Rostro + 3 Cuerpo)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS face_photos TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS body_photos TEXT[] DEFAULT '{}'::TEXT[];

-- 5. Suscripción Stripe & Kloe Pro
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 6. Contador de Mensajes de Prueba con Kloe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kloe_trial_messages_used INT DEFAULT 0;

-- 7. Preferencias de Notificaciones & Timestamps de Actividad
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"likes": true, "comments": true, "follows": true, "followers": true, "messages": true, "reminders": true, "popupToasts": true, "email": false}'::JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_viewed_activity TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. Habilitar RLS y Políticas de Seguridad
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- 9. RECARGAR CACHÉ DE ESQUEMA EN POSTGREST (Obligatorio para eliminar errores PGRST204)
NOTIFY pgrst, 'reload schema';
