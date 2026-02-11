'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, Plus } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConversationItem } from '@/components/ConversationItem';
import { supabase } from '@/lib/supabase/client';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

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

export default function MessagesPage() {
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sharePostData = searchParams.get('share_post');

    // Enable swipe navigation (mobile only)
    useSwipeNavigation();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleConversationClick = async (convId: string, otherUserId: string) => {
        if (sharePostData && user) {
            // Send the post immediately
            try {
                const { data: conversationId, error: convError } = await supabase
                    .rpc('get_or_create_conversation', { other_user_id: otherUserId });

                if (convError || !conversationId) throw convError || new Error('Could not get conversation');

                await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    receiver_id: otherUserId,
                    content: sharePostData,
                    message_type: 'post_share',
                } as any);
            } catch (e) {
                console.error('Error sharing post', e);
            }
        }
        router.push(`/messages/${otherUserId}`);
    };

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return;

            try {
                // 1. Get distinct conversation IDs where user is sender or receiver
                // Since we don't have a 'conversations' table, we group messages by the OTHER user_id.

                // Fetch all messages involving the user
                const { data: myMessages, error } = await supabase
                    .from('messages')
                    .select('created_at, content, sender_id, receiver_id, read_at')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (!myMessages) {
                    setLoading(false);
                    return;
                }

                // 2. Group by the OTHER user ID
                const convMap = new Map<string, any>();

                myMessages.forEach((msg: any) => {
                    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                    // Filter out self-chats to avoid confusing the user
                    if (otherId === user.id) return;

                    // We only want the LATEST message for each partner
                    if (!convMap.has(otherId)) {
                        convMap.set(otherId, msg);
                    }
                });

                // 3. Fetch profiles for these users
                const otherUserIds = Array.from(convMap.keys());

                if (otherUserIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url')
                        .in('id', otherUserIds);

                    const profileMap = new Map((profiles as any[])?.map(p => [p.id, p]));

                    // 4. Build Conversation Objects
                    const convs: Conversation[] = [];
                    for (const [otherId, lastMsg] of convMap.entries()) {
                        const profile = profileMap.get(otherId);
                        if (profile) {
                            convs.push({
                                id: otherId, // Use UserID as Conversation ID for routing
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
                                    avatar_url: profile.avatar_url || 'https://i.pravatar.cc/150?u=default'
                                }
                            });
                        }
                    }
                    setConversations(convs);
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

    return (
        <div className="min-h-screen bg-[var(--background)] pb-20 md:pb-0">
            {/* Mobile: Header + Search + List. Desktop: layout shows list; this page is only for placeholder when no chat selected. */}
            <div className="md:hidden">
                <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                    <div className="px-4 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
                            </button>
                            <h1 className="text-lg font-bold text-[var(--foreground)]">Mensajes</h1>
                        </div>
                        <button onClick={() => router.push('/search')} className="p-2 -mr-2 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/10 rounded-full transition-colors">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Search - mobile only */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Buscar mensajes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--background-secondary)] rounded-xl text-sm outline-none transition-all font-medium text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                        />
                    </div>
                </div>

                {/* Share Mode Banner - mobile */}
                {sharePostData && (
                    <div className="bg-[var(--brand-pink)]/10 p-3 mx-4 mb-2 rounded-xl border border-[var(--brand-pink)]/20 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                            {(() => {
                                try {
                                    const data = JSON.parse(sharePostData);
                                    return <img src={data.image} className="w-full h-full object-cover" alt="" />;
                                } catch (e) { return null; }
                            })()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[var(--foreground)] truncate">Enviar publicación a...</p>
                            <p className="text-xs text-[var(--foreground-secondary)]">Selecciona un chat para compartir</p>
                        </div>
                    </div>
                )}

                {/* List - mobile only */}
                <div className="px-2">
                    {loading ? (
                        <div className="space-y-4 p-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-[var(--background-secondary)] rounded" />
                                        <div className="h-3 w-2/3 bg-[var(--background-secondary)] rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredConversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversationId={conv.id}
                                    otherUser={conv.other_user}
                                    lastMessageText={conv.last_message_text}
                                    lastMessageAt={conv.last_message_at}
                                    lastMessageSender={conv.last_message_sender}
                                    currentUserId={user?.id || 'me'}
                                    onClick={() => handleConversationClick(conv.id, conv.id)}
                                    onReport={() => alert("Usuario reportado.")}
                                    onDelete={async () => {
                                        if (confirm("¿Eliminar conversación?")) {
                                            setLoading(true);
                                            const partnerId = conv.other_user?.id || (conv.participant_2 === user?.id ? conv.participant_1 : conv.participant_2);
                                            await supabase.from('messages').delete().or(`and(sender_id.eq.${user?.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user?.id})`);
                                            window.location.reload();
                                        }
                                    }}
                                />
                            ))}
                            {filteredConversations.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-[var(--foreground-tertiary)]">No hay mensajes</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop: placeholder when no conversation selected (layout shows list on left) - Contexto §4C */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center min-h-0">
                <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                </div>
                <p className="text-[var(--foreground-secondary)] font-medium">Selecciona una conversación</p>
                <p className="text-sm text-[var(--foreground-tertiary)] mt-1">o inicia un chat desde Búsqueda</p>
            </div>
        </div>
    );
}
