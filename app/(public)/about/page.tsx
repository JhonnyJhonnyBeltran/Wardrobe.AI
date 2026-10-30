'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageCircle } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#111113] text-zinc-950 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#FF66C4)] selection:text-white">
      <PublicHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Asymmetric Editorial Hero: Story on Left, Real Founder Photo on Right */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 sm:pb-24 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <span>La historia detrás de Klozet</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
              De saltar entre Pinterest, Instagram y Zara a tener tu armario en el bolsillo.
            </h1>

            <div className="space-y-4 text-base sm:text-[17px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              <p>
                Hola, soy <strong className="text-zinc-950 dark:text-white font-semibold">Ethan</strong>. Klozet no nació en una agencia ni es el proyecto de una gran empresa: lo empecé a programar viendo el dilema que tenían mi novia y sus amigas cada vez que íbamos a salir o tenían que vestirse por la mañana.
              </p>
              <p>
                Con el armario lleno de ropa, siempre pasaba lo mismo: decían que no tenían nada que ponerse y empezaban un bucle infinito saltando de <strong className="text-zinc-950 dark:text-white font-medium">Pinterest</strong> a <strong className="text-zinc-950 dark:text-white font-medium">Instagram</strong> y de ahí a <strong className="text-zinc-950 dark:text-white font-medium">Zara</strong>, viendo outfits de influencers, haciendo capturas de pantalla e intentando adivinar de qué marca era cada prenda o cómo combinar algo parecido con lo que tenían en casa.
              </p>
              <p>
                Decidí crear Klozet para unir todas esas piezas en un solo lugar: una app donde digitalizas tu ropa real en minutos, ves de dónde es cada prenda que lleva la comunidad sin tener que adivinarlo y hablas con <strong className="text-zinc-950 dark:text-white font-medium">Kloe</strong> para que te monte el outfit del día con lo que ya tienes colgado en tu cuarto.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[var(--brand-pink,#FF66C4)] text-white hover:opacity-95 transition-all active:scale-[0.97] shadow-sm"
              >
                <span>Probar Klozet gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/closet/kloe"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-all active:scale-[0.97]"
              >
                <MessageCircle className="w-4 h-4 text-[var(--brand-pink,#FF66C4)]" />
                <span>Hablar con Kloe</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Real Photograph of Ethan and his Girlfriend */}
          <div className="lg:col-span-5">
            <figure className="relative rounded-[28px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)]">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/about/ethan-fundador.jpg"
                  alt="Ethan y su novia frente al espejo antes de salir"
                  fill
                  sizes="(max-width: 1024px) 100vw, 440px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="px-5 py-3.5 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Ethan · Creador de Klozet</span>
                <span>El origen de la idea</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Section 2: El problema real vs Cómo funciona Klozet (Clean Editorial Ledger, Not Generic Boxes) */}
        <section className="py-16 sm:py-20 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Qué cambia cuando pasas tu armario a Klozet
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              En lugar de tener capturas perdidas en la galería del móvil y ropa olvidada al fondo del cajón, todo está conectado.
            </p>
          </div>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 border-t border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="py-7 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
              <div className="md:col-span-4">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white">
                  Fin a adivinar de dónde es cada prenda
                </h3>
              </div>
              <div className="md:col-span-8 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cuando ves un outfit en el feed de Klozet, puedes deslizar para ver las prendas exactas recortadas o pasarle el post a <strong className="text-zinc-950 dark:text-white font-medium">Kloe</strong> para que te explique qué lleva puesto esa persona y cómo montar ese mismo rollo con tu ropa.
              </div>
            </div>

            <div className="py-7 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
              <div className="md:col-span-4">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white">
                  15 minutos hoy te ahorran 91 horas al año
                </h3>
              </div>
              <div className="md:col-span-8 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pasar 15 minutos cada mañana dudando frente al espejo suma más de 91 horas al año (casi 4 días enteros). Subiendo fotos rápidas de tu ropa o capturas desde la web donde la compraste, la app borra el fondo en tu dispositivo y deja tu armario listo para combinar en segundos.
              </div>
            </div>

            <div className="py-7 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
              <div className="md:col-span-4">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white">
                  Kloe conoce tu ropa y cómo eres
                </h3>
              </div>
              <div className="md:col-span-8 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sin subir fotos personales de tu cara: solo indicas tu altura, tu tipo de cuerpo, tu color de ojos y de pelo, y Kloe te recomienda combinaciones reales de tu propio armario según el tiempo que hace en tu ciudad y el plan que tengas.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Direct Contact & Personal Note */}
        <section className="pt-16 sm:pt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Construido escuchando a quienes lo usan cada día
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Si tienes cualquier idea para mejorar la app, echas en falta alguna función o quieres escribirme directamente, leo todos los mensajes en{' '}
              <a
                href="mailto:klozet.enterprise@gmail.com"
                className="text-zinc-950 dark:text-white font-semibold underline decoration-[var(--brand-pink,#FF66C4)] underline-offset-4"
              >
                klozet.enterprise@gmail.com
              </a>.
            </p>
          </div>

          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-all active:scale-[0.97]"
          >
            <span>Escribir a Ethan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
