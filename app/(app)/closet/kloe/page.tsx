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
  Search,
  Bot
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

const STORAGE_KEY = 'kloe_conversations_v1';
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
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-[var(--brand-pink)] text-xs mt-1">•</span>
                    <span className="flex-1">{formattedParts}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{formattedParts}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function KloePage() {
  const router = useRouter();
  const { user, isPremium, togglePremium } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState(0);
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycling thinking messages
  const thinkingMessages = [
    'Pensando en tu estilo...',
    'Analizando las prendas de tu armario...',
    'Buscando la combinación perfecta...',
    'Ajustando los detalles del look...'
  ];

  useEffect(() => {
    let interval: any;
    if (isTyping) {
      interval = setInterval(() => {
        setTypingStep((prev) => (prev + 1) % thinkingMessages.length);
      }, 2000);
    } else {
      setTypingStep(0);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  useBodyScrollLock(showWardrobeDrawer || showHistoryDrawer);

  // Load conversations from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('klosy_conversations_v1');
      if (stored) {
        const parsed: Conversation[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveConversationId(parsed[0].id);
          setMessages(parsed[0].messages || [INITIAL_MESSAGE]);
        }
      }
    } catch (e) {
      console.warn('[Kloe] Could not load stored conversations:', e);
    }
  }, []);

  // Save active conversation
  const persistConversations = (newConvs: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConvs));
      setConversations(newConvs);
    } catch (e) {
      console.warn('[Kloe] Error saving conversations:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch user wardrobe for drawer
  const fetchWardrobe = async () => {
    if (!user?.id) return;
    setLoadingWardrobe(true);
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setWardrobeClothes(data || []);
    } catch (err) {
      console.error('[Kloe] Error fetching wardrobe:', err);
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
    haptics.tap();
    const filtered = conversations.filter(c => c.id !== id);
    persistConversations(filtered);
    if (activeConversationId === id) {
      if (filtered.length > 0) {
        setActiveConversationId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        setActiveConversationId('default');
        setMessages([INITIAL_MESSAGE]);
      }
    }
    toast.info('Conversación eliminada');
  };

  // Send message handler
  const handleSend = async (customMessage?: string) => {
    const text = (customMessage || inputMessage).trim();
    if (!text || isTyping) return;

    haptics.tap();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyPayload = updatedMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

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
          toast.warning(data.error || 'Has alcanzado el límite diario con Kloe');
          const botMsg: ChatMessage = {
            id: `kloe_${Date.now()}`,
            role: 'assistant',
            content: data.message || 'Has alcanzado el límite de consultas por hoy. ¡Hablamos mañana!',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          return;
        }
        throw new Error(data.error || 'Error en la respuesta');
      }

      if (data.rate_limit) {
        setRateLimitInfo({ remainingDay: data.rate_limit.remaining_day });
      }

      const botMsg: ChatMessage = {
        id: `kloe_${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Aquí tienes mi recomendación de look.',
        recommended_outfit: data.recommended_outfit || null,
        highlighted_items: data.highlighted_items || [],
        follow_up_suggestions: data.follow_up_suggestions || [],
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Auto title on first prompt
      let title = text.slice(0, 30);
      if (text.length > 30) title += '...';

      let currentConvs = [...conversations];
      const activeIdx = currentConvs.findIndex(c => c.id === activeConversationId);

      if (activeIdx >= 0) {
        currentConvs[activeIdx] = {
          ...currentConvs[activeIdx],
          title: currentConvs[activeIdx].title === 'Nueva conversación' ? title : currentConvs[activeIdx].title,
          updatedAt: Date.now(),
          messages: finalMessages
        };
      } else {
        const newConv: Conversation = {
          id: activeConversationId === 'default' ? `conv_${Date.now()}` : activeConversationId,
          title,
          updatedAt: Date.now(),
          messages: finalMessages
        };
        currentConvs = [newConv, ...currentConvs].slice(0, MAX_CONVERSATIONS);
        setActiveConversationId(newConv.id);
      }

      persistConversations(currentConvs);

    } catch (err: any) {
      console.error('[Kloe] Chat error:', err);
      toast.error('No se pudo conectar con Kloe. Revisa tu conexión.');
    } finally {
      setIsTyping(false);
    }
  };

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
      
      {/* Header */}
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
            <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/kloe-avatar.png"
                alt="Kloe"
                fill
                className="object-contain drop-shadow-sm hover:scale-105 transition-transform"
                priority
              />
            </div>
            <h1 className="text-lg font-bold text-[var(--foreground)] leading-none">
              Kloe
            </h1>
            {isPremium() ? (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--brand-pink)] text-white shadow-xs tracking-wider">
                PRO
              </span>
            ) : (
              <Link href="/profile/settings" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--brand-pink)] transition-colors border border-[var(--border-color)]">
                FREE · Pro
              </Link>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6">
        
        {/* Free Tier Upgrade Banner */}
        {!isPremium() && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border border-[var(--brand-pink)]/30 rounded-2xl p-3 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[var(--brand-pink)] flex-shrink-0" />
              <p className="text-xs text-[var(--foreground-secondary)]">
                Estás en el plan <strong className="text-[var(--foreground)]">Free</strong>. Activa Kloe Pro para consultas ilimitadas y análisis de fotos.
              </p>
            </div>
            <Link
              href="/profile/settings"
              className="text-[11px] font-bold px-3 py-1.5 bg-[var(--brand-pink)] text-white rounded-xl hover:opacity-90 transition-opacity flex-shrink-0 shadow-xs ml-2"
            >
              Activar
            </Link>
          </motion.div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center mt-1">
                <Image
                  src="/kloe-avatar.png"
                  alt="Kloe"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble with smooth glass style */}
              <div
                className={`p-4 rounded-3xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-[var(--brand-pink)] to-[#ff4088] text-white rounded-tr-sm shadow-md shadow-[var(--brand-pink)]/20'
                    : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] rounded-tl-sm shadow-xs'
                }`}
              >
                <FormattedMessageText content={msg.content} isUser={msg.role === 'user'} />
              </div>

              {/* Recommended Outfit Card */}
              {msg.recommended_outfit && msg.recommended_outfit.items && msg.recommended_outfit.items.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="w-full mt-3.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                        {msg.recommended_outfit.name || 'Outfit Recomendado'}
                      </h4>
                      {msg.recommended_outfit.occasion && (
                        <p className="text-[11px] text-[var(--foreground-tertiary)] capitalize">
                          Para: {msg.recommended_outfit.occasion}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
                      {msg.recommended_outfit.items.length} prendas
                    </span>
                  </div>

                  {/* Garments Preview Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {msg.recommended_outfit.items.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedProduct(item)}
                        className="group relative aspect-square bg-[var(--background-secondary)] rounded-xl overflow-hidden border border-[var(--border-color)] hover:border-[var(--brand-pink)] cursor-pointer transition-all"
                      >
                        <Image
                          src={item.image_url || item.original_image}
                          alt={item.name}
                          fill
                          className="object-contain p-1.5 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <p className="text-[9px] font-medium text-white truncate text-center">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Direct Canvas Action Button */}
                  <Link
                    href={`/create?itemIds=${(msg.recommended_outfit.items || []).map((i: any) => i.id).join(',')}&name=${encodeURIComponent(msg.recommended_outfit.name || 'Look Kloe')}&occasion=${encodeURIComponent(msg.recommended_outfit.occasion || '')}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <Layers className="w-4 h-4" />
                    Montar y editar en el lienzo
                  </Link>
                </motion.div>
              )}

              {/* Follow-up Quick Suggestions */}
              {msg.follow_up_suggestions && msg.follow_up_suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {msg.follow_up_suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)]/15 text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] border border-[var(--border-color)] transition-all cursor-pointer text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        ))}

        {/* Animated Thinking & Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex gap-3 items-center justify-start"
            >
              {/* Floating pulsing mascot */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center"
              >
                <Image
                  src="/kloe-avatar.png"
                  alt="Kloe"
                  fill
                  className="object-contain drop-shadow-sm"
                />
              </motion.div>

              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-3">
                {/* 3 Bouncing Gradient Dots */}
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: dot * 0.18,
                        ease: 'easeInOut'
                      }}
                      className="w-2 h-2 rounded-full bg-[var(--brand-pink)]"
                    />
                  ))}
                </div>
                
                {/* Dynamic cycling thinking text */}
                <span className="text-xs text-[var(--foreground-secondary)] font-medium">
                  {thinkingMessages[typingStep]}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="sticky bottom-0 bg-[var(--background)]/90 backdrop-blur-xl px-4 py-3 border-t border-[var(--border-color)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[var(--background-secondary)] rounded-full px-4 py-2 border border-[var(--border-color)] focus-within:border-[var(--brand-pink)] transition-all shadow-xs"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pregúntale a Kloe sobre tus prendas u outfits..."
            disabled={isTyping}
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-tertiary)]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className={`p-2 rounded-full transition-all ${
              inputMessage.trim() && !isTyping
                ? 'bg-[var(--brand-pink)] text-white hover:scale-105 shadow-sm'
                : 'text-[var(--foreground-tertiary)] opacity-50 cursor-not-allowed'
            }`}
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryDrawer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[var(--card-bg)] border-r border-[var(--border-color)] z-50 p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[var(--brand-pink)]" />
                    <h3 className="font-bold text-base text-[var(--foreground)]">Conversaciones</h3>
                  </div>
                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className="p-1 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* New Chat Button */}
                <button
                  onClick={handleNewConversation}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--brand-pink)] text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Nueva conversación
                </button>

                {/* Conversation List */}
                <div className="space-y-2 mt-4">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                        activeConversationId === conv.id
                          ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)]/40 text-[var(--foreground)]'
                          : 'bg-[var(--background-secondary)] border-transparent text-[var(--foreground-secondary)] hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MessageSquare className="w-4 h-4 text-[var(--brand-pink)] flex-shrink-0" />
                        <span className="text-xs font-semibold truncate">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                        title="Borrar conversación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wardrobe Drawer */}
      <AnimatePresence>
        {showWardrobeDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWardrobeDrawer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[var(--card-bg)] border-l border-[var(--border-color)] z-50 p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-[var(--brand-pink)]" />
                    <h3 className="font-bold text-base text-[var(--foreground)]">Tu Armario ({wardrobeClothes.length})</h3>
                  </div>
                  <button
                    onClick={() => setShowWardrobeDrawer(false)}
                    className="p-1 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Wardrobe Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)]" />
                  <input
                    type="text"
                    value={wardrobeSearch}
                    onChange={(e) => setWardrobeSearch(e.target.value)}
                    placeholder="Buscar prenda o color..."
                    className="w-full pl-9 pr-3 py-2 bg-[var(--background-secondary)] text-xs rounded-xl border border-[var(--border-color)] outline-none text-[var(--foreground)]"
                  />
                </div>

                {/* Garments Grid */}
                {loadingWardrobe ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-pink)]" />
                  </div>
                ) : filteredWardrobe.length === 0 ? (
                  <p className="text-center text-xs text-[var(--foreground-tertiary)] py-10">
                    No se encontraron prendas.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredWardrobe.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowWardrobeDrawer(false);
                          handleSend(`¿Cómo puedo combinar mi ${item.name || 'prenda'}?`);
                        }}
                        className="group relative aspect-square bg-[var(--background-secondary)] rounded-2xl overflow-hidden border border-[var(--border-color)] hover:border-[var(--brand-pink)] cursor-pointer transition-all p-2 flex flex-col justify-between"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={item.image_url || item.original_image}
                            alt={item.name || 'Prenda'}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-[var(--foreground)] truncate mt-1">
                          {item.name || item.category}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          item={selectedProduct}
        />
      )}
    </div>
  );
}
