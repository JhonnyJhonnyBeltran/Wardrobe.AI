'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Image from 'next/image';

// Shared session sequence so Kloe peeks out consistently every ~3rd like burst (and randomly)
let globalBurstCounter = 0;

export interface LikeBurstState {
  key: number;
  withKloe: boolean;
}

export function useLikeBurst() {
  const [burst, setBurst] = useState<LikeBurstState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBurst = useCallback(() => {
    globalBurstCounter += 1;
    // Appear on 2nd burst and then every 3rd burst (or 25% surprise) so users notice the Easter egg
    const withKloe = globalBurstCounter % 3 === 2 || Math.random() < 0.25;
    const key = Date.now() + globalBurstCounter;

    setBurst({ key, withKloe });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBurst(null);
    }, 950);
  }, []);

  return { burst, triggerBurst };
}

interface LikeBurstOverlayProps {
  burst: LikeBurstState | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HEART_SIZES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
} as const;

const KLOE_SIZES = {
  sm: 'w-7 h-8',
  md: 'w-10 h-12',
  lg: 'w-14 h-16',
} as const;

/**
 * LikeBurstOverlay
 * Renders an Instagram/Pinterest-inspired floating heart burst in the center of a photo,
 * occasionally revealing Kloe's pink bubble "K" peeking playfully inside the heart.
 */
export default function LikeBurstOverlay({
  burst,
  size = 'lg',
  className = '',
}: LikeBurstOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {burst && (
        <motion.div
          key={burst.key}
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.25, opacity: 0, rotate: -14 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : {
                  scale: [0.25, 1.24, 0.94, 1.04, 1],
                  opacity: [0, 1, 1, 1, 0],
                  rotate: [burst.withKloe ? -12 : -8, 6, -2, 0, 0],
                  y: [6, -4, -2, -6, -18],
                }
          }
          exit={{ scale: 0.75, opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.25 : 0.88,
            times: prefersReducedMotion ? undefined : [0, 0.24, 0.42, 0.62, 1],
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none select-none ${className}`}
        >
          <div className="relative flex items-center justify-center">
            {/* Ambient soft radial pink flash */}
            {!prefersReducedMotion && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 1.75, opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className={`absolute rounded-full bg-[var(--brand-pink,#FF66C4)]/30 ${HEART_SIZES[size]}`}
              />
            )}

            {/* Main Glossy Heart */}
            <Heart
              className={`${HEART_SIZES[size]} ${
                burst.withKloe
                  ? 'fill-white text-[var(--brand-pink,#FF66C4)] drop-shadow-[0_10px_28px_rgba(255,102,196,0.5)]'
                  : 'fill-[var(--brand-pink,#FF66C4)] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.42)]'
              }`}
              strokeWidth={burst.withKloe ? 1.8 : 1.5}
            />

            {/* Kloe Bubble Mascot peeking inside center of the heart */}
            {burst.withKloe && (
              <motion.div
                initial={{ scale: 0.2, rotate: -16 }}
                animate={{ scale: [0.2, 1.18, 0.95, 1], rotate: [-16, 10, -4, 0] }}
                transition={{ duration: 0.42, delay: 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                className={`absolute ${KLOE_SIZES[size]} -mt-0.5 flex items-center justify-center`}
              >
                <Image
                  src="/k-bubble-pink.png"
                  alt="Kloe Like"
                  fill
                  sizes="72px"
                  className="object-contain drop-shadow-[0_2px_6px_rgba(237,76,158,0.35)]"
                />
              </motion.div>
            )}

            {/* Tiny radiating micro-hearts on special Kloe pop */}
            {burst.withKloe && !prefersReducedMotion && (
              <>
                {[
                  { x: -34, y: -30, delay: 0.08, s: 0.7 },
                  { x: 36, y: -26, delay: 0.12, s: 0.65 },
                  { x: -28, y: 28, delay: 0.14, s: 0.55 },
                  { x: 32, y: 26, delay: 0.1, s: 0.6 },
                ].map((dot, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ x: dot.x, y: dot.y, scale: [0, dot.s, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, delay: dot.delay, ease: 'easeOut' }}
                    className="absolute"
                  >
                    <Heart className="w-4 h-4 fill-[var(--brand-pink,#FF66C4)] text-[var(--brand-pink,#FF66C4)]" />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
