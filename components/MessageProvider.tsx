/**
 * MessageProvider Component
 * Inicializa el sistema de notificaciones de mensajes a nivel de aplicación
 * 
 * Características:
 * - Fetch inicial de mensajes no leídos
 * - Suscripción a tiempo real para nuevos mensajes
 * - Sincronización automática del estado
 */

'use client';

import { useEffect } from 'react';
import { useUser } from '@/store/userStore';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';

interface MessageProviderProps {
  children: React.ReactNode;
}

export default function MessageProvider({ children }: MessageProviderProps) {
  const { user } = useUser();
  
  // Initialize the unread messages system
  // autoFetch: true - fetches unread count on mount
  // enableRealtime: true - subscribes to new messages
  const { fetchUnreadMessages } = useUnreadMessages({
    autoFetch: true,
    enableRealtime: true,
  });

  // Refetch when user changes (login/logout)
  useEffect(() => {
    if (user?.id) {
      fetchUnreadMessages();
    }
  }, [user?.id, fetchUnreadMessages]);

  return <>{children}</>;
}
