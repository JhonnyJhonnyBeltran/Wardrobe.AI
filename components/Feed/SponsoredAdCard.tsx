'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FashionSponsor {
  brand: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  targetUrl: string;
  tag: string;
}

const CURATED_SPONSORS: FashionSponsor[] = [
  {
    brand: 'Zalando Trends',
    title: 'Drop Streetwear & Sneakers SS26',
    description: 'Encuentra las mejores siluetas oversized y zapatillas exclusivas de la temporada.',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Ver colección',
    targetUrl: 'https://www.zalando.es',
    tag: 'Patrocinado'
  },
  {
    brand: 'ASOS Design',
    title: 'Edición Siluetas Boxy & Minimal',
    description: 'Básicos premium en algodón pesado con el fit perfecto para combinar con tu armario.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Explorar looks',
    targetUrl: 'https://www.asos.com',
    tag: 'Promocionado'
  },
  {
    brand: 'Farfetch Curated',
    title: 'Piezas de Autor & Calzado Urbano',
    description: 'Descubre las colaboraciones y prendas más buscadas de marcas internacionales.',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Descubrir',
    targetUrl: 'https://www.farfetch.com',
    tag: 'Patrocinado'
  },
  {
    brand: 'COS Archive',
    title: 'Elegancia Contemporánea & Estructuras',
    description: 'Prendas atemporales para elevar cualquier combinación de tu armario.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Ver prendas',
    targetUrl: 'https://www.cos.com',
    tag: 'Promocionado'
  }
];

interface SponsoredAdCardProps {
  index?: number;
  adSlotId?: string;
  className?: string;
}

export default function SponsoredAdCard({
  index = 0,
  adSlotId,
  className = ''
}: SponsoredAdCardProps) {
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const [googleAdLoaded, setGoogleAdLoaded] = useState(false);
  const googleAdsClient = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID;

  useEffect(() => {
    // Select deterministic sponsor based on index to prevent layout shift
    setSponsorIndex(index % CURATED_SPONSORS.length);

    // If Google AdSense / Google Ad Manager script is available
    if (googleAdsClient && adSlotId && typeof window !== 'undefined') {
      try {
        const win = window as any;
        (win.adsbygoogle = win.adsbygoogle || []).push({});
        setGoogleAdLoaded(true);
      } catch (e) {
        console.warn('[GoogleAdManager] Ad unit fallback to native fashion partner:', e);
      }
    }
  }, [index, adSlotId, googleAdsClient]);

  const sponsor = CURATED_SPONSORS[sponsorIndex] || CURATED_SPONSORS[0];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.open(sponsor.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`w-full h-full relative z-10 apple-tap-feedback ${className}`}
      onClick={handleClick}
    >
      <div className="group relative rounded-[22px] overflow-hidden bg-[var(--card-bg)] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] border border-black/[0.04] dark:border-white/[0.06] transition-all duration-300 cursor-pointer h-full w-full min-h-[300px]">
        {/* Google Ad Unit Container if configured */}
        {googleAdLoaded && adSlotId ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '100%' }}
              data-ad-client={googleAdsClient}
              data-ad-slot={adSlotId}
              data-ad-format="fluid"
              data-ad-layout-key="-fb+5w+4e-db+86"
            />
          </div>
        ) : (
          /* Native Fashion Sponsor Card (Aesthetic High-Conversion Affiliate Unit) */
          <div className="relative w-full h-full flex flex-col">
            {/* Image */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-900">
              <Image
                src={sponsor.imageUrl}
                alt={sponsor.title}
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

              {/* Sponsored Pill Badge */}
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-[var(--brand-pink)]" />
                <span className="text-[10px] font-semibold text-white tracking-wide uppercase">
                  {sponsor.tag}
                </span>
              </div>

              {/* Brand Tag Top Right */}
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25 flex items-center gap-1 shadow-sm">
                <span className="text-[10px] font-medium text-white">
                  {sponsor.brand}
                </span>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                    {sponsor.title}
                  </h4>
                  <p className="text-[11px] text-white/80 line-clamp-2 mt-0.5 leading-snug drop-shadow">
                    {sponsor.description}
                  </p>
                </div>

                {/* Interactive CTA Pill */}
                <div className="mt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-black hover:bg-white text-xs font-semibold shadow-md transition-all group-hover:bg-[var(--brand-pink)] group-hover:text-white">
                    <span>{sponsor.ctaText}</span>
                    <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
