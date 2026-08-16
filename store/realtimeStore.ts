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
  incrementUnreadCount: () => void;

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

    // 2. Count new activity (Follows, Likes, Comments)
    const { supabase } = await import('@/lib/supabase/client');

    try {
      // First, get all my posts to check for likes and comments
      const { data: myPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId);

      const myPostIds = myPosts ? myPosts.map((p: any) => p.id) : [];

      const promises: Promise<any>[] = [
        // Check follows
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId)
          .gt('created_at', lastViewedDate.toISOString()) as unknown as Promise<any>
      ];

      if (myPostIds.length > 0) {
        // Check likes
        promises.push(
          supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .in('post_id', myPostIds)
            .neq('user_id', userId)
            .gt('created_at', lastViewedDate.toISOString()) as unknown as Promise<any>
        );

        // Check comments
        promises.push(
          supabase
            .from('comments' as any)
            .select('*', { count: 'exact', head: true })
            .in('post_id', myPostIds)
            .neq('user_id', userId)
            .gt('created_at', lastViewedDate.toISOString()) as unknown as Promise<any>
        );
      }

      const results = await Promise.all(promises);
      let totalUnread = 0;
      results.forEach(res => {
        if (res.count) totalUnread += res.count;
      });

      set({ unreadCount: totalUnread });
    } catch (err) {
      console.error('Error checking activity:', err);
    }
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

  incrementUnreadCount: () => set(state => ({ unreadCount: state.unreadCount + 1 })),

  // Stub methods for compatibility if something else uses them (though we removed usages)
  addNotification: (notification) => set(state => {
    // Evitar duplicados
    if (state.notifications.some(n => n.id === notification.id)) return state;
    return {
      notifications: [notification, ...state.notifications].slice(0, 10),
    };
  }),
  markAsRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),

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
