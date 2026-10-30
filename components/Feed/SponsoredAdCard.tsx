'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';

interface KloeSelfAdVariant {
  id: string;
  tag: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  maleImage: string;
  femaleImage: string;
}

const KLOE_PROMO_VARIANTS: KloeSelfAdVariant[] = [
  {
    id: 'kloe-morning-fit',
    tag: 'Estilista Kloe',
    headline: '¿No sabes qué ponerte hoy?',
    subtext: 'Habla con Kloe y te monta el outfit en segundos usando tu propia ropa.',
    ctaLabel: 'Hablar con Kloe',
    maleImage: '/styles/men/streetwear.jpg',
    femaleImage: '/styles/women/streetwear.jpg',
  },
  {
    id: 'kloe-recreate-post',
    tag: 'Truco Kloe',
    headline: '¿Te flipa un look del feed?',
    subtext: 'Pásaselo a Kloe para que te explique cada prenda y lo recree con tu armario.',
    ctaLabel: 'Probar con Kloe',
    maleImage: '/styles/men/clean-look.jpg',
    femaleImage: '/styles/women/clean-look.jpg',
  },
  {
    id: 'kloe-save-time',
    tag: 'Tu Armario + Kloe',
    headline: 'Ahorra 91 horas al año frente al espejo',
    subtext: 'Dile a Kloe qué plan tienes hoy y qué tiempo hace: sal de casa con el fit clavado.',
    ctaLabel: 'Preguntar a Kloe',
    maleImage: '/styles/men/casual-moderno.jpg',
    femaleImage: '/styles/women/minimalista.jpg',
  },
  {
    id: 'kloe-night-out',
    tag: 'Asesoría 24/7',
    headline: '¿Cena, uni o plan de última hora?',
    subtext: 'Tu estilista personal analiza los colores y cortes que mejor te sientan.',
    ctaLabel: 'Hablar con Kloe',
    maleImage: '/styles/men/old-money.jpg',
    femaleImage: '/styles/women/elegante-clasico.jpg',
  },
];

interface SponsoredAdCardProps {
  index?: number;
  adSlotId?: string;
  className?: string;
}

export default function SponsoredAdCard({
  index = 0,
  className = '',
}: SponsoredAdCardProps) {
  const router = useRouter();
  const { user } = useUser();

  const isFemale = useMemo(() => {
    if (!user?.gender) return false;
    const g = user.gender.toLowerCase();
    return g.includes('fem') || g.includes('muj') || g.includes('chic');
  }, [user?.gender]);

  const variant = useMemo(() => {
    return KLOE_PROMO_VARIANTS[index % KLOE_PROMO_VARIANTS.length] || KLOE_PROMO_VARIANTS[0];
  }, [index]);

  const imageUrl = isFemale ? variant.femaleImage : variant.maleImage;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(user ? '/closet/kloe' : '/auth');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`w-full relative z-10 apple-tap-feedback ${className}`}
      onClick={handleClick}
    >
      <div className="group relative rounded-[22px] overflow-hidden bg-[var(--card-bg)] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-4px_rgba(255,102,196,0.18)] border border-[var(--brand-pink,#FF66C4)]/30 transition-all duration-300 cursor-pointer w-full">
        <div className="relative w-full aspect-[4/5] overflow-hidden pointer-events-none bg-[var(--background-secondary)]">
          {/* Editorial Fashion Background */}
          <Image
            src={imageUrl}
            alt={variant.headline}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
            className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-500"
          />

          {/* Readability Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />

          {/* Top Bar: Official Kloe Logo + Tag Pill */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink,#FF66C4)]" />
              <span className="text-[10px] font-bold text-zinc-950 dark:text-zinc-100 tracking-tight">
                {variant.tag}
              </span>
            </div>

            <div className="relative w-12 h-7 sm:w-14 sm:h-8 drop-shadow-md">
              <Image
                src="/kloe-logo-large.png"
                alt="Kloe"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Bottom Content & CTA Pill */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-2">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug tracking-tight drop-shadow-xs">
                {variant.headline}
              </h3>
              <p className="text-[10px] sm:text-xs text-white/85 font-normal leading-relaxed line-clamp-2">
                {variant.subtext}
              </p>
            </div>

            <div className="w-full py-2 px-3 rounded-full bg-[var(--brand-pink,#FF66C4)] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
              <MessageCircle className="w-3.5 h-3.5 text-white stroke-[2.2]" />
              <span>{variant.ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
