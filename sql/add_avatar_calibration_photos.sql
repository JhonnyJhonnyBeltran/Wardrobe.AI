-- ==============================================================================
-- KLOZET - Migración para Fotos de Calibración de Avatar Virtual (Kloe)
-- ==============================================================================

-- 1. Añadir columnas a profiles para fotos de calibración
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS face_photos TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS body_photos TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Asegurar que las políticas de Storage para avatars permitan lectura y subida pública / autenticada
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de RLS en storage.objects para avatars
DO 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Avatars Public Access'
  ) THEN
    CREATE POLICY "Avatars Public Access" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Avatars Authenticated Upload'
  ) THEN
    CREATE POLICY "Avatars Authenticated Upload" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Avatars Authenticated Update'
  ) THEN
    CREATE POLICY "Avatars Authenticated Update" ON storage.objects
      FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
  END IF;
END ;
