'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Briefcase, PartyPopper, Zap, Flower2, Snowflake, Circle, Layers, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { Outfit } from '@/types/outfit';

interface OutfitDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    outfit: Outfit;
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

export function OutfitDetailModal({ isOpen, onClose, outfit }: OutfitDetailModalProps) {
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
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="w-full h-[85vh] md:h-auto md:max-h-[90vh] md:max-w-md bg-[var(--background)] rounded-t-[32px] md:rounded-[32px] flex flex-col overflow-hidden shadow-2xl relative"
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

                            {/* Actions Overlay */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button className="p-3 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg hover:scale-105 transition-transform">
                                    <Heart className="w-5 h-5 text-[var(--foreground)]" />
                                </button>
                                <button className="p-3 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg hover:scale-105 transition-transform">
                                    <Share2 className="w-5 h-5 text-[var(--foreground)]" />
                                </button>
                            </div>
                        </div>

                        {/* 2. Outfit Info */}
                        <div className="px-6 py-5 bg-[var(--background)]">
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">{outfit.name}</h2>
                            <div className="flex items-center gap-2 mt-2 text-sm text-[var(--foreground-secondary)]">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--background-secondary)] rounded-full font-medium">
                                    {config.icon}
                                    <span className="capitalize">{config.label}</span>
                                </span>
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

                                    return (
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
        </AnimatePresence>
    );
}
