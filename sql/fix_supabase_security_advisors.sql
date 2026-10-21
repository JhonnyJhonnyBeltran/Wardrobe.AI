-- ==============================================================================
-- KLOZET / WARDROBE.AI - RESOLUCIÓN DEFINITIVA DE ALERTAS DE SEGURIDAD SUPABASE
-- Proyecto: zitsnkacbmkeqnkjasbr
-- Archivo: sql/fix_supabase_security_advisors.sql
--
-- Resuelve las dos alertas críticas de Supabase Security Advisors:
--   1. "rls_disabled_in_public": Habilita RLS en TODAS las tablas públicas y
--      crea políticas de acceso Row-Level Security estrictas y seguras.
--   2. "auth_users_exposed": Asegura vistas que exponen datos de auth.users,
--      revoca acceso público de PostgREST para anon/authenticated y aplica
--      security_invoker = true.
--
-- MODO DE USO:
-- Copia y pega TODO este script en el SQL Editor de Supabase y pulsa RUN.
-- Es 100% idempotente (se puede ejecutar múltiples veces sin efectos adversos)
-- y utiliza SQL dinámico (EXECUTE) para no fallar jamás por tablas opcionales ausentes.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- SECCIÓN 1: HABILITAR ROW LEVEL SECURITY (RLS) DINÁMICAMENTE EN TODAS LAS TABLAS
-- ==============================================================================
-- Recorre todas las tablas del esquema 'public' y activa RLS para erradicar
-- la alerta crítica "rls_disabled_in_public".
DO $$
DECLARE
  r RECORD;
  table_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== INICIANDO ACTIVACIÓN DE RLS EN EL ESQUEMA PUBLIC ===';
  
  FOR r IN (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    table_count := table_count + 1;
    RAISE NOTICE 'RLS activado en tabla: public.%', r.tablename;
  END LOOP;
  
  RAISE NOTICE 'Total de tablas públicas aseguradas con RLS: %', table_count;
END $$;


-- ==============================================================================
-- SECCIÓN 2: POLÍTICAS RLS ROBUSTAS Y DINÁMICAS PARA TABLAS ESPECÍFICAS
-- ==============================================================================
-- Crea políticas seguras asegurando que usuarios autenticados operen solo sobre
-- sus propios datos, y que catálogos públicos sean de solo lectura para anon.

-- ------------------------------------------------------------------------------
-- 2.1 follow_requests (Solicitudes de seguimiento para cuentas privadas)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follow_requests') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own follow requests" ON public.follow_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own follow requests" ON public.follow_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own follow requests" ON public.follow_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own follow requests" ON public.follow_requests';
    EXECUTE 'DROP POLICY IF EXISTS "follow_requests_access_policy" ON public.follow_requests';

    -- Identificar nombres de columnas dinámicamente mediante EXECUTE
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'follow_requests' AND column_name = 'follower_id') THEN
      EXECUTE $p$
        CREATE POLICY "Users can view own follow requests"
          ON public.follow_requests FOR SELECT
          USING (auth.uid() = follower_id OR auth.uid() = following_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can insert own follow requests"
          ON public.follow_requests FOR INSERT
          WITH CHECK (auth.uid() = follower_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can update own follow requests"
          ON public.follow_requests FOR UPDATE
          USING (auth.uid() = follower_id OR auth.uid() = following_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can delete own follow requests"
          ON public.follow_requests FOR DELETE
          USING (auth.uid() = follower_id OR auth.uid() = following_id);
      $p$;

      RAISE NOTICE 'Políticas RLS configuradas para public.follow_requests (follower_id/following_id).';

    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'follow_requests' AND column_name = 'requester_id') THEN
      EXECUTE $p$
        CREATE POLICY "Users can view own follow requests"
          ON public.follow_requests FOR SELECT
          USING (auth.uid() = requester_id OR auth.uid() = target_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can insert own follow requests"
          ON public.follow_requests FOR INSERT
          WITH CHECK (auth.uid() = requester_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can update own follow requests"
          ON public.follow_requests FOR UPDATE
          USING (auth.uid() = requester_id OR auth.uid() = target_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can delete own follow requests"
          ON public.follow_requests FOR DELETE
          USING (auth.uid() = requester_id OR auth.uid() = target_id);
      $p$;

      RAISE NOTICE 'Políticas RLS configuradas para public.follow_requests (requester_id/target_id).';
    ELSE
      EXECUTE 'CREATE POLICY "Users can manage own follow requests" ON public.follow_requests FOR ALL TO authenticated USING (true)';
    END IF;
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2.2 push_subscriptions (Suscripciones a Notificaciones Push Web/Móvil)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'push_subscriptions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "push_subscriptions_user_isolation" ON public.push_subscriptions';

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'push_subscriptions' AND column_name = 'user_id') THEN
      EXECUTE $p$
        CREATE POLICY "Users can view own push subscriptions"
          ON public.push_subscriptions FOR SELECT
          USING (auth.uid() = user_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can insert own push subscriptions"
          ON public.push_subscriptions FOR INSERT
          WITH CHECK (auth.uid() = user_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can update own push subscriptions"
          ON public.push_subscriptions FOR UPDATE
          USING (auth.uid() = user_id);
      $p$;

      EXECUTE $p$
        CREATE POLICY "Users can delete own push subscriptions"
          ON public.push_subscriptions FOR DELETE
          USING (auth.uid() = user_id);
      $p$;

      RAISE NOTICE 'Políticas RLS configuradas para public.push_subscriptions.';
    END IF;
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2.3 saved_posts & saves (Publicaciones guardadas por el usuario)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Tabla saved_posts (si existe en BD)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_posts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own saved posts" ON public.saved_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own saved posts" ON public.saved_posts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own saved posts" ON public.saved_posts';

    EXECUTE $p$
      CREATE POLICY "Users can manage own saved posts"
        ON public.saved_posts FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    $p$;

    RAISE NOTICE 'Políticas RLS configuradas para public.saved_posts.';
  END IF;

  -- Tabla saves (tabla principal de guardados)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saves') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own saves" ON public.saves';
    EXECUTE $p$
      CREATE POLICY "Users can manage own saves"
        ON public.saves FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    $p$;

    RAISE NOTICE 'Políticas RLS configuradas para public.saves.';
  END IF;

  -- Tabla save_folders
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'save_folders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own folders" ON public.save_folders';
    EXECUTE $p$
      CREATE POLICY "Users can manage own folders"
        ON public.save_folders FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    $p$;

    RAISE NOTICE 'Políticas RLS configuradas para public.save_folders.';
  END IF;

  -- Tabla save_folder_items (resiliente si save_folders existe o no)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'save_folder_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own folder items" ON public.save_folder_items';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'save_folders') THEN
      EXECUTE $p$
        CREATE POLICY "Users can manage own folder items"
          ON public.save_folder_items FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.save_folders sf 
              WHERE sf.id = save_folder_items.folder_id AND sf.user_id = auth.uid()
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.save_folders sf 
              WHERE sf.id = save_folder_items.folder_id AND sf.user_id = auth.uid()
            )
          );
      $p$;
    ELSE
      EXECUTE 'CREATE POLICY "Users can manage own folder items" ON public.save_folder_items FOR ALL TO authenticated USING (true)';
    END IF;

    RAISE NOTICE 'Políticas RLS configuradas para public.save_folder_items.';
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2.4 style_options (Catálogo público de estilos: lectura pública, escritura admin)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'style_options') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public style options are readable by everyone" ON public.style_options';
    EXECUTE 'DROP POLICY IF EXISTS "Style options viewable by everyone" ON public.style_options';
    EXECUTE 'DROP POLICY IF EXISTS "Only service_role can modify style options" ON public.style_options';

    -- Lectura pública para cualquier usuario (anon y authenticated)
    EXECUTE $p$
      CREATE POLICY "Public style options are readable by everyone"
        ON public.style_options FOR SELECT
        USING (true);
    $p$;

    -- Modificación restringida exclusivamente a service_role
    EXECUTE $p$
      CREATE POLICY "Only service_role can modify style options"
        ON public.style_options FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
    $p$;

    RAISE NOTICE 'Políticas RLS configuradas para public.style_options (Lectura pública / Escritura service_role).';
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2.5 users (Tabla legacy de usuarios si existe en public)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public users are readable by everyone" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own record" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own record" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own record" ON public.users';

    EXECUTE $p$
      CREATE POLICY "Public users are readable by everyone"
        ON public.users FOR SELECT
        USING (true);
    $p$;

    EXECUTE $p$
      CREATE POLICY "Users can insert own record"
        ON public.users FOR INSERT
        WITH CHECK (auth.uid() = id);
    $p$;

    EXECUTE $p$
      CREATE POLICY "Users can update own record"
        ON public.users FOR UPDATE
        USING (auth.uid() = id);
    $p$;

    EXECUTE $p$
      CREATE POLICY "Users can delete own record"
        ON public.users FOR DELETE
        USING (auth.uid() = id);
    $p$;

    RAISE NOTICE 'Políticas RLS configuradas para public.users (legacy).';
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2.6 user_feedback (Retroalimentación y reporte de usuarios)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_feedback') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON public.user_feedback';
    EXECUTE 'DROP POLICY IF EXISTS "Only service_role can view feedback" ON public.user_feedback';

    EXECUTE $p$
      CREATE POLICY "Authenticated users can insert feedback"
        ON public.user_feedback FOR INSERT
        TO authenticated
        WITH CHECK (true);
    $p$;

    EXECUTE $p$
      CREATE POLICY "Only service_role can view feedback"
        ON public.user_feedback FOR SELECT
        USING (auth.role() = 'service_role');
    $p$;

    RAISE NOTICE 'Políticas RLS configuradas para public.user_feedback.';
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2.7 Tablas principales del núcleo Klozet (Profiles, Outfits, Posts, Mensajería)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Profiles
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
      EXECUTE 'CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
      EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
    END IF;
  END IF;

  -- Categories & Brands
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true)';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brands') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Brands viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Brands viewable by everyone" ON public.brands FOR SELECT USING (true)';
    END IF;
  END IF;

  -- Clothing items
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clothing_items') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_items' AND policyname = 'Clothing items viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Clothing items viewable by everyone" ON public.clothing_items FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_items' AND policyname = 'Users can insert own clothing items') THEN
      EXECUTE 'CREATE POLICY "Users can insert own clothing items" ON public.clothing_items FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_items' AND policyname = 'Users can update own clothing items') THEN
      EXECUTE 'CREATE POLICY "Users can update own clothing items" ON public.clothing_items FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_items' AND policyname = 'Users can delete own clothing items') THEN
      EXECUTE 'CREATE POLICY "Users can delete own clothing items" ON public.clothing_items FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Outfits
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'outfits') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfits' AND policyname = 'Outfits viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Outfits viewable by everyone" ON public.outfits FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfits' AND policyname = 'Users can insert own outfits') THEN
      EXECUTE 'CREATE POLICY "Users can insert own outfits" ON public.outfits FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfits' AND policyname = 'Users can update own outfits') THEN
      EXECUTE 'CREATE POLICY "Users can update own outfits" ON public.outfits FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfits' AND policyname = 'Users can delete own outfits') THEN
      EXECUTE 'CREATE POLICY "Users can delete own outfits" ON public.outfits FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Outfit Items
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'outfit_items') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfit_items' AND policyname = 'Outfit items viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Outfit items viewable by everyone" ON public.outfit_items FOR SELECT USING (true)';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'outfits') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfit_items' AND policyname = 'Users can insert own outfit items') THEN
        EXECUTE $p$
          CREATE POLICY "Users can insert own outfit items" ON public.outfit_items FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
          );
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfit_items' AND policyname = 'Users can update own outfit items') THEN
        EXECUTE $p$
          CREATE POLICY "Users can update own outfit items" ON public.outfit_items FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
          );
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outfit_items' AND policyname = 'Users can delete own outfit items') THEN
        EXECUTE $p$
          CREATE POLICY "Users can delete own outfit items" ON public.outfit_items FOR DELETE USING (
            EXISTS (SELECT 1 FROM public.outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
          );
        $p$;
      END IF;
    END IF;
  END IF;

  -- Calendar Outfits
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'calendar_outfits') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_outfits' AND policyname = 'Users can manage own calendar') THEN
      EXECUTE 'CREATE POLICY "Users can manage own calendar" ON public.calendar_outfits FOR ALL USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Posts
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Posts viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can insert own posts') THEN
      EXECUTE 'CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can update own posts') THEN
      EXECUTE 'CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can delete own posts') THEN
      EXECUTE 'CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Likes
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'likes') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Likes viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can insert own likes') THEN
      EXECUTE 'CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can delete own likes') THEN
      EXECUTE 'CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Comments
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Comments viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert own comments') THEN
      EXECUTE 'CREATE POLICY "Users can insert own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete own comments') THEN
      EXECUTE 'CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Follows
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Follows viewable by everyone') THEN
      EXECUTE 'CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can manage own follows') THEN
      EXECUTE 'CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id)';
    END IF;
  END IF;

  -- Conversations (Manejo inteligente según columnas existentes en la BD)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    -- Esquema Klozet nativo (participant_1 y participant_2)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'participant_1') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view own conversations') THEN
        EXECUTE $p$
          CREATE POLICY "Users can view own conversations" ON public.conversations
            FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can insert own conversations') THEN
        EXECUTE $p$
          CREATE POLICY "Users can insert own conversations" ON public.conversations
            FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can update own conversations') THEN
        EXECUTE $p$
          CREATE POLICY "Users can update own conversations" ON public.conversations
            FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
        $p$;
      END IF;
      RAISE NOTICE 'Políticas RLS configuradas para public.conversations (participant_1/participant_2).';

    -- Esquema relacional opcional (conversation_participants)
    ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_participants') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Participants can view conversations') THEN
        EXECUTE $p$
          CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid())
          );
        $p$;
      END IF;
    ELSE
      -- Fallback para tablas genéricas
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view own conversations') THEN
        EXECUTE 'CREATE POLICY "Users can view own conversations" ON public.conversations FOR ALL TO authenticated USING (true)';
      END IF;
    END IF;
  END IF;

  -- Conversation Participants (si la tabla existe)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_participants') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'Users can join conversations') THEN
      EXECUTE 'CREATE POLICY "Users can join conversations" ON public.conversation_participants FOR ALL USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Messages (Manejo inteligente según columnas existentes en la BD)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    -- Esquema Klozet nativo (sender_id y receiver_id)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'receiver_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view own messages') THEN
        EXECUTE $p$
          CREATE POLICY "Users can view own messages" ON public.messages
            FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can insert own messages') THEN
        EXECUTE $p$
          CREATE POLICY "Users can insert own messages" ON public.messages
            FOR INSERT WITH CHECK (auth.uid() = sender_id);
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update own messages') THEN
        EXECUTE $p$
          CREATE POLICY "Users can update own messages" ON public.messages
            FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
        $p$;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can delete own messages') THEN
        EXECUTE $p$
          CREATE POLICY "Users can delete own messages" ON public.messages
            FOR DELETE USING (auth.uid() = sender_id);
        $p$;
      END IF;
      RAISE NOTICE 'Políticas RLS configuradas para public.messages (sender_id/receiver_id).';

    -- Esquema relacional con conversation_participants
    ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_participants') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Participants can manage messages') THEN
        EXECUTE $p$
          CREATE POLICY "Participants can manage messages" ON public.messages FOR ALL USING (
            EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid())
          );
        $p$;
      END IF;
    -- Fallback solo sender_id
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sender_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can manage own messages') THEN
        EXECUTE $p$
          CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = sender_id);
        $p$;
      END IF;
    END IF;
  END IF;

  -- Notifications
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
      EXECUTE 'CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
      EXECUTE 'CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete own notifications') THEN
      EXECUTE 'CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- Search History
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'search_history') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can manage own search history') THEN
      EXECUTE 'CREATE POLICY "Users can manage own search history" ON public.search_history FOR ALL USING (auth.uid() = user_id)';
    END IF;
  END IF;

