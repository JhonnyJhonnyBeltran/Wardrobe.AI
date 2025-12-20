'use client';

/**
 * OutfitCard - Display outfit with items preview and freemium lock overlay
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { MockOutfit } from '@/data/mockOutfits';

interface OutfitCardProps {
    outfit: MockOutfit;
    isLocked?: boolean;
    onClick?: () => void;
    index?: number;
}

export default function OutfitCard({ outfit, isLocked = false, onClick, index = 0 }: OutfitCardProps) {
    const getStyleEmoji = (style: string) => {
        const styleEmojis: Record<string, string> = {
            'Casual Chic': '☕',
            'Business Elegante': '💼',
            'Date Night': '💕',
            'Sporty Chic': '⚡',
            'Boho Weekend': '🌸',
            'Party Ready': '🎉',
            'Minimal Everyday': '⚪',
            'Winter Cozy': '❄️',
        };
        return styleEmojis[style] || '✨';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={!isLocked ? { y: -4, transition: { duration: 0.2 } } : {}}
            onClick={!isLocked ? onClick : undefined}
            className={`relative overflow-hidden rounded-3xl bg-white shadow-md cursor-pointer ${isLocked ? 'cursor-not-allowed' : 'hover:shadow-lg'
                }`}
        >
            {/* Outfit Preview */}
            <div
                className={`aspect-square bg-gradient-to-br from-pink-50 to-violet-50 p-4 flex flex-col items-center justify-center ${isLocked ? 'blur-sm' : ''
                    }`}
            >
                {/* Style Emoji */}
                <div className="text-5xl mb-3">{getStyleEmoji(outfit.style)}</div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[120px]">
                    {outfit.items.slice(0, 4).map((item, i) => (
                        <div
                            key={i}
                            className="aspect-square rounded-xl bg-white/60 flex items-center justify-center text-xl shadow-sm"
                        >
                            {item.imageEmoji}
                        </div>
                    ))}
                </div>
            </div>

            {/* Locked Overlay */}
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/30 to-transparent"
                >
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center mb-3 mx-auto shadow-lg"
                        >
                            <Lock className="w-6 h-6 text-pink-500" />
                        </motion.div>
                        <p className="text-white font-medium text-sm">Premium Only</p>
                        <p className="text-white/70 text-xs mt-1">Desbloquea tu historial</p>
                    </div>
                </motion.div>
            )}

            {/* Info Section */}
            <div className={`p-4 ${isLocked ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{outfit.style}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{outfit.date}</p>
                    </div>
                    <div className="flex -space-x-1">
                        {outfit.items.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs border-2 border-white"
                            >
                                {item.imageEmoji}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
