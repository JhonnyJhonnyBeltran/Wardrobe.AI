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

  // Callbacks
  private presenceCallbacks: Set<PresenceCallback> = new Set();
  private typingCallbacks: Map<string, Set<TypingCallback>> = new Map();
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private onlineUsersCallbacks: Set<OnlineUsersCallback> = new Set();

  // State
  private onlineUsers: Set<string> = new Set();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

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
    console.log('[RealtimeManager] Initializing for user:', userId);

    try {
      // 1. Setup global notifications channel
      await this.setupGlobalChannel();

      // 2. Setup presence channel
      await this.setupPresenceChannel(userInfo);

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
        (payload) => this.handleNewMessage(payload)
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
        (payload) => this.handleFollowEvent(payload, 'new')
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
        (payload) => this.handleFollowEvent(payload, 'update')
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
        (payload) => this.handleNotificationInsert(payload)
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
        const state = channel.presenceState<UserPresence>();
        this.handlePresenceSync(state);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('[RealtimeManager] User joined:', key);
        this.onlineUsers.add(key);
        this.emitOnlineUsers();
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('[RealtimeManager] User left:', key);
        this.onlineUsers.delete(key);
        this.emitOnlineUsers();
      });

    await channel.subscribe(async (status) => {
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
      sender_id: data.sender_id as string,
      read: false,
      created_at: data.created_at as string || new Date().toISOString(),
    };

    this.emitNotification(notification);
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
