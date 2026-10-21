import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, BookOpen, ArrowRight, Tag } from 'lucide-react';
import { ARTICLES_DATA } from '@/lib/trends/articlesData';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: 'Revista de Moda, Tendencias & Guías de Estilo | Klozet Editorial',
  description: 'Descubre guías expertas sobre armario cápsula, combinaciones de color, streetwear quiet luxury y moda circular. El portal editorial de estilo de Klozet.',
  keywords: [
    'armario capsula',
    'guias de estilo',
    'tendencias de moda 2026',
    'como combinar ropa',
    'streetwear elegante',
    'quiet luxury espanol',
    'moda circular',
    'revista de moda online'
  ],
  alternates: {
    canonical: '/trends',
  },
  openGraph: {
    title: 'Revista de Moda & Guías de Estilo | Klozet Editorial',
    description: 'Guías de moda, tendencias contemporáneas y trucos de estilismo para construir un armario atemporal y sostenible.',
    url: 'https://klozet.es/trends',
    type: 'website',
  },
};

export default function TrendsPage() {
  const featuredArticle = ARTICLES_DATA[0];
  const otherArticles = ARTICLES_DATA.slice(1);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white">
      {/* Unified Public Header */}
      <PublicHeader />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
        {/* Editorial Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold tracking-wider uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink,#ff2d78)]" />
            <span>Klozet Editorial</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
            Tendencias, Estilo & Armario Inteligente
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
            Guías profundas de moda, análisis cromático y fórmulas de atuendos para vestir con intención, comprar con criterio y maximizar cada prenda.
          </p>
        </div>

        {/* Featured Article Card (Hero) */}
        {featuredArticle && (
          <article className="mb-14 sm:mb-20 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden shadow-lg hover:border-[var(--brand-pink)]/40 transition-all group">
            <Link href={`/trends/${featuredArticle.slug}`} className="grid grid-cols-1 md:grid-cols-12 gap-0">
              <div className="relative md:col-span-7 h-64 sm:h-96 w-full bg-[var(--background-secondary)] overflow-hidden">
                <Image
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                  {featuredArticle.category}
                </div>
              </div>

              <div className="md:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[var(--foreground-tertiary)] mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readingTime}
                    </span>
                    <span>•</span>
                    <span>{featuredArticle.publishedAt}</span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black tracking-tight group-hover:text-[var(--brand-pink)] transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="mt-3.5 text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--border-color)]/60 flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-stone-300 relative overflow-hidden">
                      <Image
                        src={featuredArticle.author.avatarUrl}
                        alt={featuredArticle.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold">{featuredArticle.author.name}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-pink)] group-hover:translate-x-1 transition-transform">
                    <span>Leer guía</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        )}

        {/* Section Heading: Latest Articles */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--border-color)]">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Últimas Guías Editoriales</h2>
          <span className="text-xs text-[var(--foreground-secondary)]">{otherArticles.length} publicaciones</span>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {otherArticles.map((article) => (
            <article
              key={article.slug}
              className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden shadow-sm hover:border-[var(--brand-pink)]/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <Link href={`/trends/${article.slug}`} className="flex flex-col h-full">
                <div className="relative h-56 sm:h-64 w-full bg-[var(--background-secondary)] overflow-hidden">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    {article.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 text-xs text-[var(--foreground-tertiary)] mb-2.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readingTime}
                      </span>
                      <span>•</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold tracking-tight group-hover:text-[var(--brand-pink)] transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-color)]/60 flex items-center justify-between mt-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-[var(--background)] text-[10px] font-medium text-[var(--foreground-tertiary)] border border-[var(--border-color)]/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-pink)] group-hover:translate-x-1 transition-transform">
                      <span>Leer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* AdSense Placement Area (Safe, Public Publisher Page) */}
        <section className="my-14 p-6 sm:p-8 rounded-3xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] text-center">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--foreground-tertiary)] mb-3">
            Publicidad de Proveedores Verificados · Google AdSense
          </p>
          <div className="min-h-[100px] flex items-center justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-4628313000953034"
              data-ad-slot="default"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </section>

        {/* Klozet Call to Action */}
        <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-transparent border border-[var(--brand-pink)]/20 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            ¿Quieres digitalizar tu ropa y aplicar estas guías?
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[var(--foreground-secondary)] max-w-xl mx-auto leading-relaxed">
            Regístrate gratis en Klozet para eliminar fondos de tus prendas, recibir recomendaciones diarias de nuestra estilista IA Kloe y guardar tus combinaciones favoritas.
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--brand-pink)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-all"
          >
            <span>Crear mi armario digital gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Unified Public Footer */}
      <PublicFooter />
    </div>
  );
}
