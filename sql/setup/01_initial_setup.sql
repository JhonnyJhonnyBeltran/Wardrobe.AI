-- ============================================
-- KLOZET - CONFIGURACIÓN INICIAL DE BASE DE DATOS
-- ============================================
-- Este script configura todas las tablas principales
-- Ejecutar PRIMERO en Supabase SQL Editor
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA USERS (Legacy - para compatibilidad)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
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
  subscription_tier TEXT DEFAULT 'free',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. TABLA PROFILES (Social/Nueva)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  
  -- Perfil de estilo (duplicado para acceso social)
  gender TEXT,
  age_range TEXT,
  height NUMERIC,
  height_range TEXT,
  preferred_styles TEXT[],
  uses_accessories BOOLEAN,
  visual_style_preferences TEXT[],
  style_completed BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  
  updated_at TIMESTAMPTZ,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 3. TABLA CLOTHING_ITEMS (Prendas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.clothing_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  color_hex TEXT,
  image_url TEXT,
  original_image_url TEXT,
  brand TEXT,
  size TEXT,
  fabric TEXT,
  reference TEXT,
  source_url TEXT,
  season TEXT[],
  tags TEXT[],
  favorite BOOLEAN DEFAULT false,
  is_ai_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para clothing_items
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON public.clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON public.clothing_items(category);

-- RLS para clothing_items
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clothing items" ON public.clothing_items;
CREATE POLICY "Users can view own clothing items" ON public.clothing_items 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clothing items" ON public.clothing_items;
CREATE POLICY "Users can insert own clothing items" ON public.clothing_items 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clothing items" ON public.clothing_items;
CREATE POLICY "Users can update own clothing items" ON public.clothing_items 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clothing items" ON public.clothing_items;
CREATE POLICY "Users can delete own clothing items" ON public.clothing_items 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. TABLA OUTFITS
-- ============================================
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasion TEXT,
  season TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para outfits
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_public ON public.outfits(is_public) WHERE is_public = true;

-- RLS para outfits
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own outfits" ON public.outfits;
CREATE POLICY "Users can view own outfits" ON public.outfits 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public outfits" ON public.outfits;
CREATE POLICY "Users can view public outfits" ON public.outfits 
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert own outfits" ON public.outfits;
CREATE POLICY "Users can insert own outfits" ON public.outfits 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own outfits" ON public.outfits;
CREATE POLICY "Users can update own outfits" ON public.outfits 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own outfits" ON public.outfits;
CREATE POLICY "Users can delete own outfits" ON public.outfits 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. TABLA OUTFIT_ITEMS (Junction)
-- ============================================
CREATE TABLE IF NOT EXISTS public.outfit_items (
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items ON DELETE CASCADE NOT NULL,
  position_x NUMERIC,
  position_y NUMERIC,
  scale NUMERIC,
  rotation NUMERIC,
  layer_order INTEGER,
  PRIMARY KEY (outfit_id, clothing_item_id)
);

ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. TABLA POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfits,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts" ON public.posts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. TABLA FOLLOWS
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- RLS para follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public follows are visible" ON public.follows;
CREATE POLICY "Public follows are visible" ON public.follows 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create follow requests" ON public.follows;
CREATE POLICY "Users can create follow requests" ON public.follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete follows" ON public.follows;
CREATE POLICY "Users can delete follows" ON public.follows 
  FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

DROP POLICY IF EXISTS "Users can update follow status" ON public.follows;
CREATE POLICY "Users can update follow status" ON public.follows 
  FOR UPDATE USING (auth.uid() = following_id);

-- ============================================
-- 8. TABLA LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, post_id, outfit_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. TABLA COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. TRIGGER: Crear usuario al registrarse
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles (New Social Table)
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into users (Legacy Table - Keeping for compatibility)
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 11. FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- 12. FUNCIÓN: Verificar existencia de email (RPC)
-- ============================================
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Permite ejecutar con privilegios de sistema para leer users
AS $$
BEGIN
  -- Verifica si existe el email en la tabla public.users
  RETURN EXISTS (SELECT 1 FROM public.users WHERE email = email_to_check);
END;
$$;

-- Permitir invocación pública de la función
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated;

-- ============================================
-- ¡SETUP INICIAL COMPLETADO!
-- ============================================
