'use client';

/**
 * Button Component - Apple/Revolut Premium Style
 * Ultra-rounded with elastic animations, haptic feedback and subtle depth
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { haptics } from '@/lib/haptic';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  glow?: boolean;
  loading?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  loading = false,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold 
    rounded-full transition-colors duration-150 select-none touch-manipulation
    focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:ring-offset-2
  `;

  const variants = {
    primary: `
      bg-[var(--brand-pink)] text-white
      shadow-[0_8px_24px_rgba(255,102,196,0.32),inset_0_1px_0_rgba(255,255,255,0.35)]
      hover:shadow-[0_10px_28px_rgba(255,102,196,0.45),inset_0_1px_0_rgba(255,255,255,0.45)]
      active:brightness-95
    `,
    destructive: `
      bg-red-500 text-white
      shadow-[0_8px_24px_rgba(239,68,68,0.32),inset_0_1px_0_rgba(255,255,255,0.25)]
      hover:bg-red-600
      hover:shadow-[0_10px_28px_rgba(239,68,68,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]
      active:brightness-95
    `,
    secondary: `
      bg-[var(--background-secondary)] text-[var(--foreground)]
      border border-[var(--border-color)]
      shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.12)]
      hover:bg-[var(--background-tertiary)]
      hover:border-[var(--border-hover)]
    `,
    outline: `
      border-2 border-[var(--brand-pink)]
      text-[var(--brand-pink)]
      hover:bg-[var(--brand-pink)]
      hover:text-white
    `,
    ghost: `
      text-[var(--foreground-secondary)]
      hover:text-[var(--foreground)]
      hover:bg-[var(--background-secondary)]
    `,
    glass: `
      glass text-[var(--foreground)]
      shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]
      hover:backdrop-blur-[60px]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 min-h-[44px] text-sm',
    md: 'px-6 py-2.5 min-h-[44px] text-sm',
    lg: 'px-8 py-3.5 min-h-[48px] text-base',
    xl: 'px-10 py-4 min-h-[52px] text-lg',
  };

  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      try {
        haptics.tap();
      } catch {}
    }
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.08, ease: 'easeOut' }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glow && variant === 'primary' ? 'shadow-[0_4px_24px_rgba(255,45,120,0.35)]' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <LoadingSpinner size={size === 'sm' ? 'xs' : 'sm'} color="currentColor" className="shrink-0" />
      )}
      {children}
    </motion.button>
  );
}
