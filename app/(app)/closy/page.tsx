'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, ArrowLeft, Shirt, Layers, Wand2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';

export default function ClosyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola ${user?.username || ''}! Soy **CloSy**, tu estilista inteligente personal. Conozco las prendas de tu armario, tus outfits y tus estilos favoritos. ¿Para qué ocasión o momento necesitas que te arme un look hoy?`,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    '✨ Arma un look casual con mis prendas',
    '🌙 Recomiéndame un outfit para una cena',
    '💼 Outfit formal para el trabajo o reunión',
    '👟 Look cómodo para fin de semana'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulated CloSy AI assistant response for initial preview
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `Estoy analizando las prendas de tu armario y tus preferencias de estilo para componer la mejor opción para "${text}". ¡Muy pronto conectaremos el motor completo de CloSy AI para sugerirte y montar outfits visuales interactivos al instante!`,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between max-w-2xl mx-auto border-x border-[var(--border-color)]/30 pb-20 md:pb-6">
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
              <p className="text-xs text-[var(--foreground-tertiary)]">Asistente personal de armario</p>
            </div>
          </div>
        </div>

        <Link
          href="/closet"
          className="p-2 text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] flex items-center gap-1 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
        >
          <Shirt className="w-4 h-4" />
          <span className="hidden sm:inline">Mi Armario</span>
        </Link>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--brand-pink)] text-white font-medium rounded-tr-sm shadow-md'
                  : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)]/60 rounded-tl-sm shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>
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
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs whitespace-nowrap px-3.5 py-2 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]/80 border border-[var(--border-color)]/40 transition-colors font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
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
            placeholder="Pregúntale a CloSy sobre un outfit o qué ponerte..."
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
    </div>
  );
}
