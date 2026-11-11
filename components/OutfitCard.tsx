'use client';

/**
 * OutfitCard - Display outfit with item images and shop links
 * Updated to use real Outfit type from DB
 */

import React, { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sun, Star, Crown, Briefcase, Heart, Zap, Flower2, PartyPopper, Circle, Snowflake, ShoppingBag, Layers, Check } from 'lucide-react';
import type { Outfit } from '@/types/outfit';
import { resolveImageUrl } from '@/lib/imageUtils';

interface OutfitCardProps {
    outfit: Outfit;
    isLocked?: boolean;
    selectionMode?: boolean;
    isSelected?: boolean;
    onClick?: (outfit: Outfit) => void;
    onEdit?: (outfit: Outfit) => void;
    onShare?: (outfit: Outfit) => void;
    onDelete?: (outfitId: string) => void;
    onToggleFavorite?: (outfit: Outfit, currentFav: boolean) => void;
    onToggleVisibility?: (outfit: Outfit) => void;
    index?: number;
}

const styleConfig: Record<string, { icon: React.ReactNode; gradient: string }> = {
    'casual': { icon: <Circle className="w-3 h-3" />, gradient: 'from-blue-400 to-indigo-500' },
    'formal': { icon: <Briefcase className="w-3 h-3" />, gradient: 'from-slate-500 to-gray-700' },
    'party': { icon: <PartyPopper className="w-3 h-3" />, gradient: 'from-violet-400 to-purple-500' },
    'sport': { icon: <Zap className="w-3 h-3" />, gradient: 'from-orange-400 to-red-500' },
    'date': { icon: <Heart className="w-3 h-3" />, gradient: 'from-rose-400 to-pink-500' },
    'business': { icon: <Briefcase className="w-3 h-3" />, gradient: 'from-slate-500 to-gray-700' },
    'everyday': { icon: <Sun className="w-3 h-3" />, gradient: 'from-amber-400 to-orange-500' },
    // Fallbacks for legacy mock styles if needed
    'Quiet Luxury': { icon: <Crown className="w-3 h-3" />, gradient: 'from-stone-400 to-stone-600' },
    'Cherry Red Statement': { icon: <Heart className="w-3 h-3" />, gradient: 'from-red-400 to-rose-600' },
    'Street Chic': { icon: <Zap className="w-3 h-3" />, gradient: 'from-violet-400 to-purple-500' },
    'Business Minimal': { icon: <Briefcase className="w-3 h-3" />, gradient: 'from-slate-500 to-gray-700' },
    'Weekend Casual': { icon: <Circle className="w-3 h-3" />, gradient: 'from-blue-400 to-indigo-500' },
    'Date Night': { icon: <Heart className="w-3 h-3" />, gradient: 'from-rose-400 to-pink-500' },
    'It-Girl Approved': { icon: <Star className="w-3 h-3" />, gradient: 'from-amber-400 to-orange-500' },
    'Winter Layers': { icon: <Snowflake className="w-3 h-3" />, gradient: 'from-sky-400 to-blue-500' },
    'Boho Weekend': { icon: <Flower2 className="w-3 h-3" />, gradient: 'from-amber-300 to-yellow-500' },
    'Party Ready': { icon: <PartyPopper className="w-3 h-3" />, gradient: 'from-violet-400 to-purple-500' },
};

// Helper to get vertical rank for items without explicit coordinates
function getCardCategoryVerticalRank(category?: string | null, name?: string | null): number {
    const raw = `${category || ''} ${name || ''}`.toLowerCase();
    if (/(hat|cap|gorra|gorro|sombrero|beanie|head|gafa|sunglass)/.test(raw)) return 1;
    if (/(outerwear|jacket|coat|blazer|cazadora|abrigo)/.test(raw)) return 2;
    if (/(top|shirt|camiseta|camisa|hoodie|sudadera|sweater|jersey|blusa|polo|knit|tank|crop)/.test(raw)) return 2.5;
    if (/(dress|vestido|mono|jumpsuit)/.test(raw)) return 3;
    if (/(pant|jean|trouser|pantalon|pantalón|vaquero|short|bermuda|skirt|falda|bottom|cargo|legging)/.test(raw)) return 4;
    if (/(shoe|sneaker|zapatilla|bota|boot|sandal|loafer|mocasin|mocasín|heel|tacón|calzado|footwear|shox)/.test(raw)) return 5;
    return 3.5;
}

