'use client';

/**
 * ItemDetailModal - Shows outfit/item details with brand and store info
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Heart, Share2 } from 'lucide-react';
import { MockOutfit } from '@/data/mockOutfits';

interface ItemDetailModalProps {
    outfit: MockOutfit | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ItemDetailModal({ outfit, isOpen, onClose }: ItemDetailModalProps) {
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-white md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:rounded-3xl md:max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{outfit.style}</h2>
                                <p className="text-sm text-gray-500">{outfit.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <Heart className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-4 space-y-4">
                            {/* AI Description */}
                            <div className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-2xl p-4">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    ✨ {outfit.description}
                                </p>
                            </div>

                            {/* Items List */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">Prendas del look</h3>
                                {outfit.items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                                    >
                                        {/* Item Emoji */}
                                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                                            {item.imageEmoji}
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.brand}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-200 text-xs text-gray-600 capitalize">
                                                {item.type === 'top' && '👔 Top'}
                                                {item.type === 'bottom' && '👖 Bottom'}
                                                {item.type === 'shoes' && '👠 Shoes'}
                                                {item.type === 'accessory' && '💎 Accessory'}
                                            </span>
                                        </div>

                                        {/* External Link */}
                                        <a
                                            href={item.ref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-4 h-4 text-pink-500" />
                                        </a>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-full gradient-primary text-white font-medium text-sm glow-effect"
                            >
                                Recrear este look ✨
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
