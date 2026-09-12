-- ==============================================================================
-- KLOZET / WARDROBE.AI - FIX RLS POLICIES FOR PUBLIC CLOTHING ITEMS & OUTFITS
-- Ejecuta este script en el SQL Editor de tu panel de Supabase
-- ==============================================================================

-- 1. Habilitar RLS en las tablas
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas de SELECT restrictivas si existen
DROP POLICY IF EXISTS "Clothing items viewable by everyone" ON public.clothing_items;
DROP POLICY IF EXISTS "Users can only view own clothing items" ON public.clothing_items;
DROP POLICY IF EXISTS "Users can view own clothing items" ON public.clothing_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clothing_items;
DROP POLICY IF EXISTS "Public clothing items are viewable by everyone" ON public.clothing_items;

DROP POLICY IF EXISTS "Outfits viewable by everyone" ON public.outfits;
DROP POLICY IF EXISTS "Users can only view own outfits" ON public.outfits;
DROP POLICY IF EXISTS "Users can view own outfits" ON public.outfits;

DROP POLICY IF EXISTS "Outfit items viewable by everyone" ON public.outfit_items;
DROP POLICY IF EXISTS "Users can only view own outfit items" ON public.outfit_items;

DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;

-- 3. Crear políticas permisivas de lectura (SELECT) para que todos los usuarios puedan ver prendas, outfits y posts
CREATE POLICY "Clothing items viewable by everyone" 
ON public.clothing_items 
FOR SELECT 
USING (true);

CREATE POLICY "Outfits viewable by everyone" 
ON public.outfits 
FOR SELECT 
USING (true);

CREATE POLICY "Outfit items viewable by everyone" 
ON public.outfit_items 
FOR SELECT 
USING (true);

CREATE POLICY "Posts viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (true);

-- 4. Asegurar que las operaciones de modificación (INSERT, UPDATE, DELETE) sigan protegidas solo para el dueño
DROP POLICY IF EXISTS "Users can insert own clothing items" ON public.clothing_items;
DROP POLICY IF EXISTS "Users can update own clothing items" ON public.clothing_items;
DROP POLICY IF EXISTS "Users can delete own clothing items" ON public.clothing_items;

CREATE POLICY "Users can insert own clothing items" 
ON public.clothing_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clothing items" 
ON public.clothing_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothing items" 
ON public.clothing_items 
FOR DELETE 
USING (auth.uid() = user_id);
