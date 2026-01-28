'use client';

/**
 * RealtimeProvider
 * Componente que inicializa el sistema de tiempo real
 * Debe envolver la aplicación para que funcionen los hooks de realtime
 */

import { useEffect } from 'react';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { useUser } from '@/store/userStore';

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

  // Initialize realtime
  useRealtime({
    autoConnect: !!user?.id,
    onNotification: (notification) => {
      // Show browser notification if permission granted
      if (showToasts && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          // Only show for important notifications when tab is not focused
          if (document.hidden) {
            new Notification(notification.title, {
              body: notification.message,
              icon: notification.sender?.avatar_url || '/icon-192.png',
              tag: notification.id,
            });
          }
        }
      }

      // Call custom handler
      onNotification?.(notification);
    },
  });

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Don't request immediately, wait for user interaction
        // This will be requested when user interacts with notifications
      }
    }
  }, []);

  return <>{children}</>;
}

export default RealtimeProvider;
