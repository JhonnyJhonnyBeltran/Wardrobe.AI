'use client';

import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClothingItem } from '@/types/clothing';
import { X } from 'lucide-react';

interface OutfitCanvasProps {
    selections: Record<string, ClothingItem[]>; // Changed to arrays
    onRemoveItem?: (slotId: string, itemId: string) => void; // Need itemId to remove specific item
    isMobile?: boolean;
}

// Configuration based on user's "Blueprint"
const LAYOUT_CONFIG: Record<string, { x: string; y: string; scale: number; zIndex: number; rotateRange: [number, number] }> = {
    headwear: { x: '65%', y: '5%', scale: 0.8, zIndex: 40, rotateRange: [-5, 5] },
    top: { x: '15%', y: '10%', scale: 1.0, zIndex: 20, rotateRange: [-2, 2] },
    layer: { x: '10%', y: '8%', scale: 1.05, zIndex: 30, rotateRange: [-2, 2] }, // Slightly offset from top, higher Z
    bottom: { x: '25%', y: '50%', scale: 0.9, zIndex: 10, rotateRange: [-3, 3] },
    shoes: { x: '60%', y: '75%', scale: 0.7, zIndex: 5, rotateRange: [-10, 10] }, // "Base" but offset
    accessories: { x: '70%', y: '45%', scale: 0.5, zIndex: 50, rotateRange: [0, 15] },
};

export function OutfitCanvas({ selections, onRemoveItem, isMobile = false }: OutfitCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Helper to get random rotation within range (stable per render until unmount/change)
    const getRandomRotation = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-[var(--background-secondary)]/30 overflow-hidden rounded-[32px] shadow-inner"
            style={{
                aspectRatio: isMobile ? '9/16' : '3/4'
            }}
        >
            {/* Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Content - Render all items from all slots */}
            {Object.entries(selections).map(([slotId, items]) => {
                if (!items || items.length === 0) return null;

                const config = LAYOUT_CONFIG[slotId] || { x: '50%', y: '50%', scale: 0.5, zIndex: 1, rotateRange: [0, 0] };

                // Render each item in this slot with slight offset if multiple
                return items.map((item, index) => {
                    // Generate a random rotation for this render
                    const rotation = getRandomRotation(config.rotateRange[0], config.rotateRange[1]);

                    // Offset multiple items slightly
                    const offsetX = index * 5; // 5% offset for each additional item
                    const offsetY = index * 3;

                    return (
                        <motion.div
                            key={slotId}
                            drag
                            dragConstraints={containerRef}
                            dragMomentum={false}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                rotate: rotation
                            }}
                            className="absolute cursor-move touch-none group"
                            style={{
                                left: config.x,
                                top: config.y,
                                width: isMobile ? '45%' : '40%', // Base width relative to container
                                zIndex: config.zIndex,
                                // originX: 0.5,
                                // originY: 0.5
                            }}
                        >
                            <div
                                className="relative w-full"
                                style={{
                                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' // Deep soft shadow as requested
                                }}
                            >
                                {/* The Image */}
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-auto object-contain pointer-events-none select-none"
                                    style={{
                                        transform: `scale(${config.scale})`
                                    }}
                                />

                                {/* Remove Button (Visible on Hover/Touch) */}
                                {onRemoveItem && (
                                    <button
                                        onPointerDown={(e) => { e.stopPropagation(); onRemoveItem(slotId, item.id); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                });
            })}

            {/* Empty State Hint */}
            {Object.values(selections).every(items => items.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground-tertiary)] pointer-events-none">
                    <p className="text-sm font-medium">Arrastra prendas aquí</p>
                </div>
            )}
        </div>
    );
}
