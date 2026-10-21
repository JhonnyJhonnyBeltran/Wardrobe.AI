'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  FileText, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { useUser } from '@/store';
import { triggerHaptic } from '@/lib/haptic';

export default function LandingPage() {
  const { user } = useUser();
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = 5;
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Frame switcher with debounce
  const goToFrame = (index: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentFrame(Math.max(0, Math.min(totalFrames - 1, index)));
    try {
      triggerHaptic('light');
    } catch {}
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 600);
  };

  const nextFrame = () => goToFrame(currentFrame + 1);
  const prevFrame = () => goToFrame(currentFrame - 1);

  // Wheel listener
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 25) return;
    if (e.deltaY > 0) {
      if (currentFrame < totalFrames - 1) nextFrame();
    } else {
      if (currentFrame > 0) prevFrame();
    }
  };

  // Touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 35) {
      if (deltaY > 0) {
        if (currentFrame < totalFrames - 1) nextFrame();
      } else {
        if (currentFrame > 0) prevFrame();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextFrame();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevFrame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFrame]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.04,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemFloatIn = (xOffset = 0, yOffset = 0, rotation = 0) => ({
    hidden: { opacity: 0, x: xOffset, y: yOffset + 18, rotate: rotation - 8, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: rotation,
      scale: 1,
      transition: { 
        type: 'spring' as const, 
        stiffness: 280, 
        damping: 22, 
        mass: 0.85 
      },
    },
  });

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-[100dvh] min-h-[100dvh] w-screen overflow-hidden bg-white dark:bg-[#0a0a0c] text-zinc-900 dark:text-zinc-50 selection:bg-[var(--brand-pink,#FF66C4)] selection:text-white flex flex-col justify-between fixed inset-0 select-none antialiased"
    >
      {/* 1. TOP BAR WITH LOGO AND AUTH BUTTONS */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between pointer-events-none">
        {/* Left: Brand Logo (Se oculta en el último frame junto a los botones) */}
        <div className={`pointer-events-auto flex items-center gap-2 transition-opacity duration-300 ${currentFrame === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Link href="/" className="inline-block transition-transform active:scale-95">
            <Image 
              src="/landing/klozet-nombre-grande.png" 
              alt="Klozet" 
              width={120} 
              height={38} 
              className="h-6 sm:h-8 w-auto object-contain" 
              priority
            />
          </Link>
        </div>

        {/* Right: Auth Buttons (Hidden gracefully on the final frame where big CTAs live) */}
        <div className={`pointer-events-auto flex items-center gap-1.5 sm:gap-3 transition-opacity duration-300 ${currentFrame === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {user ? (
            <Link 
              href="/closet" 
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[var(--brand-pink,#FF66C4)] text-white hover:opacity-95 transition-all shadow-sm active:scale-95 flex items-center gap-1 sm:gap-1.5"
            >
              <span>Mi Armario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link 
                href="/auth" 
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-md border border-black/[0.04] dark:border-white/[0.06] transition-all active:scale-95"
              >
                Entrar
              </Link>
              <Link 
                href="/auth" 
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[var(--brand-pink,#FF66C4)] text-white hover:opacity-95 transition-all shadow-sm active:scale-95 flex items-center gap-1"
              >
                <span>Registro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. ATMOSPHERIC BACKDROP LIGHTING */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[820px] h-[340px] sm:h-[820px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 -z-10 ${
          currentFrame === 0 ? 'bg-gradient-to-tr from-[var(--brand-pink,#FF66C4)]/15 via-rose-200/10 dark:via-rose-950/20 to-transparent' :
          currentFrame === 1 ? 'bg-gradient-to-tr from-purple-500/12 via-[var(--brand-pink,#FF66C4)]/10 to-transparent' :
          currentFrame === 2 ? 'bg-gradient-to-tr from-[var(--brand-pink,#FF66C4)]/20 via-pink-400/15 to-transparent' :
          currentFrame === 3 ? 'bg-gradient-to-tr from-indigo-500/12 via-purple-500/10 to-transparent' :
          'bg-gradient-to-tr from-[var(--brand-pink,#FF66C4)]/15 via-purple-400/10 to-transparent'
        }`}
      />

      {/* 3. SUBTLE WATERMARK BACKGROUND */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[450px] sm:max-w-[900px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10 transition-transform duration-700">
        <Image 
          src="/landing/klozet-nombre-grande.png" 
          alt="Klozet" 
          width={1000} 
          height={320} 
          className="w-full h-auto object-contain"
          priority 
        />
      </div>

      {/* 4. MAIN FLUID STAGE */}
      <main className="w-full h-full relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* FRAME 0: ARMARIO LLENO - NADA QUE PONERTE */}
          {/* ======================================================== */}
          {currentFrame === 0 && (
            <motion.div
              key="frame-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col items-center text-center px-4 sm:px-8 z-10 pt-16 sm:pt-20 pb-12 sm:pb-8 max-w-4xl mx-auto"
            >
              <div className="my-auto w-full flex flex-col items-center gap-3 sm:gap-5 py-2">
                {/* Monumental Editorial Headline (Estilo fc899bc: Drop-cap Italic Serif + Bold Display) */}
                <motion.div variants={itemFadeUp} className="flex flex-col items-center">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] text-zinc-950 dark:text-white">
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">A</span>rmario Lleno
                  </h1>
                  <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] bg-gradient-to-r from-[var(--brand-pink,#FF66C4)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-0.5 sm:mt-1">
                    <span className="text-[1.2em] italic font-serif text-pink-400 mr-0.5">N</span>ada que ponerte
                  </h2>
                </motion.div>

                {/* Narrative Text */}
                <motion.p 
                  variants={itemFadeUp}
                  className="text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xs sm:max-w-md font-normal leading-relaxed"
                >
                  Todas las mañanas el mismo lío frente al espejo. Klozet organiza tus prendas reales en un lookbook interactivo para que salgas con el fit clavado.
                </motion.p>

                {/* Central Floating Fashion Cluster with Organic Spring Motion */}
                <motion.div 
                  variants={itemFadeUp}
                  className="w-full max-w-[280px] sm:max-w-[420px] md:max-w-[480px] h-[170px] sm:h-[230px] md:h-[260px] relative flex items-center justify-center my-1 sm:my-2"
                >
                  {/* Left: Camisa Zara Cutout */}
                  <motion.div 
                    variants={itemFloatIn(-35, 10, -8)}
                    animate={{ y: [0, 8, 0], rotate: [-8, -6, -8] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.08, rotate: -3 }}
                    className="absolute left-1 sm:left-4 md:left-6 top-1 sm:top-3 w-18 sm:w-28 md:w-36 drop-shadow-md z-10 cursor-pointer"
                  >
                    <Image 
                      src="/landing/camisa-zara-cutout.png" 
                      alt="Camisa Zara" 
                      width={180} 
                      height={220} 
                      className="w-full h-auto object-contain -rotate-8" 
                      priority 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[8px] sm:text-[9px] font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shadow-xs">
                      Camisa Lino
                    </div>
                  </motion.div>

                  {/* Center Hero: Sudadera Scuffers Cutout */}
                  <motion.div 
                    variants={itemFloatIn(0, -6, 2)}
                    animate={{ y: [0, -10, 0], rotate: [2, 0, 2] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.07, rotate: 0 }}
                    className="relative z-20 w-32 sm:w-46 md:w-56 drop-shadow-[0_16px_32px_rgba(255,102,196,0.3)] cursor-pointer"
                  >
                    <Image 
                      src="/landing/sudadera-scuffers-cutout.png" 
                      alt="Sudadera Scuffers" 
                      width={320} 
                      height={320} 
                      className="w-full h-auto object-contain rotate-2 transition-transform duration-500" 
                      priority 
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[8px] sm:text-[10px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink,#FF66C4)]" />
                      <span>Scuffers Hoodie</span>
                    </div>
                  </motion.div>

                  {/* Right: Jeans Stars Cutout */}
                  <motion.div 
                    variants={itemFloatIn(35, 10, 8)}
                    animate={{ y: [0, 7, 0], rotate: [8, 10, 8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    className="absolute right-1 sm:right-4 md:right-6 top-1 sm:top-3 w-16 sm:w-26 md:w-34 drop-shadow-md z-10 cursor-pointer"
                  >
                    <Image 
                      src="/landing/jeans-stars.png" 
                      alt="Jeans Stars" 
                      width={180} 
                      height={260} 
                      className="w-full h-auto object-contain rotate-8" 
                      priority 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[8px] sm:text-[9px] font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shadow-xs">
                      Denim Wide
                    </div>
                  </motion.div>

                  {/* Bottom: Onitsuka Tiger */}
                  <motion.div 
                    variants={itemFloatIn(10, 25, -6)}
                    animate={{ y: [0, -6, 0], rotate: [-6, -4, -6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-2 right-2 sm:right-10 md:right-14 w-20 sm:w-32 md:w-44 pointer-events-none drop-shadow-lg z-30"
                  >
                    <Image 
                      src="/landing/onitsuka-tiger.png" 
                      alt="Tiger Sneakers" 
                      width={240} 
                      height={150} 
                      className="w-full h-auto object-contain -rotate-6" 
                      priority 
                    />
                  </motion.div>
                </motion.div>

                {/* Primary CTA Button with Spring Hover */}
                <motion.div variants={itemFadeUp} className="z-30 mt-1">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={user ? "/closet" : "/auth"}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm bg-[var(--brand-pink,#FF66C4)] text-white hover:opacity-95 transition-all shadow-md shadow-[var(--brand-pink,#FF66C4)]/20 inline-flex items-center gap-2 group"
                    >
                      <span>{user ? "Ir a mi armario" : "Empezar gratis"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FRAME 1: DIGITALIZACIÓN & RECORTE AL TOQUE */}
          {/* ======================================================== */}
          {currentFrame === 1 && (
            <motion.div
              key="frame-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 z-10 pt-16 sm:pt-20 md:pt-0 pb-12 sm:pb-8 md:pb-0 max-w-6xl mx-auto"
            >
              <div className="w-full my-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 md:gap-12">
                {/* Left Column: Monumental Headline (Estilo fc899bc: Drop-cap Italic Serif) */}
                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20">
                  <motion.h2 
                    variants={itemFadeUp}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-950 dark:text-white"
                  >
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">T</span>oda tu ropa
                  </motion.h2>
                  <motion.h3 
                    variants={itemFadeUp}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-[var(--brand-pink,#FF66C4)] mt-0.5 sm:mt-1.5"
                  >
                    <span className="text-[1.2em] italic font-serif text-purple-400 mr-0.5">E</span>n un toque
                  </motion.h3>
                  <motion.p 
                    variants={itemFadeUp}
                    className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs sm:max-w-md mx-auto md:mx-0 font-normal"
                  >
                    Saca una foto en la percha o en la puerta de tu cuarto. El fondo desaparece al instante y tu ropa real queda limpia, ordenada y lista para combinar.
                  </motion.p>
                </div>

                {/* Right Column: Laser Scan Showcase with Spring Animation */}
                <div className="w-full md:w-1/2 h-[190px] sm:h-[260px] md:h-[400px] relative flex items-center justify-center z-10 max-w-[280px] sm:max-w-[380px] md:max-w-none">
                  
                  {/* Left: Botas Cowboy */}
                  <motion.div 
                    variants={itemFloatIn(-35, -8, -10)}
                    animate={{ y: [0, -7, 0], rotate: [-10, -8, -10] }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.08, rotate: -6 }}
                    className="absolute left-1 sm:left-4 md:left-6 top-1 sm:top-3 md:top-8 w-16 sm:w-26 md:w-36 drop-shadow-md z-10 cursor-pointer"
                  >
                    <Image 
                      src="/landing/botas-cowboy.png" 
                      alt="Botas Cowboy" 
                      width={160} 
                      height={220} 
                      className="w-full h-auto object-contain -rotate-10" 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[8px] sm:text-[9px] font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shadow-xs">
                      Cowboy Boots
                    </div>
                  </motion.div>

                  {/* Center Hero: Sudadera Scuffers with Laser Scanner */}
                  <motion.div 
                    variants={itemFloatIn(0, -6, 2)}
                    animate={{ y: [0, 8, 0], rotate: [2, 0, 2] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-20 w-32 sm:w-46 md:w-60 drop-shadow-[0_16px_32px_rgba(255,102,196,0.3)]"
                  >
                    <div className="relative overflow-hidden rounded-2xl p-1">
                      <Image 
                        src="/landing/sudadera-scuffers-cutout.png" 
                        alt="Sudadera Scuffers" 
                        width={320} 
                        height={320} 
                        className="w-full h-auto object-contain rotate-2" 
                      />

                      {/* Smooth Glowing Laser Sweep Line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--brand-pink,#FF66C4)] to-transparent shadow-[0_0_14px_var(--brand-pink,#FF66C4)] pointer-events-none"
                      />
                    </div>
                  </motion.div>

                  {/* Right: Jeans Stars */}
                  <motion.div 
                    variants={itemFloatIn(35, -8, 10)}
                    animate={{ y: [0, -6, 0], rotate: [10, 8, 10] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.08, rotate: 6 }}
                    className="absolute right-1 sm:right-4 md:right-auto md:left-12 top-1 sm:top-3 md:top-auto md:bottom-6 w-16 sm:w-26 md:w-34 drop-shadow-md z-10 cursor-pointer"
                  >
                    <Image 
                      src="/landing/jeans-stars.png" 
                      alt="Jeans Stars" 
                      width={160} 
                      height={240} 
                      className="w-full h-auto object-contain rotate-10 md:rotate-6" 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[8px] sm:text-[9px] font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shadow-xs">
                      Denim Flare
                    </div>
                  </motion.div>

                  {/* Piece 4: Onitsuka Sneaker */}
                  <motion.div 
                    variants={itemFloatIn(15, 20, 8)}
                    animate={{ y: [0, 5, 0], rotate: [8, 6, 8] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-1 right-2 sm:right-5 md:bottom-3 md:right-5 w-20 sm:w-32 md:w-48 pointer-events-none drop-shadow-lg z-20"
                  >
                    <Image 
                      src="/landing/onitsuka-tiger.png" 
                      alt="Onitsuka Tiger" 
                      width={260} 
                      height={150} 
                      className="w-full h-auto object-contain rotate-8" 
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FRAME 2: KLOE TE AYUDA (ESTILISMO INTELIGENTE) */}
          {/* ======================================================== */}
          {currentFrame === 2 && (
            <motion.div
              key="frame-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 z-10 pt-16 sm:pt-20 md:pt-0 pb-12 sm:pb-8 md:pb-0 max-w-6xl mx-auto"
            >
              <div className="w-full my-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 md:gap-12">
                {/* Left Column: Monumental Headline (Estilo fc899bc: Drop-cap Italic Serif) */}
                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20">
                  <motion.h2 
                    variants={itemFadeUp}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-950 dark:text-white"
                  >
                    <span className="text-[1.2em] italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mr-0.5">Q</span>ué me pongo
                  </motion.h2>
                  <motion.h3 
                    variants={itemFadeUp}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] bg-gradient-to-r from-[var(--brand-pink,#FF66C4)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-0.5 sm:mt-1.5"
                  >
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">K</span>loe te ayuda
                  </motion.h3>
                  <motion.p 
                    variants={itemFadeUp}
                    className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs sm:max-w-md mx-auto md:mx-0 font-normal"
                  >
                    Dile qué plan tienes o qué tiempo hace. Kloe revisa tus prendas reales y te compone el outfit perfecto al segundo, sin gastar un euro en ropa nueva.
                  </motion.p>
                </div>

                {/* Right Column: Kloe Mascot & Interactive Apple Speech Bubbles */}
                <div className="w-full md:w-1/2 h-[200px] sm:h-[280px] md:h-[420px] relative flex items-center justify-center z-10 max-w-[280px] sm:max-w-[380px] md:max-w-none">
                  
                  {/* Floating Pulsing Aura */}
                  <div className="absolute w-[180px] sm:w-[260px] md:w-[360px] h-[180px] sm:h-[260px] md:h-[360px] rounded-full bg-gradient-to-tr from-[var(--brand-pink,#FF66C4)]/25 via-pink-300/15 to-transparent blur-2xl animate-pulse pointer-events-none" />

                  {/* Kloe Mascot with Spring Float */}
                  <motion.div 
                    variants={itemFloatIn(0, 0, 0)}
                    animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 w-[120px] sm:w-[180px] md:w-[280px] flex items-center justify-center p-1 drop-shadow-[0_16px_36px_rgba(255,102,196,0.35)]"
                  >
                    <Image 
                      src="/landing/kloe-grande-landing.png" 
                      alt="Kloe Estilista" 
                      width={440} 
                      height={440} 
                      className="w-full h-auto object-contain"
                      priority 
                    />
                  </motion.div>

                  {/* Speech Bubble 1: User Request */}
                  <motion.div 
                    variants={itemFloatIn(-30, -30, -4)}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-1 sm:top-4 left-0 sm:left-4 z-20 px-3.5 py-2 rounded-2xl rounded-bl-xs bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-md max-w-[170px] sm:max-w-[210px]"
                  >
                    <p className="text-[10px] sm:text-xs text-zinc-700 dark:text-zinc-200 font-medium">
                      &ldquo;¿Qué me pongo hoy para salir de chill?&rdquo;
                    </p>
                  </motion.div>

                  {/* Speech Bubble 2: Kloe Suggestion */}
                  <motion.div 
                    variants={itemFloatIn(30, 30, 4)}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -bottom-2 sm:bottom-4 right-0 sm:right-4 z-20 px-3.5 py-2 rounded-2xl rounded-tr-xs bg-[var(--brand-pink,#FF66C4)] text-white shadow-md max-w-[180px] sm:max-w-[220px]"
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Kloe</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/95 font-medium leading-snug">
                      Sudadera Scuffers + Denim Wide + Tiger sneakers. Cómodo y clavado.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FRAME 3: MONTA TU FIT (LIENZO LIBRE) */}
          {/* ======================================================== */}
          {currentFrame === 3 && (
            <motion.div
              key="frame-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 z-10 pt-16 sm:pt-20 md:pt-0 pb-12 sm:pb-8 md:pb-0 max-w-6xl mx-auto"
            >
              <div className="w-full my-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 md:gap-12">
                {/* Left Column: Monumental Headline (Estilo fc899bc: Drop-cap Italic Serif) */}
                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20">
                  <motion.h2 
                    variants={itemFadeUp}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-950 dark:text-white"
                  >
                    <span className="text-[1.2em] italic font-serif text-purple-400 mr-0.5">M</span>onta tu fit
                  </motion.h2>
                  <motion.h3 
                    variants={itemFadeUp}
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] text-[var(--brand-pink,#FF66C4)] mt-0.5 sm:mt-1.5"
                  >
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">L</span>isto para hoy
                  </motion.h3>
                  <motion.p 
                    variants={itemFadeUp}
                    className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs sm:max-w-md mx-auto md:mx-0 font-normal"
                  >
                    Prueba combinaciones en el lienzo libre, guarda tus looks favoritos y sal de casa sabiendo qué ponerte antes de desordenar el cuarto.
                  </motion.p>
                </div>

                {/* Right Column: Editorial Moodboard Cluster with Tactile Hover */}
                <div className="w-full md:w-1/2 h-[190px] sm:h-[260px] md:h-[420px] relative flex items-center justify-center z-10 max-w-[280px] sm:max-w-[420px] md:max-w-none">
                  
                  {/* Left: Total White */}
                  <motion.div 
                    variants={itemFloatIn(-40, -8, -8)}
                    animate={{ y: [0, 7, 0], rotate: [-8, -6, -8] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.08, rotate: -3 }}
                    className="absolute left-1 sm:left-4 md:left-6 top-1 sm:top-3 md:top-6 w-16 sm:w-26 md:w-36 lg:w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-lg -rotate-8 transition-transform duration-500 z-10 cursor-pointer"
                  >
                    <Image 
                      src="/landing/outfits/chica-blanco-total-look.jpg" 
                      alt="Look Total White" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[7px] sm:text-[9px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shadow-xs">
                      Look Minimal
                    </div>
                  </motion.div>

                  {/* Centerpiece: Hero Canvas Collage */}
                  <motion.div 
                    variants={itemFloatIn(0, -6, 0)}
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.06 }}
                    className="relative z-20 w-28 sm:w-42 md:w-56 lg:w-60 aspect-[3/4] rounded-2xl md:rounded-[24px] overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.18)] cursor-pointer"
                  >
                    <Image 
                      src="/landing/outfits/outfit-rayas-miumiu.jpg" 
                      alt="Outfit Lienzo Miu Miu" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] text-[8px] sm:text-[10px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--brand-pink,#FF66C4)]" />
                      <span>Lienzo de Hoy</span>
                    </div>
                  </motion.div>

                  {/* Right: Streetwear */}
                  <motion.div 
                    variants={itemFloatIn(40, 8, 8)}
                    animate={{ y: [0, 6, 0], rotate: [8, 10, 8] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    className="absolute right-1 sm:right-4 md:right-6 bottom-1 sm:bottom-3 md:bottom-6 w-16 sm:w-26 md:w-36 lg:w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-lg rotate-8 transition-transform duration-500 z-10 cursor-pointer"
                  >
                    <Image 
                      src="/landing/outfits/chico-denim-sneakers-street.jpg" 
                      alt="Look Streetwear" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[7px] sm:text-[9px] font-semibold text-[var(--brand-pink,#FF66C4)] whitespace-nowrap shadow-xs">
                      Street Style
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FRAME 4: ACCESO FINAL & FOOTER LEGAL INTEGRADO */}
          {/* ======================================================== */}
          {currentFrame === 4 && (
            <motion.div
              key="frame-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col justify-between items-center text-center px-4 sm:px-6 pt-16 sm:pt-20 pb-4 sm:pb-6 z-10"
            >
              {/* Left Flanking Look (Visible on md+ screens) */}
              <motion.div
                variants={itemFloatIn(-50, 0, -6)}
                animate={{ y: [0, -7, 0], rotate: [-6, -4, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="hidden md:block absolute left-4 lg:left-8 xl:left-20 top-1/2 -translate-y-1/2 w-28 lg:w-40 xl:w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-xl -rotate-6 pointer-events-none z-10"
              >
                <Image 
                  src="/landing/outfits/chico-denim-sneakers-street.jpg" 
                  alt="Streetwear Chico" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[9px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shadow-xs">
                  @comunidad • Denim
                </div>
              </motion.div>

              {/* Right Flanking Look (Visible on md+ screens) */}
              <motion.div
                variants={itemFloatIn(50, 0, 6)}
                animate={{ y: [0, 7, 0], rotate: [6, 8, 6] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                className="hidden md:block absolute right-4 lg:right-8 xl:right-20 top-1/2 -translate-y-1/2 w-28 lg:w-40 xl:w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-xl rotate-6 pointer-events-none z-10"
              >
                <Image 
                  src="/landing/outfits/outfit-chaleco-cartier.jpg" 
                  alt="Look Chaleco Cartier" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] text-[9px] font-semibold text-[var(--brand-pink,#FF66C4)] whitespace-nowrap shadow-xs">
                  Elegante • Kloe
                </div>
              </motion.div>

              {/* Center Conversion Card */}
              <div className="my-auto w-full max-w-lg flex flex-col items-center relative z-20 py-2 sm:py-4">
                
                {/* Brand Logo in Foreground */}
                <motion.div variants={itemFadeUp} className="mb-2 sm:mb-4">
                  <Image 
                    src="/landing/klozet-nombre-grande.png" 
                    alt="Klozet" 
                    width={180} 
                    height={55} 
                    className="h-8 sm:h-10 w-auto object-contain mx-auto" 
                  />
                </motion.div>

                {/* Monumental Closing Headline (Estilo fc899bc: Drop-cap Italic Serif) */}
                <motion.h2 
                  variants={itemFadeUp}
                  className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase leading-[0.9]"
                >
                  <span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">V</span>ístete mejor <br />
                  <span className="bg-gradient-to-r from-[var(--brand-pink,#FF66C4)] to-purple-500 bg-clip-text text-transparent">
                    <span className="text-[1.2em] italic font-serif text-pink-400 mr-0.5">D</span>isfruta tu ropa
                  </span>
                </motion.h2>
                
                <motion.p 
                  variants={itemFadeUp}
                  className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs sm:max-w-md font-normal"
                >
                  Regístrate gratis en menos de un minuto y empieza a organizar tus outfits favoritos.
                </motion.p>

                {/* Mobile Preview Cards with Spring Hover */}
                <motion.div variants={itemFadeUp} className="flex md:hidden items-center justify-center gap-2.5 my-3">
                  <motion.div whileHover={{ scale: 1.08 }} className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-sm -rotate-3 relative">
                    <Image 
                      src="/landing/outfits/chico-denim-sneakers-street.jpg" 
                      alt="Streetwear Chico" 
                      fill 
                      className="object-cover" 
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.08 }} className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-sm rotate-3 relative">
                    <Image 
                      src="/landing/outfits/outfit-chaleco-cartier.jpg" 
                      alt="Look Chaleco Cartier" 
                      fill 
                      className="object-cover" 
                    />
                  </motion.div>
                </motion.div>

                {/* Call to Action Buttons */}
                <motion.div variants={itemFadeUp} className="mt-3 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto z-30">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth"
                      className="w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm md:text-base bg-[var(--brand-pink,#FF66C4)] text-white hover:opacity-95 transition-all shadow-md shadow-[var(--brand-pink,#FF66C4)]/20 inline-flex items-center justify-center gap-2 group"
                    >
                      <span>Entrar a Klozet gratis</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  
                  {user && (
                    <Link
                      href="/closet"
                      className="w-full sm:w-auto px-5 sm:px-7 py-3 rounded-full font-semibold text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all active:scale-95 inline-flex items-center justify-center"
                    >
                      Ir a mi armario
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Integrated Apple Legal & Directory Footer */}
              <motion.div 
                variants={itemFadeUp}
                className="w-full pt-3 sm:pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-normal max-w-4xl mx-auto relative z-20 mt-auto"
              >
                <p className="text-[9px] sm:text-[11px] text-zinc-400 dark:text-zinc-500">
                  © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-[10px] sm:text-[11px]">
                  <Link href="/about" className="hover:text-[var(--brand-pink,#FF66C4)] transition-colors">
                    Sobre Nosotros
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <Link href="/terms" className="hover:text-[var(--brand-pink,#FF66C4)] transition-colors inline-flex items-center gap-0.5">
                    <FileText className="w-3 h-3" />
                    <span>Términos</span>
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <Link href="/privacy" className="hover:text-[var(--brand-pink,#FF66C4)] transition-colors inline-flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Privacidad</span>
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <Link href="/cookies" className="hover:text-[var(--brand-pink,#FF66C4)] transition-colors">
                    Cookies
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <Link href="/contact" className="hover:text-[var(--brand-pink,#FF66C4)] transition-colors">
                    Contacto
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <a href="mailto:soporte@klozet.es" className="hover:text-[var(--brand-pink,#FF66C4)] transition-colors">
                    soporte@klozet.es
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Next Slide Indicator */}
      {currentFrame < totalFrames - 1 && (
        <button
          onClick={nextFrame}
          aria-label="Siguiente pantalla"
          className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-[10px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer pointer-events-auto"
        >
          <span>Desliza</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
