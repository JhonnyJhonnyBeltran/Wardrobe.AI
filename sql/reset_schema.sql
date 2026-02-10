-- ============================================
-- SQL DE RESET COMPLETO (Mantiene usuarios logueados)
-- ============================================

-- 1. LIMPIEZA (Orden inverso a dependencias)
DROP TABLE IF EXISTS public.outfit_items CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.collection_items CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.saves CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.outfits CASCADE;
DROP TABLE IF EXISTS public.clothing_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. RECREACIÓN DE TABLAS
-- ============================================

-- 2.1 USERS (Legacy mirror)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  username TEXT,
  
  -- Estilo y Preferencias
  age_range TEXT,
  gender TEXT,
  height NUMERIC, -- Cambiado a NUMERIC para coincidir con profiles
  height_range TEXT,
  preferred_styles TEXT[],
  uses_accessories BOOLEAN DEFAULT false,
  visual_style_preferences TEXT[],
  style_completed BOOLEAN DEFAULT false,
  
  -- Nuevos campos detectados en TS
  morphology TEXT,
  colorimetry TEXT,
  
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 PROFILES (Social Profile)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  
  -- Info de Estilo (Espejo de users por ahora)
  gender TEXT,
  age_range TEXT,
  height NUMERIC,
  height_range TEXT,
  preferred_styles TEXT[],
  uses_accessories BOOLEAN,
  visual_style_preferences TEXT[],
  style_completed BOOLEAN DEFAULT false,
  
  -- Nuevos campos
  morphology TEXT,
  colorimetry TEXT,
  
  subscription_tier TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2.3 CLOTHING ITEMS
CREATE TABLE public.clothing_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Detalles
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
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) -- Added updated_at
);

-- 2.4 OUTFITS
CREATE TABLE public.outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Changed to public.profiles to fix PostgREST embedding
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasion TEXT,
  season TEXT,
  
  is_public BOOLEAN DEFAULT false,
  favorite BOOLEAN DEFAULT false, -- Added favorite matches TS
  ai_generated BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2.5 OUTFIT_ITEMS (Relación)
CREATE TABLE public.outfit_items (
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items ON DELETE CASCADE NOT NULL,
  
  -- Posicionamiento en Canvas
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  scale NUMERIC DEFAULT 1,
  rotation NUMERIC DEFAULT 0,
  layer_order INTEGER DEFAULT 0,
  
  PRIMARY KEY (outfit_id, clothing_item_id)
);

-- 2.6 POSTS (Social Feed)
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfits,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 FOLLOWS
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- 2.8 LIKES
CREATE TABLE public.likes (
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Constraint: Like a post O a outfit
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND outfit_id IS NULL) OR 
    (post_id IS NULL AND outfit_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id, outfit_id)
);

-- 2.9 COMMENTS
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant1_id UUID REFERENCES auth.users NOT NULL,
  participant2_id UUID REFERENCES auth.users NOT NULL,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Garantizar unicidad de par de participantes (ordenado para evitar duplicados A-B y B-A)
  CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id)
);

-- Indice para búsquedas rápidas de conversaciones de un usuario
CREATE INDEX idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant2_id);

-- 2.11 MESSAGES
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  receiver_id UUID REFERENCES auth.users, -- Added for easier unread queries
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indice para listar mensajes de una conver
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

-- 2.12 SAVES (Guardados)
CREATE TABLE public.saves (
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraint: Save a post OR a outfit
  CONSTRAINT save_target_check CHECK (
    (post_id IS NOT NULL AND outfit_id IS NULL) OR 
    (post_id IS NULL AND outfit_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id, outfit_id)
);

-- 2.13 COLLECTIONS (Carpetas de Guardados)
CREATE TABLE public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT, -- Optional custom cover, otherwise take from first item
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.14 COLLECTION ITEMS (Relación Many-to-Many entre Collections y Posts/Outfits)
CREATE TABLE public.collection_items (
  collection_id UUID REFERENCES public.collections ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraint: Item de collection es Post O Outfit
  CONSTRAINT collection_item_check CHECK (
    (post_id IS NOT NULL AND outfit_id IS NULL) OR 
    (post_id IS NULL AND outfit_id IS NOT NULL)
  ),
  
  -- Evitar duplicados en la misma colección
  UNIQUE (collection_id, post_id, outfit_id)
);

-- ============================================
-- 3. SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Políticas Genéricas (Simplificadas para robustez)

-- USERS
CREATE POLICY "Users view own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- PROFILES
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- CLOTHING
CREATE POLICY "Users view own clothes" ON public.clothing_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own clothes" ON public.clothing_items FOR ALL USING (auth.uid() = user_id);

-- OUTFITS
CREATE POLICY "Users view own outfits" ON public.outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view public outfits" ON public.outfits FOR SELECT USING (is_public = true);
CREATE POLICY "Users manage own outfits" ON public.outfits FOR ALL USING (auth.uid() = user_id);

-- OUTFIT ITEMS
CREATE POLICY "Users view items of visible outfits" ON public.outfit_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_items.outfit_id AND (user_id = auth.uid() OR is_public = true))
);
CREATE POLICY "Users manage own outfit items" ON public.outfit_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_items.outfit_id AND user_id = auth.uid())
);

-- POSTS
CREATE POLICY "Public posts view" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users manage own posts" ON public.posts FOR ALL USING (auth.uid() = user_id);

-- FOLLOWS
CREATE POLICY "Public follows view" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users manage follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- SAVES
CREATE POLICY "Users view own saves" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saves" ON public.saves FOR ALL USING (auth.uid() = user_id);

-- LIKES
CREATE POLICY "Public likes view" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users manage likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "Public comments view" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users manage comments" ON public.comments FOR ALL USING (auth.uid() = user_id);

-- CONVERSATIONS
-- Users can see conversations where they are participant 1 OR 2
CREATE POLICY "Users view own conversations" ON public.conversations 
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Users can insert conversation if they are one of the participants
CREATE POLICY "Users start conversations" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- MESSAGES
-- Users can see messages of conversations they belong to
CREATE POLICY "Users view messages" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Users can send messages to conversations they belong to
CREATE POLICY "Users send messages" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- COLLECTIONS
CREATE POLICY "Users view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);

-- COLLECTION ITEMS
CREATE POLICY "Users view own collection items" ON public.collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_items.collection_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own collection items" ON public.collection_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_items.collection_id AND user_id = auth.uid())
);

-- Function to handle last message update on conversation
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient UUID;
BEGIN
  -- 1. Determine Receiver if not set
  IF NEW.receiver_id IS NULL THEN
    SELECT 
      CASE 
        WHEN participant1_id = NEW.sender_id THEN participant2_id
        ELSE participant1_id
      END INTO recipient
    FROM public.conversations
    WHERE id = NEW.conversation_id;
    
    NEW.receiver_id := recipient;
  END IF;

  -- 2. Update Conversation Timestamp
  UPDATE public.conversations
  SET 
    last_message_text = NEW.content,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger must be BEFORE INSERT to set receiver_id
CREATE TRIGGER on_message_sent_before
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- Drop old trigger if exists (it was AFTER)
DROP TRIGGER IF EXISTS on_message_sent ON public.messages;





-- ============================================
-- 4. TRIGGERS Y FUNCIONES
-- ============================================

-- Function: Handle New User (Sync Auth -> Public)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronización Manual (Para usuarios existentes durante el reset)
-- Esto inserta en profiles/users cualquier auth.user que ya exista pero no tenga perfil
INSERT INTO public.profiles (id, full_name, username, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'name', 'User'), 
  COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, avatar)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', 'User'), 
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
