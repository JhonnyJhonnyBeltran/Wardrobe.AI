'use client';

import { ConversationItem } from '@/components/ConversationItem';
import { useUser } from '@/store/userStore';

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
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-20">
                <p className="text-[var(--foreground-secondary)] text-sm">No hay conversaciones aún</p>
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
