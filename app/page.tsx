'use client';

/**
 * Onboarding - Slides de bienvenida mÃ³vil
 * Experiencia tipo app mÃ³vil con slides de funcionalidades
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shirt, Wand2, Compass, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, LogoExtended } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';


export default function OnboardingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const slides = [
    {
      title: t.onboarding.slides.inspiration.title,
      description: t.onboarding.slides.inspiration.description,
      icon: Sparkles,
      image: '/sudadera.png',
      color: 'from-[var(--brand-pink)] to-purple-600',
    },
    {
      title: t.onboarding.slides.time.title,
      description: t.onboarding.slides.time.description,
      icon: Clock,
      image: '/reloj.png',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: t.onboarding.slides.rediscover.title,
      description: t.onboarding.slides.rediscover.description,
      icon: Wand2,
      image: '/pantalon.png',
      color: 'from-amber-400 to-orange-500',
    },
    {
      title: t.onboarding.slides.discovery.title,
      description: t.onboarding.slides.discovery.description,
      icon: Compass,
      image: '/new balance.png',
      color: 'from-pink-500 to-rose-500',
    },
  ];
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  // Si ya estÃ¡ autenticado, redirigir a /closet
  useEffect(() => {
    if (user) {
      router.push('/closet');
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--foreground-tertiary)]">Redirigiendo...</p>
      </div>
    );
  }

  const isLastSlide = currentSlide === slides.length;

  const nextSlide = () => {
    if (currentSlide < slides.length) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden"
      onPanEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe < -10000 || offset.x < -50) nextSlide();
        if (swipe > 10000 || offset.x > 50) prevSlide();
      }}
    >
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--brand-pink)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Logo en la parte superior (visible solo en intro) */}
      {!isLastSlide && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="pt-12 pb-6 px-4 flex justify-center z-10"
        >
          <LogoExtended size="lg" className="h-48 w-auto drop-shadow-xl" />
        </motion.div>
      )}

      {/* Contenedor de slides */}
      {/* Contenedor de slides */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-8 overflow-hidden relative w-full">
        <div className="max-w-md mx-auto w-full relative z-10 flex flex-col items-center">

          {/* VisualizaciÃ³n de Productos 3D (Solo visible en slides de intro) */}
          {!isLastSlide && (
            <div className="relative h-[280px] w-full mb-4 perspective-1000">
              {slides.map((slide, index) => {
                const total = slides.length;
                // Calcular offset circular relative al currentSlide
                const offset = (index - currentSlide + total) % total;

                // ConfiguraciÃ³n de posiciones (Orbit) con valores adaptativos
                let layout = { x: 0, y: 0, scale: 0.5, opacity: 0, zIndex: 0, blur: 0 };

                if (offset === 0) { // Activo (Centro)
                  layout = { x: 0, y: 0, scale: 1.1, opacity: 1, zIndex: 20, blur: 0 };
                } else if (offset === 1) { // Siguiente (Derecha)
                  layout = { x: 80, y: -40, scale: 0.6, opacity: 0.7, zIndex: 10, blur: 2 };
                } else if (offset === 2) { // Fondo (Abajo)
                  layout = { x: 0, y: 60, scale: 0.4, opacity: 0.4, zIndex: 5, blur: 4 };
                } else if (offset === 3) { // Anterior (Izquierda)
                  layout = { x: -80, y: -40, scale: 0.6, opacity: 0.7, zIndex: 10, blur: 2 };
                }

                return (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{
                      x: layout.x,
                      y: layout.y,
                      scale: layout.scale,
                      opacity: layout.opacity,
                      zIndex: layout.zIndex,
                      filter: `blur(${layout.blur}px)`
                    }}
                    transition={{ type: "spring", stiffness: 180, damping: 20, mass: 1 }}
                    className="absolute top-1/2 left-1/2 -ml-24 -mt-24 w-48 h-48 flex items-center justify-center pointer-events-none"
                  >
                    {/* Glow activo */}
                    <motion.div
                      animate={{ opacity: offset === 0 ? 0.3 : 0 }}
                      className={`absolute inset-0 bg-gradient-to-br ${slide.color} blur-3xl rounded-full transition-opacity duration-500`}
                    />

                    <div className="relative w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
                      <Image
                        src={(slide as any).image}
                        alt={slide.title}
                        fill
                        className="object-contain p-2"
                        priority={index < 2}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {!isLastSlide ? (
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="text-center w-full"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                  {slides[currentSlide].title}
                </h2>

                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed min-h-[80px]">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="auth-slide"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="text-center w-full"
              >
                {/* Logo Central Grande */}
                <div className="flex justify-center mb-8">
                  <LogoExtended size="lg" className="h-64 w-auto drop-shadow-2xl" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                  {t.onboarding.cta.title}
                </h2>

                <p className="text-lg text-[var(--foreground-secondary)] mb-8">
                  {t.onboarding.cta.description}
                </p>

                {/* Botones de auth */}
                <div className="flex flex-col gap-6 w-full">
                  <Link href="/auth?mode=signup">
                    <Button size="lg" glow className="w-full">
                      {t.onboarding.cta.signup}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/auth?mode=login">
                    <Button size="lg" variant="secondary" className="w-full">
                      {t.onboarding.cta.login}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controles y dots en la parte inferior */}
      <div className="pb-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Dots indicadores */}
          <div className="flex justify-center gap-2 mb-6">
            {[...slides, { title: 'Auth' }].map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${index === currentSlide
                  ? 'w-8 bg-[var(--brand-pink)]'
                  : 'w-2 bg-[var(--foreground-tertiary)] opacity-30'
                  }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Botones de navegaciÃ³n */}
          {!isLastSlide && (
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <Button
                  variant="secondary"
                  onClick={prevSlide}
                  className="flex-1"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  {t.common.back}
                </Button>
              )}
              <Button
                onClick={nextSlide}
                className="flex-1"
              >
                {t.common.next}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}


        </div>
      </div>
    </motion.div>
  );
}