const OutfitCard = ({ outfit, isLocked = false, selectionMode = false, isSelected = false, onClick, onEdit, onDelete, onShare, onToggleFavorite, onToggleVisibility, index = 0 }: OutfitCardProps) => {
    const [imageError, setImageError] = useState(false);
    const styleKey = outfit.occasion || outfit.style || 'everyday';
    const config = styleConfig[styleKey] || { icon: <Layers className="w-3 h-3" />, gradient: 'from-pink-400 to-rose-500' };

    // Check if any item has images - handle both imageUrl and image_url field names
    const outfitAny = outfit as any;
    const hasShopLinks = outfitAny.items?.some((item: any) => item.sourceUrl || item.buyLink) ?? false;

    // Get the outfit preview image - handle both field names
    const rawPreviewImage = outfitAny.imageUrl || outfitAny.image_url;
    const outfitPreviewImage = rawPreviewImage ? resolveImageUrl(rawPreviewImage) : null;

    // Get item image - handle both field names and resolve storage paths
    const getItemImage = (item: any) => {
        const raw = item.imageUrl || item.image_url || item.original_image_url || item.original_image;
        return raw ? resolveImageUrl(raw) : null;
    };

    const items = outfit.items || [];
    const hasPositionedItems = items.some((it: any) => typeof it.position_x === 'number');

    // Detect legacy 2x2 grid coordinates from old saves
    const isLegacyGrid = items.length >= 2 && items.every((it: any) => {
        const px = Math.round(it.position_x ?? 50);
        const py = Math.round(it.position_y ?? 50);
        return (px === 33 || px === 67 || px === 50) && (py === 33 || py === 67 || py === 50);
    }) && items.some((it: any) => {
        const px = Math.round(it.position_x ?? 50);
        return px === 33 || px === 67;
    });

    const sortedItems = useMemo(() => {
        if (!hasPositionedItems || isLegacyGrid) {
            return [...items].sort((a: any, b: any) => {
                const rankA = getCardCategoryVerticalRank(a.category, a.name);
                const rankB = getCardCategoryVerticalRank(b.category, b.name);
                return rankA - rankB;
            });
        }
        return items;
    }, [items, hasPositionedItems, isLegacyGrid]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={!isLocked && !selectionMode ? {
                y: -3,
                transition: { type: 'spring', stiffness: 420, damping: 24 }
            } : {}}
            whileTap={!isLocked ? { scale: 0.97 } : {}}
            onClick={!isLocked && onClick ? () => onClick(outfit) : undefined}
            className={`group relative overflow-hidden rounded-[20px] kz-surface-card hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300 select-none ${
                selectionMode && isSelected ? 'ring-4 ring-[var(--brand-pink)] ring-inset' : ''
            } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {/* Full-card selection tint & checkmark clipped flush inside rounded-[20px] */}
            {selectionMode && isSelected && (
                <>
                    <div className="absolute inset-0 z-[25] bg-[var(--brand-pink)]/20 pointer-events-none transition-opacity" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[var(--brand-pink)] rounded-full p-3 text-white shadow-xl shadow-[var(--brand-pink)]/30 backdrop-blur-sm pointer-events-none">
                        <Check className="w-8 h-8" strokeWidth={3} />
                    </div>
                </>
            )}

            {/* Clickable Area */}
            <div className="cursor-pointer w-full">
                {/* Outfit Preview - Always White Canvas */}
                <div
                    className={`relative w-full aspect-[4/5] bg-white overflow-hidden ${isLocked ? 'blur-sm' : ''
                        }`}
                >
                    {/* Prioritize live positioned composition so clothes always render on clean white canvas and never legacy dark raster images */}
                    {sortedItems.length > 0 ? (
                        /* Live Canvas Composition with exact positions or vertical head-to-toe stack */
                        <div className="relative w-full h-full overflow-hidden p-2">
                            {sortedItems.map((item: any, i: number) => {
                                const imgSrc = getItemImage(item);
                                const total = sortedItems.length;

                                let posX = typeof item.position_x === 'number' ? item.position_x : 50;
                                let posY = typeof item.position_y === 'number' ? item.position_y : 50;
                                let itemScale = typeof item.scale === 'number' ? item.scale : 1;

                                if (!hasPositionedItems || isLegacyGrid) {
                                    posX = 50;
                                    const startY = total >= 4 ? 16 : 22;
                                    const endY = total >= 4 ? 84 : 78;
                                    posY = total === 1 ? 50 : startY + (i * (endY - startY)) / (total - 1);
                                    const rank = getCardCategoryVerticalRank(item.category, item.name);
                                    if (rank === 1) itemScale = 0.55;
                                }

                                const itemZ = item.layer_order || (i + 1);

                                return (
                                    <div
                                        key={item.id || i}
                                        style={{
                                            position: 'absolute',
                                            left: `${posX}%`,
                                            top: `${posY}%`,
                                            transform: `translate(-50%, -50%) scale(${itemScale * 0.9})`,
                                            zIndex: itemZ,
                                            width: '38%',
                                            maxWidth: '120px'
                                        }}
                                        className="flex items-center justify-center pointer-events-none select-none"
                                    >
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={item.name || 'Prenda'}
                                                className="w-full h-auto object-contain drop-shadow-md pointer-events-none"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-lg shadow-xs"
                                                style={{ backgroundColor: item.color_hex || item.color || '#ccc' }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : outfitPreviewImage && !imageError ? (
                        <img
                            src={outfitPreviewImage}
                            alt={outfit.name}
                            className="w-full h-full object-cover dark:mix-blend-normal"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        /* Balanced Grid Composition (Fallback for legacy outfits without coordinates) */
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-3 gap-2">
                            <div className="w-full h-full grid grid-cols-2 gap-2 place-items-center">
                                {items.slice(0, 4).map((item: any, i: number) => {
                                    const imgSrc = getItemImage(item);
                                    return (
                                        <div
                                            key={item.id || i}
                                            className="relative w-full h-full flex items-center justify-center overflow-hidden"
                                        >
                                            {imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain drop-shadow-sm"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-lg"
                                                    style={{ backgroundColor: item.color_hex || item.color || '#e5e7eb' }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hover-only black outfit name anchored bottom-left with subtle bottom shadow */}
                    {!isLocked && !selectionMode && (
                        <div className="absolute inset-x-0 bottom-0 pt-7 pb-3 px-3.5 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-t from-black/[0.09] via-black/[0.03] to-transparent flex items-end justify-start">
                            <p
                                data-no-translate={outfit.name ? 'true' : undefined}
                                className="text-xs font-semibold text-zinc-900 truncate text-left [text-shadow:0_1px_2px_rgba(255,255,255,0.85)]"
                            >
                                {outfit.name || 'Look sin título'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Overlay Actions - Always visible */}
            <div className="absolute top-2 right-2 flex flex-col items-center gap-1.5 z-20">
                {onToggleFavorite && !isLocked && (
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(outfit, outfit.favorite ?? false);
                        }}
                        aria-label={outfit.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        className="p-1.5 bg-transparent focus:outline-none cursor-pointer"
                    >
                        <motion.div
                            animate={outfit.favorite ? { scale: [1, 1.38, 0.92, 1] } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                            <Heart className={`w-[18px] h-[18px] transition-colors duration-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] ${outfit.favorite ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'fill-none text-zinc-400 hover:text-zinc-600'}`} />
                        </motion.div>
                    </motion.button>
                )}
                {!outfit.is_public && (
                    <div className="p-1" title="Outfit privado">
                        <Lock className="w-4 h-4 text-zinc-400" />
                    </div>
                )}
            </div>

            {/* Shop indicator moved to top-left so it never overlaps favorite button */}
            {
                hasShopLinks && !isLocked && (
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm border border-black/[0.06] dark:border-white/10 rounded-full p-1.5 shadow-xs z-20">
                        <ShoppingBag className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                    </div>
                )
            }

            {/* Locked Overlay */}
            {
                isLocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/40 to-transparent z-20"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center mb-2 mx-auto shadow-lg"
                            >
                                <Lock className="w-5 h-5 text-[var(--brand-pink)]" />
                            </motion.div>
                            <p className="text-white font-medium text-xs">Premium</p>
                        </div>
                    </motion.div>
                )
            }
        </motion.div>
    );
};

export default memo(OutfitCard);
