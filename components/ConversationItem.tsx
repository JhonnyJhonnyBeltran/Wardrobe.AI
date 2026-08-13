/**
 * ConversationItem Component
 * Componente para mostrar una conversación en la lista de mensajes
 * Con soporte para estado de leído/no leído estilo Instagram
 */

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { AvatarWithStatus } from '@/components/OnlineIndicator';

// ============================================
// TYPES
// ============================================

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ConversationItemProps {
  conversationId: string;
  otherUser: Profile | undefined;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSender: string | null;
  unreadCount?: number;
  currentUserId: string;
  onClick: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

// ============================================
// HELPERS
// ============================================

const formatTimeAgo = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 7) return `${diffDays} d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// ============================================
// COMPONENT
// ============================================

import { MoreVertical } from 'lucide-react';

export const ConversationItem = memo(function ConversationItem({
  conversationId,
  otherUser,
  lastMessageText,
  lastMessageAt,
  lastMessageSender,
  currentUserId,
  unreadCount = 0,
  onClick,
  onDelete,
  onReport,
}: ConversationItemProps) {
  // Check if this conversation has unread messages
  const hasUnread = unreadCount > 0;

  if (!otherUser) return null;

  const isFromMe = lastMessageSender === currentUserId;
  const displayName = otherUser.full_name || otherUser.username;
  const initial = (displayName || '?')[0].toUpperCase();

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`
        w-full flex items-center gap-3 p-4
        transition-all duration-200 group
        ${hasUnread
          ? 'bg-[var(--background-secondary)]/30 hover:bg-[var(--background-secondary)]'
          : 'hover:bg-[var(--background-secondary)]/30'
        }
      `}
      whileTap={{ scale: 0.98 }}
    >
      {/* Avatar with online status */}
      <AvatarWithStatus
        userId={otherUser.id}
        indicatorSize="md"
        showOnlyOnline
      >
        <div className={`
          w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border 
          ${hasUnread
            ? 'border-[var(--brand-pink)] ring-1 ring-[var(--brand-pink)] ring-offset-2 ring-offset-[var(--background)]'
            : 'border-[var(--border-color)] group-hover:border-[var(--foreground-tertiary)]'
          }
           transition-all
        `}>
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] font-bold text-lg">
              {initial}
            </div>
          )}
        </div>
      </AvatarWithStatus>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        {/* Name row */}
        <div className="flex items-center justify-between">
          <p className={`
            text-sm truncate mr-2
            ${hasUnread
              ? 'font-bold text-[var(--foreground)]'
              : 'font-medium text-[var(--foreground)]'
            }
          `}>
            {displayName}
          </p>
          {lastMessageAt && (
            <span className={`text-[11px] ${hasUnread ? 'text-[var(--brand-pink)] font-medium' : 'text-[var(--foreground-tertiary)]'}`}>
              {formatTimeAgo(lastMessageAt)}
            </span>
          )}
        </div>

        {/* Message preview */}
        <div className="flex items-center gap-2 mt-0.5">
          <p className={`
            text-[13px] truncate flex-1 leading-snug
            ${hasUnread
              ? 'text-[var(--foreground)] font-medium'
              : 'text-[var(--foreground-secondary)]'
            }
          `}>
            {lastMessageText
              ? `${isFromMe ? 'Tú: ' : ''}${lastMessageText}`
              : <span className="italic opacity-80">Inicia una conversación</span>
            }
          </p>

          {/* Unread indicator dot aligned with text */}
          {hasUnread && (
            <div className="flex-shrink-0 pl-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="min-w-[20px] h-[20px] px-1.5 flex justify-center items-center rounded-full bg-[var(--brand-pink)] text-white text-[11px] font-bold"
              >
                {unreadCount > 99 ? '+99' : unreadCount}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Actions (Stop Propagation) */}
      <div className="relative group/actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Toggle dropdown or just show it via hover (using CSS group-hover for simplicity in MVP)
          }}
          className="p-2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] rounded-full transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown - Visible on hover of the button wrapper */}
        <div className="absolute right-0 top-8 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg z-20 hidden group-hover/actions:block overflow-hidden">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer font-medium text-center"
          >
            Eliminar conversación
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ConversationItem;
