-- Migración: Añadir columna de idioma en public.profiles para sincronización de cuenta
-- Por defecto 'es' (Español)

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';

-- Comentario descriptivo
COMMENT ON COLUMN public.profiles.language IS 'Idioma preferido de la interfaz del usuario (es, en, fr, de, it, pt)';
