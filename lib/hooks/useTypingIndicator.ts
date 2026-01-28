/**
 * useTypingIndicator Hook
 * Hook para gestionar el indicador de "escribiendo..." en chats
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { realtimeManager } from '@/lib/realtime';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useUser } from '@/store/userStore';
import { TIMING } from '@/lib/realtime/constants';

interface UseTypingIndicatorOptions {
  /** ID de la conversación */
  conversationId: string;
  /** Tiempo de debounce para enviar señal (ms) */
  debounceMs?: number;
}

export function useTypingIndicator(options: UseTypingIndicatorOptions) {
  const { conversationId, debounceMs = TIMING.TYPING_THROTTLE } = options;
  
  const { user } = useUser();
  const setUserTyping = useRealtimeStore(state => state.setUserTyping);
  const clearTypingState = useRealtimeStore(state => state.clearTypingState);

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const lastTypingRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Join typing channel and subscribe to events
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Join the typing channel
    realtimeManager.joinTypingChannel(conversationId);

    // Subscribe to typing events
    const unsubscribe = realtimeManager.onTyping(conversationId, (event) => {
      if (event.user_id !== user.id) {
        setUserTyping(conversationId, event.user_id, event.is_typing);
        
        // Update local state
        setTypingUsers(prev => {
          if (event.is_typing) {
            if (!prev.includes(event.user_id)) {
              return [...prev, event.user_id];
            }
            return prev;
          } else {
            return prev.filter(id => id !== event.user_id);
          }
        });
      }
    });

    return () => {
      unsubscribe();
      realtimeManager.leaveTypingChannel(conversationId);
      clearTypingState(conversationId);
      setTypingUsers([]);
    };
  }, [conversationId, user?.id, setUserTyping, clearTypingState]);

  // Send typing indicator (debounced)
  const sendTyping = useCallback(() => {
    if (!conversationId || !user?.id) return;

    const now = Date.now();
    
    // Only send if enough time has passed since last send
    if (now - lastTypingRef.current < debounceMs) return;

    lastTypingRef.current = now;
    isTypingRef.current = true;
    
    // Send typing: true
    realtimeManager.sendTypingIndicator(conversationId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing: false
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        realtimeManager.sendTypingIndicator(conversationId, false);
      }
    }, TIMING.TYPING_TIMEOUT);
  }, [conversationId, user?.id, debounceMs]);

  // Stop typing indicator immediately
  const stopTyping = useCallback(() => {
    if (!conversationId || !user?.id) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      realtimeManager.sendTypingIndicator(conversationId, false);
    }
  }, [conversationId, user?.id]);

  // Handler for input change - call this on every keystroke
  const handleInputChange = useCallback(() => {
    sendTyping();
  }, [sendTyping]);

  // Handler for when message is sent - stops typing indicator
  const handleMessageSent = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Check if anyone is typing
  const isAnyoneTyping = typingUsers.length > 0;

  // Get typing text (e.g., "User is typing..." or "User1, User2 are typing...")
  const getTypingText = useCallback((usernames?: Record<string, string>): string => {
    if (typingUsers.length === 0) return '';
    
    if (typingUsers.length === 1) {
      const name = usernames?.[typingUsers[0]] || 'Alguien';
      return `${name} está escribiendo...`;
    }
    
    if (typingUsers.length === 2) {
      const names = typingUsers.map(id => usernames?.[id] || 'Alguien');
      return `${names.join(' y ')} están escribiendo...`;
    }
    
    return 'Varias personas están escribiendo...';
  }, [typingUsers]);

  return {
    // State
    typingUsers,
    isAnyoneTyping,
    
    // Actions
    sendTyping,
    stopTyping,
    handleInputChange,
    handleMessageSent,
    
    // Helpers
    getTypingText,
  };
}

export default useTypingIndicator;
