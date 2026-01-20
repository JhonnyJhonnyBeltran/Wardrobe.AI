-- Wardrobe.AI Database Schema
-- Copia y pega este SQL en el SQL Editor de Supabase

-- ============================================
-- PASO 1: Habilitar extensiones necesarias
-- ============================================

-- UUID para IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PASO 2: Crear tabla de usuarios (extiende auth.users)
-- ============================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar TEXT,
    
    -- Perfil de estilo
    age_range TEXT,
    gender TEXT,
    height INTEGER,
    height_range TEXT,
    preferred_styles TEXT[],
    uses_accessories BOOLEAN DEFAULT false,
    visual_style_preferences TEXT[],
    style_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por estilo completado
CREATE INDEX idx_users_style_completed ON public.users(style_completed);

-- Comentarios para documentación
COMMENT ON COLUMN public.users.age_range IS 'Rango de edad del usuario (18-24, 25-34, 35-44, 45-54, 55+)';
COMMENT ON COLUMN public.users.gender IS 'Género (hombre, mujer, no-binario, prefiero no decir)';
COMMENT ON COLUMN public.users.height IS 'Altura en centímetros';
COMMENT ON COLUMN public.users.height_range IS 'Rango de altura (bajo, medio, alto)';
COMMENT ON COLUMN public.users.preferred_styles IS 'Estilos preferidos (casual, elegante, deportivo, etc)';
COMMENT ON COLUMN public.users.uses_accessories IS 'Si le gustan los accesorios';
COMMENT ON COLUMN public.users.visual_style_preferences IS 'Preferencias visuales (minimalista, colorido, etc)';
COMMENT ON COLUMN public.users.style_completed IS 'Si completó el cuestionario de estilo';

-- RLS (Row Level Security) para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- PASO 3: Crear tabla de prendas (clothing_items)
-- ============================================

CREATE TABLE public.clothing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT NOT NULL,
    image_url TEXT,
    season TEXT[] NOT NULL DEFAULT '{}',
    brand TEXT,
    tags TEXT[] DEFAULT '{}',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_clothing_items_user_id ON public.clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON public.clothing_items(category);
CREATE INDEX idx_clothing_items_favorite ON public.clothing_items(user_id, favorite);

-- RLS para clothing_items
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items"
    ON public.clothing_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
    ON public.clothing_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
    ON public.clothing_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
    ON public.clothing_items FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- PASO 4: Crear tabla de outfits
-- ============================================

CREATE TABLE public.outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    items UUID[] NOT NULL DEFAULT '{}', -- Array de IDs de clothing_items
    season TEXT,
    occasion TEXT,
    favorite BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- Si el outfit es público para el feed social
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX idx_outfits_favorite ON public.outfits(user_id, favorite);

-- RLS para outfits
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits"
    ON public.outfits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
    ON public.outfits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits"
    ON public.outfits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
    ON public.outfits FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- PASO 5: Función para actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.clothing_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.outfits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PASO 6: Función para crear perfil automáticamente al registrarse
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automático
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASO 7: Storage bucket para imágenes
-- ============================================
-- NOTA: Esto se hace desde la interfaz de Supabase:
-- 1. Ve a Storage
-- 2. Crea un bucket llamado "clothing-images"
-- 3. Marca como "Public bucket" para acceso directo a imágenes
-- 4. Configura políticas:
--    - Allow users to upload their own images
--    - Allow public read access

-- ============================================
-- ¡Listo! Tu base de datos está configurada
-- ============================================
