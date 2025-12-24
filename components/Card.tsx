'use client';

/**
 * Card - iOS-style card with rounded corners and subtle shadow
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? {
        y: -6,
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      } : {}}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-white dark:bg-gray-900 rounded-3xl shadow-md dark:shadow-gray-950/50 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
