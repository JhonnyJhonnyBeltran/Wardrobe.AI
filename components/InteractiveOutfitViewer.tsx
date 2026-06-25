'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface InteractiveOutfitViewerProps {
    outfit: any;
    onItemClick?: (item: any) => void;
    className?: string;
}

export default function InteractiveOutfitViewer({ outfit, onItemClick, className = '' }: InteractiveOutfitViewerProps) {
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

    // Fallback if no outfit or items
    if (!outfit) return null;

    const items = outfit.outfit_items || outfit.items || [];
    
    // Check if we have valid layout data for at least one item
    // Some legacy outfits might not have position_x, position_y
    const hasLayoutData = items.some((item: any) => 
        item.position_x !== undefined && item.position_x !== null
    );

    // If we don't have layout data, use the static image fallback
    const staticImage = outfit.imageUrl || outfit.image_url;
    
    if (!hasLayoutData && staticImage) {
        return (
            <div className={`relative w-full h-full bg-[#f8f9fa] dark:bg-[#111] overflow-hidden ${className}`}>
                <Image
                    src={staticImage}
                    alt={outfit.name || 'Outfit'}
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        );
    }

    if (!hasLayoutData && !staticImage) {
        // Fallback grid
        return (
            <div className={`grid grid-cols-2 gap-1 bg-gray-200 dark:bg-gray-700 w-full h-full ${className}`}>
                {items.slice(0, 4).map((item: any, i: number) => {
                    const clothing = item.clothing_items || item;
                    const img = clothing.imageUrl || clothing.image_url;
                    return (
                        <div key={i} className="relative bg-white dark:bg-[#222] overflow-hidden aspect-square">
                            {img ? (
                                <Image src={img} alt="Item" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Interactive canvas rendering
    return (
        <div className={`relative w-full h-full bg-[#f8f9fa] dark:bg-[#111] overflow-hidden ${className}`}>
            {items.map((item: any, i: number) => {
                const clothing = item.clothing_items || item;
                const img = clothing.imageUrl || clothing.image_url;
                
                if (!img) return null;

                // Fallback coordinates if missing for some reason
                const x = item.position_x ?? 50;
                const y = item.position_y ?? 50;
                const scale = item.scale ?? 1;
                const rotation = item.rotation ?? 0;
                const zIndex = item.z_index ?? i;

                const isHovered = hoveredItemId === clothing.id;

                return (
                    <motion.div
                        key={clothing.id || i}
                        className="absolute cursor-pointer"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            x: '-50%',
                            y: '-50%',
                            zIndex: isHovered ? 999 : zIndex,
                        }}
                        initial={{ scale: scale, rotate: rotation }}
                        animate={{ 
                            scale: isHovered ? scale * 1.05 : scale,
                            rotate: rotation
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onHoverStart={() => setHoveredItemId(clothing.id)}
                        onHoverEnd={() => setHoveredItemId(null)}
                        onClick={() => onItemClick?.(clothing)}
                    >
                        {/* 
                          Sticker Effect:
                          We apply a drop-shadow. When hovered, the drop-shadow increases 
                          and we can add a white outline effect using drop-shadow multiple times 
                          or a filter.
                        */}
                        <div 
                            className="relative"
                            style={{
                                width: '150px', // Base size, scaled by transform
                                height: '200px',
                                filter: isHovered 
                                    ? 'drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 8px 12px rgba(0,0,0,0.3))' 
                                    : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                                transition: 'filter 0.2s ease-in-out'
                            }}
                        >
                            <Image
                                src={img}
                                alt={clothing.name || 'Prenda'}
                                fill
                                className="object-contain"
                                sizes="150px"
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
