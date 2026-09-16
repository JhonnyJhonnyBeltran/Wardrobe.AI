'use client';

/**
 * NotificationToast (Popups con imágenes de diseño para Móvil y PC)
 * Muestra las imágenes personalizadas de notificación situadas sobre el icono de notificaciones
 */

import { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';
import type { Notification, NotificationType } from '@/lib/realtime';
import Link from 'next/link';
import Image from 'next/image';
import { haptics } from '@/lib/haptic';

// Helper to get image path based on type and platform
const getNotificationImageSrc = (type: NotificationType | string, isMobile: boolean) => {
  const suffix = isMobile ? 'mobile' : 'pc';
  switch (type) {
    case 'like':
      return `/notifications/notif-like-${suffix}.png`;
    case 'comment':
      return `/notifications/notif-comment-${suffix}.png`;
    case 'new_follower':
    case 'follow':
    case 'follow_request':
    case 'follow_accepted':
      return `/notifications/notif-follow-${suffix}.png`;
    default:
      return `/notifications/notif-like-${suffix}.png`;
  }
};

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  duration?: number;
}

const NavbarNotificationPopup = memo(function NavbarNotificationPopup({
  notification,
  onDismiss,
  duration = 4500
}: ToastProps) {
  const markAsRead = useRealtimeStore(state => state.markAsRead);

  useEffect(() => {
    try {
      haptics.notification();
    } catch {}

    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, duration, onDismiss]);

  const handleClick = () => {
    markAsRead(notification.id);
    onDismiss(notification.id);
  };

  const getLink = (): string => {
    switch (notification.type) {
      case 'new_message':
        return notification.data?.sender_id
          ? `/messages/${notification.data.sender_id}`
          : '/messages';
      case 'follow_request':
      case 'new_follower':
      case 'follow_accepted':
        return '/notifications';
      case 'like':
      case 'comment':
        const postId = notification.data?.post_id || notification.data?.postId || (notification as any).postId || (notification as any).entity_id;
        return postId ? `/post/${postId}` : '/notifications';
      default:
        return '/notifications';
    }
  };

  const link = getLink();
  const mobileImageSrc = getNotificationImageSrc(notification.type, true);
  const pcImageSrc = getNotificationImageSrc(notification.type, false);

  return (
    <>
      {/* Mobile Anchor (Directly centered above Heart icon in bottom TabBar at 70% width) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 15 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px)+6px)] left-[70%] -translate-x-1/2 md:hidden z-[9999] pointer-events-auto"
      >
        <Link
          href={link}
          onClick={handleClick}
          className="block relative active:scale-95 transition-transform"
        >
          <div className="w-[145px] sm:w-[160px] h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
            <img
              src={mobileImageSrc}
              alt="Notificación"
              className="w-full h-auto object-contain pointer-events-none select-none"
            />
          </div>
        </Link>
      </motion.div>

      {/* Desktop / PC Anchor (Directly to the right of Sidebar Heart Icon) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, x: -15 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.85, x: -15 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="hidden md:flex fixed left-[76px] top-[305px] -translate-y-1/2 z-[9999] pointer-events-auto"
      >
        <Link
          href={link}
          onClick={handleClick}
          className="block relative hover:scale-[1.02] active:scale-98 transition-transform"
        >
          <div className="w-[185px] lg:w-[205px] h-auto drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]">
            <img
              src={pcImageSrc}
              alt="Notificación"
              className="w-full h-auto object-contain pointer-events-none select-none"
            />
          </div>
        </Link>
      </motion.div>
    </>
  );
});

export const NotificationToastContainer = memo(function NotificationToastContainer({
  duration = 4500,
}: {
  duration?: number;
  position?: string;
  maxVisible?: number;
}) {
  const notifications = useRealtimeStore(state => state.notifications);
  const isNotificationTypeAllowed = useNotificationSettingsStore(state => state.isNotificationTypeAllowed);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Show only the freshest active notification (< 40s) that is unread and not dismissed
  const activeNotification = useMemo(() => {
    const now = Date.now();
    return notifications.find(n => {
      if (n.read || dismissedIds.has(n.id) || !isNotificationTypeAllowed(n.type)) return false;
      if (n.created_at) {
        const diff = now - new Date(n.created_at).getTime();
        if (diff > 40 * 1000) return false;
      }
      return true;
    }) || null;
  }, [notifications, dismissedIds, isNotificationTypeAllowed]);

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  }, []);

  if (!activeNotification) return null;

  return (
    <AnimatePresence mode="wait">
      <NavbarNotificationPopup
        key={activeNotification.id}
        notification={activeNotification}
        onDismiss={handleDismiss}
        duration={duration}
      />
    </AnimatePresence>
  );
});

export default NotificationToastContainer;
