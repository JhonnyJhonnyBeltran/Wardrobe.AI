/**
 * Realtime Constants
 * 
 * Configuración centralizada para el sistema de tiempo real.
 * Todas las constantes relacionadas con channels, eventos y timing.
 * 
 * Para modificar comportamientos como:
 * - Tiempo de timeout de typing indicator
 * - Máximo de notificaciones en memoria
 * - Nombres de canales
 * 
 * @module lib/realtime/constants
 */

// ============================================
// CHANNEL NAMES
// ============================================

export const CHANNELS = {
  /** Canal global para notificaciones del usuario */
  GLOBAL: (userId: string) => `global:${userId}`,
  
  /** Canal de presencia global */
  PRESENCE: 'presence:global',
  
  /** Canal de chat específico */
  CHAT: (conversationId: string) => `chat:${conversationId}`,
  
  /** Canal de typing para un chat */
  TYPING: (conversationId: string) => `typing:${conversationId}`,
} as const;

// ============================================
// BROADCAST EVENTS
// ============================================

export const EVENTS = {
  /** Usuario empezó/dejó de escribir */
  TYPING: 'typing',
  
  /** Nueva notificación */
  NOTIFICATION: 'notification',
  
  /** Mensaje leído */
  MESSAGE_READ: 'message_read',
  
  /** Usuario online/offline */
  PRESENCE_CHANGE: 'presence_change',
} as const;

// ============================================
// TIMING CONFIGURATION
// ============================================

export const TIMING = {
  /** Tiempo después del cual se considera que dejó de escribir (ms) */
  TYPING_TIMEOUT: 3000,
  
  /** Intervalo para enviar señal de typing mientras escribe (ms) */
  TYPING_THROTTLE: 1000,
  
  /** Tiempo para considerar usuario como "away" (ms) */
  AWAY_TIMEOUT: 5 * 60 * 1000, // 5 minutos
  
  /** Intervalo de heartbeat para presencia (ms) */
  PRESENCE_HEARTBEAT: 30000,
  
  /** Tiempo de debounce para notificaciones (ms) */
  NOTIFICATION_DEBOUNCE: 500,
} as const;

// ============================================
// LIMITS
// ============================================

export const LIMITS = {
  /** Máximo de notificaciones en memoria */
  MAX_NOTIFICATIONS: 100,
  
  /** Máximo de usuarios en lista de presencia */
  MAX_PRESENCE_USERS: 500,
} as const;

// ============================================
// DATABASE TABLES
// ============================================

export const TABLES = {
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  FOLLOWS: 'follows',
  PROFILES: 'profiles',
} as const;
