'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles,
  Camera,
  Layers,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress to calculate active step
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate active step smoothly without collisions
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.18) setActiveStep(0);
      else if (latest < 0.44) setActiveStep(1);
      else if (latest < 0.70) setActiveStep(2);
      else if (latest < 0.90) setActiveStep(3);
      else setActiveStep(4);
    });
  }, [scrollYProgress]);

  // Header auto-hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Manual step navigation
  const scrollToStep = (index: number) => {
    if (!containerRef.current) return;
    const targetScroll = (index / 4) * (containerRef.current.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: containerRef.current.offsetTop + targetScroll,
      behavior: 'smooth'
    });
  };

  const stepsList = [
    { label: "Inicio", idx: 0 },
    { label: "Digitaliza", idx: 1 },
    { label: "Lienzo", idx: 2 },
    { label: "Planifica", idx: 3 },
    { label: "Empieza", idx: 4 }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between antialiased">
      
      {/* 1. SMART STICKY HEADER */}
      <AnimatePresence>
        {showHeader && (
          <motion.header 
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 w-full apple-glass-bar border-b border-[var(--border-color)]/40 shadow-xs"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 focus:outline-none select-none">
                <Image 
                  src="/klozet-logo.png" 
                  alt="Klozet Logo" 
                  width={110} 
                  height={32} 
                  className="dark:hidden block object-contain h-7 w-auto" 
                  priority 
                />
                <Image 
                  src="/klozet-logo-dark.png" 
                  alt="Klozet Logo" 
                  width={110} 
                  height={32} 
                  className="hidden dark:block object-contain h-7 w-auto" 
                  priority 
                />
              </Link>

              {/* Progress Indicator Dots / Steps */}
              <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[var(--card-bg)]/80 border border-[var(--border-color)] shadow-xs">
                {stepsList.map((step) => (
                  <button
                    key={step.idx}
                    onClick={() => scrollToStep(step.idx)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeStep === step.idx 
                        ? 'bg-[var(--brand-pink)] text-white shadow-xs scale-105' 
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {user ? (
                  <Link 
                    href="/closet" 
                    className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Mi Armario</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/auth" 
                      className="hidden sm:inline-block text-xs sm:text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors px-3 py-2"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      href="/auth" 
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Entrar gratis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 2. SCROLL-DRIVEN CONTAINER (400vh FOR CONTROLLED SMOOTH PACING) */}
      <div ref={containerRef} className="relative h-[380vh] w-full">
        
        {/* Sticky viewport frame */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* MOBILE STEP PROGRESS PILLS (Visible on small screens) */}
          <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xs">
            {stepsList.map((step) => (
              <button
                key={step.idx}
                onClick={() => scrollToStep(step.idx)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeStep === step.idx 
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs' 
                    : 'text-[var(--foreground-tertiary)]'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          {/* SINGLE ISOLATED ACTIVE FRAME VIA ANIMATE PRESENCE (ZERO OVERLAP GUARANTEED) */}
          <div className="w-full max-w-6xl mx-auto flex items-center justify-center relative min-h-[480px]">
            <AnimatePresence mode="wait">
              
              {/* ======================================================== */}
              {/* FRAME 0: HERO */}
              {/* ======================================================== */}
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full text-center flex flex-col items-center justify-center relative py-6"
                >
                  {/* Eyebrow */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xs mb-5 text-xs sm:text-sm font-bold text-[var(--foreground-secondary)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse" />
                    <span>Tu armario digital. Sin dramas cada mañana.</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-6xl md:text-7xl font-black tracking-tight text-[var(--foreground)] leading-[1.06] max-w-4xl">
                    Vístete mejor con <br />
                    <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
                      lo que ya tienes.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] max-w-lg font-normal leading-relaxed">
                    Digitaliza tus prendas en segundos, monta outfits en un lienzo libre y planifica tu semana sin desordenar tu habitación.
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto z-20">
                    <Link
                      href="/auth"
                      className="w-full sm:w-auto px-7 py-3.5 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                      <span>Empezar mi armario gratis</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                      onClick={() => scrollToStep(1)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-sm sm:text-base bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Ver cómo funciona</span>
                      <ChevronDown className="w-4 h-4 text-[var(--brand-pink)]" />
                    </button>
                  </div>

                  {/* Floating Transparent Cutouts (Left & Right on Desktop) */}
                  <div className="hidden lg:block absolute -left-4 xl:left-8 top-4 w-36 xl:w-44 pointer-events-none drop-shadow-xl animate-float">
                    <Image 
                      src="/landing/sudadera-scuffers-cutout.png" 
                      alt="Sudadera Scuffers Cutout" 
                      width={200} 
                      height={200} 
                      className="w-full h-auto object-contain -rotate-6"
                      priority 
                    />
                  </div>

                  <div className="hidden lg:block absolute -left-2 xl:left-12 bottom-0 w-32 xl:w-38 pointer-events-none drop-shadow-xl">
                    <Image 
                      src="/landing/pantalon-blanco.png" 
                      alt="Pantalón Blanco Cutout" 
                      width={180} 
                      height={240} 
                      className="w-full h-auto object-contain rotate-6"
                      priority 
                    />
                  </div>

                  <div className="hidden lg:block absolute -right-4 xl:right-8 top-4 w-36 xl:w-44 pointer-events-none drop-shadow-xl animate-float">
                    <Image 
                      src="/landing/camisa-zara-cutout.png" 
                      alt="Camisa Zara Cutout" 
                      width={200} 
                      height={200} 
                      className="w-full h-auto object-contain rotate-6"
                      priority 
                    />
                  </div>

                  <div className="hidden lg:block absolute -right-2 xl:right-12 bottom-0 w-32 xl:w-38 pointer-events-none drop-shadow-xl">
                    <Image 
                      src="/landing/botas-cowboy.png" 
                      alt="Botas Cowboy Cutout" 
                      width={180} 
                      height={240} 
                      className="w-full h-auto object-contain -rotate-6"
                      priority 
                    />
                  </div>

                  {/* Scroll Down Cue */}
                  <div 
                    onClick={() => scrollToStep(1)}
                    className="mt-8 flex flex-col items-center gap-1 text-[10px] font-bold text-[var(--foreground-tertiary)] uppercase tracking-widest cursor-pointer hover:text-[var(--brand-pink)] transition-colors"
                  >
                    <span>Desliza para ver la magia</span>
                    <ChevronDown className="w-4 h-4 animate-bounce text-[var(--brand-pink)]" />
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* FRAME 1: DIGITALIZACIÓN EN 1 CLICK */}
              {/* ======================================================== */}
              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center"
                >
                  {/* Left Column: Text */}
                  <div className="text-center md:text-left">
                    <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
                      Paso 01 • Digitalización
                    </span>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                      Haz una foto. <br />
                      <span className="text-[var(--brand-pink)]">Fondo eliminado al instante.</span>
                    </h2>
                    <p className="mt-3 text-xs sm:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0">
                      Sube cualquier prenda desde tu móvil. Klozet recorta el fondo al milímetro y organiza la marca, color, tejido y temporada en tu armario.
                    </p>

                    <div className="mt-5 flex flex-col gap-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] items-center md:items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Corte 100% transparente sin fondos molestos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Zara, Scuffers, Nike, ASOS y cualquier marca</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visual Clean Card */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-[280px] sm:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 flex flex-col items-center">
                      <div className="w-full aspect-square relative flex items-center justify-center mb-3">
                        <Image 
                          src="/landing/sudadera-scuffers-cutout.png" 
                          alt="Sudadera Scuffers Cutout" 
                          width={260} 
                          height={260} 
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      <div className="w-full text-left pt-2 border-t border-[var(--border-color)]/60">
                        <span className="text-[10px] font-bold text-[var(--brand-pink)] uppercase tracking-wider">Scuffers</span>
                        <h3 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">Sudadera Scuffers Boxy</h3>
                        <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] font-medium text-[var(--foreground-secondary)]">
                          <span className="px-2 py-1 rounded bg-[var(--background-secondary)]">👕 Jersey / Hoodie</span>
                          <span className="px-2 py-1 rounded bg-[var(--background-secondary)]">🏷️ Talla L</span>
                          <span className="px-2 py-1 rounded bg-[var(--background-secondary)]">🔴 Rojo / Naranja</span>
                          <span className="px-2 py-1 rounded bg-[var(--background-secondary)]">✨ Algodón</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* FRAME 2: LIENZO LIBRE DE CREACIÓN */}
              {/* ======================================================== */}
              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center"
                >
                  {/* Left Column: Text */}
                  <div className="text-center md:text-left order-2 md:order-1">
                    <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
                      Paso 02 • Lienzo Interactivo
                    </span>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                      Monta tus fits <br />
                      <span className="bg-gradient-to-r from-purple-500 to-[var(--brand-pink)] bg-clip-text text-transparent">
                        como un estilista.
                      </span>
                    </h2>
                    <p className="mt-3 text-xs sm:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0">
                      Arrastra, gira y superpón prendas con libertad absoluta. Encuentra combinaciones únicas en tu pantalla antes de desordenar tu cuarto.
                    </p>

                    <div className="mt-5 flex flex-col gap-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] items-center md:items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Lienzo libre estilo moodboard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Guarda outfits completos en 1 toque</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Clean Canvas Preview */}
                  <div className="flex items-center justify-center order-1 md:order-2">
                    <div className="relative w-full max-w-[280px] sm:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3 flex items-center justify-center">
                      <Image 
                        src="/landing/outfit-canvas-clean.png" 
                        alt="Outfit Canvas Scuffers + Onitsuka" 
                        width={360} 
                        height={460} 
                        className="w-full h-auto object-contain rounded-2xl"
                      />
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* FRAME 3: PLANIFICADOR & LOOKBOOK */}
              {/* ======================================================== */}
              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center"
                >
                  {/* Left Column: Text */}
                  <div className="text-center md:text-left">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
                      Paso 03 • Planificación Semanal
                    </span>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                      Despiértate sabiendo <br />
                      <span className="text-emerald-600 dark:text-emerald-400">qué ponerte hoy.</span>
                    </h2>
                    <p className="mt-3 text-xs sm:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0">
                      Asigna outfits a días específicos en el calendario. Ahorra 15 minutos cada mañana y sal de casa con la seguridad de un conjunto perfecto.
                    </p>

                    <div className="mt-5 flex flex-col gap-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] items-center md:items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Agenda looks para el trabajo, cena o finde</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Asesoría de estilo 24/7 con Kloe</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 6 Items Clean Cutouts Grid */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-[280px] sm:max-w-sm rounded-3xl p-4 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col items-center gap-3">
                      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)] text-xs font-bold text-[var(--foreground-secondary)]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                          Planificador Semanal
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black text-[10px]">
                          LOOKS AGENDADOS
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full">
                        <div className="aspect-square relative rounded-xl bg-[var(--background-secondary)]/60 p-2 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/studio-longsleeve.png" alt="Studio Navy" width={90} height={90} className="object-contain w-full h-full" />
                        </div>
                        <div className="aspect-square relative rounded-xl bg-[var(--background-secondary)]/60 p-2 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/jeans-stars.png" alt="Star Denim" width={90} height={90} className="object-contain w-full h-full" />
                        </div>
                        <div className="aspect-square relative rounded-xl bg-[var(--background-secondary)]/60 p-2 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka Tiger" width={90} height={90} className="object-contain w-full h-full" />
                        </div>
                        <div className="aspect-square relative rounded-xl bg-[var(--background-secondary)]/60 p-2 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/pantalon-blanco.png" alt="Pantalón Blanco" width={90} height={90} className="object-contain w-full h-full" />
                        </div>
                        <div className="aspect-square relative rounded-xl bg-[var(--background-secondary)]/60 p-2 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/botas-cowboy.png" alt="Botas Cowboy" width={90} height={90} className="object-contain w-full h-full" />
                        </div>
                        <div className="aspect-square relative rounded-xl bg-[var(--background-secondary)]/60 p-2 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/sudadera-scuffers-cutout.png" alt="Scuffers Hoodie" width={90} height={90} className="object-contain w-full h-full" />
                        </div>
                      </div>

                      <p className="text-[10px] text-center text-[var(--foreground-secondary)] font-semibold">
                        Streetwear & Western Chic • Combinaciones listas
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* FRAME 4: CTA FINAL */}
              {/* ======================================================== */}
              {activeStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-xl w-full text-center p-8 sm:p-12 rounded-3xl bg-[var(--card-bg)]/90 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl"
                >
                  <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-4 inline-block">
                    Tu armario en tu bolsillo
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                    Empieza hoy gratis
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                    Sin anuncios, sin compras forzadas y en menos de 1 minuto con tu cuenta de Google.
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row justify-center items-center gap-3">
                    <Link
                      href="/auth"
                      className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2"
                    >
                      <span>Crear mi armario gratis</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* STEP CONTROLS (Prev / Next Buttons on bottom of viewport) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            <button
              onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="p-2 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              aria-label="Paso anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-black text-[var(--foreground-secondary)] tracking-wider">
              0{activeStep + 1} / 05
            </span>

            <button
              onClick={() => scrollToStep(Math.min(4, activeStep + 1))}
              disabled={activeStep === 4}
              className="p-2 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              aria-label="Siguiente paso"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. CLEAN FOOTER */}
      <footer className="border-t border-[var(--border-color)]/60 bg-[var(--card-bg)]/60 py-10 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
            <Image 
              src="/klozet-logo.png" 
              alt="Klozet Logo" 
              width={90} 
              height={26} 
              className="dark:hidden block object-contain" 
            />
            <Image 
              src="/klozet-logo-dark.png" 
              alt="Klozet Logo" 
              width={90} 
              height={26} 
              className="hidden dark:block object-contain" 
            />
            <p className="text-[11px] text-[var(--foreground-tertiary)]">
              © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
            </p>
          </div>

          {/* Quick links & Legal */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--foreground-secondary)] font-semibold">
            <Link href="/auth" className="hover:text-[var(--foreground)] transition-colors">
              Iniciar Sesión
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">
              Privacidad
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors">
              Términos
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
      </footer>
    </div>
  );
}



