'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shirt, Wand2, Compass, ArrowRight, Loader2 } from 'lucide-react';
import { haptics } from '@/lib/haptic';
import { signInWithGoogleNativeOrWeb, initNativeOAuthListener } from '@/lib/auth/nativeOAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ShowcaseSlide {
  id: string;
  badge: string;
  icon: typeof Shirt;
  title: string;
  subtitle: string;
  image: string;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'closet',
    badge: 'Armario Digital',
    icon: Shirt,
    title: 'Tu ropa organizada',
    subtitle: 'Sube tus prendas una vez. Ten todo tu armario a un toque de pantalla.',
    image: '/landing/outfits/chica-brown-top-jeans.jpg',
  },
  {
    id: 'kloe',
    badge: 'Estilista Kloe',
    icon: Wand2,
    title: 'Outfits que funcionan',
    subtitle: 'Kloe combina tu propia ropa según el clima, tu estilo y la ocasión.',
    image: '/landing/outfits/chico-denim-sneakers-street.jpg',
  },
  {
    id: 'inspo',
    badge: 'Inspiración Real',
    icon: Compass,
    title: 'Ideas para vestirte',
    subtitle: 'Descubre cómo combinan otros creadores prendas idénticas a las tuyas.',
    image: '/landing/outfits/chico-henley-pleated.jpg',
  },
];

export default function IosNativeLanding() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Listen for native deep link OAuth return
  React.useEffect(() => {
    initNativeOAuthListener(
      () => {
        toast.success('Sesión iniciada con éxito');
        router.push('/closet');
      },
      (err) => {
        toast.error(err || 'Error al iniciar sesión con Google');
        setGoogleLoading(false);
      }
    );
  }, [router]);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      haptics.tap();
      const res = await signInWithGoogleNativeOrWeb();
      if (!res.success && res.error) {
        toast.error(res.error);
        setGoogleLoading(false);
      }
      // Native system sheet will open
    } catch (err: any) {
      toast.error(err?.message || 'Error al conectar con Google');
      setGoogleLoading(false);
    }
  };

  const slide = SHOWCASE_SLIDES[activeSlide];

  return (
    <div
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
        colorScheme: 'light',
      }}
      className="fixed inset-0 w-screen h-[100dvh] bg-white text-zinc-950 flex flex-col justify-between px-5 select-none overflow-hidden antialiased"
    >
      {/* 1. TOP HEADER: Clean Klozet Bubble Logo + Kloe Companion Badge */}
      <header className="w-full flex items-center justify-between pt-1 pb-2">
        <Link href="/" className="inline-block active:scale-95 transition-transform">
          <Image
            src="/landing/klozet-nombre-grande.png"
            alt="Klozet"
            width={128}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100">
          <Image
            src="/kloe-avatar.png"
            alt="Kloe"
            width={18}
            height={18}
            className="object-contain"
          />
          <span className="text-[11px] font-bold text-[#FF66C4] tracking-tight">Klozet iOS</span>
        </div>
      </header>

      {/* 2. CENTER STAGE: Visual Card with Smooth Crossfade & Tactile Dots */}
      <main className="flex-1 flex flex-col justify-center my-auto py-2">
        <div className="relative w-full max-w-sm mx-auto aspect-[4/4.4] rounded-[32px] overflow-hidden bg-[#F5F5F7] border border-black/[0.06] shadow-[0_16px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between p-5">
          {/* Card Image Background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0.2, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.2 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 -z-0"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
                priority
              />
              {/* Subtle frosted gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            </motion.div>
          </AnimatePresence>

          {/* Top Pill inside Card */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-zinc-900 border border-white/20 shadow-xs flex items-center gap-1.5">
              <slide.icon className="w-3.5 h-3.5 text-[#FF66C4]" />
              <span>{slide.badge}</span>
            </span>

            {/* Tap Dots to switch slides */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {SHOWCASE_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setActiveSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-5 bg-[#FF66C4]' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`Ir a diapositiva ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Headline inside Card */}
          <div className="relative z-10 text-white">
            <h2 className="text-2xl font-bold tracking-tight mb-1 text-white leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {slide.subtitle}
            </p>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM ACTIONS: Mobile-First Tactile Buttons */}
      <footer className="w-full max-w-sm mx-auto flex flex-col gap-2.5 pb-1">
        {/* Primary CTA: Empezar / Registrarse */}
        <Link
          href="/auth?mode=signup"
          onClick={() => haptics.tap()}
          className="w-full h-13 rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] active:scale-[0.97] transition-all text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,102,196,0.35)] cursor-pointer touch-manipulation"
        >
          <span>Empezar gratis</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>

        {/* Google OAuth Native Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full h-12 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 active:scale-[0.97] transition-all text-zinc-900 font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xs cursor-pointer touch-manipulation disabled:opacity-60"
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
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-xs text-zinc-500 font-medium">¿Ya tienes cuenta?</span>
          <Link
            href="/auth?mode=login"
            onClick={() => haptics.tap()}
            className="text-xs font-bold text-zinc-950 underline underline-offset-2 hover:text-[#FF66C4] transition-colors active:scale-95 touch-manipulation"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Subtle legal text */}
        <p className="text-[10px] text-zinc-500 text-center pt-0.5">
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className="underline hover:text-zinc-700">Términos</Link> y{' '}
          <Link href="/privacy" className="underline hover:text-zinc-700">Privacidad</Link>.
        </p>
      </footer>
    </div>
  );
}
