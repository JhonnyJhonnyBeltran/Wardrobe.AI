/**
 * ConversationItem Component
 * Componente para mostrar una conversación en la lista de mensajes
 * Con soporte para estado de leído/no leído estilo Instagram
 */

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useMessageStore } from '@/store/messageStore';
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
  currentUserId: string;
  onClick: () => void;
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

export const ConversationItem = memo(function ConversationItem({
  conversationId,
  otherUser,
  lastMessageText,
  lastMessageAt,
  lastMessageSender,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  // Check if this conversation has unread messages
  const hasUnread = useMessageStore((state) => state.hasUnread(conversationId));

  if (!otherUser) return null;

  const isFromMe = lastMessageSender === currentUserId;
  const displayName = otherUser.full_name || otherUser.username;
  const initial = (displayName || '?')[0].toUpperCase();

  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl
        transition-colors duration-200
        ${hasUnread 
          ? 'bg-[var(--background-secondary)]/50 hover:bg-[var(--background-secondary)]' 
          : 'hover:bg-[var(--background-secondary)]'
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
          w-14 h-14 rounded-full overflow-hidden flex-shrink-0
          ${hasUnread 
            ? 'ring-2 ring-[var(--brand-pink)] ring-offset-2 ring-offset-[var(--background)]' 
            : 'bg-[var(--background-tertiary)]'
          }
        `}>
          {otherUser.avatar_url ? (
            <img 
              src={otherUser.avatar_url} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold text-xl">
              {initial}
            </div>
          )}
        </div>
      </AvatarWithStatus>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        {/* Name row */}
        <div className="flex items-center gap-2">
          <p className={`
            text-sm truncate
            ${hasUnread 
              ? 'font-bold text-[var(--foreground)]' 
              : 'font-semibold text-[var(--foreground)]'
            }
          `}>
            {displayName}
          </p>
          {lastMessageAt && (
            <span className="text-xs text-[var(--foreground-tertiary)] flex-shrink-0">
              · {formatTimeAgo(lastMessageAt)}
            </span>
          )}
        </div>

        {/* Message preview */}
        <div className="flex items-center gap-2">
          <p className={`
            text-xs truncate flex-1
            ${hasUnread 
              ? 'text-[var(--foreground)] font-medium' 
              : 'text-[var(--foreground-tertiary)]'
            }
          `}>
            {lastMessageText
              ? `${isFromMe ? 'Tú: ' : ''}${lastMessageText}`
              : 'Inicia una conversación'
            }
          </p>
        </div>
      </div>

      {/* Unread indicator */}
      {hasUnread && (
        <div className="flex-shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full bg-[var(--brand-pink)]"
          />
        </div>
      )}
    </motion.button>
  );
});

export default ConversationItem;
