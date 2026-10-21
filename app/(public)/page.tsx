'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Heart, 
  Share2, 
  Layers, 
  Camera, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  Mail,
  SlidersHorizontal,
  Flame,
  Zap
} from 'lucide-react';
import { useUser } from '@/store';
import PublicHeader from '@/components/public/PublicHeader';
import { triggerHaptic } from '@/lib/haptic';

interface SlideMeta {
  id: string;
  number: string;
  tag: string;
  title: string;
  highlight: string;
  description: string;
}

const SLIDES: SlideMeta[] = [
  {
    id: 'intro',
    number: '01',
    tag: 'El Inicio',
    title: 'Tu armario no es un almacén.',
    highlight: 'Es tu archivo personal.',
    description: 'Dime que no te has probado 5 camisetas antes de salir para acabar poniéndote la misma. Klozet ordena tus prendas y te monta los mejores looks en segundos.'
  },
  {
    id: 'drama',
    number: '02',
    tag: 'La Realidad',
    title: 'El drama de las 8:00 AM.',
    highlight: 'Ropa invisible.',
    description: 'Cajones a rebosar, la típica silla llena de ropa y la sensación de no tener nada que ponerte. Si no ves tus prendas, acabas vistiendo en piloto automático.'
  },
  {
    id: 'scan',
    number: '03',
    tag: 'Digitalización',
    title: 'Foto rápida. Fondo fuera.',
    highlight: 'Tus prendas en HD.',
    description: 'Sin recortes cutres. Klozet aísla cada prenda con precisión milimétrica, detecta la marca real, el corte y la colorimetría para tu catálogo digital.'
  },
  {
    id: 'canvas',
    number: '04',
    tag: 'El Lienzo',
    title: 'Prueba el fit en pantalla.',
    highlight: 'Cero desorden.',
    description: 'Arrastra prendas y prueba contrastes antes de vestirte. Sabrás si esa sudadera casa con esas zapas antes de descolgar una sola percha.'
  },
  {
    id: 'kloe',
    number: '05',
    tag: 'Kloe IA',
    title: 'Kloe sabe de moda.',
    highlight: 'Y mira tu ropa real.',
    description: 'Dile a qué plan vas y qué temperatura hace. Kloe te suelta un outfit impecable combinando únicamente lo que ya tienes colgado. Sin comprar de más.'
  },
  {
    id: 'community',
    number: '06',
    tag: 'Comunidad',
    title: 'Valida el look.',
    highlight: 'Directo a Stories.',
    description: 'Inspírate con outfits reales de la comunidad, guarda ideas en carpetas privadas y exporta tus looks a Instagram Stories en formato 9:16 con un toque.'
  },
  {
    id: 'start',
    number: '07',
    tag: 'Comenzar',
    title: 'Empieza a vestir con intención.',
    highlight: 'Gratis y al instante.',
    description: 'Crea tu cuenta, sube tus 5 prendas de confianza y desbloquea el potencial que ya tienes en el armario.'
  }
];

