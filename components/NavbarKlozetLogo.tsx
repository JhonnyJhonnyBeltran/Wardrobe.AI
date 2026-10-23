'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarKlozetLogoProps {
  isActive: boolean;
  className?: string;
}

/**
 * NavbarKlozetLogo
 * Logo reactivo para navbars (ordenador y móvil).
 * 1. Alterna cada 15 segundos entre el logo de 'klzt' y el wordmark de 'klozet'.
 * 2. Efecto de animación "shrink to center": se encoge hacia el centro al salir y emerge desde el centro al entrar.
 * 3. En reposo se muestra en negro (o blanco en dark mode).
 * 4. Al estar activo se tiñe de rosa de marca (--brand-pink / #FF66C4).
 */
export default function NavbarKlozetLogo({ isActive, className = '' }: NavbarKlozetLogoProps) {
  const [logoVariant, setLogoVariant] = useState<'klzt' | 'klozet'>('klzt');

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoVariant((prev) => (prev === 'klzt' ? 'klozet' : 'klzt'));
    }, 15000); // Cambia cada 15 segundos exactos
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none overflow-visible ${className}`}>
      <AnimatePresence mode="wait">
        {logoVariant === 'klzt' ? (
          <motion.div
            key="klzt"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26, mass: 0.6 }}
            className="relative flex items-center justify-center w-[24px] h-[26px] sm:w-[26px] sm:h-[28px]"
          >
            {isActive ? (
              <Image
                src="/klzt-pink.png"
                alt="KLZT"
                width={26}
                height={28}
                priority
                className="object-contain w-full h-full drop-shadow-[0_2px_8px_rgba(255,102,196,0.5)] transition-transform duration-200 scale-105"
              />
            ) : (
              <>
                <Image
                  src="/klzt-black.png"
                  alt="KLZT"
                  width={26}
                  height={28}
                  priority
                  className="object-contain w-full h-full dark:hidden opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
                <Image
                  src="/klzt-white.png"
                  alt="KLZT"
                  width={26}
                  height={28}
                  priority
                  className="object-contain w-full h-full hidden dark:block opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="klozet"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26, mass: 0.6 }}
            className="relative flex items-center justify-center w-[44px] h-[20px] sm:w-[48px] sm:h-[22px]"
          >
            {isActive ? (
              <Image
                src="/klozet-bubble-pink.png"
                alt="Klozet"
                width={48}
                height={22}
                priority
                className="object-contain w-full h-full drop-shadow-[0_2px_8px_rgba(255,102,196,0.5)] transition-transform duration-200 scale-105"
              />
            ) : (
              <>
                <Image
                  src="/klozet-bubble-black.png"
                  alt="Klozet"
                  width={48}
                  height={22}
                  priority
                  className="object-contain w-full h-full dark:hidden opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
                <Image
                  src="/klozet-bubble-white.png"
                  alt="Klozet"
                  width={48}
                  height={22}
                  priority
                  className="object-contain w-full h-full hidden dark:block opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
