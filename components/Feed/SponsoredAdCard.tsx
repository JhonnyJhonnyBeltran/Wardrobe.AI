'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';

interface FashionSponsor {
  id: string;
  brand: string;
  styles: string[];
  maleImage: string;
  femaleImage: string;
  targetUrl: string;
}

const FASHION_SPONSORS: FashionSponsor[] = [
  {
    id: 'scuffers',
    brand: 'Scuffers',
    styles: ['streetwear', 'casual-moderno', 'skater-surf', 'clean-look'],
    maleImage: '/styles/men/streetwear.jpg',
    femaleImage: '/styles/women/streetwear.jpg',
    targetUrl: 'https://scuffers.com',
  },
  {
    id: 'nude-project',
    brand: 'Nude Project',
    styles: ['streetwear', 'y2k', 'skater-surf', 'casual-moderno'],
    maleImage: '/styles/men/streetwear.jpg',
    femaleImage: '/styles/women/y2k.jpg',
    targetUrl: 'https://nude-project.com',
  },
  {
    id: 'stussy',
    brand: 'Stüssy',
    styles: ['streetwear', 'skater-surf', 'workwear-americana', 'vintage-retro'],
    maleImage: '/styles/men/skater-surf.jpg',
    femaleImage: '/styles/women/skater-surf.jpg',
    targetUrl: 'https://www.stussy.com',
  },
  {
    id: 'nike',
    brand: 'Nike',
    styles: ['deportivo-athleisure', 'streetwear', 'gorpcore-outdoor'],
    maleImage: '/styles/men/deportivo-athleisure.jpg',
    femaleImage: '/styles/women/deportivo-athleisure.jpg',
    targetUrl: 'https://www.nike.com/es',
  },
  {
    id: 'cos',
    brand: 'COS',
    styles: ['clean-look', 'minimalista', 'smart-casual', 'business-casual'],
    maleImage: '/styles/men/clean-look.jpg',
    femaleImage: '/styles/women/clean-look.jpg',
    targetUrl: 'https://www.cos.com',
  },
  {
    id: 'zara',
    brand: 'Zara',
    styles: ['old-money', 'elegante-clasico', 'chic-parisino', 'casual-moderno'],
    maleImage: '/styles/men/old-money.jpg',
    femaleImage: '/styles/women/chic-parisino.jpg',
    targetUrl: 'https://www.zara.com/es',
  },
  {
    id: 'carhartt',
    brand: 'Carhartt WIP',
    styles: ['workwear-americana', 'skater-surf', 'gorpcore-outdoor', 'streetwear'],
    maleImage: '/styles/men/workwear-americana.jpg',
    femaleImage: '/styles/women/workwear-americana.jpg',
    targetUrl: 'https://www.carhartt-wip.com/es',
  },
  {
    id: 'diesel',
    brand: 'Diesel',
    styles: ['y2k', 'rock-grunge', 'vintage-retro', 'gotico-alt'],
    maleImage: '/styles/men/rock-grunge.jpg',
    femaleImage: '/styles/women/y2k.jpg',
    targetUrl: 'https://global.diesel.com',
  },
  {
    id: 'salomon',
    brand: 'Salomon',
    styles: ['gorpcore-outdoor', 'techwear', 'deportivo-athleisure'],
    maleImage: '/styles/men/gorpcore-outdoor.jpg',
    femaleImage: '/styles/women/gorpcore-outdoor.jpg',
    targetUrl: 'https://www.salomon.com/es-es',
  },
  {
    id: 'zalando',
    brand: 'Zalando',
    styles: ['casual-moderno', 'minimalista', 'clean-look', 'smart-casual'],
    maleImage: '/styles/men/minimalista.jpg',
    femaleImage: '/styles/women/minimalista.jpg',
    targetUrl: 'https://www.zalando.es',
  },
  {
    id: 'massimo-dutti',
    brand: 'Massimo Dutti',
    styles: ['old-money', 'elegante-clasico', 'business-casual', 'smart-casual'],
    maleImage: '/styles/men/elegante-clasico.jpg',
    femaleImage: '/styles/women/elegante-clasico.jpg',
    targetUrl: 'https://www.massimodutti.com/es',
  },
  {
    id: 'arket',
    brand: 'Arket',
    styles: ['clean-look', 'minimalista', 'normcore', 'casual-moderno'],
    maleImage: '/styles/men/normcore.jpg',
    femaleImage: '/styles/women/normcore.jpg',
    targetUrl: 'https://www.arket.com',
  }
];

