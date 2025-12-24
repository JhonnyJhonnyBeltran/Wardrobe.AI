'use client';

/**
 * OutfitCard - Display outfit with item images and shop links
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Briefcase, Heart, Zap, Flower2, PartyPopper, Circle, Snowflake, ShoppingBag } from 'lucide-react';
import { MockOutfit } from '@/data/mockOutfits';

interface OutfitCardProps {
    outfit: MockOutfit;
    isLocked?: boolean;
    onClick?: () => void;
    index?: number;
}

const styleConfig: Record<string, { icon: React.ReactNode; gradient: string }> = {
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

export default function OutfitCard({ outfit, isLocked = false, onClick, index = 0 }: OutfitCardProps) {
    const config = styleConfig[outfit.style] || { icon: <Sparkles className="w-3 h-3" />, gradient: 'from-pink-400 to-rose-500' };

    // Check if any item has images
    const hasImages = outfit.items.some(item => item.imageUrl);
    const hasShopLinks = outfit.items.some(item => item.buyLink);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={!isLocked ? { y: -6, transition: { duration: 0.2 } } : {}}
            onClick={!isLocked ? onClick : undefined}
            className={`relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-950/50 cursor-pointer ${isLocked ? 'cursor-not-allowed' : 'hover:shadow-xl dark:hover:shadow-gray-950/80'
                }`}
        >
            {/* Outfit Preview */}
            <div
                className={`aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-3 flex flex-col ${isLocked ? 'blur-sm' : ''
                    }`}
            >
                {/* Items Grid - With Images */}
                <div className="grid grid-cols-2 gap-2 flex-1">
                    {outfit.items.slice(0, 4).map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="relative rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800"
                        >
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        // Fallback to color div
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.style.backgroundColor = item.color;
                                    }}
                                />
                            ) : (
                                <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: item.color }}
                                />
                            )}
                            {/* Price tag on hover */}
                            {item.price && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-white font-medium">{item.price}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Shop indicator */}
            {hasShopLinks && !isLocked && (
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                </div>
            )}

            {/* Locked Overlay */}
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/40 to-transparent"
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
            )}

            {/* Info Section */}
            <div className={`p-3 ${isLocked ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm`}>
                                <span className="w-3 h-3 flex items-center justify-center">{config.icon}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{outfit.style}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{outfit.date}</p>
                            {hasShopLinks && (
                                <span className="text-[10px] text-pink-600 dark:text-pink-400 font-medium bg-pink-50 dark:bg-pink-950/50 px-1.5 py-0.5 rounded-full">
                                    Shop
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Brand logos */}
                    <div className="flex -space-x-1">
                        {outfit.items.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm overflow-hidden"
                                style={{ backgroundColor: item.color }}
                                title={item.brand}
                            >
                                {item.imageUrl && (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.brand}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
