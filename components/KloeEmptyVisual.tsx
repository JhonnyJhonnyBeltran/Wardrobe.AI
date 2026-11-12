'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Bookmark, Compass, Heart } from 'lucide-react';
import KloeMascot from './KloeMascot';

export type KloeEmptyVariant = 'garment' | 'outfit' | 'post' | 'saved' | 'notifications' | 'not-found';

interface KloeEmptyVisualProps {
  variant: KloeEmptyVariant;
}

const CARD_SHELL =
  'rounded-[20px] bg-white border border-black/[0.06] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.16)] rotate-[3deg]';

/**
 * Shared Kloe empty-state illustration matching Closet, Feed, Notifications, and Profile.
 * Keeps mascot + visual sample card/animated bell in a single reusable unit without circle wrappers around icons.
 */
export default function KloeEmptyVisual({ variant }: KloeEmptyVisualProps) {
  if (variant === 'notifications') {
    return (
      <div className="flex items-center justify-center gap-4">
        <KloeMascot
          mood="curious"
          size="xl"
          variant="pink"
          interactive
          className="drop-shadow-[0_8px_18px_rgba(255,102,196,0.34)] -rotate-[4deg]"
        />
        <motion.div
          animate={{ rotate: [0, -16, 16, -10, 10, -4, 0], y: [0, -2, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="relative flex items-center justify-center p-2"
          aria-hidden="true"
        >
          <Bell
            className="w-11 h-11 text-[var(--brand-pink,#FF66C4)] drop-shadow-[0_8px_18px_rgba(255,102,196,0.35)]"
            strokeWidth={2}
          />
          <motion.span
            animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-[var(--foreground)] ring-2 ring-[var(--background)]"
          />
        </motion.div>
      </div>
    );
  }

  const mood = variant === 'garment' || variant === 'saved' ? 'curious' : 'happy';

  return (
    <div className="flex items-center justify-center gap-4">
      <KloeMascot
        mood={mood}
        size="xl"
        variant="pink"
        interactive
        className="drop-shadow-[0_8px_18px_rgba(255,102,196,0.34)] -rotate-[4deg]"
      />

      {variant === 'garment' && (
        <div className={`w-28 p-2.5 ${CARD_SHELL}`}>
          <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-[12px] bg-zinc-50">
            <img
              src="/landing/piezas/jersey-rayas-hombre.png"
              alt="Prenda ejemplo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="w-full pt-1.5 mt-1 border-t border-black/[0.05] text-left">
            <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">
              Jersey rayas
            </p>
            <p className="text-[10px] font-medium text-zinc-500 truncate">
              Ejemplo
            </p>
          </div>
        </div>
      )}

      {variant === 'outfit' && (
        <div className={`w-32 p-2.5 ${CARD_SHELL}`}>
          <div className="w-full aspect-[4/5] relative flex flex-col items-center justify-between py-1">
            <img
              src="/landing/piezas/chaqueta-militar.png"
              alt="Chaqueta ejemplo"
              className="w-16 h-12 object-contain"
            />
            <div className="flex items-center justify-center gap-1 -mt-1">
              <img
                src="/landing/piezas/jeans-wide-mujer.png"
                alt="Jeans ejemplo"
                className="w-14 h-16 object-contain"
              />
              <img
                src="/landing/piezas/bolso-ante-beige.png"
                alt="Bolso ejemplo"
                className="w-9 h-9 object-contain -ml-2"
              />
            </div>
            <img
              src="/landing/piezas/zapatillas-margiela.png"
              alt="Zapatillas ejemplo"
              className="w-14 h-9 object-contain -mt-1"
            />
          </div>
          <div className="w-full pt-1 mt-1 border-t border-black/[0.05] text-left">
            <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">
              Look diario
            </p>
            <p className="text-[10px] font-medium text-zinc-500 truncate">
              Ejemplo · 4 prendas
            </p>
          </div>
        </div>
      )}

      {(variant === 'post' || variant === 'saved') && (
        <div className={`w-28 p-2 ${CARD_SHELL}`}>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-semibold text-zinc-800 truncate">
              {variant === 'post' ? '@klozet' : 'Guardado'}
            </span>
            {variant === 'post' ? (
              <Heart className="w-3 h-3 text-[#FF66C4] fill-[#FF66C4] shrink-0" />
            ) : (
              <Bookmark className="w-3 h-3 text-[#FF66C4] fill-[#FF66C4] shrink-0" />
            )}
          </div>
          <div className="w-full aspect-[3/4] rounded-[13px] overflow-hidden bg-zinc-100">
            <img
              src={variant === 'post' ? '/landing/outfits/outfit-rayas-miumiu.jpg' : '/landing/outfits/chica-brown-top-jeans.jpg'}
              alt={variant === 'post' ? 'Post ejemplo' : 'Look guardado ejemplo'}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[10px] font-medium text-zinc-500 truncate mt-1.5 text-left px-0.5">
            {variant === 'post' ? 'Look de hoy' : 'Ejemplo'}
          </p>
        </div>
      )}

      {variant === 'not-found' && (
        <div className={`w-28 p-2.5 ${CARD_SHELL}`}>
          <div className="w-full aspect-square rounded-[13px] bg-zinc-50 flex flex-col items-center justify-center gap-1.5">
            <Compass className="w-7 h-7 text-[#FF66C4]" strokeWidth={2} />
            <span className="font-display text-lg font-bold tracking-tight text-zinc-900 leading-none">
              404
            </span>
          </div>
          <div className="w-full pt-1.5 mt-1 border-t border-black/[0.05] text-left">
            <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">
              Ruta perdida
            </p>
            <p className="text-[10px] font-medium text-zinc-500 truncate">
              Klozet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
