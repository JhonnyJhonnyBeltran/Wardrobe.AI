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

  // Initialize periodic 3-hour smart reminders
  usePeriodicReminders();

  // Initialize realtime listener with desktop notification support
  useRealtime({
    autoConnect: !!user?.id,
    onNotification: (notification) => {
      // Check user preferences
      if (!isNotificationTypeAllowed(notification.type)) {
        return;
      }

      // Show native desktop notification if permission granted
      if (showToasts && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted' && settings.popupToasts) {
          try {
            const targetUrl: string = typeof notification.data?.targetUrl === 'string'
              ? notification.data.targetUrl
              : (
                notification.type === 'new_message' && notification.data?.sender_id
                  ? `/messages/${notification.data.sender_id}`
                  : notification.type === 'like' || notification.type === 'comment'
                  ? `/post/${notification.data?.post_id || ''}`
                  : '/notifications'
              );

            const desktopNotif = new Notification(notification.title || 'Klozet', {
              body: notification.message || 'Tienes nueva actividad en Klozet',
              icon: notification.sender?.avatar_url || '/klozet-logo-dark.png',
              badge: '/klozet-logo-dark.png',
              tag: notification.id,
            });

            desktopNotif.onclick = () => {
              window.focus();
              if (targetUrl) {
                window.location.href = targetUrl;
              }
              desktopNotif.close();
            };
          } catch (err) {
            console.warn('Desktop notification error:', err);
          }
        }
      }

      // Call custom handler
      onNotification?.(notification);
    },
  });

  // Auto-request desktop notification permission if push setting is on and user is authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && user) {
      if (Notification.permission === 'default' && settings.popupToasts) {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [user, settings.popupToasts]);

  return <>{children}</>;
}

export default RealtimeProvider;
