'use client';

/**
 * Button - iOS-style button with gradient and scale animations
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glow?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all';

  const variants = {
    primary: 'gradient-primary text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:text-pink-600 dark:hover:text-pink-400',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glow && variant === 'primary' ? 'glow-effect' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
