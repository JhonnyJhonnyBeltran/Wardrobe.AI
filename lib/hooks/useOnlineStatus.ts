/**
 * useOnlineStatus Hook
 * Hook para gestionar y consultar el estado online/offline de usuarios
 */

import { useCallback, useMemo } from 'react';
import { useRealtimeStore } from '@/store/realtimeStore';
import { realtimeManager } from '@/lib/realtime';

interface UseOnlineStatusOptions {
  /** IDs de usuarios específicos a observar */
  userIds?: string[];
}

interface OnlineUser {
  userId: string;
  isOnline: boolean;
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { userIds } = options;

  const onlineUsers = useRealtimeStore(state => state.onlineUsers);
  const isConnected = useRealtimeStore(state => state.isConnected);

  // Check if a specific user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Get online status for specific users
  const usersStatus = useMemo((): OnlineUser[] => {
    if (!userIds || userIds.length === 0) return [];
    
    return userIds.map(userId => ({
      userId,
      isOnline: onlineUsers.includes(userId),
    }));
  }, [userIds, onlineUsers]);

  // Filter only online users from a list
  const filterOnline = useCallback((ids: string[]): string[] => {
    return ids.filter(id => onlineUsers.includes(id));
  }, [onlineUsers]);

  // Filter only offline users from a list
  const filterOffline = useCallback((ids: string[]): string[] => {
    return ids.filter(id => !onlineUsers.includes(id));
  }, [onlineUsers]);

  // Get count of online users
  const onlineCount = useMemo(() => {
    if (userIds) {
      return userIds.filter(id => onlineUsers.includes(id)).length;
    }
    return onlineUsers.length;
  }, [userIds, onlineUsers]);

  return {
    // Data
    onlineUsers,
    onlineCount,
    usersStatus,
    
    // Checks
    isUserOnline,
    isConnected,
    
    // Filters
    filterOnline,
    filterOffline,
  };
}

export default useOnlineStatus;
