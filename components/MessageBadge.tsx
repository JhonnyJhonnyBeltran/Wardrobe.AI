/**
 * MessageBadge Component
 * Componente modular para mostrar notificaciones de mensajes estilo Instagram
 * 
 * Características:
 * - Desktop: Muestra número de mensajes no leídos
 * - Mobile: Muestra solo punto rojo
 * - Animaciones suaves de entrada/salida
 * - Soporte para diferentes tamaños y posiciones
 */

'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessageStore, selectTotalUnread, selectBadgeVisible } from '@/store/messageStore';

// ============================================
// TYPES
// ============================================

interface MessageBadgeProps {
  /** Variant: 'count' shows number, 'dot' shows only red dot */
  variant?: 'count' | 'dot' | 'auto';
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Maximum count to display (e.g., 9 shows 9+) */
  max?: number;
  /** Position when used with absolute positioning */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Additional CSS classes */
  className?: string;
  /** Override the count from store */
  count?: number;
  /** Whether to show even when count is 0 */
  showZero?: boolean;
  /** Color variant */
  color?: 'red' | 'pink' | 'blue';
}

// ============================================
// STYLE CONSTANTS
// ============================================

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    badge: 'min-w-[14px] h-[14px] text-[9px] px-[3px]',
  },
  md: {
    dot: 'w-2.5 h-2.5',
    badge: 'min-w-[16px] h-[16px] text-[10px] px-[4px]',
  },
  lg: {
    dot: 'w-3 h-3',
    badge: 'min-w-[20px] h-[20px] text-[11px] px-[5px]',
  },
};

const positionConfig = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
};

const colorConfig = {
  red: 'bg-[#FF3040]',
  pink: 'bg-[var(--brand-pink)]',
  blue: 'bg-blue-500',
};

// ============================================
// ANIMATIONS
// ============================================

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring' as const, 
      stiffness: 500, 
      damping: 25 
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
};

// ============================================
// COMPONENT
// ============================================

export const MessageBadge = memo(function MessageBadge({
  variant = 'auto',
  size = 'md',
  max = 9,
  position,
  className = '',
  count: propCount,
  showZero = false,
  color = 'red',
}: MessageBadgeProps) {
  // Get count from store or props
  const storeCount = useMessageStore(selectTotalUnread);
  const badgeVisible = useMessageStore(selectBadgeVisible);
  const count = propCount ?? storeCount;

  // Don't render if no notifications and not showing zero
  if (count === 0 && !showZero) return null;

  // Don't render if badge is hidden (user entered messages page)
  if (!badgeVisible && propCount === undefined) return null;

  // Determine if showing dot or count
  const showDot = variant === 'dot' || (variant === 'auto' && typeof window !== 'undefined' && window.innerWidth < 768);
  
  // Format display count
  const displayCount = count > max ? `${max}+` : count.toString();

  // Build class names
  const positionClass = position ? `absolute ${positionConfig[position]}` : '';
  const colorClass = colorConfig[color];
  const sizeClass = showDot ? sizeConfig[size].dot : sizeConfig[size].badge;

  const baseClasses = `
    ${sizeClass}
    ${colorClass}
    ${positionClass}
    rounded-full
    flex items-center justify-center
    text-white font-bold
    border border-[var(--background)]
    z-20
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <AnimatePresence mode="wait">
      {count > 0 && (
        <motion.span
          key={`badge-${count}`}
          variants={badgeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={baseClasses}
        >
          <motion.span
            variants={pulseVariants}
            animate="animate"
            key={count}
          >
            {!showDot && displayCount}
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  );
});

// ============================================
// DOT VARIANT (Convenience Component)
// ============================================

export const MessageDot = memo(function MessageDot({
  size = 'md',
  position = 'top-right',
  className = '',
  color = 'red',
}: Omit<MessageBadgeProps, 'variant' | 'max' | 'showZero'>) {
  return (
    <MessageBadge
      variant="dot"
      size={size}
      position={position}
      className={className}
      color={color}
    />
  );
});

// ============================================
// WRAPPER COMPONENT
// ============================================

interface MessageBadgeWrapperProps extends MessageBadgeProps {
  children: React.ReactNode;
}

export const MessageBadgeWrapper = memo(function MessageBadgeWrapper({
  children,
  ...badgeProps
}: MessageBadgeWrapperProps) {
  return (
    <div className="relative inline-flex">
      {children}
      <MessageBadge {...badgeProps} position="top-right" />
    </div>
  );
});

// ============================================
// EXPORTS
// ============================================

export default MessageBadge;
