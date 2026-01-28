'use client';

/**
 * OnlineIndicator
 * Componente visual para mostrar el estado online/offline de un usuario
 */

import { memo } from 'react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

interface OnlineIndicatorProps {
  /** ID del usuario */
  userId: string;
  /** Tamaño del indicador */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar solo cuando está online */
  showOnlyOnline?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Posición del indicador (para avatares) */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const positionClasses = {
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
};

export const OnlineIndicator = memo(function OnlineIndicator({
  userId,
  size = 'md',
  showOnlyOnline = false,
  className = '',
  position,
}: OnlineIndicatorProps) {
  const { isUserOnline } = useOnlineStatus();
  const isOnline = isUserOnline(userId);

  // Don't render if offline and showOnlyOnline is true
  if (!isOnline && showOnlyOnline) {
    return null;
  }

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full
    border-2 border-white dark:border-gray-900
    ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
    ${position ? `absolute ${positionClasses[position]}` : ''}
    ${className}
  `.trim();

  return (
    <span 
      className={baseClasses}
      title={isOnline ? 'En línea' : 'Desconectado'}
      aria-label={isOnline ? 'Usuario en línea' : 'Usuario desconectado'}
    />
  );
});

/**
 * OnlineStatusText
 * Componente de texto para mostrar el estado online/offline
 */
interface OnlineStatusTextProps {
  userId: string;
  onlineText?: string;
  offlineText?: string;
  className?: string;
}

export const OnlineStatusText = memo(function OnlineStatusText({
  userId,
  onlineText = 'En línea',
  offlineText = 'Desconectado',
  className = '',
}: OnlineStatusTextProps) {
  const { isUserOnline } = useOnlineStatus();
  const isOnline = isUserOnline(userId);

  return (
    <span 
      className={`
        text-xs
        ${isOnline ? 'text-green-500' : 'text-gray-400'}
        ${className}
      `.trim()}
    >
      {isOnline ? onlineText : offlineText}
    </span>
  );
});

/**
 * AvatarWithStatus
 * Wrapper para mostrar avatar con indicador de estado
 */
interface AvatarWithStatusProps {
  userId: string;
  children: React.ReactNode;
  indicatorSize?: 'sm' | 'md' | 'lg';
  showOnlyOnline?: boolean;
  className?: string;
}

export const AvatarWithStatus = memo(function AvatarWithStatus({
  userId,
  children,
  indicatorSize = 'md',
  showOnlyOnline = false,
  className = '',
}: AvatarWithStatusProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <OnlineIndicator
        userId={userId}
        size={indicatorSize}
        showOnlyOnline={showOnlyOnline}
        position="bottom-right"
      />
    </div>
  );
});

export default OnlineIndicator;
