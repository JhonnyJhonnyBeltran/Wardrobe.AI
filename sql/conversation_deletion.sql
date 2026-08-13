-- Añadir columnas para rastrear cuándo cada participante eliminó la conversación
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS user1_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS user2_deleted_at TIMESTAMPTZ;

-- Crear la función para que un usuario pueda borrar su lado de la conversación
CREATE OR REPLACE FUNCTION delete_conversation_for_user(target_user_id UUID)
RETURNS void AS $$
DECLARE
    conv_id UUID;
    v_participant1 UUID;
    v_participant2 UUID;
    v_user1_deleted TIMESTAMPTZ;
    v_user2_deleted TIMESTAMPTZ;
BEGIN
    -- Buscar la conversación
    SELECT id, participant1_id, participant2_id, user1_deleted_at, user2_deleted_at
    INTO conv_id, v_participant1, v_participant2, v_user1_deleted, v_user2_deleted
    FROM public.conversations
    WHERE (participant1_id = auth.uid() AND participant2_id = target_user_id)
       OR (participant1_id = target_user_id AND participant2_id = auth.uid());

    IF conv_id IS NOT NULL THEN
        -- Actualizar la fecha de borrado para el usuario actual
        IF v_participant1 = auth.uid() THEN
            UPDATE public.conversations SET user1_deleted_at = NOW() WHERE id = conv_id;
            v_user1_deleted := NOW();
        ELSE
            UPDATE public.conversations SET user2_deleted_at = NOW() WHERE id = conv_id;
            v_user2_deleted := NOW();
        END IF;

        -- Si AMBOS han borrado la conversación, eliminar todo por completo
        IF v_user1_deleted IS NOT NULL AND v_user2_deleted IS NOT NULL THEN
            DELETE FROM public.messages WHERE conversation_id = conv_id;
            DELETE FROM public.conversations WHERE id = conv_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