interface SponsoredAdCardProps {
  index?: number;
  adSlotId?: string;
  className?: string;
}

export default function SponsoredAdCard({
  index = 0,
  className = ''
}: SponsoredAdCardProps) {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine user gender preference
  const isFemale = useMemo(() => {
    if (!user?.gender) return false;
    const g = user.gender.toLowerCase();
    return g.includes('fem') || g.includes('muj');
  }, [user?.gender]);

  // Select sponsor based on style affinity and index
  const sponsor = useMemo(() => {
    // 1. Gather user's preferred styles
    const preferredStyles: string[] = [];
    if (user?.preferredStyles && Array.isArray(user.preferredStyles)) {
      preferredStyles.push(...user.preferredStyles.map(s => s.toLowerCase()));
    }

    // Also inspect style interests from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const rawInterests = localStorage.getItem('klozet_style_interest');
        if (rawInterests) {
          const parsed = JSON.parse(rawInterests);
          const topInterests = Object.entries(parsed)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 3)
            .map(([style]) => style.toLowerCase());
          preferredStyles.push(...topInterests);
        }
      } catch {}
    }

    // 2. Filter sponsors matching preferred styles
    let matching = FASHION_SPONSORS;
    if (preferredStyles.length > 0) {
      const filtered = FASHION_SPONSORS.filter(s =>
        s.styles.some(style => preferredStyles.includes(style))
      );
      if (filtered.length > 0) {
        matching = filtered;
      }
    }

    // 3. Deterministic pick to avoid hydration layout shifts
    return matching[index % matching.length] || FASHION_SPONSORS[0];
  }, [user?.preferredStyles, index]);

  const imageUrl = isFemale ? sponsor.femaleImage : sponsor.maleImage;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Track ad click for Meta Pixel / custom tracking if enabled
    if (typeof window !== 'undefined') {
      try {
        const win = window as any;
        if (win.fbq) {
          win.fbq('trackCustom', 'SponsoredAdClick', {
            brand: sponsor.brand,
            adId: sponsor.id,
            targetUrl: sponsor.targetUrl,
          });
        }
      } catch {}

      window.open(sponsor.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`w-full h-full relative z-10 apple-tap-feedback ${className}`}
      onClick={handleClick}
    >
      <div className="group relative rounded-[22px] overflow-hidden bg-[var(--card-bg)] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] border border-black/[0.04] dark:border-white/[0.06] transition-all duration-300 cursor-pointer h-full w-full">
        <div className="relative w-full h-full flex flex-col pointer-events-none">
          {/* Fashion Outfit Photograph matching PostCard aspect ratio & resolution */}
          <Image
            src={imageUrl}
            alt={`Look patrocinado de ${sponsor.brand}`}
            width={720}
            height={900}
            quality={90}
            className="w-full h-full object-cover transform-gpu"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Desktop Hover Vignette Gradient Overlay */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Desktop Hover Only: Brand Name, small "anuncio" underneath, and External Link Icon */}
          <div className="absolute bottom-3 left-3 right-3 hidden md:flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white truncate max-w-[130px] drop-shadow-md">
                {sponsor.brand}
              </span>
              <span className="text-[10px] text-white/70 font-medium tracking-wide drop-shadow-sm -mt-0.5">
                anuncio
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-sm group-hover:scale-105 transition-transform">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
