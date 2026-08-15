'use client';

/**
 * Direct Message Chat Page - Instagram-style
 * Features:
 * - Clean chat interface
 * - Message bubbles with timestamps
 * - Message request flow for non-mutual followers
 * - Real-time updates
 * - Automatic read status marking
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Info, Smile, Mic, Plus, ChevronRight, Check, Ban } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { checkMutualFollow as checkMutualFollowService } from '@/lib/services/followService';
import Link from 'next/link';
import { useTypingIndicator } from '@/lib/hooks/useTypingIndicator';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';
import { TypingIndicator } from '@/components/TypingIndicator';
import { OnlineIndicator, OnlineStatusText } from '@/components/OnlineIndicator';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'post_share' | 'outfit_share';
  read_at: string | null;
  created_at: string;
  pending?: boolean;
}

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  status: 'active' | 'pending' | 'restricted';
  initiated_by: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = params.id as string;
  const isRequest = searchParams.get('request') === 'true';

  // Unread messages hook for marking as read
  const { onOpenConversation } = useUnreadMessages({ autoFetch: false, enableRealtime: false });

  // State
  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [showRequestActions, setShowRequestActions] = useState(false);

  // Track first unread message for scroll and visual indicator
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Online status for target user
  const { isUserOnline } = useOnlineStatus({ userIds: [targetUserId] });
  const isTargetOnline = isUserOnline(targetUserId);

  // Typing indicator - only initialize when we have a conversation
  const {
    isAnyoneTyping,
    getTypingText,
    handleInputChange: handleTypingChange,
    handleMessageSent,
  } = useTypingIndicator({
    conversationId: conversation?.id || targetUserId,
  });

  // Username map for typing text
  const usernameMap = useMemo(() => {
    if (!targetUser) return {};
    return { [targetUserId]: targetUser.full_name || targetUser.username || 'Usuario' };
  }, [targetUserId, targetUser]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to unread messages divider or bottom
  const scrollToUnreadOrBottom = useCallback(() => {
    if (unreadDividerRef.current && !hasScrolledToUnread) {
      unreadDividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHasScrolledToUnread(true);
    } else if (!firstUnreadMessageId) {
      scrollToBottom();
    }
  }, [hasScrolledToUnread, firstUnreadMessageId, scrollToBottom]);

  // Initial scroll when messages load
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      // Small delay to ensure DOM is ready
      setTimeout(scrollToUnreadOrBottom, 100);
    }
  }, [messages.length, loading, scrollToUnreadOrBottom]);

  // Scroll to bottom when new message is sent (not received)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.sender_id === user?.id) {
      scrollToBottom();
    }
  }, [messages, user?.id, scrollToBottom]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversation?.id) {
      onOpenConversation(conversation.id);
    }
  }, [conversation?.id, onOpenConversation]);

  // Initialize chat
  useEffect(() => {
    if (!user || !targetUserId) return;
    initChat();
  }, [user, targetUserId]);

  const initChat = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get target user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      setTargetUser(profile as Profile | null);

      // 2. Check mutual follow status
      const mutual = await checkMutualFollow(user.id, targetUserId);
      setIsMutualFollow(mutual);

      // 3. Get or check for existing conversation
      const { data: existingConv, error: convError } = await (supabase.from('conversations') as any)
        .select('*')
        .in('participant_1', [user.id, targetUserId])
        .in('participant_2', [user.id, targetUserId])
        .single();

      if (existingConv && !convError) {
        const conv = existingConv as any as Conversation;
        setConversation(conv);

        // Check if this is a request for current user
        if (conv.status === 'pending' && conv.initiated_by !== user.id) {
          setShowRequestActions(true);
        }

        // If pending and I didn't initiate, and there's already a message from them, I can't send more
        if (conv.status === 'pending' && conv.initiated_by === user.id) {
          // Check how many messages I sent
          const { count } = await (supabase.from('messages') as any)
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_id', user.id);

          if (count && count >= 1 && !mutual) {
            setCanSendMessage(false);
          }
        }

        // 4. Get messages
        const { data: msgs } = await (supabase.from('messages') as any)
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        const messagesList = (msgs as any[] || []) as Message[];
        setMessages(messagesList);

        // 5. Find first unread message (messages sent to me that I haven't read)
        const firstUnread = messagesList.find(
          (msg) => msg.receiver_id === user.id && msg.read_at === null
        );
        if (firstUnread) {
          setFirstUnreadMessageId(firstUnread.id);
        }

        // 6. Mark messages as read
        await (supabase.from('messages') as any)
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conv.id)
          .eq('receiver_id', user.id)
          .is('read_at', null);
      } else {
        // No conversation yet - can send if mutual, or one message if not
        setCanSendMessage(true);
      }

      // 6. Subscribe to new messages
      subscribeToMessages();

    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMutualFollow = async (userId1: string, userId2: string): Promise<boolean> => {
    return checkMutualFollowService(userId1, userId2);
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel(`chat:${targetUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload: any) => {
        const newMsg = payload.new as Message;
        if (newMsg.sender_id === targetUserId) {
          setMessages(prev => [...prev, newMsg]);
          // Mark as read
          (supabase.from('messages') as any)
            .update({ read_at: new Date().toISOString() })
            .eq('id', newMsg.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !user || !canSendMessage) return;

    const text = inputValue.trim();
    setInputValue('');

    try {
      let convId = conversation?.id;

      // Create conversation if it doesn't exist
      if (!convId) {
        // Determine participant order (smaller UUID first for consistency)
        const p1 = user.id < targetUserId ? user.id : targetUserId;
        const p2 = user.id < targetUserId ? targetUserId : user.id;

        const { data: newConv, error: convError } = await (supabase.from('conversations') as any)
          .insert({
            participant_1: p1,
            participant_2: p2,
            initiated_by: user.id,
            status: isMutualFollow ? 'active' : 'pending'
          } as any)
          .select()
          .single();

        if (convError) throw convError;
        convId = (newConv as any).id;
        setConversation(newConv as any as Conversation);
      }

      // Optimistic add
      const tempId = Date.now().toString();
      const newMessage: Message = {
        id: tempId,
        conversation_id: convId!,
        sender_id: user.id,
        receiver_id: targetUserId,
        content: text,
        message_type: 'text',
        read_at: null,
        created_at: new Date().toISOString(),
        pending: true
      };

      setMessages(prev => [...prev, newMessage]);

      // Send to database
      const { data, error } = await (supabase.from('messages') as any)
        .insert({
          conversation_id: convId,
          sender_id: user.id,
          receiver_id: targetUserId,
          content: text,
          message_type: 'text'
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? (data as any as Message) : m));

      // Stop typing indicator
      handleMessageSent();

      // If not mutual and this is pending, disable sending more
      if (!isMutualFollow && conversation?.status === 'pending') {
        setCanSendMessage(false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message
      setMessages(prev => prev.filter(m => m.id !== 'temp'));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Accept message request
  const acceptRequest = async () => {
    if (!conversation) return;

    await (supabase.from('conversations') as any)
      .update({ status: 'active' })
      .eq('id', conversation.id);

    setConversation({ ...conversation, status: 'active' });
    setShowRequestActions(false);
    setCanSendMessage(true);
  };

  // Restrict/Block user
  const restrictUser = async () => {
    if (!conversation) return;

    await (supabase.from('conversations') as any)
      .update({ status: 'restricted' })
      .eq('id', conversation.id);

    router.back();
  };

  // Format message time
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach(msg => {
      const msgDate = new Date(msg.created_at).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border-color)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <Link
            href={`/profile/${targetUserId}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="relative w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden flex-shrink-0">
              {targetUser?.avatar_url ? (
                <img src={targetUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold">
                  {(targetUser?.full_name || '?')[0]?.toUpperCase()}
                </div>
              )}
              <OnlineIndicator 
                userId={targetUserId} 
                size="sm" 
                position="bottom-right" 
                showOnlyOnline 
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-[var(--foreground)] text-sm truncate">
                  {targetUser?.full_name || targetUser?.username}
                </h1>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-tertiary)]" />
              </div>
              <div className="flex items-center gap-1">
                <OnlineIndicator userId={targetUserId} size="sm" showOnlyOnline />
                <OnlineStatusText 
                  userId={targetUserId} 
                  onlineText="En línea"
                  offlineText={`@${targetUser?.username}`}
                  className="text-xs"
                />
              </div>
            </div>
          </Link>

          <button className="p-2 text-[var(--foreground)]">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message Request Banner */}
      {showRequestActions && (
        <div className="bg-[var(--background-secondary)] border-b border-[var(--border-color)] p-4">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-sm text-[var(--foreground-secondary)] mb-3">
              <span className="font-semibold">{targetUser?.full_name || targetUser?.username}</span> quiere enviarte un mensaje.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={acceptRequest}
                className="px-6 py-2 bg-[var(--brand-pink)] text-white rounded-full text-sm font-semibold hover:bg-[var(--brand-pink-dark)] transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Aceptar
              </button>
              <button
                onClick={restrictUser}
                className="px-6 py-2 bg-[var(--background-tertiary)] text-[var(--foreground)] rounded-full text-sm font-semibold hover:bg-[var(--border-color)] transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Restringir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-lg mx-auto p-4">
          {/* Profile Card at top */}
          {messages.length === 0 && (
            <div className="text-center py-8 mb-6">
              <div className="w-20 h-20 rounded-full bg-[var(--background-secondary)] overflow-hidden mx-auto mb-3">
                {targetUser?.avatar_url ? (
                  <img src={targetUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold text-2xl">
                    {(targetUser?.full_name || '?')[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-[var(--foreground)]">
                {targetUser?.full_name || targetUser?.username}
              </h3>
              <p className="text-sm text-[var(--foreground-tertiary)]">
                @{targetUser?.username}
              </p>
              <Link
                href={`/profile/${targetUserId}`}
                className="inline-block mt-3 text-sm text-[var(--brand-pink)] font-semibold"
              >
                Ver perfil
              </Link>
            </div>
          )}

          {/* Messages grouped by date */}
          {messageGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date separator */}
              <div className="flex justify-center my-4">
                <span className="text-xs text-[var(--foreground-tertiary)] bg-[var(--background-secondary)] px-3 py-1 rounded-full capitalize">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-2">
                {group.messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id;
                  const showAvatar = !isMe && (
                    idx === 0 ||
                    group.messages[idx - 1]?.sender_id !== msg.sender_id
                  );
                  
                  // Check if this is the first unread message
                  const isFirstUnread = msg.id === firstUnreadMessageId;

                  return (
                    <div key={msg.id}>
                      {/* Unread messages divider */}
                      {isFirstUnread && (
                        <div 
                          ref={unreadDividerRef}
                          className="flex items-center gap-3 my-4"
                        >
                          <div className="flex-1 h-[1px] bg-[var(--brand-pink)]/30" />
                          <span className="text-xs text-[var(--brand-pink)] font-medium px-2">
                            Mensajes nuevos
                          </span>
                          <div className="flex-1 h-[1px] bg-[var(--brand-pink)]/30" />
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <div className="w-7 h-7 flex-shrink-0">
                            {showAvatar && (
                              <div className="w-7 h-7 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                                {targetUser?.avatar_url ? (
                                  <img src={targetUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[var(--foreground-tertiary)] font-bold text-xs">
                                    {(targetUser?.full_name || '?')[0]?.toUpperCase()}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`max-w-[70%] ${isMe ? 'order-1' : ''}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm ${isMe
                            ? 'bg-[var(--brand-pink)] text-white rounded-br-md'
                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] rounded-bl-md'
                            } ${msg.pending ? 'opacity-70' : ''}`}
                        >
                          {msg.content}
                        </div>
                        <p className={`text-[10px] text-[var(--foreground-tertiary)] mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(msg.created_at)}
                          {isMe && msg.read_at && ' · Visto'}
                        </p>
                      </div>
                    </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <TypingIndicator
            isTyping={isAnyoneTyping}
            text={getTypingText(usernameMap)}
            variant="bubble"
            className="mt-2"
          />

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Cannot send more messages notice */}
      {!canSendMessage && !showRequestActions && (
        <div className="bg-[var(--background-secondary)] border-t border-[var(--border-color)]">
          <div className="max-w-lg mx-auto px-4 py-3 md:p-4 text-center">
            <p className="text-xs md:text-sm text-[var(--foreground-tertiary)]">
              Solo puedes enviar un mensaje hasta que {targetUser?.full_name || targetUser?.username} acepte tu solicitud.
            </p>
          </div>
          {/* Minimal safe area spacing for iOS */}
          <div className="h-[env(safe-area-inset-bottom,0px)] md:hidden" />
        </div>
      )}

      {/* Input */}
      {canSendMessage && !showRequestActions && (
        <div className="border-t border-[var(--border-color)] bg-[var(--background)]">
          <div className="max-w-lg mx-auto px-3 py-2 md:p-3">
            <div className="flex items-center gap-2">
              <button className="p-1.5 md:p-2 text-[var(--brand-pink)]">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--brand-pink)] flex items-center justify-center">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              </button>

              <div className="flex-1 flex items-center gap-2 bg-[var(--background-secondary)] rounded-full px-3 md:px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    handleTypingChange();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Envía un mensaje..."
                  className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] outline-none"
                />

                <button className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]">
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              {inputValue.trim() ? (
                <button
                  onClick={handleSend}
                  className="p-1.5 md:p-2 text-[var(--brand-pink)] font-semibold"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button className="p-1.5 md:p-2 text-[var(--foreground-tertiary)]">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          {/* Minimal safe area spacing for iOS - only what's needed */}
          <div className="h-[env(safe-area-inset-bottom,0px)] md:hidden" />
        </div>
      )}
    </div>
  );
}