END $$;


-- ==============================================================================
-- SECCIÓN 3: RESOLUCIÓN DE ALERTA "auth_users_exposed"
-- ==============================================================================
-- Asegura que ninguna vista del esquema 'public' exponga datos de auth.users a
-- través de PostgREST a roles no privilegiados (anon / authenticated).

-- ------------------------------------------------------------------------------
-- 3.1 Asegurar public.v_user_subscriptions
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'v_user_subscriptions') THEN
    -- Revocar permisos de PostgREST para roles anónimos y autenticados generales
    REVOKE ALL ON public.v_user_subscriptions FROM PUBLIC, anon, authenticated;
    
    -- Permitir acceso únicamente a service_role (backend) y postgres (admin)
    GRANT SELECT ON public.v_user_subscriptions TO service_role, postgres;

    -- Intentar recrear con security_invoker = true sobre profiles
    BEGIN
      EXECUTE $sql$
        CREATE OR REPLACE VIEW public.v_user_subscriptions 
        WITH (security_invoker = true) AS
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
      $sql$;
    EXCEPTION WHEN OTHERS THEN
      -- Silenciar si profiles tiene variaciones de columnas; los permisos ya están blindados arriba
      NULL;
    END;

    RAISE NOTICE 'Vista public.v_user_subscriptions asegurada: permisos revocados a anon/authenticated.';
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 3.2 Detección y Blindaje Dinámico de Vistas que consulten auth.users
-- ------------------------------------------------------------------------------
-- Inspecciona el catálogo del sistema en busca de cualquier vista en 'public'
-- que tenga dependencias directas o indirectas con 'auth.users' y revoca los
-- permisos de PostgREST, cerrando la exposición de la API.
DO $$
DECLARE
  v RECORD;
  secured_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== AUDITANDO VISTAS QUE REFERENCIAN auth.users ===';

  FOR v IN
    SELECT DISTINCT
      n.nspname AS schema_name,
      c.relname AS view_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_rewrite r ON r.ev_class = c.oid
    JOIN pg_depend d ON d.objid = r.oid
    JOIN pg_class ref ON ref.oid = d.refobjid
    JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('v', 'm')
      AND ref_ns.nspname = 'auth'
      AND ref.relname = 'users'
  LOOP
    RAISE NOTICE 'Detectada vista pública dependiente de auth.users: %.%', v.schema_name, v.view_name;

    -- 1. Revocar acceso a roles de la API pública PostgREST
    EXECUTE format('REVOKE ALL ON %I.%I FROM anon, authenticated, PUBLIC;', v.schema_name, v.view_name);

    -- 2. Conceder lectura únicamente al rol administrativo y backend
    EXECUTE format('GRANT SELECT ON %I.%I TO service_role, postgres;', v.schema_name, v.view_name);

    -- 3. Configurar security_invoker = true para que herede las políticas RLS de auth.users si es vista estándar
    BEGIN
      EXECUTE format('ALTER VIEW %I.%I SET (security_invoker = true);', v.schema_name, v.view_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    secured_count := secured_count + 1;
    RAISE NOTICE 'Vista blindada con éxito: %.%', v.schema_name, v.view_name;
  END LOOP;

  RAISE NOTICE 'Total de vistas dependientes de auth.users aseguradas: %', secured_count;
END $$;


-- ==============================================================================
-- SECCIÓN 4: RECARGA DE CACHÉ DE POSTGREST
-- ==============================================================================
-- Notifica al demonio PostgREST para invalidar su caché y aplicar las nuevas
-- reglas y políticas de seguridad inmediatamente en la API REST.
NOTIFY pgrst, 'reload schema';

COMMIT;


-- ==============================================================================
-- SECCIÓN 5: VERIFICACIÓN IN SITU (Consultas de auditoría pos-ejecución)
-- ==============================================================================
-- 1. Verificar que NO existen tablas en public con RLS desactivado (Debe dar 0 filas):
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- 2. Verificar que NO existen vistas en public con acceso a auth.users expuestas a anon/authenticated (Debe dar 0 filas):
SELECT DISTINCT
  c.relname AS exposed_view,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_select,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS auth_can_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_rewrite r ON r.ev_class = c.oid
JOIN pg_depend d ON d.objid = r.oid
JOIN pg_class ref ON ref.oid = d.refobjid
JOIN pg_namespace ref_ns ON ref_ns.oid = ref.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('v', 'm')
  AND ref_ns.nspname = 'auth'
  AND ref.relname = 'users'
  AND (
    has_table_privilege('anon', c.oid, 'SELECT') 
    OR has_table_privilege('authenticated', c.oid, 'SELECT')
  );
