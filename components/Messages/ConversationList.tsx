'use client';

import { ConversationItem } from '@/components/ConversationItem';
import { useUser } from '@/store/userStore';
import { Plus } from 'lucide-react';

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
    onNewMessage?: () => void;
    loading?: boolean;
}

export function ConversationList({
    conversations,
    activeConversationId,
    onConversationClick,
    onNewMessage,
    loading = false
}: ConversationListProps) {
    const { user } = useUser();

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
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-24">
                <button
                    onClick={onNewMessage}
                    className="w-14 h-14 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center mb-3 shadow-[0_8px_20px_rgba(255,45,120,0.35)] hover:scale-105 active:scale-95 transition-all"
                    title="Nueva conversación"
                >
                    <Plus className="w-7 h-7" />
                </button>
                <p className="text-[var(--foreground)] font-bold text-sm">No hay conversaciones</p>
                <p className="text-[var(--foreground-secondary)] text-xs mt-1 max-w-[200px] mb-4">
                    Inicia un nuevo chat con tus amigos.
                </p>
                {onNewMessage && (
                    <button
                        onClick={onNewMessage}
                        className="px-4 py-2 rounded-xl bg-[var(--brand-pink)] text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all"
                    >
                        Iniciar conversación
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {conversations.map((conv) => (
                <div key={conv.id} className={conv.id === activeConversationId ? 'bg-[var(--background-secondary)]/50' : ''}>
                    <ConversationItem
                        conversationId={conv.id}
                        otherUser={conv.other_user}
                        lastMessageText={conv.last_message_text}
                        lastMessageAt={conv.last_message_at}
                        lastMessageSender={conv.last_message_sender}
                        currentUserId={user?.id || ''}
                        onClick={() => onConversationClick(conv.id)}
                        onReport={() => console.log('Report', conv.id)}
                        onDelete={() => console.log('Delete', conv.id)}
                    />
                </div>
            ))}
        </div>
    );
}
