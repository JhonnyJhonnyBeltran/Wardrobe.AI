'use client';

/**
 * NotificationBadge
 * Badge para mostrar conteo de notificaciones no leídas
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeStore } from '@/store/realtimeStore';

interface NotificationBadgeProps {
  /** Conteo manual (si no se usa el store) */
  count?: number;
  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar solo punto sin número */
  dot?: boolean;
  /** Máximo número a mostrar (ej: 99+) */
  max?: number;
  /** Posición absoluta */
  position?: 'top-right' | 'top-left';
  /** Clase CSS adicional */
  className?: string;
  /** Color del badge */
  color?: 'red' | 'blue' | 'green' | 'yellow';
}

const sizeClasses = {
  sm: 'min-w-[16px] h-4 text-[10px]',
  md: 'min-w-[20px] h-5 text-xs',
  lg: 'min-w-[24px] h-6 text-sm',
};

const dotSizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

const colorClasses = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
};

const positionClasses = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
};

export const NotificationBadge = memo(function NotificationBadge({
  count: propCount,
  size = 'md',
  dot = false,
  max = 99,
  position,
  className = '',
  color = 'red',
}: NotificationBadgeProps) {
  const storeCount = useRealtimeStore(state => state.unreadCount);
  const count = propCount ?? storeCount;

  // Don't render if no notifications
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const baseClasses = `
    ${dot ? dotSizeClasses[size] : sizeClasses[size]}
    ${colorClasses[color]}
    ${position ? `absolute ${positionClasses[position]}` : ''}
    rounded-full
    flex items-center justify-center
    text-white font-medium
    ${className}
  `.trim();

  return (
    <AnimatePresence>
      <motion.span
        key={count}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className={baseClasses}
      >
        {!dot && (
          <span className="px-1">{displayCount}</span>
        )}
      </motion.span>
    </AnimatePresence>
  );
});

/**
 * NotificationBadgeWrapper
 * Wrapper para agregar badge a cualquier elemento
 */
interface NotificationBadgeWrapperProps {
  children: React.ReactNode;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  max?: number;
  color?: 'red' | 'blue' | 'green' | 'yellow';
  className?: string;
}

export const NotificationBadgeWrapper = memo(function NotificationBadgeWrapper({
  children,
  count,
  size = 'sm',
  dot = false,
  max = 99,
  color = 'red',
  className = '',
}: NotificationBadgeWrapperProps) {
  return (
    <div className={`relative inline-flex ${className}`}>
      {children}
      <NotificationBadge
        count={count}
        size={size}
        dot={dot}
        max={max}
        position="top-right"
        color={color}
      />
    </div>
  );
});

export default NotificationBadge;
