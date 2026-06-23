'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Briefcase, PartyPopper, Zap, Flower2, Snowflake, Circle, Layers, Sparkles, Trash2, Edit2, CalendarDays, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { Outfit } from '@/types/outfit';

interface OutfitDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    outfit: Outfit;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, currentStatus: boolean) => void;
    onItemClick?: (item: any) => void;
}

const styleConfig: Record<string, { icon: React.ReactNode; label: string }> = {
    'casual': { icon: <Circle className="w-4 h-4" />, label: 'Casual' },
    'formal': { icon: <Briefcase className="w-4 h-4" />, label: 'Formal' },
    'party': { icon: <PartyPopper className="w-4 h-4" />, label: 'Fiesta' },
    'sport': { icon: <Zap className="w-4 h-4" />, label: 'Deporte' },
    'date': { icon: <Heart className="w-4 h-4" />, label: 'Cita' },
    'business': { icon: <Briefcase className="w-4 h-4" />, label: 'Negocios' },
    'everyday': { icon: <Sparkles className="w-4 h-4" />, label: 'Diario' },
};

export function OutfitDetailModal({ isOpen, onClose, outfit, onDelete, onToggleFavorite, onItemClick }: OutfitDetailModalProps) {
    useBodyScrollLock(isOpen);

    if (!isOpen || !outfit) return null;

    const styleKey = outfit.occasion || outfit.style || 'everyday';
    const config = styleConfig[styleKey] || { icon: <Layers className="w-4 h-4" />, label: styleKey };

    // @ts-ignore
    const outfitPreviewImage = outfit.imageUrl || outfit.image_url;
    // @ts-ignore
    const items = outfit.items || outfit.outfit_items || [];

    const getItemImage = (item: any) => item.imageUrl || item.image_url || item.clothing_items?.image_url;
    const getItemName = (item: any) => item.name || item.clothing_items?.name;
    const getItemBrand = (item: any) => item.brand || item.clothing_items?.brand;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="outfit-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 shadow-2xl backdrop-blur-sm z-[5015]"
                    />

                    {/* Modal Content Wrapper - Standardized Bottom Offset */}
                    <div className="fixed inset-0 z-[5020] flex items-end md:items-center justify-center px-4 pb-[calc(var(--tabbar-height)+16px)] md:pb-0 md:p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="w-full max-h-[calc(100dvh-var(--tabbar-height)-48px)] md:max-h-[85vh] md:max-w-md bg-[var(--background)] rounded-3xl md:rounded-[32px] flex flex-col overflow-hidden shadow-2xl relative border border-[var(--border-color)] pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                    {/* Header Handles / Close */}
                    <div className="absolute top-0 inset-x-0 z-20 flex justify-center py-3 md:hidden">
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-colors hidden md:block"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="overflow-y-auto custom-scrollbar flex-1 pb-10">
                        {/* 1. Outfit Visual Header */}
                        <div className="relative w-full aspect-square md:aspect-[4/3] bg-gray-100 dark:bg-[#111]">
                            {outfitPreviewImage ? (
                                <Image
                                    src={outfitPreviewImage}
                                    alt={outfit.name}
                                    fill
                                    className="object-contain mix-blend-multiply dark:mix-blend-normal p-4"
                                />
                            ) : (
                                <div className="absolute inset-0 grid grid-cols-2 gap-1 p-4">
                                    {items.slice(0, 4).map((item: any, i: number) => (
                                        <div key={i} className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#222] shadow-sm">
                                            {getItemImage(item) ? (
                                                <Image src={getItemImage(item)} alt="Item" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: item.color || '#ccc' }}>👕</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* 2. Outfit Info */}
                        <div className="px-6 py-5 bg-[var(--background)]">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">{outfit.name}</h2>
                            
                            {/* Details Grid - Matching ProductModal style */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-2xl">
                                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                        {config.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Ocasión</p>
                                        <p className="text-sm font-bold text-[var(--foreground)] capitalize">{config.label}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-2xl">
                                    <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--foreground-tertiary)] uppercase font-bold tracking-wider">Prendas</p>
                                        <p className="text-sm font-bold text-[var(--foreground)]">{items.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Matching ProductModal style */}
                            <div className="flex gap-3 items-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onToggleFavorite?.(outfit.id, !!outfit.favorite)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 border h-[52px] ${outfit.favorite
                                        ? 'bg-[var(--brand-pink)] text-white border-transparent shadow-md shadow-[var(--brand-pink)]/20'
                                        : 'bg-pink-50 dark:bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border-pink-200 dark:border-[var(--brand-pink)]/20 hover:bg-pink-100 dark:hover:bg-[var(--brand-pink)]/20'
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 transition-all ${outfit.favorite ? 'fill-white text-white' : 'text-[var(--brand-pink)]'}`} />
                                    <span className="text-center">{outfit.favorite ? 'Liked' : 'Like'}</span>
                                </motion.button>

                                <Link
                                    href={`/create?outfitId=${outfit.id}`}
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border-color)] hover:bg-[var(--foreground)] hover:text-[var(--background)] h-[52px]"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                        <span className="text-center">Editar</span>
                                    </motion.button>
                                </Link>

                                {onDelete && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onDelete(outfit.id)}
                                        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-medium transition-all duration-300 border-2 border-transparent bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 h-[52px]"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* 3. Items Breakdown */}
                        <div className="px-6 mt-4">
                            <h3 className="font-bold text-lg text-[var(--foreground)] mb-4">Prendas de este look</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {items.map((item: any) => {
                                    // Handle DB relation 'clothing_items' or inline 'items'
                                    const clothing = item.clothing_items || item;
                                    const img = getItemImage(item);

                                    if (!clothing || (!img && !clothing.name)) return null;

                                    return onItemClick ? (
                                        <div
                                            key={clothing.id}
                                            className="block group cursor-pointer"
                                            onClick={() => onItemClick(clothing)}
                                        >
                                            <div className="aspect-square bg-[var(--background-secondary)] rounded-2xl overflow-hidden relative mb-2">
                                                {img ? (
                                                    <Image src={img} alt={getItemName(item) || 'Ropa'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: clothing.color || '#ccc' }}>👕</div>
                                                )}
                                            </div>
                                            <p className="text-[13px] font-bold text-[var(--foreground)] truncate px-1">{getItemName(item)}</p>
                                            <p className="text-[11px] text-[var(--foreground-secondary)] px-1">{getItemBrand(item) || 'Sin marca'}</p>
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/closet?item=${clothing.id}`}
                                            key={clothing.id}
                                            className="block group"
                                            onClick={onClose}
                                        >
                                            <div className="aspect-square bg-[var(--background-secondary)] rounded-2xl overflow-hidden relative mb-2">
                                                {img ? (
                                                    <Image src={img} alt={getItemName(item) || 'Ropa'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: clothing.color || '#ccc' }}>👕</div>
                                                )}
                                            </div>
                                            <p className="text-[13px] font-bold text-[var(--foreground)] truncate px-1">{getItemName(item)}</p>
                                            <p className="text-[11px] text-[var(--foreground-secondary)] px-1">{getItemBrand(item) || 'Sin marca'}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
