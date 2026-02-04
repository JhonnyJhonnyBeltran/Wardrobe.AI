'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Types
interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
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
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch Target User & Conversation
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

                if (profile) setTargetUser(profile as any);

                // 2. Find Conversation
                const { data: convs } = await supabase
                    .from('conversations')
                    .select('id')
                    .or(`and(participant_1.eq.${user.id},participant_2.eq.${targetUserId}),and(participant_1.eq.${targetUserId},participant_2.eq.${user.id})`)
                    .single();

                if (convs) {
                    setConversationId(convs.id);
                    fetchMessages(convs.id);
                    subscribeToMessages(convs.id);
                } else {
                    // No conversation yet. We'll create it on first message sent.
                    setMessages([]);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error initializing chat:', error);
                setLoading(false);
            }
        };

        initChat();
    }, [user, targetUserId]);

    const fetchMessages = async (convId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data as any[]);
            setLoading(false);

            // Mark as read
            if (user) {
                await supabase
                    .from('messages')
                    .update({ read_at: new Date().toISOString() })
                    .eq('conversation_id', convId)
                    .eq('receiver_id', user.id)
                    .is('read_at', null);
            }
        }
    };

    const subscribeToMessages = (convId: string) => {
        const channel = supabase.channel(`chat:${convId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${convId}`
            }, (payload) => {
                const newMsg = payload.new as Message;
                setMessages(prev => [...prev, newMsg]);

                // If it's incoming, mark as read
                if (user && newMsg.sender_id !== user.id) {
                    supabase
                        .from('messages')
                        .update({ read_at: new Date().toISOString() })
                        .eq('id', newMsg.id);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user || !targetUserId) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            let activeConvId = conversationId;

            // If no conversation exists, create it
            if (!activeConvId) {
                const { data: newConv, error } = await supabase
                    .from('conversations')
                    .insert({
                        participant_1: user.id,
                        participant_2: targetUserId,
                        status: 'active', // or pending logic
                        initiated_by: user.id
                    })
                    .select()
                    .single();

                if (error) throw error;
                if (newConv) {
                    activeConvId = newConv.id;
                    setConversationId(newConv.id);
                    subscribeToMessages(newConv.id);
                }
            }

            if (activeConvId) {
                // Send Message
                const { error } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: activeConvId,
                        sender_id: user.id,
                        receiver_id: targetUserId,
                        content: content
                    });

                if (error) throw error;

                // Update conversation timestamp
                await supabase
                    .from('conversations')
                    .update({
                        last_message_text: content,
                        last_message_at: new Date().toISOString(),
                        last_message_sender: user.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', activeConvId);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message if failed (optional, simplified)
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[var(--background)]">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1 -ml-1 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors">
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

                <button className="p-2 text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-3 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                        <div className="w-20 h-20 rounded-full bg-[var(--background-secondary)] mb-4 flex items-center justify-center">
                            {targetUser?.avatar_url ? (
                                <img src={targetUser.avatar_url} className="w-full h-full rounded-full object-cover opacity-50" />
                            ) : (
                                <h3 className="text-3xl font-bold text-[var(--foreground-tertiary)]">
                                    {(targetUser?.username?.[0] || '?').toUpperCase()}
                                </h3>
                            )}
                        </div>
                        <p className="text-[var(--foreground)] font-medium">Di hola a {targetUser?.username} 👋</p>
                        <p className="text-sm text-[var(--foreground-tertiary)]">Comienza la conversación.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user?.id;
                        const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id);

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[75%] items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar placeholder for alignment */}
                                    {!isMe && (
                                        <div className="w-8 h-8 flex-shrink-0">
                                            {showAvatar && (
                                                <img src={targetUser?.avatar_url || ''} className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]" />
                                            )}
                                        </div>
                                    )}

                                    <div className={`
                                 px-4 py-2.5 rounded-[20px] text-[15px] leading-relaxed break-words shadow-sm
                                 ${isMe
                                            ? 'bg-[var(--brand-pink)] text-white rounded-br-sm'
                                            : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] rounded-bl-sm'}
                             `}>
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[var(--background)] border-t border-[var(--border-color)] safe-area-bottom">
                <div className="flex items-end gap-2 bg-[var(--background-secondary)]/50 p-2 rounded-3xl border border-[var(--border-color)] focus-within:border-[var(--brand-pink)]/50 transition-colors">
                    <button className="p-2 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/10 rounded-full transition-colors flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                    </button>

                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent max-h-32 min-h-[44px] py-2.5 px-1 outline-none text-[15px] resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                        rows={1}
                    />

                    {newMessage.trim() ? (
                        <button
                            onClick={sendMessage}
                            className="p-2 bg-[var(--brand-pink)] text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    ) : (
                        <button className="p-2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0">
                            <Smile className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
