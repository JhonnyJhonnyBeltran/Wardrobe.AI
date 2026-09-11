-- ==============================================================================
-- KLOZET / WARDROBE.AI - 01_FUNCTIONS_TRIGGERS.SQL
-- Triggers de Base de Datos, Funciones RPC y Triggers de Notificaciones
-- ==============================================================================

-- 1. HABILITAR SUPABASE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- 2. TRIGGER PARA CREACIÓN AUTOMÁTICA DE PERFIL (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, notification_preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    '{"likes": true, "comments": true, "follows": true, "followers": true, "messages": true, "reminders": true, "popupToasts": true, "email": false}'::JSONB
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TRIGGER ATÓMICO PARA LIKES & NOTIFICACIÓN AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_author_id UUID;
  sender_name TEXT;
  post_img TEXT;
BEGIN
  -- Incrementar contador de likes en post
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = NEW.post_id
  RETURNING user_id, image_url INTO post_author_id, post_img;

  -- No notificar si el usuario se dio like a sí mismo
  IF post_author_id IS NOT NULL AND post_author_id <> NEW.user_id THEN
    BEGIN
      SELECT COALESCE(full_name, username, 'Alguien') INTO sender_name
      FROM public.profiles WHERE id = NEW.user_id;

      INSERT INTO public.notifications (user_id, sender_id, type, title, message, entity_id, data)
      VALUES (
        post_author_id,
        NEW.user_id,
        'like',
        'Nuevo me gusta',
        sender_name || ' le gustó tu publicación',
        NEW.post_id,
        jsonb_build_object('post_id', NEW.post_id, 'image_url', post_img, 'actor_id', NEW.user_id)
      );
    EXCEPTION WHEN OTHERS THEN
      -- Evitar que un error en notifications cancele el like
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_unlike()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Decrementar contador de likes en post
  UPDATE public.posts
  SET likes_count = GREATEST(0, COALESCE(likes_count, 1) - 1)
  WHERE id = OLD.post_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_like_added ON public.likes;
CREATE TRIGGER on_like_added
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

DROP TRIGGER IF EXISTS on_like_removed ON public.likes;
CREATE TRIGGER on_like_removed
  AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_unlike();

-- 4. TRIGGER PARA COMENTARIOS & NOTIFICACIÓN
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_author_id UUID;
  sender_name TEXT;
  post_img TEXT;
BEGIN
  UPDATE public.posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = NEW.post_id
  RETURNING user_id, image_url INTO post_author_id, post_img;

  IF post_author_id IS NOT NULL AND post_author_id <> NEW.user_id THEN
    BEGIN
      SELECT COALESCE(full_name, username, 'Alguien') INTO sender_name
      FROM public.profiles WHERE id = NEW.user_id;

      INSERT INTO public.notifications (user_id, sender_id, type, title, message, entity_id, data)
      VALUES (
        post_author_id,
        NEW.user_id,
        'comment',
        'Nuevo comentario',
        sender_name || ' comentó: "' || LEFT(NEW.content, 40) || '"',
        NEW.post_id,
        jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'image_url', post_img, 'content', NEW.content)
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_comment_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(0, COALESCE(comments_count, 1) - 1)
  WHERE id = OLD.post_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_added ON public.comments;
CREATE TRIGGER on_comment_added
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_deleted();

-- 5. TRIGGER PARA SEGUIDORES & NOTIFICACIÓN
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name TEXT;
  sender_avatar TEXT;
BEGIN
  BEGIN
    SELECT COALESCE(full_name, username, 'Alguien'), avatar_url
    INTO sender_name, sender_avatar
    FROM public.profiles WHERE id = NEW.follower_id;

    INSERT INTO public.notifications (user_id, sender_id, type, title, message, entity_id, data)
    VALUES (
      NEW.following_id,
      NEW.follower_id,
      'follow',
      'Nuevo seguidor',
      sender_name || ' ha comenzado a seguirte',
      NEW.follower_id,
      jsonb_build_object('follower_id', NEW.follower_id, 'avatar_url', sender_avatar, 'status', NEW.status)
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_added ON public.follows;
CREATE TRIGGER on_follow_added
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();

-- 6. VISTA DE MONITOREO DE SUSCRIPCIONES
CREATE OR REPLACE VIEW public.v_user_subscriptions AS
SELECT 
  id AS user_id,
  username,
  full_name,
  is_premium,
  subscription_tier,
  subscription_plan,
  subscription_status,
  subscription_period_end,
  stripe_customer_id,
  created_at
FROM public.profiles
WHERE is_premium = true OR subscription_tier = 'premium';
