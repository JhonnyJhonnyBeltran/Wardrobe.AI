'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText, Sparkles, Wand2, Layers, CheckCircle2, ChevronDown } from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = 5;
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Frame switcher with locking debounce
  const goToFrame = (index: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentFrame(Math.max(0, Math.min(totalFrames - 1, index)));
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 650);
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

  // Visual Stagger Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemFloatIn = (xOffset = 0, yOffset = 0, rotation = 0) => ({
    hidden: { opacity: 0, x: xOffset, y: yOffset, rotate: rotation - 8, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: rotation,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-[100dvh] min-h-[100dvh] w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between fixed inset-0 select-none antialiased"
    >
      {/* 1. TOP BAR WITH LOGO AND AUTH BUTTONS */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3.5 sm:px-8 py-3 sm:py-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-6">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
            <Image 
              src="/landing/klozet-nombre-grande.png" 
              alt="Klozet" 
              width={110} 
              height={34} 
              className="h-5 sm:h-8 w-auto object-contain" 
              priority
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-3.5 text-xs font-semibold text-[var(--foreground-secondary)]">
            <Link href="/about" className="hover:text-[var(--brand-pink)] transition-colors">
              Sobre Nosotros
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/contact" className="hover:text-[var(--brand-pink)] transition-colors">
              Contacto
            </Link>
          </nav>
        </div>

        {/* Minimalist 5-Segment Progress Indicator */}
        <nav 
          aria-label="Progreso"
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-white/70 dark:bg-[#121216]/70 backdrop-blur-md border border-gray-200/60 dark:border-white/10 shadow-xs"
        >
          {Array.from({ length: totalFrames }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToFrame(idx)}
              aria-label={`Ir al fotograma ${idx + 1}`}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentFrame === idx
                  ? 'w-6 sm:w-9 bg-[var(--brand-pink)] shadow-xs'
                  : 'w-2 sm:w-3 bg-gray-400/40 dark:bg-white/25 hover:bg-gray-400/70 dark:hover:bg-white/50'
              }`}
            />
          ))}
        </nav>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <Link 
              href="/closet" 
              className="px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1 sm:gap-1.5"
            >
              <span>Mi Armario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link 
                href="/auth" 
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)]/70 transition-all active:scale-95 shadow-xs"
              >
                Entrar
              </Link>
              <Link 
                href="/auth" 
                className="px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1"
              >
                <span>Registro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. ATMOSPHERIC BACKDROP LIGHTING (MUTATING ACROSS KEYFRAMES) */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[880px] h-[340px] sm:h-[880px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 -z-10 ${
          currentFrame === 0 ? 'bg-gradient-to-tr from-[var(--brand-pink)]/20 via-purple-600/15 to-transparent' :
          currentFrame === 1 ? 'bg-gradient-to-tr from-purple-600/20 via-[var(--brand-pink)]/15 to-pink-300/10' :
          currentFrame === 2 ? 'bg-gradient-to-tr from-[var(--brand-pink)]/30 via-pink-500/25 to-purple-600/20' :
          currentFrame === 3 ? 'bg-gradient-to-tr from-purple-700/20 via-indigo-600/15 to-[var(--brand-pink)]/15' :
          'bg-gradient-to-tr from-[var(--brand-pink)]/25 via-purple-500/20 to-transparent'
        }`}
      />

      {/* 3. BRAND WATERMARK BACKGROUND (STORYTELLING ANCHOR) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] sm:max-w-[950px] opacity-[0.05] sm:opacity-[0.09] pointer-events-none -z-10 transition-transform duration-700">
        <Image 
          src="/landing/klozet-nombre-grande.png" 
          alt="Klozet" 
          width={1000} 
          height={350} 
          className="w-full h-auto object-contain"
          priority 
        />
      </div>

      {/* 4. MAIN FREE-FLOATING 100VH STAGE */}
      <main className="w-full h-full relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* KEYFRAME 0: ARMARIO LLENO - NADA QUE PONERTE */}
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
              <div className="my-auto w-full flex flex-col items-center gap-2.5 sm:gap-5 py-2">
                {/* MONUMENTAL TYPOGRAPHY */}
                <motion.div variants={itemFadeUp} className="flex flex-col items-center">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[6rem] font-black tracking-tighter uppercase leading-[0.9] text-[var(--foreground)]">
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink)] mr-0.5">A</span>rmario Lleno
                  </h1>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[6rem] font-black tracking-tighter uppercase leading-[0.9] bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-0.5 sm:mt-1">
                    <span className="text-[1.2em] italic font-serif text-pink-400 mr-0.5">N</span>ada que ponerte
                  </h2>
                </motion.div>

                {/* Punchy Narrative Text */}
                <motion.p 
                  variants={itemFadeUp}
                  className="text-xs sm:text-sm md:text-lg text-[var(--foreground-secondary)] max-w-xs sm:max-w-lg font-medium leading-snug"
                >
                  Todas las mañanas el mismo lío frente al espejo. Klozet organiza tu ropa y te dice exactamente qué ponerte.
                </motion.p>

                {/* Central Fashion Wardrobe Cluster (Tactile & Scaled on Mobile) */}
                <motion.div 
                  variants={itemFadeUp}
                  className="w-full max-w-[280px] sm:max-w-[420px] md:max-w-[480px] h-[160px] sm:h-[220px] md:h-[260px] relative flex items-center justify-center my-1 sm:my-2"
                >
                  {/* Left: Chaleco Zara in glass card */}
                  <motion.div 
                    variants={itemFloatIn(-30, 10, -8)}
                    className="absolute left-1 sm:left-4 md:left-6 top-2 sm:top-4 w-16 sm:w-26 md:w-34 aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border border-white/25 sm:border-2 shadow-xl -rotate-8 z-10"
                  >
                    <Image 
                      src="/landing/zara-chaleco.jpg" 
                      alt="Chaleco Zara" 
                      fill 
                      className="object-cover" 
                      priority 
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] text-[7px] sm:text-[9px] font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                      Chaleco Zara
                    </div>
                  </motion.div>

                  {/* Center Hero: Sudadera Scuffers Cutout */}
                  <motion.div 
                    variants={itemFloatIn(0, -8, 2)}
                    className="relative z-20 w-28 sm:w-42 md:w-52 drop-shadow-[0_16px_32px_rgba(255,45,120,0.35)]"
                  >
                    <Image 
                      src="/landing/sudadera-scuffers-cutout.png" 
                      alt="Sudadera Scuffers" 
                      width={320} 
                      height={320} 
                      className="w-full h-auto object-contain rotate-2 hover:rotate-0 transition-transform duration-500" 
                      priority 
                    />
                  </motion.div>

                  {/* Right: Top Vichy in glass card */}
                  <motion.div 
                    variants={itemFloatIn(30, 10, 8)}
                    className="absolute right-1 sm:right-4 md:right-6 top-2 sm:top-4 w-16 sm:w-26 md:w-34 aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border border-white/25 sm:border-2 shadow-xl rotate-8 z-10"
                  >
                    <Image 
                      src="/landing/top-vichy.jpg" 
                      alt="Top Vichy" 
                      fill 
                      className="object-cover" 
                      priority 
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] text-[7px] sm:text-[9px] font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                      Top Vichy
                    </div>
                  </motion.div>

                  {/* Bottom: Golden Goose Glitter Sneaker */}
                  <motion.div 
                    variants={itemFloatIn(10, 25, -5)}
                    className="absolute bottom-0 right-3 sm:right-12 md:right-16 w-20 sm:w-32 md:w-44 pointer-events-none drop-shadow-xl z-30"
                  >
                    <Image 
                      src="/landing/golden-goose.png" 
                      alt="Golden Goose" 
                      width={240} 
                      height={150} 
                      className="w-full h-auto object-contain -rotate-6" 
                      priority 
                    />
                  </motion.div>
                </motion.div>

                {/* Action Button */}
                <motion.div variants={itemFadeUp} className="z-30 mt-1">
                  <Link
                    href={user ? "/closet" : "/auth"}
                    className="px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full font-black text-xs sm:text-sm md:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center gap-2 group"
                  >
                    <span>{user ? "Ir a mi armario" : "Empezar gratis"}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 1: DIGITALIZACIÓN & RECORTE LIBRE SIN CAJAS */}
          {/* ======================================================== */}
          {currentFrame === 1 && (
            <motion.div
              key="frame-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 z-10 pt-16 sm:pt-20 md:pt-0 pb-12 sm:pb-8 md:pb-0"
            >
              <div className="w-full my-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12">
                {/* Left Column: Monumental Headline with Drop-Caps */}
                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20">
                  <motion.h2 
                    variants={itemFadeUp}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] text-[var(--foreground)]"
                  >
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink)] mr-0.5">T</span>oda tu ropa
                  </motion.h2>
                  <motion.h3 
                    variants={itemFadeUp}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] text-[var(--brand-pink)] mt-0.5 sm:mt-1.5"
                  >
                    <span className="text-[1.2em] italic font-serif text-purple-400 mr-0.5">E</span>n un toque
                  </motion.h3>
                  <motion.p 
                    variants={itemFadeUp}
                    className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-xs sm:max-w-md mx-auto md:mx-0 font-medium"
                  >
                    Saca una foto y el fondo desaparece al instante. Tu ropa real ordenada y lista para combinar.
                  </motion.p>
                  
                  {/* Micro Pill Feature */}
                  <motion.div variants={itemFadeUp} className="mt-2.5 sm:mt-4 flex flex-row items-center justify-center md:justify-start gap-2 sm:gap-2.5 text-[10px] sm:text-xs md:text-sm font-bold text-[var(--foreground-secondary)]">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                      <span>Recorte con IA</span>
                    </div>
                    <span className="text-[var(--border-color)]">•</span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Categorización en 1s</span>
                    </div>
                  </motion.div>
                </div>

                {/* Right: Dynamic Orbit Cluster */}
                <div className="w-full md:w-1/2 h-[170px] sm:h-[240px] md:h-[420px] relative flex items-center justify-center z-10 max-w-[280px] sm:max-w-[380px] md:max-w-none">
                  
                  {/* Piece 1: Top Vichy */}
                  <motion.div 
                    variants={itemFloatIn(-35, -8, -10)}
                    className="absolute left-1 sm:left-4 md:left-6 top-1 sm:top-3 md:top-8 w-16 sm:w-26 md:w-38 lg:w-42 aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border border-white/20 sm:border-2 shadow-xl -rotate-10 hover:rotate-0 transition-transform duration-500 z-10"
                  >
                    <Image 
                      src="/landing/top-vichy.jpg" 
                      alt="Top Vichy" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--border-color)]/80 text-[7px] sm:text-[9px] md:text-xs font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                      Top Vichy
                    </div>
                  </motion.div>

                  {/* Piece 2: Scuffers Hoodie */}
                  <motion.div 
                    variants={itemFloatIn(0, -8, 2)}
                    className="relative z-20 w-28 sm:w-42 md:w-56 lg:w-64 drop-shadow-[0_16px_32px_rgba(255,45,120,0.35)]"
                  >
                    <Image 
                      src="/landing/sudadera-scuffers-cutout.png" 
                      alt="Sudadera Scuffers" 
                      width={320} 
                      height={320} 
                      className="w-full h-auto object-contain rotate-2 hover:rotate-0 transition-transform duration-500" 
                    />
                    <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-color)] text-[8px] sm:text-[10px] md:text-xs font-black text-[var(--foreground)] whitespace-nowrap shadow-xl flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink)]" />
                      <span>Scuffers Hoodie</span>
                    </div>
                  </motion.div>

                  {/* Piece 3: Chaleco Zara */}
                  <motion.div 
                    variants={itemFloatIn(35, -8, 10)}
                    className="absolute right-1 sm:right-4 md:right-auto md:left-12 top-1 sm:top-3 md:top-auto md:bottom-6 w-16 sm:w-26 md:w-34 lg:w-38 aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border border-white/20 sm:border-2 shadow-xl rotate-10 md:rotate-6 hover:rotate-0 transition-transform duration-500 z-10"
                  >
                    <Image 
                      src="/landing/zara-chaleco.jpg" 
                      alt="Chaleco Zara" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--border-color)]/80 text-[7px] sm:text-[9px] md:text-xs font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                      Chaleco Zara
                    </div>
                  </motion.div>

                  {/* Piece 4: Golden Goose */}
                  <motion.div 
                    variants={itemFloatIn(15, 20, 8)}
                    className="absolute -bottom-1 right-2 sm:right-5 md:bottom-3 md:right-5 w-20 sm:w-32 md:w-48 lg:w-52 pointer-events-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.3)] z-20"
                  >
                    <Image 
                      src="/landing/golden-goose.png" 
                      alt="Golden Goose" 
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
          {/* KEYFRAME 2: PROTAGONISMO TOTAL DE KLOE (ESTILISTA IA) */}
          {/* ======================================================== */}
          {currentFrame === 2 && (
            <motion.div
              key="frame-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 z-10 pt-16 sm:pt-20 md:pt-0 pb-12 sm:pb-8 md:pb-0"
            >
              <div className="w-full my-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12">
                {/* Left Column: Monumental Narrative with Drop-Caps */}
                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20">
                  <motion.h2 
                    variants={itemFadeUp}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] text-[var(--foreground)]"
                  >
                    <span className="text-[1.2em] italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mr-0.5">Q</span>ué me pongo
                  </motion.h2>
                  <motion.h3 
                    variants={itemFadeUp}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-0.5 sm:mt-1.5"
                  >
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink)] mr-0.5">K</span>loe te ayuda
                  </motion.h3>
                  <motion.p 
                    variants={itemFadeUp}
                    className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-xs sm:max-w-md mx-auto md:mx-0 font-medium"
                  >
                    Dile a dónde vas o cómo te sientes. Kloe mira tus fotos reales y te crea combinaciones perfectas al segundo.
                  </motion.p>
                  
                  {/* Stylist Highlights List */}
                  <motion.div variants={itemFadeUp} className="mt-2.5 sm:mt-4 flex flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm font-semibold text-[var(--foreground-secondary)]">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                      <span>Revisa tu ropa real</span>
                    </div>
                    <span className="text-[var(--border-color)]">•</span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Equilibrio cromático</span>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Kloe Hero Character */}
                <div className="w-full md:w-1/2 h-[180px] sm:h-[260px] md:h-[420px] relative flex items-center justify-center z-10 max-w-[280px] sm:max-w-[380px] md:max-w-none">
                  
                  {/* Pulsing Atmospheric Aura */}
                  <div className="absolute w-[160px] sm:w-[260px] md:w-[380px] h-[160px] sm:h-[260px] md:h-[380px] rounded-full bg-gradient-to-tr from-[var(--brand-pink)]/40 via-purple-500/30 to-transparent blur-2xl animate-pulse pointer-events-none" />
                  
                  {/* Orbital Ring */}
                  <div className="absolute w-[200px] sm:w-[300px] md:w-[420px] h-[200px] sm:h-[300px] md:h-[420px] rounded-full border border-[var(--brand-pink)]/25 animate-[spin_24s_linear_infinite] pointer-events-none" />

                  {/* Floating Kloe Mascot */}
                  <motion.div 
                    variants={itemFloatIn(0, 0, 0)}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-[130px] sm:w-[200px] md:w-[320px] lg:w-[360px] flex items-center justify-center p-1 drop-shadow-[0_16px_36px_rgba(255,45,120,0.4)]"
                  >
                    <Image 
                      src="/landing/kloe-grande-landing.png" 
                      alt="Kloe Stylist" 
                      width={480} 
                      height={480} 
                      className="w-full h-auto object-contain"
                      priority 
                    />
                    
                    {/* Floating Action Pill */}
                    <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-xl flex items-center gap-1 text-[9px] sm:text-xs md:text-sm font-black text-[var(--foreground)] whitespace-nowrap">
                      <Sparkles className="w-3 h-3 text-[var(--brand-pink)]" />
                      <span>Look en 3 segundos</span>
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 3: MONTA TU FIT - GALERÍA EDITORIAL FLOTANTE */}
          {/* ======================================================== */}
          {currentFrame === 3 && (
            <motion.div
              key="frame-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-24 z-10 pt-16 sm:pt-20 md:pt-0 pb-12 sm:pb-8 md:pb-0"
            >
              <div className="w-full my-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12">
                {/* Left Column: Monumental Headline */}
                <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20">
                  <motion.h2 
                    variants={itemFadeUp}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] text-[var(--foreground)]"
                  >
                    <span className="text-[1.2em] italic font-serif text-purple-400 mr-0.5">M</span>onta tu fit
                  </motion.h2>
                  <motion.h3 
                    variants={itemFadeUp}
                    className="text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] font-black tracking-tighter uppercase leading-[0.9] text-[var(--brand-pink)] mt-0.5 sm:mt-1.5"
                  >
                    <span className="text-[1.2em] italic font-serif text-[var(--brand-pink)] mr-0.5">L</span>isto para hoy
                  </motion.h3>
                  <motion.p 
                    variants={itemFadeUp}
                    className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-xs sm:max-w-md mx-auto md:mx-0 font-medium"
                  >
                    Prueba combinaciones en el lienzo libre, guarda tus favoritas y sal de casa sabiendo qué ponerte.
                  </motion.p>
                  
                  <motion.div variants={itemFadeUp} className="mt-2.5 sm:mt-4 flex items-center justify-center md:justify-start gap-1 sm:gap-1.5 text-[10px] sm:text-xs md:text-sm font-bold text-[var(--foreground-secondary)]">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Crea looks de pies a cabeza</span>
                  </motion.div>
                </div>

                {/* Right Column: Editorial Moodboard */}
                <div className="w-full md:w-1/2 h-[180px] sm:h-[260px] md:h-[420px] relative flex items-center justify-center z-10 max-w-[280px] sm:max-w-[420px] md:max-w-none">
                  
                  {/* Model 1: Total White */}
                  <motion.div 
                    variants={itemFloatIn(-40, -8, -8)}
                    className="absolute left-1 sm:left-4 md:left-6 top-1 sm:top-3 md:top-6 w-16 sm:w-26 md:w-36 lg:w-40 aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border border-white/20 sm:border-2 shadow-xl -rotate-8 hover:rotate-0 transition-transform duration-500 z-10 opacity-80 sm:opacity-90 md:opacity-100"
                  >
                    <Image 
                      src="/landing/outfits/chica-blanco-total-look.jpg" 
                      alt="Look Total White" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] text-[7px] sm:text-[9px] font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                      Look Real
                    </div>
                  </motion.div>

                  {/* Centerpiece: Hero Canvas Collage */}
                  <motion.div 
                    variants={itemFloatIn(0, -8, 0)}
                    className="relative z-20 w-28 sm:w-42 md:w-56 lg:w-60 aspect-[3/4] rounded-xl md:rounded-[24px] overflow-hidden border-2 border-white/40 shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
                  >
                    <Image 
                      src="/landing/outfits/outfit-rayas-miumiu.jpg" 
                      alt="Outfit Lienzo Miu Miu" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1.5 sm:-bottom-2.5 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-color)] text-[8px] sm:text-[10px] md:text-xs font-black text-[var(--foreground)] whitespace-nowrap shadow-xl flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--brand-pink)]" />
                      <span>Lienzo · Miu Miu</span>
                    </div>
                  </motion.div>

                  {/* Model 2: Streetwear */}
                  <motion.div 
                    variants={itemFloatIn(40, 8, 8)}
                    className="absolute right-1 sm:right-4 md:right-6 bottom-1 sm:bottom-3 md:bottom-6 w-16 sm:w-26 md:w-36 lg:w-40 aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border border-white/20 sm:border-2 shadow-xl rotate-8 hover:rotate-0 transition-transform duration-500 z-10 opacity-80 sm:opacity-90 md:opacity-100"
                  >
                    <Image 
                      src="/landing/outfits/chica-brown-top-jeans.jpg" 
                      alt="Look Streetwear" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] text-[7px] sm:text-[9px] font-black text-[var(--brand-pink)] whitespace-nowrap shadow-md">
                      Inspo
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 4: ACCESO FINAL & FOOTER LEGAL INTEGRADO */}
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
                className="hidden md:block absolute left-4 lg:left-8 xl:left-20 top-1/2 -translate-y-1/2 w-28 lg:w-40 xl:w-48 aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-white/20 sm:border-2 shadow-2xl -rotate-6 pointer-events-none hover:rotate-0 transition-transform duration-500 z-10 opacity-80 sm:opacity-90"
              >
                <Image 
                  src="/landing/outfits/chico-denim-sneakers-street.jpg" 
                  alt="Streetwear Chico" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] text-[9px] font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                  @alex · Denim
                </div>
              </motion.div>

              {/* Right Flanking Look (Visible on md+ screens) */}
              <motion.div
                variants={itemFloatIn(50, 0, 6)}
                className="hidden md:block absolute right-4 lg:right-8 xl:right-20 top-1/2 -translate-y-1/2 w-28 lg:w-40 xl:w-48 aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-white/20 sm:border-2 shadow-2xl rotate-6 pointer-events-none hover:rotate-0 transition-transform duration-500 z-10 opacity-80 sm:opacity-90"
              >
                <Image 
                  src="/landing/outfits/outfit-chaleco-cartier.jpg" 
                  alt="Look Chaleco Cartier" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] text-[9px] font-black text-[var(--brand-pink)] whitespace-nowrap shadow-md">
                  Elegante · Kloe
                </div>
              </motion.div>

              <div className="my-auto w-full max-w-lg flex flex-col items-center relative z-20 py-2 sm:py-4">
                
                {/* Brand Logo in Foreground */}
                <motion.div variants={itemFadeUp} className="mb-1.5 sm:mb-3">
                  <Image 
                    src="/landing/klozet-nombre-grande.png" 
                    alt="Klozet" 
                    width={200} 
                    height={65} 
                    className="h-7 sm:h-10 w-auto object-contain mx-auto drop-shadow-md" 
                  />
                </motion.div>

                {/* Colossal Closing Headline */}
                <motion.h2 
                  variants={itemFadeUp}
                  className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.9]"
                >
                  <span className="text-[1.2em] italic font-serif text-[var(--brand-pink)] mr-0.5">V</span>ístete mejor <br />
                  <span className="bg-gradient-to-r from-[var(--brand-pink)] to-purple-500 bg-clip-text text-transparent">
                    <span className="text-[1.2em] italic font-serif text-pink-400 mr-0.5">D</span>isfruta tu ropa
                  </span>
                </motion.h2>
                
                <motion.p 
                  variants={itemFadeUp}
                  className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-xs sm:max-w-md font-medium"
                >
                  Regístrate gratis en menos de un minuto y empieza a organizar tus outfits favoritos.
                </motion.p>

                {/* Mobile Preview Cards */}
                <motion.div variants={itemFadeUp} className="flex md:hidden items-center justify-center gap-2.5 my-2.5">
                  <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border border-white/20 shadow-md -rotate-3 relative">
                    <Image 
                      src="/landing/outfits/chico-denim-sneakers-street.jpg" 
                      alt="Streetwear Chico" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border border-white/20 shadow-md rotate-3 relative">
                    <Image 
                      src="/landing/outfits/outfit-chaleco-cartier.jpg" 
                      alt="Look Chaleco Cartier" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                </motion.div>

                {/* Call to Action Buttons */}
                <motion.div variants={itemFadeUp} className="mt-2 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto z-30">
                  <Link
                    href="/auth"
                    className="w-full sm:w-auto px-7 sm:px-10 py-3 sm:py-3.5 rounded-full font-black text-xs sm:text-sm md:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2 group"
                  >
                    <span>Entrar a Klozet gratis</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {user && (
                    <Link
                      href="/closet"
                      className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 inline-flex items-center justify-center"
                    >
                      Ir a mi armario
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Integrated Legal Footer at the Very Bottom */}
              <motion.div 
                variants={itemFadeUp}
                className="w-full pt-2 sm:pt-4 border-t border-[var(--border-color)]/30 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-xs text-[var(--foreground-secondary)] font-medium max-w-4xl mx-auto relative z-20 mt-auto"
              >
                <p className="text-[8px] sm:text-[10px] text-[var(--foreground-tertiary)]">
                  © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[9px] sm:text-[11px]">
                  <Link href="/about" className="hover:text-[var(--brand-pink)] transition-colors">
                    Sobre Nosotros
                  </Link>
                  <span className="text-[var(--border-color)]">•</span>
                  <Link href="/contact" className="hover:text-[var(--brand-pink)] transition-colors">
                    Contacto
                  </Link>
                  <span className="text-[var(--border-color)]">•</span>
                  <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-0.5">
                    <FileText className="w-3 h-3" />
                    <span>Términos</span>
                  </Link>
                  <span className="text-[var(--border-color)]">•</span>
                  <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Privacidad</span>
                  </Link>
                  <span className="text-[var(--border-color)]">•</span>
                  <Link href="/cookies" className="hover:text-[var(--brand-pink)] transition-colors">
                    Cookies
                  </Link>
                  <span className="text-[var(--border-color)]">•</span>
                  <a href="mailto:soporte@klozet.es" className="hover:text-[var(--brand-pink)] transition-colors">
                    soporte@klozet.es
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Next Slide Indicator & Quick Legal Access (Visible across slides for bots and users) */}
      {currentFrame < totalFrames - 1 && (
        <div className="fixed bottom-2.5 sm:bottom-4 left-0 right-0 z-40 px-3 sm:px-6 flex items-center justify-between pointer-events-none">
          <nav className="pointer-events-auto hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-[#121216]/70 backdrop-blur-md border border-gray-200/60 dark:border-white/10 text-[10px] font-medium text-[var(--foreground-tertiary)] shadow-xs">
            <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">Sobre Nosotros</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contacto</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacidad</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Términos</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-[var(--foreground)] transition-colors">Cookies</Link>
          </nav>

          <button
            onClick={nextFrame}
            aria-label="Siguiente pantalla"
            className="pointer-events-auto mx-auto md:mx-0 px-3.5 py-1 rounded-full bg-white/70 dark:bg-[#121216]/70 backdrop-blur-md border border-gray-200/60 dark:border-white/10 text-[10px] sm:text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-all flex items-center gap-1 shadow-xs active:scale-95 animate-pulse cursor-pointer"
          >
            <span>Desliza</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="hidden md:block w-36 pointer-events-none" />
        </div>
      )}

      {/* 5. CRAWLABLE SEMANTIC HTML CONTENT FOR SEARCH ENGINES & GOOGLE ADSENSE */}
      <section 
        className="sr-only" 
        aria-label="Información detallada, características de moda y legal de Klozet"
      >
        <h2>Klozet — Red Social de Moda, Armario Virtual Inteligente y Estilismo con IA</h2>
        <p>
          Klozet (klozet.es) es la plataforma líder en España para amantes de la moda, streetwear, 
          tendencias contemporáneas y gestión de armario virtual. Te permite digitalizar tus prendas reales 
          mediante recorte automático de fondo por visión computacional, organizar tus looks por categorías 
          (partes superiores, pantalones, calzado, prendas de abrigo y accesorios) y recibir sugerencias 
          de estilismo personalizadas con nuestra asesora Kloe.
        </p>

        <h3>Características Principales de Klozet</h3>
        <ul>
          <li>
            <strong>Digitalización de ropa en 1 segundo:</strong> Sube fotos de tus prendas de marcas reales 
            (Zara, Scuffers, Nike, Adidas, Miu Miu, Mango, Golden Goose) y la tecnología de IA elimina el fondo 
            para componer un catálogo interactivo personal.
          </li>
          <li>
            <strong>Lienzo interactivo de outfits (Canvas):</strong> Diseña, mueve y escala prendas en un 
            espacio de composición libre para probar combinaciones antes de vestirte.
          </li>
          <li>
            <strong>Kloe — Asesora y Estilista Personal con IA:</strong> Analiza las prendas de tu armario 
            para crear outfits coherentes de pies a cabeza respetando la armonía de color, el corte de las prendas 
            y el código de vestimenta para cualquier ocasión (casual, trabajo, cena formal o fiesta).
          </li>
          <li>
            <strong>Calendario de planificación de looks:</strong> Asigna outfits a días concretos del mes 
            para despertarte sabiendo exactamente qué ponerte.
          </li>
          <li>
            <strong>Red social y comunidad de moda (OOTD):</strong> Descubre publicaciones de inspiración real 
            estilo Pinterest y lookbook, sigue a creadores de tendencias, guarda ideas en carpetas temáticas y 
            comparte tus looks diarios.
          </li>
          <li>
            <strong>Catálogo de más de 30 estilos de moda:</strong> Streetwear, Casual Chic, Old Money, Quiet Luxury, 
            Y2K, Vintage, Techwear, Dark Academia, Gorpcore y Minimalismo adaptados a cualquier género.
          </li>
        </ul>

        <h3>Valores, Sostenibilidad y Filosofía</h3>
        <p>
          Fomentamos una relación más creativa y sostenible con tu ropa. Al tener tu armario organizado 
          y visible en tu móvil, redescubres combinaciones que no recordabas, reduciendo el consumo compulsivo 
          y maximizando el partido a tus prendas favoritas.
        </p>

        <h3>Navegación y Cumplimiento Legal</h3>
        <p>
          Klozet opera con estricto apego al Reglamento General de Protección de Datos (RGPD) de la Unión Europea, 
          la Ley 34/2002 (LSSI-CE) y las directrices de la Agencia Española de Protección de Datos (AEPD). 
          Puedes acceder a toda nuestra información institucional y legal en los siguientes enlaces:
        </p>
        <nav aria-label="Enlaces institucionales y legales">
          <ul>
            <li><Link href="/about">Sobre Nosotros y Nuestra Misión</Link></li>
            <li><Link href="/contact">Contacto y Soporte Oficial (soporte@klozet.es)</Link></li>
            <li><Link href="/privacy">Política de Privacidad y Cláusula de Google AdSense</Link></li>
            <li><Link href="/terms">Términos y Condiciones de Uso</Link></li>
            <li><Link href="/cookies">Política de Cookies y Preferencias de Publicidad</Link></li>
            <li><Link href="/auth">Acceso e Inicio de Sesión en Klozet</Link></li>
            <li><Link href="/feed">Feed de Moda y Publicaciones</Link></li>
            <li><Link href="/search">Buscador y Explorador de Estilos</Link></li>
          </ul>
        </nav>
      </section>
    </div>
  );
}
