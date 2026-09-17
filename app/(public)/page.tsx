'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles,
  Camera,
  Layers,
  Calendar,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  X
} from 'lucide-react';
import { useUser } from '@/store';

// Interactive slot machine items for the "Dress Me" / Clueless style builder
interface WardrobeSlotItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessory';
  brand?: string;
  color: string;
  image?: string;
  tag: string;
}

const TOPS_DATA: WardrobeSlotItem[] = [
  { id: 'top-1', name: 'Hoodie Boxy Oversize', category: 'top', brand: 'Klozet Essentials', color: '#E8E4DF', image: '/sudadera.png', tag: 'Streetwear' },
  { id: 'top-2', name: 'Blazer Sastre Charcoal', category: 'top', brand: 'Minimal Studio', color: '#27272A', tag: 'Clean Look' },
  { id: 'top-3', name: 'Camisa Lino Estructurada', category: 'top', brand: 'Atelier', color: '#F4F4F5', tag: 'Old Money' },
  { id: 'top-4', name: 'Top Cropped Canalé', category: 'top', brand: 'Urban Line', color: '#FB7185', tag: 'Y2K' },
];

const BOTTOMS_DATA: WardrobeSlotItem[] = [
  { id: 'bot-1', name: 'Pantalón Cargo Lavado', category: 'bottom', brand: 'Daily Wear', color: '#3F3F46', image: '/pantalon.png', tag: 'Relaxed' },
  { id: 'bot-2', name: 'Jeans Wide Leg Vintage', category: 'bottom', brand: 'Denim Co.', color: '#60A5FA', tag: 'Streetwear' },
  { id: 'bot-3', name: 'Pantalón Pinzas Pleated', category: 'bottom', brand: 'Tailored', color: '#18181B', tag: 'Smart Casual' },
  { id: 'bot-4', name: 'Falda Midi Plisada', category: 'bottom', brand: 'Studio Chic', color: '#E2E8F0', tag: 'Minimal' },
];

const SHOES_DATA: WardrobeSlotItem[] = [
  { id: 'sho-1', name: 'Sneakers Retro 550', category: 'shoes', brand: 'New Balance', color: '#F1F5F9', image: '/new balance.png', tag: 'Bambas' },
  { id: 'sho-2', name: 'Botas Chelsea Cuero', category: 'shoes', brand: 'Craftsman', color: '#18181B', tag: 'Botas' },
  { id: 'sho-3', name: 'Mocasines Chunky', category: 'shoes', brand: 'Modern Classic', color: '#09090B', tag: 'Mocasines' },
  { id: 'sho-4', name: 'Sambas Clásicas Blancas', category: 'shoes', brand: 'Terrace', color: '#FFFFFF', tag: 'Casual' },
];

const ACCESSORIES_DATA: WardrobeSlotItem[] = [
  { id: 'acc-1', name: 'Reloj Cronógrafo Acero', category: 'accessory', brand: 'Precision', color: '#CBD5E1', image: '/reloj.png', tag: 'Detalle' },
  { id: 'acc-2', name: 'Bolso Baguette Cuero', category: 'accessory', brand: 'L\'Atelier', color: '#713F12', tag: 'Bolso' },
  { id: 'acc-3', name: 'Gafas de Sol Vintage 90s', category: 'accessory', brand: 'Archive', color: '#000000', tag: 'Gafas' },
  { id: 'acc-4', name: 'Gorra Bordada Washed', category: 'accessory', brand: 'Street Club', color: '#334155', tag: 'Gorra' },
];

