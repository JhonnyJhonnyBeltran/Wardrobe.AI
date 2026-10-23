'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface NavbarKlozetLogoProps {
  isActive: boolean;
  className?: string;
}

type LogoVariant = 'klzt' | 'k' | 'klozet';

/**
 * NavbarKlozetLogo
 * Logo reactivo para navbars (ordenador y móvil).
 * 1. Secuencia cíclica: klzt -> k -> klozet -> klzt -> ... cada 15 segundos.
 * 2. Set de 2 animaciones diferenciadas:
 *    - Salida: "shrink to center" (se encoge acelerando al punto central scale: 0).
 *    - Entrada: "al contrario" (emerge desde el primer plano con zoom-in elástico scale: 1.4 -> 1.0 con enfoque y rebote Apple spring).
 * 3. En reposo se muestra en negro (o blanco en dark mode).
 * 4. Al estar activo se tiñe de rosa de marca (--brand-pink / #FF66C4).
 */
export default function NavbarKlozetLogo({ isActive, className = '' }: NavbarKlozetLogoProps) {
  const [logoIndex, setLogoIndex] = useState<number>(0);
  const sequence: LogoVariant[] = ['klzt', 'k', 'klozet'];
  const currentVariant = sequence[logoIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % sequence.length);
    }, 15000); // 15 segundos exactos
    return () => clearInterval(timer);
  }, [sequence.length]);

  // Set de 2 animaciones: Entrada (Zoom in desde fuera con rebote) + Salida (Shrink to center)
  const variants: Variants = {
    initial: {
      scale: 1.45,
      opacity: 0,
      filter: 'blur(3px)',
    },
    animate: {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 440,
        damping: 24,
        mass: 0.65,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      filter: 'blur(2px)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.7, -0.4], // Aceleración centrípeta hacia el centro
      },
    },
  };

  return (
    <div className={`relative flex items-center justify-center select-none overflow-visible ${className}`}>
      <AnimatePresence mode="wait">
        {currentVariant === 'klzt' && (
          <motion.div
            key="klzt"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
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
        )}

        {currentVariant === 'k' && (
          <motion.div
            key="k"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative flex items-center justify-center w-[22px] h-[26px] sm:w-[24px] sm:h-[28px]"
          >
            {isActive ? (
              <Image
                src="/k-bubble-pink.png"
                alt="Klozet Mascot"
                width={24}
                height={28}
                priority
                className="object-contain w-full h-full drop-shadow-[0_2px_8px_rgba(255,102,196,0.5)] transition-transform duration-200 scale-105"
              />
            ) : (
              <>
                <Image
                  src="/k-bubble-black.png"
                  alt="Klozet Mascot"
                  width={24}
                  height={28}
                  priority
                  className="object-contain w-full h-full dark:hidden opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
                <Image
                  src="/k-bubble-white.png"
                  alt="Klozet Mascot"
                  width={24}
                  height={28}
                  priority
                  className="object-contain w-full h-full hidden dark:block opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
              </>
            )}
          </motion.div>
        )}

        {currentVariant === 'klozet' && (
          <motion.div
            key="klozet"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative flex items-center justify-center w-[46px] h-[20px] sm:w-[50px] sm:h-[22px]"
          >
            {isActive ? (
              <Image
                src="/klozet-bubble-pink.png"
                alt="Klozet"
                width={50}
                height={22}
                priority
                className="object-contain w-full h-full drop-shadow-[0_2px_8px_rgba(255,102,196,0.5)] transition-transform duration-200 scale-105"
              />
            ) : (
              <>
                <Image
                  src="/klozet-bubble-black.png"
                  alt="Klozet"
                  width={50}
                  height={22}
                  priority
                  className="object-contain w-full h-full dark:hidden opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
                <Image
                  src="/klozet-bubble-white.png"
                  alt="Klozet"
                  width={50}
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
