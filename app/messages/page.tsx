'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Plus, X, MessageCircle, UserPlus } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useUiStore } from '@/store/uiStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConversationItem } from '@/components/ConversationItem';
import { supabase } from '@/lib/supabase/client';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { getFollowing } from '@/lib/services/followService';
import type { FollowProfile } from '@/types/follow';

interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    status: 'active' | 'pending' | 'restricted';
    initiated_by: string;
    last_message_text: string | null;
    last_message_at: string | null;
    last_message_sender: string | null;
    unreadCount: number;
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

    // New conversation modal state
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const [followedUsers, setFollowedUsers] = useState<FollowProfile[]>([]);
    const [loadingFollowed, setLoadingFollowed] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    
    const { setTabBarHidden } = useUiStore();

    // Hide tab bar when modal is open
    useEffect(() => {
        setTabBarHidden(showNewConversationModal);
        return () => setTabBarHidden(false);
    }, [showNewConversationModal, setTabBarHidden]);

    const handleConversationClick = async (convId: string, otherUserId: string) => {
        if (sharePostData && user) {
            // Send the post immediately
            try {
                const { data: conversationId, error: convError } = await supabase
                    .rpc('get_or_create_conversation', { target_user_id: otherUserId } as any);

                if (convError || !conversationId) throw convError || new Error('Could not get conversation');

                await (supabase.from('messages') as any).insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    receiver_id: otherUserId,
                    content: sharePostData,
                } as any);
            } catch (e) {
                console.error('Error sharing post', e);
            }
        }
        router.push(`/messages/${otherUserId}`);
    };

    // Fetch followed users when modal opens
    useEffect(() => {
        if (showNewConversationModal && user) {
            setLoadingFollowed(true);
            getFollowing(user.id)
                .then((users) => {
                    setFollowedUsers(users);
                })
                .catch((err) => {
                    console.error('Error fetching following:', err);
                    setFollowedUsers([]);
                })
                .finally(() => {
                    setLoadingFollowed(false);
                });
        }
    }, [showNewConversationModal, user]);

    // Handle selecting a user to start a conversation
    const handleSelectUser = async (selectedUser: FollowProfile) => {
        if (!user) return;

        try {
            const { data: conversationId, error: convError } = await supabase
                .rpc('get_or_create_conversation', { target_user_id: selectedUser.id } as any);

            if (convError || !conversationId) throw convError || new Error('Could not get conversation');

            setShowNewConversationModal(false);
            router.push(`/messages/${selectedUser.id}`);
        } catch (e) {
            console.error('Error creating conversation:', e);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const fetchConversations = async () => {
            if (!user?.id) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                // 1. Get distinct conversation IDs where user is sender or receiver
                // Fetch all messages involving the user
                const { data: myMessages, error } = await supabase
                    .from('messages')
                    .select('created_at, content, sender_id, receiver_id, is_read')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false })
                    .limit(100)
                    .abortSignal(controller.signal);

                clearTimeout(timeoutId);

                if (error) {
                    console.error("Error fetching messages:", error);
                    if (isMounted) setLoading(false);
                    return;
                }

                if (!myMessages || !isMounted) {
                    if (isMounted) setLoading(false);
                    return;
                }

                // 2. Group by the OTHER user ID
                const convMap = new Map<string, any>();
                const unreadCounts = new Map<string, number>();

                myMessages.forEach((msg: any) => {
                    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                    // Filter out self-chats to avoid confusing the user
                    if (otherId === user.id) return;

                    // We only want the LATEST message for each partner
                    if (!convMap.has(otherId)) {
                        convMap.set(otherId, msg);
                    }

                    // Count unread messages where the current user is the receiver
                    if (!msg.is_read && msg.receiver_id === user.id) {
                        unreadCounts.set(otherId, (unreadCounts.get(otherId) || 0) + 1);
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
                                unreadCount: unreadCounts.get(otherId) || 0,
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
                } else {
                    setConversations([]);
                }

            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Error fetching conversations:", err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchConversations();

        // Suscripción a WebSockets para actualizar la lista en tiempo real
        const channel = supabase.channel('conversations-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                if (!user) return;
                const newMsg = payload.new as any;
                // Si el mensaje es para nosotros o nuestro, recargamos la lista
                if (newMsg && (newMsg.sender_id === user.id || newMsg.receiver_id === user.id)) {
                    fetchConversations();
                }
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [user]);

    const filteredConversations = conversations.filter(c =>
        c.other_user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-[100dvh] bg-[var(--background)]">
            {/* Mobile: Header + Search + List. Desktop: layout shows list; this page is only for placeholder when no chat selected. */}
            <div className="md:hidden">
                <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                    <div className="px-4 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/feed')} className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
                            </button>
                            <h1 className="text-lg font-bold text-[var(--foreground)]">Mensajes</h1>
                        </div>
                        <button onClick={() => setShowNewConversationModal(true)} className="p-2 -mr-2 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/10 rounded-full transition-colors">
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
                                    unreadCount={conv.unreadCount}
                                    currentUserId={user?.id || 'me'}
                                    onClick={() => handleConversationClick(conv.id, conv.id)}
                                    onReport={() => alert("Usuario reportado.")}
                                    onDelete={async () => {
                                        if (confirm("¿Eliminar conversación?")) {
                                            setLoading(true);
                                            const partnerId = conv.other_user?.id || (conv.participant_2 === user?.id ? conv.participant_1 : conv.participant_2);

                                            try {
                                                // Get or create conversation first
                                                const { data: conversationId } = await supabase
                                                    .rpc('get_or_create_conversation', { target_user_id: partnerId } as any) as { data: any };


                                                if (conversationId) {
                                                    // Delete the conversation (messages will be deleted by CASCADE)
                                                    await supabase
                                                        .from('conversations')
                                                        .delete()
                                                        .eq('id', conversationId);
                                                } else {
                                                    // Fallback: delete messages directly
                                                    await supabase.from('messages').delete().or(`and(sender_id.eq.${user?.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user?.id})`);
                                                }

                                                // Remove from local state
                                                setConversations(prev => prev.filter(c => c.id !== conv.id));
                                            } catch (e) {
                                                console.error('Error deleting conversation:', e);
                                            } finally {
                                                setLoading(false);
                                            }
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

            {/* New Conversation Modal */}
            <AnimatePresence>
                {showNewConversationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
                        onClick={() => setShowNewConversationModal(false)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full md:max-w-md md:rounded-2xl bg-[var(--background)] md:max-h-[70vh] rounded-t-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <UserPlus className="w-5 h-5 text-[var(--brand-pink)]" />
                                    <h2 className="text-lg font-bold text-[var(--foreground)]">Nueva conversación</h2>
                                </div>
                                <button
                                    onClick={() => setShowNewConversationModal(false)}
                                    className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-[var(--foreground-secondary)]" />
                                </button>
                            </div>

                            {/* Search (mimicking messages search bar) */}
                            <div className="p-4 border-b border-[var(--border-color)]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuarios..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--background-secondary)] rounded-xl text-sm outline-none transition-all font-medium text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                                    />
                                </div>
                            </div>

                            {/* Users List */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {loadingFollowed ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)]" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-1/3 bg-[var(--background-secondary)] rounded" />
                                                    <div className="h-3 w-1/2 bg-[var(--background-secondary)] rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : followedUsers.length > 0 ? (
                                    <div className="py-2">
                                        {followedUsers.filter(u => 
                                            u.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                            u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase())
                                        ).map((followedUser) => (
                                            <button
                                                key={followedUser.id}
                                                onClick={() => handleSelectUser(followedUser)}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--background-secondary)] transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[var(--background-secondary)]">
                                                    {followedUser.avatar_url ? (
                                                        <img
                                                            src={followedUser.avatar_url}
                                                            alt={followedUser.username || 'User'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[var(--foreground-tertiary)]">
                                                            <MessageCircle className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-semibold text-[var(--foreground)] truncate">
                                                        {followedUser.username || 'Usuario'}
                                                    </p>
                                                    {followedUser.full_name && (
                                                        <p className="text-sm text-[var(--foreground-secondary)] truncate">
                                                            {followedUser.full_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <UserPlus className="w-12 h-12 mx-auto text-[var(--foreground-tertiary)] mb-3" />
                                        <p className="text-[var(--foreground-secondary)]">No sigues a nadie todavía</p>
                                        <p className="text-sm text-[var(--foreground-tertiary)] mt-1">
                                            Busca usuarios para seguir y chatear con ellos
                                        </p>
                                        <button
                                            onClick={() => {
                                                setShowNewConversationModal(false);
                                                router.push('/search');
                                            }}
                                            className="mt-4 px-4 py-2 bg-[var(--brand-pink)] text-white rounded-full font-medium text-sm"
                                        >
                                            Buscar usuarios
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
