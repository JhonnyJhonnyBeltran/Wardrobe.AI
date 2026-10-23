'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarKlozetLogoProps {
  isActive: boolean;
  className?: string;
}

/**
 * NavbarKlozetLogo
 * Logo reactivo para navbars (ordenador y móvil).
 * 1. Alterna con animación suave entre el monograma 'klzt' y el wordmark 'klozet'.
 * 2. Se pinta en negro (o blanco en dark mode) en reposo, y pasa a rosa de marca (--brand-pink) al estar activo.
 */
export default function NavbarKlozetLogo({ isActive, className = '' }: NavbarKlozetLogoProps) {
  const [logoVariant, setLogoVariant] = useState<'klzt' | 'klozet'>('klzt');

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoVariant((prev) => (prev === 'klzt' ? 'klozet' : 'klzt'));
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative flex items-center justify-center overflow-visible select-none ${className}`}>
      <AnimatePresence mode="wait">
        {logoVariant === 'klzt' ? (
          <motion.div
            key="klzt"
            initial={{ opacity: 0, scale: 0.72, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.72, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 480, damping: 26, mass: 0.6 }}
            className={`
              w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] transition-colors duration-300
              ${isActive ? 'bg-[var(--brand-pink,#FF66C4)] shadow-[0_0_12px_rgba(255,102,196,0.35)]' : 'bg-black dark:bg-white'}
            `}
            style={{
              maskImage: 'url(/klzt-mask.png)',
              WebkitMaskImage: 'url(/klzt-mask.png)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
          />
        ) : (
          <motion.div
            key="klozet"
            initial={{ opacity: 0, scale: 0.72, y: 2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.72, y: -2 }}
            transition={{ type: 'spring', stiffness: 480, damping: 26, mass: 0.6 }}
            className={`
              w-[48px] h-[13px] sm:w-[52px] sm:h-[14px] transition-colors duration-300
              ${isActive ? 'bg-[var(--brand-pink,#FF66C4)] shadow-[0_0_12px_rgba(255,102,196,0.35)]' : 'bg-black dark:bg-white'}
            `}
            style={{
              maskImage: 'url(/klozet-wordmark-mask.png)',
              WebkitMaskImage: 'url(/klozet-wordmark-mask.png)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
