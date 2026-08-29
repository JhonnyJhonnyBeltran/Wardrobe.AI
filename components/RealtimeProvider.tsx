'use client';

/**
 * RealtimeProvider
 * Componente que inicializa el sistema de tiempo real,
 * recordatorios periódicos cada 3 horas y notificaciones de escritorio.
 */

import { useEffect } from 'react';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { usePeriodicReminders } from '@/lib/hooks/usePeriodicReminders';
import { useUser } from '@/store/userStore';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';
import { sendSystemNotification, requestSystemNotificationPermission } from '@/lib/notifications/desktopNotification';

interface RealtimeProviderProps {
  children: React.ReactNode;
  /** Mostrar notificaciones toast automáticamente */
  showToasts?: boolean;
  /** Callback para notificaciones personalizadas */
  onNotification?: (notification: import('@/lib/realtime').Notification) => void;
}

export function RealtimeProvider({ 
  children, 
  showToasts = true,
  onNotification 
}: RealtimeProviderProps) {
  const { user } = useUser();
  const { settings, isNotificationTypeAllowed } = useNotificationSettingsStore();

  // Register service worker for mobile/desktop native push notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('[ServiceWorker] Registration failed:', err);
        });
    }
  }, []);

  // Initialize periodic 3-hour smart reminders
  usePeriodicReminders();

  // Initialize realtime listener with desktop/mobile system notification support
  useRealtime({
    autoConnect: !!user?.id,
    onNotification: (notification) => {
      // Check user preferences
      if (!isNotificationTypeAllowed(notification.type)) {
        return;
      }

      // Show native desktop/mobile system notification ONLY for live fresh notifications (< 2 minutes old)
      const notifTime = notification.created_at ? new Date(notification.created_at).getTime() : Date.now();
      const isFresh = Date.now() - notifTime < 2 * 60 * 1000;

      if (showToasts && settings.popupToasts && isFresh) {
        const targetUrl: string = typeof notification.data?.targetUrl === 'string'
          ? notification.data.targetUrl
          : (
            notification.type === 'new_message' && notification.data?.sender_id
              ? `/messages/${notification.data.sender_id}`
              : notification.type === 'like' || notification.type === 'comment'
              ? `/post/${notification.data?.post_id || ''}`
              : '/notifications'
          );

        sendSystemNotification({
          title: notification.title || 'Klozet',
          body: notification.message || 'Tienes nueva actividad en Klozet',
          icon: notification.sender?.avatar_url || '/klozet-logo-dark.png',
          badge: '/klozet-logo-dark.png',
          tag: notification.id,
          data: { url: targetUrl }
        });
      }

      // Call custom handler
      onNotification?.(notification);
    },
  });

  // Auto-request desktop/mobile notification permission if setting is on and user is authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && user) {
      if (Notification.permission === 'default' && settings.popupToasts) {
        requestSystemNotificationPermission().catch(() => {});
      }
    }
  }, [user, settings.popupToasts]);

  return <>{children}</>;
}

export default RealtimeProvider;