export default function LandingPage() {
  const { user } = useUser();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Slot machine active indices
  const [topIdx, setTopIdx] = useState(0);
  const [bottomIdx, setBottomIdx] = useState(0);
  const [shoesIdx, setShoesIdx] = useState(0);
  const [accIdx, setAccIdx] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledCount, setShuffledCount] = useState(0);

  // Smart sticky header
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

  // Shuffle generator animation
  const handleShuffle = () => {
    setIsShuffling(true);
    let iterations = 0;
    const interval = setInterval(() => {
      setTopIdx(Math.floor(Math.random() * TOPS_DATA.length));
      setBottomIdx(Math.floor(Math.random() * BOTTOMS_DATA.length));
      setShoesIdx(Math.floor(Math.random() * SHOES_DATA.length));
      setAccIdx(Math.floor(Math.random() * ACCESSORIES_DATA.length));
      iterations++;
      if (iterations >= 6) {
        clearInterval(interval);
        setIsShuffling(false);
        setShuffledCount(prev => prev + 1);
      }
    }, 90);
  };

  const outfitShowcase = [
    {
      title: "Clean Look",
      category: "Básicos Elevados",
      image: "/styles/women/clean-look.jpg",
      tags: ["Tonalidades neutras", "Blazer oversize", "Zapatillas blancas"]
    },
    {
      title: "Streetwear Urbano",
      category: "Cultura & Tendencia",
      image: "/styles/men/streetwear.jpg",
      tags: ["Hoodie boxy", "Cargo pants", "Sneakers retro"]
    },
    {
      title: "Old Money & Quiet Luxury",
      category: "Elegancia Sin Esfuerzo",
      image: "/styles/women/old-money.jpg",
      tags: ["Polo punto", "Pantalón pinzas", "Mocasines"]
    },
    {
      title: "Casual Moderno",
      category: "Día a Día",
      image: "/styles/men/casual-moderno.jpg",
      tags: ["Sobrecamisa", "Denim lavado", "Accesorios plata"]
    }
  ];

  const beforeVsAfter = [
    {
      problem: "Montaña de ropa sobre la silla y 20 minutos de indecisión cada mañana.",
      solution: "Tu armario completo en el móvil. Despiértate sabiendo exactamente qué ponerte."
    },
    {
      problem: "Compras prendas impulsivas que luego nunca sabes cómo combinar.",
      solution: "Prueba digitalmente cómo combina antes de comprar o rescata joyas olvidadas de tu armario."
    },
    {
      problem: "Usar siempre los mismos 3 conjuntos por pereza a revolver cajones.",
      solution: "Combina prendas en un lienzo interactivo libre o deja que Klozet te arme outfits nuevos."
    },
    {
      problem: "Hacer maletas a ciegas o no recordar qué ropa tienes de temporada.",
      solution: "Planifica tus looks por días en el calendario y viaja con outfits calculados al milímetro."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between antialiased">
      
      {/* 1. SMART STICKY HEADER */}
      <AnimatePresence>
        {showHeader && (
          <motion.header 
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 w-full apple-glass-bar border-b border-[var(--border-color)]/50 shadow-sm"
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

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--foreground-secondary)]">
                <a href="#dress-me" className="hover:text-[var(--foreground)] transition-colors">Combíname un look</a>
                <a href="#filosofia" className="hover:text-[var(--foreground)] transition-colors">¿Por qué digitalizar?</a>
                <a href="#como-funciona" className="hover:text-[var(--foreground)] transition-colors">Cómo funciona</a>
                <a href="#lookbook" className="hover:text-[var(--foreground)] transition-colors">Inspo</a>
              </nav>

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

      {/* 2. HERO SECTION CON ESTILO WHERING (EDITORIAL & BOLD) */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-gradient-to-tr from-[var(--brand-pink)]/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-sm mb-6 text-xs sm:text-sm font-semibold text-[var(--foreground-secondary)]"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse" />
            <span>Digitaliza tu armario. Vístete al estilo Clueless.</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.06]"
          >
            Ama tu ropa. <br />
            <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Vístete sin dramas cada mañana.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-[var(--foreground-secondary)] max-w-2xl leading-relaxed font-normal"
          >
            Organiza tus prendas en la palma de tu mano, combina outfits en un lienzo interactivo, planifica tu semana y recibe estilismo personalizado con lo que ya tienes.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
          >
            <Link
              href="/auth"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/25 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Empezar gratis en 1 minuto</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#dress-me"
              className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-sm sm:text-base bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
              <span>Probar combinador</span>
            </a>
          </motion.div>

          {/* Floating Trust Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-[var(--foreground-secondary)]"
          >
            <span className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center gap-1.5 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> Recorte automático de fotos
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center gap-1.5 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> 100% tu propia ropa
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center gap-1.5 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> Sin publicidad ni compras forzadas
            </span>
          </motion.div>
        </div>
      </section>

      {/* 3. INTERACTIVE "DRESS ME" / OUTFIT SLOT MACHINE (WHERING / CLUELESS STYLE) */}
      <section id="dress-me" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-[var(--card-bg)]/80 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Header of the interactive widget */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-color)]/60">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-bold mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>EXPERIENCIA INTERACTIVA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                Dress Me: Tu estilista digital
              </h2>
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mt-0.5">
                Desliza cada slot o pulsa &ldquo;Combíname un look&rdquo; para mezclar prendas de inmediato.
              </p>
            </div>

            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-sm bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] active:scale-95 transition-all shadow-lg shadow-[var(--brand-pink)]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Combinando...' : 'Combíname un look'}</span>
            </button>
          </div>

          {/* 4 Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Slot 1: Top */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] relative group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-2">
                01 • Prenda Superior
              </span>
              
              <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-xl bg-[var(--card-bg)]/60 p-4 border border-[var(--border-color)]/40 shadow-inner">
                {TOPS_DATA[topIdx].image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={TOPS_DATA[topIdx].image!}
                      alt={TOPS_DATA[topIdx].name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="w-14 h-14 rounded-2xl mb-2 flex items-center justify-center font-bold text-white shadow-md text-sm" style={{ backgroundColor: TOPS_DATA[topIdx].color }}>
                      TOP
                    </div>
                  </div>
                )}
                
                {/* Prev / Next controls */}
                <button 
                  onClick={() => setTopIdx((prev) => (prev - 1 + TOPS_DATA.length) % TOPS_DATA.length)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Prenda anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setTopIdx((prev) => (prev + 1) % TOPS_DATA.length)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Siguiente prenda"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full mt-3 text-center">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] mb-1">
                  {TOPS_DATA[topIdx].tag}
                </span>
                <p className="text-xs font-bold text-[var(--foreground)] truncate">
                  {TOPS_DATA[topIdx].name}
                </p>
                <p className="text-[11px] text-[var(--foreground-tertiary)] truncate">
                  {TOPS_DATA[topIdx].brand}
                </p>
              </div>
            </div>

            {/* Slot 2: Bottom */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] relative group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-2">
                02 • Prenda Inferior
              </span>
              
              <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-xl bg-[var(--card-bg)]/60 p-4 border border-[var(--border-color)]/40 shadow-inner">
                {BOTTOMS_DATA[bottomIdx].image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={BOTTOMS_DATA[bottomIdx].image!}
                      alt={BOTTOMS_DATA[bottomIdx].name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="w-14 h-14 rounded-2xl mb-2 flex items-center justify-center font-bold text-white shadow-md text-sm" style={{ backgroundColor: BOTTOMS_DATA[bottomIdx].color }}>
                      BOTTOM
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setBottomIdx((prev) => (prev - 1 + BOTTOMS_DATA.length) % BOTTOMS_DATA.length)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Prenda anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setBottomIdx((prev) => (prev + 1) % BOTTOMS_DATA.length)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Siguiente prenda"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full mt-3 text-center">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] mb-1">
                  {BOTTOMS_DATA[bottomIdx].tag}
                </span>
                <p className="text-xs font-bold text-[var(--foreground)] truncate">
                  {BOTTOMS_DATA[bottomIdx].name}
                </p>
                <p className="text-[11px] text-[var(--foreground-tertiary)] truncate">
                  {BOTTOMS_DATA[bottomIdx].brand}
                </p>
              </div>
            </div>

            {/* Slot 3: Shoes */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] relative group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-2">
                03 • Calzado
              </span>
              
              <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-xl bg-[var(--card-bg)]/60 p-4 border border-[var(--border-color)]/40 shadow-inner">
                {SHOES_DATA[shoesIdx].image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={SHOES_DATA[shoesIdx].image!}
                      alt={SHOES_DATA[shoesIdx].name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="w-14 h-14 rounded-2xl mb-2 flex items-center justify-center font-bold text-white shadow-md text-sm" style={{ backgroundColor: SHOES_DATA[shoesIdx].color }}>
                      SHOES
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setShoesIdx((prev) => (prev - 1 + SHOES_DATA.length) % SHOES_DATA.length)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Calzado anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setShoesIdx((prev) => (prev + 1) % SHOES_DATA.length)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Siguiente calzado"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full mt-3 text-center">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] mb-1">
                  {SHOES_DATA[shoesIdx].tag}
                </span>
                <p className="text-xs font-bold text-[var(--foreground)] truncate">
                  {SHOES_DATA[shoesIdx].name}
                </p>
                <p className="text-[11px] text-[var(--foreground-tertiary)] truncate">
                  {SHOES_DATA[shoesIdx].brand}
                </p>
              </div>
            </div>

            {/* Slot 4: Accessory */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] relative group">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-2">
                04 • Accesorio / Toque
              </span>
              
              <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-xl bg-[var(--card-bg)]/60 p-4 border border-[var(--border-color)]/40 shadow-inner">
                {ACCESSORIES_DATA[accIdx].image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={ACCESSORIES_DATA[accIdx].image!}
                      alt={ACCESSORIES_DATA[accIdx].name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="w-14 h-14 rounded-2xl mb-2 flex items-center justify-center font-bold text-white shadow-md text-sm" style={{ backgroundColor: ACCESSORIES_DATA[accIdx].color }}>
                      ACC
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setAccIdx((prev) => (prev - 1 + ACCESSORIES_DATA.length) % ACCESSORIES_DATA.length)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Accesorio anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setAccIdx((prev) => (prev + 1) % ACCESSORIES_DATA.length)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md shadow text-[var(--foreground)] hover:scale-110 active:scale-95 transition-all"
                  aria-label="Siguiente accesorio"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full mt-3 text-center">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] mb-1">
                  {ACCESSORIES_DATA[accIdx].tag}
                </span>
                <p className="text-xs font-bold text-[var(--foreground)] truncate">
                  {ACCESSORIES_DATA[accIdx].name}
                </p>
                <p className="text-[11px] text-[var(--foreground-tertiary)] truncate">
                  {ACCESSORIES_DATA[accIdx].brand}
                </p>
              </div>
            </div>

          </div>

          {/* Footer CTA of the interactive widget */}
          <div className="mt-8 pt-6 border-t border-[var(--border-color)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] font-medium">
              💡 {shuffledCount > 0 ? `¡Has probado ${shuffledCount} combinaciones!` : 'Monta tus propias prendas reales y compón tu estilo en segundos.'}
            </p>
            <Link
              href="/auth"
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <span>Crear este look en mi armario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN FILOSOFÍA WHERING: EL 80/20 & ANTES VS DESPUÉS */}
      <section id="filosofia" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-[var(--border-color)]/50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
            El poder de ver tu ropa
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
            El 80% de las veces usamos <br className="hidden sm:inline" />
            <span className="text-[var(--brand-pink)]">solo el 20% de nuestro armario.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
            Nos dijeron que para vestir mejor necesitábamos comprar más ropa y seguir cada microtendencia. La realidad es mucho más sencilla: lo que necesitas es ver y combinar lo que ya tienes.
          </p>
        </div>

        {/* Before vs After comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beforeVsAfter.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="rounded-3xl p-6 sm:p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg flex flex-col justify-between gap-6"
            >
              {/* Problem */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-500/80">Antes</span>
                  <p className="text-sm sm:text-base text-[var(--foreground-secondary)] mt-0.5">
                    {item.problem}
                  </p>
                </div>
              </div>

              {/* Solution */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-[var(--border-color)]/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Con Klozet</span>
                  <p className="text-sm sm:text-base font-semibold text-[var(--foreground)] mt-0.5">
                    {item.solution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. CÓMO FUNCIONA KLOZET EN 4 PASOS */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-[var(--border-color)]/50">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Tu armario en tu bolsillo en 4 pasos
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--foreground-secondary)]">
            Diseñado para ahorrar tiempo, inspirarte y elevar tu estilo cada día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Paso 1 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden group hover:border-[var(--brand-pink)]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center mb-6">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">Paso 01</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1 mb-3">
              Digitaliza en segundos
            </h3>
            <p className="text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
              Haz una foto a tus prendas o añade capturas de tus tiendas preferidas (Zara, ASOS, Nike, Uniqlo). La app aísla la prenda sin fondo y la clasifica automáticamente por color, tejido y temporada.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Paso 02</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1 mb-3">
              Lienzo libre & Dress Me
            </h3>
            <p className="text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
              Arrastra, gira y superpón capas en un lienzo libre como un estilista profesional, o usa el combinador aleatorio para descubrir mezclas frescas que nunca se te habrían ocurrido.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden group hover:border-pink-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-6">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500">Paso 03</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1 mb-3">
              Kloe, tu asesora de estilo 24/7
            </h3>
            <p className="text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
              ¿Tienes una cena, una entrevista o un festival? Kloe inspecciona las prendas reales de tu armario y compone looks completos de pies a cabeza adaptados al clima y a la ocasión.
            </p>
          </div>

          {/* Paso 4 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Paso 04</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1 mb-3">
              Planifica tu semana en el calendario
            </h3>
            <p className="text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
              Asigna tus outfits a días específicos en el calendario. Ahorra 15 minutos cada mañana y sal de casa con la tranquilidad de llevar un conjunto que te hace sentir genial.
            </p>
          </div>

        </div>
      </section>

      {/* 6. GALERÍA EDITORIAL DE ESTILOS & LOOKBOOK */}
      <section id="lookbook" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-[var(--border-color)]/50">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-3 inline-block">
            Inspiración & Comunidad
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Estilos para todas las personalidades
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--foreground-secondary)]">
            Explora más de 34 estéticas de moda catalogadas en Klozet para inspirar tus próximos looks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {outfitShowcase.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group relative rounded-3xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="aspect-[3/4] relative w-full overflow-hidden bg-gray-900">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  quality={92}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white mb-1.5">
                    {item.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                    {item.tags.map((t, i) => (
                      <span key={i} className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CTA BOX */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--background-secondary)] to-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Tu armario digital te espera
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
              Empieza a amar lo que vistes cada día
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--foreground-secondary)] leading-relaxed">
              Únete a Klozet gratis. Organiza tu ropa, crea combinaciones que nunca imaginaste y despiértate con seguridad.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <span>Crear mi armario gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER ELEGANTE CON LEGAL Y SOPORTE */}
      <footer className="border-t border-[var(--border-color)]/60 bg-[var(--card-bg)]/40 py-12 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <Image 
              src="/klozet-logo.png" 
              alt="Klozet Logo" 
              width={100} 
              height={30} 
              className="dark:hidden block object-contain" 
            />
            <Image 
              src="/klozet-logo-dark.png" 
              alt="Klozet Logo" 
              width={100} 
              height={30} 
              className="hidden dark:block object-contain" 
            />
            <p className="text-xs text-[var(--foreground-secondary)] mt-1">
              El armario digital inteligente y la red social de moda.
            </p>
            <p className="text-[11px] text-[var(--foreground-tertiary)]">
              © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
            </p>
          </div>

          {/* Quick links & Legal */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[var(--foreground-secondary)] font-semibold">
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

