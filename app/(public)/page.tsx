'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Layers, 
  Share2, 
  Check, 
  Shirt, 
  BookOpen, 
  Heart,
  ChevronRight,
  Sparkles,
  Camera,
  Calendar,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { useUser } from '@/store';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { triggerHaptic } from '@/lib/haptic';

export default function LandingPage() {
  const { user } = useUser();
  const [activeCanvasTab, setActiveCanvasTab] = useState<'canvas' | 'closet'>('canvas');
  const [likedLooks, setLikedLooks] = useState<Record<number, boolean>>({});

  const toggleLookLike = (idx: number) => {
    try { triggerHaptic('light'); } catch {}
    setLikedLooks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const curatedLooks = [
    {
      image: '/landing/outfits/chico-denim-sneakers-street.jpg',
      title: 'Denim Relajado & Sneakers',
      pieces: ['Camisa Oversize', 'Jeans Raw Denim', 'Retro Sneakers'],
      author: 'carlos_m'
    },
    {
      image: '/landing/outfits/chica-blanco-total-look.jpg',
      title: 'Look Total White',
      pieces: ['Blusa Seda', 'Pantalón Fluido', 'Sandalia Piel'],
      author: 'lucia.style'
    },
    {
      image: '/landing/outfits/outfit-chaleco-cartier.jpg',
      title: 'Chaleco Sastre & Reloj',
      pieces: ['Chaleco Lino', 'Pantalón Pinzas', 'Reloj Vintage'],
      author: 'alvaro_v'
    },
    {
      image: '/landing/outfits/outfit-rayas-miumiu.jpg',
      title: 'Punto Marinero & Bolso',
      pieces: ['Jersey Rayas', 'Falda Plisada', 'Bolso Piel'],
      author: 'valeria.f'
    }
  ];

  const articles = [
    {
      slug: 'armario-capsula-2026',
      title: 'Armario Cápsula: La guía para vestir mejor con menos prendas',
      category: 'Esenciales',
      readTime: '6 min de lectura'
    },
    {
      slug: 'quiet-luxury-streetwear',
      title: 'Cómo combinar básicos neutros con zapatillas y prendas urbanas',
      category: 'Tendencias',
      readTime: '7 min de lectura'
    },
    {
      slug: 'teoria-del-color-moda',
      title: 'La regla del 60-30-10 aplicada a tus combinaciones de ropa diaria',
      category: 'Estilismo',
      readTime: '8 min de lectura'
    }
  ];

  const faqs = [
    {
      q: '¿Cómo funciona la subida de prendas a mi armario?',
      a: 'Tomas una foto de tu prenda sobre fondo neutro o la seleccionas de tu galería. Klozet recorta el fondo automáticamente, detecta la categoría, color y marca, y la guarda en tu armario digital listo para combinar.'
    },
    {
      q: '¿Quién es Kloe y cómo me ayuda a vestirme?',
      a: 'Kloe es la asistente de estilismo de Klozet. Mira las prendas reales que tienes en tu armario y te sugiere qué ponerte según la ocasión, el clima y tu estilo personal. Sin inventar ropa que no posees.'
    },
    {
      q: '¿Puedo exportar mis looks a Instagram Stories?',
      a: 'Sí. Cualquier combinación u outfit creado en tu lienzo se puede descargar o compartir en formato vertical 9:16 para stories de Instagram o TikTok con un toque.'
    },
    {
      q: '¿Es Klozet gratis?',
      a: 'Sí. Registrarse, digitalizar tus prendas, usar el lienzo de outfits y explorar la comunidad es totalmente gratuito.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--pure-white,#ffffff)] dark:bg-[#111113] text-[var(--foreground,#000000)] selection:bg-[var(--brand-pink)] selection:text-white antialiased font-sans">
      {/* 1. Frosted Liquid Apple Header */}
      <PublicHeader />

      <main className="w-full">
        {/* =================================================================== */}
        {/* 2. HERO SECTION: "UN JUGUETE DENTRO DE UN IPHONE" */}
        {/* =================================================================== */}
        <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
          
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            {/* Playful Eyebrow Capsule */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/[0.08] text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse" />
              <span>La red social de moda y armario virtual</span>
            </motion.div>

            {/* Official Character Wordmark Hero Anchor */}
            <div className="relative h-14 sm:h-20 w-48 sm:w-64 my-1 flex items-center justify-center">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                fill 
                sizes="(max-width: 640px) 200px, 280px"
                className="object-contain"
                priority
              />
            </div>

            {/* Sentence-Case Native Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Tu armario real, por fin ordenado.{' '}
              <span className="text-[var(--brand-pink)] block sm:inline">
                Y combinaciones que funcionan.
              </span>
            </h1>

            {/* Direct Narrative Copy */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal max-w-2xl leading-relaxed">
              Termina con el &quot;tengo el armario lleno y nada que ponerme&quot;. Digitaliza tus prendas en segundos, combina outfits arrastrando en tu lienzo y pregúntale a Kloe qué ponerte hoy.
            </p>

            {/* Apple Spring Bouncy CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {user ? (
                <Link href="/closet" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ir a mi Armario</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              ) : (
                <>
                  <Link href="/auth" className="w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.025 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Empezar gratis</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Link>
                  <Link href="#como-funciona" className="w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-black/[0.04] dark:border-white/[0.06] inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Ver cómo funciona</span>
                    </motion.div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* INTERACTIVE APPLE GLASS MOCKUP: CLOTHING CANVAS */}
          {/* =================================================================== */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26, delay: 0.15 }}
              className="relative rounded-3xl sm:rounded-[32px] bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden p-4 sm:p-7"
            >
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-semibold">
                  <button 
                    onClick={() => setActiveCanvasTab('canvas')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      activeCanvasTab === 'canvas' 
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Lienzo de Outfit
                  </button>
                  <button 
                    onClick={() => setActiveCanvasTab('closet')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      activeCanvasTab === 'closet' 
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Armario Digital
                  </button>
                </div>
                <div className="text-xs font-semibold text-zinc-400 hidden sm:block">
                  Klozet Studio
                </div>
              </div>

              {/* Canvas Content */}
              {activeCanvasTab === 'canvas' ? (
                <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Interactive Pieces */}
                  <div className="md:col-span-7 bg-zinc-50 dark:bg-[#121215] rounded-2xl p-5 border border-black/[0.04] dark:border-white/[0.06] relative min-h-[300px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Outfit • Casual Primavera
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-semibold">
                        4 prendas combinadas
                      </span>
                    </div>

                    {/* Clothing Arrangement */}
                    <div className="grid grid-cols-2 gap-4 py-4 items-center">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-square rounded-2xl bg-white dark:bg-[#1c1c20] p-3 shadow-xs border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <div className="relative w-full h-24 sm:h-28">
                          <Image src="/landing/sudadera-scuffers-cutout.png" alt="Sudadera Scuffers" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Sudadera Scuffers</span>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-square rounded-2xl bg-white dark:bg-[#1c1c20] p-3 shadow-xs border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <div className="relative w-full h-24 sm:h-28">
                          <Image src="/landing/camisa-zara-cutout.png" alt="Camisa Zara" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Camisa Rayas Zara</span>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-square rounded-2xl bg-white dark:bg-[#1c1c20] p-3 shadow-xs border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <div className="relative w-full h-24 sm:h-28">
                          <Image src="/landing/onitsuka-tiger.png" alt="Zapatillas Onitsuka" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Onitsuka Tiger Mexico</span>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative aspect-square rounded-2xl bg-white dark:bg-[#1c1c20] p-3 shadow-xs border border-black/[0.04] dark:border-white/[0.06] flex flex-col items-center justify-center cursor-pointer group"
                      >
                        <div className="relative w-full h-24 sm:h-28">
                          <Image src="/landing/botas-cowboy.png" alt="Botas Cowboy" fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1">Botas Cowboy Piel</span>
                      </motion.div>
                    </div>

                    <div className="text-[11px] text-zinc-400 text-center">
                      Toca o arrastra para recolocar y probar combinaciones
                    </div>
                  </div>

                  {/* Right: Kloe Feedback Widget */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#141418] border border-black/[0.05] dark:border-white/[0.08] space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-7 h-7 shrink-0">
                          <Image src="/kloe-logo-small.png" alt="Kloe" fill className="object-contain" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">Kloe</p>
                          <p className="text-[10px] text-zinc-400">Opinión de estilismo</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        &quot;El contraste entre el corte relajado de la sudadera y las Onitsuka crea una proporción perfecta. Apto para 18°C y tardes informales.&quot;
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          ✓ Armonía 60-30-10
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          ✓ Estilo probado
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#141418] border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">Exportar a Instagram</p>
                        <p className="text-[11px] text-zinc-400">Story 9:16 con un clic</p>
                      </div>
                      <Link href="/auth">
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className="px-3 py-1.5 rounded-full bg-[var(--brand-pink)] text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Exportar
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Digital Closet Showcase */
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { img: '/landing/zara-chaleco.jpg', name: 'Chaleco Punto', brand: 'Zara', tag: 'Tops' },
                    { img: '/landing/top-vichy.jpg', name: 'Top Vichy', brand: 'Mango', tag: 'Tops' },
                    { img: '/landing/botas-cowboy.png', name: 'Botas Cowboy', brand: 'Vintage', tag: 'Calzado' },
                    { img: '/landing/sudadera-scuffers-cutout.png', name: 'Sudadera Beige', brand: 'Scuffers', tag: 'Abrigo' }
                  ].map((p, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      className="rounded-2xl p-3 bg-zinc-50 dark:bg-[#141418] border border-black/[0.05] dark:border-white/[0.08] space-y-2 cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white dark:bg-[#1c1c20] flex items-center justify-center p-2">
                        <Image src={p.img} alt={p.name} fill className="object-contain p-2" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">{p.brand} • {p.tag}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Social Proof Strip */}
          <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium border-y border-black/[0.06] dark:border-white/[0.08] py-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--brand-pink)]" />
              <span>Corte de prendas automático</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--brand-pink)]" />
              <span>Estilismo con Kloe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--brand-pink)]" />
              <span>Comunidad de outfits e inspiración</span>
            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 3. LAS 3 HERRAMIENTAS CLAVE */}
        {/* =================================================================== */}
        <section id="como-funciona" className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#151518]/60 border-y border-black/[0.06] dark:border-white/[0.08]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink)]">
                Cómo funciona Klozet
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Tres pasos para que tu ropa trabaje para ti
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Sin perder tiempo doblando ni rebuscar entre cajones. Todo en tu iPhone o navegador.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Pillar 1 */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-bold">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">01 / ARMARIO</span>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Sube tus prendas reales
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Saca una foto a tu ropa. Klozet elimina el fondo y organiza automáticamente por colores, tipos de prenda y marcas en tu catálogo personal.
                  </p>
                </div>
              </motion.div>

              {/* Pillar 2 */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">02 / LIENZO</span>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Prueba looks en el lienzo
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Junta camisetas, pantalones y calzado libremente sobre la pantalla como si probaras sobre tu cama, pero sin desordenar tu habitación.
                  </p>
                </div>
              </motion.div>

              {/* Pillar 3 */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center font-bold">
                  <Share2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">03 / COMUNIDAD</span>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Comparte y exporta
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Publica tus estilismos en el feed social, guarda ideas en carpetas y descárgalos preparados para tus stories de Instagram en un clic.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 4. KLOE: LA ASISTENTE CON CARA (SUB-MARCA) */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            
            {/* Left: Chat Card */}
            <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-9">
                    <Image src="/landing/kloe-grande-landing.png" alt="Kloe" fill className="object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Kloe</p>
                    <p className="text-[11px] text-zinc-500">Estilista de tu armario</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Lista para ayudarte
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tr-xs px-4 py-3 leading-relaxed">
                    Kloe, voy de cena informal por el centro y hace unos 18°C. ¿Qué me pongo con lo que tengo en el armario?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-[var(--brand-pink)]/10 dark:bg-[var(--brand-pink)]/15 border border-[var(--brand-pink)]/20 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-xs px-4 py-3.5 space-y-2.5 leading-relaxed">
                    <p className="font-semibold text-[var(--brand-pink-dark)] dark:text-[var(--brand-pink)]">
                      Fácil. Este look te queda impecable:
                    </p>
                    <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                      <li>• <strong>Top:</strong> Sudadera Scuffers beige con cuello limpio.</li>
                      <li>• <strong>Pantalón:</strong> Jeans rectos oscuros.</li>
                      <li>• <strong>Calzado:</strong> Zapatillas Onitsuka Tiger retro.</li>
                    </ul>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                      Armonía equilibrada, cómodo para andar y sin desentonar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-black/[0.06] dark:border-white/[0.08]">
                <span>Sugerencia basada en tus prendas reales</span>
                <Link href="/auth">
                  <motion.span 
                    whileHover={{ x: 2 }}
                    className="text-[var(--brand-pink)] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    Consultar a Kloe →
                  </motion.span>
                </Link>
              </div>
            </div>

            {/* Right: Text Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-bold uppercase tracking-wider">
                <span>Tu estilista personal</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Kloe te dice qué ponerte en 5 segundos.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sin perder tiempo dudando frente al espejo. Kloe conoce las prendas que tienes guardadas y te sugiere combinaciones listas para salir según el evento, la hora o el tiempo que haga.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08]">
                  <p className="font-bold text-sm text-zinc-950 dark:text-white">Prendas Reales</p>
                  <p className="text-xs text-zinc-500 mt-1">Solo combina ropa que de verdad tienes en tu armario.</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08]">
                  <p className="font-bold text-sm text-zinc-950 dark:text-white">Colorimetría & Filtro</p>
                  <p className="text-xs text-zinc-500 mt-1">Equilibrio de colores y cortes según la ocasión.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/auth">
                  <motion.div
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md cursor-pointer"
                  >
                    <span>Probar con mi ropa</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </div>
            </div>

          </div>
        </section>


        {/* =================================================================== */}
        {/* 5. COMUNIDAD DE OUTFITS (FEED SOCIAL) */}
        {/* =================================================================== */}
        <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#151518]/60 border-y border-black/[0.06] dark:border-white/[0.08]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink)]">
                  Inspiración Diaria
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mt-1">
                  Looks de la comunidad
                </h2>
              </div>
              <Link href="/auth" className="text-xs sm:text-sm font-semibold text-[var(--brand-pink)] hover:underline inline-flex items-center gap-1">
                <span>Ver más outfits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {curatedLooks.map((look, idx) => {
                const isLiked = !!likedLooks[idx];
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] shadow-xs"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image 
                        src={look.image} 
                        alt={look.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Interactive Like Spring Button */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={() => toggleLookLike(idx)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white cursor-pointer"
                        aria-label="Dar like al look"
                      >
                        <motion.div
                          animate={isLiked ? { scale: [1, 1.4, 0.9, 1] } : { scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'fill-none text-white'}`} />
                        </motion.div>
                      </motion.button>

                      {/* Caption */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-xs font-bold leading-tight drop-shadow-xs">{look.title}</p>
                        <p className="text-[10px] text-zinc-300 mt-0.5 truncate">@{look.author} • {look.pieces[0]}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 6. GUÍAS EDITORIALES (/trends) */}
        {/* =================================================================== */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink)]">
                Guías y Consejos
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mt-1">
                Aprende a sacarle partido a tu armario
              </h2>
            </div>
            <Link href="/trends" className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[var(--brand-pink)] inline-flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Ver todas las guías</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {articles.map((art) => (
              <Link key={art.slug} href={`/trends/${art.slug}`}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08] hover:border-[var(--brand-pink)]/40 transition-colors h-full flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-[var(--brand-pink)]">{art.category}</span>
                      <span>{art.readTime}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white leading-snug">
                      {art.title}
                    </h3>
                  </div>
                  <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>Leer guía</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>


        {/* =================================================================== */}
        {/* 7. PREGUNTAS FRECUENTES (FAQ) */}
        {/* =================================================================== */}
        <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-[#151518]/60 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink)]">
                Dudas resueltas
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-black/[0.06] dark:border-white/[0.08]">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 8. CTA FINAL CON SPRING BOUNCE */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="p-10 sm:p-14 rounded-3xl sm:rounded-[36px] bg-zinc-950 text-white relative overflow-hidden border border-zinc-800 shadow-2xl space-y-6">
            
            <div className="relative h-12 w-36 mx-auto">
              <Image 
                src="/landing/klozet-nombre-grande.png" 
                alt="Klozet" 
                fill 
                sizes="144px"
                className="object-contain" 
              />
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              Empieza a vestir con intención hoy mismo.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              Únete a Klozet de forma gratuita. Sube tu ropa en minutos y descubre combinaciones que no sabías que tenías.
            </p>

            <div className="pt-2 flex justify-center">
              <Link href="/auth">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="px-9 py-4 rounded-full font-bold text-sm bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Crear cuenta gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </div>
            
            <p className="text-xs text-zinc-500 pt-2">
              Sin tarjeta • Funciona en web, iPhone y Android
            </p>
          </div>
        </section>

      </main>

      {/* 9. Public Footer */}
      <PublicFooter />
    </div>
  );
}