export default function MasterpieceSlideDeck() {
  const { user } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isTransitioningRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Interactive piece states
  const [activeScanPiece, setActiveScanPiece] = useState(0);
  const [activeCanvasLook, setActiveCanvasLook] = useState<'street' | 'smart'>('street');
  const [likedLooks, setLikedLooks] = useState<Record<number, boolean>>({ 0: true, 2: true });

  const totalSlides = SLIDES.length;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioningRef.current) return;
    if (index < 0 || index >= totalSlides) return;

    isTransitioningRef.current = true;
    try { triggerHaptic('light'); } catch {}
    setCurrentSlide(index);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 700);
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Wheel listener with smooth debounce
  useEffect(() => {
    let wheelTimer: NodeJS.Timeout | null = null;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      // Don't intercept if scrolling inside slide 7 scrollable footer
      const target = e.target as HTMLElement;
      if (target && target.closest('.allow-wheel-scroll')) {
        return;
      }

      e.preventDefault();
      accumulatedDelta += e.deltaY;

      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > 35) {
          if (accumulatedDelta > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
        accumulatedDelta = 0;
      }, 40);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [nextSlide, prevSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        nextSlide();
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartY.current = null;
  };

  const toggleLookLike = (idx: number) => {
    try { triggerHaptic('light'); } catch {}
    setLikedLooks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const scanItems = [
    { name: 'Sudadera Scuffers Beige', brand: 'Scuffers Co.', img: '/landing/sudadera-scuffers-cutout.png', tag: 'Streetwear', prec: '99.8%' },
    { name: 'Onitsuka Tiger Mexico 66', brand: 'Onitsuka', img: '/landing/onitsuka-tiger.png', tag: 'Sneakers', prec: '99.9%' },
    { name: 'Camisa Popelín Rayas', brand: 'Zara Studio', img: '/landing/camisa-zara-cutout.png', tag: 'Smart Casual', prec: '99.5%' },
    { name: 'Botas Cowboy Cuero', brand: 'Vintage Lab', img: '/landing/botas-cowboy.png', tag: 'Calzado', prec: '99.3%' }
  ];

  const communityItems = [
    { img: '/landing/outfits/chico-denim-sneakers-street.jpg', title: 'Street Raw Denim', author: 'carlos_m' },
    { img: '/landing/outfits/chica-blanco-total-look.jpg', title: 'Total White Look', author: 'lucia.style' },
    { img: '/landing/outfits/outfit-chaleco-cartier.jpg', title: 'Chaleco & Cartier', author: 'alvaro_v' },
    { img: '/landing/outfits/outfit-rayas-miumiu.jpg', title: 'Punto Marinero', author: 'valeria.f' }
  ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#0A0A0C] text-white selection:bg-[var(--brand-pink)] selection:text-white font-sans select-none"
    >
      {/* 1. Header Fijo Translucido */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
        <PublicHeader />
      </div>

      {/* 2. Rastreador Lateral de Diapositivas (Desktop) */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 pointer-events-auto">
        {SLIDES.map((slide, idx) => {
          const isActive = currentSlide === idx;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              className="group flex items-center gap-3 py-1 cursor-pointer focus:outline-none"
              aria-label={`Slide ${slide.number}: ${slide.tag}`}
            >
              <span className={`text-[11px] font-mono tracking-wider transition-all duration-300 ${
                isActive 
                  ? 'text-white opacity-100 font-bold translate-x-0' 
                  : 'text-zinc-500 opacity-0 group-hover:opacity-100 translate-x-2'
              }`}>
                {slide.number} // {slide.tag}
              </span>
              <div className="relative flex items-center justify-center w-5 h-5">
                <span className={`transition-all duration-300 rounded-full ${
                  isActive 
                    ? 'w-2.5 h-2.5 bg-[var(--brand-pink)] shadow-[0_0_12px_rgba(255,102,196,0.9)] scale-125' 
                    : 'w-1.5 h-1.5 bg-zinc-700 group-hover:bg-zinc-400'
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Barra Flotante Inferior de Navegación */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-[92vw] max-w-md">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[var(--brand-pink)]">
              {SLIDES[currentSlide].number}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-400">
              0{totalSlides}
            </span>
            <span className="text-xs font-medium text-zinc-300 ml-1 truncate max-w-[140px] sm:max-w-none">
              {SLIDES[currentSlide].tag}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentSlide > 0 && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={prevSlide}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                aria-label="Anterior"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}

            {currentSlide < totalSlides - 1 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="px-4 py-1.5 rounded-full bg-white text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-zinc-200 transition-colors"
                aria-label="Siguiente"
              >
                <span>Deslizar</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <Link href="/auth">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="px-4 py-1.5 rounded-full bg-[var(--brand-pink)] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
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
      {/* 4. SILKY SLIDE DECK (GPU-ACCELERATED TRANSLATE-Y TRACK) */}
      {/* =================================================================== */}
      <div 
        className="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
        style={{ transform: `translate3d(0, -${currentSlide * 100}%, 0)` }}
      >

        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 01: EL INICIO // HERO ARCHIVO */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-8 relative pt-16 pb-20 overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-[var(--brand-pink)]/12 blur-[140px] rounded-full pointer-events-none" />

          {/* Floating Frame-by-Frame Clothes (Lando Norris style) */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [-8, -6, -8] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute left-4 sm:left-12 lg:left-24 top-24 sm:top-28 w-28 sm:w-44 aspect-square hidden sm:block pointer-events-none"
          >
            <div className="relative w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
              <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera Scuffers" fill className="object-contain" priority />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0], rotate: [10, 12, 10] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute right-4 sm:right-12 lg:right-28 top-28 sm:top-32 w-28 sm:w-44 aspect-square hidden sm:block pointer-events-none"
          >
            <div className="relative w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
              <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka Tiger" fill className="object-contain" priority />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [-4, -2, -4] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
            className="absolute left-8 lg:left-32 bottom-24 w-28 sm:w-36 aspect-square hidden md:block pointer-events-none"
          >
            <div className="relative w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
              <Image src="/landing/camisa-zara-cutout.png" alt="Camisa Zara" fill className="object-contain" />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [6, 8, 6] }}
            transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
            className="absolute right-8 lg:right-32 bottom-24 w-28 sm:w-36 aspect-square hidden md:block pointer-events-none"
          >
            <div className="relative w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
              <Image src="/landing/botas-cowboy.png" alt="Botas Cowboy" fill className="object-contain" />
            </div>
          </motion.div>

          {/* Central Hook Content */}
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-6 z-10">
            
            {/* Wordmark Official Mascot */}
            <div className="relative h-20 sm:h-28 w-56 sm:w-80">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                fill 
                sizes="(max-width: 640px) 240px, 320px"
                className="object-contain"
                priority
              />
            </div>

            {/* Punchy Young Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
                Tu armario no es un almacén.{' '}
                <span className="text-[var(--brand-pink)] block sm:inline">
                  Es tu archivo personal.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-lg mx-auto leading-relaxed pt-2">
                Dime que no te has probado 5 camisetas antes de salir para acabar poniéndote la misma. Klozet ordena tus prendas y te monta los mejores looks en segundos.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/auth" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-[0_8px_24px_rgba(255,102,196,0.35)] inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Empezar mi armario</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <button
                onClick={nextSlide}
                className="w-full sm:w-auto px-6 py-4 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Descubrir la historia</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 02: EL DRAMA DE LAS 8 DE LA MAÑANA */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-8 relative pt-16 pb-20">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
            
            {/* Left Copy */}
            <div className="md:col-span-6 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold">
                <span>02 // La Realidad</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                El drama de las 8:00 AM.{' '}
                <span className="text-[var(--brand-pink)] block">
                  Ropa invisible.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Cajones a rebosar, la típica silla llena de ropa y la sensación constante de no tener nada que ponerte. Si no ves tus prendas con claridad, terminas vistiendo con lo primero que pillas.
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300">Uso real de tu armario</span>
                  <span className="text-red-400 font-mono">Solo el 20%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="w-1/5 bg-[var(--brand-pink)] h-full" />
                  <div className="w-4/5 bg-white/20 h-full" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="text-[var(--brand-pink)]">Prendas que repites</span>
                  <span>El 80% queda en el olvido</span>
                </div>
              </div>
            </div>

            {/* Right Animated Wardrobe Cards */}
            <div className="md:col-span-6 relative">
              <div className="relative rounded-3xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Tu Archivo en Klozet
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    100% Recuperado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.04, y: -4 }}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center space-y-2 group cursor-pointer"
                  >
                    <div className="relative w-full h-28">
                      <Image src="/landing/sudadera-scuffers-cutout.png" alt="Scuffers" fill className="object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">Scuffers Beige</span>
                    <span className="text-[10px] text-[var(--brand-pink)] font-mono">14 combinaciones</span>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.04, y: -4 }}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center space-y-2 group cursor-pointer"
                  >
                    <div className="relative w-full h-28">
                      <Image src="/landing/camisa-zara-cutout.png" alt="Zara" fill className="object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">Camisa Rayas</span>
                    <span className="text-[10px] text-[var(--brand-pink)] font-mono">9 combinaciones</span>
                  </motion.div>
                </div>

                <p className="text-xs text-zinc-400 text-center pt-1">
                  Cada prenda recuperada es una compra que te ahorras.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 03: EL ESCANEO LIMPIO // FOTO RÁPIDA */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-8 relative pt-16 pb-20">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
            
            {/* Left Interactive Scanner Simulator */}
            <div className="md:col-span-6 order-2 md:order-1">
              <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white font-mono">Auto-Recorte & Tag</span>
                  </div>
                  <span className="text-[11px] text-[var(--brand-pink)] font-mono font-bold">
                    {scanItems[activeScanPiece].prec} Precisión
                  </span>
                </div>

                {/* Main Cutout View */}
                <div className="relative aspect-square rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col items-center justify-center overflow-hidden">
                  <div className="relative w-48 h-48">
                    <Image 
                      src={scanItems[activeScanPiece].img} 
                      alt={scanItems[activeScanPiece].name}
                      fill
                      className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transition-all duration-300"
                    />
                  </div>

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                    {scanItems[activeScanPiece].tag}
                  </div>
                </div>

                {/* Garment Selector Tabs */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {scanItems.map((piece, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveScanPiece(idx)}
                      className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                        activeScanPiece === idx
                          ? 'bg-[var(--brand-pink)] text-white shadow-[0_0_12px_rgba(255,102,196,0.5)]'
                          : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="md:col-span-6 order-1 md:order-2 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/20 text-[var(--brand-pink)] text-xs font-mono font-bold">
                <span>03 // Digitalización</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Foto rápida.{' '}
                <span className="text-[var(--brand-pink)] block">
                  Fondo fuera.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Tira una foto sobre la cama, la alfombra o una percha. Klozet se encarga de recortar el fondo al píxel, detecta la marca real, el tipo de prenda y la gama de color para colgarla en tu catálogo.
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-zinc-300 pt-2">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                  <span>Detección automática de marca y tejido</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                  <span>Corte limpio sin halos ni bordes rotos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                  <span>Listas para combinar en el lienzo al segundo</span>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 04: EL LIENZO // COMBINA EN PANTALLA */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-8 relative pt-16 pb-20">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
            
            {/* Left Copy */}
            <div className="md:col-span-6 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/20 text-[var(--brand-pink)] text-xs font-mono font-bold">
                <span>04 // El Lienzo</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Prueba el fit en la pantalla.{' '}
                <span className="text-[var(--brand-pink)] block">
                  Cero desorden.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Arrastra prendas, intercambia zapatillas y ajusta proporciones libremente. Comprueba si los colores y los cortes funcionan juntos antes de vestirte.
              </p>

              <div className="pt-2">
                <Link href="/auth">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
                  >
                    <span>Abrir el lienzo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Right Canvas Interactive Board */}
            <div className="md:col-span-6">
              <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-white font-mono">Outfit Studio</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--brand-pink)]/20 text-[var(--brand-pink)] font-bold">
                    Match 98%
                  </span>
                </div>

                {/* Collage of Cutouts */}
                <div className="grid grid-cols-2 gap-3 min-h-[220px] items-center p-3 bg-black/40 rounded-2xl border border-white/[0.04]">
                  <motion.div 
                    whileHover={{ scale: 1.06, rotate: -2 }}
                    className="aspect-square rounded-xl bg-white/[0.03] p-2 flex flex-col items-center justify-center border border-white/[0.06] cursor-pointer"
                  >
                    <div className="relative w-full h-20">
                      <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera" fill className="object-contain" />
                    </div>
                    <span className="text-[10px] text-zinc-300 font-bold mt-1">Scuffers Beige</span>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.06, rotate: 2 }}
                    className="aspect-square rounded-xl bg-white/[0.03] p-2 flex flex-col items-center justify-center border border-white/[0.06] cursor-pointer"
                  >
                    <div className="relative w-full h-20">
                      <Image src="/landing/onitsuka-tiger.png" alt="Onitsuka" fill className="object-contain" />
                    </div>
                    <span className="text-[10px] text-zinc-300 font-bold mt-1">Mexico 66</span>
                  </motion.div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">¿Guardar en tu armario?</span>
                  <span className="text-[var(--brand-pink)] font-bold">Guardado ✓</span>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 05: KLOE // ASISTENTE CON CARA */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-8 relative pt-16 pb-20">
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
            
            {/* Left Chat Frame */}
            <div className="md:col-span-6 order-2 md:order-1">
              <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-9">
                      <Image src="/landing/kloe-grande-landing.png" alt="Kloe" fill className="object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Kloe</p>
                      <p className="text-[10px] text-zinc-400">Estilista de tu armario</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    En línea
                  </span>
                </div>

                {/* Chat bubbles */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-white/10 text-zinc-100 p-3 rounded-2xl rounded-tr-xs">
                      Kloe, tengo cena informal por el centro y hace fresco (18°C). ¿Qué me pongo?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[90%] bg-[var(--brand-pink)]/15 border border-[var(--brand-pink)]/25 p-3.5 rounded-2xl rounded-tl-xs space-y-2">
                      <p className="font-bold text-[var(--brand-pink)]">
                        Look ganador con lo que tienes colgado:
                      </p>
                      <ul className="space-y-1 text-zinc-200">
                        <li>• <strong>Top:</strong> Sudadera Scuffers beige con cuello limpio.</li>
                        <li>• <strong>Inferior:</strong> Jeans oscuros rectos.</li>
                        <li>• <strong>Zapatillas:</strong> Onitsuka Tiger retro.</li>
                      </ul>
                      <p className="text-[10px] text-zinc-400 pt-1">
                        ✓ Armonía 60/30/10 • Cómodo para andar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-center">
                  <Link href="/auth">
                    <span className="text-xs text-[var(--brand-pink)] font-bold hover:underline">
                      Pregúntale a Kloe con tus prendas →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="md:col-span-6 order-1 md:order-2 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/20 text-[var(--brand-pink)] text-xs font-mono font-bold">
                <span>05 // Kloe IA</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Kloe sabe de moda.{' '}
                <span className="text-[var(--brand-pink)] block">
                  Y mira tu ropa real.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Sin sugerirte prendas que no tienes ni empujarte a comprar sin cabeza. Kloe analiza tus prendas reales, el clima y el contexto para proponerte combinaciones que sientan bien.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="font-bold text-white">Prendas Reales</p>
                  <p className="text-zinc-400 mt-1">Solo ropa que tienes en tu catálogo.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="font-bold text-white">Colorimetría 60/30/10</p>
                  <p className="text-zinc-400 mt-1">Armonías y contrastes equilibrados.</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 06: LA COMUNIDAD & INSTAGRAM STORIES */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-8 relative pt-16 pb-20">
          <div className="max-w-4xl mx-auto w-full space-y-6 z-10">
            
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 border border-[var(--brand-pink)]/20 text-[var(--brand-pink)] text-xs font-mono font-bold">
                <span>06 // Comunidad & Stories</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Valida el fit.{' '}
                <span className="text-[var(--brand-pink)]">Directo a Stories.</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Inspírate con outfits de la comunidad, guarda ideas en carpetas y descárgalos en formato 9:16 en un toque.
              </p>
            </div>

            {/* Grid of Real Community Outfits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {communityItems.map((item, idx) => {
                const isLiked = !!likedLooks[idx];
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08] shadow-lg"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image 
                        src={item.img} 
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Bouncy Like Button */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15 }}
                        onClick={() => toggleLookLike(idx)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'fill-none text-white'}`} />
                      </motion.button>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <p className="text-xs font-bold leading-tight truncate">{item.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">@{item.author}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center pt-1">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  <span>Explorar el feed social</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              </Link>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 07: FINALE & MODERN COMPLIANCE FOOTER */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] flex flex-col justify-between items-center px-4 sm:px-8 relative pt-20 pb-20 overflow-y-auto allow-wheel-scroll">
          {/* Action Center */}
          <div className="max-w-2xl mx-auto w-full text-center space-y-6 my-auto pt-4">
            <div className="relative h-14 w-44 mx-auto">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                fill 
                sizes="176px"
                className="object-contain" 
              />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Empieza a vestir con intención.{' '}
              <span className="text-[var(--brand-pink)] block">Hoy mismo.</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              Únete a Klozet gratis. Sube tus primeras 5 prendas en un par de minutos y deja que Kloe te monte tu look de mañana.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="px-9 py-4 rounded-full font-bold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-[0_8px_24px_rgba(255,102,196,0.35)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Crear cuenta gratuita</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link href="/about">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-4 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 cursor-pointer"
                >
                  Sobre Nosotros
                </motion.div>
              </Link>
            </div>

            <p className="text-xs text-zinc-500">
              Sin tarjeta • Disponible en web, iPhone y Android
            </p>
          </div>

          {/* Sleek Modern Footer Section */}
          <div className="w-full max-w-4xl border-t border-white/[0.08] pt-8 pb-4 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-zinc-400 mb-6">
              
              <div className="space-y-2">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">
                  Plataforma
                </p>
                <ul className="space-y-1.5">
                  <li><button onClick={() => goToSlide(0)} className="hover:text-white transition-colors cursor-pointer">Inicio</button></li>
                  <li><Link href="/trends" className="hover:text-white transition-colors">Tendencias & Guías</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">
                  Legal & Políticas
                </p>
                <ul className="space-y-1.5">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
                  <li><Link href="/cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">
                  Soporte Directo
                </p>
                <ul className="space-y-1.5">
                  <li><span className="text-zinc-300">soporte@klozet.es</span></li>
                  <li><span className="text-zinc-300">contacto@klozet.es</span></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Centro de ayuda</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">
                  Transparencia
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Klozet protege tus datos personales y prendas con cifrado seguro. Cumple con el RGPD y estándares de seguridad web.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 border-t border-white/[0.04] pt-4">
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
