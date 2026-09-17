'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck, FileText } from 'lucide-react';
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
    if (Math.abs(e.deltaY) < 30) return;
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
    if (Math.abs(deltaY) > 45) {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[900px] h-[340px] sm:h-[900px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 3. MAIN SINGLE SCREEN KEYFRAME STAGE */}
      <main className="w-full h-full flex items-center justify-center relative px-4 sm:px-8 py-6">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* KEYFRAME 0: HERO (LOGO GIGANTE DE FONDO + TEXTO & PRENDAS FLOTANTES) */}
          {/* ======================================================== */}
          {currentFrame === 0 && (
            <motion.div
              key="frame-0"
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -25 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center relative h-full max-h-[85vh]"
            >
              {/* Giant Brand Logo in Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] sm:max-w-[780px] opacity-15 sm:opacity-25 pointer-events-none -z-10">
                <Image 
                  src="/landing/klozet-nombre-grande.png" 
                  alt="Klozet Big Logo" 
                  width={900} 
                  height={320} 
                  className="w-full h-auto object-contain"
                  priority 
                />
              </div>

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xs mb-3 sm:mb-5 text-xs sm:text-sm font-extrabold text-[var(--foreground-secondary)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-pink)] animate-pulse" />
                <span>Tu armario digital definitivo</span>
              </div>

              {/* Bold Typography */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--foreground)] leading-[1.02] max-w-4xl">
                Ama tu armario. <br />
                <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
                  Vístete mejor.
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] max-w-lg font-medium leading-relaxed">
                Digitaliza tus prendas, monta outfits en lienzos libres y descubre combinaciones diarias con lo que ya tienes.
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

              {/* FLOATING GARMENTS AROUND SCREEN */}
              <div className="hidden lg:block absolute -left-8 xl:left-4 top-4 w-40 xl:w-48 pointer-events-none drop-shadow-2xl animate-float">
                <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera Scuffers" width={220} height={220} className="w-full h-auto object-contain -rotate-12" priority />
              </div>
              <div className="hidden lg:block absolute -left-4 xl:left-8 bottom-4 w-36 xl:w-44 pointer-events-none drop-shadow-2xl">
                <Image src="/landing/pantalon-blanco.png" alt="Pantalón Blanco" width={200} height={260} className="w-full h-auto object-contain rotate-6" priority />
              </div>
              <div className="hidden lg:block absolute -right-8 xl:right-4 top-4 w-40 xl:w-48 pointer-events-none drop-shadow-2xl animate-float">
                <Image src="/landing/camisa-zara-cutout.png" alt="Camisa Zara" width={220} height={220} className="w-full h-auto object-contain rotate-12" priority />
              </div>
              <div className="hidden lg:block absolute -right-4 xl:right-8 bottom-4 w-36 xl:w-44 pointer-events-none drop-shadow-2xl">
                <Image src="/landing/botas-cowboy.png" alt="Botas Cowboy" width={200} height={260} className="w-full h-auto object-contain -rotate-6" priority />
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 1: DIGITALIZACIÓN ("MERECE VERSE. MERECE LLEVARSE.") */}
          {/* ======================================================== */}
          {currentFrame === 1 && (
            <motion.div
              key="frame-1"
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -25 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center justify-center relative h-full max-h-[85vh]"
            >
              {/* Left Column: Bold Text */}
              <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-black uppercase tracking-wider mb-3 inline-block w-fit mx-auto md:mx-0">
                  Digitalización
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
                  Merecen verse. <br />
                  <span className="text-[var(--brand-pink)]">
                    Merecen llevarse.
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  Tu ropa no debería quedarse olvidada en el fondo del armario. Sube una foto y Klozet elimina el fondo al milímetro, identificando corte, tejido y color.
                </p>
              </div>

              {/* Right Column: Floating Cards Stack */}
              <div className="md:col-span-6 flex items-center justify-center relative min-h-[280px] sm:min-h-[380px]">
                
                {/* Back Tilted Card (Star Jeans) */}
                <div className="absolute -left-2 sm:left-4 top-2 w-[150px] sm:w-[210px] rounded-3xl p-3 sm:p-4 bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xl -rotate-12">
                  <div className="w-full aspect-square relative flex items-center justify-center">
                    <Image src="/landing/jeans-stars.png" alt="Jeans Stars" width={180} height={180} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-black text-center mt-1 text-[var(--foreground-secondary)]">One Dilemma Star</p>
                </div>

                {/* Scuffers Hoodie Front Hero Card */}
                <div className="relative z-10 w-[220px] sm:w-[290px] rounded-3xl p-4 sm:p-5 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] shadow-2xl rotate-2">
                  <div className="w-full aspect-square relative flex items-center justify-center mb-2">
                    <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera Scuffers" width={260} height={260} className="w-full h-full object-contain drop-shadow-xl" />
                  </div>
                  <div className="w-full pt-2 border-t border-[var(--border-color)]/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-[var(--brand-pink)] uppercase tracking-wider">Scuffers</span>
                      <h3 className="text-xs sm:text-sm font-black text-[var(--foreground)]">Boxy Hoodie Naranja</h3>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                      Sin fondo
                    </span>
                  </div>
                </div>

                {/* Golden Goose Sneaker Front Card */}
                <div className="absolute right-0 sm:right-2 bottom-0 w-[150px] sm:w-[200px] rounded-3xl p-3 bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-xl rotate-12">
                  <div className="w-full aspect-video relative flex items-center justify-center">
                    <Image src="/landing/golden-goose.png" alt="Golden Goose Sneaker" width={180} height={100} className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                  <p className="text-[10px] font-black text-center mt-1 text-[var(--brand-pink)]">Golden Goose Glitter</p>
                </div>

              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 2: LIENZO LIBRE DE CREACIÓN */}
          {/* ======================================================== */}
          {currentFrame === 2 && (
            <motion.div
              key="frame-2"
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -25 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center justify-center relative h-full max-h-[85vh]"
            >
              {/* Left Column: Bold Text */}
              <div className="md:col-span-6 text-center md:text-left order-2 md:order-1 flex flex-col justify-center">
                <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider mb-3 inline-block w-fit mx-auto md:mx-0">
                  Lienzo Creativo
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
                  Combina como <br />
                  <span className="bg-gradient-to-r from-purple-500 to-[var(--brand-pink)] bg-clip-text text-transparent">
                    un estilista.
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  Arrastra, gira y superpón tus prendas en un lienzo libre estilo moodboard. Prueba infinitas combinaciones en pantalla antes de desordenar tu habitación.
                </p>
              </div>

              {/* Right Column: Floating Canvas Card */}
              <div className="md:col-span-6 flex items-center justify-center order-1 md:order-2">
                <div className="relative w-full max-w-[280px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]/70 text-xs font-bold text-[var(--foreground-secondary)]">
                    <span className="font-black text-[var(--foreground)]">Lienzo Moodboard</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-black text-[10px]">
                      LOOK ACTIVO
                    </span>
                  </div>
                  <div className="w-full relative flex items-center justify-center py-2">
                    <Image src="/landing/outfit-canvas-clean.png" alt="Outfit Canvas" width={380} height={460} className="w-full h-auto object-contain rounded-2xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {/* ======================================================== */}
          {/* KEYFRAME 3: INSPIRACIÓN & OUTFITS REALES CHICAS / CHICOS */}
          {/* ======================================================== */}
          {currentFrame === 3 && (
            <motion.div
              key="frame-3"
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -25 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-center justify-center relative h-full max-h-[85vh]"
            >
              {/* Left Column: Bold Text */}
              <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-3 inline-block w-fit mx-auto md:mx-0">
                  Inspiración Real
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
                  Despiértate sabiendo <br />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    qué ponerte hoy.
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                  Planifica tus outfits para toda la semana, combina prendas reales y descubre inspiración auténtica de chicos y chicas con tu mismo estilo.
                </p>
              </div>

              {/* Right Column: Floating Real Model Outfits Grid */}
              <div className="md:col-span-6 flex items-center justify-center">
                <div className="relative w-full max-w-[300px] sm:max-w-[400px] rounded-3xl p-4 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col items-center gap-3">
                  
                  <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)] text-xs font-bold text-[var(--foreground-secondary)]">
                    <span className="font-black text-[var(--foreground)]">Comunidad Klozet</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-[10px]">
                      CHICOS & CHICAS
                    </span>
                  </div>

                  {/* 4 Real Outfit Photos */}
                  <div className="grid grid-cols-4 gap-2 w-full">
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chica-cookies-denim.jpg" alt="Outfit Chica Denim" fill className="object-cover" />
                    </div>
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chico-henley-pleated.jpg" alt="Outfit Chico Henley" fill className="object-cover" />
                    </div>
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chica-leopard-scarf.jpg" alt="Outfit Chica Scarf" fill className="object-cover" />
                    </div>
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                      <Image src="/landing/outfits/chico-yellow-baggy.jpg" alt="Outfit Chico Baggy" fill className="object-cover" />
                    </div>
                  </div>

                  {/* Cutout Items Strip */}
                  <div className="grid grid-cols-3 gap-2 w-full pt-1 border-t border-[var(--border-color)]/40">
                    <div className="h-12 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                      <Image src="/landing/golden-goose.png" alt="Golden Goose" width={65} height={32} className="object-contain" />
                    </div>
                    <div className="h-12 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                      <Image src="/landing/sudadera-scuffers-cutout.png" alt="Scuffers" width={48} height={48} className="object-contain" />
                    </div>
                    <div className="h-12 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                      <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka" width={52} height={52} className="object-contain" />
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-[var(--foreground-secondary)] font-semibold">
                    Streetwear, Quiet Luxury & Clean Look
                  </p>
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
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -25 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center text-center h-full max-h-[85vh] py-4"
            >
              <div className="my-auto w-full p-6 sm:p-10 rounded-3xl bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl flex flex-col items-center">
                
                <div className="mb-3">
                  <Image 
                    src="/landing/klozet-nombre-grande.png" 
                    alt="Klozet" 
                    width={180} 
                    height={60} 
                    className="h-8 sm:h-12 w-auto object-contain mx-auto" 
                  />
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                  Tu armario en tu bolsillo.
                </h2>
                
                <p className="mt-3 text-xs sm:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-md font-medium">
                  Regístrate gratis en menos de un minuto y empieza a organizar tus looks favoritos sin complicaciones.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/auth"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2 group"
                  >
                    <span>Entrar a Klozet gratis</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {user && (
                    <Link
                      href="/closet"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-sm sm:text-base bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 inline-flex items-center justify-center"
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

      {/* 5. SUBTLE BOTTOM SCROLL DOWN PROMPT (Only on first frames) */}
      {currentFrame < totalFrames - 1 && (
        <div 
          onClick={nextFrame}
          className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-0.5 text-[10px] font-bold text-[var(--foreground-tertiary)] uppercase tracking-widest cursor-pointer hover:text-[var(--brand-pink)] transition-colors"
        >
          <span>Desliza</span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--brand-pink)] animate-bounce" />
        </div>
      )}
    </div>
  );
}



