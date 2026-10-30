import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { ARTICLES_DATA } from '@/lib/trends/articlesData';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: 'Guías de Estilo, Armario Cápsula y Tendencias | Klozet',
  description: 'Guías prácticas sobre cómo organizar tu armario, combinar colores, cuidar tus prendas y vestir mejor cada mañana con la ropa que ya tienes.',
  keywords: [
    'armario capsula',
    'guias de estilo',
    'como combinar ropa',
    'streetwear espana',
    'teoria del color ropa',
    'organizar armario',
    'klozet'
  ],
  alternates: {
    canonical: '/trends',
  },
  openGraph: {
    title: 'Guías de Estilo y Organización de Armario | Klozet',
    description: 'Guías prácticas para combinar mejor tu ropa real, ahorrar tiempo cada mañana y construir un armario que uses al 100%.',
    url: 'https://klozet.es/trends',
    type: 'website',
  },
};

export default function TrendsPage() {
  const featuredArticle = ARTICLES_DATA[0];
  const secondaryFeatured = ARTICLES_DATA.slice(1, 3);
  const remainingArticles = ARTICLES_DATA.slice(3);

  return (
    <div className="min-h-screen bg-white dark:bg-[#111113] text-zinc-950 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#FF66C4)] selection:text-white">
      <PublicHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Clean Editorial Masthead (Left-aligned, structured, zero AI slop) */}
        <header className="pb-10 sm:pb-12 mb-10 sm:mb-14 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-[var(--brand-pink-dark,#ED4C9E)] tracking-tight">
              Guías de estilo y organización · {ARTICLES_DATA.length} artículos
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
              Aprende a sacarle partido a la ropa que ya tienes.
            </h1>
          </div>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
            Fórmulas reales para combinar colores, elegir cortes según tu cuerpo, cuidar tejidos y dejar de perder 15 minutos cada mañana frente al espejo.
          </p>
        </header>

        {/* Top Asymmetric Editorial Grid: 1 Main Story (7 cols) + 2 Side Stories (5 cols) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-14 sm:pb-16 border-b border-zinc-200/80 dark:border-zinc-800/80">
          {featuredArticle && (
            <article className="lg:col-span-7 group">
              <Link href={`/trends/${featuredArticle.slug}`} className="block space-y-5">
                <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08]">
                  <Image
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 680px"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    priority
                  />
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-medium">
                    {featuredArticle.category}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readingTime}
                    </span>
                    <span>·</span>
                    <span>{featuredArticle.publishedAt}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink-dark,#ED4C9E)] transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="pt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink,#FF66C4)] transition-colors">
                    <span>Leer guía completa</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </article>
          )}

          {/* Right Column: 2 Secondary Guides */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {secondaryFeatured.map((article, idx) => (
              <article
                key={article.slug}
                className={`group ${idx === 0 ? 'pb-7' : 'pt-7'}`}
              >
                <Link href={`/trends/${article.slug}`} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 relative aspect-[4/3] rounded-[18px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08]">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="220px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="col-span-7 space-y-1.5">
                    <span className="text-[11px] font-semibold text-[var(--brand-pink-dark,#ED4C9E)]">
                      {article.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink-dark,#ED4C9E)] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{article.readingTime}</span>
                    </p>
                  </div>
                </Link>
              </article>
            ))}

            {/* Inline Kloe Card inside Top Grid */}
            <div className="pt-7">
              <div className="p-5 rounded-[22px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="relative w-14 h-8 shrink-0">
                      <Image
                        src="/kloe-logo-large.png"
                        alt="Kloe"
                        fill
                        className="object-contain object-left"
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Tu estilista en Klozet
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                    ¿No sabes cómo combinar una prenda? Pídele a Kloe que te arme el look con tu ropa.
                  </p>
                </div>
                <Link
                  href="/closet/kloe"
                  className="shrink-0 px-4 py-2.5 rounded-full bg-[var(--brand-pink,#FF66C4)] text-white text-xs font-semibold hover:opacity-95 transition-all active:scale-95"
                >
                  Hablar con Kloe
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Remaining Guides Index */}
        <section className="py-14 sm:py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Todas las guías prácticas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
            {remainingArticles.map((article) => (
              <article key={article.slug} className="group flex flex-col justify-between">
                <Link href={`/trends/${article.slug}`} className="space-y-4">
                  <div className="relative aspect-[16/10] w-full rounded-[20px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08]">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-medium">
                      {article.category}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readingTime}</span>
                      <span>·</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink-dark,#ED4C9E)] transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>

                <div className="pt-4 mt-4 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    #{article.tags[0]}
                  </span>
                  <Link
                    href={`/trends/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink,#FF66C4)] transition-colors"
                  >
                    <span>Leer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom Banner: Habla con Kloe */}
        <section className="mt-4 rounded-[28px] p-6 sm:p-10 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/90 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative w-24 h-14 shrink-0">
              <Image
                src="/kloe-logo-large.png"
                alt="Kloe"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-1 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Pasa de la teoría a tu propio armario con Kloe
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sube tus prendas en 15 minutos, dile a Kloe qué plan tienes hoy y deja que te arme el outfit completo sin dar vueltas frente al espejo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/closet/kloe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--brand-pink,#FF66C4)] text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hablar con Kloe</span>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
