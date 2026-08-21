-- ==============================================================================
-- FIX RLS: Permitir lectura pública de prendas y composiciones de outfits
-- ==============================================================================

-- 1. Permitir que cualquier usuario pueda leer las prendas de un outfit (outfit_items)
DROP POLICY IF EXISTS "Users view own outfit items" ON public.outfit_items;
DROP POLICY IF EXISTS "Public view outfit items" ON public.outfit_items;

CREATE POLICY "Public view outfit items" 
ON public.outfit_items 
FOR SELECT 
USING (true);

-- 2. Permitir que cualquier usuario pueda ver las prendas (clothing_items) asociadas
DROP POLICY IF EXISTS "Users view own clothing" ON public.clothing_items;
DROP POLICY IF EXISTS "Public view clothing" ON public.clothing_items;
DROP POLICY IF EXISTS "Allow public read on clothing_items" ON public.clothing_items;

CREATE POLICY "Public view clothing"
ON public.clothing_items
FOR SELECT
USING (true);

-- 3. Mantener la seguridad de escritura: solo el propietario puede modificar/borrar
DROP POLICY IF EXISTS "Users insert own clothing" ON public.clothing_items;
CREATE POLICY "Users insert own clothing" 
ON public.clothing_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own clothing" ON public.clothing_items;
CREATE POLICY "Users update own clothing" 
ON public.clothing_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own clothing" ON public.clothing_items;
CREATE POLICY "Users delete own clothing" 
ON public.clothing_items FOR DELETE USING (auth.uid() = user_id);
