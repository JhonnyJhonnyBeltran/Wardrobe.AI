/**
 * useUnreadMessages Hook
 * Hook modular para gestionar mensajes no leídos con sincronización en tiempo real
 * Características:
 * - Sincronización con Supabase
 * - Suscripción a nuevos mensajes
 * - Marcado automático de lectura
 * - Gestión de badge tipo Instagram
 */

import { useEffect, useCallback, useRef } from 'react';
import { useMessageStore, ConversationUnreadState } from '@/store/messageStore';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';

interface UseUnreadMessagesOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Enable realtime subscriptions */
  enableRealtime?: boolean;
}

interface UnreadMessageData {
  conversation_id: string;
  id: string;
  sender_id: string;
  created_at: string;
}

export function useUnreadMessages(options: UseUnreadMessagesOptions = {}) {
  const { autoFetch = true, enableRealtime = true } = options;
  const { user } = useUser();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Store state and actions
  const totalUnreadCount = useMessageStore((state) => state.totalUnreadCount);
  const badgeVisible = useMessageStore((state) => state.badgeVisible);
  const unreadByConversation = useMessageStore((state) => state.unreadByConversation);
  const addUnreadMessage = useMessageStore((state) => state.addUnreadMessage);
  const markConversationAsRead = useMessageStore((state) => state.markConversationAsRead);
  const markConversationAsViewed = useMessageStore((state) => state.markConversationAsViewed);
  const setUnreadState = useMessageStore((state) => state.setUnreadState);
  const hideBadge = useMessageStore((state) => state.hideBadge);
  const showBadge = useMessageStore((state) => state.showBadge);
  const hasUnread = useMessageStore((state) => state.hasUnread);
  const getUnreadCount = useMessageStore((state) => state.getUnreadCount);

  /**
   * Fetch unread messages from database
   */
  const fetchUnreadMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get all unread messages for current user
      const { data: unreadMessages, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('messages' as any)
        .select('id, conversation_id, sender_id, created_at')
        .eq('receiver_id', user.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      // Group by conversation
      const unreadState: Record<string, ConversationUnreadState> = {};

      (unreadMessages as UnreadMessageData[] || []).forEach((msg) => {
        const existing = unreadState[msg.conversation_id];

        if (!existing) {
          unreadState[msg.conversation_id] = {
            conversationId: msg.conversation_id,
            unreadCount: 1,
            lastMessageId: msg.id,
            lastMessageAt: msg.created_at,
            hasBeenViewed: false,
          };
        } else {
          existing.unreadCount += 1;
          // Keep the most recent message info
          if (new Date(msg.created_at) > new Date(existing.lastMessageAt || '')) {
            existing.lastMessageId = msg.id;
            existing.lastMessageAt = msg.created_at;
          }
        }
      });

      setUnreadState(unreadState);
    } catch (error) {
      console.error('Error in fetchUnreadMessages:', error);
    }
  }, [user?.id, setUnreadState]);

  /**
   * Subscribe to new messages in realtime
   */
  const subscribeToMessages = useCallback(() => {
    if (!user?.id || !enableRealtime) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('unread-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async (payload: any) => {
          console.log('[useUnreadMessages] Realtime message event:', payload);
          const newOrUpdatedMessage = (payload.new || payload.old) as any;
          
          if (!newOrUpdatedMessage) return;

          // If the message is for us, sync global count from DB directly
          // This guarantees 100% accuracy independent of local store state mutations
          if (newOrUpdatedMessage.receiver_id === user.id || newOrUpdatedMessage.sender_id === user.id) {
             useMessageStore.getState().syncUnreadCount(user.id);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, enableRealtime, addUnreadMessage]);

  /**
   * Mark all messages in a conversation as read
   */
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    // Optimistic update
    markConversationAsRead(conversationId);

    try {
      // Update in database - using same pattern as rest of the app
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messagesTable = supabase.from('messages' as any);
      await messagesTable
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Refetch to restore correct state
      fetchUnreadMessages();
    }
  }, [user?.id, markConversationAsRead, fetchUnreadMessages]);

  /**
   * Called when user enters the messages page (inbox)
   * Hides the badge but keeps conversations highlighted
   * Note: We use getState() to avoid dependency on unreadByConversation
   */
  const onEnterMessagesPage = useCallback(() => {
    hideBadge();
    // Mark all as "viewed" but not "read" - using store's getState to avoid deps
    const currentUnread = useMessageStore.getState().unreadByConversation;
    Object.keys(currentUnread).forEach((convId) => {
      markConversationAsViewed(convId);
    });
  }, [hideBadge, markConversationAsViewed]);

  /**
   * Called when user opens a specific conversation
   * Marks all messages in that conversation as read
   */
  const onOpenConversation = useCallback((conversationId: string) => {
    markAsRead(conversationId);
  }, [markAsRead]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && user?.id) {
      fetchUnreadMessages();
    }
  }, [autoFetch, user?.id, fetchUnreadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (enableRealtime && user?.id) {
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [enableRealtime, user?.id, subscribeToMessages]);

  return {
    // State
    totalUnreadCount,
    badgeVisible,
    unreadByConversation,

    // Checks
    hasUnread,
    getUnreadCount,
    hasAnyUnread: totalUnreadCount > 0,

    // Actions
    fetchUnreadMessages,
    markAsRead,
    onEnterMessagesPage,
    onOpenConversation,
    hideBadge,
    showBadge,

    // For manual testing
    addUnreadMessage,
  };
}

export default useUnreadMessages;
