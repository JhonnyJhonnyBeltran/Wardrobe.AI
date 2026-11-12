'use client';

/**
 * NotificationToast - Triggers gentle haptic feedback for live notifications.
 * Visual notification indicator now renders as a clean pink dot above the Heart icon
 * in Sidebar (desktop) and TabBar (mobile) instead of oversized floating bubble PNGs.
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';
import { haptics } from '@/lib/haptic';

export const NotificationToastContainer = memo(function NotificationToastContainer(_props: {
  duration?: number;
  position?: string;
  maxVisible?: number;
}) {
  const notifications = useRealtimeStore(state => state.notifications);
  const isNotificationTypeAllowed = useNotificationSettingsStore(state => state.isNotificationTypeAllowed);
  const hapticPlayedIdsRef = useRef<Set<string>>(new Set());

  const newestFreshNotification = useMemo(() => {
    const now = Date.now();
    return notifications.find(n => {
      if (n.read || hapticPlayedIdsRef.current.has(n.id) || !isNotificationTypeAllowed(n.type)) return false;
      if (n.created_at) {
        const diff = now - new Date(n.created_at).getTime();
        if (diff > 40 * 1000) return false;
      }
      return true;
    }) || null;
  }, [notifications, isNotificationTypeAllowed]);

  useEffect(() => {
    if (!newestFreshNotification) return;
    hapticPlayedIdsRef.current.add(newestFreshNotification.id);
    try {
      haptics.notification();
    } catch {}
  }, [newestFreshNotification]);

  return null;
});

export default NotificationToastContainer;
