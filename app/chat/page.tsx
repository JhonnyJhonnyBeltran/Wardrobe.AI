'use client';

/**
 * Chat Page - AI Fashion Assistant with Quick Actions
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components';
import { chatQuickActions, aiResponses } from '@/data/mockOutfits';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: '¡Hola, babe! 👋✨ Soy tu asistente de moda personal. Estoy aquí para ayudarte a crear looks increíbles y mantenerte al día con las tendencias. ¿En qué puedo ayudarte hoy?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('tendencia') || lowerMessage.includes('trend')) {
      return aiResponses.trends;
    }
    if (lowerMessage.includes('influencer') || lowerMessage.includes('it-girl')) {
      return aiResponses.influencers;
    }

    return aiResponses.default;
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: typeof chatQuickActions[0]) => {
    handleSend(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Fashion Assistant
        </h1>
        <p className="text-gray-600 text-sm">
          Tu asistente de moda personal con IA
        </p>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col bg-white rounded-3xl shadow-md overflow-hidden"
      >
        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-violet-50">
          <p className="text-xs font-medium text-gray-500 mb-2">Acciones rápidas</p>
          <div className="flex gap-2 flex-wrap">
            {chatQuickActions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-pink-100 text-sm font-medium text-gray-700 hover:border-pink-300 hover:bg-pink-50 transition-all shadow-sm"
              >
                {action.id === 'trends' && <TrendingUp className="w-4 h-4 text-pink-500" />}
                {action.id === 'influencers' && <Users className="w-4 h-4 text-violet-500" />}
                {action.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-4 py-3 ${message.sender === 'user'
                    ? 'gradient-primary text-white rounded-br-lg'
                    : 'bg-gray-100 text-gray-900 rounded-bl-lg'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-3xl rounded-bl-lg px-4 py-3">
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregúntame sobre moda..."
              className="flex-1 px-5 py-3 rounded-full bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}