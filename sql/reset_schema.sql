-- ============================================
-- SQL DE RESET COMPLETO KLOZET
-- Mantiene usuarios logueados, añade funcionalidades sociales
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 0. LIMPIEZA DE OBJETOS EXISTENTES (Políticas, Triggers, Funciones)
-- ============================================

-- Eliminar políticas
DROP POLICY IF EXISTS "Users view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users start conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users view messages" ON public.messages;
DROP POLICY IF EXISTS "Users send messages" ON public.messages;
DROP POLICY IF EXISTS "Users view own saves" ON public.saves;
DROP POLICY IF EXISTS "Users manage own saves" ON public.saves;
DROP POLICY IF EXISTS "Public likes view" ON public.likes;
DROP POLICY IF EXISTS "Users manage likes" ON public.likes;
DROP POLICY IF EXISTS "Public comments view" ON public.comments;
DROP POLICY IF EXISTS "Users manage comments" ON public.comments;
DROP POLICY IF EXISTS "Public follows are visible" ON public.follows;
DROP POLICY IF EXISTS "Users can create follow requests" ON public.follows;
DROP POLICY IF EXISTS "Users can delete follows" ON public.follows;
DROP POLICY IF EXISTS "Users can update follow status" ON public.follows;
DROP POLICY IF EXISTS "Public posts view" ON public.posts;
DROP POLICY IF EXISTS "Users manage own posts" ON public.posts;
DROP POLICY IF EXISTS "Users view items of visible outfits" ON public.outfit_items;
DROP POLICY IF EXISTS "Users manage own outfit items" ON public.outfit_items;
DROP POLICY IF EXISTS "Users view own outfits" ON public.outfits;
DROP POLICY IF EXISTS "Users view public outfits" ON public.outfits;
DROP POLICY IF EXISTS "Users manage own outfits" ON public.outfits;
DROP POLICY IF EXISTS "Users view own clothes" ON public.clothing_items;
DROP POLICY IF EXISTS "Users manage own clothes" ON public.clothing_items;
DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own" ON public.users;
DROP POLICY IF EXISTS "Users update own" ON public.users;
DROP POLICY IF EXISTS "Users insert own" ON public.users;
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update Own Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Delete Own Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Posts Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload Posts" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update Own Posts" ON storage.objects;
DROP POLICY IF EXISTS "Clothing Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload Clothing" ON storage.objects;
DROP POLICY IF EXISTS "Users view own collections" ON public.collections;
DROP POLICY IF EXISTS "Users manage own collections" ON public.collections;
DROP POLICY IF EXISTS "Users view own collection items" ON public.collection_items;
DROP POLICY IF EXISTS "Users manage own collection items" ON public.collection_items;

-- Eliminar triggers
DROP TRIGGER IF EXISTS on_message_sent_before ON public.messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.clothing_items;
DROP TRIGGER IF EXISTS set_updated_at ON public.outfits;
DROP TRIGGER IF EXISTS set_updated_at ON public.collections;
DROP TRIGGER IF EXISTS set_updated_at ON public.conversations;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_new_message();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.get_or_create_conversation(UUID);
DROP FUNCTION IF EXISTS public.get_followers_with_info(UUID);
DROP FUNCTION IF EXISTS public.get_following_with_info(UUID);
DROP FUNCTION IF EXISTS public.ensure_conversation_exists();

-- 1. LIMPIEZA DE TABLAS
-- ============================================
DROP TABLE IF EXISTS public.outfit_items CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.saves CASCADE;
DROP TABLE IF EXISTS public.collection_items CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.outfits CASCADE;
DROP TABLE IF EXISTS public.clothing_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- 2. RECREACIÓN DE TABLAS
-- ============================================

-- 2.1 USERS (Legacy mirror)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  username TEXT,
  age_range TEXT,
  gender TEXT,
  height NUMERIC,
  height_range TEXT,
  preferred_styles TEXT[],
  uses_accessories BOOLEAN DEFAULT false,
  visual_style_preferences TEXT[],
  style_completed BOOLEAN DEFAULT false,
  morphology TEXT,
  colorimetry TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 PROFILES (Social Profile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  gender TEXT,
  age_range TEXT,
  height NUMERIC,
  height_range TEXT,
  preferred_styles TEXT[],
  uses_accessories BOOLEAN,
  visual_style_preferences TEXT[],
  style_completed BOOLEAN DEFAULT false,
  morphology TEXT,
  colorimetry TEXT,
  subscription_tier TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2.3 CLOTHING ITEMS
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 OUTFITS
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasion TEXT,
  season TEXT,
  is_public BOOLEAN DEFAULT false,
  favorite BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 OUTFIT_ITEMS
CREATE TABLE IF NOT EXISTS public.outfit_items (
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items ON DELETE CASCADE NOT NULL,
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  scale NUMERIC DEFAULT 1,
  rotation NUMERIC DEFAULT 0,
  layer_order INTEGER DEFAULT 0,
  PRIMARY KEY (outfit_id, clothing_item_id)
);

-- 2.6 POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfits,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 FOLLOWS (Follow directo sin pending)
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 2.8 LIKES
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND outfit_id IS NULL) OR 
    (post_id IS NULL AND outfit_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id, outfit_id)
);

-- 2.9 COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant1_id UUID REFERENCES auth.users NOT NULL,
  participant2_id UUID REFERENCES auth.users NOT NULL,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant2_id);

-- 2.11 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

