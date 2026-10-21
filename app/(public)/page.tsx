'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Heart, 
  Sparkles,
  Layers, 
  Scan,
  Instagram,
  ShieldCheck,
  FileText,
  Mail,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { useUser } from '@/store';
import { triggerHaptic } from '@/lib/haptic';

interface SlideData {
  id: string;
  number: string;
  tag: string;
  title: string;
  highlight: string;
  description: string;
}

const SLIDES: SlideData[] = [
  {
    id: 'archivo',
    number: '01',
    tag: 'El Archivo',
    title: 'Tienes el armario petado y siempre sales con lo mismo.',
    highlight: 'Tu ropa no es para tenerla olvidada en perchas.',
    description: 'Te pruebas cuatro sudaderas antes de salir para acabar poniéndote la de siempre. Klozet convierte tu caos en un lookbook interactivo: ves tus prendas juntas, pruebas combinaciones al vuelo y sales con el fit clavado.'
  },
  {
    id: 'drama',
    number: '02',
    tag: 'El Drama Real',
    title: 'La famosa silla con 8 prendas encima.',
    highlight: 'Si no ves tu ropa, no existe.',
    description: 'Cajones que no cierran, perchas amontonadas y la típica frase: "tío, no tengo nada que ponerme". Cuando tus prendas están escondidas, vistes en piloto automático. Klozet te saca todo a la luz en una cuadrícula limpia.'
  },
  {
    id: 'escaner',
    number: '03',
    tag: 'Escáner HD',
    title: 'Foto en la percha y recorte limpio al segundo.',
    highlight: 'Cero fondos cutres en tu pantalla.',
    description: 'Tírale una foto con el móvil colgada en la puerta de tu cuarto. La app aísla la prenda automáticamente, limpia las sombras y la guarda en calidad estudio lista para montar en cualquier outfit.'
  },
  {
    id: 'lienzo',
    number: '04',
    tag: 'El Lienzo',
    title: 'Monta el fit en pantalla antes de desordenar el cuarto.',
    highlight: 'Arrastra, prueba siluetas y mira si pega.',
    description: '¿Esa sudadera pega con denim ancho o con pantalón de vestir? En vez de sudar cambiándote tres veces, compones el fit en el canvas, ajustas capas y ves cómo queda antes de sacar una sola percha.'
  },
  {
    id: 'kloe',
    number: '05',
    tag: 'Kloe IA',
    title: 'Kloe mira tu ropa real y te saca el look del día.',
    highlight: 'Tu colega que sabe qué combina con qué.',
    description: 'Dile a qué plan vas y qué tiempo hace: "tengo cena en Chueca y hace rasca" o "voy a la uni en plan chill". Kloe te compone un outfit completo usando únicamente lo que ya tienes colgado. Sin gastar un euro.'
  },
  {
    id: 'stories',
    number: '06',
    tag: 'Social & Stories',
    title: 'Pilla ideas de la peña y saca tu fit a Stories.',
    highlight: 'De tu armario a Instagram en 9:16.',
    description: 'Descubre cómo combina la comunidad las prendas que tú también tienes, guarda combinaciones en carpetas privadas y exporta tu fit del día a Instagram Stories en formato 9:16 con un solo toque.'
  },
  {
    id: 'prueba',
    number: '07',
    tag: 'Prueba Klozet',
    title: 'Prueba Klozet gratis.',
    highlight: 'Empieza a vestir con intención.',
    description: 'Sube tus primeras 5 prendas de confianza y deja de perder media hora cada mañana frente al armario. Tu ropa ya es buena, solo necesitas verla bien.'
  }
];

