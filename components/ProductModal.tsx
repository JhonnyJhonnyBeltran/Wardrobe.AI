'use client';

/**
 * 👗 ProductModal - Smooth animated modal for product details
 * Shows product image, buy link, source, and price
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShoppingBag, Shirt, Tag, Palette, Ruler, Layers, CalendarDays, Sparkles, Heart, Edit2, Trash2 } from 'lucide-react';
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
    const storeLink = displayItem.buyLink || displayItem.sourceUrl;

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
                        className="fixed inset-0 bg-black/60 shadow-2xl backdrop-blur-sm z-[80]"
                    />

                    {/* Modal Content Wrapper - Standardized Bottom Offset */}
                    <motion.div
                        key="product-wrapper"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ 
                            type: 'spring',
                            damping: 28,
                            stiffness: 300,
                        }}
                        className="fixed inset-0 z-[80] flex items-end md:items-center justify-center px-4 pb-[85px] md:pb-0 md:p-4 pointer-events-none"
                    >
                        {/* Modal Content */}
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md max-h-[calc(100vh-130px)] md:max-h-[85vh] bg-[var(--background)] rounded-3xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-[var(--border-color)] pointer-events-auto"
                        >
                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-black/30 dark:hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </motion.button>

                            {/* Product Image */}
                            <div className="relative aspect-[4/3] sm:aspect-square max-h-[40vh] bg-white overflow-hidden flex-shrink-0">
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

                                {/* Trending Badge */}
                                {displayItem.trending && (
                                    <motion.div
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                        className="absolute top-4 left-4 px-3 py-1.5 bg-[var(--brand-pink)] rounded-full flex items-center gap-1.5 shadow-lg"
                                    >
                                        <Sparkles className="w-4 h-4 text-white" />
                                        <span className="text-white text-xs font-bold leading-none">Tendencia</span>
                                    </motion.div>
                                )}

                                {/* Price Badge */}
                                {displayItem.price && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.25, type: 'spring' }}
                                        className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-lg"
                                    >
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{displayItem.price}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Product Info */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 overflow-y-auto flex-1 custom-scrollbar"
                            >
                                {/* Brand & Name */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-pink-500 mb-1">{displayItem.brand}</p>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayItem.name}</h3>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {/* Type */}
                                    <div className="flex items-center gap-2 p-3 bg-[var(--background-secondary)] rounded-xl">
                                        <Shirt className="w-4 h-4 text-[var(--brand-pink)]" />
                                        <div>
                                            <p className="text-xs text-[var(--foreground-tertiary)]">Tipo</p>
                                            <p className="text-sm font-medium text-[var(--foreground)] capitalize">{displayItem.type}</p>
                                        </div>
                                    </div>

                                    {/* Brand */}
                                    {(displayItem.brand || displayItem.source) && (displayItem.brand !== 'Unknown' && displayItem.source !== 'Unknown') && (
                                        <div className="flex items-center gap-2 p-3 bg-[var(--background-secondary)] rounded-xl">
                                            <Tag className="w-4 h-4 text-[var(--brand-pink)]" />
                                            <div>
                                                <p className="text-xs text-[var(--foreground-tertiary)]">Marca</p>
                                                <p className="text-sm font-medium text-[var(--foreground)]">{displayItem.brand || displayItem.source}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Color */}
                                    {displayItem.color && (
                                        <div className="flex items-center gap-2 p-3 bg-[var(--background-secondary)] rounded-xl">
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-[var(--border-color)] shadow-sm flex-shrink-0"
                                                style={{ backgroundColor: displayItem.colorHex || '#ccc' }}
                                            />
                                            <div>
                                                <p className="text-xs text-[var(--foreground-tertiary)]">Color</p>
                                                <p className="text-sm font-medium text-[var(--foreground)] capitalize">{displayItem.color}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Size */}
                                    {(displayItem as any).size && (
                                        <div className="flex items-center gap-2 p-3 bg-[var(--background-secondary)] rounded-xl">
                                            <Ruler className="w-4 h-4 text-[var(--brand-pink)]" />
                                            <div>
                                                <p className="text-xs text-[var(--foreground-tertiary)]">Talla</p>
                                                <p className="text-sm font-medium text-[var(--foreground)]">{(displayItem as any).size}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fabric */}
                                    {(displayItem as any).fabric && (
                                        <div className="flex items-center gap-2 p-3 bg-[var(--background-secondary)] rounded-xl">
                                            <Layers className="w-4 h-4 text-[var(--brand-pink)]" />
                                            <div>
                                                <p className="text-xs text-[var(--foreground-tertiary)]">Tejido</p>
                                                <p className="text-sm font-medium text-[var(--foreground)] capitalize">{(displayItem as any).fabric}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Season */}
                                    {(displayItem as any).season && (displayItem as any).season.length > 0 && (
                                        <div className="flex items-center gap-2 p-3 bg-[var(--background-secondary)] rounded-xl">
                                            <CalendarDays className="w-4 h-4 text-[var(--brand-pink)]" />
                                            <div>
                                                <p className="text-xs text-[var(--foreground-tertiary)]">Temporada</p>
                                                <p className="text-sm font-medium text-[var(--foreground)] capitalize">
                                                    {Array.isArray((displayItem as any).season) ? (displayItem as any).season.join(', ') : (displayItem as any).season}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    {/* View in Store Button - Only show if storeLink exists */}
                                    {storeLink && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleViewInStore}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-medium transition-all duration-300 bg-[var(--brand-pink)] text-white shadow-lg hover:shadow-xl hover:shadow-pink-500/25"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            <span>Ver en tienda</span>
                                        </motion.button>
                                    )}

                                    <div className="flex gap-3 items-center">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => onFavoriteToggle?.(displayItem.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 border min-w-[100px] h-[52px] ${isFavorite
                                                ? 'bg-[var(--brand-pink)] text-white border-transparent shadow-md shadow-[var(--brand-pink)]/20'
                                                : 'bg-pink-50 dark:bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border-pink-200 dark:border-[var(--brand-pink)]/20 hover:bg-pink-100 dark:hover:bg-[var(--brand-pink)]/20'
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-white text-white' : 'text-[var(--brand-pink)]'}`} />
                                            <span className="min-w-[50px] text-center">{isFavorite ? 'Liked' : 'Like'}</span>
                                        </motion.button>

                                        {onEdit && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    if (onClose) onClose();
                                                    setTimeout(() => onEdit(displayItem.id), 100);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-all duration-300 bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border-color)] hover:bg-[var(--foreground)] hover:text-[var(--background)] min-w-[90px] h-[52px]"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                                <span className="text-center">Editar</span>
                                            </motion.button>
                                        )}

                                        {onDelete && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onDelete(displayItem.id)}
                                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-medium transition-all duration-300 border-2 border-transparent bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 h-[56px]"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

