'use client';

/**
 * Chat Page - AI Fashion Assistant with Real Fashion Data
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components';
import fashionData from '@/data/fashionData.json';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Generate AI responses using real fashion data
const generateAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  const { trends, items, brands } = fashionData;

  // Trends query
  if (lowerMessage.includes('tendencia') || lowerMessage.includes('trend') || lowerMessage.includes('moda')) {
    const topTrends = trends.slice(0, 5);
    const trendsList = topTrends
      .map((t, i) => `${i + 1}. **${t.name}** - ${t.description}`)
      .join('\n');

    return `¡Aquí tienes las tendencias más hot de ${trends[0]?.season || 'esta temporada'}!

${trendsList}

Las marcas que más están apostando por estas tendencias son ${brands.slice(0, 3).map(b => b.name).join(', ')}.

¿Quieres que te arme un outfit con alguna de estas tendencias?`;
  }

  // Influencers/celebrities query
  if (lowerMessage.includes('influencer') || lowerMessage.includes('it-girl') || lowerMessage.includes('famosa')) {
    const luxuryItems = items.filter(i => i.priceRange === 'luxury' || i.priceRange === 'premium');
    const itemsList = luxuryItems
      .slice(0, 5)
      .map(i => `• **${i.brand} ${i.name}** - ${i.description}`)
      .join('\n');

    return `Las it-girls están obsesionadas con el estilo "Quiet Luxury" esta temporada. Aquí tienes las piezas más codiciadas:

${itemsList}

Lo que más se repite en las calles de París y Nueva York: menos logos, más calidad. The Row y Totême son las marcas del momento.

¿Te inspiras en alguna de estas piezas?`;
  }

  // Brand query
  if (lowerMessage.includes('marca') || lowerMessage.includes('brand')) {
    const brandsList = brands
      .slice(0, 5)
      .map((b, i) => `${i + 1}. **${b.name}** (${b.tier}) - Score: ${b.trendingScore}/100`)
      .join('\n');

    return `Las marcas más trending ahora mismo según el Lyst Index:

${brandsList}

**The Row** lidera con su minimalismo elevado, mientras que **Loewe** destaca con su artesanía española.

¿Te interesa alguna marca en particular?`;
  }

  // Items/shopping query
  if (lowerMessage.includes('prenda') || lowerMessage.includes('comprar') || lowerMessage.includes('outfit') || lowerMessage.includes('item') || lowerMessage.includes('shop')) {
    const trendingItems = items.filter(i => i.trending).slice(0, 6);
    const itemsList = trendingItems
      .map(i => `• **${i.brand} ${i.name}** - ${i.price || i.priceRange}${i.buyLink ? ` → [Comprar](${i.buyLink})` : ''}`)
      .join('\n');

    return `Estas son las prendas trending que te recomiendo:

${itemsList}

Todas estas prendas están disponibles en las tiendas oficiales. Haz clic en "Comprar" para ir directamente a la web.

¿Quieres que te ayude a combinar alguna?`;
  }

  // Default response with context
  const randomTrend = trends[Math.floor(Math.random() * Math.min(3, trends.length))];
  const randomItem = items[Math.floor(Math.random() * Math.min(5, items.length))];

  return `¡Hola! Estoy al día con las últimas tendencias de moda.

Ahora mismo, **${randomTrend?.name || 'Quiet Luxury'}** está dominando las pasarelas y el street style. Si buscas una pieza clave, te recomiendo **${randomItem?.brand} ${randomItem?.name}**.

Puedo ayudarte con:
• Tendencias actuales y cómo llevarlas
• Prendas específicas de las mejores marcas
• Outfits personalizados para cualquier ocasión
• Tips de estilo de influencers

¿Qué te gustaría explorar?`;
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: `¡Hola! Soy tu asistente de moda con acceso a las últimas tendencias de ELLE, WhoWhatWear y Harper's Bazaar. 

Ahora mismo **${fashionData.trends[0]?.name || 'Quiet Luxury'}** y **${fashionData.trends[1]?.name || 'Cherry Red'}** están en todas partes.

¿En qué puedo ayudarte hoy?`,
    sender: 'ai',
    timestamp: new Date(),
  },
];

const quickActions = [
  { id: 'trends', label: 'Tendencias', icon: TrendingUp, prompt: '¿Cuáles son las tendencias de moda actuales?' },
  { id: 'influencers', label: 'Influencers', icon: Users, prompt: '¿Qué están usando las influencers ahora?' },
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

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSend(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] pt-4">
      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-lg dark:shadow-gray-950/50 overflow-hidden"
      >
        {/* Quick Actions */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-pink-50/80 to-violet-50/80 dark:from-pink-950/30 dark:to-violet-950/30">
          <div className="flex gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-md transition-all"
                >
                  <Icon className="w-4 h-4 text-pink-500" />
                  {action.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-3xl px-4 py-3 ${message.sender === 'user'
                    ? 'gradient-primary text-white rounded-br-lg shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-lg'
                    }`}
                >
                  <p
                    className="text-sm whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: message.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
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
                <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl rounded-bl-lg px-4 py-3">
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregúntame sobre moda..."
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/50 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="w-11 h-11 rounded-full gradient-primary text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}