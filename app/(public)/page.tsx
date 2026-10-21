'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles, 
  Camera, 
  Share2, 
  Check, 
  Heart, 
  SlidersHorizontal,
  Bookmark,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Mail,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useUser } from '@/store';
import PublicHeader from '@/components/public/PublicHeader';
import { triggerHaptic } from '@/lib/haptic';

interface SlideItem {
  id: string;
  number: string;
  shortTitle: string;
}

const SLIDES: SlideItem[] = [
  { id: 'intro', number: '01', shortTitle: 'El Inicio' },
  { id: 'problema', number: '02', shortTitle: 'El Problema' },
  { id: 'escaneo', number: '03', shortTitle: 'Digitalización' },
  { id: 'lienzo', number: '04', shortTitle: 'El Lienzo' },
  { id: 'kloe', number: '05', shortTitle: 'Kloe IA' },
  { id: 'comunidad', number: '06', shortTitle: 'Comunidad' },
  { id: 'registro', number: '07', shortTitle: 'Comenzar' },
];

export default function SlideLandingPage() {
  const { user } = useUser();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Interactive slide states
  const [selectedScanGarment, setSelectedScanGarment] = useState(0);
  const [activeCanvasLook, setActiveCanvasLook] = useState<'street' | 'smart'>('street');
  const [likedLooks, setLikedLooks] = useState<Record<number, boolean>>({});

  const scanGarments = [
    {
      name: 'Sudadera Beige Oversize',
      brand: 'Scuffers',
      color: 'Beige / Arena',
      season: 'Otoño / Primavera',
      image: '/landing/sudadera-scuffers-cutout.png',
      cutoutAccuracy: '99.8%'
    },
    {
      name: 'Camisa Popelín Rayas',
      brand: 'Zara Man',
      color: 'Azul / Blanco',
      season: 'Todo el año',
      image: '/landing/camisa-zara-cutout.png',
      cutoutAccuracy: '99.4%'
    },
    {
      name: 'Zapatillas Mexico 66',
      brand: 'Onitsuka Tiger',
      color: 'Amarillo / Negro',
      season: 'Todo el año',
      image: '/landing/onitsuka-tiger.png',
      cutoutAccuracy: '99.9%'
    },
    {
      name: 'Botas Cowboy Cuero',
      brand: 'Vintage Studio',
      color: 'Cuero Marrón',
      season: 'Otoño / Invierno',
      image: '/landing/botas-cowboy.png',
      cutoutAccuracy: '99.2%'
    }
  ];

  const communityOutfits = [
    {
      image: '/landing/outfits/chico-denim-sneakers-street.jpg',
      title: 'Denim Relajado & Sneakers',
      author: 'carlos_m',
      likes: 142,
      pieces: ['Camisa Oversize', 'Raw Denim', 'Retro Sneakers']
    },
    {
      image: '/landing/outfits/chica-blanco-total-look.jpg',
      title: 'Look Total White',
      author: 'lucia.style',
      likes: 218,
      pieces: ['Blusa Seda', 'Pantalón Fluido', 'Sandalia Piel']
    },
    {
      image: '/landing/outfits/outfit-chaleco-cartier.jpg',
      title: 'Chaleco Sastre & Reloj',
      author: 'alvaro_v',
      likes: 184,
      pieces: ['Chaleco Lino', 'Pantalón Pinzas', 'Reloj Vintage']
    },
    {
      image: '/landing/outfits/outfit-rayas-miumiu.jpg',
      title: 'Punto Marinero & Bolso',
      author: 'valeria.f',
      likes: 310,
      pieces: ['Jersey Rayas', 'Falda Plisada', 'Bolso Piel']
    }
  ];

  const articles = [
    {
      slug: 'armario-capsula-2026',
      title: 'Armario Cápsula: La guía para vestir mejor con menos prendas',
      category: 'Esenciales'
    },
    {
      slug: 'quiet-luxury-streetwear',
      title: 'Cómo combinar básicos neutros con zapatillas y prendas urbanas',
      category: 'Tendencias'
    },
    {
      slug: 'teoria-del-color-moda',
      title: 'La regla del 60-30-10 aplicada a tus combinaciones de ropa diaria',
      category: 'Estilismo'
    }
  ];

  // Scroll to specific slide
  const scrollToSlide = useCallback((index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    try { triggerHaptic('light'); } catch {}
    setCurrentSlideIndex(index);
    const container = containerRef.current;
    if (container) {
      const targetElement = container.children[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const nextSlide = () => scrollToSlide(currentSlideIndex + 1);
  const prevSlide = () => scrollToSlide(currentSlideIndex - 1);

  // Keyboard navigation (ArrowDown / ArrowUp / PageDown / PageUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, nextSlide, prevSlide]);

  // Observer to track which slide is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = Array.from(container.children).indexOf(entry.target);
            if (index !== -1) {
              setCurrentSlideIndex(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  const toggleLookLike = (idx: number) => {
    try { triggerHaptic('light'); } catch {}
    setLikedLooks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-[#111113] text-zinc-950 dark:text-zinc-50 select-none selection:bg-[var(--brand-pink)] selection:text-white font-sans">
      
      {/* 1. Frosted Liquid Apple Header */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
        <PublicHeader />
      </div>

      {/* 2. Side Slide Navigation Tracker (Desktop) */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 pointer-events-auto">
        {SLIDES.map((slide, i) => {
          const isActive = currentSlideIndex === i;
          return (
            <button
              key={slide.id}
              onClick={() => scrollToSlide(i)}
              className="group flex items-center gap-3 py-1 cursor-pointer focus:outline-none"
              aria-label={`Ir a diapositiva ${slide.number}: ${slide.shortTitle}`}
            >
              <span className={`text-[11px] font-semibold tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'text-zinc-950 dark:text-white opacity-100 font-bold' 
                  : 'text-zinc-400 opacity-0 group-hover:opacity-100'
              }`}>
                {slide.shortTitle}
              </span>
              <div className="relative flex items-center justify-center w-6 h-6">
                <span className={`transition-all duration-300 rounded-full ${
                  isActive 
                    ? 'w-2.5 h-2.5 bg-[var(--brand-pink)] shadow-[0_0_10px_rgba(255,102,196,0.8)] scale-125' 
                    : 'w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-400'
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Floating Bottom Navigation Bar (Chapter & Quick Action) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-32px)] sm:w-auto pointer-events-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#18181b]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[var(--brand-pink)]">
              {SLIDES[currentSlideIndex].number}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px] sm:max-w-none">
              {SLIDES[currentSlideIndex].shortTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentSlideIndex > 0 && (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={prevSlide}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                aria-label="Diapositiva anterior"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}

            {currentSlideIndex < SLIDES.length - 1 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="px-3 py-1 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                aria-label="Siguiente diapositiva"
              >
                <span>Siguiente</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <Link href="/auth">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)] text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Entrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MAIN SLIDE CAROUSEL CONTAINER (CSS SNAP + SMOOTH INTERTIA) */}
      {/* =================================================================== */}
      <div 
        ref={containerRef}
        className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth focus:outline-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >

        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 01: EL INICIO (THE HOOK) */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="intro"
          className="h-[100dvh] min-h-[640px] w-full snap-start snap-always flex flex-col justify-center items-center px-4 sm:px-8 relative pt-20 pb-20 overflow-hidden"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 z-10">
            
            {/* Pill Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/[0.08] text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-ping" />
              <span>Capítulo 01 • Red Social de Moda & Armario Digital</span>
            </motion.div>

            {/* Official Character Wordmark */}
            <div className="relative h-16 sm:h-24 w-52 sm:w-72 my-1">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                fill 
                sizes="(max-width: 640px) 240px, 320px"
                className="object-contain"
                priority
              />
            </div>

            {/* Native Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Tu armario real, por fin ordenado.{' '}
              <span className="text-[var(--brand-pink)] block sm:inline">
                Y combinaciones que funcionan.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal max-w-xl leading-relaxed">
              Termina con el &quot;tengo el armario lleno y nada que ponerme&quot;. Sube tu ropa en fotos limpias, prueba combinaciones sobre tu pantalla y pídele ayuda a Kloe.
            </p>

            {/* Bouncy Spring CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="px-8 py-3.5 rounded-full font-semibold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Crear cuenta gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <button
                onClick={nextSlide}
                className="px-6 py-3.5 rounded-full font-semibold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Descubrir la historia</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 02: EL PROBLEMA (THE CHAOS) */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="problema"
          className="h-[100dvh] min-h-[640px] w-full snap-start snap-always flex flex-col justify-center items-center px-4 sm:px-8 relative pt-20 pb-20 bg-zinc-50 dark:bg-[#151518]/60"
        >
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center z-10">
            
            {/* Left Narrative */}
            <div className="md:col-span-6 space-y-5 text-center md:text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                Capítulo 02 • El Dilema Real
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-snug">
                El 80% de tu ropa es invisible.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Vestimos siempre las mismas prendas no porque nos falte ropa, sino porque no vemos lo que tenemos. Las mejores prendas quedan sepultadas en perchas oscuras y cajones desordenados.
              </p>
              
              <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Prendas en el armario</span>
                  <span className="text-red-500 font-mono">100% acumuladas</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                  <div className="w-1/5 bg-[var(--brand-pink)] h-full" />
                  <div className="w-4/5 bg-zinc-300 dark:bg-zinc-700 h-full" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="text-[var(--brand-pink)] font-semibold">20% usadas frecuentemente</span>
                  <span>80% olvidadas</span>
                </div>
              </div>
            </div>

            {/* Right Visual Comparison */}
            <div className="md:col-span-6">
              <div className="relative rounded-3xl p-6 bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Con Klozet</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% Visible & Combinable
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[3/4] rounded-2xl bg-zinc-50 dark:bg-[#141417] p-2 flex flex-col items-center justify-center border border-black/[0.04] dark:border-white/[0.06]">
                    <div className="relative w-full h-24">
                      <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera" fill className="object-contain" />
                    </div>
                    <span className="text-[11px] font-semibold mt-2">Scuffers Beige</span>
                    <span className="text-[10px] text-zinc-400">12 combinaciones</span>
                  </div>

                  <div className="aspect-[3/4] rounded-2xl bg-zinc-50 dark:bg-[#141417] p-2 flex flex-col items-center justify-center border border-black/[0.04] dark:border-white/[0.06]">
                    <div className="relative w-full h-24">
                      <Image src="/landing/camisa-zara-cutout.png" alt="Camisa" fill className="object-contain" />
                    </div>
                    <span className="text-[11px] font-semibold mt-2">Camisa Popelín</span>
                    <span className="text-[10px] text-zinc-400">8 combinaciones</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 text-center pt-1">
                  Tu ropa cobra vida en un catálogo digital activo y ordenado.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 03: DIGITALIZACIÓN (THE SCAN & CUTOUT) */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="escaneo"
          className="h-[100dvh] min-h-[640px] w-full snap-start snap-always flex flex-col justify-center items-center px-4 sm:px-8 relative pt-20 pb-20"
        >
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center z-10">
            
            {/* Left Scanner Simulator */}
            <div className="md:col-span-6 order-2 md:order-1">
              <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Escáner de Prendas</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">IA de Precisión</span>
                </div>

                {/* Garment Preview Box */}
                <div className="relative aspect-square rounded-2xl bg-zinc-50 dark:bg-[#131316] border border-black/[0.04] dark:border-white/[0.06] p-4 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48">
                    <Image 
                      src={scanGarments[selectedScanGarment].image} 
                      alt={scanGarments[selectedScanGarment].name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                    Corte {scanGarments[selectedScanGarment].cutoutAccuracy}
                  </div>
                </div>

                {/* Auto Detection Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#131316] border border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block">Marca</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{scanGarments[selectedScanGarment].brand}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#131316] border border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block">Colorimetría</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{scanGarments[selectedScanGarment].color}</span>
                  </div>
                </div>

                {/* Garment Selector */}
                <div className="flex gap-2 pt-1">
                  {scanGarments.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedScanGarment(i)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedScanGarment === i
                          ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 text-[var(--brand-pink-dark)] dark:text-[var(--brand-pink)]'
                          : 'border-black/[0.06] dark:border-white/[0.08] text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Prenda {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Description */}
            <div className="md:col-span-6 order-1 md:order-2 space-y-5 text-center md:text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                Capítulo 03 • Digitalización
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-snug">
                Sube tu ropa en 1 foto. Sin fondos feos.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Toma una foto rápida sobre tu cama o el suelo. Klozet elimina automáticamente el fondo con calidad de estudio, detecta el tipo de prenda, color y tejido, y la cataloga en tu armario.
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                  <span>Detección inteligente de marcas y colores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                  <span>Corte transparente sin bordes rotos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                  <span>Organización por estaciones y ocasiones</span>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 04: EL LIENZO (THE CANVAS) */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="lienzo"
          className="h-[100dvh] min-h-[640px] w-full snap-start snap-always flex flex-col justify-center items-center px-4 sm:px-8 relative pt-20 pb-20 bg-zinc-50 dark:bg-[#151518]/60"
        >
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center z-10">
            
            {/* Left Narrative */}
            <div className="md:col-span-6 space-y-5 text-center md:text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                Capítulo 04 • El Lienzo
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-snug">
                Combina en la pantalla, no sobre la cama.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                El lienzo de Klozet te permite arrastrar prendas, probar contrastes de colores y proporciones de corte en segundos. Prueba 10 looks antes de salir sin desordenar una sola percha.
              </p>

              <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => setActiveCanvasLook('street')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCanvasLook === 'street'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Look Street Casual
                </button>
                <button
                  onClick={() => setActiveCanvasLook('smart')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCanvasLook === 'smart'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Look Smart Clásico
                </button>
              </div>
            </div>

            {/* Right Canvas Mockup */}
            <div className="md:col-span-6">
              <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Lienzo Creativo</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-semibold">
                    {activeCanvasLook === 'street' ? '4 prendas combinadas' : '3 prendas combinadas'}
                  </span>
                </div>

                {/* Garments on canvas */}
                <div className="grid grid-cols-2 gap-3 min-h-[220px] items-center">
                  {activeCanvasLook === 'street' ? (
                    <>
                      <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-[#131316] p-3 flex flex-col items-center justify-center border border-black/[0.04] dark:border-white/[0.06]">
                        <div className="relative w-full h-20">
                          <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold mt-1">Sudadera Beige</span>
                      </div>
                      <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-[#131316] p-3 flex flex-col items-center justify-center border border-black/[0.04] dark:border-white/[0.06]">
                        <div className="relative w-full h-20">
                          <Image src="/landing/onitsuka-tiger.png" alt="Sneakers" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold mt-1">Onitsuka Tiger</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-[#131316] p-3 flex flex-col items-center justify-center border border-black/[0.04] dark:border-white/[0.06]">
                        <div className="relative w-full h-20">
                          <Image src="/landing/camisa-zara-cutout.png" alt="Camisa" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold mt-1">Camisa Popelín</span>
                      </div>
                      <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-[#131316] p-3 flex flex-col items-center justify-center border border-black/[0.04] dark:border-white/[0.06]">
                        <div className="relative w-full h-20">
                          <Image src="/landing/botas-cowboy.png" alt="Botas" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold mt-1">Botas Cuero</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#131316] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-zinc-500">¿Guardar look en el armario?</span>
                  <Link href="/auth">
                    <span className="text-[var(--brand-pink)] font-semibold hover:underline">
                      Guardar outfit →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 05: KLOE (THE ASSISTANT WITH A FACE) */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="kloe"
          className="h-[100dvh] min-h-[640px] w-full snap-start snap-always flex flex-col justify-center items-center px-4 sm:px-8 relative pt-20 pb-20"
        >
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center z-10">
            
            {/* Left Chat Simulation */}
            <div className="md:col-span-6 order-2 md:order-1">
              <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-8">
                      <Image src="/landing/kloe-grande-landing.png" alt="Kloe" fill className="object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">Kloe</p>
                      <p className="text-[10px] text-zinc-400">Estilista personal</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    En línea
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-3 rounded-2xl rounded-tr-xs">
                      Kloe, tengo una cena informal en una terraza y hace unos 19°C. ¿Qué me pongo?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[90%] bg-[var(--brand-pink)]/10 dark:bg-[var(--brand-pink)]/15 border border-[var(--brand-pink)]/20 p-3.5 rounded-2xl rounded-tl-xs space-y-2">
                      <p className="font-semibold text-[var(--brand-pink-dark)] dark:text-[var(--brand-pink)]">
                        Look perfecto con tu ropa:
                      </p>
                      <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
                        <li>• <strong>Top:</strong> Sudadera Scuffers beige limpia.</li>
                        <li>• <strong>Pantalón:</strong> Jeans rectos oscuros.</li>
                        <li>• <strong>Calzado:</strong> Zapatillas Onitsuka Tiger.</li>
                      </ul>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-1">
                        ✓ Armonía 60-30-10 • Ideal para 19°C
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-center">
                  <Link href="/auth">
                    <span className="text-xs text-[var(--brand-pink)] font-semibold hover:underline">
                      Pregúntale a Kloe con tus prendas →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="md:col-span-6 order-1 md:order-2 space-y-5 text-center md:text-left">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                Capítulo 05 • Kloe
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white leading-snug">
                Tu estilista con cara. Lista en 5 segundos.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Kloe no es un asistente aburrido ni te empuja a comprar ropa sin fin. Mira tu armario real y te sugiere combinaciones concretas con las que sentirte seguro cada mañana.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08]">
                  <p className="font-bold text-zinc-950 dark:text-white">Prendas Reales</p>
                  <p className="text-zinc-400 mt-1">Solo utiliza la ropa que tienes guardada.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08]">
                  <p className="font-bold text-zinc-950 dark:text-white">Colorimetría 60/30/10</p>
                  <p className="text-zinc-400 mt-1">Armonías y contrastes calculados.</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 06: LA COMUNIDAD & EXPORTACIÓN A INSTAGRAM */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="comunidad"
          className="h-[100dvh] min-h-[640px] w-full snap-start snap-always flex flex-col justify-center items-center px-4 sm:px-8 relative pt-20 pb-20 bg-zinc-50 dark:bg-[#151518]/60"
        >
          <div className="max-w-4xl mx-auto w-full space-y-6 z-10">
            
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                Capítulo 06 • Red Social & Exportación
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Comparte, inspírate y exporta a Instagram
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Guarda ideas de otros perfiles y descarga tus combinaciones en formato Story 9:16 en un toque.
              </p>
            </div>

            {/* Outfits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {communityOutfits.map((look, idx) => {
                const isLiked = !!likedLooks[idx];
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-xs"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image 
                        src={look.image} 
                        alt={look.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      
                      {/* Bouncy Like Button */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={() => toggleLookLike(idx)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white cursor-pointer"
                        aria-label="Dar like al look"
                      >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'fill-none text-white'}`} />
                      </motion.button>

                      {/* Info Overlay */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <p className="text-xs font-bold leading-tight truncate">{look.title}</p>
                        <p className="text-[10px] text-zinc-300 mt-0.5 truncate">@{look.author}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Explorar más en la app</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              </Link>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 07: SALIDA, REGISTRO & POLÍTICAS (MODERN COMPLIANCE FOOTER) */}
        {/* ----------------------------------------------------------------- */}
        <section 
          id="registro"
          className="min-h-[100dvh] w-full snap-start snap-always flex flex-col justify-between items-center px-4 sm:px-8 relative pt-20 pb-16 bg-white dark:bg-[#111113]"
        >
          {/* Main Action Hub */}
          <div className="max-w-4xl mx-auto w-full my-auto flex flex-col items-center text-center space-y-6 py-8">
            
            <div className="relative h-12 w-36 mx-auto">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                fill 
                sizes="144px"
                className="object-contain" 
              />
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
              Tu nuevo armario empieza hoy.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Únete de forma gratuita. Sube tus primeras 5 prendas en un par de minutos y deja que Kloe te arme tu look de mañana.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="px-9 py-4 rounded-full font-bold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Crear cuenta gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link href="/about">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-4 rounded-full font-semibold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Sobre Nosotros
                </motion.div>
              </Link>
            </div>

            <p className="text-xs text-zinc-400">
              Sin tarjeta requerida • Funciona en web, iPhone y Android
            </p>

            {/* Editorial / Guide pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-zinc-400">Guías recomendadas:</span>
              {articles.map((art) => (
                <Link 
                  key={art.slug} 
                  href={`/trends/${art.slug}`}
                  className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {art.title.slice(0, 32)}...
                </Link>
              ))}
            </div>
          </div>

          {/* =============================================================== */}
          {/* MODERN SLEEK POLICIES & TRANSPARENCY CONTAINER */}
          {/* =============================================================== */}
          <div className="w-full max-w-4xl border-t border-black/[0.06] dark:border-white/[0.08] pt-8 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              
              {/* Col 1: Plataforma */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Plataforma
                </p>
                <ul className="space-y-1.5">
                  <li><Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Inicio</Link></li>
                  <li><Link href="/trends" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Tendencias</Link></li>
                  <li><Link href="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sobre Nosotros</Link></li>
                  <li><Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contacto</Link></li>
                </ul>
              </div>

              {/* Col 2: Legal & Cumplimiento */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Legal & Privacidad
                </p>
                <ul className="space-y-1.5">
                  <li><Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Política de Privacidad</Link></li>
                  <li><Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Términos de Servicio</Link></li>
                  <li><Link href="/cookies" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Política de Cookies</Link></li>
                </ul>
              </div>

              {/* Col 3: Soporte */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Soporte & Contacto
                </p>
                <ul className="space-y-1.5">
                  <li><span className="text-zinc-600 dark:text-zinc-400">soporte@klozet.es</span></li>
                  <li><span className="text-zinc-600 dark:text-zinc-400">contacto@klozet.es</span></li>
                  <li><Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Formulario de ayuda</Link></li>
                </ul>
              </div>

              {/* Col 4: Transparencia */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">
                  Transparencia
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Klozet protege tus datos personales y prendas con cifrado seguro. Cumple con el RGPD y estándares de seguridad web.
                </p>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 border-t border-black/[0.04] dark:border-white/[0.04] pt-4">
              <p>© {new Date().getFullYear()} Klozet (klozet.es). Todos los derechos reservados.</p>
              <div className="flex items-center gap-3">
                <Link href="/privacy" className="hover:underline">Privacidad</Link>
                <span>•</span>
                <Link href="/terms" className="hover:underline">Términos</Link>
                <span>•</span>
                <Link href="/cookies" className="hover:underline">Cookies</Link>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
