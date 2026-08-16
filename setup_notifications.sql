-- ==============================================================================
-- SCRIPT: setup_notifications.sql (VERSIÓN CORREGIDA)
-- ==============================================================================

-- 1. Crear la tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  message text,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de seguridad (eliminamos primero por si acaso para no usar bloques DO)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Habilitar tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ==============================================================================
-- 4. FUNCIÓN Y TRIGGER PARA LIKES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  post_author_id uuid;
  post_image text;
  sender_name text;
BEGIN
  SELECT user_id, image_url INTO post_author_id, post_image FROM public.posts WHERE id = NEW.post_id;
  
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'Alguien') INTO sender_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, sender_id, type, title, message, data)
  VALUES (
    post_author_id, 
    NEW.user_id, 
    'like', 
    'Nuevo me gusta', 
    sender_name || ' le ha dado me gusta a tu publicación.',
    jsonb_build_object('post_id', NEW.post_id, 'image_url', post_image)
  );
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_new_like ON public.likes;

CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

-- ==============================================================================
-- 5. FUNCIÓN Y TRIGGER PARA COMENTARIOS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  post_author_id uuid;
  post_image text;
  sender_name text;
BEGIN
  SELECT user_id, image_url INTO post_author_id, post_image FROM public.posts WHERE id = NEW.post_id;
  
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'Alguien') INTO sender_name FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, sender_id, type, title, message, data)
  VALUES (
    post_author_id, 
    NEW.user_id, 
    'comment', 
    'Nuevo comentario', 
    sender_name || ' ha comentado: ' || left(NEW.content, 50),
    jsonb_build_object('post_id', NEW.post_id, 'image_url', post_image)
  );
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_new_comment ON public.comments;

CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();
