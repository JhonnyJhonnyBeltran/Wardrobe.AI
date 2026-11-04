'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  Share,
  Check,
  Layers,
  Camera,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { hapticLight, hapticSuccess } from '@/lib/utils/haptic';
import { resolveImageUrl } from '@/lib/imageUtils';

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

type ColorTheme = 'transparent' | 'ivory' | 'noir' | 'rose';

// Category rank helper so unpositioned garments stack head-to-toe vertically
function getCategoryVerticalRank(category?: string | null, name?: string | null): number {
  const raw = `${category || ''} ${name || ''}`.toLowerCase();
  if (/(hat|cap|gorra|gorro|sombrero|beanie|head|gafa|sunglass)/.test(raw)) return 1;
  if (/(jacket|coat|chaqueta|abrigo|blazer|cardigan|chaleco|vest|outerwear)/.test(raw)) return 2;
  if (/(top|shirt|camiseta|camisa|hoodie|sudadera|sweater|jersey|blusa|polo|knit|tank|crop)/.test(raw)) return 2.5;
  if (/(dress|vestido|mono|jumpsuit|overall)/.test(raw)) return 3;
  if (/(pant|jean|trouser|pantalon|pantalón|vaquero|short|bermuda|skirt|falda|bottom|cargo|legging|chandal|chándal)/.test(raw)) return 4;
  if (/(shoe|sneaker|zapatilla|bota|boot|sandal|loafer|mocasin|mocasín|heel|tacón|calzado|footwear|shox)/.test(raw)) return 5;
  return 3.5; // bags, watches, accessories
}

// Helper to load an HTMLImageElement with CORS support and proxy fallback for HD Canvas rendering
async function loadCanvasImage(src: string): Promise<HTMLImageElement> {
  const resolved = resolveImageUrl(src, '');
  if (!resolved) throw new Error('Empty image URL');

  const tryLoad = (url: string, useCors: boolean) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      if (useCors) img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });

  // 1. Try direct fetch -> blob object URL (cleanest way to avoid tainted canvas on Supabase/CDN URLs)
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
    try {
      const res = await fetch(resolved, { mode: 'cors', credentials: 'omit' });
      if (res.ok) {
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        try {
          const img = await tryLoad(objUrl, false);
          return img;
        } finally {
          // Revoke after a short delay so canvas drawImage has completed
          setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
        }
      }
    } catch {
      // Fall through to direct Image load
    }
  }

  // 2. Direct load with crossOrigin="anonymous"
  return tryLoad(resolved, true);
}

