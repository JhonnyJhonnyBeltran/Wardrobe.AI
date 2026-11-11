'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Plus } from 'lucide-react';
import KloeMascot from '@/components/KloeMascot';
import InteractiveOutfitViewer from '@/components/InteractiveOutfitViewer';

export interface IosWidgetPreviewProps {
  size: 'square' | 'wide';
  city: string;
  temp: number | null;
  outfit?: any | null;
  appearance?: 'light' | 'dark';
  interactiveHref?: string;
}

/**
 * Apple HIG / WidgetKit-faithful preview component for Klozet Home Screen Widgets:
 * - Square (2x2 systemSmall) & Wide/Elongated (4x2 systemMedium)
 * - Shows ONLY today's temperature + location alongside the Kloe wordmark
 * - Displays Today's Outfit when planned, or Kloe mascot + "Crea un outfit hoy" when empty
 */
export default function IosWidgetPreview({
  size,
  city,
  temp,
  outfit,
  appearance = 'light',
  interactiveHref,
}: IosWidgetPreviewProps) {
  const isDark = appearance === 'dark';
  const hasOutfit = Boolean(outfit);
  const displayTemp = typeof temp === 'number' ? `${temp}°` : '21°';
  const displayCity = city?.trim() || 'Madrid';
  const targetHref = interactiveHref ?? (hasOutfit ? '/closet?tab=calendar' : '/create');

  const surfaceCls = isDark
    ? 'bg-[#18181B] text-white border-white/10 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)]'
    : 'bg-white text-zinc-950 border-black/[0.06] shadow-[0_14px_34px_-12px_rgba(0,0,0,0.12)]';

  const mutedTextCls = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subPillCls = isDark
    ? 'bg-white/[0.08] border-white/10 text-zinc-200'
    : 'bg-zinc-100/90 border-black/[0.05] text-zinc-700';

  if (size === 'square') {
    const content = (
      <div
        className={`group relative w-[184px] h-[184px] sm:w-[196px] sm:h-[196px] rounded-[28px] border p-3.5 flex flex-col justify-between overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${surfaceCls}`}
      >
        {/* Top Row: Kloe Logo + Temp & Place only */}
        <div className="flex items-start justify-between gap-2 shrink-0">
          <div className="relative w-12 h-6 shrink-0">
            <Image
              src="/kloe-logo-large.png"
              alt="Kloe"
              fill
              className="object-contain object-left"
              sizes="48px"
            />
          </div>

          <div className="flex flex-col items-end min-w-0 leading-none">
            <span className="text-[19px] font-bold tracking-tight tabular-nums leading-none">
              {displayTemp}
            </span>
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium mt-1 truncate max-w-[90px] ${mutedTextCls}`}>
              <MapPin className="w-2.5 h-2.5 text-[var(--brand-pink)] shrink-0" />
              <span className="truncate">{displayCity}</span>
            </span>
          </div>
        </div>

        {/* Bottom Content: Today Outfit OR Kloe Mascot Empty Prompt */}
        {hasOutfit ? (
          <div className="mt-2 flex-1 min-h-0 rounded-[18px] bg-white border border-black/[0.05] overflow-hidden relative flex items-center justify-center">
            <InteractiveOutfitViewer
              outfit={outfit}
              disableInteraction={true}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="mt-1 flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-1.5">
            <KloeMascot mood="happy" size="md" variant="pink" />
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--brand-pink)] text-white text-[10px] font-bold shadow-xs">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
              <span>Crea un outfit hoy</span>
            </div>
          </div>
        )}
      </div>
    );

    return targetHref ? (
      <Link href={targetHref} className="inline-block focus:outline-none">
        {content}
      </Link>
    ) : (
      content
    );
  }

  // Wide / Elongated (4x2 systemMedium)
  const wideContent = (
    <div
      className={`group relative w-full max-w-[388px] h-[184px] sm:h-[196px] rounded-[28px] border p-4 flex items-stretch justify-between gap-4 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${surfaceCls}`}
    >
      {/* Left Info Column: Kloe Logo + Temperature + Location + Context */}
      <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
        <div className="relative w-14 h-7 shrink-0">
          <Image
            src="/kloe-logo-large.png"
            alt="Kloe"
            fill
            className="object-contain object-left"
            sizes="56px"
          />
        </div>

        <div className="space-y-1">
          <div className="text-[36px] font-bold tracking-tight tabular-nums leading-none">
            {displayTemp}
          </div>
          <div className={`inline-flex items-center gap-1 text-xs font-semibold truncate max-w-full ${mutedTextCls}`}>
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-pink)] shrink-0" />
            <span className="truncate">{displayCity}</span>
          </div>
        </div>

        {hasOutfit ? (
          <div className={`inline-flex items-center self-start px-2.5 py-1 rounded-full border text-[11px] font-semibold truncate max-w-full ${subPillCls}`}>
            <span className="truncate">{outfit?.name || 'Outfit de hoy'}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 self-start px-3 py-1.5 rounded-full bg-[var(--brand-pink)] text-white text-[11px] font-bold shadow-xs">
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Crea un outfit hoy</span>
          </div>
        )}
      </div>

      {/* Right Visual Column: Outfit Canvas OR Kloe Mascot */}
      <div className="w-[44%] max-w-[162px] shrink-0 flex items-center justify-center">
        {hasOutfit ? (
          <div className="w-full h-full rounded-[20px] bg-white border border-black/[0.06] overflow-hidden relative flex items-center justify-center">
            <InteractiveOutfitViewer
              outfit={outfit}
              disableInteraction={true}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div
            className={`w-full h-full rounded-[20px] border flex flex-col items-center justify-center gap-1 ${
              isDark
                ? 'bg-[var(--brand-pink)]/12 border-[var(--brand-pink)]/25'
                : 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)]/25'
            }`}
          >
            <KloeMascot mood="excited" size="lg" variant="pink" />
          </div>
        )}
      </div>
    </div>
  );

  return targetHref ? (
    <Link href={targetHref} className="block w-full max-w-[388px] focus:outline-none">
      {wideContent}
    </Link>
  ) : (
    wideContent
  );
}
