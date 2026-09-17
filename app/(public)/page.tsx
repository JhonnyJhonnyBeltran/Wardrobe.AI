'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText, Sparkles } from 'lucide-react';
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
    if (Math.abs(deltaY) > 40) {
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

      {/* 2. AMBIENT BACKDROP LIGHTING */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[850px] h-[340px] sm:h-[850px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 3. MAIN SINGLE SCREEN KEYFRAME STAGE */}
      <main className="w-full h-full flex items-center justify-center relative px-4 sm:px-8 py-6">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* KEYFRAME 0: TYPOGRAPHIC MAXIMALISM - EL PROBLEMA */}
          {/* ======================================================== */}
          {currentFrame === 0 && (
            <motion.div
              key="frame-0"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative h-full max-h-[90vh]"
            >
              {/* Brand Logo in Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] sm:max-w-[820px] opacity-10 sm:opacity-15 pointer-events-none -z-10">
                <Image 
                  src="/landing/klozet-nombre-grande.png" 
                  alt="Klozet" 
                  width={900} 
                  height={320} 
                  className="w-full h-auto object-contain"
                  priority 
                />
              </div>

              {/* MONUMENTAL TYPOGRAPHY */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.8rem] font-black tracking-tighter uppercase leading-[0.88] text-[var(--foreground)]">
                  Armario Lleno.
                </h1>
                <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.8rem] font-black tracking-tighter uppercase leading-[0.88] bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-1 sm:mt-2">
                  Nada que ponerte.
                </h2>
              </div>

              {/* Punchy Narrative Text */}
              <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] max-w-md sm:max-w-xl font-medium leading-snug z-10">
                Todas las mañanas el mismo lío frente al espejo. Klozet organiza tu ropa y te dice exactamente qué ponerte.
              </p>

              <div className="mt-6 sm:mt-8 flex items-center gap-3 z-20">
                <Link
                  href={user ? "/closet" : "/auth"}
                  className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 flex items-center gap-2 group"
                >
                  <span>{user ? "Ir a mi armario" : "Empezar gratis"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* LAYERED FLOATING FASHION PIECES */}
              <div className="hidden lg:block absolute left-2 xl:left-8 top-10 w-44 xl:w-52 pointer-events-none drop-shadow-2xl animate-float z-0">
                <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera Scuffers" width={240} height={240} className="w-full h-auto object-contain -rotate-12" priority />
              </div>
              <div className="hidden lg:block absolute left-8 xl:left-16 bottom-8 w-36 xl:w-44 pointer-events-none drop-shadow-2xl z-0">
                <Image src="/landing/pantalon-blanco.png" alt="Pantalón Blanco" width={200} height={260} className="w-full h-auto object-contain rotate-6" priority />
              </div>
              <div className="hidden lg:block absolute right-2 xl:right-8 top-10 w-44 xl:w-52 pointer-events-none drop-shadow-2xl animate-float z-0">
                <Image src="/landing/studio-longsleeve.png" alt="Studio Longsleeve" width={240} height={240} className="w-full h-auto object-contain rotate-12" priority />
              </div>
              <div className="hidden lg:block absolute right-8 xl:right-16 bottom-8 w-36 xl:w-44 pointer-events-none drop-shadow-2xl z-0">
                <Image src="/landing/botas-cowboy.png" alt="Botas Cowboy" width={200} height={260} className="w-full h-auto object-contain -rotate-6" priority />
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 1: TYPOGRAPHIC MAXIMALISM - DIGITALIZACIÓN */}
          {/* ======================================================== */}
          {currentFrame === 1 && (
            <motion.div
              key="frame-1"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center justify-center relative h-full max-h-[90vh]"
            >
              {/* Left Column: Monumental Headline */}
              <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                <h2 className="text-5xl sm:text-7xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.88] text-[var(--foreground)]">
                  Toda tu ropa.
                </h2>
                <h3 className="text-5xl sm:text-7xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.88] text-[var(--brand-pink)] mt-1">
                  En un toque.
                </h3>
                <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  Saca una foto y el fondo desaparece al instante. Tu ropa real ordenada y lista para combinar.
                </p>
              </div>

              {/* Right Column: Layered Editorial Stack */}
              <div className="md:col-span-6 flex items-center justify-center relative min-h-[290px] sm:min-h-[400px]">
                
                {/* Back Tilted Card (Star Jeans) */}
                <div className="absolute -left-2 sm:left-4 top-2 w-[160px] sm:w-[220px] rounded-3xl p-3 sm:p-4 bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xl -rotate-12 transition-transform hover:-rotate-6">
                  <div className="w-full aspect-square relative flex items-center justify-center">
                    <Image src="/landing/jeans-stars.png" alt="Jeans Stars" width={180} height={180} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-black text-center mt-1 text-[var(--foreground-secondary)] uppercase tracking-wider">Star Denim</p>
                </div>

                {/* Scuffers Hoodie Front Hero Card */}
                <div className="relative z-10 w-[230px] sm:w-[310px] rounded-3xl p-4 sm:p-5 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] shadow-2xl rotate-2 transition-transform hover:rotate-0">
                  <div className="w-full aspect-square relative flex items-center justify-center mb-2">
                    <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera Scuffers" width={280} height={280} className="w-full h-full object-contain drop-shadow-xl" />
                  </div>
                  <div className="w-full pt-2 border-t border-[var(--border-color)]/70 flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Scuffers Orange Hoodie</h4>
                  </div>
                </div>

                {/* Golden Goose Sneaker Front Card */}
                <div className="absolute right-0 sm:right-2 bottom-0 w-[160px] sm:w-[220px] rounded-3xl p-3 sm:p-4 bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-xl rotate-12 transition-transform hover:rotate-6">
                  <div className="w-full aspect-video relative flex items-center justify-center">
                    <Image src="/landing/golden-goose.png" alt="Golden Goose" width={190} height={110} className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                  <p className="text-[10px] font-black text-center mt-1 text-[var(--brand-pink)] uppercase tracking-wider">Golden Goose</p>
                </div>

              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 2: TYPOGRAPHIC MAXIMALISM - PROTAGONISTA KLOE */}
          {/* ======================================================== */}
          {currentFrame === 2 && (
            <motion.div
              key="frame-2"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center justify-center relative h-full max-h-[90vh]"
            >
              {/* Left Column: Monumental Narrative */}
              <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                <h2 className="text-5xl sm:text-7xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.88] text-[var(--foreground)]">
                  ¿Qué me pongo?
                </h2>
                <h3 className="text-5xl sm:text-7xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.88] bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-1">
                  Kloe te ayuda.
                </h3>
                <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  Dile a dónde vas o cómo te sientes. Kloe mira tus fotos reales y te crea combinaciones perfectas al segundo.
                </p>
              </div>

              {/* Right Column: KLOE HERO CHARACTER WITH ATMOSPHERIC GLOW */}
              <div className="md:col-span-6 flex items-center justify-center relative">
                
                {/* Glowing Aura / Ambient Pulse */}
                <div className="absolute w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-gradient-to-tr from-[var(--brand-pink)]/35 to-purple-500/30 blur-3xl animate-pulse pointer-events-none" />
                
                {/* Subtle Orbital Ring */}
                <div className="absolute w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full border border-[var(--brand-pink)]/30 animate-[spin_20s_linear_infinite] pointer-events-none" />

                {/* Main Kloe Graphic in High Polish */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-[260px] sm:w-[360px] flex items-center justify-center p-4 drop-shadow-[0_20px_45px_rgba(255,45,120,0.4)]"
                >
                  <Image 
                    src="/landing/kloe-grande-landing.png" 
                    alt="Kloe Stylist" 
                    width={460} 
                    height={460} 
                    className="w-full h-auto object-contain"
                    priority 
                  />
                  
                  {/* Floating Outfit Pill */}
                  <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-xl flex items-center gap-2 text-xs font-black text-[var(--foreground)] whitespace-nowrap">
                    <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
                    <span>Look armado en 3 segundos</span>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 3: TYPOGRAPHIC MAXIMALISM - MONTA TU FIT */}
          {/* ======================================================== */}
          {currentFrame === 3 && (
            <motion.div
              key="frame-3"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center justify-center relative h-full max-h-[90vh]"
            >
              {/* Left Column: Monumental Headline */}
              <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                <h2 className="text-5xl sm:text-7xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.88] text-[var(--foreground)]">
                  Monta tu fit.
                </h2>
                <h3 className="text-5xl sm:text-7xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.88] text-purple-500 mt-1">
                  Listo para hoy.
                </h3>
                <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  Prueba combinaciones en el lienzo libre, guarda tus favoritas y sal de casa sabiendo qué ponerte.
                </p>
              </div>

              {/* Right Column: Clean Editorial Lookbook Card */}
              <div className="md:col-span-6 flex items-center justify-center">
                <div className="relative w-full max-w-[320px] sm:max-w-[420px] rounded-3xl p-4 sm:p-5 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col items-center gap-3">
                  
                  {/* Real Inspiration Models */}
                  <div className="grid grid-cols-4 gap-2 w-full">
                    <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chica-cookies-denim.jpg" alt="Fit Denim" fill className="object-cover" />
                    </div>
                    <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chico-henley-pleated.jpg" alt="Fit Henley" fill className="object-cover" />
                    </div>
                    <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chica-leopard-scarf.jpg" alt="Fit Scarf" fill className="object-cover" />
                    </div>
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chico-yellow-baggy.jpg" alt="Fit Baggy" fill className="object-cover" />
                    </div>
                  </div>

                  {/* Cutout Items Strip */}
                  <div className="grid grid-cols-3 gap-2 w-full pt-1 border-t border-[var(--border-color)]/40">
                    <div className="h-14 relative rounded-2xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                      <Image src="/landing/golden-goose.png" alt="Golden Goose" width={70} height={35} className="object-contain" />
                    </div>
                    <div className="h-14 relative rounded-2xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                      <Image src="/landing/sudadera-scuffers-cutout.png" alt="Scuffers" width={52} height={52} className="object-contain" />
                    </div>
                    <div className="h-14 relative rounded-2xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                      <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka" width={56} height={56} className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 4: TYPOGRAPHIC MAXIMALISM - ACCESO Y CIERRE */}
          {/* ======================================================== */}
          {currentFrame === 4 && (
            <motion.div
              key="frame-4"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl mx-auto flex flex-col justify-between items-center text-center h-full max-h-[90vh] py-4"
            >
              <div className="my-auto w-full p-6 sm:p-12 rounded-3xl bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl flex flex-col items-center">
                
                <div className="mb-4">
                  <Image 
                    src="/landing/klozet-nombre-grande.png" 
                    alt="Klozet" 
                    width={200} 
                    height={70} 
                    className="h-10 sm:h-14 w-auto object-contain mx-auto" 
                  />
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.92]">
                  Vístete mejor. <br />
                  <span className="bg-gradient-to-r from-[var(--brand-pink)] to-purple-500 bg-clip-text text-transparent">
                    Disfruta tu ropa.
                  </span>
                </h2>
                
                <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md font-medium">
                  Regístrate gratis en menos de un minuto y empieza a organizar tus outfits favoritos.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
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
                </div>
              </div>

              {/* INTEGRATED LEGAL FOOTER */}
              <div className="w-full pt-4 border-t border-[var(--border-color)]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--foreground-secondary)] font-semibold">
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
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 4. DISCREET FLOATING STEP DOTS (RIGHT SIDE) */}
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