-- 2.12 SAVES
CREATE TABLE IF NOT EXISTS public.saves (
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT save_target_check CHECK (
    (post_id IS NOT NULL AND outfit_id IS NULL) OR 
    (post_id IS NULL AND outfit_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id, outfit_id)
);

-- 2.13 COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.14 COLLECTION ITEMS
CREATE TABLE IF NOT EXISTS public.collection_items (
  collection_id UUID REFERENCES public.collections ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT collection_item_check CHECK (
    (post_id IS NOT NULL AND outfit_id IS NULL) OR 
    (post_id IS NULL AND outfit_id IS NOT NULL)
  ),
  UNIQUE (collection_id, post_id, outfit_id)
);

-- ============================================
-- 3. SEGURIDAD (RLS)
-- ============================================

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
CREATE POLICY "Users view own conversations" ON public.conversations 
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users start conversations" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users delete own conversations" ON public.conversations 
  FOR DELETE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- MESSAGES
CREATE POLICY "Users view messages" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );
CREATE POLICY "Users send messages" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );
CREATE POLICY "Users delete messages" ON public.messages 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
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

-- ============================================
-- 4. FUNCIONES Y TRIGGERS
-- ============================================

-- Function: Ensure Conversation Exists (creates if not exists)
CREATE OR REPLACE FUNCTION public.ensure_conversation_exists(sender_uuid UUID, receiver_uuid UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  p1 UUID;
  p2 UUID;
BEGIN
  -- Ordenar participantes para evitar duplicados
  IF sender_uuid < receiver_uuid THEN
    p1 := sender_uuid;
    p2 := receiver_uuid;
  ELSE
    p1 := receiver_uuid;
    p2 := sender_uuid;
  END IF;

  -- Buscar conversación existente
  SELECT id INTO conv_id FROM public.conversations
  WHERE participant1_id = p1 AND participant2_id = p2;

  -- Si no existe, crear nueva
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant1_id, participant2_id)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Handle New Message (creates conversation if needed)
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient UUID;
  conv_id UUID;
BEGIN
  -- Determinar receptor
  IF NEW.receiver_id IS NULL THEN
    SELECT 
      CASE 
        WHEN participant1_id = NEW.sender_id THEN participant2_id
        ELSE participant1_id
      END INTO recipient
    FROM public.conversations
    WHERE id = NEW.conversation_id;
    NEW.receiver_id := recipient;
  ELSE
    recipient := NEW.receiver_id;
  END IF;

  -- Si no hay conversation_id, crear o obtener conversación
  IF NEW.conversation_id IS NULL THEN
    conv_id := public.ensure_conversation_exists(NEW.sender_id, recipient);
    NEW.conversation_id := conv_id;
  END IF;

  -- Actualizar conversación con último mensaje
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

CREATE TRIGGER on_message_sent_before
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- Function: Handle New User
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Updated_at auto-update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.clothing_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.outfits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. FUNCIONES RPC (Para la app)
-- ============================================

-- Get or Create Conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(target_user_id UUID)
RETURNS TABLE (conversation_id UUID, created BOOLEAN) AS $$
DECLARE
  conv_id UUID;
  my_id UUID := auth.uid();
  p1 UUID;
  p2 UUID;
BEGIN
  IF my_id < target_user_id THEN
    p1 := my_id;
    p2 := target_user_id;
  ELSE
    p1 := target_user_id;
    p2 := my_id;
  END IF;

  SELECT id INTO conv_id FROM public.conversations
  WHERE participant1_id = p1 AND participant2_id = p2;

  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant1_id, participant2_id)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
    RETURN QUERY SELECT conv_id, true;
  ELSE
    RETURN QUERY SELECT conv_id, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Followers with Profile Info
CREATE OR REPLACE FUNCTION public.get_followers_with_info(profile_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  followed_at TIMESTAMPTZ,
  is_following_back BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    f.created_at,
    EXISTS (
      SELECT 1 FROM public.follows f2 
      WHERE f2.follower_id = profile_id 
      AND f2.following_id = p.id
      AND f2.status = 'accepted'
    ) AS is_following_back
  FROM public.follows f
  JOIN public.profiles p ON f.follower_id = p.id
  WHERE f.following_id = profile_id
  AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Following with Profile Info
CREATE OR REPLACE FUNCTION public.get_following_with_info(profile_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  followed_at TIMESTAMPTZ,
  is_followed_by_them BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    f.created_at,
    EXISTS (
      SELECT 1 FROM public.follows f2 
      WHERE f2.follower_id = p.id 
      AND f2.following_id = profile_id
      AND f2.status = 'accepted'
    ) AS is_followed_by_them
  FROM public.follows f
  JOIN public.profiles p ON f.following_id = p.id
  WHERE f.follower_id = profile_id
  AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Auth Users Upload Avatar" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Update Own Avatar" ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Delete Own Avatar" ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Posts Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

CREATE POLICY "Auth Users Upload Posts" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'posts' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Update Own Posts" ON storage.objects FOR UPDATE
USING ( bucket_id = 'posts' AND auth.role() = 'authenticated' );

INSERT INTO storage.buckets (id, name, public)
VALUES ('clothing', 'clothing', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Clothing Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'clothing' );

CREATE POLICY "Auth Users Upload Clothing" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'clothing' AND auth.role() = 'authenticated' );

-- ============================================
-- 7. SINCRONIZACIÓN DE USUARIOS EXISTENTES
-- ============================================

INSERT INTO public.profiles (id, full_name, username, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'User'), 
  COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, avatar)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'User'), 
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
