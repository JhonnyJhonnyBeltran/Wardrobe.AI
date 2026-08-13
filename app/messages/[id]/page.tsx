'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { useMessageStore } from '@/store/messageStore';
import { realtimeManager } from '@/lib/realtime/RealtimeManager';

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

const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else if (diffDays < 7) {
        const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
        return day.charAt(0).toUpperCase() + day.slice(1);
    } else {
        const day = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        return day.charAt(0).toUpperCase() + day.slice(1);
    }
};

const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export default function ChatPage() {
    const { user } = useUser();
    const params = useParams();
    const router = useRouter();
    const targetUserId = params.id as string;

    const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);
    const channelRef = useRef<any>(null);
    
    const markConversationAsRead = useMessageStore(state => state.markConversationAsRead);



    // Removed incorrect markConversationAsRead call from here, moving it to fetchMessages

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Centralized Realtime Presence & Verified Message Updates
    useEffect(() => {
        if (!user?.id || !targetUserId) return;

        // Maintain Presence/Online Status via global RealtimeManager
        setIsOnline(realtimeManager.isUserOnline(targetUserId));
        const unsubOnline = realtimeManager.onOnlineUsersChange((userIds) => {
            setIsOnline(userIds.includes(targetUserId));
        });

        // Custom room for typing indicator only
        const roomId = [user.id, targetUserId].sort().join('-');
        const channel = supabase.channel(`chat_room:${roomId}`, {
            config: { broadcast: { self: false } }
        });

        channel.on('broadcast', { event: 'typing' }, (payload) => {
            if (payload.payload.userId === targetUserId) {
                setIsTyping(payload.payload.isTyping);
                clearTimeout(typingTimeoutRef.current);
                if (payload.payload.isTyping) {
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
                }
            }
        });

        channel.subscribe();
        channelRef.current = channel;

        channel.on('broadcast', { event: 'new_message' }, async (payload) => {
            const newMsg = payload.payload.message as Message;
            
            setMessages((prev: Message[]) => {
                const existsIndex = prev.findIndex(m => m.id === newMsg.id);
                if (existsIndex >= 0) {
                    const newArr = [...prev];
                    newArr[existsIndex] = { ...newArr[existsIndex], ...newMsg };
                    return newArr;
                }
                return [...prev, newMsg];
            });

            if (newMsg.sender_id === targetUserId && newMsg.receiver_id === user.id && !newMsg.is_read) {
                try {
                    await (supabase.from('messages') as any)
                        .update({ is_read: true })
                        .eq('id', newMsg.id);
                    
                    useMessageStore.getState().syncUnreadCount(user.id);
                    if ((newMsg as any).conversation_id) {
                        useMessageStore.getState().markConversationAsRead((newMsg as any).conversation_id);
                    }
                } catch (e) { console.error('Auto-read error', e); }
            }
        });

        return () => {
            supabase.removeChannel(channel);
            clearTimeout(typingTimeoutRef.current);
            unsubOnline();
        };
    }, [user?.id, targetUserId]);

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
    }, [user?.id, targetUserId]);

    // We use unified broadcast instead of postgres_changes.

    const sendMessage = async () => {
        if (!newMessage.trim() || !user || !targetUserId) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear
        
        // Reset textarea height
        const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
        if (textarea) textarea.style.height = 'auto';

        // Optimistic UI Update with fallback UUID generator to support testing on non-https mobile connections
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const optimisticMsg: Message = {
            id: tempId,
            sender_id: user.id,
            receiver_id: targetUserId,
            content: content,
            created_at: new Date().toISOString(),
            is_read: false
        };

        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            // Use the RPC to reliably get or create the conversation ID
            const { data: conversationId, error: convError } = await supabase
                .rpc('get_or_create_conversation', { target_user_id: targetUserId } as any);

            if (convError || !conversationId) {
                console.error('Error getting/creating conversation:', convError);
                throw convError || new Error('Could not get or create conversation');
            }

            // Now insert the message
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    receiver_id: targetUserId,
                    content: content,
                } as any)
                .select()
                .single();
            
            const insertedMsg = data as any;

            if (error) {
                console.error('Error inserting message:', error);
                throw error;
            }

            if (insertedMsg) {
                setMessages((prev: Message[]) => {
                    if (prev.some((m: Message) => m.id === insertedMsg.id)) {
                        return prev.filter((m: Message) => m.id !== tempId);
                    }
                    return prev.map((m: Message) => m.id === tempId ? { ...(insertedMsg as Message) } : m);
                });
                
                if (channelRef.current) {
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'new_message',
                        payload: { message: insertedMsg }
                    });
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message if failed
            setNewMessage(content);
            // Remove optimistic message
            setMessages((prev: Message[]) => prev.filter(m => m.id !== tempId));
        }
    };



    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        
        // Auto-resize logic
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;

        if (channelRef.current && user) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: user.id, isTyping: e.target.value.length > 0 }
            });
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
            className="fixed inset-0 z-[40] md:z-auto md:relative flex flex-col md:h-full bg-[var(--background)]"
        >
            {/* Header */}
            <div className="bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] min-h-[64px] w-full px-4 md:px-6 py-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/messages')} className="p-2 -ml-2 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors md:hidden">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    {targetUser ? (
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${targetUser.id}`)}>
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
                                {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--background)]" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-[16px] font-bold text-[var(--foreground)] leading-tight">{targetUser.username}</h2>
                                <p className="text-xs text-[var(--foreground-secondary)] h-4">
                                {isTyping ? (
                                    <span className="text-[var(--brand-pink)] font-medium text-[13px] animate-pulse">escribiendo...</span>
                                ) : (
                                    isOnline ? 'Activo ahora' : 'Desconectado'
                                )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--background-secondary)] animate-pulse" />
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
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col">
                <div className="w-full flex flex-col space-y-3 flex-1 justify-end">
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
                        Array.from(new Map(messages.map(m => [m.id, m])).values()).map((msg, idx, arr) => {
                            const isMe = msg.sender_id === user?.id;
                            const prevMsg = idx > 0 ? arr[idx - 1] : null;
                            const nextMsg = idx < arr.length - 1 ? arr[idx + 1] : null;

                            // Grouping logic for balloons
                            const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                            const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                            
                            // Date separator logic
                            let showDateSeparator = false;
                            if (!prevMsg) {
                                showDateSeparator = true;
                            } else {
                                const prevDate = new Date(prevMsg.created_at).toDateString();
                                const currDate = new Date(msg.created_at).toDateString();
                                if (prevDate !== currDate) showDateSeparator = true;
                            }

                            // We only show avatar on the last message of the person's block (iMessage style)
                            const showAvatar = !isMe && isLastInGroup;
                            
                            let borderRadiusClass = 'rounded-[22px]';
                            if (isMe) {
                                borderRadiusClass = `rounded-l-[22px] ${isFirstInGroup ? 'rounded-tr-[22px]' : 'rounded-tr-[8px]'} ${isLastInGroup ? 'rounded-br-[22px]' : 'rounded-br-[8px]'}`;
                            } else {
                                borderRadiusClass = `rounded-r-[22px] ${isFirstInGroup ? 'rounded-tl-[22px]' : 'rounded-tl-[8px]'} ${isLastInGroup ? 'rounded-bl-[22px]' : 'rounded-bl-[8px]'}`;
                            }
                            
                            const marginTop = isFirstInGroup && idx !== 0 && !showDateSeparator ? 'mt-4' : 'mt-[3px]';

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
                                <div key={msg.id} className="flex flex-col">
                                    {showDateSeparator && (
                                        <div className="flex justify-center my-6">
                                            <span className="text-[var(--foreground-secondary)] text-xs font-medium">
                                                {formatDateSeparator(msg.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex w-full ${marginTop} ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                    <div className={`flex w-fit max-w-[85%] sm:max-w-[75%] md:max-w-[400px] xl:max-w-[480px] min-w-0 items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar placeholder for alignment */}
                                        {!isMe && (
                                            <div className="w-8 h-8 flex-shrink-0 group relative">
                                                {showAvatar ? (
                                                    <Link href={`/profile/${targetUser?.id}`}>
                                                        {targetUser?.avatar_url ? (
                                                            <img src={targetUser.avatar_url} className="w-8 h-8 rounded-full object-cover shadow-sm bg-[var(--background-secondary)] cursor-pointer hover:opacity-80 transition-opacity" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full shadow-sm bg-[var(--background-secondary)] flex items-center justify-center font-bold text-[var(--foreground-secondary)] text-xs border border-[var(--border-color)] cursor-pointer hover:opacity-80 transition-opacity">
                                                                {(targetUser?.full_name || targetUser?.username || '?')[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <div className="w-8 h-8" />
                                                )}
                                            </div>
                                        )}

                                        {isSharedPost && sharedPostData ? (
                                            <div className={`overflow-hidden border ${borderRadiusClass} ${isMe ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5' : 'border-[var(--border-color)] bg-[var(--card-bg)]'}`}>
                                                <div className="relative aspect-[3/4] w-48 bg-gray-100">
                                                    <img src={sharedPostData.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{sharedPostData.title || 'Outfit compartido'}</p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <Link href={`/feed?post=${sharedPostData.id}`} className="text-[10px] text-[var(--brand-pink)] font-medium hover:underline">Ver publicación</Link>
                                                        <span className={`text-[10px] ${isMe ? 'text-[var(--brand-pink)]/70' : 'text-[var(--foreground-tertiary)]'}`}>
                                                            {formatMessageTime(msg.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`
                                                min-w-0 px-4 py-2 text-[15px] leading-relaxed break-words break-all whitespace-pre-wrap shadow-sm
                                                ${borderRadiusClass}
                                                ${isMe
                                                    ? 'bg-[var(--brand-pink)] text-white font-medium'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground)]'}
                                            `}>
                                                {msg.content}
                                                <span className={`text-[10px] ml-2 ${isMe ? 'text-white/70' : 'text-[var(--foreground-tertiary)]'} float-right mt-1.5`}>
                                                    {formatMessageTime(msg.created_at)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    </motion.div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Floating */}
            <div className="pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-2 px-4 md:px-6 shrink-0 bg-transparent">
                <div className="w-full">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 bg-[var(--background)]/90 backdrop-blur-xl rounded-[24px] border border-[var(--border-color)] shadow-lg flex items-end pr-1.5 pl-4 transition-all focus-within:border-[var(--brand-pink)]/50 focus-within:ring-1 focus-within:ring-[var(--brand-pink)]/20">
                            <textarea
                                id="chat-input"
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe un mensaje..."
                                className="w-full bg-transparent max-h-32 min-h-[46px] py-3 text-[15px] resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] !outline-none !ring-0 border-none !shadow-none"
                                rows={1}
                            />
                            <div className="flex items-center h-[46px] flex-shrink-0">
                                <AnimatePresence>
                                    {newMessage.trim() && (
                                        <motion.button
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={sendMessage}
                                            className="p-2.5 bg-[var(--brand-pink)] text-white rounded-full shadow-lg shadow-[var(--brand-pink)]/20 flex items-center justify-center transition-all"
                                        >
                                            <Send className="w-4.5 h-4.5" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
