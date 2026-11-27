'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Wand2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { haptics } from '@/lib/haptic';
import { signInWithGoogleNativeOrWeb, initNativeOAuthListener } from '@/lib/auth/nativeOAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CarouselSlide {
  id: string;
  badge: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  image: string;
  garmentTag: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'closet',
    badge: 'Armario Digital',
    icon: Shirt,
    title: 'Tu ropa organizada',
    subtitle: 'Sube tus prendas reales y digitaliza tu armario en segundos.',
    image: '/landing/outfits/chica-brown-top-jeans.jpg',
    garmentTag: 'Top Halter + Denim',
  },
  {
    id: 'kloe',
    badge: 'Estilista Kloe IA',
    icon: Wand2,
    title: 'Outfits que funcionan',
    subtitle: 'Kloe combina lo que ya tienes según tu estilo, ocasión y clima.',
    image: '/landing/outfits/chico-denim-sneakers-street.jpg',
    garmentTag: 'Street Look Completo',
  },
  {
    id: 'inspo',
    badge: 'Inspiración Real',
    icon: Sparkles,
    title: 'Ideas para vestirte',
    subtitle: 'Descubre cómo visten otros creadores y sal con el fit clavado.',
    image: '/landing/outfits/chica-blanco-total-look.jpg',
    garmentTag: 'Total White Editorial',
  },
];

export default function IosNativeLanding() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Global deep link listener for OAuth return
  React.useEffect(() => {
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
    if (activeSlide < CAROUSEL_SLIDES.length - 1) {
      setActiveSlide((prev) => prev + 1);
    }
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

  const slide = CAROUSEL_SLIDES[activeSlide];
  const isFinalSlide = activeSlide === CAROUSEL_SLIDES.length - 1;
  const SlideIcon = slide.icon;

  return (
    <div
      style={{
        paddingTop: 'max(3.25rem, calc(env(safe-area-inset-top, 44px) + 0.5rem))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
        colorScheme: 'light',
      }}
      className="fixed inset-0 w-screen h-[100dvh] bg-white text-zinc-950 flex flex-col justify-between px-5 select-none overflow-hidden antialiased"
    >
      {/* 1. TOP HEADER: Big Klozet Logo + Step Pill Indicators */}
      <header className="w-full flex items-center justify-between pt-1 pb-2">
        <Image
          src="/landing/klozet-nombre-grande.png"
          alt="Klozet"
          width={140}
          height={44}
          className="h-9 w-auto object-contain"
          priority
        />

        {/* Big Interactive Progress Stepper */}
        <div className="flex items-center gap-2 bg-[#F2F2F7] px-3.5 py-1.5 rounded-full border border-black/[0.06]">
          {CAROUSEL_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                try { haptics.selection(); } catch {}
                setActiveSlide(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeSlide
                  ? 'w-7 bg-[#FF66C4] shadow-xs'
                  : 'w-2 bg-zinc-300 hover:bg-zinc-400'
              }`}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>
      </header>

      {/* 2. CENTER CAROUSEL STAGE: Large High-Impact Fashion Visual & Large Central Icon */}
      <main className="flex-1 w-full max-w-sm sm:max-w-md mx-auto flex flex-col justify-center my-auto py-1">
        <div className="relative w-full aspect-[4/4.9] rounded-[36px] overflow-hidden bg-[#F5F5F7] border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between p-6">
          {/* Large Garment Visual Image with Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0.3, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.3 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 -z-0"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 100vw, 500px"
                className="object-cover"
                priority
              />
              {/* Deep editorial scrim for 100% legible large white text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />
            </motion.div>
          </AnimatePresence>

          {/* Top Badge with Large Icon */}
          <div className="relative z-10 flex items-center justify-between">
            <motion.div
              key={`badge-${slide.id}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-zinc-950 border border-white/30 shadow-md flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#FF66C4]">
                <SlideIcon className="w-5 h-5 text-[#FF66C4]" />
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight">{slide.badge}</span>
            </motion.div>

            {/* Garment Tag Indicator */}
            <span className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {slide.garmentTag}
            </span>
          </div>

          {/* Bottom Large Editorial Headlines */}
          <div className="relative z-10 text-white pt-6">
            <motion.h2
              key={`title-${slide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight"
            >
              {slide.title}
            </motion.h2>

            <motion.p
              key={`sub-${slide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
              className="text-sm sm:text-base text-white/85 font-medium leading-relaxed max-w-[320px]"
            >
              {slide.subtitle}
            </motion.p>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM ACTION BAR: Stepper Button / Primary Action Stack */}
      <footer className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-2.5 pb-1">
        {!isFinalSlide ? (
          /* Step Button: "Continuar" to advance carousel */
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleNextSlide}
              className="w-full h-14 rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] active:scale-[0.97] transition-all text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(255,102,196,0.38)] cursor-pointer touch-manipulation"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSlide(CAROUSEL_SLIDES.length - 1)}
              className="text-xs text-zinc-400 font-medium text-center py-1 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              Saltar introducción
            </button>
          </div>
        ) : (
          /* Final Slide: Primary "Empezar", Google Sign In and Login link */
          <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
            {/* Primary CTA */}
            <Link
              href="/auth?mode=signup"
              onClick={() => { try { haptics.tap(); } catch {} }}
              className="w-full h-14 rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] active:scale-[0.97] transition-all text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(255,102,196,0.38)] cursor-pointer touch-manipulation"
            >
              <span>Empezar gratis</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </Link>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full h-12.5 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/90 active:scale-[0.97] transition-all text-zinc-900 font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xs cursor-pointer touch-manipulation disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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

            {/* Secondary: Iniciar sesión */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              <span className="text-xs text-zinc-500 font-medium">¿Ya tienes cuenta?</span>
              <Link
                href="/auth?mode=login"
                onClick={() => { try { haptics.tap(); } catch {} }}
                className="text-xs font-bold text-zinc-950 underline underline-offset-2 hover:text-[#FF66C4] transition-colors active:scale-95 touch-manipulation"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}

        {/* Subtle legal text */}
        <p className="text-[10px] text-zinc-400 text-center pt-0.5">
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className="underline hover:text-zinc-600">Términos</Link> y{' '}
          <Link href="/privacy" className="underline hover:text-zinc-600">Privacidad</Link>.
        </p>
      </footer>
    </div>
  );
}
