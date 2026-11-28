'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, RotateCw, Star } from 'lucide-react';
import { haptics } from '@/lib/haptic';
import { signInWithGoogleNativeOrWeb, initNativeOAuthListener } from '@/lib/auth/nativeOAuth';
import { useRouter } from 'next/navigation';
import { LANDING_TRANSLATIONS } from '@/lib/i18n/landingTranslations';
import { useLanguageStore } from '@/store/languageStore';

export default function IosNativeLanding() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = LANDING_TRANSLATIONS[language] || LANDING_TRANSLATIONS.es;

  const [activeSlide, setActiveSlide] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const totalSlides = 5;

  // Global deep link listener for OAuth return
  useEffect(() => {
    initNativeOAuthListener(
      () => {
        router.push('/closet');
      },
      (err) => {
        console.warn('OAuth error:', err);
        setGoogleLoading(false);
      }
    );
  }, [router]);

  const handleNextSlide = () => {
    try { haptics.selection(); } catch {}
    if (activeSlide < totalSlides - 1) {
      setActiveSlide((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    try { haptics.selection(); } catch {}
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  const handleQuickSlide = () => {
    try { haptics.tap(); } catch {}
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    setActiveSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      try { haptics.tap(); } catch {}
      const res = await signInWithGoogleNativeOrWeb();
      if (!res.success && res.error) {
        setGoogleLoading(false);
      }
    } catch {
      setGoogleLoading(false);
    }
  };

  // Touch swipe support
  const touchStartXRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;
    if (deltaX > 40 && activeSlide < totalSlides - 1) {
      handleNextSlide();
    } else if (deltaX < -40 && activeSlide > 0) {
      handlePrevSlide();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        paddingTop: 'max(3.75rem, calc(env(safe-area-inset-top, 48px) + 0.5rem))',
        paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        colorScheme: 'light',
      }}
      className="fixed inset-0 w-screen h-screen bg-white text-zinc-950 flex flex-col justify-between px-4 sm:px-6 z-[999] overflow-hidden select-none"
    >
      {/* 1. TOP HEADER: Únicamente botón de avance rápido con giro (SIN logo, SIN botón de login) */}
      <header className="w-full flex items-center justify-end py-1.5 z-20">
        <motion.button
          type="button"
          onClick={handleQuickSlide}
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/90 shadow-xs text-xs font-bold text-zinc-900 transition-all cursor-pointer backdrop-blur-md active:scale-95"
          aria-label="Deslizar horizontalmente el carrusel"
        >
          <span>Deslizar</span>
          <motion.div
            animate={{ rotate: isSpinning ? 360 : 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <RotateCw className="w-4 h-4 text-[var(--brand-pink,#FF66C4)]" />
          </motion.div>
        </motion.button>
      </header>

      {/* 2. ATMOSPHERIC BACKDROP AURA */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[390px] h-[390px] rounded-full blur-3xl pointer-events-none transition-all duration-700 -z-10 ${
          activeSlide === 0 ? 'bg-pink-300/30' :
          activeSlide === 1 ? 'bg-purple-300/30' :
          activeSlide === 2 ? 'bg-rose-300/35' :
          activeSlide === 3 ? 'bg-indigo-300/30' :
          'bg-pink-400/35'
        }`}
      />

      {/* 3. SLIDES CONTAINER (HORIZONTAL CAROUSEL - TEXTS & GARMENTS +20% LARGER) */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden py-1 my-auto">
        <AnimatePresence mode="wait">
          {/* SLIDE 0: ARMARIO LLENO / NADA QUE PONERTE */}
          {activeSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -45 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center my-auto"
            >
              <div className="flex flex-col items-center">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-zinc-950">
                  <span className="text-[1.25em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">{t.f0_title1_drop}</span>{t.f0_title1_rest}
                </h1>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] bg-gradient-to-r from-[var(--brand-pink,#FF66C4)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-1">
                  <span className="text-[1.25em] italic font-serif text-pink-400 mr-0.5">{t.f0_title2_drop}</span>{t.f0_title2_rest}
                </h2>
              </div>

              <p className="mt-3.5 text-sm sm:text-base text-zinc-600 max-w-sm leading-relaxed font-normal">
                {t.f0_desc}
              </p>

              {/* Floating Real Garments (+20% Scale & Interactive) */}
              <div className="w-full max-w-[370px] h-[280px] relative flex items-center justify-center my-3">
                {/* Left: Top Halter */}
                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [-8, -6, -8] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1 top-2 w-28 drop-shadow-md z-10 cursor-pointer"
                  onClick={() => { try { haptics.tap(); } catch {} }}
                >
                  <Image
                    src="/landing/piezas/top-halter-oliva.png"
                    alt={t.tag_top_halter}
                    width={220}
                    height={260}
                    className="w-full h-auto object-contain -rotate-8"
                    priority
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap">
                    {t.tag_top_halter}
                  </div>
                </motion.div>

                {/* Center Hero: Chaqueta Militar */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [2, 0, 2] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-20 w-48 drop-shadow-[0_18px_36px_rgba(255,102,196,0.32)] cursor-pointer"
                  onClick={() => { try { haptics.tap(); } catch {} }}
                >
                  <Image
                    src="/landing/piezas/chaqueta-militar.png"
                    alt={t.tag_jacket_militar}
                    width={340}
                    height={340}
                    className="w-full h-auto object-contain rotate-2"
                    priority
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-pink,#FF66C4)]" />
                    <span>{t.tag_jacket_militar}</span>
                  </div>
                </motion.div>

                {/* Right: Jeans Wide Leg */}
                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [8, 10, 8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-1 top-2 w-28 drop-shadow-md z-10 cursor-pointer"
                  onClick={() => { try { haptics.tap(); } catch {} }}
                >
                  <Image
                    src="/landing/piezas/jeans-wide-mujer.png"
                    alt={t.tag_denim_wide}
                    width={220}
                    height={300}
                    className="w-full h-auto object-contain rotate-8"
                    priority
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap">
                    {t.tag_denim_wide}
                  </div>
                </motion.div>

                {/* Bottom Center: Zapatos Alaïa */}
                <motion.div
                  animate={{ y: [0, -7, 0], rotate: [-4, -2, -4] }}
                  transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  className="absolute -bottom-2 right-6 w-24 drop-shadow-md z-25 cursor-pointer"
                  onClick={() => { try { haptics.tap(); } catch {} }}
                >
                  <Image
                    src="/landing/piezas/bailarinas-alaia.png"
                    alt={t.tag_alaia_strass}
                    width={180}
                    height={190}
                    className="w-full h-auto object-contain -rotate-4"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[9px] font-bold text-zinc-950 whitespace-nowrap">
                    {t.tag_alaia_strass}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 1: TODA TU ROPA / EN UN TOQUE */}
          {activeSlide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -45 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center my-auto"
            >
              <div className="flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-zinc-950">
                  <span className="text-[1.25em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">{t.f1_title1_drop}</span>{t.f1_title1_rest}
                </h2>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-[var(--brand-pink,#FF66C4)] mt-1">
                  <span className="text-[1.25em] italic font-serif text-purple-400 mr-0.5">{t.f1_title2_drop}</span>{t.f1_title2_rest}
                </h3>
              </div>

              <p className="mt-3.5 text-sm sm:text-base text-zinc-600 max-w-sm leading-relaxed font-normal">
                {t.f1_desc}
              </p>

              {/* Laser Scanner Visual (+20% Scale) */}
              <div className="w-full max-w-[370px] h-[280px] relative flex items-center justify-center my-3">
                {/* Top-Left: Jersey Punto */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1 top-2 w-28 drop-shadow-md z-10"
                >
                  <Image
                    src="/landing/piezas/jersey-rayas-hombre.png"
                    alt={t.tag_jersey_punto}
                    width={220}
                    height={200}
                    className="w-full h-auto object-contain -rotate-8"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap">
                    {t.tag_jersey_punto}
                  </div>
                </motion.div>

                {/* Center Hero with Glowing Laser Sweep Line */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-20 w-48 drop-shadow-[0_18px_36px_rgba(255,102,196,0.32)]"
                >
                  <div className="relative overflow-hidden rounded-2xl p-1 bg-white/40 backdrop-blur-xs">
                    <Image
                      src="/landing/piezas/top-halter-oliva.png"
                      alt={t.tag_top_plisado}
                      width={340}
                      height={340}
                      className="w-full h-auto object-contain rotate-2"
                      priority
                    />
                    {/* Glowing Laser Sweep */}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-pink,#FF66C4)] to-transparent shadow-[0_0_16px_var(--brand-pink,#FF66C4)] pointer-events-none"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t.tag_top_plisado}</span>
                  </div>
                </motion.div>

                {/* Right: Margiela Sneakers */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-1 top-2 w-28 drop-shadow-md z-10"
                >
                  <Image
                    src="/landing/piezas/zapatillas-margiela.png"
                    alt={t.tag_replica_gat}
                    width={200}
                    height={220}
                    className="w-full h-auto object-contain rotate-8"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap">
                    {t.tag_replica_gat}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: QUÉ ME PONGO / KLOE TE AYUDA */}
          {activeSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -45 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center my-auto"
            >
              <div className="flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-zinc-950">
                  <span className="text-[1.25em] italic font-serif text-pink-400 mr-0.5">{t.f2_title1_drop}</span>{t.f2_title1_rest}
                </h2>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] bg-gradient-to-r from-[var(--brand-pink,#FF66C4)] via-pink-400 to-purple-500 bg-clip-text text-transparent mt-1">
                  <span className="text-[1.25em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">{t.f2_title2_drop}</span>{t.f2_title2_rest}
                </h3>
              </div>

              <p className="mt-3.5 text-sm sm:text-base text-zinc-600 max-w-sm leading-relaxed font-normal">
                {t.f2_desc}
              </p>

              {/* Kloe Mascot & Apple Dialogue Speech Bubbles */}
              <div className="w-full max-w-[370px] h-[280px] relative flex flex-col items-center justify-center my-3">
                {/* Central Kloe Character (+20% Scale) */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10 w-36 h-36 flex items-center justify-center drop-shadow-[0_16px_36px_rgba(255,102,196,0.35)]"
                >
                  <Image
                    src="/landing/kloe-grande-landing.png"
                    alt="Kloe Estilista"
                    width={280}
                    height={280}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </motion.div>

                {/* Speech Bubble 1: User Question */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute top-1 left-1 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-2xl rounded-bl-xs px-3.5 py-2 shadow-md max-w-[210px] text-left z-20"
                >
                  <p className="text-[11px] font-semibold text-zinc-800 leading-snug">
                    {t.f2_chat_user}
                  </p>
                </motion.div>

                {/* Speech Bubble 2: Kloe Suggestion */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-2 right-1 bg-[var(--brand-pink,#FF66C4)] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-md max-w-[220px] text-left z-20"
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star className="w-3 h-3 text-white" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Kloe</span>
                  </div>
                  <p className="text-[11px] font-medium text-white/95 leading-snug">
                    {t.f2_chat_kloe}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: MONTA TU FIT / LISTO PARA HOY */}
          {activeSlide === 3 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -45 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center my-auto"
            >
              <div className="flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-zinc-950">
                  <span className="text-[1.25em] italic font-serif text-purple-400 mr-0.5">{t.f3_title1_drop}</span>{t.f3_title1_rest}
                </h2>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-[var(--brand-pink,#FF66C4)] mt-1">
                  <span className="text-[1.25em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">{t.f3_title2_drop}</span>{t.f3_title2_rest}
                </h3>
              </div>

              <p className="mt-3.5 text-sm sm:text-base text-zinc-600 max-w-sm leading-relaxed font-normal">
                {t.f3_desc}
              </p>

              {/* Moodboard Real Editorial Outfits (+20% Scale) */}
              <div className="w-full max-w-[370px] h-[280px] relative flex items-center justify-center my-3">
                {/* Look 1: Mujer Halter */}
                <motion.div
                  animate={{ y: [0, 7, 0], rotate: [-8, -6, -8] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-2 w-36 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-zinc-200/90 shadow-lg -rotate-8 p-1 z-10"
                >
                  <Image
                    src="/landing/outfits/mujer-halter-alaia.jpg"
                    alt={t.tag_look_mujer}
                    fill
                    className="object-contain p-1"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 shadow-xs text-[10px] font-bold text-zinc-950 whitespace-nowrap">
                    {t.tag_look_mujer}
                  </div>
                </motion.div>

                {/* Hero Centerpiece: Hombre Militar Collage */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-20 w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-zinc-200/90 shadow-xl p-1.5"
                >
                  <Image
                    src="/landing/outfits/hombre-militar-margiela.png"
                    alt={t.tag_lienzo_hoy}
                    fill
                    className="object-contain p-1"
                  />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white border border-zinc-200/90 shadow-sm text-[10px] font-bold text-zinc-950 whitespace-nowrap flex items-center gap-1">
                    <Star className="w-3 h-3 text-[var(--brand-pink,#FF66C4)]" />
                    <span>{t.tag_lienzo_hoy}</span>
                  </div>
                </motion.div>

                {/* Look 3: Mujer Rayas */}
                <motion.div
                  animate={{ y: [0, 7, 0], rotate: [8, 6, 8] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-2 w-36 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-zinc-200/90 shadow-lg rotate-8 p-1 z-15"
                >
                  <Image
                    src="/landing/outfits/mujer-rayas-miumiu-byredo.jpg"
                    alt={t.tag_look_diario}
                    fill
                    className="object-contain p-1"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 shadow-xs text-[10px] font-bold text-[var(--brand-pink,#FF66C4)] whitespace-nowrap">
                    {t.tag_look_diario}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: VÍSTETE MEJOR / DISFRUTA TU ROPA (Conversion Final Step) */}
          {activeSlide === 4 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -45 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center text-center my-auto"
            >
              <div className="mb-3">
                <Image
                  src="/landing/klozet-nombre-grande.png"
                  alt="Klozet"
                  width={200}
                  height={60}
                  className="h-11 w-auto object-contain mx-auto"
                  priority
                />
              </div>

              <div className="flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] text-zinc-950">
                  <span className="text-[1.25em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">{t.f4_title1_drop}</span>{t.f4_title1_rest}
                </h2>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.92] bg-gradient-to-r from-[var(--brand-pink,#FF66C4)] to-purple-500 bg-clip-text text-transparent mt-1">
                  <span className="text-[1.25em] italic font-serif text-pink-400 mr-0.5">{t.f4_title2_drop}</span>{t.f4_title2_rest}
                </h3>
              </div>

              <p className="mt-3 text-sm sm:text-base text-zinc-600 max-w-sm leading-relaxed font-normal mb-5">
                {t.f4_desc}
              </p>

              {/* Action Buttons Stack */}
              <div className="w-full max-w-xs flex flex-col gap-3">
                {/* Continuar con Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full h-12 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-sm flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-zinc-900 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continuar con Google</span>
                </button>

                {/* Empezar gratis (Register) */}
                <Link
                  href="/auth?mode=register"
                  onClick={() => { try { haptics.tap(); } catch {} }}
                  className="w-full h-12 rounded-full kz-pink-surface text-white shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all active:scale-[0.98]"
                >
                  <span>Empezar gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Iniciar sesión (Login directo) */}
                <Link
                  href="/auth?mode=login"
                  onClick={() => { try { haptics.tap(); } catch {} }}
                  className="w-full py-2 text-center text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
                >
                  ¿Ya tienes cuenta? <span className="font-bold text-zinc-950 underline">Iniciar sesión</span>
                </Link>
              </div>

              <p className="mt-4 text-[10px] text-zinc-400">
                Al continuar, aceptas nuestros{' '}
                <Link href="/terms" className="underline hover:text-zinc-600">Términos</Link> y{' '}
                <Link href="/privacy" className="underline hover:text-zinc-600">Privacidad</Link>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. BOTTOM NAVIGATION: 5 DOTS & CONTINUAR BUTTON */}
      <footer className="w-full flex flex-col items-center gap-3 z-20">
        {/* Slide Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                try { haptics.selection(); } catch {}
                setActiveSlide(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx
                  ? 'w-7 bg-[var(--brand-pink,#FF66C4)]'
                  : 'w-2 bg-zinc-200 hover:bg-zinc-300'
              }`}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>

        {/* Big Next Button (Shown on slides 0-3) */}
        {activeSlide < totalSlides - 1 && (
          <button
            type="button"
            onClick={handleNextSlide}
            className="w-full max-w-xs h-13 rounded-full kz-pink-surface text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
}
