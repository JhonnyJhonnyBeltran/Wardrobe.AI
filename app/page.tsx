'use client';

/**
 * Onboarding - Slides de bienvenida móvil
 * Experiencia tipo app móvil con slides de funcionalidades
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shirt, Wand2, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/store/themeStore';

const slides = [
  {
    title: 'Bienvenido a Klozet',
    description: 'Tu asistente de moda personal impulsado por IA',
    icon: Sparkles,
    color: 'from-[var(--brand-pink)] to-[var(--brand-pink-dark)]',
  },
  {
    title: 'Tu Armario Digital',
    description: 'Organiza todas tus prendas en un solo lugar. Sube fotos, escanea URLs y gestiona tu colección fácilmente.',
    icon: Shirt,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Generador de Outfits',
    description: 'Crea combinaciones perfectas con IA. Genera looks para cualquier ocasión en segundos.',
    icon: Wand2,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Chat con IA',
    description: 'Tu estilista personal disponible 24/7. Pregunta sobre moda, tendencias y consejos personalizados.',
    icon: MessageSquare,
    color: 'from-amber-500 to-orange-500',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  // Si ya está autenticado, redirigir a /closet
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
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Logo en la parte superior */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4 px-4 text-center"
      >
        <h1 className="text-3xl font-black tracking-tighter gradient-text">
          KLZT
        </h1>
      </motion.div>

      {/* Contenedor de slides */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-8 overflow-hidden">
        <div className="max-w-md mx-auto w-full">
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
                className="text-center"
              >
                {(() => {
                  const Icon = slides[currentSlide].icon;
                  return (
                    <>
                      {/* Icono */}
                      <div className="mb-8 flex justify-center">
                        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center shadow-[var(--shadow-float-strong)]`}>
                          <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                        </div>
                      </div>

                      {/* Título */}
                    </>
                  );
                })()}
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                  {slides[currentSlide].title}
                </h2>

                {/* Descripción */}
                <p className="text-lg text-[var(--foreground-secondary)] leading-relaxed">
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
                className="text-center"
              >
                {/* Icono final */}
                <div className="mb-8 flex justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-[var(--shadow-float-strong)]">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                  ¿Listo para empezar?
                </h2>

                {/* Descripción */}
                <p className="text-lg text-[var(--foreground-secondary)] mb-8">
                  Crea tu cuenta y comienza a revolucionar tu estilo hoy mismo.
                </p>

                {/* Botones de auth */}
                <div className="space-y-3">
                  <Link href="/auth">
                    <Button size="lg" glow className="w-full">
                      Crear cuenta gratis
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="secondary" className="w-full">
                      Ya tengo cuenta
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
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-[var(--brand-pink)]'
                    : 'w-2 bg-[var(--foreground-tertiary)] opacity-30'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Botones de navegación */}
          {!isLastSlide && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex-1"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={nextSlide}
                className="flex-1"
              >
                Siguiente
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {isLastSlide && (
            <Button
              variant="secondary"
              onClick={prevSlide}
              className="w-full"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
