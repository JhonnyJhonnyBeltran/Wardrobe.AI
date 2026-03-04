-- ============================================
-- STORAGE BUCKETS & RLS POLICIES
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create the required buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('clothing-images', 'clothing-images', true),
  ('avatars', 'avatars', true),
  ('outfits', 'outfits', true),
  ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files on all buckets
-- Since public = true handles HTTP gets, this policy allows SELECT in Supabase syntax
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('clothing-images', 'avatars', 'outfits', 'posts') );

-- 3. CLOTHING IMAGES: Authenticated users can insert their own items
CREATE POLICY "Auth users can upload clothing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. CLOTHING IMAGES: Authenticated users can update their own items
CREATE POLICY "Auth users can update own clothing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. CLOTHING IMAGES: Authenticated users can delete their own items
CREATE POLICY "Auth users can delete own clothing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. AVATARS: Authenticated users can insert their own avatars
CREATE POLICY "Auth users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. AVATARS: Authenticated users can update their own avatars
CREATE POLICY "Auth users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 8. AVATARS: Authenticated users can delete their own avatars
CREATE POLICY "Auth users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 9. OUTFITS (Posts): Authenticated users can insert their own outfits
CREATE POLICY "Auth users can upload outfits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 10. OUTFITS: Authenticated users can update their own outfits
CREATE POLICY "Auth users can update own outfits"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 11. OUTFITS: Authenticated users can delete their own outfits
CREATE POLICY "Auth users can delete own outfits"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 12. POSTS: Authenticated users can insert their own posts
CREATE POLICY "Auth users can upload posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 13. POSTS: Authenticated users can update their own posts
CREATE POLICY "Auth users can update own posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 14. POSTS: Authenticated users can delete their own posts
CREATE POLICY "Auth users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
