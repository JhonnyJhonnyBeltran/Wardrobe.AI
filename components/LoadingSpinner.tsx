'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: string;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  color = 'var(--brand-pink)',
  className = '',
  text
}: LoadingSpinnerProps) {
  const sizeMap = {
    xs: { dim: 'w-3.5 h-3.5', dot: 'w-1 h-1', stroke: 2 },
    sm: { dim: 'w-4 h-4', dot: 'w-1.5 h-1.5', stroke: 2.5 },
    md: { dim: 'w-6 h-6', dot: 'w-2 h-2', stroke: 3 },
    lg: { dim: 'w-10 h-10', dot: 'w-2.5 h-2.5', stroke: 3.5 },
    xl: { dim: 'w-14 h-14', dot: 'w-3.5 h-3.5', stroke: 4 },
  };

  const { dim, dot, stroke } = sizeMap[size] || sizeMap.md;

  if (variant === 'dots') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 0.85,
              repeat: Infinity,
              delay: i * 0.16,
              ease: 'easeInOut',
            }}
            style={{ backgroundColor: color }}
            className={`${dot} rounded-full`}
          />
        ))}
        {text && <span className="ml-2 text-xs font-medium text-[var(--foreground-secondary)]">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ borderColor: color }}
          className={`${dim} rounded-full border-2 border-t-transparent animate-spin-smooth`}
        />
        {text && <span className="ml-2 text-xs font-medium text-[var(--foreground-secondary)]">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        className={`${dim} animate-spin-smooth shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ willChange: 'transform' }}
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth={stroke}
          className="opacity-20"
        />
        <path
          d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 13.8821 3.04838 15.6364 4 17.1126"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      {text && <span className="ml-2 text-xs font-medium text-[var(--foreground-secondary)]">{text}</span>}
    </div>
  );
}
