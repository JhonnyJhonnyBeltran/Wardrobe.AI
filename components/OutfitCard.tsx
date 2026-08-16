'use client';

/**
 * OutfitCard - Display outfit with item images and shop links
 * Updated to use real Outfit type from DB
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Briefcase, Heart, Zap, Flower2, PartyPopper, Circle, Snowflake, ShoppingBag, Layers, Globe } from 'lucide-react';
import type { Outfit } from '@/types/outfit';

interface OutfitCardProps {
    outfit: Outfit;
    isLocked?: boolean;
    onClick?: () => void;
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

import { Edit2, Trash2, Share2, Send } from 'lucide-react';

export default function OutfitCard({ outfit, isLocked = false, onClick, onEdit, onDelete, onShare, onToggleFavorite, onToggleVisibility, index = 0 }: OutfitCardProps) {
    const styleKey = outfit.occasion || outfit.style || 'everyday';
    const config = styleConfig[styleKey] || { icon: <Layers className="w-3 h-3" />, gradient: 'from-pink-400 to-rose-500' };

    // Check if any item has images - handle both imageUrl and image_url field names
    const outfitAny = outfit as any;
    const hasImages = outfitAny.items?.some((item: any) => item.imageUrl || item.image_url) ?? false;
    const hasShopLinks = outfitAny.items?.some((item: any) => item.sourceUrl || item.buyLink) ?? false;

    // Get the outfit preview image - handle both field names
    const outfitPreviewImage = outfitAny.imageUrl || outfitAny.image_url;

    // Get item image - handle both field names
    const getItemImage = (item: any) => item.imageUrl || item.image_url;

    // Date formatting
    const dateDisplay = outfit.date || new Date(outfit.createdAt).toLocaleDateString();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={!isLocked ? {
                scale: 1.03,
                transition: { duration: 0.2 }
            } : {}}
            className={`relative overflow-hidden rounded-[20px] bg-white dark:bg-gray-900 shadow-sm border border-[var(--border-color)] ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
        >
            {/* Clickable Area */}
            <div onClick={!isLocked ? onClick : undefined} className="cursor-pointer">
                {/* Outfit Preview */}
                <div
                    className={`relative w-full aspect-[4/5] bg-[#f8f9fa] dark:bg-[#111] overflow-hidden ${isLocked ? 'blur-sm' : ''
                        }`}
                >
                    {outfitPreviewImage ? (
                        <img
                            src={outfitPreviewImage}
                            alt={outfit.name}
                            className="w-full h-full object-cover dark:mix-blend-normal"
                            loading="lazy"
                        />
                    ) : (
                        /* Items Grid - With Images (Fallback) */
                        <div className="grid grid-cols-2 gap-[1px] flex-1 bg-gray-200 dark:bg-gray-700">
                            {(outfit.items || []).slice(0, 4).map((item: any, i: number) => (
                                <motion.div
                                    key={item.id || i}
                                    className="relative bg-white dark:bg-[#222] aspect-square overflow-hidden"
                                >
                                    {getItemImage(item) ? (
                                        <img
                                            src={getItemImage(item)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                // Fallback to color div
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                if (target.parentElement) {
                                                    target.parentElement.style.backgroundColor = item.color_hex || item.color || '#ccc';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full"
                                            style={{ backgroundColor: item.color_hex || item.color || '#ccc' }}
                                        />
                                    )}
                                </motion.div>
                            ))}
                            {/* Placeholder if less than 4 items */}
                            {Array.from({ length: Math.max(0, 4 - (outfit.items?.length || 0)) }).map((_, i) => (
                                <div key={`placeholder-${i}`} className="bg-gray-100 dark:bg-gray-800 rounded-xl opacity-50 aspect-square" />
                            ))}
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
                        <Lock className="w-4 h-4 text-white/80 drop-shadow-md" />
                    </div>
                )}
            </div>


            {/* Actions Overlay (Visible on Hover/Focus) */}
            {
                !isLocked && (
                    <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex-col sm:flex-row">
                        {onToggleVisibility && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleVisibility(outfit);
                                }}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                title={outfit.is_public ? "Hacer privado" : "Hacer público"}
                            >
                                {outfit.is_public ? (
                                    <Globe className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <Lock className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(outfit);
                                }}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
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
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition-colors"
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
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
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
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                        <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
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
        </motion.div >
    );
}
