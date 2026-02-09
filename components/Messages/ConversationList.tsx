'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Helper function to format time ago without external dependencies
function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `hace ${weeks}sem`;
    const months = Math.floor(days / 30);
    if (months < 12) return `hace ${months}mes`;
    const years = Math.floor(days / 365);
    return `hace ${years}a`;
}

interface ConversationListItemProps {
    id: string;
    otherUser: {
        id: string;
        username: string;
        full_name: string | null;
        avatar_url: string | null;
    };
    lastMessage: string | null;
    lastMessageAt: string | null;
    lastMessageSender: string | null;
    unreadCount?: number;
    isActive?: boolean;
    onClick?: () => void;
}

export function ConversationListItem({
    id,
    otherUser,
    lastMessage,
    lastMessageAt,
    lastMessageSender,
    unreadCount = 0,
    isActive = false,
    onClick
}: ConversationListItemProps) {
    const timeAgo = lastMessageAt ? formatTimeAgo(lastMessageAt) : '';

    return (
        <motion.div
            whileHover={{ backgroundColor: 'var(--background-secondary)' }}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isActive ? 'bg-[var(--background-secondary)]' : ''
                }`}
        >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF69B4] to-[#FF1493] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {otherUser.username?.[0]?.toUpperCase() || '?'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                    <h3 className={`text-[15px] truncate ${unreadCount > 0 ? 'font-semibold' : 'font-normal'} text-[var(--foreground)]`}>
                        {otherUser.username}
                    </h3>
                    {lastMessageAt && (
                        <span className="text-xs text-[var(--foreground-tertiary)] ml-2 flex-shrink-0">
                            {timeAgo}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-[var(--foreground)]' : 'text-[var(--foreground-secondary)]'}`}>
                        {lastMessageSender === 'me' && 'Tú: '}
                        {lastMessage || 'Envía un mensaje'}
                    </p>
                    {unreadCount > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-2 flex items-center justify-center bg-[#FF69B4] text-white text-xs font-bold rounded-full flex-shrink-0">
                            {unreadCount > 99 ? '+99' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

interface ConversationListProps {
    conversations: Array<{
        id: string;
        other_user?: {
            id: string;
            username: string;
            full_name: string | null;
            avatar_url: string | null;
        };
        last_message_text: string | null;
        last_message_at: string | null;
        last_message_sender: string | null;
    }>;
    activeConversationId?: string;
    onConversationClick: (id: string) => void;
    loading?: boolean;
}

export function ConversationList({
    conversations,
    activeConversationId,
    onConversationClick,
    loading = false
}: ConversationListProps) {
    if (loading) {
        return (
            <div className="flex flex-col gap-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[var(--background-secondary)] animate-pulse" />
                        <div className="flex-1">
                            <div className="h-4 bg-[var(--background-secondary)] rounded animate-pulse mb-2" />
                            <div className="h-3 bg-[var(--background-secondary)] rounded animate-pulse w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-20">
                <p className="text-[var(--foreground-secondary)] text-sm">No hay conversaciones aún</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {conversations.map((conv) => (
                <ConversationListItem
                    key={conv.id}
                    id={conv.id}
                    otherUser={conv.other_user!}
                    lastMessage={conv.last_message_text}
                    lastMessageAt={conv.last_message_at}
                    lastMessageSender={conv.last_message_sender}
                    isActive={conv.id === activeConversationId}
                    onClick={() => onConversationClick(conv.id)}
                />
            ))}
        </div>
    );
}
