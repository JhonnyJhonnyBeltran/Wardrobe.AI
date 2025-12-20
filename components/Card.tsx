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
      whileHover={hover ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-3xl shadow-md overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
