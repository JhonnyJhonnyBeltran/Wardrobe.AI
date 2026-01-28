'use client';

/**
 * TypingIndicator
 * Componente visual para mostrar que alguien está escribiendo
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  /** Si alguien está escribiendo */
  isTyping: boolean;
  /** Texto a mostrar (ej: "Juan está escribiendo...") */
  text?: string;
  /** Variante visual */
  variant?: 'dots' | 'text' | 'bubble';
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Animated dots component
 */
const TypingDots = memo(function TypingDots() {
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
          initial={{ opacity: 0.4, y: 0 }}
          animate={{
            opacity: [0.4, 1, 0.4],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

/**
 * Bubble variant - looks like a message bubble with dots
 */
const TypingBubble = memo(function TypingBubble({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 p-2">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <TypingDots />
      </div>
      {text && (
        <span className="text-xs text-gray-400 self-end">{text}</span>
      )}
    </div>
  );
});

/**
 * Text variant - simple text with animated dots
 */
const TypingText = memo(function TypingText({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <TypingDots />
      <span>{text}</span>
    </div>
  );
});

/**
 * Main TypingIndicator component
 */
export const TypingIndicator = memo(function TypingIndicator({
  isTyping,
  text = 'Escribiendo...',
  variant = 'text',
  className = '',
}: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {variant === 'dots' && <TypingDots />}
          {variant === 'text' && <TypingText text={text} />}
          {variant === 'bubble' && <TypingBubble text={text} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/**
 * TypingIndicatorInline
 * Versión inline para usar dentro de otros componentes
 */
export const TypingIndicatorInline = memo(function TypingIndicatorInline({
  isTyping,
  className = '',
}: {
  isTyping: boolean;
  className?: string;
}) {
  if (!isTyping) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full opacity-60"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </span>
  );
});

export default TypingIndicator;
