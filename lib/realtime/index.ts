/**
 * Realtime Module - Central exports
 * Sistema de tiempo real para notificaciones, presencia y chat
 */

// Core
export { realtimeManager, default as RealtimeManager } from './RealtimeManager';

// Types
export type {
  UserPresence,
  PresenceState,
  TypingEvent,
  TypingState,
  Notification,
  NotificationType,
  NotificationPayload,
  ChannelType,
  ChannelConfig,
  RealtimeEvent,
  NotificationCallback,
  PresenceCallback,
  TypingCallback,
  OnlineStatusCallback,
} from './types';

// Constants
export { CHANNELS, EVENTS, TIMING, LIMITS, TABLES } from './constants';
