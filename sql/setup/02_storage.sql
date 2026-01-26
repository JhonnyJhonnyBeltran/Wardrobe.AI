-- ============================================
-- KLOZET - CONFIGURACIÓN DE STORAGE
-- ============================================
-- Configura buckets para avatares e imágenes
-- Ejecutar DESPUÉS de 01_initial_setup.sql
-- ============================================

-- ============================================
-- 1. BUCKET: Avatares
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para avatares
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- ============================================
-- 2. BUCKET: Imágenes de Prendas
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('clothing-images', 'clothing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para imágenes de prendas
DROP POLICY IF EXISTS "Clothing images are publicly accessible" ON storage.objects;
CREATE POLICY "Clothing images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clothing-images');

DROP POLICY IF EXISTS "Users can upload clothing images" ON storage.objects;
CREATE POLICY "Users can upload clothing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clothing-images' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update clothing images" ON storage.objects;
CREATE POLICY "Users can update clothing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clothing-images' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete clothing images" ON storage.objects;
CREATE POLICY "Users can delete clothing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clothing-images' AND
    auth.role() = 'authenticated'
  );

-- ============================================
-- ¡STORAGE CONFIGURADO!
-- ============================================
