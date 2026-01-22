'use client';

/**
 * Direct Message Chat Page
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { useUser } from '@/store/userStore';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ChatPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const targetUserId = params.id as string;

  const [targetUser, setTargetUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch target user and initial messages
  useEffect(() => {
    if (!user || !targetUserId) return;

    const initChat = async () => {
      // 1. Get Target User Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      setTargetUser(profile);

      // 2. Get History
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (msgs) {
        setMessages(msgs);
      }
      setLoading(false);
    };

    initChat();

    // 3. Subscribe to new messages
    const channel = supabase
      .channel(`chat:${targetUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.sender_id === targetUserId) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, targetUserId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user) return;

    const text = inputValue.trim();
    setInputValue(''); // Optimistic clear

    // Optimistic Add
    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      sender_id: user.id,
      receiver_id: targetUserId,
      content: text,
      created_at: new Date().toISOString(),
      pending: true
    };

    setMessages(prev => [...prev, newMessage]);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: targetUserId,
        content: text
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      // Remove failed message or show error state (simplified here)
    } else if (data) {
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--brand-pink)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[var(--background)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--background)] z-10 sticky top-0">
        <button onClick={() => router.back()} className="text-[var(--foreground)]">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] overflow-hidden flex-shrink-0">
          {targetUser?.avatar_url ? (
            <img src={targetUser.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--foreground-secondary)] font-bold">
              {(targetUser?.full_name || '?')[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="font-bold text-[var(--foreground)] text-sm">{targetUser?.full_name || targetUser?.username}</h1>
          <p className="text-xs text-[var(--foreground-tertiary)]">@{targetUser?.username}</p>
        </div>

        <button className="text-[var(--foreground-secondary)]">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar bg-[var(--background)]">
        {messages.length === 0 && (
          <div className="text-center py-10 text-[var(--foreground-tertiary)] text-sm">
            Envía un mensaje para comenzar a charlar.
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMe
                    ? 'bg-[var(--brand-pink)] text-white rounded-br-none'
                    : 'bg-[var(--background-secondary)] text-[var(--foreground)] rounded-bl-none'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--background)] safe-area-pb">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[var(--background-secondary)] border-none focus:ring-2 focus:ring-[var(--brand-pink)] text-sm text-[var(--foreground)] outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
