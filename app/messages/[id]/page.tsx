'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useMessageStore } from '@/store/messageStore';

// Types
interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface UserProfile {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
}

export default function ChatPage() {
    const { user } = useUser();
    const params = useParams();
    const router = useRouter();
    const targetUserId = params.id as string;

    const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const markConversationAsRead = useMessageStore(state => state.markConversationAsRead);

    // Swipe back to messages list
    useSwipeNavigation({
        onSwipeRight: () => router.push('/messages')
    });

    // Removed incorrect markConversationAsRead call from here, moving it to fetchMessages

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!user || !targetUserId) return;

        // OR query for bidirectional messages
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data as any[]);
            setLoading(false);

            // Update read state in Supabase
            const { error: updateError } = await (supabase.from('messages') as any)
                .update({ is_read: true })
                .eq('sender_id', targetUserId)
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            // Directly sync global unread count right after updating DB
            // This ensures the badge updates INSTANTLY
            if (!updateError) {
                useMessageStore.getState().syncUnreadCount(user.id);
            }

            // Also proactively clear this conversation's unread from the local store
            // if we have its conversation_id handy.
            const conversationIds = Array.from(new Set(data.map((m: any) => m.conversation_id).filter(Boolean)));
            conversationIds.forEach((id: any) => {
                markConversationAsRead(id);
            });
        }
    };

    // Fetch Target User & Messages
    useEffect(() => {
        if (!user || !targetUserId) return;

        const initChat = async () => {
            setLoading(true);
            try {
                // 1. Get Target User Info
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .eq('id', targetUserId)
                    .single();

                if (profile) {
                    setTargetUser(profile as any);
                } else {
                    // If user doesn't exist, redirect back
                    console.error("User not found");
                    // router.push('/messages'); // Optional: strict handling
                }

                // 2. Fetch Messages between User and Target
                await fetchMessages();
            } catch (error) {
                console.error('Error initializing chat:', error);
                setLoading(false);
            }
        };

        initChat();
    }, [user, targetUserId]);

    // Setup Realtime Subscription
    useEffect(() => {
        if (!user || !targetUserId) return;

        const channel = supabase.channel(`chat:${targetUserId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
            }, async (payload) => {
                // If it's a delete, new might be null.
                if (!payload.new || Object.keys(payload.new).length === 0) return;

                const newMsg = payload.new as Message;

                const isRelevant =
                    (newMsg.sender_id === user.id && newMsg.receiver_id === targetUserId) ||
                    (newMsg.sender_id === targetUserId && newMsg.receiver_id === user.id);

                if (isRelevant) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });

                    // If we receive a message from the target user while we are in this chat,
                    // we should instantly mark it as read to avoid the badge flashing or incrementing incorrectly.
                    if (newMsg.sender_id === targetUserId && newMsg.receiver_id === user.id && !newMsg.is_read) {
                        try {
                            await (supabase.from('messages') as any)
                                .update({ is_read: true })
                                .eq('id', newMsg.id);
                            
                            // Remove from local badge state instantly
                            if ((newMsg as any).conversation_id) {
                                useMessageStore.getState().markConversationAsRead((newMsg as any).conversation_id);
                            }
                            useMessageStore.getState().syncUnreadCount(user.id);
                        } catch (e) {
                            console.error('Error auto-reading new message:', e);
                        }
                    }
                }
            })
            .subscribe((status, err) => {
                console.log(`Supabase Realtime status: ${status}`, err || '');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, targetUserId]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !user || !targetUserId) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            // First, find or create conversation
            let { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${targetUserId}),and(participant1_id.eq.${targetUserId},participant2_id.eq.${user.id})`)
                .single();

            let conversationId = (existingConv as any)?.id as string | undefined;

            // If no conversation exists, create one
            if (!conversationId) {
                const { data: newConv, error: convError } = await supabase
                    .from('conversations')
                    .insert({
                        participant1_id: user.id,
                        participant2_id: targetUserId
                    } as any)
                    .select('id')
                    .single();

                if (convError) {
                    console.error('Error creating conversation:', convError);
                    throw convError;
                }
                conversationId = (newConv as any)?.id;
            }

            // Now insert the message
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    receiver_id: targetUserId,
                    content: content,
                } as any);

            if (error) {
                console.error('Error inserting message:', error);
                throw error;
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message if failed
            setNewMessage(content);
        }
    };



    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div
            className="flex flex-col h-screen md:h-full bg-[var(--background)]"
        >
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1 -ml-1 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors md:hidden">
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {targetUser ? (
                        <Link href={`/profile/${targetUserId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden border border-[var(--border-color)]">
                                    {targetUser.avatar_url ? (
                                        <img src={targetUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-[var(--foreground-secondary)]">
                                            {(targetUser.full_name || targetUser.username || '?')[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--background)]" />
                            </div>
                            <div>
                                <h2 className="text-[16px] font-bold text-[var(--foreground)] leading-tight">{targetUser.username}</h2>
                                <p className="text-xs text-[var(--foreground-secondary)]">Activo ahora</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] animate-pulse" />
                            <div className="h-4 w-24 bg-[var(--background-secondary)] rounded animate-pulse" />
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <button className="p-2 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                        <button
                            onClick={async () => {
                                alert("Usuario reportado. Gracias por ayudarnos a mantener la comunidad segura.");
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            Reportar usuario
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm("¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.")) {
                                    setLoading(true);
                                    try {
                                        // Get or create conversation first
                                        const { data: conversationId } = await supabase
                                            .rpc('get_or_create_conversation', { target_user_id: targetUserId } as any);

                                        if (conversationId) {
                                            // Delete the conversation (messages will be deleted by CASCADE)
                                            await supabase
                                                .from('conversations')
                                                .delete()
                                                .eq('id', conversationId);
                                        } else {
                                            // Fallback: delete messages directly
                                            await supabase.from('messages').delete().or(`and(sender_id.eq.${user?.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user?.id})`);
                                        }

                                        router.push('/messages');
                                    } catch (e) {
                                        console.error(e);
                                        setLoading(false);
                                    }
                                }
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Eliminar chat
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-safe flex flex-col">
                <div className="w-full md:w-[60%] mx-auto flex flex-col space-y-3 flex-1 justify-end">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-pink)]"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-20 h-20 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mb-4">
                                <Send className="w-10 h-10 text-[var(--foreground-tertiary)]" />
                            </div>
                            <p className="text-[var(--foreground-secondary)] mb-2">No hay mensajes aún</p>
                            <p className="text-sm text-[var(--foreground-tertiary)]">Envía un mensaje para comenzar la conversación</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user?.id;
                            const prevMsg = idx > 0 ? messages[idx - 1] : null;
                            const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                            // Check if message is a shared post
                            let isSharedPost = false;
                            let sharedPostData: any = null;
                            try {
                                if (msg.content.startsWith('{"type":"post"')) {
                                    sharedPostData = JSON.parse(msg.content);
                                    isSharedPost = true;
                                }
                            } catch (e) { }

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex w-fit max-w-[85%] md:max-w-[340px] xl:max-w-[420px] items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar placeholder for alignment */}
                                        {!isMe && (
                                            <div className="w-8 h-8 flex-shrink-0">
                                                {showAvatar && (
                                                    <img src={targetUser?.avatar_url || ''} className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]" />
                                                )}
                                            </div>
                                        )}

                                        {isSharedPost && sharedPostData ? (
                                            <div className={`overflow-hidden rounded-2xl border ${isMe ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5' : 'border-[var(--border-color)] bg-[var(--card-bg)]'}`}>
                                                <div className="relative aspect-[3/4] w-48 bg-gray-100">
                                                    <img src={sharedPostData.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{sharedPostData.title || 'Outfit compartido'}</p>
                                                    <Link href={`/feed?post=${sharedPostData.id}`} className="text-[10px] text-[var(--foreground-secondary)] hover:underline">Ver publicación</Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`
                                            px-4 py-2.5 rounded-[22px] text-[15px] leading-relaxed break-all
                                            ${isMe
                                                    ? 'bg-[var(--brand-pink)] text-white rounded-br-sm'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground)] rounded-bl-sm'}
                                        `}>
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Fixed at bottom where TabBar would be */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border-color)] safe-area-bottom md:relative md:bottom-auto md:left-auto md:right-auto flex justify-center">
                <div className="px-4 py-3 w-full md:w-[60%]">
                    <div className="flex items-end gap-2">
                        <button className="p-2 text-[var(--brand-pink)] hover:text-[#FF1493] hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                        </button>

                        <div className="flex-1 bg-[var(--background-secondary)] rounded-3xl border border-[var(--border-color)] transition-colors">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Mensaje..."
                                className="w-full bg-transparent max-h-32 min-h-[44px] py-2.5 px-4 outline-none focus:outline-none focus:ring-0 focus:border-transparent text-[15px] resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                                rows={1}
                            />
                        </div>

                        {newMessage.trim() ? (
                            <button
                                onClick={sendMessage}
                                className="p-2.5 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/10 rounded-full transition-all flex-shrink-0 font-semibold"
                            >
                                Enviar
                            </button>
                        ) : (
                            <button className="p-2 text-[var(--brand-pink)] hover:text-[#FF1493] hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0">
                                <Smile className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
