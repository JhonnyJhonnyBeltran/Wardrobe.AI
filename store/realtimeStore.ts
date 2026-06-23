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

  // Activity / Notifications (Virtual)
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;

  // New Activity Methods
  checkActivity: (userId: string) => Promise<void>;
  markActivityAsViewed: (timestampISO?: string) => void;

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

  // Activity / Notifications (Virtual)
  notifications: initialState.notifications, // Keep for type safety if needed, but unused
  unreadCount: initialState.unreadCount,
  lastViewedActivity: null,

  checkActivity: async (userId: string) => {
    // 1. Get last viewed time from local storage
    const lastViewed = typeof window !== 'undefined' ? localStorage.getItem('last_viewed_activity') : null;
    const lastViewedDate = lastViewed ? new Date(lastViewed) : new Date(0); // Epoch if never viewed

    // 2. Count new follows
    const { supabase } = await import('@/lib/supabase/client');

    // Check follows created after lastViewedDate
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .gt('created_at', lastViewedDate.toISOString());

    let totalUnread = count || 0;

    set({ unreadCount: totalUnread });
  },

  markActivityAsViewed: (timestampISO?: string) => {
    // If a specific server timestamp is provided (from the newest notification), use it.
    // Otherwise, fallback to current time + 5 minutes.
    const now = timestampISO || new Date(Date.now() + 5 * 60000).toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_viewed_activity', now);
    }
    set({ unreadCount: 0 });
  },

  // Stub methods for compatibility if something else uses them (though we removed usages)
  addNotification: () => { },
  markAsRead: () => { },
  markAllAsRead: () => { },
  removeNotification: () => { },
  clearNotifications: () => { },

  // Online users
  onlineUsers: initialState.onlineUsers,
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  isUserOnline: (userId) => get().onlineUsers.includes(userId),

  // Typing indicators
  typingState: initialState.typingState,
  setUserTyping: (conversationId, userId, isTyping) => {
    // ... typing logic same as before ...
    set((state) => {
      const currentTyping = state.typingState[conversationId] || [];
      if (isTyping) {
        if (currentTyping.some(t => t.user_id === userId)) {
          return { typingState: { ...state.typingState, [conversationId]: currentTyping.map(t => t.user_id === userId ? { ...t, timestamp: Date.now() } : t) } };
        }
        return { typingState: { ...state.typingState, [conversationId]: [...currentTyping, { user_id: userId, timestamp: Date.now() }] } };
      } else {
        return { typingState: { ...state.typingState, [conversationId]: currentTyping.filter(t => t.user_id !== userId) } };
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

  reset: () => set(initialState),
}));

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectNotifications = (state: RealtimeStore) => state.notifications;
export const selectUnreadCount = (state: RealtimeStore) => state.unreadCount;
export const selectOnlineUsers = (state: RealtimeStore) => state.onlineUsers;
export const selectIsConnected = (state: RealtimeStore) => state.isConnected;
