/**
 * useRealtime Hook
 * Hook principal que inicializa y gestiona la conexión de tiempo real
 * Debe usarse una vez en el componente raíz (RealtimeProvider)
 */

import { useEffect, useRef, useCallback } from 'react';
import { realtimeManager } from '@/lib/realtime';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useUser } from '@/store/userStore';

interface UseRealtimeOptions {
  /** Callback cuando llega una nueva notificación */
  onNotification?: (notification: import('@/lib/realtime').Notification) => void;
  /** Si debe conectar automáticamente */
  autoConnect?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { onNotification, autoConnect = true } = options;
  const { user } = useUser();
  const setConnected = useRealtimeStore(state => state.setConnected);
  const checkActivity = useRealtimeStore(state => state.checkActivity);
  const setOnlineUsers = useRealtimeStore(state => state.setOnlineUsers);
  const reset = useRealtimeStore(state => state.reset);
  const isConnected = useRealtimeStore(state => state.isConnected);
  const isInitializedRef = useRef(false);
  const onNotificationRef = useRef(onNotification);

  // Keep callback ref updated
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  // Initialize realtime connection
  useEffect(() => {
    if (!user?.id || !autoConnect || isInitializedRef.current) return;

    const initRealtime = async () => {
      try {
        console.log('[useRealtime] Initializing...');

        await realtimeManager.initialize(user.id, {
          username: user.name,
          avatar_url: user.avatar,
        });

        setConnected(true);
        isInitializedRef.current = true;

        // Initial fetch of unread activity count (Follows + System)
        if (checkActivity) {
          checkActivity(user.id).catch(console.error);
        }

        // Subscribe to notifications
        const unsubNotifications = realtimeManager.onNotification((notification) => {
          useRealtimeStore.getState().addNotification(notification);
          onNotificationRef.current?.(notification);
          // Optionally trigger a re-check if it's a relevant type
          if ((notification as any).type === 'follow') {
            if (checkActivity) checkActivity(user.id).catch(console.error);
          }
        });

        // Subscribe to online users
        const unsubOnline = realtimeManager.onOnlineUsersChange((users) => {
          setOnlineUsers(users);
        });

        // Store cleanup functions
        return () => {
          unsubNotifications();
          unsubOnline();
        };
      } catch (error) {
        console.error('[useRealtime] Initialization error:', error);
        setConnected(false);
      }
    };

    const cleanupPromise = initRealtime();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, [user?.id, user?.name, user?.avatar, autoConnect, setConnected, setOnlineUsers, checkActivity]);

  const userId = user?.id;

  // Cleanup on user logout
  useEffect(() => {
    if (!userId && isInitializedRef.current) {
      console.log('[useRealtime] User logged out, cleaning up...');
      realtimeManager.cleanup();
      reset();
      isInitializedRef.current = false;
    }
  }, [userId, reset]);

  // Manual connect function
  const connect = useCallback(async () => {
    if (!user?.id) return;

    await realtimeManager.initialize(user.id, {
      username: user.name,
      avatar_url: user.avatar,
    });
    setConnected(true);
    isInitializedRef.current = true;
  }, [user, setConnected]);

  // Manual disconnect function
  const disconnect = useCallback(async () => {
    await realtimeManager.cleanup();
    setConnected(false);
    isInitializedRef.current = false;
  }, [setConnected]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}

export default useRealtime;
