'use client';

/**
 * NotificationToast
 * Componente para mostrar notificaciones toast en tiempo real
 */

import { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, UserPlus, Heart, Bell } from 'lucide-react';
import { useRealtimeStore } from '@/store/realtimeStore';
import type { Notification, NotificationType } from '@/lib/realtime';
import Link from 'next/link';
import Avatar from '@/components/Avatar';

// ============================================
// ICON MAPPING
// ============================================

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  new_message: <MessageCircle className="w-5 h-5" />,
  new_follower: <UserPlus className="w-5 h-5" />,
  follow_request: <UserPlus className="w-5 h-5" />,
  follow_accepted: <UserPlus className="w-5 h-5" />,
  like: <Heart className="w-5 h-5" />,
  comment: <MessageCircle className="w-5 h-5" />,
  mention: <Bell className="w-5 h-5" />,
  outfit_shared: <Bell className="w-5 h-5" />,
  system: <Bell className="w-5 h-5" />,
};

const notificationColors: Record<NotificationType, string> = {
  new_message: 'bg-blue-500',
  new_follower: 'bg-green-500',
  follow_request: 'bg-yellow-500',
  follow_accepted: 'bg-green-500',
  like: 'bg-pink-500',
  comment: 'bg-purple-500',
  mention: 'bg-indigo-500',
  outfit_shared: 'bg-pink-500',
  system: 'bg-gray-500',
};

// ============================================
// SINGLE TOAST COMPONENT
// ============================================

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  duration?: number;
}

const Toast = memo(function Toast({
  notification,
  onDismiss,
  duration = 5000
}: ToastProps) {
  const markAsRead = useRealtimeStore(state => state.markAsRead);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  const handleClick = () => {
    markAsRead(notification.id);
    onDismiss(notification.id);
  };

  const getLink = (): string | null => {
    switch (notification.type) {
      case 'new_message':
        return notification.data?.sender_id
          ? `/messages/${notification.data.sender_id}`
          : '/messages';
      case 'follow_request':
        return '/profile?tab=requests';
      case 'new_follower':
      case 'follow_accepted':
        return notification.sender_id
          ? `/profile/${notification.sender_id}`
          : '/profile';
      case 'like':
      case 'comment':
        const postId = notification.data?.post_id || notification.data?.postId;
        return postId ? `/post/${postId}` : '/profile';
      default:
        return null;
    }
  };

  const link = getLink();
  const content = (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full 
        flex items-center justify-center text-white relative
        ${!notification.sender?.avatar_url || notification.sender?.avatar_url?.includes('default user.png') ? notificationColors[notification.type] : ''}
      `}>
        {notification.sender?.avatar_url && !notification.sender?.avatar_url?.includes('default user.png') ? (
          <Avatar 
            src={notification.sender.avatar_url} 
            alt={notification.sender.username || 'Usuario'} 
            size="md" 
            className="w-full h-full"
          />
        ) : (
          notificationIcons[notification.type]
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {notification.title || (
            notification.type === 'like' ? 'Nuevo me gusta' :
            notification.type === 'comment' ? 'Nuevo comentario' :
            notification.type === 'follow_accepted' ? 'Solicitud aceptada' :
            notification.type === 'follow_request' ? 'Nueva solicitud de seguimiento' :
            'Nueva notificación'
          )}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {notification.message || (
            notification.type === 'like' ? 'A alguien le ha gustado tu publicación' :
            notification.type === 'comment' ? 'Alguien ha comentado en tu publicación' :
            notification.type === 'follow_accepted' ? 'Han aceptado tu solicitud de seguimiento' :
            notification.type === 'follow_request' ? 'Alguien quiere seguirte' :
            'Tienes nueva actividad'
          )}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto"
    >
      {link ? (
        <Link href={link} onClick={handleClick}>
          <div className="
            bg-[var(--card-bg)]
            rounded-full shadow-lg 
            border border-[var(--border-color)]
            px-5 py-3 max-w-sm w-full
            cursor-pointer hover:bg-[var(--background-secondary)]
            transition-colors
          ">
            {content}
          </div>
        </Link>
      ) : (
        <div
          onClick={handleClick}
          className="
            bg-[var(--card-bg)]
            rounded-full shadow-lg 
            border border-[var(--border-color)]
            px-5 py-3 max-w-sm w-full
            cursor-pointer hover:bg-[var(--background-secondary)]
            transition-colors
          "
        >
          {content}
        </div>
      )}
    </motion.div>
  );
});

// ============================================
// TOAST CONTAINER
// ============================================

interface NotificationToastContainerProps {
  /** Posición de los toasts */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  /** Máximo de toasts visibles */
  maxVisible?: number;
  /** Duración de cada toast (ms) */
  duration?: number;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

export const NotificationToastContainer = memo(function NotificationToastContainer({
  position = 'top-right',
  maxVisible = 3,
  duration = 5000,
}: NotificationToastContainerProps) {
  const notifications = useRealtimeStore(state => state.notifications);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Derive visible toasts from notifications (no useState needed)
  const visibleToasts = useMemo(() => {
    return notifications
      .filter(n => !n.read && !dismissedIds.has(n.id))
      .slice(0, maxVisible);
  }, [notifications, maxVisible, dismissedIds]);

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  }, []);

  return (
    <div
      className={`
        fixed z-50 pointer-events-none
        flex flex-col gap-2
        ${positionClasses[position]}
      `}
      role="region"
      aria-label="Notificaciones"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
            duration={duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

export default NotificationToastContainer;