export default function ExportStoryModal({
  isOpen,
  onClose,
  title,
  items = [],
  coverImageUrl,
  occasion,
  season,
  postId,
  postUrl,
  outfit,
  garments = [],
  initialMode,
}: ExportStoryModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Normalize items & garments preserving exact outfit canvas positions, scales, rotations, and layer order
  const outfitItems = useMemo(() => {
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

    // Check if at least one item has saved canvas coordinates
    const hasExplicitPositions = rawList.some(
      (it: any) =>
        (it.position_x !== undefined && it.position_x !== null) ||
        (it.positionX !== undefined && it.positionX !== null)
    );

    // If no explicit coordinates exist, sort items vertically from head to toe
    const workingList = hasExplicitPositions
      ? rawList
      : [...rawList].sort((a: any, b: any) => {
          const ca = a.clothing_items || a.clothing_item || a.clothing || a;
          const cb = b.clothing_items || b.clothing_item || b.clothing || b;
          const itemA = Array.isArray(ca) ? ca[0] : ca;
          const itemB = Array.isArray(cb) ? cb[0] : cb;
          const rankA = getCategoryVerticalRank(itemA?.category || a.category, itemA?.name || a.name);
          const rankB = getCategoryVerticalRank(itemB?.category || b.category, itemB?.name || b.name);
          return rankA - rankB;
        });

    const total = workingList.length;

    return workingList
      .map((item: any, i: number) => {
        const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
        const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
        const rawImg =
          clothing?.imageUrl ||
          clothing?.image_url ||
          clothing?.original_image_url ||
          clothing?.originalImageUrl ||
          item.imageUrl ||
          item.image_url;
        const img = rawImg ? resolveImageUrl(rawImg, '') : '';
        const name = clothing?.name || item.name || 'Prenda';
        const brand = clothing?.brand || item.brand || null;

        let x = item.position_x ?? item.positionX;
        let y = item.position_y ?? item.positionY;
        let scale = item.scale ?? 1;

        // If no explicit coordinates, stack vertically in head-to-toe order along the center axis
        if (x === undefined || x === null || y === undefined || y === null) {
          x = 50;
          if (total === 1) {
            y = 50;
          } else {
            const startY = total >= 4 ? 14 : 20;
            const endY = total >= 4 ? 86 : 80;
            y = startY + (i * (endY - startY)) / (total - 1);
          }
          const rank = getCategoryVerticalRank(clothing?.category || item.category, name);
          if (rank === 1) scale = 0.55; // Caps / hats smaller like in outfit canvas
        }

        return {
          id: clothing?.id || item.id || `item-${i}`,
          img,
          name,
          brand,
          computedX: Number(x),
          computedY: Number(y),
          computedScale: Number(scale) || 1,
          computedRotation: Number(item.rotation ?? 0) || 0,
          computedZIndex: Number(item.layer_order ?? item.zIndex ?? item.z_index ?? i) || i,
        };
      })
      .filter((it: any) => Boolean(it.img))
      .sort((a: any, b: any) => a.computedZIndex - b.computedZIndex);
  }, [outfit, items, garments]);

  const hasPhoto = Boolean(coverImageUrl);
  const hasOutfit = outfitItems.length > 0 || Boolean(outfit?.image_url || outfit?.imageUrl);

  // Tab mode: 'photo' (100% clean user photo) or 'outfit' (9:16 HD sticker with Klozet bubble + K bubble)
  const [exportMode, setExportMode] = useState<'photo' | 'outfit'>(() => {
    if (initialMode) return initialMode;
    if (hasPhoto) return 'photo';
    return 'outfit';
  });

  // Sync mode when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setExportMode(initialMode);
      } else if (hasPhoto) {
        setExportMode('photo');
      } else {
        setExportMode('outfit');
      }
    }
  }, [isOpen, initialMode, hasPhoto]);

  const [colorTheme, setColorTheme] = useState<ColorTheme>('transparent');
  const [activeAction, setActiveAction] = useState<'download' | 'copy' | 'share' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCopiedSticker, setIsCopiedSticker] = useState(false);

  // Clean filename for export
  const cleanBaseName = useMemo(() => {
    return (
      (title || 'klozet-look')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'look'
    );
  }, [title]);

  // Theme configurations for the outfit canvas (always 9:16)
  const themeStyles = {
    transparent: {
      bg: 'bg-transparent',
      hex: null,
      textPrimary: 'text-zinc-900 dark:text-zinc-100',
      textSecondary: 'text-zinc-500',
    },
    ivory: {
      bg: 'bg-[#F9F9FB]',
      hex: '#F9F9FB',
      textPrimary: 'text-zinc-900',
      textSecondary: 'text-zinc-500',
    },
    noir: {
      bg: 'bg-[#0E0E12]',
      hex: '#0E0E12',
      textPrimary: 'text-zinc-100',
      textSecondary: 'text-zinc-400',
    },
    rose: {
      bg: 'bg-[#FFF2F6]',
      hex: '#FFF2F6',
      textPrimary: 'text-pink-950',
      textSecondary: 'text-pink-700/80',
    },
  }[colorTheme];

  /**
   * Native 2K HD (1440 x 2560, 9:16) Canvas Renderer
   * Draws full-resolution garment images at exact 3:4 stage coordinates so the exported/copied
   * sticker is razor-sharp in HD and matches InteractiveOutfitViewer 1:1.
   */
  const generateHdBlob = useCallback(async (): Promise<Blob> => {
    const HD_WIDTH = 1440;
    const HD_HEIGHT = 2560; // Strict 9:16 UHD vertical format

    try {
      const canvas = document.createElement('canvas');
      canvas.width = HD_WIDTH;
      canvas.height = HD_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D context not available');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (exportMode === 'photo' && coverImageUrl) {
        // Fill background and cover-fit the photo in 9:16 HD
        const photoImg = await loadCanvasImage(coverImageUrl);
        const imgRatio = photoImg.naturalWidth / photoImg.naturalHeight;
        const canvasRatio = HD_WIDTH / HD_HEIGHT;

        let drawW = HD_WIDTH;
        let drawH = HD_HEIGHT;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawH = HD_HEIGHT;
          drawW = HD_HEIGHT * imgRatio;
          offsetX = (HD_WIDTH - drawW) / 2;
        } else {
          drawW = HD_WIDTH;
          drawH = HD_WIDTH / imgRatio;
          offsetY = (HD_HEIGHT - drawH) / 2;
        }

        ctx.drawImage(photoImg, offsetX, offsetY, drawW, drawH);
      } else {
        // OUTFIT / STICKER MODE (9:16 HD)
        if (themeStyles.hex) {
          ctx.fillStyle = themeStyles.hex;
          ctx.fillRect(0, 0, HD_WIDTH, HD_HEIGHT);
        } else {
          ctx.clearRect(0, 0, HD_WIDTH, HD_HEIGHT);
        }

        // The 3:4 outfit stage is centered vertically inside the 9:16 frame
        const stageW = HD_WIDTH;
        const stageH = Math.round(HD_WIDTH * (4 / 3)); // 1920px
        const stageLeft = 0;
        const stageTop = Math.round((HD_HEIGHT - stageH) / 2); // 320px

        if (outfitItems.length > 0) {
          // Load all garment images in parallel while preserving sorted zIndex order
          const loadedItems = await Promise.all(
            outfitItems.map(async (item) => {
              const img = await loadCanvasImage(item.img);
              return { item, img };
            })
          );

          for (const { item, img } of loadedItems) {
            const centerX = stageLeft + (item.computedX / 100) * stageW;
            const centerY = stageTop + (item.computedY / 100) * stageH;

            // Match InteractiveOutfitViewer: base width is 35% * scale of stageW, inside a 3:4 box
            const boxW = stageW * 0.35 * item.computedScale;
            const boxH = boxW * (4 / 3);

            // Object-contain inside (boxW x boxH)
            const natW = img.naturalWidth || img.width || 1;
            const natH = img.naturalHeight || img.height || 1;
            const scaleFactor = Math.min(boxW / natW, boxH / natH);
            const drawW = natW * scaleFactor;
            const drawH = natH * scaleFactor;

            ctx.save();
            ctx.translate(centerX, centerY);
            if (item.computedRotation) {
              ctx.rotate((item.computedRotation * Math.PI) / 180);
            }
            ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
            ctx.shadowBlur = 32;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 14;
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
          }
        } else if (outfit?.image_url || outfit?.imageUrl) {
          const fallbackImg = await loadCanvasImage(outfit.image_url || outfit.imageUrl);
          const natW = fallbackImg.naturalWidth || 1;
          const natH = fallbackImg.naturalHeight || 1;
          const scaleFactor = Math.min((stageW * 0.9) / natW, (stageH * 0.9) / natH);
          const drawW = natW * scaleFactor;
          const drawH = natH * scaleFactor;
          ctx.drawImage(
            fallbackImg,
            stageLeft + (stageW - drawW) / 2,
            stageTop + (stageH - drawH) / 2,
            drawW,
            drawH
          );
        }

        // Draw Top-Left Klozet Bubble Logo & Bottom-Right K Bubble Logo
        try {
          const [topLogo, bottomLogo] = await Promise.all([
            loadCanvasImage('/klozet-bubble-pink.png'),
            loadCanvasImage('/k-bubble-pink.png'),
          ]);

          const pad = 72;
          // Top-left logo (~116px height in 1440w HD)
          const topH = 116;
          const topW = (topLogo.naturalWidth / (topLogo.naturalHeight || 1)) * topH;
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          ctx.drawImage(topLogo, pad, pad, topW, topH);

          // Bottom-right K logo (~132px height in 1440w HD)
          const botH = 132;
          const botW = (bottomLogo.naturalWidth / (bottomLogo.naturalHeight || 1)) * botH;
          ctx.drawImage(bottomLogo, HD_WIDTH - pad - botW, HD_HEIGHT - pad - botH, botW, botH);
          ctx.restore();
        } catch (logoErr) {
          console.warn('[ExportStoryModal] Logo draw warning:', logoErr);
        }
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
      );
      if (blob) return blob;
    } catch (canvasErr) {
      console.warn('[ExportStoryModal] Native HD canvas fallback to html2canvas:', canvasErr);
    }

    // Fallback to high-scale html2canvas if any image blocked CORS
    if (!cardRef.current) throw new Error('Contenedor no disponible');
    const isTransparent = exportMode === 'outfit' && colorTheme === 'transparent';
    const fallbackCanvas = await html2canvas(cardRef.current, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: isTransparent ? null : undefined,
      logging: false,
      imageTimeout: 15000,
    });
    const fallbackBlob = await new Promise<Blob | null>((resolve) =>
      fallbackCanvas.toBlob((b) => resolve(b), 'image/png', 1.0)
    );
    if (!fallbackBlob) throw new Error('No se pudo generar el sticker en HD');
    return fallbackBlob;
  }, [exportMode, coverImageUrl, themeStyles.hex, outfitItems, outfit, colorTheme]);

  // 1. Download Action (HD 9:16 PNG)
  const handleDownload = useCallback(async () => {
    if (activeAction) return;
    setActiveAction('download');
    hapticLight();

    try {
      const blob = await generateHdBlob();
      const isTransparent = exportMode === 'outfit' && colorTheme === 'transparent';
      const fileName = `klozet-${exportMode}-${cleanBaseName}${isTransparent ? '-sticker' : ''}-hd.png`;
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
      console.error('[ExportStoryModal] Download HD failed:', err);
    } finally {
      setActiveAction(null);
    }
  }, [activeAction, generateHdBlob, exportMode, colorTheme, cleanBaseName]);

  // 2. Copy HD Sticker to Clipboard (Strava style: paste directly into Instagram Stories)
  const handleCopySticker = useCallback(async () => {
    if (activeAction) return;
    setActiveAction('copy');
    hapticLight();

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        // Pass a Promise to ClipboardItem so iOS Safari / macOS / Chrome preserve the user gesture
        const item = new ClipboardItem({
          'image/png': generateHdBlob(),
        });
        await navigator.clipboard.write([item]);
        setIsCopiedSticker(true);
        hapticSuccess();
        setTimeout(() => setIsCopiedSticker(false), 2800);
        return;
      }

      // Fallback if ClipboardItem is not supported on a legacy webview: trigger native share or download
      const blob = await generateHdBlob();
      const file = new File([blob], `klozet-sticker-${cleanBaseName}.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${title} · Klozet` });
        setIsCopiedSticker(true);
        hapticSuccess();
        setTimeout(() => setIsCopiedSticker(false), 2800);
      } else {
        await handleDownload();
      }
    } catch (err) {
      console.error('[ExportStoryModal] Error copying HD sticker to clipboard:', err);
    } finally {
      setActiveAction(null);
    }
  }, [activeAction, generateHdBlob, cleanBaseName, title, handleDownload]);

  // 3. Native Share Action (iOS / Android share sheet with HD file)
  const handleNativeShare = useCallback(async () => {
    if (activeAction) return;
    setActiveAction('share');
    hapticLight();

    try {
      const blob = await generateHdBlob();
      const file = new File([blob], `klozet-${exportMode}-${cleanBaseName}-hd.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${title} · Klozet`,
        });
        hapticSuccess();
      } else {
        await handleDownload();
      }
    } catch (shareErr: any) {
      if (shareErr?.name !== 'AbortError') {
        console.error('[ExportStoryModal] Native share failed:', shareErr);
      }
    } finally {
      setActiveAction(null);
    }
  }, [activeAction, generateHdBlob, exportMode, cleanBaseName, title, handleDownload]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {/* Root Portal Container with high z-index (100000) so desktop sidebar z-5001 and tabbar z-5000 are completely dimmed */}
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden">
        {/* Backdrop dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-lg bg-[var(--card-bg)] text-[var(--foreground)] rounded-3xl border border-[var(--border-color)]/70 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)]/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/15 text-[var(--brand-pink)] flex items-center justify-center">
                <Share className="w-4 h-4" strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold leading-tight">Generar sticker HD</h3>
                <p className="text-[11px] text-[var(--foreground-secondary)]">Copia el sticker para pegarlo en Instagram o descárgalo en HD</p>
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

          {/* Mode Selector (Foto vs Outfit) - Only show if post has a distinct user photo */}
          {hasPhoto && hasOutfit && (
            <div className="px-5 pt-3 pb-2 bg-[var(--background)]/60 border-b border-[var(--border-color)]/40 flex-shrink-0 flex items-center gap-2">
              <div className="flex-1 flex p-1 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => {
                    setExportMode('photo');
                    hapticLight();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    exportMode === 'photo'
                      ? 'bg-white dark:bg-zinc-800 text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
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
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    exportMode === 'outfit'
                      ? 'bg-white dark:bg-zinc-800 text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sticker Outfit</span>
                </button>
              </div>
            </div>
          )}

          {/* Secondary Controls: Background Theme Selector (Format locked to 9:16) */}
          {exportMode === 'outfit' && (
            <div className="px-5 py-2.5 bg-[var(--background)]/40 border-b border-[var(--border-color)]/30 flex items-center justify-between gap-3 text-xs flex-shrink-0">
              <span className="text-[11px] font-semibold text-[var(--foreground-secondary)]">
                Fondo del sticker
              </span>

              <div className="flex items-center gap-1.5">
                {/* Transparent Option Pill */}
                <button
                  type="button"
                  onClick={() => { setColorTheme('transparent'); hapticLight(); }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    colorTheme === 'transparent'
                      ? 'bg-[var(--brand-pink)] text-white border-[var(--brand-pink)] shadow-xs'
                      : 'bg-[var(--card-bg)] text-[var(--foreground-secondary)] border-[var(--border-color)] hover:text-[var(--foreground)]'
                  }`}
                  title="Sticker con fondo transparente (PNG)"
                >
                  <span className="w-2.5 h-2.5 rounded-sm border border-current bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:3px_3px] inline-block" />
                  <span>Transparente</span>
                </button>

                {/* Solid color swatches */}
                <button
                  type="button"
                  onClick={() => { setColorTheme('ivory'); hapticLight(); }}
                  className={`w-5 h-5 rounded-full bg-[#F9F9FB] border-2 transition-transform cursor-pointer ${
                    colorTheme === 'ivory' ? 'border-[var(--brand-pink)] scale-110 shadow-xs' : 'border-zinc-300'
                  }`}
                  title="Blanco Marfil"
                />
                <button
                  type="button"
                  onClick={() => { setColorTheme('noir'); hapticLight(); }}
                  className={`w-5 h-5 rounded-full bg-[#0E0E12] border-2 transition-transform cursor-pointer ${
                    colorTheme === 'noir' ? 'border-[var(--brand-pink)] scale-110 shadow-xs' : 'border-zinc-600'
                  }`}
                  title="Negro"
                />
                <button
                  type="button"
                  onClick={() => { setColorTheme('rose'); hapticLight(); }}
                  className={`w-5 h-5 rounded-full bg-[#FFF2F6] border-2 transition-transform cursor-pointer ${
                    colorTheme === 'rose' ? 'border-[var(--brand-pink)] scale-110 shadow-xs' : 'border-pink-300'
                  }`}
                  title="Rosa Klozet"
                />
              </div>
            </div>
          )}

          {/* Visual Preview Container - Always 9:16 */}
          <div className="p-3 sm:p-4 flex items-center justify-center bg-[var(--background)]/30 overflow-hidden flex-1 min-h-0">
            {/* Checkerboard outer wrapper for transparent mode preview */}
            <div className={`relative flex items-center justify-center transition-all ${
              colorTheme === 'transparent' && exportMode === 'outfit'
                ? 'p-0.5 rounded-3xl bg-[repeating-conic-gradient(#e4e4e7_0%_25%,#ffffff_0%_50%)] [background-size:12px_12px] dark:bg-[repeating-conic-gradient(#27272a_0%_25%,#18181b_0%_50%)] shadow-xl'
                : ''
            }`}>
              {/* The Exportable 9:16 Canvas Card */}
              <div
                ref={cardRef}
                className={`relative rounded-3xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300 select-none shadow-xl h-[min(50vh,430px)] aspect-[9/16] ${
                  exportMode === 'photo'
                    ? ''
                    : colorTheme === 'transparent'
                    ? 'bg-transparent'
                    : themeStyles.bg
                }`}
              >
                {/* VISTA 1: FOTO LIMPIA */}
                {exportMode === 'photo' ? (
                  coverImageUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImageUrl}
                        alt={title}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div className="p-6 text-center text-zinc-400 text-xs">
                      No hay foto disponible para esta publicación
                    </div>
                  )
                ) : (
                  /* VISTA 2: OUTFIT STICKER 9:16 (Con escenario central 3:4 idéntico al visor del outfit) */
                  <div className="relative w-full h-full flex flex-col justify-center overflow-hidden">
                    {/* Top-Left: Full Klozet Bubble Logo */}
                    <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/klozet-bubble-pink.png"
                        alt="Klozet"
                        crossOrigin="anonymous"
                        className="h-5 sm:h-6 w-auto object-contain drop-shadow-sm select-none"
                      />
                    </div>

                    {/* Bottom-Right: K Bubble Logo */}
                    <div className="absolute bottom-3.5 right-3.5 z-20 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/k-bubble-pink.png"
                        alt="K"
                        crossOrigin="anonymous"
                        className="h-6 sm:h-7 w-auto object-contain drop-shadow-sm select-none"
                      />
                    </div>

                    {/* 3:4 Stage matching InteractiveOutfitViewer 1:1 so garment positions & proportions never shift */}
                    <div className="relative w-full aspect-[3/4] my-auto flex items-center justify-center">
                      {outfitItems.length > 0 ? (
                        outfitItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${item.computedX}%`,
                              top: `${item.computedY}%`,
                              transform: `translate(-50%, -50%) rotate(${item.computedRotation}deg)`,
                              width: `${35 * item.computedScale}%`,
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
                            src={resolveImageUrl(outfit.image_url || outfit.imageUrl, '')}
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
          </div>

          {/* Action Bar: Descargar HD + Copiar Sticker (Strava style for pasting into Instagram Stories) */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-color)]/60 bg-[var(--card-bg)] flex flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              {/* 1. Descargar HD Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={activeAction !== null}
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
                    <span>
                      {activeAction === 'download' ? 'Generando HD...' : 'Descargar'}
                    </span>
                  </>
                )}
              </button>

              {/* 2. Copiar Sticker HD Button (Strava-style clipboard image copy for Instagram) */}
              <button
                type="button"
                onClick={handleCopySticker}
                disabled={activeAction !== null}
                className={`flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${
                  isCopiedSticker
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                    : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--brand-pink)]'
                }`}
                title="Copia el sticker en HD al portapapeles para pegarlo en Instagram Stories"
              >
                {isCopiedSticker ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={2.2} />
                    <span>
                      {activeAction === 'copy' ? 'Copiando...' : 'Copiar'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Native Share fallback row */}
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={activeAction !== null}
              className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-[var(--background-secondary)]/60 hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Share className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Más opciones para compartir</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
