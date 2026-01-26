-- ============================================
-- KLOZET - SISTEMA DE MENSAJERÍA
-- ============================================
-- Soporta: DMs, Message Requests, Conversaciones
-- Ejecutar DESPUÉS de 01_initial_setup.sql
-- ============================================

-- ============================================
-- 1. TABLA CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_1 UUID REFERENCES auth.users NOT NULL,
  participant_2 UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Status: 'active' (mutual follow), 'pending' (message request), 'restricted'
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'restricted')),
  -- Quién inició la conversación
  initiated_by UUID REFERENCES auth.users,
  -- Preview del último mensaje
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender UUID REFERENCES auth.users,
  -- Evitar conversaciones duplicadas
  UNIQUE(participant_1, participant_2)
);

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);

-- ============================================
-- 2. TABLA MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  -- Tipo: text, image, post_share, outfit_share
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'post_share', 'outfit_share')),
  -- Para compartir posts/outfits
  shared_post_id UUID REFERENCES public.posts,
  shared_outfit_id UUID REFERENCES public.outfits,
  -- Estado de lectura
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

-- ============================================
-- 3. RLS POLICIES
-- ============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;
CREATE POLICY "Users can update messages they received" ON public.messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

-- ============================================
-- 4. FUNCIONES HELPER
-- ============================================

-- Verificar si dos usuarios se siguen mutuamente
CREATE OR REPLACE FUNCTION public.are_mutual_followers(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = user_a AND following_id = user_b
  ) AND EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = user_b AND following_id = user_a
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtener o crear una conversación
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  current_user_id UUID := auth.uid();
  is_mutual BOOLEAN;
  p1 UUID;
  p2 UUID;
BEGIN
  -- Ordenar participantes consistentemente (UUID menor primero)
  IF current_user_id < other_user_id THEN
    p1 := current_user_id;
    p2 := other_user_id;
  ELSE
    p1 := other_user_id;
    p2 := current_user_id;
  END IF;

  -- Buscar conversación existente
  SELECT id INTO conv_id FROM public.conversations
  WHERE participant_1 = p1 AND participant_2 = p2;

  IF conv_id IS NULL THEN
    -- Verificar si son seguidores mutuos
    is_mutual := public.are_mutual_followers(current_user_id, other_user_id);
    
    -- Crear nueva conversación
    INSERT INTO public.conversations (participant_1, participant_2, initiated_by, status)
    VALUES (p1, p2, current_user_id, CASE WHEN is_mutual THEN 'active' ELSE 'pending' END)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contar mensajes no leídos
CREATE OR REPLACE FUNCTION public.count_unread_messages(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER FROM public.messages
    WHERE receiver_id = user_id AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contar solicitudes de mensaje pendientes
CREATE OR REPLACE FUNCTION public.count_message_requests(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER FROM public.conversations
    WHERE (participant_1 = user_id OR participant_2 = user_id)
      AND initiated_by != user_id
      AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. TRIGGER: Actualizar conversación al enviar mensaje
-- ============================================
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_text = NEW.content,
    last_message_at = NEW.created_at,
    last_message_sender = NEW.sender_id,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_insert ON public.messages;
CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- ============================================
-- ¡SISTEMA DE MENSAJERÍA CONFIGURADO!
-- ============================================
