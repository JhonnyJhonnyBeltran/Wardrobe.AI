'use client';

/**
 * NotificationToast (Instagram / Pinterest style navbar popup)
 * Componente para mostrar popups flotantes sobre el icono de notificaciones del navbar
 */

import { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, UserPlus, Heart, Bell } from 'lucide-react';
import { useRealtimeStore } from '@/store/realtimeStore';
import { useNotificationSettingsStore } from '@/store/notificationSettingsStore';
import type { Notification, NotificationType } from '@/lib/realtime';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { haptics } from '@/lib/haptic';

// Filled white icons for Instagram/Pinterest style
const getNotificationFilledIcon = (type: NotificationType) => {
  switch (type) {
    case 'like':
      return (
        <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shrink-0 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-white text-white" />
        </div>
      );
    case 'comment':
      return (
        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-xs">
          <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
        </div>
      );
    case 'new_follower':
    case 'follow_request':
    case 'follow_accepted':
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
          <UserPlus className="w-3.5 h-3.5 fill-white text-white" />
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-xs">
          <Bell className="w-3.5 h-3.5 fill-white text-white" />
        </div>
      );
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
  duration = 4200
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
        return '/notifications';
      case 'new_follower':
      case 'follow_accepted':
        return notification.sender_id
          ? `/profile/${notification.sender?.username || notification.sender_id}`
          : '/notifications';
      case 'like':
      case 'comment':
        const postId = notification.data?.post_id || notification.data?.postId || (notification as any).postId;
        return postId ? `/post/${postId}` : '/notifications';
      default:
        return '/notifications';
    }
  };

  const link = getLink();
  const actorName = notification.sender?.username || (notification as any).actor?.username || (notification as any).actor?.name || 'Alguien';
  const avatarUrl = notification.sender?.avatar_url || (notification as any).actor?.avatar || null;

  const actionText = useMemo(() => {
    if (notification.type === 'like') return 'le gustó tu foto';
    if (notification.type === 'comment') {
      const c = notification.data?.content || (notification as any).content || '';
      return c ? `"${c.slice(0, 24)}"` : 'comentó tu foto';
    }
    if (notification.type === 'new_follower') return 'empezó a seguirte';
    if (notification.type === 'follow_request') return 'quiere seguirte';
    if (notification.type === 'follow_accepted') return 'aceptó tu solicitud';
    return notification.title || 'nueva actividad';
  }, [notification]);

  return (
    <>
      {/* Mobile Anchor (Directly above Heart icon in bottom TabBar) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 16 }}
        transition={{ type: 'spring', stiffness: 480, damping: 26 }}
        className="fixed bottom-[80px] right-[16%] md:hidden z-[9999] pointer-events-auto"
      >
        <Link
          href={link}
          onClick={handleClick}
          className="relative flex items-center gap-2.5 bg-black/90 dark:bg-[#121218]/95 backdrop-blur-2xl border border-white/15 px-3 py-2 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-white select-none hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {avatarUrl ? (
            <div className="relative">
              <Avatar src={avatarUrl} alt={actorName} size="xs" />
              <div className="absolute -bottom-1 -right-1 scale-75">
                {getNotificationFilledIcon(notification.type)}
              </div>
            </div>
          ) : (
            getNotificationFilledIcon(notification.type)
          )}

          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[12px] font-bold text-white truncate max-w-[130px]">
              @{actorName}
            </span>
            <span className="text-[10.5px] text-white/75 truncate max-w-[140px] leading-tight">
              {actionText}
            </span>
          </div>

          {/* Notch / Arrow pointing down to Heart Icon */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-black/90 dark:bg-[#121218]/95 border-b border-r border-white/15 rotate-45" />
        </Link>
      </motion.div>

      {/* Desktop / PC Anchor (Directly to the right of Sidebar Heart Icon) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -16 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -16 }}
        transition={{ type: 'spring', stiffness: 480, damping: 26 }}
        className="hidden md:flex fixed left-[82px] top-[260px] z-[9999] pointer-events-auto"
      >
        <Link
          href={link}
          onClick={handleClick}
          className="relative flex items-center gap-2.5 bg-black/90 dark:bg-[#121218]/95 backdrop-blur-2xl border border-white/15 px-3.5 py-2.5 rounded-2xl shadow-[0_14px_36px_rgba(0,0,0,0.5)] text-white select-none hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {avatarUrl ? (
            <div className="relative">
              <Avatar src={avatarUrl} alt={actorName} size="xs" />
              <div className="absolute -bottom-1 -right-1 scale-75">
                {getNotificationFilledIcon(notification.type)}
              </div>
            </div>
          ) : (
            getNotificationFilledIcon(notification.type)
          )}

          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[12px] font-bold text-white truncate max-w-[150px]">
              @{actorName}
            </span>
            <span className="text-[11px] text-white/75 truncate max-w-[160px] leading-tight">
              {actionText}
            </span>
          </div>

          {/* Notch / Arrow pointing left to Sidebar Heart */}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-black/90 dark:bg-[#121218]/95 border-b border-l border-white/15 rotate-45" />
        </Link>
      </motion.div>
    </>
  );
});

export const NotificationToastContainer = memo(function NotificationToastContainer({
  duration = 4200,
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
