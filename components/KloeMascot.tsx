'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { haptics } from '@/lib/haptic';

export type KloeMood = 'idle' | 'happy' | 'thinking' | 'wink' | 'excited' | 'curious';

interface KloeMascotProps {
  mood?: KloeMood;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onTap?: () => void;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-7',
  sm: 'w-8 h-9',
  md: 'w-11 h-12',
  lg: 'w-14 h-16',
  xl: 'w-20 h-24',
} as const;

/**
 * KloeMascot - Living character wrapper around the official /k-bubble-pink.png artwork.
 * Gives Kloe Duolingo-style organic presence (breathing, thinking tilt, happy jump,
 * tap squish) while keeping the official PNG brand mark untouched.
 */
export default function KloeMascot({
  mood = 'idle',
  size = 'md',
  interactive = false,
  onTap,
  className = '',
}: KloeMascotProps) {
  const prefersReducedMotion = useReducedMotion();
  const [tapKey, setTapKey] = useState(0);

  const handleTap = () => {
    if (!interactive && !onTap) return;
    try {
      haptics.tap();
    } catch {}
    setTapKey((prev) => prev + 1);
    onTap?.();
  };

  const getMoodAnimate = () => {
    if (prefersReducedMotion) return {};

    switch (mood) {
      case 'thinking':
        return {
          rotate: [-4, 5, -4],
          y: [0, -3, 0],
          scaleX: [1, 0.97, 1.03, 1],
          scaleY: [1, 1.03, 0.97, 1],
        };
      case 'excited':
        return {
          y: [0, -7, 0, -4, 0],
          rotate: [0, -7, 7, -3, 0],
          scale: [1, 1.08, 0.96, 1.04, 1],
        };
      case 'happy':
        return {
          y: [0, -3, 0],
          rotate: [-2, 3, -2],
          scaleY: [1, 1.04, 0.98, 1],
        };
      case 'wink':
        return {
          rotate: [0, 8, -3, 0],
          scale: [1, 1.1, 1],
        };
      case 'curious':
        return {
          rotate: [0, -8, -6, 0],
          y: [0, -2, 0],
        };
      case 'idle':
      default:
        return {
          y: [0, -2.5, 0],
          scaleY: [1, 1.025, 1],
          scaleX: [1, 0.985, 1],
        };
    }
  };

  const getMoodTransition = () => {
    switch (mood) {
      case 'thinking':
        return { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const };
      case 'excited':
        return { duration: 1.8, repeat: Infinity, repeatDelay: 0.9, ease: 'easeInOut' as const };
      case 'happy':
        return { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const };
      case 'wink':
        return { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] as const };
      case 'curious':
        return { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const };
      case 'idle':
      default:
        return { duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const };
    }
  };

  return (
    <motion.div
      key={tapKey}
      onClick={handleTap}
      whileHover={interactive ? { scale: 1.1, rotate: -4 } : undefined}
      whileTap={interactive ? { scale: 0.88, rotate: 6 } : undefined}
      initial={tapKey > 0 ? { scale: 0.85, rotate: -10 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 460, damping: 18 }}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${SIZE_MAP[size]} ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <motion.div
        animate={getMoodAnimate()}
        transition={getMoodTransition()}
        className="relative w-full h-full flex items-center justify-center"
      >
        <Image
          src="/k-bubble-pink.png"
          alt="Kloe"
          fill
          sizes="80px"
          className="object-contain drop-shadow-[0_4px_10px_rgba(255,102,196,0.28)]"
          priority={size === 'md' || size === 'lg'}
        />
      </motion.div>

      {/* Subtle living thinking dots when Kloe is thinking */}
      {mood === 'thinking' && !prefersReducedMotion && (
        <div className="absolute -top-1.5 -right-2 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-[var(--brand-pink)]/30 shadow-xs">
          {[0, 1, 2].map((idx) => (
            <motion.span
              key={idx}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -1.5, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: idx * 0.18 }}
              className="w-1 h-1 rounded-full bg-[var(--brand-pink)]"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
