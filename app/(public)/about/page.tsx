'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, Shield, Users, Sparkles, Check } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#ff2d78)] selection:text-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
        
        {/* Editorial Header */}
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <p className="text-xs uppercase font-bold tracking-widest text-[var(--brand-pink,#ff2d78)]">
            Sobre Nosotros
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
            Reimaginando cómo nos vestimos cada día.
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Klozet nace para responder a una contradicción universal: armarios desbordados de ropa y personas que sienten que no tienen nada que ponerse.
          </p>
        </div>

        {/* Hero Visual Collage / Team Mood */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] w-full border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg">
          <Image
            src="/landing/outfits/chica-brown-top-jeans.jpg"
            alt="Editorial Klozet"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Manifiesto de Marca
            </p>
            <p className="text-lg sm:text-2xl font-semibold text-white mt-1 leading-snug">
              &ldquo;El estilo verdadero no consiste en acumular prendas, sino en darles propósito y valor a través de combinaciones creativas.&rdquo;
            </p>
          </div>
        </div>

        {/* Story Section */}
        <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Nuestra Historia
          </h2>
          <p>
            Klozet nació de una observación cotidiana: la mayoría de las personas usamos apenas un 20% de las prendas que acumulamos en nuestros armarios. El resto queda sepultado en perchas y cajones, alimentando un ciclo constante de compras impulsivas que rara vez resuelve la incertidumbre matutina frente al espejo.
          </p>
          <p>
            Decidimos construir una plataforma que combinara la cercanía de una red social de moda con la utilidad precisa de un armario digital. En Klozet, tu ropa real se convierte en un catálogo interactivo que puedes explorar, combinar y compartir con una comunidad que valora la autenticidad por encima del consumo desmedido.
          </p>
        </section>

        {/* 4 Core Pillars */}
        <section className="space-y-8 pt-4">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2">
              Nuestros Cuatro Principios
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Las directrices fundamentales que guían cada línea de código y cada detalle de diseño en Klozet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400">01</span>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Tu ropa es el punto de partida
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                No necesitas comprar sin fin para vestir bien. La digitalización te permite redescubrir prendas olvidadas y maximizar el potencial de tu armario actual.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400">02</span>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Estilismo inteligente y sobrio
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Nuestra asistente Kloe no recurre a artificios publicitarios: analiza proporciones anatómicas, equilibrio cromático y contextos climáticos para sugerir looks prácticos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400">03</span>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Comunidad sin algoritmos tóxicos
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Celebramos la moda real de la calle (OOTD). Fomentamos un espacio seguro donde compartir atuendos cotidianos sin presiones ni dinámicas nocivas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400">04</span>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Privacidad como estándar
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tu armario es personal. Puedes mantener tus prendas en privado y elegir exactamente qué looks o combinaciones compartir con la comunidad.
              </p>
            </div>
          </div>
        </section>

        {/* Commitment to Craftsmanship */}
        <section className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-pink,#ff2d78)]">
            <Compass className="w-4 h-4" />
            <span>Artesanía de Software</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Diseñado con estándares de alta costura digital
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Cada pantalla, transición y botón de Klozet se concibe siguiendo las directrices de Apple Human Interface Guidelines (HIG) y principios artesanales de producto. Creemos que una herramienta de moda debe sentirse tan refinada, rápida y agradable como la prenda más cuidada de tu armario.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white hover:text-[var(--brand-pink,#ff2d78)] transition-colors"
            >
              <span>Contáctanos o colabora con nosotros</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Call to action */}
        <div className="text-center pt-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Únete a la nueva era del armario digital
          </h2>
          <div className="pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-all shadow-md"
            >
              <span>Crear mi cuenta gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
