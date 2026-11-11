'use client';

/**
 * 👗 ProductModal - Smooth animated modal for product details
 * Shows product image, buy link, source, and price
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShoppingBag, Shirt, Tag, Palette, Ruler, Layers, CalendarDays, Heart, Edit2, Trash2 } from 'lucide-react';
import { OutfitItem } from '@/lib/fashion/outfitGenerator';
import { useBodyScrollLock } from '@/lib/hooks';

// Extended OutfitItem to support sourceUrl from scraped items
interface ExtendedOutfitItem extends OutfitItem {
    sourceUrl?: string;
}

interface ProductModalProps {
    item: ExtendedOutfitItem | null;
    isOpen: boolean;
    onClose: () => void;
    isFavorite?: boolean;
    onFavoriteToggle?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
    top: 'Camiseta / Top',
    shirt: 'Camisa',
    tshirt: 'Camiseta',
    't-shirt': 'Camiseta',
    sweater: 'Jersey',
    jersey: 'Jersey',
    hoodie: 'Sudadera',
    sweatshirt: 'Sudadera',
    bottom: 'Pantalón',
    pants: 'Pantalón',
    jeans: 'Vaqueros',
    shorts: 'Shorts',
    skirt: 'Falda',
    dress: 'Vestido',
    jacket: 'Chaqueta / Cazadora',
    outerwear: 'Abrigo / Chaqueta',
    coat: 'Abrigo',
    shoes: 'Calzado / Zapatillas',
    sneakers: 'Zapatillas',
    boots: 'Botas',
    sandals: 'Sandalias',
    accessory: 'Accesorio',
    accessories: 'Accesorios',
    headwear: 'Gorra / Sombrero',
    hat: 'Sombrero',
    cap: 'Gorra',
    bag: 'Bolso / Mochila',
    backpack: 'Mochila',
    jewelry: 'Joyería',
    sunglasses: 'Gafas de sol',
    other: 'Otro'
};

export const formatGarmentType = (val?: string): string => {
    if (!val) return 'Prenda';
    const key = val.trim().toLowerCase();
    return CATEGORY_NAMES[key] || val.charAt(0).toUpperCase() + val.slice(1);
};

export default function ProductModal({ item, isOpen, onClose, isFavorite = false, onFavoriteToggle, onEdit, onDelete }: ProductModalProps) {
    // Cache last valid item so content persists during exit animation
    const lastItemRef = useRef(item);
    useEffect(() => {
        if (item) lastItemRef.current = item;
    }, [item]);
    const displayItem = item || lastItemRef.current;

    useBodyScrollLock(isOpen);

    if (!displayItem) return null;

    // Get the store link from either buyLink or sourceUrl
    const storeLink = (displayItem as any).affiliate_url || (displayItem as any).affiliateUrl || displayItem.buyLink || displayItem.sourceUrl;
    const rawType = displayItem.type || (displayItem as any).category || (displayItem as any).clothing_type || '';
    const displayType = formatGarmentType(rawType);

    const handleViewInStore = () => {
        if (storeLink) {
            window.open(storeLink, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="product-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 shadow-2xl backdrop-blur-sm z-[6030]"
                    />

                    {/* Modal Content Wrapper - Standardized Bottom Offset matching OutfitDetailModal */}
                    <motion.div
                        key="product-wrapper"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ 
                            type: 'spring',
                            damping: 28,
                            stiffness: 340,
                        }}
                        className="fixed inset-0 z-[6040] flex items-end md:items-center justify-center px-3 sm:px-6 pb-[calc(var(--tabbar-height)+8px)] md:pb-0 pointer-events-none"
                    >
                        {/* Modal Content */}
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md max-h-[calc(100dvh-var(--tabbar-height)-16px)] md:max-h-[85vh] bg-[var(--background)] rounded-[32px] md:rounded-[36px] overflow-hidden shadow-2xl flex flex-col border border-[var(--border-color)] pointer-events-auto"
                        >
                            {/* Top Right Controls (Favorite + Close matching OutfitDetailModal) */}
                            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30 flex items-center gap-2">
                                {onFavoriteToggle && (
                                    <button
                                        type="button"
                                        onClick={() => onFavoriteToggle(displayItem.id)}
                                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                        className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/10 dark:border-white/15 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-[var(--brand-pink,#FF66C4)] transition-all shadow-xs cursor-pointer active:scale-90"
                                    >
                                        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[var(--brand-pink,#FF66C4)] text-[var(--brand-pink,#FF66C4)]' : 'fill-none'}`} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Cerrar"
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-black/10 dark:border-white/15 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-xs cursor-pointer active:scale-90"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Product Image */}
                            <div className="relative aspect-[4/3] sm:aspect-square max-h-[40vh] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-6 sm:p-8">
                                {displayItem.imageUrl ? (
                                    <motion.img
                                        initial={{ scale: 1.1, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        src={displayItem.imageUrl}
                                        alt={displayItem.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                             const target = e.target as HTMLImageElement;
                                             target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center"
                                        style={{ backgroundColor: displayItem.colorHex || '#f0f0f0' }}
                                    >
                                        <ShoppingBag className="w-20 h-20 text-white/50" />
                                    </div>
                                )}

                                {/* Price Badge */}
                                {displayItem.price && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, type: 'spring' }}
                                        className="absolute bottom-4 right-4 px-4 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-[var(--shadow-card)] border border-black/[0.06]"
                                    >
                                        <span className="text-base font-bold text-gray-900 dark:text-white">{displayItem.price}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--background)] border-t border-[var(--border-color)]/60 flex flex-col gap-4">
                                {/* Brand & Name */}
                                <div className="flex flex-col gap-0.5">
                                    {(displayItem.brand || displayItem.source) && displayItem.brand !== 'Unknown' && displayItem.source !== 'Unknown' && (
                                        <p data-no-translate="true" className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-pink,#FF66C4)]">
                                            {displayItem.brand || displayItem.source}
                                        </p>
                                    )}
                                    <h3 data-no-translate="true" className="kz-title text-[var(--foreground)] leading-tight">{displayItem.name}</h3>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    {/* Type */}
                                    <div className="flex items-center gap-2.5 p-3 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/60">
                                        <Shirt className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                                        <div className="min-w-0">
                                            <p className="kz-caption text-[var(--foreground-tertiary)]">Tipo</p>
                                            <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] capitalize truncate">{displayType}</p>
                                        </div>
                                    </div>

                                    {/* Color */}
                                    {displayItem.color && (
                                        <div className="flex items-center gap-2.5 p-3 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/60">
                                            <div
                                                className="w-4 h-4 rounded-full border border-black/15 dark:border-white/20 shadow-xs shrink-0"
                                                style={{ backgroundColor: displayItem.colorHex || '#ccc' }}
                                            />
                                            <div className="min-w-0">
                                                <p className="kz-caption text-[var(--foreground-tertiary)]">Color</p>
                                                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] capitalize truncate">{displayItem.color}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Size */}
                                    {(displayItem as any).size && (
                                        <div className="flex items-center gap-2.5 p-3 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/60">
                                            <Ruler className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                                            <div className="min-w-0">
                                                <p className="kz-caption text-[var(--foreground-tertiary)]">Talla</p>
                                                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">{(displayItem as any).size}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fabric */}
                                    {(displayItem as any).fabric && (
                                        <div className="flex items-center gap-2.5 p-3 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/60">
                                            <Layers className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                                            <div className="min-w-0">
                                                <p className="kz-caption text-[var(--foreground-tertiary)]">Tejido</p>
                                                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] capitalize truncate">{(displayItem as any).fabric}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Season */}
                                    {(displayItem as any).season && (displayItem as any).season.length > 0 && (
                                        <div className="flex items-center gap-2.5 p-3 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)]/60">
                                            <CalendarDays className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
                                            <div className="min-w-0">
                                                <p className="kz-caption text-[var(--foreground-tertiary)]">Temporada</p>
                                                <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] capitalize truncate">
                                                    {Array.isArray((displayItem as any).season) ? (displayItem as any).season.join(', ') : (displayItem as any).season}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons matching OutfitDetailModal */}
                                {(onEdit || storeLink || onDelete) && (
                                    <div className="flex flex-col gap-2.5 pt-1">
                                        <div className="flex items-center gap-2.5">
                                            {onEdit && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        if (onClose) onClose();
                                                        setTimeout(() => onEdit(displayItem.id), 100);
                                                    }}
                                                    className="flex-1 h-11 px-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                                                >
                                                    <Edit2 className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">Editar</span>
                                                </button>
                                            )}

                                            {storeLink && (
                                                <button
                                                    type="button"
                                                    onClick={handleViewInStore}
                                                    className="flex-1 h-11 px-4 rounded-2xl bg-[var(--brand-pink,#FF66C4)]/12 dark:bg-[var(--brand-pink,#FF66C4)]/20 text-[var(--brand-pink,#FF66C4)] border border-[var(--brand-pink,#FF66C4)]/25 dark:border-[var(--brand-pink,#FF66C4)]/35 hover:bg-[var(--brand-pink,#FF66C4)]/20 dark:hover:bg-[var(--brand-pink,#FF66C4)]/30 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                                                >
                                                    <ExternalLink className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">Ver en tienda</span>
                                                </button>
                                            )}

                                            {onDelete && !storeLink && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(displayItem.id)}
                                                    className="h-11 px-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-500 border border-red-500/20 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                                                    title="Eliminar"
                                                    aria-label="Eliminar prenda"
                                                >
                                                    <Trash2 className="w-4 h-4 shrink-0" />
                                                </button>
                                            )}
                                        </div>

                                        {onDelete && storeLink && (
                                            <button
                                                type="button"
                                                onClick={() => onDelete(displayItem.id)}
                                                className="w-full h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 border border-red-500/20 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                                <span>Eliminar prenda</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

