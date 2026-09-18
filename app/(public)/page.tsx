'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText, Sparkles, Wand2, Layers, CheckCircle2 } from 'lucide-react';
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
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemFloatIn = (xOffset = 0, yOffset = 0, rotation = 0) => ({
    hidden: { opacity: 0, x: xOffset, y: yOffset, rotate: rotation - 10, scale: 0.88 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: rotation,
      scale: 1,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between fixed inset-0 select-none antialiased"
    >
      {/* 1. TOP RIGHT MINIMAL AUTH BUTTONS */}
      <header className="fixed top-0 right-0 z-50 p-4 sm:p-6 flex items-center gap-3">
        {user ? (
          <Link 
            href="/closet" 
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-black bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-lg shadow-[var(--brand-pink)]/25 active:scale-95 flex items-center gap-1.5"
          >
            <span>Mi Armario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <>
            <Link 
              href="/auth" 
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)]/70 transition-all active:scale-95 shadow-xs"
            >
              Iniciar sesión
            </Link>
            <Link 
              href="/auth" 
              className="px-5 py-2 rounded-full text-xs sm:text-sm font-black bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1"
            >
              <span>Registrarse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </header>

      {/* 2. ATMOSPHERIC BACKDROP LIGHTING (MUTATING ACROSS KEYFRAMES) */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[880px] h-[380px] sm:h-[880px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 -z-10 ${
          currentFrame === 0 ? 'bg-gradient-to-tr from-[var(--brand-pink)]/20 via-purple-600/15 to-transparent' :
          currentFrame === 1 ? 'bg-gradient-to-tr from-purple-600/20 via-[var(--brand-pink)]/15 to-pink-300/10' :
          currentFrame === 2 ? 'bg-gradient-to-tr from-[var(--brand-pink)]/30 via-pink-500/25 to-purple-600/20' :
          currentFrame === 3 ? 'bg-gradient-to-tr from-purple-700/20 via-indigo-600/15 to-[var(--brand-pink)]/15' :
          'bg-gradient-to-tr from-[var(--brand-pink)]/25 via-purple-500/20 to-transparent'
        }`}
      />

      {/* 3. BRAND WATERMARK BACKGROUND (STORYTELLING ANCHOR) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] sm:max-w-[950px] opacity-[0.06] sm:opacity-[0.09] pointer-events-none -z-10 transition-transform duration-700">
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
      <main className="w-full h-full relative overflow-hidden flex items-center justify-center px-4 sm:px-8">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* KEYFRAME 0: MAXIMALISMO EDITORIAL - EL PROBLEMA */}
          {/* ======================================================== */}
          {currentFrame === 0 && (
            <motion.div
              key="frame-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10"
            >
              {/* Layered Floating Pieces in Gravity-Free Space (Z-10) */}
              <motion.div 
                variants={itemFloatIn(-60, -40, -12)}
                className="absolute left-3 sm:left-10 lg:left-24 top-16 sm:top-20 w-28 sm:w-44 lg:w-56 pointer-events-none drop-shadow-2xl z-10"
              >
                <Image 
                  src="/landing/sudadera-scuffers-cutout.png" 
                  alt="Sudadera Scuffers" 
                  width={280} 
                  height={280} 
                  className="w-full h-auto object-contain -rotate-12 transition-transform duration-500 hover:rotate-0" 
                  priority 
                />
              </motion.div>

              <motion.div 
                variants={itemFloatIn(-50, 60, 8)}
                className="absolute left-4 sm:left-14 lg:left-28 bottom-16 sm:bottom-20 w-24 sm:w-36 lg:w-48 pointer-events-none drop-shadow-2xl z-10"
              >
                <Image 
                  src="/landing/pantalon-blanco.png" 
                  alt="Pantalón Blanco" 
                  width={220} 
                  height={280} 
                  className="w-full h-auto object-contain rotate-8 transition-transform duration-500 hover:rotate-0" 
                  priority 
                />
              </motion.div>

              <motion.div 
                variants={itemFloatIn(60, -40, 14)}
                className="absolute right-3 sm:right-10 lg:right-24 top-16 sm:top-20 w-28 sm:w-44 lg:w-56 pointer-events-none drop-shadow-2xl z-10"
              >
                <Image 
                  src="/landing/studio-longsleeve.png" 
                  alt="Studio Longsleeve" 
                  width={280} 
                  height={280} 
                  className="w-full h-auto object-contain rotate-14 transition-transform duration-500 hover:rotate-0" 
                  priority 
                />
              </motion.div>

              <motion.div 
                variants={itemFloatIn(50, 60, -10)}
                className="absolute right-4 sm:right-14 lg:right-28 bottom-16 sm:bottom-20 w-24 sm:w-36 lg:w-48 pointer-events-none drop-shadow-2xl z-10"
              >
                <Image 
                  src="/landing/botas-cowboy.png" 
                  alt="Botas Cowboy" 
                  width={220} 
                  height={280} 
                  className="w-full h-auto object-contain -rotate-10 transition-transform duration-500 hover:rotate-0" 
                  priority 
                />
              </motion.div>

              {/* MONUMENTAL TYPOGRAPHY WITH EDITORIAL DROP-CAPS (Z-20) */}
              <motion.div variants={itemFadeUp} className="relative z-20 max-w-6xl mx-auto flex flex-col items-center">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.2rem] xl:text-[8.5rem] font-black tracking-tighter uppercase leading-[0.85] text-[var(--foreground)]">
                  <span className="text-[1.22em] italic font-serif text-[var(--brand-pink)] mr-0.5">A</span>rmario Lleno.
                </h1>
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.2rem] xl:text-[8.5rem] font-black tracking-tighter uppercase leading-[0.85] bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-1 sm:mt-2">
                  <span className="text-[1.22em] italic font-serif text-pink-400 mr-0.5">N</span>ada que ponerte.
                </h2>
              </motion.div>

              {/* Punchy Narrative Text */}
              <motion.p 
                variants={itemFadeUp}
                className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] max-w-sm sm:max-w-xl font-medium leading-snug z-20"
              >
                Todas las mañanas el mismo lío frente al espejo. Klozet organiza tu ropa y te dice exactamente qué ponerte.
              </motion.p>

              {/* Action Button */}
              <motion.div variants={itemFadeUp} className="mt-6 sm:mt-8 z-30">
                <Link
                  href={user ? "/closet" : "/auth"}
                  className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center gap-2 group"
                >
                  <span>{user ? "Ir a mi armario" : "Empezar gratis"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
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
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 lg:px-24 z-10"
            >
              {/* Left Column: Monumental Headline with Drop-Caps */}
              <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20 pt-16 md:pt-0">
                <motion.h2 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.85] text-[var(--foreground)]"
                >
                  <span className="text-[1.22em] italic font-serif text-[var(--brand-pink)] mr-0.5">T</span>oda tu ropa.
                </motion.h2>
                <motion.h3 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.85] text-[var(--brand-pink)] mt-1 sm:mt-2"
                >
                  <span className="text-[1.22em] italic font-serif text-purple-400 mr-0.5">E</span>n un toque.
                </motion.h3>
                <motion.p 
                  variants={itemFadeUp}
                  className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium"
                >
                  Saca una foto y el fondo desaparece al instante. Tu ropa real ordenada y lista para combinar.
                </motion.p>
                
                {/* Micro Pill Feature */}
                <motion.div variants={itemFadeUp} className="mt-4 flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-bold text-[var(--foreground-secondary)]">
                  <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                  <span>Recorte automático con inteligencia artificial</span>
                </motion.div>
              </div>

              {/* Right: Free-Floating Pieces in Dynamic Orbit (NO rigid boxes) */}
              <div className="w-full md:w-1/2 h-[340px] sm:h-[480px] relative flex items-center justify-center z-10 pb-12 md:pb-0">
                
                {/* Piece 1: Star Denim Floating Left */}
                <motion.div 
                  variants={itemFloatIn(-70, 20, -14)}
                  className="absolute left-2 sm:left-8 top-6 sm:top-12 w-32 sm:w-48 lg:w-56 pointer-events-none drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)]"
                >
                  <Image 
                    src="/landing/jeans-stars.png" 
                    alt="Star Denim" 
                    width={240} 
                    height={280} 
                    className="w-full h-auto object-contain -rotate-12" 
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)]/80 text-[10px] sm:text-xs font-black text-[var(--foreground)] whitespace-nowrap shadow-md">
                    Star Denim
                  </div>
                </motion.div>

                {/* Piece 2: Scuffers Hoodie Hero Floating Center */}
                <motion.div 
                  variants={itemFloatIn(0, -30, 4)}
                  className="relative z-20 w-44 sm:w-64 lg:w-72 drop-shadow-[0_30px_50px_rgba(255,45,120,0.3)]"
                >
                  <Image 
                    src="/landing/sudadera-scuffers-cutout.png" 
                    alt="Sudadera Scuffers" 
                    width={320} 
                    height={320} 
                    className="w-full h-auto object-contain rotate-3 hover:rotate-0 transition-transform duration-500" 
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-color)] text-xs font-black text-[var(--foreground)] whitespace-nowrap shadow-xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)]" />
                    <span>Scuffers Orange Hoodie</span>
                  </div>
                </motion.div>

                {/* Piece 3: Golden Goose Sneaker Floating Right */}
                <motion.div 
                  variants={itemFloatIn(70, 40, 16)}
                  className="absolute right-2 sm:right-6 bottom-4 sm:bottom-10 w-36 sm:w-52 lg:w-60 pointer-events-none drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)]"
                >
                  <Image 
                    src="/landing/golden-goose.png" 
                    alt="Golden Goose" 
                    width={260} 
                    height={150} 
                    className="w-full h-auto object-contain rotate-14" 
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)]/80 text-[10px] sm:text-xs font-black text-[var(--brand-pink)] whitespace-nowrap shadow-md">
                    Golden Goose Glitter
                  </div>
                </motion.div>

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
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 lg:px-24 z-10"
            >
              {/* Left Column: Monumental Narrative with Drop-Caps */}
              <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20 pt-16 md:pt-0">
                <motion.h2 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.85] text-[var(--foreground)]"
                >
                  <span className="text-[1.22em] italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mr-0.5">¿</span>Qué me pongo?
                </motion.h2>
                <motion.h3 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.85] bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-1 sm:mt-2"
                >
                  <span className="text-[1.22em] italic font-serif text-[var(--brand-pink)] mr-0.5">K</span>loe te ayuda.
                </motion.h3>
                <motion.p 
                  variants={itemFadeUp}
                  className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium"
                >
                  Dile a dónde vas o cómo te sientes. Kloe mira tus fotos reales y te crea combinaciones perfectas al segundo.
                </motion.p>
                
                {/* Stylist Highlights List */}
                <motion.div variants={itemFadeUp} className="mt-5 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 text-xs sm:text-sm font-semibold text-[var(--foreground-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-pink)]" />
                    <span>Revisa tu armario real</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Equilibrio cromático</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Kloe Hero Character in Atmospheric Orbital Space */}
              <div className="w-full md:w-1/2 h-[340px] sm:h-[480px] relative flex items-center justify-center z-10 pb-12 md:pb-0">
                
                {/* Pulsing Atmospheric Aura */}
                <div className="absolute w-[280px] sm:w-[440px] h-[280px] sm:h-[440px] rounded-full bg-gradient-to-tr from-[var(--brand-pink)]/40 via-purple-500/30 to-transparent blur-3xl animate-pulse pointer-events-none" />
                
                {/* Delicate Orbital Ring */}
                <div className="absolute w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full border border-[var(--brand-pink)]/25 animate-[spin_24s_linear_infinite] pointer-events-none" />

                {/* Floating Kloe Mascot */}
                <motion.div 
                  variants={itemFloatIn(0, 0, 0)}
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-[240px] sm:w-[380px] lg:w-[420px] flex items-center justify-center p-2 drop-shadow-[0_25px_50px_rgba(255,45,120,0.45)]"
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
                  <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-black text-[var(--foreground)] whitespace-nowrap">
                    <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                    <span>Look armado en 3 segundos</span>
                  </div>
                </motion.div>

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
              className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 lg:px-24 z-10"
            >
              {/* Left Column: Monumental Headline */}
              <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center z-20 pt-16 md:pt-0">
                <motion.h2 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.85] text-[var(--foreground)]"
                >
                  <span className="text-[1.22em] italic font-serif text-purple-400 mr-0.5">M</span>onta tu fit.
                </motion.h2>
                <motion.h3 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-6xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.85] text-[var(--brand-pink)] mt-1 sm:mt-2"
                >
                  <span className="text-[1.22em] italic font-serif text-[var(--brand-pink)] mr-0.5">L</span>isto para hoy.
                </motion.h3>
                <motion.p 
                  variants={itemFadeUp}
                  className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium"
                >
                  Prueba combinaciones en el lienzo libre, guarda tus favoritas y sal de casa sabiendo qué ponerte.
                </motion.p>
                
                <motion.div variants={itemFadeUp} className="mt-4 flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-bold text-[var(--foreground-secondary)]">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Crea looks completos de pies a cabeza</span>
                </motion.div>
              </div>

              {/* Right Column: Dynamic Editorial Asymmetric Moodboard (Free-floating) */}
              <div className="w-full md:w-1/2 h-[340px] sm:h-[480px] relative flex items-center justify-center z-10 pb-12 md:pb-0">
                
                {/* Model 1: Chica Cookies Denim */}
                <motion.div 
                  variants={itemFloatIn(-80, -40, -6)}
                  className="absolute left-2 sm:left-6 top-4 sm:top-8 w-28 sm:w-40 lg:w-44 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500"
                >
                  <Image src="/landing/outfits/chica-cookies-denim.jpg" alt="Fit Cookies" fill className="object-cover" />
                </motion.div>

                {/* Model 2: Chico Henley Pleated */}
                <motion.div 
                  variants={itemFloatIn(60, -30, 8)}
                  className="absolute right-4 sm:right-10 top-2 sm:top-6 w-28 sm:w-40 lg:w-44 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl rotate-[8deg] hover:rotate-0 transition-transform duration-500"
                >
                  <Image src="/landing/outfits/chico-henley-pleated.jpg" alt="Fit Henley" fill className="object-cover" />
                </motion.div>

                {/* Model 3: Chica Leopard Scarf */}
                <motion.div 
                  variants={itemFloatIn(-40, 60, 4)}
                  className="absolute left-10 sm:left-20 bottom-4 sm:bottom-8 w-26 sm:w-36 lg:w-40 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl rotate-[4deg] hover:rotate-0 transition-transform duration-500 z-10"
                >
                  <Image src="/landing/outfits/chica-leopard-scarf.jpg" alt="Fit Leopard" fill className="object-cover" />
                </motion.div>

                {/* Floating Onitsuka Sneaker Accent */}
                <motion.div 
                  variants={itemFloatIn(70, 70, -12)}
                  className="absolute right-6 sm:right-14 bottom-6 sm:bottom-10 w-28 sm:w-36 lg:w-40 pointer-events-none drop-shadow-2xl z-20"
                >
                  <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka Tiger" width={180} height={100} className="w-full h-auto object-contain -rotate-12" />
                </motion.div>

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
              className="absolute inset-0 w-full h-full flex flex-col justify-between items-center text-center px-4 sm:px-6 py-6 z-10"
            >
              <div className="my-auto w-full max-w-3xl flex flex-col items-center">
                
                {/* Brand Logo in Foreground */}
                <motion.div variants={itemFadeUp} className="mb-4">
                  <Image 
                    src="/landing/klozet-nombre-grande.png" 
                    alt="Klozet" 
                    width={220} 
                    height={75} 
                    className="h-10 sm:h-14 w-auto object-contain mx-auto drop-shadow-md" 
                  />
                </motion.div>

                {/* Colossal Closing Headline */}
                <motion.h2 
                  variants={itemFadeUp}
                  className="text-4xl sm:text-6xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.88]"
                >
                  <span className="text-[1.22em] italic font-serif text-[var(--brand-pink)] mr-0.5">V</span>ístete mejor. <br />
                  <span className="bg-gradient-to-r from-[var(--brand-pink)] to-purple-500 bg-clip-text text-transparent">
                    <span className="text-[1.22em] italic font-serif text-pink-400 mr-0.5">D</span>isfruta tu ropa.
                  </span>
                </motion.h2>
                
                <motion.p 
                  variants={itemFadeUp}
                  className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md font-medium"
                >
                  Regístrate gratis en menos de un minuto y empieza a organizar tus outfits favoritos.
                </motion.p>

                {/* Call to Action Buttons */}
                <motion.div variants={itemFadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto z-30">
                  <Link
                    href="/auth"
                    className="w-full sm:w-auto px-10 py-4 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2 group"
                  >
                    <span>Entrar a Klozet gratis</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {user && (
                    <Link
                      href="/closet"
                      className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm sm:text-base bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 inline-flex items-center justify-center"
                    >
                      Ir a mi armario
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Integrated Legal Footer at the Very Bottom */}
              <motion.div 
                variants={itemFadeUp}
                className="w-full pt-4 border-t border-[var(--border-color)]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--foreground-secondary)] font-semibold max-w-5xl mx-auto"
              >
                <p className="text-[10px] sm:text-[11px] text-[var(--foreground-tertiary)]">
                  © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-[12px]">
                  <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Términos y Condiciones</span>
                  </Link>
                  <span className="text-[var(--border-color)]">•</span>
                  <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
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

      {/* 5. DISCREET FLOATING STEP DOTS (RIGHT SIDE) */}
      <nav aria-label="Progreso de página" className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-1.5 rounded-full bg-[var(--card-bg)]/60 backdrop-blur-md border border-[var(--border-color)]/40 shadow-xs">
        {Array.from({ length: totalFrames }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToFrame(idx)}
            aria-label={`Ir al fotograma ${idx + 1}`}
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
              currentFrame === idx 
                ? 'bg-[var(--brand-pink)] scale-125 shadow-xs' 
                : 'bg-[var(--foreground-tertiary)]/40 hover:bg-[var(--foreground-secondary)]'
            }`}
          />
        ))}
      </nav>
    </div>
  );
}
