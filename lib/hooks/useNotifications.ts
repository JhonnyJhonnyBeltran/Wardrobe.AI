/**
 * useNotifications Hook
 * Hook para acceder y gestionar las notificaciones en tiempo real
 */

import { useCallback, useMemo } from 'react';
import { useRealtimeStore } from '@/store/realtimeStore';
import type { Notification, NotificationType } from '@/lib/realtime';

interface UseNotificationsOptions {
  /** Filtrar por tipo de notificación */
  filterType?: NotificationType | NotificationType[];
  /** Mostrar solo no leídas */
  unreadOnly?: boolean;
  /** Límite de notificaciones */
  limit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { filterType, unreadOnly = false, limit } = options;

  const notifications = useRealtimeStore(state => state.notifications);
  const unreadCount = useRealtimeStore(state => state.unreadCount);
  const addNotification = useRealtimeStore(state => state.addNotification);
  const markAsRead = useRealtimeStore(state => state.markAsRead);
  const markAllAsRead = useRealtimeStore(state => state.markAllAsRead);
  const removeNotification = useRealtimeStore(state => state.removeNotification);
  const clearNotifications = useRealtimeStore(state => state.clearNotifications);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Filter by type
    if (filterType) {
      const types = Array.isArray(filterType) ? filterType : [filterType];
      result = result.filter(n => types.includes(n.type));
    }

    // Filter by read status
    if (unreadOnly) {
      result = result.filter(n => !n.read);
    }

    // Apply limit
    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [notifications, filterType, unreadOnly, limit]);

  // Group by type
  const groupedByType = useMemo(() => {
    return filteredNotifications.reduce((acc, notification) => {
      const type = notification.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(notification);
      return acc;
    }, {} as Record<NotificationType, Notification[]>);
  }, [filteredNotifications]);

  // Get notifications by type
  const getByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Check if there are unread notifications of a specific type
  const hasUnread = useCallback((type?: NotificationType) => {
    if (type) {
      return notifications.some(n => n.type === type && !n.read);
    }
    return unreadCount > 0;
  }, [notifications, unreadCount]);

  return {
    // Data
    notifications: filteredNotifications,
    allNotifications: notifications,
    unreadCount,
    groupedByType,
    
    // Checks
    hasUnread,
    hasNotifications: filteredNotifications.length > 0,
    
    // Actions
    getByType,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    
    // For testing/manual additions
    addNotification,
  };
}

export default useNotifications;
