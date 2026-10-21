'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Compass, 
  Palette, 
  Share2, 
  Check, 
  Shirt, 
  BookOpen, 
  Flame,
  ChevronRight
} from 'lucide-react';
import { useUser } from '@/store';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function LandingPage() {
  const { user } = useUser();

  const curatedLooks = [
    {
      image: '/landing/outfits/outfit-chaleco-cartier.jpg',
      title: 'Chaleco Sastre & Reloj Cartier',
      tag: 'Quiet Luxury',
      pieces: ['Chaleco Lino', 'Pantalón Pinzas', 'Reloj Vintage']
    },
    {
      image: '/landing/outfits/chica-blanco-total-look.jpg',
      title: 'Total White Monocromático',
      tag: 'Minimalismo',
      pieces: ['Blusa Seda', 'Pantalón Fluido', 'Sandalia Cuero']
    },
    {
      image: '/landing/outfits/chico-denim-sneakers-street.jpg',
      title: 'Denim Relajado & Calzado Retro',
      tag: 'Streetwear',
      pieces: ['Camisa Oversized', 'Jeans Raw Denim', 'Retro Sneakers']
    },
    {
      image: '/landing/outfits/outfit-rayas-miumiu.jpg',
      title: 'Punto Marinero & Bolso Estructurado',
      tag: 'Old Money',
      pieces: ['Jersey Rayas', 'Falda Plisada', 'Bolso Piel']
    }
  ];

  const articles = [
    {
      slug: 'armario-capsula-2026',
      title: 'Armario Cápsula 2026: La guía definitiva de elegancia atemporal',
      category: 'Esenciales',
      readTime: '6 min de lectura'
    },
    {
      slug: 'quiet-luxury-streetwear',
      title: 'Streetwear y Quiet Luxury: La colisión estética que define el 2026',
      category: 'Tendencias',
      readTime: '7 min de lectura'
    },
    {
      slug: 'teoria-del-color-moda',
      title: 'La Teoría del Color en tu ropa: Regla del 60-30-10 y contrastes',
      category: 'Estilismo',
      readTime: '8 min de lectura'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 selection:bg-[var(--brand-pink,#ff2d78)] selection:text-white antialiased">
      {/* 1. Frosted Liquid Header */}
      <PublicHeader />

      <main className="w-full">
        {/* =================================================================== */}
        {/* 2. HERO SECTION: EDITORIAL FASHION MOODBOARD */}
        {/* =================================================================== */}
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
          
          {/* Subtle Atmospheric Lighting (Neutral Warm, Not Loud Gradient) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/5 dark:bg-rose-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            {/* Subtle Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink,#ff2d78)]" />
              <span>La Red Social de Moda & Armario Virtual</span>
            </div>

            {/* Monumental Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-zinc-950 dark:text-white">
              Viste lo que tienes.{' '}
              <span className="font-serif italic font-normal text-zinc-700 dark:text-zinc-300">
                Descubre lo que eres.
              </span>
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 font-normal max-w-2xl leading-relaxed">
              Termina con el clásico &quot;armario lleno y nada que ponerme&quot;. Klozet organiza tus prendas reales, conecta tu estilo con una comunidad viva y te propone combinaciones impecables cada mañana.
            </p>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {user ? (
                <Link
                  href="/closet"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  <span>Ir a mi Armario</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <span>Empezar gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/trends"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Explorar tendencias</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual Collage: Real Photography & Garment Cards */}
          <div className="mt-14 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {curatedLooks.map((look, i) => (
              <div 
                key={i}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority={i < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-wider uppercase text-white">
                    {look.tag}
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs sm:text-sm font-bold leading-tight drop-shadow-xs">
                      {look.title}
                    </p>
                    <p className="text-[10px] text-zinc-300 mt-0.5 truncate">
                      {look.pieces.join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Strip */}
          <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium border-y border-zinc-200/60 dark:border-zinc-800/60 py-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Digitalización de prendas reales</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Estilismo inteligente con Kloe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Comunidad OOTD e inspiración diaria</span>
            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 3. MANIFESTO / THE CORE DILEMMA */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 bg-zinc-50 dark:bg-zinc-950/60 border-y border-zinc-200/80 dark:border-zinc-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <p className="text-xs uppercase tracking-widest text-[var(--brand-pink,#ff2d78)] font-bold">
                Nuestra Filosofía
              </p>
              <blockquote className="text-2xl sm:text-4xl md:text-5xl font-serif italic text-zinc-900 dark:text-zinc-100 leading-tight">
                &ldquo;El 80% del tiempo vestimos el 20% de nuestra ropa. El resto permanece en el olvido.&rdquo;
              </blockquote>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl mx-auto">
                Klozet transforma ese desorden en un catálogo digital activo. No necesitas comprar ropa sin parar para vestir mejor: necesitas ver con claridad lo que ya tienes y aprender a combinarlo sin fricción.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs">
                <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">01 / DIGITALIZACIÓN</span>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Tu armario en el bolsillo
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Saca fotos rápidas a tus prendas. Klozet las aísla con precisión de estudio, clasificando tejidos, marcas y colores en tu catálogo personal.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs">
                <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">02 / ESTILISMO</span>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Kloe: Estilista personal
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Indica a qué evento vas o qué temperatura hace. Kloe sugiere outfits completos basados en colorimetría, corte y tus prendas reales.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs">
                <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">03 / INSPIRACIÓN SOCIAL</span>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                  Comunidad y OOTD
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Descubre qué visten creadores afines a tu estética, guarda combinaciones favoritas y exporta tus looks a Instagram Stories con un toque.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 4. FEATURE SPOTLIGHT: DIGITALIZACIÓN & PIEZAS */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            
            {/* Left: Text & Features */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink,#ff2d78)]">
                Organización Impecable
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
                Organiza cada prenda.{' '}
                <span className="font-serif italic font-normal text-zinc-600 dark:text-zinc-400">
                  Sin esfuerzo.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Olvídate de rebuscar entre perchas y cajones. Tu ropa se organiza en categorías táctiles que puedes filtrar por temporada, ocasión o gama cromática.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Etiquetado automático:</strong> Detección de color, tipo de prenda y ocasión.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Lienzo de outfits interactivo:</strong> Junta prendas libremente para visualizar cómo encajan antes de ponértelas.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Calendario de looks:</strong> Planifica tus estilismos para la semana, viajes o citas especiales.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 text-sm font-bold text-zinc-950 dark:text-white hover:text-[var(--brand-pink,#ff2d78)] transition-colors group"
                >
                  <span>Empieza a organizar tu armario</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Clean Fashion Garment Showcase */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-100/70 dark:bg-zinc-900/40 p-5 sm:p-7 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70">
              
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60">
                  <Image
                    src="/landing/zara-chaleco.jpg"
                    alt="Chaleco Zara"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-semibold text-zinc-900 dark:text-white truncate">
                    Chaleco Punto • Zara
                  </div>
                </div>

                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60">
                  <Image
                    src="/landing/top-vichy.jpg"
                    alt="Top Vichy"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-semibold text-zinc-900 dark:text-white truncate">
                    Top Halter Vichy
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center p-3">
                  <Image
                    src="/landing/botas-cowboy.png"
                    alt="Botas Cowboy Cuero"
                    fill
                    className="object-contain p-4"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-semibold text-zinc-900 dark:text-white truncate">
                    Botas Cowboy Ante
                  </div>
                </div>

                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center p-3">
                  <Image
                    src="/landing/sudadera-scuffers-cutout.png"
                    alt="Sudadera Scuffers"
                    fill
                    className="object-contain p-4"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-semibold text-zinc-900 dark:text-white truncate">
                    Sudadera Scuffers
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 5. KLOE: LA ASESORA DE ESTILO PERSONAL */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 bg-zinc-950 text-white relative overflow-hidden">
          <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-rose-500/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
              
              {/* Left Column: Interactive Chat Simulation */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-pink,#ff2d78)] text-white flex items-center justify-center font-bold text-sm">
                      K
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Kloe</p>
                      <p className="text-xs text-zinc-400">Asesora de Estilo Personal</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    En línea
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* User Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-xs px-4 py-3 leading-relaxed">
                      Tengo una comida de trabajo informal hoy a las 14:00. Hace 20°C y sol. ¿Qué me pongo con lo que tengo en el armario?
                    </div>
                  </div>

                  {/* Kloe Response */}
                  <div className="flex justify-start">
                    <div className="max-w-[88%] bg-zinc-800/60 border border-zinc-700/60 text-zinc-200 rounded-2xl rounded-tl-xs px-4 py-3.5 space-y-3 leading-relaxed">
                      <p>
                        Te propongo un look <strong>Smart Casual</strong> equilibrado con prendas de tu armario:
                      </p>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        <li>• <strong>Top:</strong> Tu chaleco de punto crudo sobre camiseta básica blanca.</li>
                        <li>• <strong>Inferior:</strong> Pantalón de pinzas gris grafito para dar estructura.</li>
                        <li>• <strong>Calzado:</strong> Mocasines o botín de ante cómodo.</li>
                      </ul>
                      <div className="pt-2 flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1.5 rounded-lg bg-zinc-700/60 text-zinc-200 font-medium">
                          ✓ Armonía 60-30-10
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-zinc-700/60 text-zinc-200 font-medium">
                          ✓ Apto para 20°C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800">
                  <span>Recomendación generada a partir de 24 prendas reales</span>
                  <Link href="/auth" className="text-[var(--brand-pink,#ff2d78)] hover:underline font-semibold">
                    Probar con mi armario →
                  </Link>
                </div>
              </div>

              {/* Right Column: Explanatory Copy */}
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink,#ff2d78)]">
                  Estilismo con Criterio
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Consejos de moda que entienden tus prendas.
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Kloe no inventa ropa que no tienes ni te empuja a comprar sin fin. Analiza tus fotos, la colorimetría de tus tejidos y el contexto del día para sugerirte combinaciones con las que te sientas cómodo y seguro.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <Palette className="w-5 h-5 text-rose-400 mb-2" />
                    <h3 className="font-bold text-sm text-white">Colorimetría Real</h3>
                    <p className="text-xs text-zinc-400 mt-1">Armonías cromáticas, contrastes y tonos complementarios.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <Share2 className="w-5 h-5 text-purple-400 mb-2" />
                    <h3 className="font-bold text-sm text-white">Exportación a IG</h3>
                    <p className="text-xs text-zinc-400 mt-1">Descarga tus combinaciones en formato Story 9:16 en un clic.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-md"
                  >
                    <span>Conocer a Kloe</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* =================================================================== */}
        {/* 6. EDITORIAL HUB SPOTLIGHT (/trends) */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-pink,#ff2d78)]">
                Contenido Editorial Klozet
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white mt-1">
                Guías de estilo & Tendencias
              </h2>
            </div>
            <Link
              href="/trends"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-950 dark:text-white hover:text-[var(--brand-pink,#ff2d78)] transition-colors"
            >
              <span>Ver todas las publicaciones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((art) => (
              <Link
                key={art.slug}
                href={`/trends/${art.slug}`}
                className="group flex flex-col justify-between p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-xs hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold uppercase tracking-wider text-[var(--brand-pink,#ff2d78)]">
                      {art.category}
                    </span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white leading-snug group-hover:text-[var(--brand-pink,#ff2d78)] transition-colors">
                    {art.title}
                  </h3>
                </div>

                <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:translate-x-1 transition-transform">
                  <span>Leer artículo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* =================================================================== */}
        {/* 7. FINAL CALL TO ACTION */}
        {/* =================================================================== */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="p-10 sm:p-16 rounded-3xl bg-zinc-900 text-white relative overflow-hidden border border-zinc-800 shadow-2xl space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Empieza a vestir con intención.{' '}
              <span className="font-serif italic font-normal text-zinc-400">Hoy mismo.</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Únete a Klozet de forma totalmente gratuita. Digitaliza tu ropa en minutos y descubre todas las combinaciones que estaban esperando en tu armario.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-9 py-3.5 rounded-full font-bold text-sm bg-white text-zinc-950 hover:bg-zinc-100 active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-2"
              >
                <span>Crear cuenta gratuita</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <p className="text-xs text-zinc-500 pt-2">
              Sin tarjeta de crédito requerida • Disponible en web y móvil
            </p>
          </div>
        </section>
      </main>

      {/* 8. Editorial Footer */}
      <PublicFooter />
    </div>
  );
}
