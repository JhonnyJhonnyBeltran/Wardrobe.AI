'use client';

/**
 * OutfitCard - Display outfit with item images and shop links
 * Updated to use real Outfit type from DB
 */

import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Briefcase, Heart, Zap, Flower2, PartyPopper, Circle, Snowflake, ShoppingBag, Layers, Globe, Edit2, Trash2, Send } from 'lucide-react';
import type { Outfit } from '@/types/outfit';
import { resolveImageUrl } from '@/lib/imageUtils';

interface OutfitCardProps {
    outfit: Outfit;
    isLocked?: boolean;
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
    'everyday': { icon: <Sparkles className="w-3 h-3" />, gradient: 'from-amber-400 to-orange-500' },
    // Fallbacks for legacy mock styles if needed
    'Quiet Luxury': { icon: <Sparkles className="w-3 h-3" />, gradient: 'from-stone-400 to-stone-600' },
    'Cherry Red Statement': { icon: <Heart className="w-3 h-3" />, gradient: 'from-red-400 to-rose-600' },
    'Street Chic': { icon: <Zap className="w-3 h-3" />, gradient: 'from-violet-400 to-purple-500' },
    'Business Minimal': { icon: <Briefcase className="w-3 h-3" />, gradient: 'from-slate-500 to-gray-700' },
    'Weekend Casual': { icon: <Circle className="w-3 h-3" />, gradient: 'from-blue-400 to-indigo-500' },
    'Date Night': { icon: <Heart className="w-3 h-3" />, gradient: 'from-rose-400 to-pink-500' },
    'It-Girl Approved': { icon: <Sparkles className="w-3 h-3" />, gradient: 'from-amber-400 to-orange-500' },
    'Winter Layers': { icon: <Snowflake className="w-3 h-3" />, gradient: 'from-sky-400 to-blue-500' },
    'Boho Weekend': { icon: <Flower2 className="w-3 h-3" />, gradient: 'from-amber-300 to-yellow-500' },
    'Party Ready': { icon: <PartyPopper className="w-3 h-3" />, gradient: 'from-violet-400 to-purple-500' },
};

const OutfitCard = ({ outfit, isLocked = false, onClick, onEdit, onDelete, onShare, onToggleFavorite, onToggleVisibility, index = 0 }: OutfitCardProps) => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={!isLocked ? {
                scale: 1.03,
                transition: { duration: 0.2 }
            } : {}}
            className={`relative overflow-hidden rounded-[20px] bg-[var(--card-bg)] shadow-sm border border-[var(--border-color)] ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
        >
            {/* Clickable Area */}
            <div onClick={!isLocked && onClick ? () => onClick(outfit) : undefined} className="cursor-pointer">
                {/* Outfit Preview */}
                <div
                    className={`relative w-full aspect-[4/5] bg-white dark:bg-[#151518] overflow-hidden ${isLocked ? 'blur-sm' : ''
                        }`}
                >
                    {outfitPreviewImage && !imageError ? (
                        <img
                            src={outfitPreviewImage}
                            alt={outfit.name}
                            className="w-full h-full object-cover dark:mix-blend-normal"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : hasPositionedItems && items.length > 0 ? (
                        /* Live Canvas Composition with exact positions */
                        <div className="relative w-full h-full overflow-hidden p-2">
                            {items.map((item: any, i: number) => {
                                const imgSrc = getItemImage(item);
                                const posX = typeof item.position_x === 'number' ? item.position_x : 50;
                                const posY = typeof item.position_y === 'number' ? item.position_y : 50;
                                const itemScale = typeof item.scale === 'number' ? item.scale : 1;
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
                </div>
            </div>

            {/* Right Overlay Actions - Always visible */}
            <div className="absolute top-3 right-3 flex flex-col items-center gap-2 z-20">
                {onToggleFavorite && !isLocked && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(outfit, outfit.favorite ?? false);
                        }}
                        className="p-1 focus:outline-none"
                    >
                        <Heart className={`w-5 h-5 transition-colors duration-300 ${outfit.favorite ? 'fill-[var(--brand-pink)] text-[var(--brand-pink)]' : 'fill-[#d1d5db] text-[#d1d5db] hover:fill-gray-400 hover:text-gray-400'}`} />
                    </button>
                )}
                {!outfit.is_public && (
                    <div className="p-1" title="Outfit privado">
                        <Lock className="w-5 h-5 text-[#d1d5db]" />
                    </div>
                )}
            </div>

            {/* Actions Overlay (Visible on Hover/Focus) */}
            {
                !isLocked && (
                    <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex-col sm:flex-row">
                        {onToggleVisibility && !(outfit.posts && outfit.posts.length > 0) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleVisibility(outfit);
                                }}
                                className="p-2 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full shadow-sm hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] transition-colors"
                                title={outfit.is_public ? "Hacer privado" : "Hacer público"}
                            >
                                {outfit.is_public ? (
                                    <Globe className="w-4 h-4 text-[var(--brand-pink)]" />
                                ) : (
                                    <Lock className="w-4 h-4 text-[var(--foreground-secondary)]" />
                                )}
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(outfit);
                                }}
                                className="p-2 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full shadow-sm hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                                title="Editar"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {onShare && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShare(outfit);
                                }}
                                className="p-2 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full shadow-sm hover:bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] transition-colors"
                                title="Crear Publicación"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(outfit.id);
                                }}
                                className="p-2 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full shadow-sm hover:bg-red-500/10 text-red-500 transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )
            }

            {/* Shop indicator */}
            {
                hasShopLinks && !isLocked && (
                    <div className="absolute top-2 right-2 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full p-1.5 shadow-sm">
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
                                <Lock className="w-5 h-5 text-pink-500" />
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
