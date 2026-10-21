'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#FF66C4)] selection:text-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        
        {/* Editorial Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-xs uppercase font-bold tracking-widest text-[var(--brand-pink,#FF66C4)]">
            Sobre Nosotros
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-zinc-950 dark:text-white leading-[1.05]">
            <span className="text-[1.2em] italic font-serif text-[var(--brand-pink,#FF66C4)] mr-0.5">E</span>l armario que de verdad usas
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
            Klozet nació para resolver una contradicción que todos vivimos: tener el armario petado de ropa y sentir cada mañana que no tienes nada que ponerte.
          </p>
        </div>

        {/* Hero Visual Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] w-full border border-black/[0.08] dark:border-white/[0.08] shadow-xl">
          <Image
            src="/landing/outfits/chica-brown-top-jeans.jpg"
            alt="Editorial Klozet"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-pink,#FF66C4)]">
              Cultura Klozet
            </p>
            <p className="text-lg sm:text-2xl font-bold text-white mt-1 leading-snug">
              &ldquo;El 80% del tiempo vestimos el 20% de lo que tenemos. El resto se queda en perchas olvidadas o en la famosa silla.&rdquo;
            </p>
          </div>
        </div>

        {/* Real Story Section */}
        <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white uppercase">
            Nuestra Historia
          </h2>
          <p>
            Creamos Klozet cansados del mismo drama diario frente al espejo antes de salir. Acumular prendas que luego ni recuerdas que tienes en el fondo del cajón no soluciona nada.
          </p>
          <p>
            En Klozet, tu ropa real se convierte en un lookbook interactivo. Le sacas una foto a tu sudadera o a tus zapatillas favoritas y ya las tienes en pantalla para montar fits al vuelo antes de desordenar el cuarto, probar qué pega con qué y salir con el conjunto clavado.
          </p>
        </section>

        {/* 3 Pillars */}
        <section className="space-y-6 pt-4 max-w-3xl mx-auto">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white uppercase mb-2">
              Cómo entendemos la moda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
              <span className="text-xs font-mono font-bold text-[var(--brand-pink,#FF66C4)]">01</span>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Tu ropa real es lo primero
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sin prendas ficticias de catálogo. Tus prendas de confianza fotografiadas y ordenadas para sacarles el máximo partido.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
              <span className="text-xs font-mono font-bold text-[var(--brand-pink,#FF66C4)]">02</span>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Kloe, tu colega de estilo
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Le dices qué plan tienes o qué tiempo hace y te compone un fit completo con lo que ya tienes colgado.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
              <span className="text-xs font-mono font-bold text-[var(--brand-pink,#FF66C4)]">03</span>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Comunidad real (OOTD)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Inspiración auténtica de la calle sin poses forzadas, para descubrir cómo combina la gente las prendas que tú también tienes.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Call to Action */}
        <div className="text-center pt-6 pb-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white uppercase">
            Vístete mejor con lo que ya tienes
          </h2>
          <div className="pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm bg-[var(--brand-pink,#FF66C4)] text-white hover:opacity-95 transition-all shadow-md shadow-[var(--brand-pink,#FF66C4)]/20 active:scale-95"
            >
              <span>Empezar en Klozet gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
