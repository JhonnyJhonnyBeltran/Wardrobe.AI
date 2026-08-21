'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Bot, 
  ArrowLeft, 
  Shirt, 
  Check, 
  Plus, 
  Layers, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
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
  timestamp: Date;
  savedOutfitId?: string;
}

export default function ClosyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [savingOutfitMap, setSavingOutfitMap] = useState<Record<string, boolean>>({});
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remainingDay?: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!selectedProduct);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola ${user?.username ? `@${user.username}` : ''}! Soy **CloSy**, tu estilista inteligente personal. 

He indexado las prendas de tu armario, tus outfits y tus preferencias de estilo. ¿Para qué ocasión o momento necesitas que te arme un look hoy?`,
      follow_up_suggestions: [
        '✨ Arma un look casual con mis prendas',
        '🌙 Recomiéndame un outfit para una cena',
        '💼 Outfit formal para el trabajo o reunión',
        '👟 Look cómodo para fin de semana'
      ],
      timestamp: new Date()
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare history for context
      const historyPayload = messages.map(m => ({
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
          toast.error(data.error || 'Error al consultar a CloSy AI');
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
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error('[CloSy] Chat error:', err);
      toast.error('No se pudo conectar con CloSy AI. Revisa tu conexión.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveRecommendedOutfit = async (msgId: string, outfit: any) => {
    if (!outfit || !outfit.items || outfit.items.length === 0) return;

    setSavingOutfitMap(prev => ({ ...prev, [msgId]: true }));
    haptics.selection();

    try {
      const res = await fetch('/api/closy/save-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: outfit.name,
          occasion: outfit.occasion,
          items: outfit.items
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar outfit');
      }

      haptics.success();
      toast.success('¡Outfit guardado en tu armario!');

      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return { ...m, savedOutfitId: data.outfit_id };
        }
        return m;
      }));

    } catch (err: any) {
      console.error('[CloSy] Save outfit error:', err);
      toast.error(err?.message || 'Error al guardar outfit');
    } finally {
      setSavingOutfitMap(prev => ({ ...prev, [msgId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between max-w-3xl mx-auto border-x border-[var(--border-color)]/30 pb-20 md:pb-6">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/85 backdrop-blur-xl border-b border-[var(--border-color)]/50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[var(--brand-pink)] to-purple-600 flex items-center justify-center text-white shadow-md shadow-[var(--brand-pink)]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--foreground)] flex items-center gap-1.5 leading-tight">
                CloSy AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
                  Estilista
                </span>
              </h1>
              <p className="text-xs text-[var(--foreground-tertiary)]">
                {rateLimitInfo.remainingDay !== undefined 
                  ? `${rateLimitInfo.remainingDay} consultas restantes hoy` 
                  : 'Asistente de armario y estilo'}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/closet"
          className="p-2 text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] flex items-center gap-1 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
        >
          <Shirt className="w-4 h-4 text-[var(--brand-pink)]" />
          <span className="hidden sm:inline">Mi Armario</span>
        </Link>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--brand-pink)] to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`space-y-3.5 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Text Bubble */}
              <div
                className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--brand-pink)] text-white font-medium rounded-tr-sm shadow-md'
                    : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)]/60 rounded-tl-sm shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line prose dark:prose-invert prose-sm max-w-none">
                  {msg.content}
                </div>
              </div>

              {/* Recommended Outfit Card Preview (if generated by CloSy) */}
              {msg.recommended_outfit && msg.recommended_outfit.items && msg.recommended_outfit.items.length > 0 && (
                <div className="bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--brand-pink)]/30 rounded-2xl p-4 shadow-lg space-y-3">
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

                  {/* Action: Save Outfit to Wardrobe */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    {msg.savedOutfitId ? (
                      <Link
                        href="/closet"
                        className="flex-1 py-2.5 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>¡Guardado en tu Armario! Ver look</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={savingOutfitMap[msg.id]}
                        onClick={() => handleSaveRecommendedOutfit(msg.id, msg.recommended_outfit)}
                        className="flex-1 py-2.5 px-4 bg-[var(--brand-pink)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--brand-pink)]/20 disabled:opacity-50"
                      >
                        {savingOutfitMap[msg.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Guardando outfit...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>✨ Guardar Outfit en mi Armario</span>
                          </>
                        )}
                      </button>
                    )}
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
            <div className="w-8 h-8 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[var(--brand-pink)] animate-pulse" />
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

      {/* Input Bar */}
      <div className="p-4 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pregúntale a CloSy sobre un outfit, combinación o evento..."
            className="w-full pl-4 pr-12 py-3.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-sm text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 transition-all font-medium shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-2 p-2.5 bg-[var(--brand-pink)] text-white rounded-xl disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--brand-pink)]/20"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

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
