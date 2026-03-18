'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Edit } from 'lucide-react';
import { ConversationList } from '@/components/Messages/ConversationList';
import { NewMessageModal } from '@/components/Messages/NewMessageModal';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';

interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    status: 'active' | 'pending' | 'restricted';
    initiated_by: string;
    last_message_text: string | null;
    last_message_at: string | null;
    last_message_sender: string | null;
    other_user?: {
        id: string;
        username: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sharePostData = searchParams.get('share_post');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);

    // Extract active conversation ID from pathname
    const activeConversationId = pathname.startsWith('/messages/') && pathname !== '/messages'
        ? pathname.split('/messages/')[1]
        : null;

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const { data: messages } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                const msgs = messages as any[] | null;

                if (msgs && msgs.length > 0) {
                    const convMap = new Map();
                    for (const msg of msgs) {
                        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                        if (!convMap.has(otherId)) {
                            convMap.set(otherId, msg);
                        }
                    }

                    const otherUserIds = Array.from(convMap.keys());
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url')
                        .in('id', otherUserIds);

                    const profileMap = new Map((profiles as any[])?.map(p => [p.id, p]));

                    const convs: Conversation[] = [];
                    for (const [otherId, lastMsg] of convMap.entries()) {
                        const profile = profileMap.get(otherId);
                        if (profile) {
                            convs.push({
                                id: otherId,
                                participant_1: user.id,
                                participant_2: otherId,
                                status: 'active',
                                initiated_by: 'unknown',
                                last_message_text: lastMsg.content,
                                last_message_at: lastMsg.created_at,
                                last_message_sender: lastMsg.sender_id === user.id ? 'me' : 'other',
                                other_user: {
                                    id: profile.id,
                                    username: profile.username || 'Usuario',
                                    full_name: profile.full_name,
                                    avatar_url: profile.avatar_url || null
                                }
                            });
                        }
                    }
                    setConversations(convs);

                    // Auto-select first conversation on desktop if none selected
                    if (convs.length > 0 && !activeConversationId && typeof window !== 'undefined' && window.innerWidth >= 768) {
                        router.replace(`/messages/${convs[0].id}`);
                    }
                } else {
                    setConversations([]);
                }
            } catch (err) {
                console.error("Error fetching conversations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const filteredConversations = conversations.filter(c =>
        c.other_user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConversationClick = async (convId: string) => {
        if (sharePostData && user) {
            try {
                // convId here is actually the other user's ID
                const { data: conversationId, error: convError } = await (supabase.rpc as any)(
                    'get_or_create_conversation',
                    { target_user_id: convId }
                );

                if (convError || !conversationId) throw convError || new Error('Could not get conversation');

                await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    receiver_id: convId,
                    content: sharePostData,
                    message_type: 'post_share', // Note: Make sure this column exists or removed if not needed
                } as any);
            } catch (e) {
                console.error('Error sharing post', e);
            }
        }
        router.push(`/messages/${convId}`);
    };

    // Mobile: Show only children (full screen chat or conversation list)
    // Desktop: Show split view
    return (
        <>
            {/* Mobile View - Full Screen */}
            <div className="md:hidden">
                {children}
            </div>

            {/* Desktop View - Split Layout */}
            <div className="hidden md:flex h-screen bg-[var(--background)]">
                {/* Left Sidebar - Conversation List */}
                <div className="w-[380px] border-r border-[var(--border-color)] flex flex-col bg-[var(--background)]">
                    {/* Header */}
                    <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-color)] flex-shrink-0">
                        <h1 className="text-xl font-bold text-[var(--foreground)]">Mensajes</h1>
                        <button
                            onClick={() => setShowNewMessageModal(true)}
                            className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                        >
                            <Edit className="w-5 h-5 text-[var(--foreground)]" />
                        </button>
                    </div>

                    {/* Share mode banner - desktop */}
                    {sharePostData && (
                        <div className="mx-3 mt-2 p-2.5 rounded-xl bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/20 flex items-center gap-2">
                            <p className="text-xs font-medium text-[var(--foreground)] truncate flex-1">Enviar publicación a...</p>
                        </div>
                    )}

                    {/* Search */}
                    <div className="px-4 py-3 border-b border-[var(--border-color)] flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                            <input
                                type="text"
                                placeholder="Buscar conversaciones..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--background-secondary)] border border-transparent rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        <ConversationList
                            conversations={filteredConversations}
                            activeConversationId={activeConversationId || undefined}
                            onConversationClick={handleConversationClick}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Right Panel - Active Chat */}
                <div className="flex-1 flex flex-col bg-[var(--background)]">
                    {children}
                </div>
            </div>

            <NewMessageModal
                isOpen={showNewMessageModal}
                onClose={() => setShowNewMessageModal(false)}
                currentUserId={user?.id}
                onSelectUser={(userId) => {
                    setShowNewMessageModal(false);
                    handleConversationClick(userId);
                }}
            />
        </>
    );
}
