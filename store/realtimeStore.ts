/**
 * Realtime Store - Estado global de tiempo real
 * Gestiona notificaciones, presencia y estado de conexión
 */

import { create } from 'zustand';
import { Notification, TypingState } from '@/lib/realtime/types';
import { LIMITS } from '@/lib/realtime/constants';

// ============================================
// STORE INTERFACE
// ============================================

interface RealtimeStore {
  // Connection state
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;

  // Online users
  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;
  isUserOnline: (userId: string) => boolean;

  // Typing indicators
  typingState: TypingState;
  setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  getTypingUsers: (conversationId: string) => string[];
  clearTypingState: (conversationId: string) => void;

  // Reset
  reset: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  isConnected: false,
  notifications: [] as Notification[],
  unreadCount: 0,
  onlineUsers: [] as string[],
  typingState: {} as TypingState,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  // Connection state
  isConnected: initialState.isConnected,
  setConnected: (connected) => set({ isConnected: connected }),

  // Notifications
  notifications: initialState.notifications,
  unreadCount: initialState.unreadCount,

  addNotification: (notification) => {
    set((state) => {
      // Avoid duplicates
      if (state.notifications.some(n => n.id === notification.id)) {
        return state;
      }

      // Add to beginning, limit total
      const newNotifications = [notification, ...state.notifications]
        .slice(0, LIMITS.MAX_NOTIFICATIONS);
      
      return {
        notifications: newNotifications,
        unreadCount: state.unreadCount + (notification.read ? 0 : 1),
      };
    });
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };
    });
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // Online users
  onlineUsers: initialState.onlineUsers,
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  isUserOnline: (userId) => get().onlineUsers.includes(userId),

  // Typing indicators
  typingState: initialState.typingState,

  setUserTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const currentTyping = state.typingState[conversationId] || [];
      
      if (isTyping) {
        // Add user if not already typing
        if (currentTyping.some(t => t.user_id === userId)) {
          // Update timestamp
          return {
            typingState: {
              ...state.typingState,
              [conversationId]: currentTyping.map(t =>
                t.user_id === userId ? { ...t, timestamp: Date.now() } : t
              ),
            },
          };
        }
        return {
          typingState: {
            ...state.typingState,
            [conversationId]: [...currentTyping, { user_id: userId, timestamp: Date.now() }],
          },
        };
      } else {
        // Remove user
        return {
          typingState: {
            ...state.typingState,
            [conversationId]: currentTyping.filter(t => t.user_id !== userId),
          },
        };
      }
    });
  },

  getTypingUsers: (conversationId) => {
    const typing = get().typingState[conversationId] || [];
    return typing.map(t => t.user_id);
  },

  clearTypingState: (conversationId) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [conversationId]: removed, ...rest } = state.typingState;
      return { typingState: rest };
    });
  },

  // Reset
  reset: () => set(initialState),
}));

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectNotifications = (state: RealtimeStore) => state.notifications;
export const selectUnreadCount = (state: RealtimeStore) => state.unreadCount;
export const selectOnlineUsers = (state: RealtimeStore) => state.onlineUsers;
export const selectIsConnected = (state: RealtimeStore) => state.isConnected;
