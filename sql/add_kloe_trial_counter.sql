-- ==============================================================================
-- Klozet AI: Migración para Contador de Mensajes de Prueba con Kloe
-- ==============================================================================

-- 1. Añadir columna kloe_trial_messages_used a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kloe_trial_messages_used INTEGER DEFAULT 0;

-- 2. Asegurar que los perfiles existentes tengan 0 por defecto si es nulo
UPDATE public.profiles 
SET kloe_trial_messages_used = 0 
WHERE kloe_trial_messages_used IS NULL;

-- 3. Comentario explicativo en la columna
COMMENT ON COLUMN public.profiles.kloe_trial_messages_used IS 'Número de mensajes de prueba consumidos por el usuario con Kloe (límite gratuito de 8 mensajes)';
