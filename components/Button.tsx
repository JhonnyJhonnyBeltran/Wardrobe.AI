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
    primary: 'gradient-primary text-white',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
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
