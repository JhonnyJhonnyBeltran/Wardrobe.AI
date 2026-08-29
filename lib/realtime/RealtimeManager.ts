/**
 * RealtimeManager
 * Singleton que gestiona todas las conexiones de tiempo real
 * Centraliza la lógica de Supabase Realtime para evitar duplicación
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { 
  UserPresence, 
  PresenceState, 
  TypingEvent, 
  Notification,
} from './types';
import { CHANNELS, EVENTS, TIMING, TABLES } from './constants';

type PresenceCallback = (state: PresenceState) => void;
type TypingCallback = (event: TypingEvent) => void;
type NotificationCallback = (notification: Notification) => void;
type OnlineUsersCallback = (userIds: string[]) => void;

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, RealtimeChannel> = new Map();
  private userId: string | null = null;
  private isInitialized = false;
  private lastPollTime: number = Date.now();
  private pollInterval: any = null;

  // Callbacks
  private presenceCallbacks: Set<PresenceCallback> = new Set();
  private typingCallbacks: Map<string, Set<TypingCallback>> = new Map();
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private onlineUsersCallbacks: Set<OnlineUsersCallback> = new Set();

  // State
  private onlineUsers: Set<string> = new Set();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private sessionStartTime: number = Date.now();

  private constructor() {}

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async initialize(userId: string, userInfo?: { username?: string; avatar_url?: string }): Promise<void> {
    if (this.isInitialized && this.userId === userId) {
      console.log('[RealtimeManager] Already initialized for user:', userId);
      return;
    }

    // Cleanup previous connections
    if (this.isInitialized) {
      await this.cleanup();
    }

    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.lastPollTime = Date.now();
    console.log('[RealtimeManager] Initializing for user:', userId);

    try {
      // 0. Mark existing DB notifications as read so they never re-trigger
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)
        .then(() => {})
        .catch(() => {});

      // 1. Setup global notifications channel
      await this.setupGlobalChannel();

      // 2. Setup presence channel
      await this.setupPresenceChannel(userInfo);
      
      // Configure robust polling fallback in case PostgreSQL triggers or replication are disabled
      if (this.pollInterval) clearInterval(this.pollInterval);
      this.pollInterval = setInterval(() => this.pollRecentActivity(), 15000);

      this.isInitialized = true;
      console.log('[RealtimeManager] Initialization complete');
    } catch (error) {
      console.error('[RealtimeManager] Initialization error:', error);
      throw error;
    }
  }

  // ============================================
  // GLOBAL NOTIFICATIONS CHANNEL
  // ============================================

  private async setupGlobalChannel(): Promise<void> {
    if (!this.userId) return;

    const channelName = CHANNELS.GLOBAL(this.userId);
    
    const channel = supabase
      .channel(channelName)
      // Listen for new messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.MESSAGES,
          filter: `receiver_id=eq.${this.userId}`,
        },
        (payload: any) => this.handleNewMessage(payload)
      )
      // Listen for follow requests
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.FOLLOWS,
          filter: `following_id=eq.${this.userId}`,
        },
        (payload: any) => this.handleFollowEvent(payload, 'new')
      )
      // Listen for follow status updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLES.FOLLOWS,
          filter: `follower_id=eq.${this.userId}`,
        },
        (payload: any) => this.handleFollowEvent(payload, 'update')
      )
      // Listen for notifications table (if exists)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.NOTIFICATIONS,
          filter: `user_id=eq.${this.userId}`,
        },
        (payload: any) => this.handleNotificationInsert(payload)
      )
      // Listen for global likes (frontend fallback for missing triggers)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'likes' },
        (payload: any) => this.handleGlobalActivity(payload, 'like')
      )
      // Listen for global comments (frontend fallback for missing triggers)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload: any) => this.handleGlobalActivity(payload, 'comment')
      )
      // Listen for broadcast notifications
      .on('broadcast', { event: EVENTS.NOTIFICATION }, (payload: any) => {
        this.emitNotification(payload.payload as Notification);
      });

    await channel.subscribe((status: any) => {
      console.log('[RealtimeManager] Global channel status:', status);
    });

    this.channels.set(channelName, channel);
  }

  // ============================================
  // PRESENCE CHANNEL
  // ============================================

  private async setupPresenceChannel(userInfo?: { username?: string; avatar_url?: string }): Promise<void> {
    if (!this.userId) return;

    const channel = supabase.channel(CHANNELS.PRESENCE, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as any;
        this.handlePresenceSync(state);
      })
      .on('presence', { event: 'join' }, (payload: any) => {
        const key = payload.key;
        console.log('[RealtimeManager] User joined:', key);
        this.onlineUsers.add(key);
        this.emitOnlineUsers();
      })
      .on('presence', { event: 'leave' }, (payload: any) => {
        const key = payload.key;
        console.log('[RealtimeManager] User left:', key);
        this.onlineUsers.delete(key);
        this.emitOnlineUsers();
      });

    await channel.subscribe(async (status: any) => {
      console.log('[RealtimeManager] Presence channel status:', status);
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: this.userId,
          username: userInfo?.username,
          avatar_url: userInfo?.avatar_url,
          online_at: new Date().toISOString(),
          status: 'online',
        } as UserPresence);
      }
    });

    this.channels.set(CHANNELS.PRESENCE, channel);
  }

  // ============================================
  // TYPING CHANNEL
  // ============================================

  async joinTypingChannel(conversationId: string): Promise<void> {
    const channelName = CHANNELS.TYPING(conversationId);
    
    if (this.channels.has(channelName)) {
      return; // Already joined
    }

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: EVENTS.TYPING }, (payload: any) => {
        const event = payload.payload as TypingEvent;
        if (event.user_id !== this.userId) {
          this.handleTypingEvent(conversationId, event);
        }
      });

    await channel.subscribe();
    this.channels.set(channelName, channel);
  }

  async leaveTypingChannel(conversationId: string): Promise<void> {
    const channelName = CHANNELS.TYPING(conversationId);
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.typingCallbacks.delete(conversationId);
    }
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    const channelName = CHANNELS.TYPING(conversationId);
    const channel = this.channels.get(channelName);
    
    if (channel && this.userId) {
      channel.send({
        type: 'broadcast',
        event: EVENTS.TYPING,
        payload: {
          user_id: this.userId,
          conversation_id: conversationId,
          is_typing: isTyping,
          timestamp: new Date().toISOString(),
        } as TypingEvent,
      });
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  private async handleNewMessage(payload: RealtimePostgresChangesPayload<Record<string, unknown>>): Promise<void> {
    const message = payload.new as Record<string, unknown>;
    
    // Fetch sender info
    const { data: sender } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', message.sender_id as string)
      .single();

    const senderData = sender as { username: string; avatar_url: string | null } | null;

    const notification: Notification = {
      id: `msg_${message.id}`,
      type: 'new_message',
      title: 'Nuevo mensaje',
      message: senderData?.username 
        ? `${senderData.username} te envió un mensaje`
        : 'Tienes un nuevo mensaje',
      data: { 
        message_id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        message: message,
      },
      sender_id: message.sender_id as string,
      sender: senderData || undefined,
      read: false,
      created_at: new Date().toISOString(),
    };

    this.emitNotification(notification);
  }

  private async handleFollowEvent(
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>, 
    eventType: 'new' | 'update'
  ): Promise<void> {
    const follow = payload.new as Record<string, unknown>;
    
    // Build a deterministic ID from the composite key (no `id` column exists)
    const compositeId = `${follow.follower_id}::${follow.following_id}`;

    // Get the other user's info
    const otherUserId = eventType === 'new' ? follow.follower_id : follow.following_id;
    
    const { data: otherUser } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', otherUserId as string)
      .single();

    const otherUserData = otherUser as { username: string; avatar_url: string | null } | null;
    let notification: Notification;

    if (eventType === 'new' && follow.status === 'pending') {
      notification = {
        id: `follow_req_${compositeId}`,
        type: 'follow_request',
        title: 'Nueva solicitud',
        message: `${otherUserData?.username || 'Alguien'} quiere seguirte`,
        data: { follower_id: follow.follower_id, following_id: follow.following_id },
        sender_id: otherUserId as string,
        sender: otherUserData || undefined,
        read: false,
        created_at: new Date().toISOString(),
      };
    } else if (eventType === 'new' && follow.status === 'accepted') {
      notification = {
        id: `follow_${compositeId}`,
        type: 'new_follower',
        title: 'Nuevo seguidor',
        message: `${otherUserData?.username || 'Alguien'} comenzó a seguirte`,
        data: { follower_id: follow.follower_id, following_id: follow.following_id },
        sender_id: otherUserId as string,
        sender: otherUserData || undefined,
        read: false,
        created_at: new Date().toISOString(),
      };
    } else if (eventType === 'update' && follow.status === 'accepted') {
      notification = {
        id: `follow_accepted_${compositeId}`,
        type: 'follow_accepted',
        title: 'Solicitud aceptada',
        message: `${otherUserData?.username || 'Alguien'} aceptó tu solicitud`,
        data: { follower_id: follow.follower_id, following_id: follow.following_id },
        sender_id: otherUserId as string,
        sender: otherUserData || undefined,
        read: false,
        created_at: new Date().toISOString(),
      };
    } else {
      return; // Ignore other cases
    }

    this.emitNotification(notification);
  }

  private handleNotificationInsert(payload: RealtimePostgresChangesPayload<Record<string, unknown>>): void {
    const data = payload.new as Record<string, unknown>;
    
    const notification: Notification = {
      id: data.id as string,
      type: data.type as Notification['type'],
      title: data.title as string || 'Notificación',
      message: data.message as string || '',
      data: data.data as Record<string, unknown>,
      sender_id: (data.sender_id || data.actor_id) as string,
      read: false,
      created_at: data.created_at as string || new Date().toISOString(),
    };

    this.emitNotification(notification);
  }

  // Fallback handler for likes and comments when DB triggers are missing
  private async handleGlobalActivity(payload: any, type: 'like' | 'comment') {
    const activity = payload.new;
    
    // Ignore my own likes/comments
    if (activity.user_id === this.userId) return;

    try {
      // Check if this post belongs to me
      const { data: post } = await supabase
        .from('posts')
        .select('user_id, image_url')
        .eq('id', activity.post_id)
        .single();

      if (post?.user_id === this.userId) {
        // Fetch sender info
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', activity.user_id)
          .single();

        const senderName = profile?.username || profile?.full_name || 'Alguien';
        const message = type === 'like' 
          ? `@${senderName} le ha dado me gusta a tu publicación.`
          : `@${senderName} ha comentado en tu publicación.`;

        // Format to match NotificationList expected structure
        const notification: any = {
          id: `${type}_${activity.id || Date.now()}`,
          type: type,
          title: type === 'like' ? 'Nuevo me gusta' : 'Nuevo comentario',
          message: message,
          actor: {
            id: activity.user_id,
            username: profile?.username || '',
            name: senderName,
            avatar: profile?.avatar_url || null
          },
          image: post.image_url,
          postId: activity.post_id,
          timestamp: new Date(activity.created_at || new Date()).getTime(),
          time: 'Justo ahora',
          read: false,
          created_at: activity.created_at || new Date().toISOString()
        };

        this.emitNotification(notification);
      }
    } catch (err) {
      console.error('[RealtimeManager] Error processing global activity:', err);
    }
  }

  // Very robust fallback: Poll recent activity every 15 seconds if SQL Realtime config failed
  private async pollRecentActivity() {
    if (!this.userId) return;

    try {
      const now = Date.now();
      const cutoff = Math.max(this.lastPollTime, this.sessionStartTime);
      const timeSinceLastPoll = new Date(cutoff).toISOString();
      this.lastPollTime = now;

      // 1. Fetch our own posts
      const { data: myPosts } = await supabase
        .from('posts')
        .select('id, image_url')
        .eq('user_id', this.userId);

      if (!myPosts || myPosts.length === 0) return;

      const myPostIds = myPosts.map((p: any) => p.id);
      const postImageMap = new Map(myPosts.map((p: any) => [p.id, p.image_url]));

      // 2. Poll for new likes
      const { data: recentLikes } = await supabase
        .from('likes')
        .select('user_id, post_id, created_at, profiles!inner(username, full_name, avatar_url)')
        .in('post_id', myPostIds)
        .gt('created_at', timeSinceLastPoll);

      // 3. Poll for new comments
      const { data: recentComments } = await supabase
        .from('comments' as any)
        .select('id, user_id, post_id, created_at, content, profiles!inner(username, full_name, avatar_url)')
        .in('post_id', myPostIds)
        .gt('created_at', timeSinceLastPoll);

      // Process likes
      if (recentLikes) {
        recentLikes.forEach((like: any) => {
          if (like.user_id === this.userId) return;
          const profile = Array.isArray(like.profiles) ? like.profiles[0] : like.profiles;
          const senderName = profile?.username || profile?.full_name || 'Alguien';
          
          this.emitNotification({
            id: `like_${like.id || Date.now()}`,
            type: 'like',
            title: 'Nuevo me gusta',
            message: `@${senderName} le ha dado me gusta a tu publicación.`,
            actor: {
              id: like.user_id,
              username: profile?.username || '',
              name: senderName,
              avatar: profile?.avatar_url || null
            },
            image: postImageMap.get(like.post_id),
            postId: like.post_id,
            timestamp: new Date(like.created_at).getTime(),
            time: 'Justo ahora',
            read: false,
            created_at: like.created_at
          } as any);
        });
      }

      // Process comments
      if (recentComments) {
        recentComments.forEach((comment: any) => {
          if (comment.user_id === this.userId) return;
          const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
          const senderName = profile?.username || profile?.full_name || 'Alguien';
          
          this.emitNotification({
            id: `comment_${comment.id || Date.now()}`,
            type: 'comment',
            title: 'Nuevo comentario',
            message: `@${senderName} ha comentado: ${comment.content?.substring(0, 40) || ''}`,
            actor: {
              id: comment.user_id,
              username: profile?.username || '',
              name: senderName,
              avatar: profile?.avatar_url || null
            },
            image: postImageMap.get(comment.post_id),
            postId: comment.post_id,
            timestamp: new Date(comment.created_at).getTime(),
            time: 'Justo ahora',
            read: false,
            created_at: comment.created_at
          } as any);
        });
      }

    } catch (err) {
      console.error('[RealtimeManager] Polling fallback error:', err);
    }
  }

  private handlePresenceSync(state: Record<string, UserPresence[]>): void {
    this.onlineUsers.clear();
    Object.keys(state).forEach(userId => {
      this.onlineUsers.add(userId);
    });
    
    this.emitOnlineUsers();
    this.presenceCallbacks.forEach(cb => cb(state));
  }

  private handleTypingEvent(conversationId: string, event: TypingEvent): void {
    // Clear existing timeout for this user
    const timeoutKey = `${conversationId}:${event.user_id}`;
    const existingTimeout = this.typingTimeouts.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // If typing, set timeout to auto-clear
    if (event.is_typing) {
      const timeout = setTimeout(() => {
        this.handleTypingEvent(conversationId, {
          ...event,
          is_typing: false,
        });
      }, TIMING.TYPING_TIMEOUT);
      this.typingTimeouts.set(timeoutKey, timeout);
    }

    // Emit to callbacks
    const callbacks = this.typingCallbacks.get(conversationId);
    callbacks?.forEach(cb => cb(event));
  }

  // ============================================
  // EMITTERS
  // ============================================

  private emitNotification(notification: Notification): void {
    console.log('[RealtimeManager] New notification:', notification.type);
    this.notificationCallbacks.forEach(cb => cb(notification));
  }

  private emitOnlineUsers(): void {
    const userIds = Array.from(this.onlineUsers);
    this.onlineUsersCallbacks.forEach(cb => cb(userIds));
  }

  // ============================================
  // PUBLIC SUBSCRIPTION METHODS
  // ============================================

  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  onPresenceChange(callback: PresenceCallback): () => void {
    this.presenceCallbacks.add(callback);
    return () => this.presenceCallbacks.delete(callback);
  }

  onTyping(conversationId: string, callback: TypingCallback): () => void {
    if (!this.typingCallbacks.has(conversationId)) {
      this.typingCallbacks.set(conversationId, new Set());
    }
    this.typingCallbacks.get(conversationId)!.add(callback);
    
    return () => {
      this.typingCallbacks.get(conversationId)?.delete(callback);
    };
  }

  onOnlineUsersChange(callback: OnlineUsersCallback): () => void {
    this.onlineUsersCallbacks.add(callback);
    // Emit current state immediately
    callback(Array.from(this.onlineUsers));
    return () => this.onlineUsersCallbacks.delete(callback);
  }

  // ============================================
  // GETTERS
  // ============================================

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers);
  }

  // ============================================
  // CLEANUP
  // ============================================

  async cleanup(): Promise<void> {
    console.log('[RealtimeManager] Cleaning up...');
    
    // Clear all timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();

    // Clear poll interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Unsubscribe from all channels
    for (const [name, channel] of this.channels) {
      await supabase.removeChannel(channel);
      console.log('[RealtimeManager] Removed channel:', name);
    }
    
    this.channels.clear();
    this.presenceCallbacks.clear();
    this.typingCallbacks.clear();
    this.notificationCallbacks.clear();
    this.onlineUsersCallbacks.clear();
    this.onlineUsers.clear();
    
    this.userId = null;
    this.isInitialized = false;
    
    console.log('[RealtimeManager] Cleanup complete');
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();
export default realtimeManager;