export default function InteractiveSlideLanding() {
  const { user } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Slide 3 state: Scanner
  const [activeScanItem, setActiveScanItem] = useState(0);

  // Slide 4 state: Canvas toggle
  const [activeCanvasLook, setActiveCanvasLook] = useState<'street' | 'smart'>('street');

  // Slide 6 state: Like counter
  const [likedStory, setLikedStory] = useState(false);
  const [likeCount, setLikeCount] = useState(2438);

  const totalSlides = SLIDES.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    if (index < 0 || index >= totalSlides) return;

    setIsTransitioning(true);
    try { triggerHaptic('light'); } catch {}
    setCurrentSlide(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 550);
  }, [isTransitioning, totalSlides]);

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

  // Keyboard navigation (Left / Right / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Wheel listener with smooth debouncing (allows vertical scrolling inside Slide 7)
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout | null = null;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.allow-wheel-scroll')) {
        return; // Allow native scroll inside Slide 7 footer
      }

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      accumulatedDelta += delta;

      if (wheelTimeout) clearTimeout(wheelTimeout);

      wheelTimeout = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > 45) {
          if (accumulatedDelta > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
        accumulatedDelta = 0;
      }, 50);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [nextSlide, prevSlide]);

  // Touch swipe support (horizontal)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = (touchStartY.current || 0) - touchEndY;

    // Only trigger if horizontal swipe is greater than vertical drift
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleToggleLike = () => {
    try { triggerHaptic('medium'); } catch {}
    setLikedStory(prev => {
      const next = !prev;
      setLikeCount(c => next ? c + 1 : c - 1);
      return next;
    });
  };

  const scanItems = [
    {
      name: 'Sudadera Scuffers Beige',
      brand: 'Scuffers Co.',
      img: '/landing/sudadera-scuffers-cutout.png',
      tag: 'Streetwear',
      cut: 'Boxy Fit / Oversized',
      color: 'Beige Arena (#E4DBCF)',
      prec: '99.8%'
    },
    {
      name: 'Onitsuka Tiger Mexico 66',
      brand: 'Onitsuka Tiger',
      img: '/landing/onitsuka-tiger.png',
      tag: 'Sneakers',
      cut: 'Silueta Slim / Retro',
      color: 'Amarillo Kill Bill (#FFD200)',
      prec: '99.9%'
    },
    {
      name: 'Camisa Popelín Rayas',
      brand: 'Zara Studio',
      img: '/landing/camisa-zara-cutout.png',
      tag: 'Smart Casual',
      cut: 'Relaxed Fit',
      color: 'Azul Oxford / Blanco',
      prec: '99.6%'
    },
    {
      name: 'Botas Cowboy Cuero',
      brand: 'Vintage Archive',
      img: '/landing/botas-cowboy.png',
      tag: 'Calzado',
      cut: 'Caña Media / Piel',
      color: 'Camel Envejecido',
      prec: '99.4%'
    }
  ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[100dvh] overflow-hidden bg-white text-zinc-900 selection:bg-[var(--brand-pink)] selection:text-white font-sans select-none"
    >
      {/* 1. Header Mínimo Fijo: Icono a la izquierda y botones a la derecha (Se oculta en el último slider) */}
      <AnimatePresence>
        {!isLastSlide && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-10 py-5 flex items-center justify-between pointer-events-auto bg-white/70 backdrop-blur-xl border-b border-black/[0.04]"
          >
            {/* Icono / Logo a la izquierda del todo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 group active:scale-95 transition-transform focus:outline-none"
              aria-label="Klozet Inicio"
            >
              <div className="relative h-8 sm:h-9 w-28 sm:w-32 shrink-0">
                <Image 
                  src="/landing/klozet-nombre-grande.png" 
                  alt="Klozet" 
                  fill 
                  sizes="128px"
                  className="object-contain object-left" 
                  priority 
                />
              </div>
            </Link>

            {/* Dos botones: Iniciar sesión o Registrarse */}
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <button className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-zinc-700 hover:text-black transition-colors cursor-pointer">
                  Iniciar sesión
                </button>
              </Link>
              <Link href="/auth">
                <button className="px-4 sm:px-5 py-2 rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(255,102,196,0.35)] transition-all active:scale-95 cursor-pointer">
                  Registrarse
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Flechas Laterales de Deslizamiento (Desktop) */}
      {currentSlide > 0 && (
        <button
          onClick={prevSlide}
          className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/90 hover:bg-zinc-50 backdrop-blur-xl border border-zinc-200/80 items-center justify-center text-zinc-800 transition-all cursor-pointer shadow-lg active:scale-95 group"
          aria-label="Diapositiva anterior"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>
      )}

      {currentSlide < totalSlides - 1 && (
        <button
          onClick={nextSlide}
          className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/90 hover:bg-zinc-50 backdrop-blur-xl border border-zinc-200/80 items-center justify-center text-zinc-800 transition-all cursor-pointer shadow-lg active:scale-95 group"
          aria-label="Siguiente diapositiva"
        >
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* 3. Barra Flotante Inferior de Navegación Rápida */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-[92vw] max-w-sm">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-2xl border border-zinc-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[var(--brand-pink)]">
              {SLIDES[currentSlide].number}
            </span>
            <span className="text-zinc-400">/</span>
            <span className="text-xs font-mono text-zinc-500">
              0{totalSlides}
            </span>
            <span className="text-xs font-medium text-zinc-700 ml-1 truncate max-w-[120px] sm:max-w-none">
              {SLIDES[currentSlide].tag}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentSlide > 0 && (
              <button
                onClick={prevSlide}
                className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer transition-colors active:scale-95"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {currentSlide < totalSlides - 1 ? (
              <button
                onClick={nextSlide}
                className="px-4 py-1.5 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-zinc-800 transition-colors active:scale-95"
                aria-label="Siguiente"
              >
                <span>Deslizar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link href="/auth">
                <div className="px-4 py-1.5 rounded-full bg-[var(--brand-pink)] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95">
                  <span>Registrarse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. SLIDER TRACK HORIZONTAL SILKY (60FPS GPU TRANSLATE-X) */}
      {/* =================================================================== */}
      <div 
        className="w-full h-full flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
        style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
      >

        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 01: EL ARCHIVO // LOOKBOOK REAL (FRAME-BY-FRAME) */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-24 pb-20 relative overflow-hidden bg-white">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto Editorial */}
            <motion.div 
              key={`text-01-${currentSlide === 0}`}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSlide === 0 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse" />
                <span className="text-xs font-mono tracking-wider text-zinc-600">01 // EL ARCHIVO</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12] mb-3">
                Tienes el armario petado y siempre sales con lo mismo.
              </h1>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                Tu ropa no es para tenerla olvidada en perchas.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                Te pruebas cuatro sudaderas antes de pillar el metro para acabar saliendo con la de siempre. Klozet convierte tu caos en un lookbook interactivo: ves tus prendas juntas, pruebas combinaciones al vuelo y sales con el fit clavado.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/auth">
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    className="px-6 py-3 rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white font-bold text-sm flex items-center gap-2 shadow-[0_6px_20px_rgba(255,102,196,0.35)] cursor-pointer transition-colors"
                  >
                    <span>Montar mi armario gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                <button 
                  onClick={nextSlide}
                  className="px-5 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-semibold flex items-center gap-2 border border-zinc-200 cursor-pointer transition-colors"
                >
                  <span>Ver cómo funciona</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Escena Lookbook Central: Prendas en capas y stickers frame-by-frame */}
            <div className="lg:col-span-6 flex justify-center items-center relative">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl bg-zinc-50 border border-zinc-200/90 p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                
                {/* Cabecera del Lookbook */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-bold tracking-wider text-zinc-800">LOOK 01 · STREET ARCHIVE</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-600 bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-sm">
                    OOTD 10/10
                  </span>
                </div>

                {/* Prendas superpuestas animadas en cascada */}
                <div className="relative flex-1 flex flex-col items-center justify-center my-1">
                  {/* Capa 1: Sudadera Scuffers */}
                  <motion.div
                    key={`hoodie-${currentSlide === 0}`}
                    initial={{ opacity: 0, y: -20, rotate: -4 }}
                    animate={currentSlide === 0 ? { opacity: 1, y: 0, rotate: -2 } : { opacity: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 350, damping: 22 }}
                    className="relative w-36 sm:w-44 aspect-square z-20 drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                  >
                    <Image 
                      src="/landing/sudadera-scuffers-cutout.png" 
                      alt="Sudadera Scuffers" 
                      fill 
                      sizes="(max-width: 640px) 144px, 176px"
                      className="object-contain" 
                      priority 
                    />
                  </motion.div>

                  {/* Capa 2: Pantalón Denim Estrellas */}
                  <motion.div
                    key={`jeans-${currentSlide === 0}`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={currentSlide === 0 ? { opacity: 1, y: -12, scale: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 320, damping: 22 }}
                    className="relative w-32 sm:w-40 aspect-[3/4] z-10 -mt-12 drop-shadow-[0_12px_20px_rgba(0,0,0,0.12)]"
                  >
                    <Image 
                      src="/landing/jeans-stars.png" 
                      alt="Jeans Stars Loose" 
                      fill 
                      sizes="(max-width: 640px) 128px, 160px"
                      className="object-contain" 
                    />
                  </motion.div>

                  {/* Capa 3: Onitsuka Tiger */}
                  <motion.div
                    key={`shoes-${currentSlide === 0}`}
                    initial={{ opacity: 0, y: 25, rotate: 6 }}
                    animate={currentSlide === 0 ? { opacity: 1, y: -8, rotate: 4 } : { opacity: 0 }}
                    transition={{ delay: 0.45, duration: 0.5, type: 'spring', stiffness: 360, damping: 24 }}
                    className="relative w-28 sm:w-36 aspect-video z-30 -mt-8 drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                  >
                    <Image 
                      src="/landing/onitsuka-tiger.png" 
                      alt="Onitsuka Tiger Mexico 66" 
                      fill 
                      sizes="(max-width: 640px) 112px, 144px"
                      className="object-contain" 
                    />
                  </motion.div>

                  {/* Sticker 1: Scuffers Co. */}
                  <motion.div
                    key={`tag1-${currentSlide === 0}`}
                    initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
                    animate={currentSlide === 0 ? { opacity: 1, scale: 1, rotate: -8 } : { opacity: 0 }}
                    transition={{ delay: 0.55, type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute top-2 left-2 z-30 px-2.5 py-1 rounded-xl bg-zinc-950 text-white font-bold text-[11px] shadow-lg"
                  >
                    Scuffers Co. · Beige
                  </motion.div>

                  {/* Sticker 2: Onitsuka Sneaker */}
                  <motion.div
                    key={`tag2-${currentSlide === 0}`}
                    initial={{ opacity: 0, scale: 0.7, rotate: 12 }}
                    animate={currentSlide === 0 ? { opacity: 1, scale: 1, rotate: 6 } : { opacity: 0 }}
                    transition={{ delay: 0.65, type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute bottom-2 right-2 z-30 px-2.5 py-1 rounded-xl bg-[var(--brand-pink)] text-white font-bold text-[11px] shadow-lg"
                  >
                    Onitsuka Tiger · 66
                  </motion.div>
                </div>

                {/* Footer del Lookbook */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 z-10 text-xs">
                  <span className="text-zinc-500 font-medium">Total 3 piezas combinadas</span>
                  <span className="font-bold text-zinc-900 flex items-center gap-1">
                    <span>Fit Armonizado</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 02: EL DRAMA REAL // LA SILLA VS EL ARMARIO DIGITAL */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-24 pb-20 relative overflow-hidden bg-white">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto */}
            <motion.div 
              key={`text-02-${currentSlide === 1}`}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSlide === 1 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-mono tracking-wider text-amber-900">02 // EL DRAMA REAL</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12] mb-3">
                La famosa silla con 8 prendas encima.
              </h2>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                Si no ves tu ropa, no existe.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                Cajones que no cierran, perchas amontonadas y la típica frase: <span className="italic text-zinc-900 font-medium">"tío, no tengo nada que ponerme"</span>. Cuando tus prendas están escondidas, vistes en piloto automático. Klozet te saca todo a la luz en una cuadrícula limpia.
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Caos analógico</span>
                </div>
                <span>→</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Archivo visible</span>
                </div>
              </div>
            </motion.div>

            {/* Comparativa Visual: Caos vs Orden */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Tarjeta 1: La Silla del Caos */}
              <motion.div
                key={`chair-${currentSlide === 1}`}
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="rounded-3xl bg-rose-50/60 border border-rose-200/70 p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 font-semibold">
                    08:15 AM · Caos
                  </span>
                  <span className="text-xs text-zinc-600 font-medium">La Silla</span>
                </div>

                {/* Montaña de ropa desordenada */}
                <div className="relative h-48 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: [-6, -4, -6] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute w-28 h-28 opacity-90 drop-shadow-md"
                  >
                    <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera" fill className="object-contain" />
                  </motion.div>
                  <motion.div 
                    animate={{ rotate: [12, 10, 12] }}
                    transition={{ repeat: Infinity, duration: 3.5 }}
                    className="absolute w-28 h-28 top-4 right-2 opacity-85 drop-shadow-md"
                  >
                    <Image src="/landing/camisa-zara-cutout.png" alt="Camisa" fill className="object-contain" />
                  </motion.div>
                  <motion.div 
                    animate={{ rotate: [-14, -12, -14] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="absolute w-28 h-28 bottom-1 left-2 opacity-80 drop-shadow-md"
                  >
                    <Image src="/landing/botas-cowboy.png" alt="Botas" fill className="object-contain" />
                  </motion.div>
                </div>

                <div className="pt-3 border-t border-rose-200 text-xs text-zinc-600">
                  <span className="text-rose-700 font-semibold">8 prendas arrugadas</span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Media hora perdida antes de salir</p>
                </div>
              </motion.div>

              {/* Tarjeta 2: Klozet Archivo Ordenado */}
              <motion.div
                key={`rack-${currentSlide === 1}`}
                initial={{ opacity: 0, y: 30 }}
                animate={currentSlide === 1 ? { opacity: 1, y: 0 } : { opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-3xl bg-white border border-zinc-200 p-5 flex flex-col justify-between relative shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                    Tu Armario Klozet
                  </span>
                  <span className="text-xs font-bold text-zinc-900">4 Prendas HD</span>
                </div>

                {/* Cuadrícula organizada 2x2 */}
                <div className="grid grid-cols-2 gap-2 h-48 items-center">
                  <div className="relative aspect-square rounded-xl bg-zinc-50 p-2 flex items-center justify-center border border-zinc-100">
                    <Image src="/landing/sudadera-scuffers-cutout.png" alt="Prenda 1" fill className="object-contain p-1" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-white/90 px-1 rounded text-zinc-700 border border-zinc-200">Scuffers</span>
                  </div>
                  <div className="relative aspect-square rounded-xl bg-zinc-50 p-2 flex items-center justify-center border border-zinc-100">
                    <Image src="/landing/camisa-zara-cutout.png" alt="Prenda 2" fill className="object-contain p-1" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-white/90 px-1 rounded text-zinc-700 border border-zinc-200">Zara</span>
                  </div>
                  <div className="relative aspect-square rounded-xl bg-zinc-50 p-2 flex items-center justify-center border border-zinc-100">
                    <Image src="/landing/jeans-stars.png" alt="Prenda 3" fill className="object-contain p-1" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-white/90 px-1 rounded text-zinc-700 border border-zinc-200">Denim</span>
                  </div>
                  <div className="relative aspect-square rounded-xl bg-zinc-50 p-2 flex items-center justify-center border border-zinc-100">
                    <Image src="/landing/onitsuka-tiger.png" alt="Prenda 4" fill className="object-contain p-1" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-white/90 px-1 rounded text-zinc-700 border border-zinc-200">Tiger</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-700">
                  <span className="text-emerald-700 font-semibold">12 outfits posibles</span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Listo en 10 segundos</p>
                </div>
              </motion.div>

            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 03: ESCÁNER HD // ESTUDIO DE PRENDAS INTERACTIVO */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-24 pb-20 relative overflow-hidden bg-white">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto y Selector Interactivo */}
            <motion.div 
              key={`text-03-${currentSlide === 2}`}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSlide === 2 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 mb-4">
                <Scan className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                <span className="text-xs font-mono tracking-wider text-zinc-700">03 // ESCÁNER HD</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12] mb-3">
                Foto en la percha y recorte limpio al segundo.
              </h2>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                Cero fondos cutres en tu pantalla.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                Tírale una foto con el móvil colgada en la puerta de tu cuarto. La app aísla la prenda automáticamente, limpia las sombras y la guarda en calidad estudio lista para montar en cualquier outfit.
              </p>

              {/* Selector de prenda a escanear */}
              <div className="w-full max-w-md">
                <span className="text-xs font-mono text-zinc-500 mb-2 block font-semibold">TOCA PARA PROBAR EL ESCÁNER:</span>
                <div className="grid grid-cols-2 gap-2">
                  {scanItems.map((item, idx) => {
                    const isSelected = activeScanItem === idx;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          try { triggerHaptic('light'); } catch {}
                          setActiveScanItem(idx);
                        }}
                        className={`px-3 py-2 rounded-2xl text-left transition-all text-xs flex items-center justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-950 text-white font-bold border-zinc-950 shadow-md'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        <span className="truncate pr-1">{item.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Cabina de Escaneo Activa con Láser */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl bg-zinc-950 text-white border border-zinc-800 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
                
                {/* Header de la cabina */}
                <div className="flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-pink)] animate-ping" />
                    <span className="text-xs font-mono font-bold tracking-wider text-white">ESCÁNER ACTIVO</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Precisión {scanItems[activeScanItem].prec}
                  </span>
                </div>

                {/* Prenda con rayo láser animado */}
                <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-black/40 border border-white/[0.08]">
                  
                  {/* Láser de barrido */}
                  <motion.div
                    animate={{ top: ['0%', '95%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-pink)] to-transparent z-30 shadow-[0_0_15px_rgba(255,102,196,0.9)]"
                  />

                  {/* Prenda actual en exhibición */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={scanItems[activeScanItem].name}
                      initial={{ opacity: 0, scale: 0.85, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -10 }}
                      transition={{ duration: 0.35, type: 'spring', stiffness: 350, damping: 25 }}
                      className="relative w-52 sm:w-60 aspect-square drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
                    >
                      <Image 
                        src={scanItems[activeScanItem].img} 
                        alt={scanItems[activeScanItem].name} 
                        fill 
                        className="object-contain p-2" 
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Metadatos detectados superpuestos */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20 text-[11px] font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-zinc-300">{scanItems[activeScanItem].brand}</span>
                    <span className="text-[var(--brand-pink)] font-semibold">{scanItems[activeScanItem].tag}</span>
                  </div>
                </div>

                {/* Footer de datos técnicos del escáner */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800 z-20">
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-mono">CORTE DETECTADO</span>
                    <span className="font-semibold text-zinc-100">{scanItems[activeScanItem].cut}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-mono">PALETA</span>
                    <span className="font-semibold text-zinc-100">{scanItems[activeScanItem].color}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 04: EL LIENZO // OUTFIT CANVAS INTERACTIVO */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-24 pb-20 relative overflow-hidden bg-white">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto y Toggle de Outfits */}
            <motion.div 
              key={`text-04-${currentSlide === 3}`}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSlide === 3 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 mb-4">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-xs font-mono tracking-wider text-sky-900">04 // EL LIENZO</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12] mb-3">
                Monta el fit en pantalla antes de desordenar el cuarto.
              </h2>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                Arrastra, prueba siluetas y mira si pega.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                ¿Esa sudadera pega con denim ancho o con pantalón de vestir? En vez de sudar cambiándote tres veces, compones el fit en el canvas, ajustas capas y ves cómo queda antes de sacar una sola percha.
              </p>

              {/* Botones de Estilos */}
              <div className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-100 border border-zinc-200">
                <button
                  onClick={() => {
                    try { triggerHaptic('light'); } catch {}
                    setActiveCanvasLook('street');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCanvasLook === 'street'
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  Look 1: Streetwear Chill
                </button>
                <button
                  onClick={() => {
                    try { triggerHaptic('light'); } catch {}
                    setActiveCanvasLook('smart');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCanvasLook === 'smart'
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  Look 2: Smart Night
                </button>
              </div>
            </motion.div>

            {/* Lienzo Visual Interactivo */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl bg-zinc-50 border border-zinc-200/90 p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-lg">
                
                {/* Header del Canvas */}
                <div className="flex items-center justify-between z-20">
                  <span className="text-xs font-mono font-bold tracking-wider text-zinc-800">
                    {activeCanvasLook === 'street' ? 'CANVAS // STREET ARCHIVE' : 'CANVAS // SMART VINTAGE'}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--brand-pink)] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200 font-semibold">
                    {activeCanvasLook === 'street' ? 'Balance: 98%' : 'Balance: 96%'}
                  </span>
                </div>

                {/* Previsualización Dinámica del Look */}
                <div className="relative flex-1 flex flex-col items-center justify-center my-2">
                  <AnimatePresence mode="wait">
                    {activeCanvasLook === 'street' ? (
                      <motion.div
                        key="street-look"
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -15 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 340, damping: 24 }}
                        className="relative flex flex-col items-center w-full"
                      >
                        {/* Top: Sudadera */}
                        <div className="relative w-36 sm:w-44 aspect-square z-20 drop-shadow-md">
                          <Image src="/landing/sudadera-scuffers-cutout.png" alt="Top Street" fill className="object-contain" />
                        </div>
                        {/* Bottom: Jeans */}
                        <div className="relative w-32 sm:w-40 aspect-[3/4] z-10 -mt-12 drop-shadow-md">
                          <Image src="/landing/jeans-stars.png" alt="Bottom Street" fill className="object-contain" />
                        </div>
                        {/* Footwear: Onitsuka */}
                        <div className="relative w-28 sm:w-36 aspect-video z-30 -mt-8 drop-shadow-md">
                          <Image src="/landing/onitsuka-tiger.png" alt="Shoes Street" fill className="object-contain" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="smart-look"
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -15 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 340, damping: 24 }}
                        className="relative flex flex-col items-center w-full"
                      >
                        {/* Top: Camisa Zara */}
                        <div className="relative w-36 sm:w-44 aspect-square z-20 drop-shadow-md">
                          <Image src="/landing/camisa-zara-cutout.png" alt="Top Smart" fill className="object-contain" />
                        </div>
                        {/* Bottom: Pantalon Blanco */}
                        <div className="relative w-32 sm:w-40 aspect-[3/4] z-10 -mt-12 drop-shadow-md">
                          <Image src="/landing/pantalon-blanco.png" alt="Bottom Smart" fill className="object-contain" />
                        </div>
                        {/* Footwear: Cowboy Boots */}
                        <div className="relative w-28 sm:w-36 aspect-square z-30 -mt-8 drop-shadow-md">
                          <Image src="/landing/botas-cowboy.png" alt="Shoes Smart" fill className="object-contain" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer del Canvas */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 z-20 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    <span className="text-[11px] text-zinc-500 ml-1">Paleta Armonizada</span>
                  </div>
                  <span className="font-bold text-zinc-900 text-[11px]">Guardar en Armario</span>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 05: KLOE IA // ESTILISTA CONVERSACIONAL REAL */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-24 pb-20 relative overflow-hidden bg-white">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto */}
            <motion.div 
              key={`text-05-${currentSlide === 4}`}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSlide === 4 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)]" />
                <span className="text-xs font-mono tracking-wider text-[var(--brand-pink-dark)] font-semibold">05 // KLOE IA</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12] mb-3">
                Kloe mira tu ropa real y te saca el look del día.
              </h2>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                Tu colega que sabe qué combina con qué.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                Dile a qué plan vas y qué tiempo hace: <span className="italic text-zinc-900 font-medium">"tengo cena en Chueca y hace rasca"</span> o <span className="italic text-zinc-900 font-medium">"voy a la uni en plan chill"</span>. Kloe te compone un outfit completo usando únicamente lo que ya tienes colgado. Sin gastar un euro.
              </p>

              <Link href="/auth">
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-3 rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white font-bold text-sm flex items-center gap-2 shadow-[0_6px_20px_rgba(255,102,196,0.35)] cursor-pointer transition-colors"
                >
                  <span>Chatear con Kloe</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Chat Bubble Interactivo con Kloe */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-md rounded-3xl bg-zinc-50 border border-zinc-200/90 p-6 flex flex-col gap-4 shadow-lg">
                
                {/* Header Kloe con Wordmark Oficial */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-7">
                      <Image 
                        src="/landing/kloe-grande-landing.png" 
                        alt="Kloe" 
                        fill 
                        className="object-contain object-left" 
                      />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      En línea
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">Estilismo 24/7</span>
                </div>

                {/* Mensaje del Usuario */}
                <motion.div
                  key={`user-msg-${currentSlide === 4}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ delay: 0.15 }}
                  className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-200 text-zinc-900 px-4 py-2.5 text-xs leading-relaxed font-medium"
                >
                  Kloe, tengo cena en Madrid centro a las 21:00h, unos 14°C. Quiero ir arreglado pero sin parecer que voy a una boda.
                </motion.div>

                {/* Respuesta de Kloe */}
                <motion.div
                  key={`kloe-reply-${currentSlide === 4}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={currentSlide === 4 ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ delay: 0.35 }}
                  className="self-start max-w-[92%] rounded-2xl rounded-tl-sm bg-pink-50 border border-pink-200/90 p-4 text-xs text-zinc-900 leading-relaxed flex flex-col gap-3"
                >
                  <p className="text-zinc-800">
                    Te tengo. Ponte la sobrecamisa de popelín de Zara abierta sobre camiseta blanca básica, jeans oscuros y remata con las botas cowboy de cuero. Vas impecable, cómodo y con rollo. Cero postureo forzado.
                  </p>

                  {/* Fila de prendas recomendadas */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pink-200">
                    <div className="relative aspect-square rounded-xl bg-white p-1 flex items-center justify-center border border-pink-100 shadow-sm">
                      <Image src="/landing/camisa-zara-cutout.png" alt="Camisa" fill className="object-contain p-1" />
                    </div>
                    <div className="relative aspect-square rounded-xl bg-white p-1 flex items-center justify-center border border-pink-100 shadow-sm">
                      <Image src="/landing/jeans-stars.png" alt="Jeans" fill className="object-contain p-1" />
                    </div>
                    <div className="relative aspect-square rounded-xl bg-white p-1 flex items-center justify-center border border-pink-100 shadow-sm">
                      <Image src="/landing/botas-cowboy.png" alt="Botas" fill className="object-contain p-1" />
                    </div>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200">
                  <span>3 prendas de tu armario usadas</span>
                  <span className="text-[var(--brand-pink-dark)] font-bold cursor-pointer">Montar look en 1 toque →</span>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 06: COMUNIDAD & STORIES // 9:16 INTERACTIVO */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-24 pb-20 relative overflow-hidden bg-white">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto */}
            <motion.div 
              key={`text-06-${currentSlide === 5}`}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSlide === 5 ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 mb-4">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-xs font-mono tracking-wider text-pink-900">06 // SOCIAL & STORIES</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12] mb-3">
                Pilla ideas de la peña y saca tu fit a Stories.
              </h2>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                De tu armario a Instagram en 9:16.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl mb-6">
                Descubre cómo combina la comunidad las prendas que tú también tienes, guarda combinaciones en carpetas privadas y exporta tu fit del día a Instagram Stories en formato 9:16 con un solo toque.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleLike}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    likedStory 
                      ? 'bg-[var(--brand-pink)] text-white shadow-md' 
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedStory ? 'fill-white' : ''}`} />
                  <span>{likeCount} Me gusta</span>
                </button>
                <span className="text-xs text-zinc-500 font-mono">Toca para interactuar</span>
              </div>
            </motion.div>

            {/* Mockup Móvil 9:16 de Instagram Story */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <motion.div
                key={`story-${currentSlide === 5}`}
                initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                animate={currentSlide === 5 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 320, damping: 24 }}
                className="relative w-64 sm:w-72 aspect-[9/16] rounded-[36px] border-4 border-zinc-900 bg-zinc-950 p-3 shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Imagen del Post a Sangre */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src="/landing/outfits/chico-denim-sneakers-street.jpg" 
                    alt="Story Fit" 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
                </div>

                {/* Barra de Progreso Story Superior */}
                <div className="relative z-10 flex items-center gap-1 pt-1">
                  <div className="h-1 flex-1 bg-white rounded-full" />
                  <div className="h-1 flex-1 bg-white/40 rounded-full" />
                  <div className="h-1 flex-1 bg-white/40 rounded-full" />
                </div>

                {/* Usuario y Ubicación */}
                <div className="relative z-10 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)] p-0.5 border border-white">
                      <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-[11px] font-bold text-white">
                        C
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">carlos_m</span>
                      <span className="text-[10px] text-zinc-300">Madrid · Hace 2h</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white">
                    9:16 OOTD
                  </span>
                </div>

                {/* Stickers y Controles Inferiores */}
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold bg-white text-zinc-950 px-2.5 py-1 rounded-lg shadow-md">
                      FIT CHECK 🔥
                    </span>
                    <span className="text-[10px] font-bold bg-[var(--brand-pink)] text-white px-2.5 py-1 rounded-lg shadow-md">
                      KLOZET ARCHIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={handleToggleLike}
                      className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white border border-white/20 active:scale-95 cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedStory ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : ''}`} />
                      <span>{likeCount}</span>
                    </button>
                    <span className="text-[11px] text-white/90 font-medium bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                      Compartir
                    </span>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 07: PRUEBA KLOZET // ACCESOS Y FOOTER LEGAL COMPLETO */}
        {/* ----------------------------------------------------------------- */}
        <section className="w-full h-[100dvh] min-w-full shrink-0 flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-16 pb-20 relative overflow-y-auto allow-wheel-scroll bg-white">
          
          <div className="max-w-5xl w-full mx-auto my-auto py-8">
            {/* CTA Principal de Prueba Klozet con los dos botones */}
            <div className="rounded-3xl bg-zinc-50 border border-zinc-200/90 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm relative overflow-hidden mb-12">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                <span className="text-xs font-mono tracking-wider text-[var(--brand-pink-dark)] font-semibold">07 // PRUEBA KLOZET</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 mb-3">
                Prueba Klozet gratis.
              </h2>
              
              <p className="text-xl sm:text-2xl font-semibold text-[var(--brand-pink)] mb-4">
                Empieza a vestir con intención.
              </p>

              <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto mb-8 leading-relaxed">
                Sube tus primeras 5 prendas de confianza y deja de perder media hora cada mañana frente al armario. Tu ropa ya es buena, solo necesitas verla bien.
              </p>

              {/* Los dos botones requeridos: Registrarse e Iniciar sesión */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/auth" className="w-full sm:w-auto">
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,102,196,0.35)] cursor-pointer transition-colors"
                  >
                    <span>Registrarse gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                <Link href="/auth" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm cursor-pointer transition-colors">
                    Iniciar sesión
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  100% Gratuito
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Privacidad RGPD Europea
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Web y App PWA
                </span>
              </div>
            </div>

            {/* Grid del Footer Moderno con Acceso a Sobre Nosotros, Tendencias y Políticas Legales */}
            <div className="pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
              
              {/* Columna 1: Marca Klozet */}
              <div className="col-span-2 md:col-span-1">
                <div className="relative w-28 h-8 mb-3">
                  <Image 
                    src="/landing/klozet-nombre-grande.png" 
                    alt="Klozet" 
                    fill 
                    className="object-contain object-left" 
                  />
                </div>
                <p className="text-zinc-600 leading-relaxed mb-3">
                  Tu armario inteligente y red social de moda. Creado con pasión en Sevilla.
                </p>
                <span className="text-zinc-400 font-mono text-[11px]">
                  © 2026 Klozet. Todos los derechos reservados.
                </span>
              </div>

              {/* Columna 2: Navegación & Sobre Nosotros */}
              <div>
                <span className="font-bold text-zinc-950 uppercase tracking-wider text-[11px] font-mono block mb-3">
                  Explorar
                </span>
                <ul className="space-y-2 text-zinc-600">
                  <li><Link href="/about" className="hover:text-black font-medium transition-colors">Sobre Nosotros</Link></li>
                  <li><Link href="/trends" className="hover:text-black font-medium transition-colors">Tendencias & Guías</Link></li>
                  <li><Link href="/contact" className="hover:text-black font-medium transition-colors">Contacto</Link></li>
                  <li><Link href="/auth" className="hover:text-black font-medium transition-colors">Crear Cuenta</Link></li>
                </ul>
              </div>

              {/* Columna 3: Políticas Legales */}
              <div>
                <span className="font-bold text-zinc-950 uppercase tracking-wider text-[11px] font-mono block mb-3">
                  Legal & Privacidad
                </span>
                <ul className="space-y-2 text-zinc-600">
                  <li><Link href="/privacy" className="hover:text-black font-medium transition-colors">Política de Privacidad</Link></li>
                  <li><Link href="/terms" className="hover:text-black font-medium transition-colors">Términos y Condiciones</Link></li>
                  <li><Link href="/cookies" className="hover:text-black font-medium transition-colors">Política de Cookies</Link></li>
                  <li><Link href="/legal" className="hover:text-black font-medium transition-colors">Aviso Legal</Link></li>
                </ul>
              </div>

              {/* Columna 4: Soporte */}
              <div>
                <span className="font-bold text-zinc-950 uppercase tracking-wider text-[11px] font-mono block mb-3">
                  Soporte Directo
                </span>
                <p className="text-zinc-600 leading-relaxed mb-2">
                  ¿Dudas o necesitas ayuda con tu armario?
                </p>
                <a 
                  href="mailto:soporte@klozet.es" 
                  className="text-[var(--brand-pink)] hover:underline font-mono text-xs block mb-2 font-semibold"
                >
                  soporte@klozet.es
                </a>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Sistemas Operativos
                </span>
              </div>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
