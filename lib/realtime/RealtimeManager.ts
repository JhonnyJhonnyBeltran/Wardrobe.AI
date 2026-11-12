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
  private isPolling = false;
  private focusCleanup: (() => void) | null = null;

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
      return;
    }

    // Cleanup previous connections
    if (this.isInitialized) {
      await this.cleanup();
    }

    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.lastPollTime = Date.now();

    try {
      // 1. Setup global notifications channel
      await this.setupGlobalChannel();

      // 2. Setup presence channel
      await this.setupPresenceChannel(userInfo);
      
      // Configure polling fallback (every 10s + on window focus/visibility) in case DB triggers or replication lag
      if (this.pollInterval) clearInterval(this.pollInterval);
      this.pollInterval = setInterval(() => this.pollRecentActivity(), 10000);

      if (typeof window !== 'undefined') {
        const triggerPoll = () => {
          if (document.visibilityState === 'visible') {
            this.pollRecentActivity();
          }
        };
        window.addEventListener('focus', triggerPoll);
        document.addEventListener('visibilitychange', triggerPoll);
        this.focusCleanup = () => {
          window.removeEventListener('focus', triggerPoll);
          document.removeEventListener('visibilitychange', triggerPoll);
        };
      }

      this.isInitialized = true;
    } catch (error) {
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
        const raw = payload?.payload ?? payload;
        if (raw) {
          this.emitNotification(this.normalizeNotification(raw));
        }
      });

    await channel.subscribe();

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
        this.onlineUsers.add(key);
        this.emitOnlineUsers();
      })
      .on('presence', { event: 'leave' }, (payload: any) => {
        const key = payload.key;
        this.onlineUsers.delete(key);
        this.emitOnlineUsers();
      });

    await channel.subscribe(async (status: any) => {
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
    const otherUserId = (eventType === 'new' ? follow.follower_id : follow.following_id) as string;
    if (!otherUserId || otherUserId === this.userId) return;
    
    const { data: otherUser } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', otherUserId)
      .single();

    const otherUserData = otherUser as { id: string; username: string; full_name?: string | null; avatar_url: string | null } | null;
    const displayName = otherUserData?.username || otherUserData?.full_name || 'Alguien';
    const createdAt = (follow.created_at as string) || new Date().toISOString();

    if (eventType === 'new' && follow.status === 'pending') {
      this.emitNotification(this.normalizeNotification({
        id: `follow_req_${compositeId}`,
        type: 'follow_request',
        title: 'Nueva solicitud',
        message: `@${displayName} quiere seguirte`,
        data: { follower_id: follow.follower_id, following_id: follow.following_id, actor_id: otherUserId },
        sender_id: otherUserId,
        actor_id: otherUserId,
        entity_id: otherUserId,
        sender: otherUserData || undefined,
        read: false,
        created_at: createdAt,
      }));
    } else if (eventType === 'new' && follow.status === 'accepted') {
      this.emitNotification(this.normalizeNotification({
        id: `follow_${compositeId}`,
        type: 'follow',
        title: 'Nuevo seguidor',
        message: `@${displayName} comenzó a seguirte.`,
        data: { follower_id: follow.follower_id, following_id: follow.following_id, actor_id: otherUserId },
        sender_id: otherUserId,
        actor_id: otherUserId,
        entity_id: otherUserId,
        sender: otherUserData || undefined,
        read: false,
        created_at: createdAt,
      }));
    } else if (eventType === 'update' && follow.status === 'accepted') {
      this.emitNotification(this.normalizeNotification({
        id: `follow_accepted_${compositeId}`,
        type: 'follow_accepted',
        title: 'Solicitud aceptada',
        message: `@${displayName} aceptó tu solicitud de seguimiento.`,
        data: { follower_id: follow.follower_id, following_id: follow.following_id, actor_id: otherUserId },
        sender_id: otherUserId,
        actor_id: otherUserId,
        entity_id: otherUserId,
        sender: otherUserData || undefined,
        read: false,
        created_at: createdAt,
      }));
    } else {
      return; // Ignore other cases
    }
  }

  private normalizeNotification(raw: any): Notification {
    const rawType = raw?.type === 'new_follower' ? 'follow' : (raw?.type || 'system');
    const dataObj = (raw?.data && typeof raw.data === 'object' ? raw.data : {}) as Record<string, any>;
    const senderId =
      raw?.actor_id ||
      raw?.sender_id ||
      raw?.actor?.id ||
      dataObj.actor_id ||
      dataObj.sender_id ||
      dataObj.follower_id ||
      '';

    const username =
      raw?.actor?.username ||
      raw?.sender?.username ||
      dataObj.actor_username ||
      '';
    const name =
      raw?.actor?.name ||
      raw?.sender?.full_name ||
      username ||
      dataObj.actor_name ||
      'Alguien';
    const avatar =
      raw?.actor?.avatar ??
      raw?.sender?.avatar_url ??
      dataObj.actor_avatar ??
      null;

    const postId =
      raw?.postId ||
      raw?.entity_id ||
      raw?.resource_id ||
      dataObj.post_id ||
      undefined;

    const createdAt = raw?.created_at || new Date().toISOString();
    const timestamp =
      typeof raw?.timestamp === 'number'
        ? raw.timestamp
        : new Date(createdAt).getTime();

    return {
      ...raw,
      id: String(raw?.id || `${rawType}_${senderId || 'sys'}_${postId || timestamp}`),
      type: rawType,
      title: raw?.title || 'Notificación',
      message: raw?.message || '',
      data: {
        ...dataObj,
        ...(senderId ? { actor_id: senderId } : {}),
        ...(postId ? { post_id: postId } : {}),
      },
      sender_id: senderId || undefined,
      actor_id: senderId || undefined,
      entity_id: postId || raw?.entity_id || senderId || undefined,
      sender: raw?.sender || (username || avatar ? { username, avatar_url: avatar } : undefined),
      actor: senderId || username || name !== 'Alguien'
        ? {
            id: senderId || 'unknown',
            username,
            name,
            avatar,
          }
        : undefined,
      postId,
      image: raw?.image ?? dataObj.post_image ?? undefined,
      content: raw?.content ?? dataObj.content ?? undefined,
      timestamp,
      time: raw?.time || 'Justo ahora',
      read: Boolean(raw?.read),
      created_at: createdAt,
    } as Notification;
  }

  private async handleNotificationInsert(payload: RealtimePostgresChangesPayload<Record<string, unknown>>): Promise<void> {
    const data = payload.new as Record<string, unknown>;
    if (!data) return;

    const dataJson = (data.data && typeof data.data === 'object' ? data.data : {}) as Record<string, any>;
    const senderId = (data.sender_id || data.actor_id || dataJson.actor_id || dataJson.sender_id) as string | undefined;
    if (senderId && senderId === this.userId) return;

    let senderInfo: { username: string; full_name?: string | null; avatar_url: string | null } | undefined = undefined;
    const postId = (data.entity_id || data.resource_id || dataJson.post_id) as string | undefined;
    let postImage = dataJson.post_image as string | undefined;

    if (senderId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', senderId)
          .single();
        if (profile) {
          senderInfo = profile as { username: string; full_name?: string | null; avatar_url: string | null };
        }
      } catch {}
    }

    if (postId && !postImage && (data.type === 'like' || data.type === 'comment')) {
      try {
        const { data: post } = await supabase
          .from('posts')
          .select('image_url')
          .eq('id', postId)
          .single();
        if (post?.image_url) {
          postImage = post.image_url;
        }
      } catch {}
    }

    const notification = this.normalizeNotification({
      id: (data.id as string) || `notif_${Date.now()}`,
      type: data.type as string,
      title: (data.title as string) || 'Notificación',
      message: (data.message as string) || '',
      data: dataJson,
      sender_id: senderId,
      actor_id: senderId,
      entity_id: (data.entity_id as string) || postId,
      postId,
      image: postImage,
      sender: senderInfo,
      read: Boolean(data.read),
      created_at: (data.created_at as string) || new Date().toISOString(),
    });

    this.emitNotification(notification);
  }

  // Fallback handler for likes and comments when DB triggers are missing
  private async handleGlobalActivity(payload: any, type: 'like' | 'comment') {
    const activity = payload.new;
    if (!activity) return;
    
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

        const notification = this.normalizeNotification({
          id: `${type}_${activity.id || `${activity.user_id}_${activity.post_id}`}`,
          type,
          title: type === 'like' ? 'Nuevo me gusta' : 'Nuevo comentario',
          message,
          sender_id: activity.user_id,
          actor_id: activity.user_id,
          entity_id: activity.post_id,
          sender: profile ? { username: profile.username, full_name: profile.full_name, avatar_url: profile.avatar_url } : undefined,
          data: { post_id: activity.post_id, actor_id: activity.user_id },
          actor: {
            id: activity.user_id,
            username: profile?.username || '',
            name: senderName,
            avatar: profile?.avatar_url || null
          },
          image: post.image_url,
          postId: activity.post_id,
          content: activity.content,
          timestamp: new Date(activity.created_at || new Date()).getTime(),
          time: 'Justo ahora',
          read: false,
          created_at: activity.created_at || new Date().toISOString()
        });

        this.emitNotification(notification);
      }
    } catch (err) {
      console.error('[RealtimeManager] Error processing global activity:', err);
    }
  }

  // Fallback: Poll recent likes, comments, and follows every 10s + on window focus
  private async pollRecentActivity() {
    if (!this.userId || this.isPolling) return;
    this.isPolling = true;

    try {
      const now = Date.now();
      const cutoff = Math.max(this.lastPollTime, this.sessionStartTime);
      const timeSinceLastPoll = new Date(cutoff).toISOString();

      // 1. Fetch our own posts and new follows in parallel
      const [{ data: myPosts }, { data: recentFollows }] = await Promise.all([
        supabase
          .from('posts')
          .select('id, image_url')
          .eq('user_id', this.userId),
        supabase
          .from('follows')
          .select('follower_id, following_id, status, created_at')
          .eq('following_id', this.userId)
          .gt('created_at', timeSinceLastPoll),
      ]);

      const myPostIds = (myPosts || []).map((p: any) => p.id);
      const postImageMap = new Map((myPosts || []).map((p: any) => [p.id, p.image_url]));

      let recentLikes: any[] = [];
      let recentComments: any[] = [];

      if (myPostIds.length > 0) {
        const [likesRes, commentsRes] = await Promise.all([
          supabase
            .from('likes')
            .select('user_id, post_id, created_at')
            .in('post_id', myPostIds)
            .gt('created_at', timeSinceLastPoll),
          supabase
            .from('comments' as any)
            .select('id, user_id, post_id, created_at, content')
            .in('post_id', myPostIds)
            .gt('created_at', timeSinceLastPoll),
        ]);
        recentLikes = likesRes.data || [];
        recentComments = commentsRes.data || [];
      }

      // 2. Batch-fetch actor profiles (FKs point to auth.users, not public.profiles)
      const actorIds = Array.from(new Set([
        ...recentLikes.map((l: any) => l.user_id),
        ...recentComments.map((c: any) => c.user_id),
        ...(recentFollows || []).map((f: any) => f.follower_id),
      ].filter((id): id is string => Boolean(id) && id !== this.userId)));

      const profileMap = new Map<string, { username: string; full_name?: string | null; avatar_url: string | null }>();
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', actorIds);
        (profiles || []).forEach((p: any) => {
          profileMap.set(p.id, p);
        });
      }

      // 3. Emit likes
      recentLikes.forEach((like: any) => {
        if (like.user_id === this.userId) return;
        const profile = profileMap.get(like.user_id);
        const senderName = profile?.username || profile?.full_name || 'Alguien';

        this.emitNotification(this.normalizeNotification({
          id: `like_${like.user_id}_${like.post_id}`,
          type: 'like',
          title: 'Nuevo me gusta',
          message: `@${senderName} le ha dado me gusta a tu publicación.`,
          sender_id: like.user_id,
          actor_id: like.user_id,
          entity_id: like.post_id,
          sender: profile ? { username: profile.username, avatar_url: profile.avatar_url } : undefined,
          actor: {
            id: like.user_id,
            username: profile?.username || '',
            name: senderName,
            avatar: profile?.avatar_url || null,
          },
          image: postImageMap.get(like.post_id),
          postId: like.post_id,
          read: false,
          created_at: like.created_at,
        }));
      });

      // 4. Emit comments
      recentComments.forEach((comment: any) => {
        if (comment.user_id === this.userId) return;
        const profile = profileMap.get(comment.user_id);
        const senderName = profile?.username || profile?.full_name || 'Alguien';

        this.emitNotification(this.normalizeNotification({
          id: `comment_${comment.id || `${comment.user_id}_${comment.post_id}`}`,
          type: 'comment',
          title: 'Nuevo comentario',
          message: `@${senderName} ha comentado: ${comment.content?.substring(0, 40) || ''}`,
          sender_id: comment.user_id,
          actor_id: comment.user_id,
          entity_id: comment.post_id,
          sender: profile ? { username: profile.username, avatar_url: profile.avatar_url } : undefined,
          actor: {
            id: comment.user_id,
            username: profile?.username || '',
            name: senderName,
            avatar: profile?.avatar_url || null,
          },
          image: postImageMap.get(comment.post_id),
          postId: comment.post_id,
          content: comment.content,
          read: false,
          created_at: comment.created_at,
        }));
      });

      // 5. Emit follows / follow requests
      (recentFollows || []).forEach((follow: any) => {
        if (follow.follower_id === this.userId) return;
        const profile = profileMap.get(follow.follower_id);
        const senderName = profile?.username || profile?.full_name || 'Alguien';
        const isPending = follow.status === 'pending';

        this.emitNotification(this.normalizeNotification({
          id: `${isPending ? 'follow_req' : 'follow'}_${follow.follower_id}::${follow.following_id}`,
          type: isPending ? 'follow_request' : 'follow',
          title: isPending ? 'Nueva solicitud de seguimiento' : 'Nuevo seguidor',
          message: isPending
            ? `@${senderName} quiere seguirte.`
            : `@${senderName} comenzó a seguirte.`,
          sender_id: follow.follower_id,
          actor_id: follow.follower_id,
          entity_id: follow.follower_id,
          sender: profile ? { username: profile.username, avatar_url: profile.avatar_url } : undefined,
          actor: {
            id: follow.follower_id,
            username: profile?.username || '',
            name: senderName,
            avatar: profile?.avatar_url || null,
          },
          read: false,
          created_at: follow.created_at,
        }));
      });

      this.lastPollTime = now;
    } catch (err) {
      console.error('[RealtimeManager] Polling fallback error:', err);
    } finally {
      this.isPolling = false;
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
    this.notificationCallbacks.forEach(cb => cb(notification));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('klozet:new_notification', { detail: notification }));
    }
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
    // Clear all timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();

    // Clear poll interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.focusCleanup) {
      this.focusCleanup();
      this.focusCleanup = null;
    }

    // Unsubscribe from all channels
    for (const [, channel] of this.channels) {
      await supabase.removeChannel(channel);
    }
    
    this.channels.clear();
    this.presenceCallbacks.clear();
    this.typingCallbacks.clear();
    this.notificationCallbacks.clear();
    this.onlineUsersCallbacks.clear();
    this.onlineUsers.clear();
    
    this.userId = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();
export default realtimeManager;
