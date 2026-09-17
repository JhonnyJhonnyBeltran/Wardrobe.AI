'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles,
  Layers,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress to calculate active step cleanly
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate active step smoothly without overlaps
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.18) setActiveStep(0);
      else if (latest < 0.42) setActiveStep(1);
      else if (latest < 0.68) setActiveStep(2);
      else if (latest < 0.88) setActiveStep(3);
      else setActiveStep(4);
    });
  }, [scrollYProgress]);

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
    { label: "Armario", idx: 0 },
    { label: "Digitaliza", idx: 1 },
    { label: "Lienzo", idx: 2 },
    { label: "Planifica", idx: 3 },
    { label: "Acceso", idx: 4 }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between antialiased overflow-x-hidden">
      
      {/* SCROLL-DRIVEN CONTAINER (400vh for smooth pacing) */}
      <div ref={containerRef} className="relative h-[390vh] w-full">
        
        {/* STICKY FULL-SCREEN VIEWPORT */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between items-center px-4 sm:px-8 py-5 sm:py-7">
          
          {/* Ambient Lighting Gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[800px] h-[340px] sm:h-[800px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* TOP MINIMAL BRAND IDENTIFIER (Discreet & Bold, No Header) */}
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-30 pt-1">
            <Link href="/" className="inline-flex items-center gap-2 group focus:outline-none">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                width={140} 
                height={48} 
                className="h-7 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
                priority 
              />
            </Link>

            {/* Quick Step Indicators */}
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)]/70 shadow-xs">
              {stepsList.map((step) => (
                <button
                  key={step.idx}
                  onClick={() => scrollToStep(step.idx)}
                  className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                    activeStep === step.idx 
                      ? 'bg-[var(--brand-pink)] text-white shadow-xs scale-105' 
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN BOLD KEYFRAME STAGE */}
          <div className="w-full max-w-6xl mx-auto flex-1 flex items-center justify-center relative my-auto">
            <AnimatePresence mode="wait">
              
              {/* ======================================================== */}
              {/* KEYFRAME 0: HERO (BOLD & EDITORIAL WHERING STYLE) */}
              {/* ======================================================== */}
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full text-center flex flex-col items-center justify-center relative py-4"
                >
                  {/* Eyebrow badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xs mb-4 text-xs sm:text-sm font-extrabold text-[var(--foreground-secondary)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-pink)] animate-pulse" />
                    <span>Tu armario digital inteligente</span>
                  </div>

                  {/* Editorial Bold Headline */}
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--foreground)] leading-[1.02] max-w-5xl">
                    Ama tu armario. <br />
                    <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
                      Vístete mejor.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-4 text-sm sm:text-lg md:text-xl text-[var(--foreground-secondary)] max-w-xl font-medium leading-relaxed">
                    Digitaliza todas tus prendas, crea looks en lienzos libres y descubre combinaciones únicas con lo que ya tienes.
                  </p>

                  {/* Action CTA */}
                  <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto z-20">
                    <Link
                      href={user ? "/closet" : "/auth"}
                      className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                      <span>{user ? "Ir a mi armario" : "Empezar gratis"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                      onClick={() => scrollToStep(1)}
                      className="w-full sm:w-auto px-6 py-4 rounded-full font-bold text-sm sm:text-base bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Descubrir más</span>
                      <ChevronDown className="w-4 h-4 text-[var(--brand-pink)]" />
                    </button>
                  </div>

                  {/* Floating Garment Cutouts (Editorial Placement) */}
                  <div className="hidden lg:block absolute -left-6 xl:left-4 top-2 w-40 xl:w-48 pointer-events-none drop-shadow-2xl animate-float">
                    <Image 
                      src="/landing/sudadera-scuffers-cutout.png" 
                      alt="Sudadera Scuffers Cutout" 
                      width={220} 
                      height={220} 
                      className="w-full h-auto object-contain -rotate-12"
                      priority 
                    />
                  </div>

                  <div className="hidden lg:block absolute -left-4 xl:left-6 bottom-2 w-36 xl:w-44 pointer-events-none drop-shadow-2xl">
                    <Image 
                      src="/landing/pantalon-blanco.png" 
                      alt="Pantalón Blanco Cutout" 
                      width={200} 
                      height={260} 
                      className="w-full h-auto object-contain rotate-6"
                      priority 
                    />
                  </div>

                  <div className="hidden lg:block absolute -right-6 xl:right-4 top-2 w-40 xl:w-48 pointer-events-none drop-shadow-2xl animate-float">
                    <Image 
                      src="/landing/camisa-zara-cutout.png" 
                      alt="Camisa Zara Cutout" 
                      width={220} 
                      height={220} 
                      className="w-full h-auto object-contain rotate-12"
                      priority 
                    />
                  </div>

                  <div className="hidden lg:block absolute -right-4 xl:right-6 bottom-2 w-36 xl:w-44 pointer-events-none drop-shadow-2xl">
                    <Image 
                      src="/landing/botas-cowboy.png" 
                      alt="Botas Cowboy Cutout" 
                      width={200} 
                      height={260} 
                      className="w-full h-auto object-contain -rotate-6"
                      priority 
                    />
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* KEYFRAME 1: BOLD WHERING INSPIRATION (SEEN & WORN) */}
              {/* ======================================================== */}
              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center"
                >
                  {/* Left Column: Bold Typography */}
                  <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                    <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-black uppercase tracking-wider mb-3 inline-block w-fit mx-auto md:mx-0">
                      01 • Digitalización
                    </span>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
                      Merecen verse. <br />
                      <span className="text-[var(--brand-pink)]">
                        Merecen llevarse.
                      </span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                      Tu ropa no debería quedarse olvidada en el fondo del armario. Sube una foto y Klozet elimina el fondo al instante, categorizando tejido, corte y estilo.
                    </p>

                    <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm font-bold text-[var(--foreground)] items-center md:items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Corte 100% limpio y transparente</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Detección automática de categoría y color</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tilted Bold Editorial Cards Stack */}
                  <div className="md:col-span-6 flex items-center justify-center relative min-h-[300px] sm:min-h-[360px]">
                    
                    {/* Back Tilted Card (Star Jeans) */}
                    <div className="absolute -left-2 sm:left-4 top-2 w-[160px] sm:w-[210px] rounded-3xl p-3 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-xl -rotate-12 pointer-events-none">
                      <div className="w-full aspect-square relative flex items-center justify-center">
                        <Image 
                          src="/landing/jeans-stars.png" 
                          alt="Jeans Stars" 
                          width={180} 
                          height={180} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] font-black text-center mt-1 text-[var(--foreground-secondary)]">One Dilemma Star</p>
                    </div>

                    {/* Front Hero Card (Scuffers Hoodie) */}
                    <div className="relative z-10 w-[240px] sm:w-[300px] rounded-3xl p-5 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-color)] shadow-2xl rotate-2">
                      <div className="w-full aspect-square relative flex items-center justify-center mb-3">
                        <Image 
                          src="/landing/sudadera-scuffers-cutout.png" 
                          alt="Sudadera Scuffers Cutout" 
                          width={260} 
                          height={260} 
                          className="w-full h-full object-contain drop-shadow-xl"
                        />
                      </div>
                      <div className="w-full pt-2 border-t border-[var(--border-color)]/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-[var(--brand-pink)] uppercase tracking-wider">Scuffers</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Sin fondo</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-[var(--foreground)] mt-0.5">Sudadera Boxy Naranja</h3>
                      </div>
                    </div>

                    {/* Side Floating Cutout (Golden Goose Sneaker & Zara) */}
                    <div className="absolute right-0 sm:right-2 bottom-0 w-[160px] sm:w-[200px] rounded-3xl p-3 bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xl rotate-12 pointer-events-none">
                      <div className="w-full aspect-video relative flex items-center justify-center">
                        <Image 
                          src="/landing/golden-goose.png" 
                          alt="Golden Goose Sneaker" 
                          width={180} 
                          height={100} 
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                      <p className="text-[10px] font-black text-center mt-1 text-[var(--brand-pink)]">Golden Goose Glitter</p>
                    </div>

                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* KEYFRAME 2: LIENZO LIBRE DE CREACIÓN */}
              {/* ======================================================== */}
              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center"
                >
                  {/* Left Column: Bold Text */}
                  <div className="md:col-span-6 text-center md:text-left order-2 md:order-1 flex flex-col justify-center">
                    <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider mb-3 inline-block w-fit mx-auto md:mx-0">
                      02 • Lienzo Libre
                    </span>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
                      Combina como <br />
                      <span className="bg-gradient-to-r from-purple-500 to-[var(--brand-pink)] bg-clip-text text-transparent">
                        un estilista.
                      </span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                      Arrastra, gira y monta tus outfits en un lienzo libre estilo moodboard. Prueba cualquier combinación en pantalla antes de desordenar tu cuarto.
                    </p>

                    <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm font-bold text-[var(--foreground)] items-center md:items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Lienzo interactivo sin cuadrículas rígidas</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Guarda y comparte tus looks en 1 toque</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Clean Canvas Showcase */}
                  <div className="md:col-span-6 flex items-center justify-center order-1 md:order-2">
                    <div className="relative w-full max-w-[300px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between pb-3 border-b border-[var(--border-color)]/70 text-xs font-bold text-[var(--foreground-secondary)]">
                        <span className="flex items-center gap-1.5 font-black text-[var(--foreground)]">
                          <Layers className="w-4 h-4 text-[var(--brand-pink)]" />
                          Lienzo Creativo
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-black text-[10px]">
                          LOOK ACTIVO
                        </span>
                      </div>
                      <div className="w-full relative flex items-center justify-center py-2">
                        <Image 
                          src="/landing/outfit-canvas-clean.png" 
                          alt="Outfit Canvas Scuffers + Onitsuka" 
                          width={380} 
                          height={460} 
                          className="w-full h-auto object-contain rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* KEYFRAME 3: PLANIFICADOR, ASISTENTE KLOE & OUTFITS */}
              {/* ======================================================== */}
              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center"
                >
                  {/* Left Column: Bold Text */}
                  <div className="md:col-span-6 text-center md:text-left flex flex-col justify-center">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-3 inline-block w-fit mx-auto md:mx-0">
                      03 • Inspiración & Estilo
                    </span>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.05]">
                      Despiértate sabiendo <br />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        qué ponerte hoy.
                      </span>
                    </h2>
                    <p className="mt-4 text-sm sm:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                      Planifica tus looks para toda la semana, combina prendas reales de tu armario y descubre inspiración real de chicos y chicas con tu mismo estilo.
                    </p>

                    <div className="mt-6 flex flex-col gap-2.5 text-xs sm:text-sm font-bold text-[var(--foreground)] items-center md:items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Looks completos para chica y chico</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Asesoría de estilo y combinación con Kloe</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Editorial Mixed Grid of Outfits & Pieces */}
                  <div className="md:col-span-6 flex items-center justify-center">
                    <div className="relative w-full max-w-[320px] sm:max-w-[420px] rounded-3xl p-4 sm:p-5 shadow-2xl border border-[var(--border-color)] bg-[var(--card-bg)] flex flex-col items-center gap-3">
                      <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)] text-xs font-bold text-[var(--foreground-secondary)]">
                        <span className="flex items-center gap-1.5 font-black text-[var(--foreground)]">
                          <Calendar className="w-4 h-4 text-[var(--brand-pink)]" />
                          Inspiración & Armario
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-[10px]">
                          FASHION MOODBOARD
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 w-full">
                        {/* Chica Outfit 1 */}
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                          <Image src="/landing/outfits/chica-cookies-denim.jpg" alt="Outfit Chica Denim" fill className="object-cover" />
                        </div>
                        {/* Chico Outfit 1 */}
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                          <Image src="/landing/outfits/chico-henley-pleated.jpg" alt="Outfit Chico Henley" fill className="object-cover" />
                        </div>
                        {/* Chica Outfit 2 */}
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                          <Image src="/landing/outfits/chica-leopard-scarf.jpg" alt="Outfit Chica Scarf" fill className="object-cover" />
                        </div>
                        {/* Chico Outfit 2 */}
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border-color)]/60 shadow-xs hover:scale-105 transition-transform">
                          <Image src="/landing/outfits/chico-yellow-baggy.jpg" alt="Outfit Chico Baggy" fill className="object-cover" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full pt-1 border-t border-[var(--border-color)]/40">
                        <div className="h-14 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/golden-goose.png" alt="Golden Goose" width={70} height={35} className="object-contain" />
                        </div>
                        <div className="h-14 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/sudadera-scuffers-cutout.png" alt="Scuffers" width={50} height={50} className="object-contain" />
                        </div>
                        <div className="h-14 relative rounded-xl bg-[var(--background-secondary)]/80 p-1 flex items-center justify-center border border-[var(--border-color)]/40">
                          <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka" width={55} height={55} className="object-contain" />
                        </div>
                      </div>

                      <p className="text-[11px] text-center text-[var(--foreground-secondary)] font-semibold">
                        Streetwear, Quiet Luxury & Clean Look
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ======================================================== */}
              {/* KEYFRAME 4: ACCESO, CTA & PÁGINAS LEGALES INTEGRADAS */}
              {/* ======================================================== */}
              {activeStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-3xl flex flex-col items-center justify-between text-center py-2"
                >
                  {/* Central Action Card */}
                  <div className="w-full p-7 sm:p-10 rounded-3xl bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl flex flex-col items-center">
                    
                    {/* Big Brand Logo */}
                    <div className="mb-3">
                      <Image 
                        src="/landing/klozet-nombre-grande.png" 
                        alt="Klozet" 
                        width={180} 
                        height={60} 
                        className="h-9 sm:h-12 w-auto object-contain mx-auto" 
                      />
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
                      Tu armario en tu bolsillo.
                    </h2>
                    
                    <p className="mt-3 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed max-w-lg font-medium">
                      Regístrate gratis en menos de un minuto y empieza a organizar tus looks favoritos sin complicaciones.
                    </p>

                    {/* Access Action Buttons */}
                    <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                      <Link
                        href="/auth"
                        className="w-full sm:w-auto px-9 py-4 rounded-full font-black text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2 group"
                      >
                        <span>Entrar a Klozet gratis</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      
                      {user && (
                        <Link
                          href="/closet"
                          className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-base bg-[var(--background-secondary)] hover:bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 inline-flex items-center justify-center"
                        >
                          Ir a mi armario
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* INTEGRATED LEGAL & TERMS FOOTER INSIDE KEYFRAME */}
                  <div className="mt-5 w-full pt-4 border-t border-[var(--border-color)]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--foreground-secondary)] font-semibold">
                    <p className="text-[11px] text-[var(--foreground-tertiary)]">
                      © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 text-[12px]">
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
          </div>

          {/* BOTTOM STEP CONTROLS (Prev / Next & Counter) */}
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-30 pb-1">
            <button
              onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <span className="text-xs font-black text-[var(--foreground-secondary)] tracking-widest uppercase">
              0{activeStep + 1} / 05
            </span>

            <button
              onClick={() => scrollToStep(Math.min(4, activeStep + 1))}
              disabled={activeStep === 4}
              className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs text-xs font-bold flex items-center gap-1"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}



