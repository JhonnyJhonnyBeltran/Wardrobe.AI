-- Allow public SELECT on clothing_items so garments in public outfits and posts can be viewed by other users
DROP POLICY IF EXISTS "Users view own clothing" ON public.clothing_items;
DROP POLICY IF EXISTS "Public view clothing" ON public.clothing_items;
DROP POLICY IF EXISTS "Allow authenticated read clothing" ON public.clothing_items;

-- Anyone can view clothing items (read-only for looks & public outfits)
CREATE POLICY "Allow public read on clothing_items"
ON public.clothing_items
FOR SELECT
USING (true);

-- Ensure users can only insert/update/delete their own clothing
DROP POLICY IF EXISTS "Users insert own clothing" ON public.clothing_items;
CREATE POLICY "Users insert own clothing" 
ON public.clothing_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own clothing" ON public.clothing_items;
CREATE POLICY "Users update own clothing" 
ON public.clothing_items 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own clothing" ON public.clothing_items;
CREATE POLICY "Users delete own clothing" 
ON public.clothing_items 
FOR DELETE 
USING (auth.uid() = user_id);
