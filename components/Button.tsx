'use client';

/**
 * Button Component - Apple/Revolut Premium Style
 * Ultra-rounded with elastic animations, haptic feedback and subtle depth
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold 
    rounded-full transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:ring-offset-2
  `;

  const variants = {
    primary: `
      bg-[var(--brand-pink)] text-white
      shadow-[var(--shadow-float)]
      hover:bg-[var(--brand-pink-dark)]
      hover:shadow-[var(--shadow-float-hover)]
      active:shadow-[var(--shadow-float)]
    `,
    destructive: `
      bg-red-500 text-white
      shadow-[var(--shadow-float)]
      hover:bg-red-600
      hover:shadow-[var(--shadow-float-hover)]
      active:shadow-[var(--shadow-float)]
    `,
    secondary: `
      bg-[var(--background-secondary)] text-[var(--foreground)]
      border border-[var(--border-color)]
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
      hover:backdrop-blur-[60px]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  };

  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback on click
    if (!isDisabled) {
      haptics.tap();
    }
    // Call original onClick if provided
    props.onClick?.(e);
  };

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glow && variant === 'primary' ? 'animate-pulse-glow' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
