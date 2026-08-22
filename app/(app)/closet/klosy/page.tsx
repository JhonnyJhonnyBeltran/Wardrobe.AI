'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ArrowLeft, 
  Shirt, 
  Check, 
  Plus, 
  Layers, 
  Loader2, 
  History, 
  Trash2, 
  X, 
  Sparkles, 
  MessageSquare,
  Search
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptic';
import ProductModal from '@/components/ProductModal';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommended_outfit?: {
    name: string;
    occasion?: string;
    items: Array<any>;
  } | null;
  highlighted_items?: Array<any>;
  follow_up_suggestions?: string[];
  timestamp: Date | string;
  savedOutfitId?: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'klosy_conversations_v1';
const MAX_CONVERSATIONS = 5;

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '¡Hola! Puedes preguntarme cualquier cosa sobre tu ropa y estoy lista para ayudarte a crear cualquier look.',
  follow_up_suggestions: [
    'Arma un look casual con mis prendas',
    'Recomiéndame un outfit para una cena',
    'Outfit formal para el trabajo o reunión',
    'Look cómodo para fin de semana'
  ],
  timestamp: new Date()
};

function FormattedMessageText({ content, isUser }: { content: string; isUser?: boolean }) {
  // Normalize punctuation spacing around bold asterisks e.g. " , **Nike**" -> ", **Nike**"
  const cleaned = (content || '')
    .replace(/\s+,\s+\*\*/g, ', **')
    .replace(/\s+,\s+/g, ', ')
    .trim();

  const paragraphs = cleaned.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split(/\n/);
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
              const textContent = isBullet ? line.trim().substring(2) : line;

              // Parse bold tokens **...**
              const parts = textContent.split(/(\*\*[^*]+\*\*)/g);

              const formattedParts = parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2);
                  return (
                    <strong 
                      key={partIdx} 
                      className={`font-bold ${isUser ? 'text-white' : 'text-[var(--foreground)]'}`}
                    >
                      {boldText}
                    </strong>
                  );
                }
                return <span key={partIdx}>{part}</span>;
              });

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isUser ? 'bg-white' : 'bg-[var(--brand-pink)]'}`} />
                    <span className="flex-1">{formattedParts}</span>
                  </div>
                );
              }

              return (
                <div key={lIdx}>
                  {formattedParts}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function KlosyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remainingDay?: number }>({});
  
  // Drawers
  const [showWardrobeDrawer, setShowWardrobeDrawer] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  
  // Wardrobe Items Cache
  const [wardrobeClothes, setWardrobeClothes] = useState<any[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);
  const [wardrobeSearch, setWardrobeSearch] = useState('');

  // Conversations State (Max 5)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('default');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!selectedProduct || showWardrobeDrawer || showHistoryDrawer);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Conversation[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveConversationId(parsed[0].id);
          setMessages(parsed[0].messages || [INITIAL_MESSAGE]);
          return;
        }
      }
    } catch (e) {
      console.warn('[Klosy] Could not load stored conversations:', e);
    }

    // Default initialization
    const initialConv: Conversation = {
      id: 'default',
      title: 'Conversación inicial',
      updatedAt: Date.now(),
      messages: [INITIAL_MESSAGE]
    };
    setConversations([initialConv]);
  }, []);

  // Save conversations to localStorage
  const persistConversations = (convList: Conversation[]) => {
    try {
      const trimmed = convList.slice(0, MAX_CONVERSATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      setConversations(trimmed);
    } catch (e) {
      console.warn('[Klosy] Error saving conversations:', e);
    }
  };

  // Fetch Wardrobe Clothes for the right drawer
  const fetchWardrobe = async () => {
    if (!user || wardrobeClothes.length > 0) return;
    setLoadingWardrobe(true);
    try {
      const { data } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setWardrobeClothes(data || []);
    } catch (err) {
      console.error('[Klosy] Error fetching wardrobe:', err);
    } finally {
      setLoadingWardrobe(false);
    }
  };

  const openWardrobe = () => {
    haptics.selection();
    setShowWardrobeDrawer(true);
    fetchWardrobe();
  };

  // Create a new conversation
  const handleNewConversation = () => {
    haptics.selection();
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'Nueva conversación',
      updatedAt: Date.now(),
      messages: [INITIAL_MESSAGE]
    };

    const updated = [newConv, ...conversations.filter(c => c.id !== 'default')].slice(0, MAX_CONVERSATIONS);
    persistConversations(updated);
    setActiveConversationId(newId);
    setMessages([INITIAL_MESSAGE]);
    setShowHistoryDrawer(false);
    toast.success('Nueva conversación iniciada');
  };

  // Switch active conversation
  const handleSelectConversation = (conv: Conversation) => {
    haptics.selection();
    setActiveConversationId(conv.id);
    setMessages(conv.messages || [INITIAL_MESSAGE]);
    setShowHistoryDrawer(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.selection();
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      const resetConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: 'Nueva conversación',
        updatedAt: Date.now(),
        messages: [INITIAL_MESSAGE]
      };
      persistConversations([resetConv]);
      setActiveConversationId(resetConv.id);
      setMessages([INITIAL_MESSAGE]);
    } else {
      persistConversations(filtered);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0].id);
        setMessages(filtered[0].messages);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    haptics.selection();

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    
    // Reset textarea height
    const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
    if (textarea) textarea.style.height = 'auto';

    setIsTyping(true);

    try {
      const historyPayload = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/closy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          toast.error(data.error || 'Has alcanzado el límite de consultas por hoy');
        } else {
          toast.error(data.error || 'Error al consultar a Klosy');
        }
        setIsTyping(false);
        return;
      }

      if (data.rate_limit?.remaining_day !== undefined) {
        setRateLimitInfo({ remainingDay: data.rate_limit.remaining_day });
      }

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.message,
        recommended_outfit: data.recommended_outfit,
        highlighted_items: data.highlighted_items,
        follow_up_suggestions: data.follow_up_suggestions,
        timestamp: new Date()
      };

      haptics.success();
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      // Update current conversation in directory
      const autoTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
      const updatedConvs = conversations.map(c => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            title: c.title === 'Nueva conversación' || c.title === 'Conversación inicial' ? autoTitle : c.title,
            updatedAt: Date.now(),
            messages: finalMessages
          };
        }
        return c;
      });
      persistConversations(updatedConvs);

    } catch (err: any) {
      console.error('[Klosy] Chat error:', err);
      toast.error('No se pudo conectar con Klosy. Revisa tu conexión.');
    } finally {
      setIsTyping(false);
    }
  };

  // Filter wardrobe clothes for right drawer
  const filteredWardrobe = wardrobeClothes.filter(c => {
    if (!wardrobeSearch) return true;
    const q = wardrobeSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.color || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between max-w-3xl mx-auto pb-20 md:pb-6">
      
      {/* Header - Completely borderless & floating mascot without bubbles */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/85 backdrop-blur-xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            {/* Pure floating mascot icon without box, bubble or border */}
            <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/klosy-avatar.png"
                alt="Klosy"
                fill
                className="object-contain drop-shadow-sm hover:scale-105 transition-transform"
                priority
              />
            </div>
            <h1 className="text-lg font-bold text-[var(--foreground)] leading-none">
              Klosy
            </h1>
          </div>
        </div>

        {/* Right Action Icons (History & Wardrobe Drawer) */}
        <div className="flex items-center gap-1">
          {/* Conversations History Icon */}
          <button
            onClick={() => {
              haptics.selection();
              setShowHistoryDrawer(true);
            }}
            className="p-2.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--background-secondary)] transition-colors relative"
            title="Conversaciones guardadas"
            aria-label="Historial de conversaciones"
          >
            <History className="w-5 h-5" />
            {conversations.length > 1 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--brand-pink)]" />
            )}
          </button>

          {/* Wardrobe Drawer Icon (Only Icon) */}
          <button
            onClick={openWardrobe}
            className="p-2.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--background-secondary)] transition-colors"
            title="Ver mis prendas"
            aria-label="Ver mis prendas"
          >
            <Shirt className="w-5 h-5 text-[var(--brand-pink)]" />
          </button>
        </div>
      </header>

      {/* Messages Container - Clean, open, no harsh borders */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              /* Floating mascot avatar without bubble/box */
              <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center mt-1">
                <Image
                  src="/klosy-avatar.png"
                  alt="Klosy"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className={`space-y-3.5 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Text Bubble with Clean Markdown Formatter */}
              <div
                className={`rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[var(--brand-pink)] text-white font-medium rounded-tr-sm'
                    : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)]/50 rounded-tl-sm'
                }`}
              >
                <FormattedMessageText content={msg.content} isUser={msg.role === 'user'} />
              </div>

              {/* Recommended Outfit Card Preview */}
              {msg.recommended_outfit && msg.recommended_outfit.items && msg.recommended_outfit.items.length > 0 && (
                <div className="bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--brand-pink)]/30 rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">
                        {msg.recommended_outfit.name}
                      </h4>
                    </div>

                    {msg.recommended_outfit.occasion && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border-color)]">
                        {msg.recommended_outfit.occasion}
                      </span>
                    )}
                  </div>

                  {/* Garments Grid in this outfit */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {msg.recommended_outfit.items.map((garment: any, idx: number) => (
                      <button
                        key={garment.id || idx}
                        type="button"
                        onClick={() => setSelectedProduct(garment)}
                        className="group flex flex-col items-center bg-[var(--background-secondary)] p-2 rounded-xl border border-[var(--border-color)]/50 hover:border-[var(--brand-pink)]/50 transition-all text-left"
                      >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/50 mb-1.5 flex items-center justify-center">
                          {garment.imageUrl || garment.image_url ? (
                            <Image
                              src={garment.imageUrl || garment.image_url}
                              alt={garment.name}
                              fill
                              className="object-contain p-1 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Shirt className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-[var(--foreground)] truncate w-full">
                          {garment.name}
                        </p>
                        <p className="text-[10px] text-[var(--foreground-tertiary)] capitalize truncate w-full">
                          {garment.category}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Action: Open in Canvas to customize & position */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <Link
                      href={`/create?itemIds=${(msg.recommended_outfit.items || []).map((i: any) => i.id).join(',')}&name=${encodeURIComponent(msg.recommended_outfit.name || 'Look Klosy')}&occasion=${encodeURIComponent(msg.recommended_outfit.occasion || '')}`}
                      className="flex-1 py-2.5 px-4 bg-[var(--brand-pink)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--brand-pink)]/20"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Montar y editar en el lienzo</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Follow-up suggestions chips */}
              {msg.follow_up_suggestions && msg.follow_up_suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.follow_up_suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/50 transition-colors font-medium text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-xs text-[var(--foreground-tertiary)]"
          >
            {/* Floating mascot in typing indicator without box */}
            <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/klosy-avatar.png"
                alt="Klosy"
                fill
                className="object-contain animate-pulse"
              />
            </div>
            <div className="flex gap-1 py-2 px-3 bg-[var(--card-bg)] border border-[var(--border-color)]/50 rounded-2xl">
              <span className="w-1.5 h-1.5 bg-[var(--brand-pink)] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[var(--brand-pink)] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[var(--brand-pink)] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating (Same as /messages) */}
      <div className="pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-2 px-4 md:px-6 shrink-0 bg-transparent">
        <div className="w-full">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-[var(--background)]/90 backdrop-blur-xl rounded-[24px] border border-[var(--border-color)] shadow-lg flex items-end pr-1.5 pl-4 transition-all focus-within:border-[var(--brand-pink)]/50 focus-within:ring-1 focus-within:ring-[var(--brand-pink)]/20">
              <textarea
                id="chat-input"
                value={inputMessage}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="w-full bg-transparent max-h-32 min-h-[46px] py-3 text-[15px] resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] !outline-none !ring-0 border-none !shadow-none"
                rows={1}
              />
              <div className="flex items-center h-[46px] flex-shrink-0">
                <AnimatePresence>
                  {inputMessage.trim() && (
                    <motion.button
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSend()}
                      disabled={isTyping}
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

      {/* RIGHT DRAWER: User's Wardrobe Clothes */}
      <AnimatePresence>
        {showWardrobeDrawer && (
          <div className="fixed inset-0 z-[7000] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowWardrobeDrawer(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-full max-w-sm h-full bg-[var(--background)] shadow-2xl flex flex-col z-10 border-l border-[var(--border-color)]/50"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[var(--border-color)]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-[var(--brand-pink)]" />
                  <h3 className="font-bold text-base text-[var(--foreground)]">Mis Prendas</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-secondary)] font-semibold text-[var(--foreground-secondary)]">
                    {wardrobeClothes.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowWardrobeDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search in Wardrobe */}
              <div className="p-3 border-b border-[var(--border-color)]/30">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-[var(--foreground-tertiary)] absolute left-3" />
                  <input
                    type="text"
                    value={wardrobeSearch}
                    onChange={(e) => setWardrobeSearch(e.target.value)}
                    placeholder="Buscar prenda o color..."
                    className="w-full pl-9 pr-3 py-2 bg-[var(--background-secondary)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-pink)]"
                  />
                </div>
              </div>

              {/* Garments List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingWardrobe ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-pink)]" />
                  </div>
                ) : filteredWardrobe.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Shirt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[var(--foreground)]">No hay prendas</p>
                    <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                      {wardrobeSearch ? 'No se encontraron prendas para esa búsqueda' : 'Añade ropa a tu armario para verla aquí'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredWardrobe.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[var(--card-bg)] border border-[var(--border-color)]/50 rounded-2xl p-2.5 flex flex-col justify-between hover:border-[var(--brand-pink)]/50 transition-colors group"
                      >
                        <div
                          onClick={() => setSelectedProduct(item)}
                          className="cursor-pointer"
                        >
                          <div className="relative w-full aspect-square rounded-xl bg-[var(--background-secondary)] overflow-hidden mb-2 flex items-center justify-center">
                            {item.image_url || item.original_image_url ? (
                              <Image
                                src={item.image_url || item.original_image_url}
                                alt={item.name}
                                fill
                                className="object-contain p-1 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <Shirt className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-[var(--foreground)] truncate">{item.name}</p>
                          <p className="text-[10px] text-[var(--foreground-tertiary)] capitalize truncate">{item.category}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowWardrobeDrawer(false);
                            handleSend(`¿Cómo puedo combinar mi ${item.name} (${item.category})?`);
                          }}
                          className="mt-2 w-full py-1.5 px-2 bg-[var(--brand-pink)]/10 hover:bg-[var(--brand-pink)] text-[var(--brand-pink)] hover:text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Combinar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: Conversations Directory (Max 5) */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-[7000] flex justify-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowHistoryDrawer(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-full max-w-sm h-full bg-[var(--background)] shadow-2xl flex flex-col z-10 border-r border-[var(--border-color)]/50"
            >
              {/* Directory Header */}
              <div className="p-4 border-b border-[var(--border-color)]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[var(--brand-pink)]" />
                  <h3 className="font-bold text-base text-[var(--foreground)]">Conversaciones</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-secondary)] font-semibold text-[var(--foreground-secondary)]">
                    {conversations.length}/5
                  </span>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* New Conversation Button */}
              <div className="p-3 border-b border-[var(--border-color)]/30">
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="w-full py-2.5 px-4 bg-[var(--brand-pink)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-[var(--brand-pink)]/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva conversación</span>
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`group p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/30 text-[var(--brand-pink)]'
                          : 'bg-[var(--card-bg)] border border-[var(--border-color)]/40 hover:bg-[var(--background-secondary)] text-[var(--foreground)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{conv.title}</p>
                          <p className="text-[10px] text-[var(--foreground-tertiary)]">
                            {new Date(conv.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {conversations.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductModal
        item={selectedProduct ? ({
          id: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          type: selectedProduct.category,
          category: selectedProduct.category,
          color: selectedProduct.color,
          colorHex: selectedProduct.color_hex || selectedProduct.colorHex,
          imageUrl: selectedProduct.imageUrl || selectedProduct.image_url,
          sourceUrl: selectedProduct.source_url || selectedProduct.sourceUrl,
          price: selectedProduct.price,
          reference: selectedProduct.reference,
          size: selectedProduct.size
        } as any) : null}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
