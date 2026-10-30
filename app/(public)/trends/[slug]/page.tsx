import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight, Bookmark } from 'lucide-react';
import { ARTICLES_DATA, Article } from '@/lib/trends/articlesData';
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
      title: 'Artículo no encontrado | Klozet Editorial',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klozet.es';

  return {
    title: `${article.title} | Klozet Editorial`,
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

  // Rich JSON-LD Article Schema for Google Search & AdSense compliance
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
      '@type': 'Organization',
      name: article.author.name,
      url: siteUrl,
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--brand-pink)] selection:text-white">
      {/* Schema.org Article Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Unified Public Header */}
      <PublicHeader />

      {/* Article Container */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[var(--foreground-tertiary)]">
          <Link href="/" className="hover:underline">Inicio</Link>
          <span>/</span>
          <Link href="/trends" className="hover:underline">Tendencias</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium truncate max-w-[200px] sm:max-w-none">{article.category}</span>
        </nav>

        {/* Category & Metadata */}
        <div className="flex items-center gap-3 text-xs text-[var(--foreground-tertiary)] mb-4">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] font-bold uppercase tracking-wider text-[11px]">
            {article.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {article.publishedAt}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
          {article.title}
        </h1>

        {/* Subtitle / Excerpt */}
        <p className="mt-4 text-base sm:text-lg text-[var(--foreground-secondary)] leading-relaxed font-serif italic">
          «{article.excerpt}»
        </p>

        {/* Author Card */}
        <div className="flex items-center gap-3 my-6 pb-6 border-b border-[var(--border-color)]/70">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-stone-300 border border-[var(--border-color)]">
            <Image
              src={article.author.avatarUrl}
              alt={article.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-tight">{article.author.name}</p>
            <p className="text-[11px] text-[var(--foreground-tertiary)]">{article.author.role}</p>
          </div>
        </div>

        {/* Main Hero Photograph */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-[var(--background-secondary)] shadow-xl mb-10 border border-[var(--border-color)]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Lead / Intro Paragraph */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-10 text-[var(--foreground)]">
          <p className="text-base sm:text-lg leading-relaxed font-medium">
            <span className="text-4xl float-left font-serif font-black mr-2 leading-none text-[var(--brand-pink)]">
              {article.content.intro.charAt(0)}
            </span>
            {article.content.intro.slice(1)}
          </p>
        </div>

        {/* Article Core Sections */}
        <div className="space-y-10 sm:space-y-12">
          {article.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {section.heading}
              </h2>

              {section.body.map((para, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                  {para}
                </p>
              ))}

              {section.quote && (
                <blockquote className="my-6 pl-4 border-l-4 border-[var(--brand-pink)] italic text-sm sm:text-base text-[var(--foreground)] font-serif bg-[var(--background-secondary)]/40 p-4 rounded-r-2xl">
                  {section.quote}
                </blockquote>
              )}

              {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                <div className="my-5 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-pink)] mb-2.5 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Puntos Clave</span>
                  </p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--foreground-secondary)]">
                    {section.keyTakeaways.map((item, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="text-[var(--brand-pink)] font-bold">•</span>
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
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]">
          <h3 className="text-base sm:text-lg font-bold mb-2 uppercase tracking-tight text-[var(--foreground)]">
            Conclusión Editorial
          </h3>
          <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
            {article.content.conclusion}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]/70 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[var(--foreground-tertiary)] font-semibold">Temas:</span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-[var(--background-secondary)] text-xs font-medium text-[var(--foreground-secondary)] border border-[var(--border-color)]/60"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Articles */}
        <section className="mt-16 pt-10 border-t border-[var(--border-color)]">
          <h3 className="text-xl font-bold tracking-tight mb-6">Otras Lecturas Recomendadas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/trends/${rel.slug}`}
                className="group rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--brand-pink)]/40 transition-all flex flex-col justify-between"
              >
                <div className="relative h-32 w-full bg-[var(--background-secondary)]">
                  <Image
                    src={rel.coverImage}
                    alt={rel.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <h4 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-[var(--brand-pink)] transition-colors">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-[var(--foreground-tertiary)] mt-2 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {rel.readingTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>

      {/* Unified Public Footer */}
      <PublicFooter />
    </div>
  );
}
