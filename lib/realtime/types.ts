/**
 * Realtime Types
 * Definiciones de tipos para el sistema de tiempo real
 */

// ============================================
// PRESENCE TYPES
// ============================================

export interface UserPresence {
  user_id: string;
  username?: string;
  avatar_url?: string;
  online_at: string;
  status: 'online' | 'away' | 'offline';
}

export interface PresenceState {
  [key: string]: UserPresence[];
}

// ============================================
// TYPING INDICATOR TYPES
// ============================================

export interface TypingEvent {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  timestamp: string;
}

export interface TypingState {
  [conversationId: string]: {
    user_id: string;
    timestamp: number;
  }[];
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'new_message'
  | 'new_follower'
  | 'follow_request'
  | 'follow_accepted'
  | 'like'
  | 'comment'
  | 'mention'
  | 'outfit_shared'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sender_id?: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  read: boolean;
  created_at: string;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sender_id?: string;
}

// ============================================
// CHANNEL TYPES
// ============================================

export type ChannelType = 
  | 'global'           // Notificaciones globales del usuario
  | 'chat'             // Chat específico
  | 'presence'         // Estado online/offline
  | 'typing';          // Indicador de escritura

export interface ChannelConfig {
  type: ChannelType;
  id: string;
  userId: string;
}

// ============================================
// EVENT TYPES
// ============================================

export interface RealtimeEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

// ============================================
// CALLBACK TYPES
// ============================================

export type NotificationCallback = (notification: Notification) => void;
export type PresenceCallback = (presence: PresenceState) => void;
export type TypingCallback = (event: TypingEvent) => void;
export type OnlineStatusCallback = (userId: string, isOnline: boolean) => void;
