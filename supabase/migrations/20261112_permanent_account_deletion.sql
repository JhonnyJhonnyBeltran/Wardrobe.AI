-- Permanent self-service account deletion RPC
-- Safely purges all user-owned relational records and removes the auth.users row permanently.

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_post_ids uuid[];
  v_outfit_ids uuid[];
  v_conv_ids uuid[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT COALESCE(array_agg(id), ARRAY[]::uuid[]) INTO v_post_ids
  FROM public.posts WHERE user_id = v_uid;

  SELECT COALESCE(array_agg(id), ARRAY[]::uuid[]) INTO v_outfit_ids
  FROM public.outfits WHERE user_id = v_uid;

  SELECT COALESCE(array_agg(DISTINCT conversation_id), ARRAY[]::uuid[]) INTO v_conv_ids
  FROM public.conversation_participants WHERE user_id = v_uid;

  -- Comments, Likes, Saves, Folders
  DELETE FROM public.comments WHERE user_id = v_uid OR post_id = ANY(v_post_ids);
  DELETE FROM public.likes WHERE user_id = v_uid OR post_id = ANY(v_post_ids);
  DELETE FROM public.saves WHERE user_id = v_uid OR post_id = ANY(v_post_ids);
  DELETE FROM public.save_folders WHERE user_id = v_uid;

  -- Follows & Follow Requests
  DELETE FROM public.follows WHERE follower_id = v_uid OR following_id = v_uid;
  DELETE FROM public.follow_requests WHERE follower_id = v_uid OR following_id = v_uid;

  -- Notifications
  DELETE FROM public.notifications WHERE user_id = v_uid OR actor_id = v_uid;

  -- Direct Messages & Empty Conversations
  DELETE FROM public.messages WHERE sender_id = v_uid;
  DELETE FROM public.conversation_participants WHERE user_id = v_uid;
  DELETE FROM public.conversations c
  WHERE c.id = ANY(v_conv_ids)
    AND NOT EXISTS (
      SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = c.id
    );

  -- Calendar, Posts, Outfits, Wardrobe
  BEGIN
    DELETE FROM public.calendar_outfits WHERE user_id = v_uid OR outfit_id = ANY(v_outfit_ids);
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  DELETE FROM public.posts WHERE user_id = v_uid;
  DELETE FROM public.outfit_items WHERE outfit_id = ANY(v_outfit_ids);
  DELETE FROM public.outfits WHERE user_id = v_uid;
  DELETE FROM public.clothing_items WHERE user_id = v_uid;

  -- Legacy / Optional tables
  BEGIN
    DELETE FROM public.saved_posts WHERE user_id = v_uid;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.users WHERE id = v_uid;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- Profile & Supabase Auth Record (Permanent)
  DELETE FROM public.profiles WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
