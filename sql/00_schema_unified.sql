-- ==============================================================================
-- KLOZET / WARDROBE.AI - 00_SCHEMA_UNIFIED.SQL
-- Fuente única de verdad para el esquema de Base de Datos y Políticas RLS
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. TABLA DE PERFILES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  gender TEXT,
  age INTEGER,
  age_range TEXT,
  height NUMERIC,
  height_range TEXT,
  preferred_styles TEXT[] DEFAULT '{}'::TEXT[],
  uses_accessories BOOLEAN DEFAULT false,
  visual_style_preferences TEXT[] DEFAULT '{}'::TEXT[],
  style_completed BOOLEAN DEFAULT false,
  morphology TEXT,
  colorimetry TEXT,
  hair_type TEXT,
  skin_tone TEXT,
  body_shape TEXT,
  favorite_colors TEXT[] DEFAULT '{}'::TEXT[],
  occasions_preferences TEXT[] DEFAULT '{}'::TEXT[],
  budget_range TEXT,
  is_private BOOLEAN DEFAULT false,
  -- Suscripción Stripe & Kloe Pro
  is_premium BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  subscription_plan TEXT DEFAULT 'none',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  -- Preferencias y Notificaciones
  notification_preferences JSONB DEFAULT '{"likes": true, "comments": true, "follows": true, "followers": true, "messages": true, "reminders": true, "popupToasts": true, "email": false}'::JSONB,
  last_viewed_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 3. TABLA DE CATEGORÍAS Y MARCAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TABLA DE PRENDAS DEL ARMARIO (clothing_items)
CREATE TABLE IF NOT EXISTS public.clothing_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  color TEXT,
  color_hex TEXT,
  size TEXT,
  price NUMERIC,
  fabric TEXT,
  season TEXT,
  reference TEXT,
  source_url TEXT,
  image_url TEXT NOT NULL,
  original_image_url TEXT,
  style_ids TEXT[] DEFAULT '{}'::TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  times_worn INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TABLA DE OUTFITS
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  season TEXT,
  image_url TEXT,
  style_ids TEXT[] DEFAULT '{}'::TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  times_worn INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABLA RELACIONAL DE PRENDAS EN OUTFITS (outfit_items)
CREATE TABLE IF NOT EXISTS public.outfit_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE NOT NULL,
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  scale NUMERIC DEFAULT 1,
  rotation NUMERIC DEFAULT 0,
  layer_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. CALENDARIO DE OUTFITS (calendar_outfits)
CREATE TABLE IF NOT EXISTS public.calendar_outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_date_outfit UNIQUE(user_id, date, outfit_id)
);

-- 8. PUBLICACIONES (posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  style_ids TEXT[] DEFAULT '{}'::TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. LIKES
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, post_id)
);

-- 10. COMENTARIOS (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. SEGUIMIENTOS (follows)
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- 12. GUARDADOS Y CARPETAS (saves & save_folders)
CREATE TABLE IF NOT EXISTS public.save_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.save_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_post_save UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.save_folder_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  folder_id UUID REFERENCES public.save_folders(id) ON DELETE CASCADE NOT NULL,
  save_id UUID REFERENCES public.saves(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_folder_save UNIQUE(folder_id, save_id)
);

-- 13. MENSAJERÍA (conversations & messages)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. NOTIFICACIONES (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  entity_id UUID,
  resource_id UUID,
  data JSONB DEFAULT '{}'::JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. HISTORIAL DE BÚSQUEDA (search_history)
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. POLÍTICAS RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.save_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.save_folder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Brands viewable by everyone" ON public.brands FOR SELECT USING (true);

CREATE POLICY "Users can manage own clothing items" ON public.clothing_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Clothing items viewable in public outfits" ON public.clothing_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.outfit_items oi
    JOIN public.posts p ON p.outfit_id = oi.outfit_id
    WHERE oi.clothing_item_id = clothing_items.id
  ) OR auth.uid() = user_id
);

CREATE POLICY "Users can manage own outfits" ON public.outfits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public outfits viewable by everyone" ON public.outfits FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.outfit_id = outfits.id) OR auth.uid() = user_id
);

CREATE POLICY "Users can manage own outfit items" ON public.outfit_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
);
CREATE POLICY "Outfit items viewable in public outfits" ON public.outfit_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.outfits o
    LEFT JOIN public.posts p ON p.outfit_id = o.id
    WHERE o.id = outfit_items.outfit_id AND (o.user_id = auth.uid() OR p.id IS NOT NULL)
  )
);

CREATE POLICY "Users can manage own calendar" ON public.calendar_outfits FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Users can manage own saves" ON public.saves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own folders" ON public.save_folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own folder items" ON public.save_folder_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.save_folders sf WHERE sf.id = save_folder_items.folder_id AND sf.user_id = auth.uid())
);

CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid())
);
CREATE POLICY "Users can join conversations" ON public.conversation_participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Participants can manage messages" ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid())
);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own search history" ON public.search_history FOR ALL USING (auth.uid() = user_id);
