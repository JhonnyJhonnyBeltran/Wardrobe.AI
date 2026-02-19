-- ============================================
-- KLOZET DATABASE - SIMPLE VERSION
-- Only categories, brands, and basic tables needed
-- ============================================

-- Enable uuid-ossp extension (run separately if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (use CASCADE to handle FK dependencies)
-- ============================================

DROP TABLE IF EXISTS public.collection_items CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.saves CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.outfit_items CASCADE;
DROP TABLE IF EXISTS public.outfits CASCADE;
DROP TABLE IF EXISTS public.clothing_items CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.style_options CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table (mirror of auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
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
  hair_type TEXT,
  skin_tone TEXT,
  body_shape TEXT,
  favorite_colors TEXT[],
  occasions_preferences TEXT[],
  budget_range TEXT,
  subscription_tier TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clothing Items table
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

-- Outfits table
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

-- Outfit Items table
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

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfits,
  image_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- Likes table
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

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Conversations table
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

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Saves table
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

-- Collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Collection Items table
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

-- Style Options table
CREATE TABLE IF NOT EXISTS public.style_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'visual',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  entity_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.style_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Categories policies (Public read, Admin write)
CREATE POLICY "Public categories view" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (true);

-- Brands policies (Public read, Admin write)
CREATE POLICY "Public brands view" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin manage brands" ON public.brands FOR ALL USING (true);

-- Clothing items policies
CREATE POLICY "Users view own clothing" ON public.clothing_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own clothing" ON public.clothing_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own clothing" ON public.clothing_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own clothing" ON public.clothing_items FOR DELETE USING (auth.uid() = user_id);

-- Outfits policies
CREATE POLICY "Public outfits view" ON public.outfits FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users create outfits" ON public.outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own outfits" ON public.outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own outfits" ON public.outfits FOR DELETE USING (auth.uid() = user_id);

-- Outfit items policies
CREATE POLICY "Users view own outfit items" ON public.outfit_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage outfit items" ON public.outfit_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_id AND user_id = auth.uid())
);

-- Posts policies
CREATE POLICY "Public posts view" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Public follows view" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Likes policies
CREATE POLICY "Public likes view" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Public comments view" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Messages policies
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant1_id = auth.uid() OR participant2_id = auth.uid()))
);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Saves policies
CREATE POLICY "Users view own saves" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save" ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON public.saves FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Users view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id OR is_private = false);
CREATE POLICY "Users manage collections" ON public.collections FOR ALL USING (auth.uid() = user_id);

-- Collection items policies
CREATE POLICY "Users view collection items" ON public.collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND (user_id = auth.uid() OR is_private = false))
);
CREATE POLICY "Users manage collection items" ON public.collection_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);

-- Style options policies
CREATE POLICY "Public style options view" ON public.style_options FOR SELECT USING (true);
CREATE POLICY "Admin manage style options" ON public.style_options FOR ALL USING (true);

-- Notifications policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant2_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS (drop first if exists)
-- ============================================

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions if they exist with different signature
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.get_or_create_conversation(UUID);

-- ============================================
-- CREATE FUNCTIONS
-- ============================================

