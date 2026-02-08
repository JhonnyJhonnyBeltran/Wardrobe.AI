'use client';

/**
 * Onboarding - Slides de bienvenida móvil
 * Experiencia simplificada y premium
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, LogoExtended } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  
  const slides = [
    {
      id: 'style',
      image: '/sudadera.png',
      title: 'Define tu estilo',
      description: 'Descubre prendas que encajan perfectamente contigo.',
      color: 'from-[var(--brand-pink)]/20 to-purple-600/20',
    },
    {
      id: 'organize',
      image: '/pantalon.png',
      title: 'Organiza tu armario',
      description: 'Digitaliza tu ropa y crea combinaciones infinitas.',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 'community',
      image: '/new balance.png',
      title: 'Inspírate',
      description: 'Conecta con una comunidad apasionada por la moda.',
      color: 'from-orange-500/20 to-amber-500/20',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirección si ya está autenticado
  useEffect(() => {
    if (user) router.push('/closet');
  }, [user, router]);

  if (user) return null;

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.push('/auth?mode=signup');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              background: `linear-gradient(180deg, transparent 0%, ${slides[currentSlide % slides.length].color.replace('/20', '/10')} 100%)`
            }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          />
      </div>

      {/* Header Logo */}
      <div className="pt-12 px-6 z-10">
        <LogoExtended size="md" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {/* Image Container with Floating Effect */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-64 h-64 mb-8"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl" />
               <Image
                 src={slides[currentSlide].image}
                 alt={slides[currentSlide].title}
                 fill
                 className="object-contain drop-shadow-2xl"
                 priority
               />
            </motion.div>

            <h2 className="text-3xl font-bold mb-3 text-[var(--foreground)] tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-[17px] text-[var(--foreground-secondary)] leading-relaxed max-w-xs">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Controls */}
      <div className="p-8 pb-12 z-10 w-full max-w-md mx-auto">
        
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              animate={{ 
                width: idx === currentSlide ? 24 : 8,
                opacity: idx === currentSlide ? 1 : 0.3,
                backgroundColor: idx === currentSlide ? 'var(--brand-pink)' : 'var(--foreground)'
              }}
              className="h-2 rounded-full transition-all"
            />
          ))}
        </div>

        {/* Action Button */}
        <Button 
          size="lg" 
          glow={true} 
          onClick={nextSlide}
          className="w-full text-lg h-14 rounded-2xl shadow-xl shadow-[var(--brand-pink)]/20"
        >
          {currentSlide === slides.length - 1 ? 'Empezar' : 'Continuar'}
        </Button>

        {/* Login Link */}
        <div className="mt-6 text-center">
            <span className="text-[var(--foreground-tertiary)] text-sm">¿Ya tienes cuenta? </span>
            <Link href="/auth?mode=login" className="text-[var(--brand-pink)] font-semibold text-sm hover:underline">
              Iniciar Sesión
            </Link>
        </div>
      </div>
    </div>
  );
}
