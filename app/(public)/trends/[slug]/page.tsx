import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ArrowRight, Bookmark, ArrowLeft } from 'lucide-react';
import { ARTICLES_DATA } from '@/lib/trends/articlesData';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES_DATA.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Guía no encontrada | Klozet',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';

  return {
    title: `${article.title} | Klozet`,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical: `/trends/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl}/trends/${article.slug}`,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = ARTICLES_DATA.filter((a) => a.slug !== slug).slice(0, 3);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/trends/${article.slug}`,
    },
    headline: article.title,
    description: article.excerpt,
    image: [`${siteUrl}${article.coverImage}`],
    datePublished: `${article.publishedAt}T09:00:00+02:00`,
    dateModified: `${article.publishedAt}T09:00:00+02:00`,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `${siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Klozet',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/klozet-logo-dark.png`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111113] text-zinc-950 dark:text-zinc-50 antialiased selection:bg-[var(--brand-pink,#FF66C4)] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Back Link & Category */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/trends"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a todas las guías</span>
          </Link>

          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {article.category}
          </span>
        </div>

        {/* Clean Sentence-Case Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
          {article.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {article.excerpt}
        </p>

        {/* Byline & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 my-7 py-4 border-y border-zinc-200/80 dark:border-zinc-800/80">
          <Link href="/about" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08]">
              <Image
                src={article.author.avatarUrl}
                alt={article.author.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink-dark,#ED4C9E)] transition-colors">
                {article.author.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{article.author.role}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
          </div>
        </div>

        {/* Cover Photograph */}
        <div className="relative w-full aspect-[16/10] rounded-[24px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08] mb-10">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>

        {/* Lead Paragraph (Clean Inter, no serif drop-cap) */}
        <p className="text-base sm:text-[18px] leading-relaxed font-medium text-zinc-800 dark:text-zinc-200 mb-10">
          {article.content.intro}
        </p>

        {/* Auto-Anuncio Interno In-Article: Habla con Kloe */}
        <div className="my-10 p-5 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/90 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative w-20 h-12 shrink-0">
              <Image
                src="/kloe-logo-large.png"
                alt="Kloe"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                ¿Quieres aplicar esta guía a tu propia ropa?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed max-w-md">
                Pregúntale a Kloe qué ponerte hoy: combina tus prendas reales según tu estilo y el clima en segundos.
              </p>
            </div>
          </div>
          <Link
            href="/closet/kloe"
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[var(--brand-pink,#FF66C4)] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all active:scale-95"
          >
            <span>Hablar con Kloe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Article Sections */}
        <div className="space-y-10 sm:space-y-12">
          {article.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {section.heading}
              </h2>

              {section.body.map((para, pIdx) => (
                <p key={pIdx} className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {para}
                </p>
              ))}

              {section.quote && (
                <blockquote className="my-6 pl-5 border-l-2 border-[var(--brand-pink,#FF66C4)] text-base font-medium text-zinc-900 dark:text-zinc-100 py-1">
                  {section.quote}
                </blockquote>
              )}

              {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                <div className="my-6 p-5 sm:p-6 rounded-[20px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-950 dark:text-white mb-3 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-[var(--brand-pink,#FF66C4)]" />
                    <span>Resumen práctico</span>
                  </p>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {section.keyTakeaways.map((item, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink,#FF66C4)] mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Conclusion */}
        <div className="mt-12 p-6 sm:p-8 rounded-[24px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800">
          <h3 className="text-base sm:text-lg font-bold mb-2 tracking-tight text-zinc-950 dark:text-white">
            En resumen
          </h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {article.content.conclusion}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-2 flex-wrap">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Guides */}
        <section className="mt-16 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <h3 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white mb-6">
            Seguir leyendo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/trends/${rel.slug}`}
                className="group rounded-[20px] bg-zinc-50 dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="relative h-32 w-full bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={rel.coverImage}
                    alt={rel.title}
                    fill
                    sizes="260px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <h4 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 text-zinc-950 dark:text-white group-hover:text-[var(--brand-pink-dark,#ED4C9E)] transition-colors">
                    {rel.title}
                  </h4>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2.5 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {rel.readingTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>

      <PublicFooter />
    </div>
  );
}
