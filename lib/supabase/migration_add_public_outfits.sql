-- Migration: Add is_public column to outfits table
-- Run this in Supabase SQL Editor if you already have the database created

-- Add is_public column to outfits table
ALTER TABLE public.outfits 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.outfits.is_public IS 'Si el outfit es público para el feed social';

-- Create index for better performance when querying public outfits
CREATE INDEX IF NOT EXISTS idx_outfits_public ON public.outfits(user_id, is_public) WHERE is_public = true;

-- Update RLS policies to allow viewing public outfits
-- First, drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view own outfits" ON public.outfits;

-- Create new policies
-- Users can view their own outfits
CREATE POLICY "Users can view own outfits"
    ON public.outfits FOR SELECT
    USING (auth.uid() = user_id);

-- Anyone can view public outfits (for social feed)
CREATE POLICY "Anyone can view public outfits"
    ON public.outfits FOR SELECT
    USING (is_public = true);

-- ============================================
-- Migration complete!
-- ============================================
