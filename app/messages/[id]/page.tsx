'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSwipe } from '@/hooks/useSwipe';

// Types
interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                fetchMessages();
                subscribeToMessages();
            } catch (error) {
                console.error('Error initializing chat:', error);
                setLoading(false);
            }
        };

        initChat();
    }, [user, targetUserId]);

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
        }
    };

    const subscribeToMessages = () => {
        if (!user || !targetUserId) return () => { };

        // Subscribe to all messages where I am sender or receiver (filtering in callback might be safer given simple RLS)
        // Or specific filter if Supabase supports complex filters in channels (limited).
        // Let's listen to table and filter client side for now or use row level security.
        const channel = supabase.channel(`chat:${targetUserId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const newMsg = payload.new as Message;
                // Check if this message belongs to this conversation
                const isRelevant =
                    (newMsg.sender_id === user.id && newMsg.receiver_id === targetUserId) ||
                    (newMsg.sender_id === targetUserId && newMsg.receiver_id === user.id);

                if (isRelevant) {
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
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
            // Send Message without conversation relation (it's optional in schema)
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: targetUserId,
                    content: content,
                    created_at: new Date().toISOString()
                } as any);

            if (error) throw error;

            // Note: We don't manually add to state because subscription should catch it. 
            // BUT for responsiveness we might want to:
            // setMessages(prev => [...prev, optimisticMsg]);

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

    // Swipe Logic -> Go back to Inbox
    const swipeHandlers = useSwipe({
        onSwipeRight: () => router.push('/messages')
    });

    return (
        <div
            {...swipeHandlers}
            className="flex flex-col h-screen bg-[var(--background)]"
        >
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
                                        // Delete matches for both participants (simulating total delete)
                                        // RLS might prevent deleting 'received' messages depending on policy, but assuming we can delete row.
                                        await supabase.from('messages').delete().or(`and(sender_id.eq.${user?.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user?.id})`);
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
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-safe">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF69B4]"></div>
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
                                <div className={`flex max-w-[75%] items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar placeholder for alignment */}
                                    {!isMe && (
                                        <div className="w-8 h-8 flex-shrink-0">
                                            {showAvatar && (
                                                <img src={targetUser?.avatar_url || ''} className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]" />
                                            )}
                                        </div>
                                    )}

                                    {isSharedPost && sharedPostData ? (
                                        <div className={`overflow-hidden rounded-2xl border ${isMe ? 'border-[#FF69B4] bg-[#FF69B4]/5' : 'border-[var(--border-color)] bg-[var(--card-bg)]'}`}>
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
                                            px-4 py-2.5 rounded-[22px] text-[15px] leading-relaxed break-words
                                            ${isMe
                                                ? 'bg-[#FF69B4] text-white rounded-br-sm'
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

            {/* Input Area - Fixed at bottom where TabBar would be */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border-color)] safe-area-bottom md:relative md:bottom-auto md:left-auto md:right-auto">
                <div className="px-4 py-3 max-w-2xl mx-auto">
                    <div className="flex items-end gap-2">
                        <button className="p-2 text-[#FF69B4] hover:text-[#FF1493] hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                        </button>

                        <div className="flex-1 bg-[var(--background-secondary)] rounded-3xl border border-[var(--border-color)] transition-colors">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Mensaje..."
                                className="w-full bg-transparent max-h-32 min-h-[44px] py-2.5 px-4 outline-none text-[15px] resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]"
                                rows={1}
                            />
                        </div>

                        {newMessage.trim() ? (
                            <button
                                onClick={sendMessage}
                                className="p-2.5 text-[#FF69B4] hover:bg-[#FF69B4]/10 rounded-full transition-all flex-shrink-0 font-semibold"
                            >
                                Enviar
                            </button>
                        ) : (
                            <button className="p-2 text-[#FF69B4] hover:text-[#FF1493] hover:bg-[var(--background-secondary)] rounded-full transition-colors flex-shrink-0">
                                <Smile className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
