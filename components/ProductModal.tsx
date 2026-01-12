'use client';

/**
 * 👗 ProductModal - Smooth animated modal for product details
 * Shows product image, buy link, source, and price
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShoppingBag, Tag, Store, Sparkles, Heart, Edit2 } from 'lucide-react';
import { OutfitItem } from '@/lib/fashion/outfitGenerator';

interface ProductModalProps {
    item: OutfitItem | null;
    isOpen: boolean;
    onClose: () => void;
    isFavorite?: boolean;
    onFavoriteToggle?: (id: string) => void;
    onEdit?: (id: string) => void;
}

export default function ProductModal({ item, isOpen, onClose, isFavorite = false, onFavoriteToggle, onEdit }: ProductModalProps) {
    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 300,
                                duration: 0.4
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
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
                            <div className="relative aspect-[4/3] sm:aspect-square max-h-[40vh] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                    <motion.img
                                        initial={{ scale: 1.1, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center"
                                        style={{ backgroundColor: item.colorHex || '#f0f0f0' }}
                                    >
                                        <ShoppingBag className="w-20 h-20 text-white/50" />
                                    </div>
                                )}

                                {/* Trending Badge */}
                                {item.trending && (
                                    <motion.div
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                        className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full flex items-center gap-1.5 shadow-lg"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                        <span className="text-xs font-semibold text-white">Trending</span>
                                    </motion.div>
                                )}

                                {/* Price Badge */}
                                {item.price && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.25, type: 'spring' }}
                                        className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-lg"
                                    >
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{item.price}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Product Info */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 overflow-y-auto flex-1"
                            >
                                {/* Brand & Name */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-pink-500 mb-1">{item.brand}</p>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {/* Type */}
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.type}</p>
                                        </div>
                                    </div>

                                    {/* Source */}
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <Store className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Fuente</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.source}</p>
                                        </div>
                                    </div>

                                    {/* Color */}
                                    {item.color && (
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: item.colorHex || '#ccc' }}
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.color}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Match Score */}
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <Sparkles className="w-4 h-4 text-pink-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Match</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(item.matchScore)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 items-center">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onFavoriteToggle?.(item.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-medium transition-all duration-300 border-2 min-w-[130px] h-[56px] ${isFavorite
                                            ? 'bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 text-pink-500 border-pink-500/50'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                                        <span className="min-w-[60px] text-center">{isFavorite ? 'Favorito' : 'Guardar'}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onEdit?.(item.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-medium transition-all duration-300 border-2 border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 min-w-[130px] h-[56px]"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                        <span className="min-w-[60px] text-center">Editar</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
