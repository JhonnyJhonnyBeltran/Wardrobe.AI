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
    const { supabase } = await import('@/lib/supabase/client');

    // 1. Get last viewed time from local storage or profile
    let lastViewed = typeof window !== 'undefined' ? localStorage.getItem('last_viewed_activity') : null;

    if (!lastViewed) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const dbLastViewed = (profile as any)?.notification_preferences?.last_viewed_activity;
        if (dbLastViewed) {
          lastViewed = dbLastViewed;
          if (typeof window !== 'undefined') {
            localStorage.setItem('last_viewed_activity', dbLastViewed);
          }
        }
      } catch (err) {
        console.warn('[RealtimeStore] Error fetching db last_viewed:', err);
      }
    }

    // Default to last 24 hours if completely new, avoiding full historical dump
    const lastViewedDate = lastViewed ? new Date(lastViewed) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. Count new activity (Follows, Likes, Comments)
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
    const now = timestampISO || new Date().toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_viewed_activity', now);
    }
    set({ unreadCount: 0 });

    // Sync to Supabase in background
    import('@/lib/supabase/client').then(async ({ supabase }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Mark all rows in notifications table as read
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

          // 2. Update profile timestamp in notification_preferences if supported
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (currentProfile && 'notification_preferences' in currentProfile) {
            const currentSettings = ((currentProfile as any)?.notification_preferences as Record<string, any>) || {};
            await supabase
              .from('profiles')
              .update({
                notification_preferences: {
                  ...currentSettings,
                  last_viewed_activity: now,
                }
              } as any)
              .eq('id', user.id);
          }
        }
      } catch (err) {
        console.warn('[RealtimeStore] Could not sync last_viewed / mark notifications read:', err);
      }
    }).catch(() => {});
  },

  incrementUnreadCount: () => set(state => ({ unreadCount: state.unreadCount + 1 })),

  // Add notification with deduplication
  addNotification: (notification) => set(state => {
    if (notification.read) return state;
    if (notification.created_at) {
      const diff = Date.now() - new Date(notification.created_at).getTime();
      if (diff > 120 * 1000) return state;
    }
    const isDuplicate = state.notifications.some(n => {
      if (n.id === notification.id) return true;
      const sameActor = (n.actor_id || n.sender_id) && (n.actor_id || n.sender_id) === (notification.actor_id || notification.sender_id);
      const sameType = n.type === notification.type;
      const sameEntity = (n.entity_id || n.resource_id || (n.data as any)?.post_id) === (notification.entity_id || notification.resource_id || (notification.data as any)?.post_id);
      if (sameActor && sameType && sameEntity) {
        const timeDiff = Math.abs(new Date(n.created_at || Date.now()).getTime() - new Date(notification.created_at || Date.now()).getTime());
        if (timeDiff < 60 * 1000) return true;
      }
      return false;
    });

    if (isDuplicate) return state;

    return {
      notifications: [notification, ...state.notifications].slice(0, 10),
    };
  }),
  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
    import('@/lib/supabase/client').then(async ({ supabase }) => {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch {}
    });
  },
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    import('@/lib/supabase/client').then(async ({ supabase }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
        }
      } catch {}
    });
  },
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
