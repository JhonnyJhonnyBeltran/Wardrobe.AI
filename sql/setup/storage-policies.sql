-- ============================================
-- Storage Policies for Klozet (Wardrobe.AI)
-- ============================================
-- Ejecutar este SQL en Supabase SQL Editor
-- ANTES de ejecutar, asegúrate de que el bucket 'clothing-images' exista
-- ============================================

-- ============================================
-- BUCKET: clothing-images
-- Usado para almacenar imágenes de prendas
-- ============================================

-- Limpiar políticas anteriores si existen (opcional)
-- DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view clothing images" ON storage.objects;

-- Política 1: INSERT - Usuarios pueden subir imágenes a su propia carpeta
-- Las imágenes se guardan como: clothing-images/{user_id}/filename.webp
CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 2: UPDATE - Usuarios pueden actualizar sus propias imágenes
CREATE POLICY "Users can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 3: DELETE - Usuarios pueden eliminar sus propias imágenes
CREATE POLICY "Users can delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clothing-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 4: SELECT - Cualquiera puede ver las imágenes (bucket público)
-- Esto permite que las imágenes se carguen en el frontend sin autenticación
CREATE POLICY "Public can view clothing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clothing-images');


-- ============================================
-- BUCKET: avatars (si existe)
-- Usado para fotos de perfil de usuarios
-- ============================================

-- Política: Usuarios pueden gestionar su propio avatar
CREATE POLICY "Users can manage their avatar"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Avatares son públicos
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');


-- ============================================
-- BUCKET: outfits (si existe)
-- Usado para imágenes generadas de outfits
-- ============================================

-- Política: Usuarios pueden gestionar sus outfits
CREATE POLICY "Users can manage their outfits"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Outfits públicos son visibles
CREATE POLICY "Public can view outfit images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'outfits');


-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar las políticas creadas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies 
-- WHERE tablename = 'objects' AND schemaname = 'storage';