-- Function: Handle New User (creates profile when user signs up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Handle Updated At
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get or Create Conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  current_user_id UUID;
  conversation_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if conversation exists
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (participant1_id = current_user_id AND participant2_id = target_user_id)
     OR (participant1_id = target_user_id AND participant2_id = current_user_id);
  
  -- If not exists, create new
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant1_id, participant2_id)
    VALUES (current_user_id, target_user_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Updated At for profiles
CREATE TRIGGER set_profile_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Updated At for clothing_items
CREATE TRIGGER set_clothing_updated_at BEFORE UPDATE ON public.clothing_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Updated At for outfits
CREATE TRIGGER set_outfit_updated_at BEFORE UPDATE ON public.outfits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Updated At for collections
CREATE TRIGGER set_collection_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Updated At for conversations
CREATE TRIGGER set_conversation_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Updated At for categories
CREATE TRIGGER set_category_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Updated At for brands
CREATE TRIGGER set_brand_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SEED DATA: CATEGORIES
-- ============================================

INSERT INTO public.categories (name, slug, icon, color, is_active, display_order) VALUES
('Top / Camiseta', 'top', 'tshirt', '#FF69B4', true, 1),
('Camisa', 'shirt', 'shirt', '#9B59B6', true, 2),
('Jersey / Sueter', 'sweater', 'sweater', '#3498DB', true, 3),
('Pantalón', 'pants', 'pants', '#2ECC71', true, 4),
('Falda', 'skirt', 'skirt', '#E74C3C', true, 5),
('Vestido', 'dress', 'dress', '#F39C12', true, 6),
('Abrigo / Chaqueta', 'outerwear', 'coat', '#1ABC9C', true, 7),
('Calzado', 'shoes', 'shoes', '#34495E', true, 8),
('Bolso / Accesorio', 'accessory', 'bag', '#E91E63', true, 9),
('Gorra / Sombrero', 'hat', 'hat', '#9B59B6', true, 10),
('Bufanda', 'scarf', 'scarf', '#F1C40F', true, 11),
('Guantes', 'gloves', 'gloves', '#E67E22', true, 12),
('Cinturón', 'belt', 'belt', '#795548', true, 13),
('Reloj', 'watch', 'watch', '#2C3E50', true, 14),
('Gafas', 'glasses', 'glasses', '#16A085', true, 15)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: BRANDS
-- ============================================

INSERT INTO public.brands (name, slug, logo_url, website, is_active, display_order) VALUES
('Zara', 'zara', NULL, 'https://www.zara.com', true, 1),
('Mango', 'mango', NULL, 'https://www.mango.com', true, 2),
('H&M', 'hm', NULL, 'https://www.hm.com', true, 3),
('Pull&Bear', 'pullandbear', NULL, 'https://www.pullandbear.com', true, 4),
('Bershka', 'bershka', NULL, 'https://www.bershka.com', true, 5),
('Stradivarius', 'stradivarius', NULL, 'https://www.stradivarius.com', true, 6),
('Massimo Dutti', 'massimodutti', NULL, 'https://www.massimodutti.com', true, 7),
('COS', 'cos', NULL, 'https://www.cosstores.com', true, 8),
('Uniqlo', 'uniqlo', NULL, 'https://www.uniqlo.com', true, 9),
('Nike', 'nike', NULL, 'https://www.nike.com', true, 10),
('Adidas', 'adidas', NULL, 'https://www.adidas.com', true, 11),
('Levi''s', 'levis', NULL, 'https://www.levis.com', true, 12),
('Tommy Hilfiger', 'tommyhilfiger', NULL, 'https://www.tommyhilfiger.com', true, 13),
('Calvin Klein', 'calvinklein', NULL, 'https://www.calvinklein.com', true, 14),
('Primark', 'primark', NULL, 'https://www.primark.com', true, 15),
('ASOS', 'asos', NULL, 'https://www.asos.com', true, 16),
('Shein', 'shein', NULL, 'https://www.shein.com', true, 17),
('Desigual', 'desigual', NULL, 'https://www.desigual.com', true, 18),
('El Corte Inglés', 'elcorteingles', NULL, 'https://www.elcorteingles.com', true, 19),
-- Streetwear / Hype
('Nude Project', 'nudeproject', NULL, 'https://nudeproject.com', true, 21),
('Scuffers', 'scuffers', NULL, 'https://scuffers.com', true, 22),
('Eme Studios', 'emestudios', NULL, 'https://emestudios.com', true, 23),
('Cold Culture', 'coldculture', NULL, 'https://coldculture.com', true, 24),
('Fake Gods', 'fakegods', NULL, 'https://fakegods.com', true, 25),
('Scrapworld', 'scrapworld', NULL, 'https://scrapworld.es', true, 26),
('Belaguer', 'belaguer', NULL, 'https://belaguer.com', true, 27),
('Blackbone', 'blackbone', NULL, 'https://blackbone.es', true, 28),
('Twojeys', 'twojeys', NULL, 'https://twojeys.com', true, 29),
('Grimey', 'grimey', NULL, 'https://grimey.com', true, 30),
('Kaotiko', 'kaotiko', NULL, 'https://kaotiko.com', true, 31),
('Edmmond Studios', 'edmmondstudios', NULL, 'https://edmmond.com', true, 32),
-- Casual / Boho
('Blue Banana', 'bluebanana', NULL, 'https://bluebanana.es', true, 41),
('Tipi Tent', 'tipitent', NULL, 'https://tipitent.com', true, 42),
('Brownie', 'brownie', NULL, 'https://brownie.es', true, 43),
('Noon', 'noon', NULL, 'https://noon.es', true, 44),
('Renatta&Go', 'renattago', NULL, 'https://renattago.es', true, 45),
('Gimaguas', 'gimaguas', NULL, 'https://gimaguas.com', true, 46),
('Paloma Wool', 'palomawool', NULL, 'https://palomawool.com', true, 47),
('Laagam', 'laagam', NULL, 'https://laagam.com', true, 48),
('Nícoli', 'niccoli', NULL, 'https://niccoli.es', true, 49),
('Scalpers', 'scalpers', NULL, 'https://scalpers.com', true, 50),
('Silbon', 'silbon', NULL, 'https://silbon.com', true, 51),
-- Premium / Accessories
('Bimba y Lola', 'bimbaylola', NULL, 'https://bimbaylola.com', true, 61),
('Zadig & Voltaire', 'zadigvoltaire', NULL, 'https://zadigvoltaire.com', true, 62),
('Maje', 'maje', NULL, 'https://maje.com', true, 63),
('Sandro', 'sandro', NULL, 'https://sandro-paris.com', true, 64),
('Oblack Caps', 'oblackcaps', NULL, 'https://oblackcaps.com', true, 65),
-- Footwear
('Hoff', 'hoff', NULL, 'https://hoff.com', true, 71),
('Pompeii', 'pompeii', NULL, 'https://pompeii.es', true, 72),
('Alohas', 'alohas', NULL, 'https://alohas.com', true, 73),
('Morrison', 'morrison', NULL, 'https://morrisonshoes.com', true, 74),
('Munich', 'munich', NULL, 'https://munich.es', true, 75),
('Ecoalf', 'ecoalf', NULL, 'https://ecoalf.com', true, 76),
-- Jewelry / Glasses
('PDPAOLA', 'pdpaola', NULL, 'https://pdpaola.com', true, 81),
('Aristocrazy', 'aristocrazy', NULL, 'https://aristocrazy.com', true, 82),
('Singularu', 'singularu', NULL, 'https://singularu.com', true, 83),
('San Saru', 'sansaru', NULL, 'https://sansaru.com', true, 84),
('Hawkers', 'hawkers', NULL, 'https://hawkersco.com', true, 85),
('Project Lobster', 'projectlobster', NULL, 'https://projectlobster.com', true, 86),
('Otra marca', 'other', NULL, NULL, true, 999)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: STYLE OPTIONS
-- ============================================

INSERT INTO public.style_options (name, image_url, category) VALUES
('Casual Moderno', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', 'visual'),
('Elegante Clásico', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80', 'visual'),
('Deportivo / Athleisure', 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&q=80', 'visual'),
('Boho Chic', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', 'visual'),
('Streetwear', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80', 'visual'),
('Romántico', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', 'visual'),
('Minimalista', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', 'visual'),
('Rock / Grunge', 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=600&q=80', 'visual'),
('Preppy', 'https://images.unsplash.com/photo-1550614000-4b9519e6022e?w=600&q=80', 'visual'),
('Y2K', 'https://images.unsplash.com/photo-1616847231686-22a76203405c?w=600&q=80', 'visual')
ON CONFLICT DO NOTHING;
