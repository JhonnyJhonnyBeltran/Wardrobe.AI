'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, 
  Layers, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  Camera,
  Heart,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Smart sticky header: hides on scroll down, reappears smoothly on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 120) {
        // Scrolling down
        setShowHeader(false);
      } else {
        // Scrolling up
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const outfitShowcase = [
    {
      title: "Clean Look",
      category: "Casual Diario",
      image: "/styles/women/clean-look.jpg",
      tags: ["Básicos neutros", "Blazer oversize", "Zapatillas blancas"]
    },
    {
      title: "Streetwear Urbano",
      category: "Tendencia",
      image: "/styles/men/streetwear.jpg",
      tags: ["Hoodie boxy", "Cargo pants", "Sneakers"]
    },
    {
      title: "Old Money / Quiet Luxury",
      category: "Elegante",
      image: "/styles/women/old-money.jpg",
      tags: ["Jersey polo", "Pantalón pinzas", "Mocasines"]
    },
    {
      title: "Casual Moderno",
      category: "Versátil",
      image: "/styles/men/casual-moderno.jpg",
      tags: ["Sobrecamisa", "Jeans rectos", "Bambas retro"]
    }
  ];

  const valueProps = [
    {
      step: "01",
      icon: <Camera className="w-6 h-6 text-[var(--brand-pink)]" />,
      title: "Digitaliza en segundos sin esfuerzo",
      subtitle: "Toda tu ropa en la palma de tu mano",
      description: "Haz una foto a tus prendas o añade capturas de tus marcas favoritas (Zara, ASOS, Nike, Uniqlo). La app recorta el fondo al instante y clasifica por color, tipo y temporada."
    },
    {
      step: "02",
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      title: "Crea looks en un lienzo interactivo",
      subtitle: "Combina sin desordenar tu habitación",
      description: "Mueve, escala y superpón capas como un estilista profesional. Prueba combinaciones imposibles y encuentra nuevas formas de usar la ropa que ya tienes."
    },
    {
      step: "03",
      icon: <SlidersHorizontal className="w-6 h-6 text-pink-500" />,
      title: "Estilismo y asesoría a tu medida",
      subtitle: "Adiós a 'no sé qué ponerme'",
      description: "Recibe propuestas completas de pies a cabeza adaptadas a tu estilo personal, al clima de hoy y a la ocasión (oficina, cena, fiesta o fin de semana)."
    },
    {
      step: "04",
      icon: <Calendar className="w-6 h-6 text-emerald-500" />,
      title: "Planifica tu semana en el calendario",
      subtitle: "Despiértate sabiendo exactamente qué ponerte",
      description: "Asigna outfits a días específicos. Ahorra 15 minutos cada mañana y sal de casa con la seguridad de que tu look está perfectamente elegido."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between antialiased">
      
      {/* SMART STICKY HEADER */}
      <AnimatePresence>
        {showHeader && (
          <motion.header 
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 w-full apple-glass-bar border-b border-[var(--border-color)]/50 shadow-sm"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 focus:outline-none select-none">
                <Image 
                  src="/klozet-logo.png" 
                  alt="Klozet Logo" 
                  width={105} 
                  height={30} 
                  className="dark:hidden block object-contain h-7 w-auto" 
                  priority 
                />
                <Image 
                  src="/klozet-logo-dark.png" 
                  alt="Klozet Logo" 
                  width={105} 
                  height={30} 
                  className="hidden dark:block object-contain h-7 w-auto" 
                  priority 
                />
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--foreground-secondary)]">
                <a href="#solucion" className="hover:text-[var(--foreground)] transition-colors">¿Por qué Klozet?</a>
                <a href="#funcionalidades" className="hover:text-[var(--foreground)] transition-colors">Funcionalidades</a>
                <a href="#inspiracion" className="hover:text-[var(--foreground)] transition-colors">Inspo & Outfits</a>
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {user ? (
                  <Link 
                    href="/closet" 
                    className="px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Mi Armario</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/auth" 
                      className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors px-3 py-2"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      href="/auth" 
                      className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1.5"
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

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full text-center flex flex-col items-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-gradient-to-tr from-[var(--brand-pink)]/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-sm mb-6 text-xs sm:text-sm font-medium text-[var(--foreground-secondary)]"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse" />
          <span>El armario digital y la red social para gente que ama vestir bien</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-[var(--foreground)] leading-[1.08]"
        >
          ¿Harta de no saber <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
            qué ponerte cada mañana?
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-[var(--foreground-secondary)] max-w-2xl leading-relaxed font-normal"
        >
          Digitaliza tu ropa, crea outfits en un lienzo interactivo, planifica tu semana y descubre combinaciones increíbles con prendas que ya tienes en tu armario.
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
            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/25 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>Empezar mi armario gratis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#solucion"
            className="w-full sm:w-auto px-7 py-4 rounded-full font-semibold text-sm sm:text-base bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 flex items-center justify-center"
          >
            Ver cómo funciona
          </a>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-[var(--foreground-secondary)]"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--brand-pink)]" />
            <span>Sin anuncios molestos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--brand-pink)]" />
            <span>Recorte automático de prendas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--brand-pink)]" />
            <span>100% privado o público según elijas</span>
          </div>
        </motion.div>
      </section>

      {/* OUTFIT SHOWCASE GALLERY */}
      <section id="inspiracion" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-wider font-bold text-[var(--brand-pink)] mb-2">
            Inspiración Real
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Tu estilo, organizado visualmente
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--foreground-secondary)]">
            Explora cómo se ven los looks montados en Klozet con fotos de alta definición.
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
              className="group relative rounded-3xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)]/70 shadow-lg hover:shadow-2xl transition-all"
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

      {/* CORE VALUE PROPOSITIONS (APPLE 4-STEP GRID) */}
      <section id="solucion" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-[var(--border-color)]/40">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-wider font-bold text-[var(--brand-pink)] mb-2">
            La Experiencia Klozet
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Todo lo que necesitas para vestir mejor
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--foreground-secondary)]">
            Un flujo fluido diseñado para ahorrarte tiempo, eliminar indecisiones y redescubrir tu ropa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {valueProps.map((prop, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[var(--card-bg)]/70 backdrop-blur-xl border border-[var(--border-color)]/70 hover:border-[var(--brand-pink)]/40 shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-6 right-6 font-mono text-3xl font-extrabold text-[var(--foreground-tertiary)]/30 group-hover:text-[var(--brand-pink)]/30 transition-colors">
                {prop.step}
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {prop.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)]">
                  {prop.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1 mb-3">
                  {prop.title}
                </h3>
                <p className="text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                  {prop.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA BOX */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--background-secondary)] to-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
              Lleva tu armario al siguiente nivel
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--foreground-secondary)] leading-relaxed">
              Únete a la comunidad de moda de Klozet. Empieza gratis en menos de un minuto con tu cuenta de Google.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <span>Crear mi cuenta gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CLEAN APPLE-STYLE FOOTER */}
      <footer className="border-t border-[var(--border-color)]/60 bg-[var(--card-bg)]/40 py-12 px-4 sm:px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <Image 
              src="/klozet-logo.png" 
              alt="Klozet Logo" 
              width={95} 
              height={28} 
              className="dark:hidden block object-contain" 
            />
            <Image 
              src="/klozet-logo-dark.png" 
              alt="Klozet Logo" 
              width={95} 
              height={28} 
              className="hidden dark:block object-contain" 
            />
            <p className="text-xs text-[var(--foreground-secondary)] mt-1">
              La red social de moda y organizador de armario digital.
            </p>
            <p className="text-[11px] text-[var(--foreground-tertiary)]">
              © {new Date().getFullYear()} Klozet. Todos los derechos reservados.
            </p>
          </div>

          {/* Quick links & Legal */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[var(--foreground-secondary)]">
            <Link href="/auth" className="hover:text-[var(--foreground)] transition-colors">
              Iniciar Sesión
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">
              Política de Privacidad
            </Link>
            <span className="text-[var(--border-color)]">•</span>
            <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors">
              Términos de Servicio
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

