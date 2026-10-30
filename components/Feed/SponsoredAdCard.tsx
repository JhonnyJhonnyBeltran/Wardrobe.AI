'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/store/userStore';

interface KloeSelfAdVariant {
  id: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  primaryImage: string;
  primaryAlt: string;
  secondaryImage: string;
  secondaryAlt: string;
}

const KLOE_PROMO_VARIANTS: KloeSelfAdVariant[] = [
  {
    id: 'kloe-morning-fit-1',
    headline: '¿No sabes qué ponerte hoy?',
    subtext: 'Chatea con Kloe y te monta el outfit en segundos usando tu propia ropa.',
    ctaLabel: 'Chatea con Kloe',
    primaryImage: '/landing/outfits/mujer-halter-alaia.jpg',
    primaryAlt: 'Outfit Mujer Halter & Alaïa',
    secondaryImage: '/landing/outfits/hombre-militar-margiela.png',
    secondaryAlt: 'Outfit Hombre Militar & Margiela',
  },
  {
    id: 'kloe-recreate-post-2',
    headline: '¿Te flipa un look del feed?',
    subtext: 'Pásaselo a Kloe para que analice cada prenda y lo recree con tu armario.',
    ctaLabel: 'Chatea con Kloe',
    primaryImage: '/landing/outfits/hombre-cpcompany-cartier.png',
    primaryAlt: 'Outfit Hombre C.P. Company & Cartier',
    secondaryImage: '/landing/outfits/mujer-black-cartier-chanel.png',
    secondaryAlt: 'Outfit Mujer Cartier & Chanel',
  },
  {
    id: 'kloe-save-time-3',
    headline: 'Sal de casa con el fit clavado',
    subtext: 'Dile a Kloe qué plan tienes hoy y qué tiempo hace para combinar tus prendas.',
    ctaLabel: 'Chatea con Kloe',
    primaryImage: '/landing/outfits/mujer-rayas-miumiu-byredo.jpg',
    primaryAlt: 'Outfit Mujer Rayas & Miu Miu',
    secondaryImage: '/landing/outfits/hombre-jersey-rayas-samba.jpg',
    secondaryAlt: 'Outfit Hombre Punto Rayas & Samba',
  },
  {
    id: 'kloe-night-out-4',
    headline: '¿Cena, uni o plan de última hora?',
    subtext: 'Tu estilista personal combina los colores y cortes que mejor te sientan.',
    ctaLabel: 'Chatea con Kloe',
    primaryImage: '/landing/outfits/hombre-militar-margiela.png',
    primaryAlt: 'Outfit Hombre Militar & Margiela',
    secondaryImage: '/landing/outfits/mujer-halter-alaia.jpg',
    secondaryAlt: 'Outfit Mujer Halter & Alaïa',
  },
  {
    id: 'kloe-capsule-5',
    headline: 'Sácale partido a todo tu armario',
    subtext: 'Descubre combinaciones nuevas con la ropa que ya tienes colgada en casa.',
    ctaLabel: 'Chatea con Kloe',
    primaryImage: '/landing/outfits/mujer-black-cartier-chanel.png',
    primaryAlt: 'Outfit Mujer Cartier & Chanel',
    secondaryImage: '/landing/outfits/hombre-cpcompany-cartier.png',
    secondaryAlt: 'Outfit Hombre C.P. Company & Cartier',
  },
  {
    id: 'kloe-daily-6',
    headline: 'Tu lookbook listo cada mañana',
    subtext: 'Pregunta a Kloe y olvídate de probarte cinco cosas antes de salir.',
    ctaLabel: 'Chatea con Kloe',
    primaryImage: '/landing/outfits/hombre-jersey-rayas-samba.jpg',
    primaryAlt: 'Outfit Hombre Punto Rayas & Samba',
    secondaryImage: '/landing/outfits/mujer-rayas-miumiu-byredo.jpg',
    secondaryAlt: 'Outfit Mujer Rayas & Miu Miu',
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

  const variant = useMemo(() => {
    return KLOE_PROMO_VARIANTS[index % KLOE_PROMO_VARIANTS.length] || KLOE_PROMO_VARIANTS[0];
  }, [index]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(user ? '/closet/kloe' : '/auth');
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`w-full relative z-10 apple-tap-feedback ${className}`}
      onClick={handleClick}
    >
      <div className="group relative rounded-[24px] overflow-hidden bg-white dark:bg-[#141416] shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_34px_-6px_rgba(255,102,196,0.22)] border border-zinc-200/80 dark:border-zinc-800 transition-all duration-300 cursor-pointer w-full flex flex-col">
        {/* Top Lookbook Canvas Area (Clean White Studio Canvas for Flat-Lay Pieces) */}
        <div className="relative w-full aspect-[4/4.3] overflow-hidden bg-white p-3 sm:p-4 flex items-center justify-center">
          {/* Official Kloe Logo Top-Left (No 24/7 Pill) */}
          <div className="absolute top-2.5 left-3 z-20 w-12 h-6 sm:w-14 sm:h-7 pointer-events-none">
            <Image
              src="/kloe-logo-large.png"
              alt="Kloe"
              fill
              className="object-contain object-left drop-shadow-xs"
            />
          </div>

          {/* Primary Flat-Lay Outfit */}
          <div className="relative w-[78%] h-[92%] -translate-x-3 transition-transform duration-500 group-hover:scale-[1.03]">
            <Image
              src={variant.primaryImage}
              alt={variant.primaryAlt}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 28vw"
              quality={90}
              className="object-contain"
            />
          </div>

          {/* Secondary Paired Gender Flat-Lay Card (Floating Lookbook Preview) */}
          <div className="absolute bottom-2.5 right-2.5 z-20 w-[38%] aspect-[3/4] rounded-2xl bg-white border border-zinc-200/90 shadow-[0_8px_20px_rgba(0,0,0,0.12)] p-1.5 rotate-3 group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
            <div className="relative w-full h-full">
              <Image
                src={variant.secondaryImage}
                alt={variant.secondaryAlt}
                fill
                sizes="(max-width: 640px) 22vw, 15vw"
                quality={85}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Clean Editorial Footer Dock */}
        <div className="px-3.5 py-3 bg-zinc-50/90 dark:bg-[#141416] border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-2.5">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-[13px] font-bold text-zinc-950 dark:text-zinc-50 leading-snug tracking-tight">
              {variant.headline}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed line-clamp-2">
              {variant.subtext}
            </p>
          </div>

          <div className="w-full py-2 px-3 rounded-full bg-[var(--brand-pink,#FF66C4)] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs group-hover:opacity-95 transition-opacity">
            <MessageCircle className="w-3.5 h-3.5 text-white stroke-[2.2]" />
            <span>{variant.ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
