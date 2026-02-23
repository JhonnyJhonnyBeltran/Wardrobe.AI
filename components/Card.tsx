'use client';

/**
 * Card Component - Clean Pinterest/iPhone Style
 * No hover effects - just clean and minimal
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

