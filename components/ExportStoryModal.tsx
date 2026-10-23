'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share, 
  Check, 
  Layers,
  Camera,
  Smartphone,
  Square,
  Link2,
  Maximize2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { hapticLight, hapticSuccess } from '@/lib/utils/haptic';

export interface ExportItem {
  id: string;
  name: string;
  imageUrl: string;
  brand?: string | null;
  category?: string;
  position_x?: number;
  position_y?: number;
  positionX?: number;
  positionY?: number;
  scale?: number;
  rotation?: number;
  zIndex?: number;
  layer_order?: number;
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
  postId?: string;
  postUrl?: string;
  outfit?: any;
  garments?: any[];
  initialMode?: 'photo' | 'outfit';
}

type AspectRatio = 'story' | 'feed' | 'square'; // story = 9:16, feed = 4:5, square = 1:1
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
  postId,
  postUrl,
  outfit,
  garments = [],
  initialMode,
}: ExportStoryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Normalize items & garments for collage
  const outfitItems = useMemo(() => {
    // 1. Gather all potential sources
    let rawList: any[] = [];

    if (outfit?.outfit_items && Array.isArray(outfit.outfit_items) && outfit.outfit_items.length > 0) {
      rawList = outfit.outfit_items;
    } else if (outfit?.items && Array.isArray(outfit.items) && outfit.items.length > 0) {
      rawList = outfit.items;
    } else if (items && items.length > 0) {
      rawList = items;
    } else if (garments && garments.length > 0) {
      rawList = garments;
    }

    if (rawList.length === 0) return [];

    return rawList.map((item: any, i: number) => {
      const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
      const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
      const img = clothing?.imageUrl || clothing?.image_url || clothing?.original_image_url || clothing?.originalImageUrl || item.imageUrl || item.image_url;
      const name = clothing?.name || item.name || 'Prenda';
      const brand = clothing?.brand || item.brand || null;

      let x = item.position_x ?? item.positionX;
      let y = item.position_y ?? item.positionY;

      // If no explicit coordinates, arrange in a balanced editorial collage
      if (x === undefined || x === null) {
        if (rawList.length === 1) {
          x = 50;
          y = 50;
        } else if (rawList.length === 2) {
          x = i === 0 ? 38 : 62;
          y = i === 0 ? 42 : 58;
        } else if (rawList.length === 3) {
          x = i === 0 ? 50 : (i === 1 ? 32 : 68);
          y = i === 0 ? 36 : 64;
        } else {
          // 4+ items grid/spread
          const cols = 2;
          const row = Math.floor(i / cols);
          const col = i % cols;
          x = col === 0 ? 34 : 66;
          y = row === 0 ? 36 : (row === 1 ? 64 : 80);
        }
      }

      return {
        id: clothing?.id || item.id || `item-${i}`,
        img,
        name,
        brand,
        computedX: x,
        computedY: y,
        computedScale: item.scale ?? 1,
        computedRotation: item.rotation ?? 0,
        computedZIndex: item.layer_order ?? item.zIndex ?? item.z_index ?? i,
      };
    }).filter((it: any) => Boolean(it.img));
  }, [outfit, items, garments]);

  const hasPhoto = Boolean(coverImageUrl);
  const hasOutfit = outfitItems.length > 0 || Boolean(outfit?.image_url || outfit?.imageUrl);

  // Tab mode: 'photo' (100% clean user photo, 0 watermarks, 0 Kloe) or 'outfit' (collage with Klozet bubble + K bubble)
  const [exportMode, setExportMode] = useState<'photo' | 'outfit'>(() => {
    if (initialMode) return initialMode;
    if (hasPhoto) return 'photo';
    return 'outfit';
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('story');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ivory');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Compute public share URL
  const resolvedShareUrl = useMemo(() => {
    if (postUrl) return postUrl;
    if (typeof window !== 'undefined') {
      if (postId) return `${window.location.origin}/post/${postId}`;
      return window.location.href;
    }
    return '';
  }, [postId, postUrl]);

  // Clean filename for export
  const cleanBaseName = useMemo(() => {
    return (title || 'klozet-look')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'look';
  }, [title]);

  // Theme configurations for the outfit canvas
  const themeStyles = {
    ivory: {
      bg: 'bg-[#F9F9FB]',
      cardBg: 'bg-white',
      border: 'border-zinc-200/80',
      textPrimary: 'text-zinc-900',
      textSecondary: 'text-zinc-500',
    },
    noir: {
      bg: 'bg-[#0E0E12]',
      cardBg: 'bg-[#18181D]',
      border: 'border-white/10',
      textPrimary: 'text-zinc-100',
      textSecondary: 'text-zinc-400',
    },
    rose: {
      bg: 'bg-[#FFF2F6]',
      cardBg: 'bg-white/95',
      border: 'border-pink-200/70',
      textPrimary: 'text-pink-950',
      textSecondary: 'text-pink-700/80',
    },
  }[colorTheme];

  // 1. Copy Link Action (Strava / Transak style)
  const handleCopyLink = useCallback(async () => {
    try {
      hapticLight();
      if (navigator.clipboard && resolvedShareUrl) {
        await navigator.clipboard.writeText(resolvedShareUrl);
      }
      setIsCopied(true);
      hapticSuccess();
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('[ExportStoryModal] Error copying link:', err);
    }
  }, [resolvedShareUrl]);

  // 2. Download Action (HD Image)
  const handleDownload = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    hapticLight();

    try {
      // If PHOTO mode: Attempt to download direct clean high-res image
      if (exportMode === 'photo' && coverImageUrl) {
        try {
          const res = await fetch(coverImageUrl, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const ext = blob.type === 'image/png' ? 'png' : 'jpg';
            link.download = `klozet-${cleanBaseName}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setIsSuccess(true);
            hapticSuccess();
            setTimeout(() => setIsSuccess(false), 2500);
            return;
          }
        } catch (fetchErr) {
          console.warn('[ExportStoryModal] Direct photo fetch failed, fallback to canvas render', fetchErr);
        }
      }

      // If OUTFIT mode (or photo canvas fallback): capture node with html2canvas
      if (!cardRef.current) throw new Error('Contenedor no disponible');

      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      );

      if (!blob) throw new Error('No se pudo generar la imagen');

      const fileName = `klozet-${exportMode}-${cleanBaseName}-${aspectRatio}.png`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      hapticSuccess();
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      console.error('[ExportStoryModal] Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [exportMode, coverImageUrl, cleanBaseName, aspectRatio, isExporting]);

  // 3. Native Share Action (iOS / Android / Strava style)
  const handleNativeShare = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    hapticLight();

    try {
      // If web share API supports files and card is available, share the rendered image
      if (cardRef.current && typeof navigator !== 'undefined' && navigator.canShare) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
        );

        if (blob) {
          const file = new File([blob], `klozet-${exportMode}-${cleanBaseName}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${title} · Klozet`,
              text: `Mira este look en Klozet: ${resolvedShareUrl}`,
              url: resolvedShareUrl,
            });
            hapticSuccess();
            return;
          }
        }
      }

      // Fallback: share url
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `${title} · Klozet`,
          text: `Mira este look en Klozet`,
          url: resolvedShareUrl,
        });
        hapticSuccess();
      } else {
        await handleCopyLink();
      }
    } catch (shareErr: any) {
      if (shareErr?.name !== 'AbortError') {
        console.error('[ExportStoryModal] Native share failed:', shareErr);
      }
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, exportMode, cleanBaseName, title, resolvedShareUrl, handleCopyLink]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
        {/* Backdrop dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-lg bg-[var(--card-bg)] text-[var(--foreground)] rounded-3xl border border-[var(--border-color)]/70 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)]/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/15 text-[var(--brand-pink)] flex items-center justify-center">
                <Share className="w-4 h-4" strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold leading-tight">Compartir look</h3>
                <p className="text-[11px] text-[var(--foreground-secondary)]">Exporta en alta resolución o copia el enlace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-200/50 dark:bg-white/10 flex items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector (Foto vs Outfit) */}
          <div className="px-5 pt-3 pb-2 bg-[var(--background)]/60 border-b border-[var(--border-color)]/40 flex-shrink-0 flex items-center gap-2">
            <div className="flex-1 flex p-1 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => {
                  setExportMode('photo');
                  hapticLight();
                }}
                disabled={!hasPhoto}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  exportMode === 'photo'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto limpia</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportMode('outfit');
                  hapticLight();
                }}
                disabled={!hasOutfit}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  exportMode === 'outfit'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Outfit</span>
              </button>
            </div>
          </div>

          {/* Secondary Controls: Format & Theme */}
          <div className="px-5 py-2.5 bg-[var(--background)]/40 border-b border-[var(--border-color)]/30 flex items-center justify-between gap-3 text-xs flex-shrink-0">
            {/* Format Selector */}
            <div className="flex items-center gap-1 bg-[var(--card-bg)] p-0.5 rounded-xl border border-[var(--border-color)]">
              <button
                onClick={() => { setAspectRatio('story'); hapticLight(); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  aspectRatio === 'story'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
                title="Story 9:16"
              >
                <Smartphone className="w-3 h-3" />
                <span className="text-[11px]">9:16</span>
              </button>
              <button
                onClick={() => { setAspectRatio('feed'); hapticLight(); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  aspectRatio === 'feed'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
                title="Post 4:5"
              >
                <Square className="w-3 h-3" />
                <span className="text-[11px]">4:5</span>
              </button>
              <button
                onClick={() => { setAspectRatio('square'); hapticLight(); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  aspectRatio === 'square'
                    ? 'bg-[var(--brand-pink)] text-white shadow-xs'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
                title="Cuadrado 1:1"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="text-[11px]">1:1</span>
              </button>
            </div>

            {/* Theme Selector (only active for Outfit mode) */}
            {exportMode === 'outfit' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setColorTheme('ivory'); hapticLight(); }}
                  className={`w-5 h-5 rounded-full bg-[#F9F9FB] border-2 transition-transform cursor-pointer ${
                    colorTheme === 'ivory' ? 'border-[var(--brand-pink)] scale-110' : 'border-zinc-300'
                  }`}
                  title="Marfil Studio"
                />
                <button
                  onClick={() => { setColorTheme('noir'); hapticLight(); }}
                  className={`w-5 h-5 rounded-full bg-[#0E0E12] border-2 transition-transform cursor-pointer ${
                    colorTheme === 'noir' ? 'border-[var(--brand-pink)] scale-110' : 'border-zinc-600'
                  }`}
                  title="Obsidian Noir"
                />
                <button
                  onClick={() => { setColorTheme('rose'); hapticLight(); }}
                  className={`w-5 h-5 rounded-full bg-[#FFF2F6] border-2 transition-transform cursor-pointer ${
                    colorTheme === 'rose' ? 'border-[var(--brand-pink)] scale-110' : 'border-pink-300'
                  }`}
                  title="Rose Klozet"
                />
              </div>
            ) : (
              <span className="text-[11px] text-[var(--foreground-secondary)] font-medium">
                Sin marcas de agua ni Kloe
              </span>
            )}
          </div>

          {/* Visual Preview Container */}
          <div className="p-4 sm:p-5 flex items-center justify-center bg-[var(--background)]/30 overflow-y-auto max-h-[50vh]">
            {/* The Exportable Canvas Card */}
            <div
              ref={cardRef}
              className={`relative rounded-3xl shadow-xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300 select-none ${
                exportMode === 'photo' ? 'bg-black' : themeStyles.bg
              } ${
                aspectRatio === 'story'
                  ? 'w-[260px] sm:w-[290px] aspect-[9/16]'
                  : aspectRatio === 'feed'
                  ? 'w-[260px] sm:w-[310px] aspect-[4/5]'
                  : 'w-[260px] sm:w-[300px] aspect-square'
              }`}
            >
              {/* VISTA 1: FOTO LIMPIA (Sin nada de Kloe, sin ninguna marca de agua) */}
              {exportMode === 'photo' ? (
                coverImageUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Rendered pure photo without ANY overlays, watermarks, or Kloe */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImageUrl}
                      alt={title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center text-white/70 text-xs">
                    No hay foto disponible para esta publicación
                  </div>
                )
              ) : (
                /* VISTA 2: OUTFIT COLLAGE (Logo Klozet completo arriba a la izquierda + Logo K abajo a la derecha) */
                <div className="relative w-full h-full flex flex-col justify-between p-4 overflow-hidden">
                  {/* Top-Left: Full Klozet Bubble Logo */}
                  <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/klozet-bubble-pink.png"
                      alt="Klozet"
                      crossOrigin="anonymous"
                      className="h-6 sm:h-7 w-auto object-contain drop-shadow-sm select-none"
                    />
                  </div>

                  {/* Bottom-Right: K Bubble Logo */}
                  <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/k-bubble-pink.png"
                      alt="K"
                      crossOrigin="anonymous"
                      className="h-7 sm:h-8 w-auto object-contain drop-shadow-sm select-none"
                    />
                  </div>

                  {/* Collage Canvas Body */}
                  <div className="relative w-full h-full my-auto flex items-center justify-center">
                    {outfitItems.length > 0 ? (
                      outfitItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${item.computedX}%`,
                            top: `${item.computedY}%`,
                            transform: `translate(-50%, -50%) rotate(${item.computedRotation}deg)`,
                            width: `${34 * Math.min(Math.max(item.computedScale, 0.65), 1.5)}%`,
                            zIndex: item.computedZIndex,
                          }}
                        >
                          <div className="relative w-full aspect-[3/4]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.img}
                              alt={item.name}
                              crossOrigin="anonymous"
                              className="w-full h-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)] select-none"
                            />
                          </div>
                        </div>
                      ))
                    ) : outfit?.image_url || outfit?.imageUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={outfit.image_url || outfit.imageUrl}
                          alt={title}
                          crossOrigin="anonymous"
                          className="max-w-full max-h-full object-contain drop-shadow-md select-none"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Layers className="w-8 h-8 text-[var(--brand-pink)] mx-auto mb-2 opacity-60" />
                        <p className={`text-xs ${themeStyles.textSecondary}`}>Sin prendas asociadas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar (Strava & Transak Inspired) */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-color)]/60 bg-[var(--card-bg)] flex flex-col gap-2.5 flex-shrink-0">
            {/* Primary Download + Copy Link Row */}
            <div className="flex items-center gap-2.5">
              {/* Download HD Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm bg-[var(--brand-pink)] text-white shadow-md shadow-[var(--brand-pink)]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    <span>¡Descargado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" strokeWidth={2.2} />
                    <span>{isExporting ? 'Generando...' : 'Descargar HD'}</span>
                  </>
                )}
              </button>

              {/* Copy Link Button (Strava / Transak style) */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-3 px-4 rounded-full font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                    : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--brand-pink)]'
                }`}
                title="Copiar link de la publicación"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                    <span className="hidden sm:inline">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" strokeWidth={2.2} />
                    <span>Copiar link</span>
                  </>
                )}
              </button>
            </div>

            {/* Native Share fallback row */}
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-[var(--background-secondary)]/60 hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Share className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Más opciones para compartir</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
