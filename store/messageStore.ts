/**
 * Message Store - Estado global para mensajes y notificaciones
 * Sistema modular estilo Instagram para gestionar:
 * - Mensajes no leídos por conversación
 * - Conteo total de mensajes no leídos
 * - Estado de lectura de mensajes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export interface UnreadMessage {
  conversationId: string;
  senderId: string;
  messageId: string;
  receivedAt: string;
}

export interface ConversationUnreadState {
  conversationId: string;
  unreadCount: number;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  hasBeenViewed: boolean; // User entered messages page but hasn't opened this conversation
}

interface MessageStore {
  // Unread messages state
  unreadByConversation: Record<string, ConversationUnreadState>;
  totalUnreadCount: number;
  
  // Badge visibility (cleared when entering /messages)
  badgeVisible: boolean;
  
  // Actions - Core
  addUnreadMessage: (conversationId: string, messageId: string, senderId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  markConversationAsViewed: (conversationId: string) => void;
  clearAllUnread: () => void;
  
  // Actions - Badge
  hideBadge: () => void;
  showBadge: () => void;
  
  // Actions - Bulk operations
  setUnreadState: (state: Record<string, ConversationUnreadState>) => void;
  removeConversation: (conversationId: string) => void;
  
  // Actions - Sync with database
  syncUnreadCount: (userId: string) => Promise<void>;
  
  // Selectors
  getUnreadCount: (conversationId: string) => number;
  hasUnread: (conversationId: string) => boolean;
  hasAnyUnread: () => boolean;
  getUnreadConversationIds: () => string[];
  
  // Reset
  reset: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  unreadByConversation: {} as Record<string, ConversationUnreadState>,
  totalUnreadCount: 0,
  badgeVisible: true,
};

// ============================================
// HELPERS
// ============================================

const calculateTotalUnread = (unreadByConversation: Record<string, ConversationUnreadState>): number => {
  return Object.values(unreadByConversation).reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // ============================================
      // CORE ACTIONS
      // ============================================

      addUnreadMessage: (conversationId, messageId, _senderId) => {
        set((state) => {
          const existing = state.unreadByConversation[conversationId];
          
          const updated: ConversationUnreadState = {
            conversationId,
            unreadCount: (existing?.unreadCount || 0) + 1,
            lastMessageId: messageId,
            lastMessageAt: new Date().toISOString(),
            hasBeenViewed: false,
          };

          const newUnreadByConversation = {
            ...state.unreadByConversation,
            [conversationId]: updated,
          };

          return {
            unreadByConversation: newUnreadByConversation,
            totalUnreadCount: calculateTotalUnread(newUnreadByConversation),
            badgeVisible: true,
          };
        });
      },

      markConversationAsRead: (conversationId) => {
        set((state) => {
          if (!state.unreadByConversation[conversationId]) {
            return state;
          }

          const { [conversationId]: _removed, ...rest } = state.unreadByConversation;

          return {
            unreadByConversation: rest,
            totalUnreadCount: calculateTotalUnread(rest),
          };
        });
      },

      markConversationAsViewed: (conversationId) => {
        set((state) => {
          const existing = state.unreadByConversation[conversationId];
          if (!existing) return state;

          return {
            unreadByConversation: {
              ...state.unreadByConversation,
              [conversationId]: {
                ...existing,
                hasBeenViewed: true,
              },
            },
          };
        });
      },

      clearAllUnread: () => {
        set({
          unreadByConversation: {},
          totalUnreadCount: 0,
        });
      },

      // ============================================
      // BADGE ACTIONS
      // ============================================

      hideBadge: () => set({ badgeVisible: false }),
      
      showBadge: () => set({ badgeVisible: true }),

      // ============================================
      // BULK OPERATIONS
      // ============================================

      setUnreadState: (unreadState) => {
        set({
          unreadByConversation: unreadState,
          totalUnreadCount: calculateTotalUnread(unreadState),
          badgeVisible: calculateTotalUnread(unreadState) > 0,
        });
      },

      removeConversation: (conversationId) => {
        set((state) => {
          const { [conversationId]: _removed, ...rest } = state.unreadByConversation;
          return {
            unreadByConversation: rest,
            totalUnreadCount: calculateTotalUnread(rest),
          };
        });
      },

      // ============================================
      // SYNC WITH DATABASE
      // ============================================

      syncUnreadCount: async (userId: string) => {
        const { supabase } = await import('@/lib/supabase/client');
        
        // Get unread messages count from database
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', userId)
          .eq('is_read', false);

        if (!error && count !== null) {
          set({ 
            totalUnreadCount: count,
            badgeVisible: count > 0
          });
        }
      },

      // ============================================
      // SELECTORS
      // ============================================

      getUnreadCount: (conversationId) => {
        return get().unreadByConversation[conversationId]?.unreadCount || 0;
      },

      hasUnread: (conversationId) => {
        const conv = get().unreadByConversation[conversationId];
        return conv ? conv.unreadCount > 0 : false;
      },

      hasAnyUnread: () => {
        return get().totalUnreadCount > 0;
      },

      getUnreadConversationIds: () => {
        return Object.keys(get().unreadByConversation).filter(
          id => get().unreadByConversation[id].unreadCount > 0
        );
      },

      // ============================================
      // RESET
      // ============================================

      reset: () => set(initialState),
    }),
    {
      name: 'wardrobe-messages-store',
      partialize: (state) => ({
        unreadByConversation: state.unreadByConversation,
        totalUnreadCount: state.totalUnreadCount,
      }),
    }
  )
);

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectTotalUnread = (state: MessageStore) => state.totalUnreadCount;
export const selectBadgeVisible = (state: MessageStore) => state.badgeVisible;
export const selectUnreadByConversation = (state: MessageStore) => state.unreadByConversation;
