'use client';

/**
 * ItemDetailModal - Shows outfit/item details with images and shop links
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Heart, Share2, ShoppingBag, Shirt } from 'lucide-react';
import { MockOutfit } from '@/data/mockOutfits';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface ItemDetailModalProps {
    outfit: MockOutfit | null;
    isOpen: boolean;
    onClose: () => void;
}

const typeLabels: Record<string, string> = {
    top: 'Top',
    bottom: 'Bottom',
    shoes: 'Shoes',
    accessory: 'Accessory',
    outerwear: 'Outerwear',
    bag: 'Bag',
    dress: 'Dress',
};

export default function ItemDetailModal({ outfit, isOpen, onClose }: ItemDetailModalProps) {
    useBodyScrollLock(isOpen);

    if (!outfit) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[60] max-h-[90vh] overflow-hidden rounded-t-3xl bg-[var(--card-bg)] mb-16 md:mb-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:rounded-3xl md:max-h-[85vh] border border-[var(--border-color)]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--foreground)]">{outfit.style}</h2>
                                <p className="text-xs text-[var(--foreground-secondary)]">{outfit.date}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
                                >
                                    <Heart className="w-5 h-5 text-[var(--foreground-secondary)]" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
                                >
                                    <Share2 className="w-5 h-5 text-[var(--foreground-secondary)]" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
                                >
                                    <X className="w-5 h-5 text-[var(--foreground-secondary)]" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-4 space-y-4 max-h-[calc(85vh-120px)] hide-scrollbar">
                            {/* AI Description */}
                            <div className="bg-[var(--brand-pink)]/10 rounded-2xl p-4">
                                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                    {outfit.description}
                                </p>
                            </div>

                            {/* Items List with Images */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-[var(--brand-pink)]" />
                                    Prendas del Look
                                </h3>
                                {outfit.items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-all group border border-[var(--border-color)]"
                                    >
                                        {/* Item Image or Color Swatch */}
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                                            {(item as any).imageUrl ? (
                                                <img
                                                    src={(item as any).imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-0.5"
                                                    onError={(e) => {
                                                        // Fallback to color swatch if image fails
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`w-full h-full flex items-center justify-center ${(item as any).imageUrl ? 'hidden' : ''}`}
                                                style={{ backgroundColor: item.color }}
                                            >
                                                <Shirt className="w-6 h-6 text-white/50" />
                                            </div>
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[var(--foreground)] text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-[var(--foreground-secondary)]">{item.brand}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-xs text-[var(--foreground-secondary)] border border-[var(--border-color)]">
                                                    {typeLabels[item.type] || item.type}
                                                </span>
                                                {(item as any).price && (
                                                    <span className="text-xs font-semibold text-[var(--brand-pink)]">
                                                        {(item as any).price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Shop Link */}
                                        {(item as any).buyLink ? (
                                            <motion.a
                                                href={(item as any).buyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="flex items-center gap-1 px-3 py-2 rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white text-xs font-medium shadow-md hover:shadow-lg transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ShoppingBag className="w-3 h-3" />
                                                Comprar
                                            </motion.a>
                                        ) : (
                                            <motion.a
                                                href={item.ref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-full bg-[var(--card-bg)] text-[var(--foreground-secondary)] shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:shadow-md border border-[var(--border-color)]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-4 h-4 text-[var(--brand-pink)]" />
                                            </motion.a>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-full bg-[var(--brand-pink)] text-white font-medium text-sm glow-effect"
                            >
                                Recrear este look
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
