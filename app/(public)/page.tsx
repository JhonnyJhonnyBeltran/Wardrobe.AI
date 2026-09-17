'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles,
  Camera,
  Layers,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress across the main keyframe sequence
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate active step based on scroll progress
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.22) setActiveStep(0);
      else if (latest < 0.48) setActiveStep(1);
      else if (latest < 0.74) setActiveStep(2);
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

  // Keyframe Transform Animations
  // Frame 0: Hero
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18, 0.24], [1, 1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.22], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, -40]);

  // Floating clothing items in Hero
  const floatTopY = useTransform(scrollYProgress, [0, 0.22], [0, -120]);
  const floatBotY = useTransform(scrollYProgress, [0, 0.22], [0, 100]);
  const floatRotate1 = useTransform(scrollYProgress, [0, 0.22], [-6, -18]);
  const floatRotate2 = useTransform(scrollYProgress, [0, 0.22], [8, 22]);

  // Frame 1: Digitalize & Auto-cutout (0.22 - 0.48)
  const frame1Opacity = useTransform(scrollYProgress, [0.22, 0.28, 0.42, 0.48], [0, 1, 1, 0]);
  const frame1Y = useTransform(scrollYProgress, [0.22, 0.28, 0.42, 0.48], [40, 0, 0, -40]);
  const frame1Scale = useTransform(scrollYProgress, [0.22, 0.28, 0.42, 0.48], [0.92, 1, 1, 0.94]);

  // Frame 2: Outfit Canvas Studio (0.48 - 0.74)
  const frame2Opacity = useTransform(scrollYProgress, [0.48, 0.54, 0.68, 0.74], [0, 1, 1, 0]);
  const frame2Y = useTransform(scrollYProgress, [0.48, 0.54, 0.68, 0.74], [40, 0, 0, -40]);
  const frame2Scale = useTransform(scrollYProgress, [0.48, 0.54, 0.68, 0.74], [0.92, 1, 1, 0.94]);

  // Frame 3: Calendar & Planning (0.74 - 0.90)
  const frame3Opacity = useTransform(scrollYProgress, [0.74, 0.79, 0.86, 0.91], [0, 1, 1, 0]);
  const frame3Y = useTransform(scrollYProgress, [0.74, 0.79, 0.86, 0.91], [40, 0, 0, -40]);

  // Frame 4: Final CTA (0.90 - 1.0)
  const frame4Opacity = useTransform(scrollYProgress, [0.90, 0.95, 1], [0, 1, 1]);
  const frame4Y = useTransform(scrollYProgress, [0.90, 0.95, 1], [40, 0, 0]);

  // Direct manual jump to step
  const scrollToStep = (index: number) => {
    if (!containerRef.current) return;
    const targetScroll = (index / 4) * (containerRef.current.scrollHeight - window.innerHeight);
    window.scrollTo({
      top: containerRef.current.offsetTop + targetScroll,
      behavior: 'smooth'
    });
  };

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
            className="fixed top-0 left-0 right-0 z-50 w-full apple-glass-bar border-b border-[var(--border-color)]/40 shadow-sm"
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

              {/* Progress Indicator Dots */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg)]/80 border border-[var(--border-color)] shadow-xs">
                {[
                  { label: "Inicio", idx: 0 },
                  { label: "Digitaliza", idx: 1 },
                  { label: "Lienzo", idx: 2 },
                  { label: "Planifica", idx: 3 },
                  { label: "Empieza", idx: 4 }
                ].map((step) => (
                  <button
                    key={step.idx}
                    onClick={() => scrollToStep(step.idx)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeStep === step.idx 
                        ? 'bg-[var(--brand-pink)] text-white shadow-xs' 
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

      {/* 2. SCROLL-DRIVEN KEYFRAME CONTAINER */}
      <div ref={containerRef} className="relative h-[420vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[750px] h-[350px] sm:h-[750px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* ======================================================== */}
          {/* FRAME 0: HERO (Logo, Minimal Punchy Headline, Floating Clothes) */}
          {/* ======================================================== */}
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center pointer-events-auto"
          >
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xs mb-6 text-xs sm:text-sm font-bold text-[var(--foreground-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse" />
              <span>Tu armario digital. Sin dramas cada mañana.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tight text-[var(--foreground)] leading-[1.04] max-w-4xl">
              Vístete mejor con <br />
              <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
                lo que ya tienes.
              </span>
            </h1>

            {/* Short Minimal Subtitle */}
            <p className="mt-5 text-base sm:text-xl text-[var(--foreground-secondary)] max-w-xl font-normal leading-relaxed">
              Digitaliza tus prendas en segundos, monta outfits en un lienzo libre y planifica tu semana sin desordenar tu habitación.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto z-20">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Empezar mi armario gratis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => scrollToStep(1)}
                className="w-full sm:w-auto px-6 py-4 rounded-full font-bold text-sm sm:text-base bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ver cómo funciona</span>
                <ChevronDown className="w-4 h-4 text-[var(--brand-pink)]" />
              </button>
            </div>

            {/* Floating Cutout Garments (Left & Right) */}
            <motion.div 
              style={{ y: floatTopY, rotate: floatRotate1 }}
              className="hidden lg:block absolute left-12 xl:left-24 top-1/4 w-44 xl:w-56 pointer-events-none drop-shadow-2xl"
            >
              <Image 
                src="/landing/sudadera-scuffers.png" 
                alt="Sudadera Scuffers" 
                width={320} 
                height={400} 
                className="w-full h-auto object-contain rounded-3xl"
                priority 
              />
            </motion.div>

            <motion.div 
              style={{ y: floatBotY, rotate: floatRotate2 }}
              className="hidden lg:block absolute right-12 xl:right-24 top-1/4 w-44 xl:w-56 pointer-events-none drop-shadow-2xl"
            >
              <Image 
                src="/landing/camisa-zara.png" 
                alt="Camisa Zara" 
                width={320} 
                height={400} 
                className="w-full h-auto object-contain rounded-3xl"
                priority 
              />
            </motion.div>

            {/* Scroll Indicator at bottom */}
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="absolute bottom-6 flex flex-col items-center gap-1 text-[11px] font-bold text-[var(--foreground-tertiary)] uppercase tracking-widest cursor-pointer"
              onClick={() => scrollToStep(1)}
            >
              <span>Desliza para ver la magia</span>
              <ChevronDown className="w-4 h-4 text-[var(--brand-pink)]" />
            </motion.div>
          </motion.div>


          {/* ======================================================== */}
          {/* FRAME 1: DIGITALIZA EN SEGUNDOS (FOTO & RECORTE) */}
          {/* ======================================================== */}
          <motion.div 
            style={{ opacity: frame1Opacity, y: frame1Y, scale: frame1Scale }}
            className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none"
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center pointer-events-auto">
              
              {/* Left Column: Text & Bullet points */}
              <div className="text-left">
                <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-4 inline-block">
                  Paso 01 • Digitalización Instantánea
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                  Haz una foto. <br />
                  <span className="text-[var(--brand-pink)]">Fondo eliminado al instante.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                  Sube cualquier prenda desde tu cámara o galería. Klozet recorta el fondo automáticamente y clasifica la marca, color, tejido y temporada en una ficha ultra limpia.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Corte nítido sin fondos molestos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Compatible con marcas como Zara, Scuffers, Nike, ASOS</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Card of Sudadera Scuffers / Camisa Zara */}
              <div className="flex items-center justify-center relative">
                <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)]">
                  <Image 
                    src="/landing/sudadera-scuffers.png" 
                    alt="Ficha de Sudadera Scuffers" 
                    width={480} 
                    height={600} 
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

            </div>
          </motion.div>


          {/* ======================================================== */}
          {/* FRAME 2: LIENZO LIBRE DE CREACIÓN (OUTFIT CANVAS) */}
          {/* ======================================================== */}
          <motion.div 
            style={{ opacity: frame2Opacity, y: frame2Y, scale: frame2Scale }}
            className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none"
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center pointer-events-auto">
              
              {/* Left Column: Text */}
              <div className="text-left order-2 md:order-1">
                <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider mb-4 inline-block">
                  Paso 02 • Lienzo Interactivo
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                  Monta tus fits <br />
                  <span className="bg-gradient-to-r from-purple-500 to-[var(--brand-pink)] bg-clip-text text-transparent">
                    como un estilista.
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                  Arrastra, gira, cambia el tamaño y superpón capas con libertad total. Prueba combinaciones arriesgadas en tu pantalla antes de desordenar tu habitación.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">
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
                    <span>Guarda combinaciones infinitas con 1 toque</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Outfit Canvas Preview */}
              <div className="flex items-center justify-center relative order-1 md:order-2">
                <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 flex items-center justify-center">
                  <Image 
                    src="/landing/outfit-canvas.png" 
                    alt="Lienzo de Outfit Scuffers + Polo + Onitsuka" 
                    width={480} 
                    height={600} 
                    className="w-full h-auto object-contain rounded-2xl"
                  />
                </div>
              </div>

            </div>
          </motion.div>


          {/* ======================================================== */}
          {/* FRAME 3: PLANIFICA & ASESÓRATE */}
          {/* ======================================================== */}
          <motion.div 
            style={{ opacity: frame3Opacity, y: frame3Y }}
            className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none"
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center pointer-events-auto">
              
              {/* Left Column: Text */}
              <div className="text-left">
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-4 inline-block">
                  Paso 03 • Planificación & Kloe
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                  Despiértate sabiendo <br />
                  <span className="text-emerald-600 dark:text-emerald-400">qué ponerte hoy.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                  Asigna outfits en el calendario para el trabajo, una cena o el fin de semana. Además, pídele a Kloe combinaciones adaptadas al clima y a la ocasión con tu propia ropa.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Ahorra 15 minutos cada mañana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Asesoría personalizada 24/7 de pies a cabeza</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Showcase (Studio Longsleeve + Jeans Stars) */}
              <div className="flex items-center justify-center relative">
                <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl p-6 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col items-center gap-4">
                  <div className="w-full flex items-center justify-between pb-3 border-b border-[var(--border-color)] text-xs font-bold text-[var(--foreground-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[var(--brand-pink)]" />
                      Outfit para hoy • Viernes
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px]">
                      LISTO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="aspect-square relative rounded-2xl bg-[var(--background-secondary)]/50 p-2 flex items-center justify-center border border-[var(--border-color)]/50">
                      <Image 
                        src="/landing/studio-longsleeve.png" 
                        alt="Studio Longsleeve" 
                        width={200} 
                        height={200} 
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="aspect-square relative rounded-2xl bg-[var(--background-secondary)]/50 p-2 flex items-center justify-center border border-[var(--border-color)]/50">
                      <Image 
                        src="/landing/jeans-stars.png" 
                        alt="Jeans Stars One Dilemma" 
                        width={200} 
                        height={200} 
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-center text-[var(--foreground-secondary)] font-medium">
                    Streetwear Fit • Studio Longsleeve + One Dilemma Star Denim
                  </p>
                </div>
              </div>

            </div>
          </motion.div>


          {/* ======================================================== */}
          {/* FRAME 4: FINAL CTA */}
          {/* ======================================================== */}
          <motion.div 
            style={{ opacity: frame4Opacity, y: frame4Y }}
            className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none"
          >
            <div className="max-w-2xl w-full text-center pointer-events-auto p-8 sm:p-12 rounded-3xl bg-[var(--card-bg)]/90 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl">
              <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-4 inline-block">
                Tu armario en tu bolsillo
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                Empieza hoy gratis
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                Sin anuncios, sin compras forzadas y en menos de 1 minuto con tu cuenta de Google.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
                <Link
                  href="/auth"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2"
                >
                  <span>Crear mi armario gratis</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>

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


