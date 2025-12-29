'use client';

/**
 * Card Component - Floating Design (Apple/Revolut Style)
 * Ultra-rounded with subtle depth, no harsh borders
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'gradient';
}

export default function Card({
  children,
  className = '',
  hover = false,
  variant = 'default',
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'floating-card',
    glass: 'glass',
    gradient: 'gradient-card',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? {
        y: -4,
        scale: 1.01,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      } : {}}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`
        ${variantClasses[variant]}
        overflow-hidden
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </motion.div>
  );
}

