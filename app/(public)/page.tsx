'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Shirt, 
  Layers, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { useUser } from '@/store';

export default function LandingPage() {
  const { user } = useUser();

  const features = [
    {
      icon: <Shirt className="w-6 h-6 text-[var(--brand-pink)]" />,
      title: "Armario Virtual Inteligente",
      description: "Digitaliza tus prendas en segundos. Sube fotos de tu ropa con eliminación de fondo instantánea y categorización automática por color, tipo y temporada."
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      title: "Lienzo de Creación de Outfits",
      description: "Combina prendas en un canvas interactivo y libre. Escala, rota, superpón capas y diseña tus looks favoritos con total libertad creativa."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-500" />,
      title: "Asesoría de Estilismo con Kloe",
      description: "Recibe recomendaciones personalizadas basadas en las prendas reales de tu armario, adaptadas a cada ocasión, estilo personal y clima."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Red Social & Comunidad de Moda",
      description: "Comparte tus outfits diarios (OOTD), descubre inspiración editorial, explora estilos de la comunidad y guarda looks en carpetas personalizadas."
    },
    {
      icon: <Calendar className="w-6 h-6 text-emerald-500" />,
      title: "Calendario & Planificador de Looks",
      description: "Organiza lo que vas a vestir cada día de la semana. Asigna outfits a fechas específicas y olvídate de la duda de qué ponerte por la mañana."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: "Privacidad y Seguridad Total",
      description: "Tus fotos y datos personales están protegidos con cifrado y estrictos estándares del RGPD. Tú decides si tu perfil es público o 100% privado."
    }
  ];

  const highlights = [
    "Digitalización rápida de prendas con recorte de fondo",
    "Creación ilimitada de outfits en lienzo libre",
    "Estilismo personalizado con análisis multimodal",
    "Exploración de más de 34 estilos de moda globales",
    "Guardado de inspiración en carpetas temáticas",
    "Acceso multiplataforma en móvil, tablet y escritorio"
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden selection:bg-[var(--brand-pink)] selection:text-white flex flex-col justify-between">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full apple-glass-bar border-b border-[var(--border-color)]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
            <Image 
              src="/klozet-logo.png" 
              alt="Klozet" 
              width={110} 
              height={32} 
              className="dark:hidden block object-contain" 
              priority 
            />
            <Image 
              src="/klozet-logo-dark.png" 
              alt="Klozet" 
              width={110} 
              height={32} 
              className="hidden dark:block object-contain" 
              priority 
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--foreground-secondary)]">
            <a href="#funcionalidades" className="hover:text-[var(--brand-pink)] transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-[var(--brand-pink)] transition-colors">Cómo funciona</a>
            <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors">Términos</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link 
                href="/closet" 
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>Ir a mi Armario</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/auth" 
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-md shadow-[var(--brand-pink)]/20 active:scale-95 flex items-center gap-1.5"
              >
                <span>Entrar a Klozet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 max-w-6xl mx-auto w-full text-center flex flex-col items-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-[var(--brand-pink)]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm mb-6 text-xs sm:text-sm text-[var(--foreground-secondary)]"
        >
          <Sparkles className="w-4 h-4 text-[var(--brand-pink)]" />
          <span>La Red Social de Moda y Armario Virtual Inteligente</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-[var(--foreground)] leading-[1.1]"
        >
          Digitaliza tu ropa. <br />
          <span className="bg-gradient-to-r from-[var(--brand-pink)] via-pink-400 to-purple-500 bg-clip-text text-transparent">
            Crea outfits perfectos.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-[var(--foreground-secondary)] max-w-2xl leading-relaxed"
        >
          Klozet es la plataforma definitiva para organizar tu armario en la nube, crear combinaciones de estilo en un lienzo interactivo, recibir asesoría y compartir tus mejores looks con la comunidad.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm sm:text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Comenzar gratis</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#funcionalidades"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base bg-[var(--card-bg)] hover:bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] transition-all active:scale-95 flex items-center justify-center"
          >
            Explorar características
          </a>
        </motion.div>

        {/* Highlights Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3 text-left w-full max-w-3xl"
        >
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--foreground-secondary)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-pink)] flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Todo lo que necesitas para tu estilo diario
          </h2>
          <p className="mt-4 text-base text-[var(--foreground-secondary)]">
            Diseñado con precisión estética para que disfrutes de tu ropa y descubras nuevas combinaciones sin esfuerzo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--border-color)]/60 shadow-lg hover:border-[var(--brand-pink)]/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--background-secondary)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-[var(--border-color)]/40">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            ¿Cómo funciona Klozet?
          </h2>
          <p className="mt-4 text-base text-[var(--foreground-secondary)]">
            Tu viaje hacia un armario ordenado e inteligente en 3 pasos sencillos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]/50">
            <div className="w-14 h-14 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-extrabold text-xl mb-4 border border-[var(--brand-pink)]/20">
              1
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Sube tu Ropa</h3>
            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
              Haz fotos a tus prendas o añade capturas de tus tiendas favoritas. Klozet las clasifica y recorta el fondo automáticamente.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]/50">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-extrabold text-xl mb-4 border border-purple-500/20">
              2
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Crea y Asesórate</h3>
            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
              Monta tus outfits en el lienzo libre o pídele a Kloe combinaciones adaptadas a tu estilo personal y a cualquier ocasión.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]/50">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-extrabold text-xl mb-4 border border-blue-500/20">
              3
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Planifica y Comparte</h3>
            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
              Asigna tus looks al calendario semanal, comparte tus outfits diarios en el feed y guarda inspiración de otros usuarios.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--card-bg)] via-[var(--background-secondary)] to-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
              Empieza a organizar tu armario hoy
            </h2>
            <p className="mt-4 text-base text-[var(--foreground-secondary)] max-w-xl mx-auto">
              Únete a la comunidad de moda de Klozet. Crea tu cuenta en menos de un minuto y lleva tu estilo al siguiente nivel.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth"
                className="px-8 py-4 rounded-full font-bold text-base bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] transition-all shadow-xl shadow-[var(--brand-pink)]/30 active:scale-95 inline-flex items-center gap-2"
              >
                <span>Crear mi cuenta gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-color)]/50 bg-[var(--card-bg)]/40 py-12 px-4 sm:px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Image 
              src="/klozet-logo.png" 
              alt="Klozet Logo" 
              width={90} 
              height={26} 
              className="dark:hidden block object-contain" 
            />
            <Image 
              src="/klozet-logo-dark.png" 
              alt="Klozet Logo" 
              width={90} 
              height={26} 
              className="hidden dark:block object-contain" 
            />
            <p className="text-xs text-[var(--foreground-tertiary)]">
              © {new Date().getFullYear()} Klozet (Wardrobe.AI). Todos los derechos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[var(--foreground-secondary)]">
            <Link href="/privacy" className="hover:text-[var(--brand-pink)] transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="hover:text-[var(--brand-pink)] transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/cookies" className="hover:text-[var(--brand-pink)] transition-colors">
              Política de Cookies
            </Link>
            <a href="mailto:soporte@klozet.es" className="hover:text-[var(--brand-pink)] transition-colors">
              Contacto: soporte@klozet.es
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
