'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Instagram, 
  Check, 
  Layers,
  Camera,
  Smartphone,
  Square
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { hapticLight, hapticSuccess } from '@/lib/utils/haptic';

export interface ExportItem {
  id: string;
  name: string;
  imageUrl: string;
  brand?: string | null;
  category?: string;
}

export interface ExportStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items?: ExportItem[];
  coverImageUrl?: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatarUrl?: string;
  occasion?: string;
  season?: string;
}

type AspectRatio = 'story' | 'feed'; // story = 9:16, feed = 4:5
type ColorTheme = 'ivory' | 'noir' | 'rose';

export default function ExportStoryModal({
  isOpen,
  onClose,
  title,
  items = [],
  coverImageUrl,
  authorName = 'Klozet Creator',
  authorHandle = 'klozet',
  authorAvatarUrl,
  occasion,
  season,
}: ExportStoryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('story');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ivory');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cleanHandle = authorHandle.replace(/^@/, '');

  // Theme styling configurations
  const themeStyles = {
    ivory: {
      bg: 'bg-[#F9F7F3]',
      textPrimary: 'text-[#1C1917]',
      textSecondary: 'text-[#78716C]',
      cardBg: 'bg-white/85',
      border: 'border-[#E7E5E4]',
      badge: 'bg-[#E7E5E4]/80 text-[#44403C]',
      accent: 'text-[#D946EF]',
      watermarkBg: 'bg-stone-900 text-stone-100',
    },
    noir: {
      bg: 'bg-[#0F0F12]',
      textPrimary: 'text-[#F5F5F7]',
      textSecondary: 'text-[#A1A1A6]',
      cardBg: 'bg-white/[0.06]',
      border: 'border-white/10',
      badge: 'bg-white/10 text-[#E5E5EA]',
      accent: 'text-[#F472B6]',
      watermarkBg: 'bg-white text-stone-900',
    },
    rose: {
      bg: 'bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6]',
      textPrimary: 'text-[#4C0519]',
      textSecondary: 'text-[#9F1239]',
      cardBg: 'bg-white/90',
      border: 'border-pink-200/80',
      badge: 'bg-pink-100 text-[#BE123C]',
      accent: 'text-[#BE123C]',
      watermarkBg: 'bg-[#881337] text-white',
    },
  }[colorTheme];

  const handleExport = useCallback(async (shareDirectly: boolean = false) => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    hapticLight();

    try {
      // 1. Capture the exact node at retina scale (scale: 2)
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
      });

      // 2. Convert to Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      );

      if (!blob) throw new Error('No se pudo generar la imagen');

      const fileName = `klozet-${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'outfit'}-${aspectRatio}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // 3. Try Native Web Share API if requested and supported (iOS/Android Instagram Stories)
      if (
        shareDirectly &&
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `${title} · Klozet`,
            text: `Mira este look curado en Klozet (@${cleanHandle}): ${title}`,
          });
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
          return;
        } catch (shareErr: any) {
          // If user cancelled, don't show error; if failed, fall back to download
          if (shareErr.name === 'AbortError') return;
        }
      }

      // 4. Download Fallback
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('[ExportStoryModal] Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [cleanHandle, isExporting, title, aspectRatio]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        {/* Backdrop dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-lg bg-[var(--card-bg)] text-[var(--foreground)] rounded-3xl border border-[var(--border-color)]/70 shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold leading-tight">Exportar para Instagram</h3>
                <p className="text-[11px] text-[var(--foreground-secondary)]">Stories 9:16 y Feed 4:5 en alta definición</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-200/50 dark:bg-white/10 flex items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Bar: Format + Colors */}
          <div className="px-5 py-3 bg-[var(--background)]/60 border-b border-[var(--border-color)]/40 flex items-center justify-between gap-3 text-xs">
            {/* Format Selector */}
            <div className="flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-color)]">
              <button
                onClick={() => { setAspectRatio('story'); hapticLight(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  aspectRatio === 'story'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Story (9:16)</span>
              </button>
              <button
                onClick={() => { setAspectRatio('feed'); hapticLight(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  aspectRatio === 'feed'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Feed (4:5)</span>
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setColorTheme('ivory')}
                className={`w-6 h-6 rounded-full bg-[#F9F7F3] border-2 transition-transform ${
                  colorTheme === 'ivory' ? 'border-[var(--brand-pink)] scale-110' : 'border-stone-300'
                }`}
                title="Marfil Editorial"
              />
              <button
                onClick={() => setColorTheme('noir')}
                className={`w-6 h-6 rounded-full bg-[#0F0F12] border-2 transition-transform ${
                  colorTheme === 'noir' ? 'border-[var(--brand-pink)] scale-110' : 'border-stone-600'
                }`}
                title="Obsidian Noir"
              />
              <button
                onClick={() => setColorTheme('rose')}
                className={`w-6 h-6 rounded-full bg-[#FFE4E6] border-2 transition-transform ${
                  colorTheme === 'rose' ? 'border-[var(--brand-pink)] scale-110' : 'border-pink-300'
                }`}
                title="Rose Quartz"
              />
            </div>
          </div>

          {/* Visual Preview Container */}
          <div className="p-4 sm:p-6 flex items-center justify-center bg-[var(--background)]/40 overflow-y-auto max-h-[55vh]">
            {/* The Exportable Canvas Card */}
            <div
              ref={cardRef}
              className={`relative ${themeStyles.bg} rounded-3xl p-5 sm:p-7 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 select-none ${
                aspectRatio === 'story'
                  ? 'w-[290px] sm:w-[320px] aspect-[9/16]'
                  : 'w-[290px] sm:w-[340px] aspect-[4/5]'
              }`}
            >
              {/* Top Bar: Brand & Handle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden bg-stone-300 flex-shrink-0 border border-black/10">
                    {authorAvatarUrl ? (
                      <Image
                        src={authorAvatarUrl}
                        alt={authorName}
                        fill
                        className="object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-pink-400 to-purple-500" />
                    )}
                  </div>
                  <div className="leading-none">
                    <p className={`text-[11px] font-bold ${themeStyles.textPrimary} tracking-tight`}>
                      {authorName}
                    </p>
                    <p className={`text-[9px] ${themeStyles.textSecondary}`}>
                      @{cleanHandle}
                    </p>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase ${themeStyles.badge}`}>
                  Klozet
                </div>
              </div>

              {/* Middle Section: Outfits or Grid of Items */}
              <div className="my-auto py-2 flex flex-col items-center justify-center">
                {coverImageUrl ? (
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-black/5">
                    <Image
                      src={coverImageUrl}
                      alt={title}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : items && items.length > 0 ? (
                  <div className={`grid gap-2 w-full ${items.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {items.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={`relative aspect-square rounded-2xl ${themeStyles.cardBg} border ${themeStyles.border} p-2 flex flex-col items-center justify-center shadow-xs overflow-hidden`}
                      >
                        <div className="relative w-full h-[72%]">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <p className={`text-[9px] font-semibold ${themeStyles.textPrimary} truncate w-full text-center mt-1`}>
                          {item.brand ? `${item.brand} ` : ''}{item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Camera className="w-8 h-8 text-[var(--brand-pink)] mx-auto mb-2 opacity-70" />
                    <p className={`text-xs ${themeStyles.textSecondary}`}>Outfit sin prendas asociadas</p>
                  </div>
                )}

                {/* Title & Occasion */}
                <div className="mt-3 text-center px-1">
                  <h4 className={`text-sm sm:text-base font-black ${themeStyles.textPrimary} tracking-tight line-clamp-1`}>
                    {title}
                  </h4>
                  {(occasion || season) && (
                    <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5 uppercase tracking-widest font-medium`}>
                      {[occasion, season].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Elegant Watermark */}
              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[8px] sm:text-[9px]">
                <div className="flex items-center gap-1 text-[var(--brand-pink)] font-bold">
                  <Camera className="w-3 h-3" />
                  <span className="tracking-widest uppercase">Curated on Klozet</span>
                </div>
                <span className={`${themeStyles.textSecondary} font-mono tracking-wider`}>
                  klozet.es
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-color)]/60 bg-[var(--card-bg)] flex items-center gap-3">
            <button
              onClick={() => handleExport(false)}
              disabled={isExporting}
              className="flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--brand-pink)] text-[var(--foreground)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>¡Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar HD</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleExport(true)}
              disabled={isExporting}
              className="flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-md shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Instagram className="w-4 h-4" />
              <span>{isExporting ? 'Generando...' : 'Compartir en Instagram'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
