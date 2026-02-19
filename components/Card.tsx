'use client';

/**
 * Card Component - Apple Style Design
 * Removed zoom and inner shadow
 * Implemented full card expansion on hover with subtle border
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
    default: 'card-apple',
    glass: 'glass',
    gradient: 'gradient-card',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? {
        scale: 1.02,
        boxShadow: '0 8px 32px -2px rgba(0, 0, 0, 0.08)',
        borderColor: 'rgba(255, 105, 180, 0.2)',
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

