'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface InteractiveOutfitViewerProps {
    outfit: any;
    onItemClick?: (item: any) => void;
    className?: string;
    isMobileSticker?: boolean;
    selectedItemId?: string;
    disableInteraction?: boolean;
}

const InteractiveOutfitViewer = ({ outfit, onItemClick, className = '', isMobileSticker = false, selectedItemId, disableInteraction = false }: InteractiveOutfitViewerProps) => {
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fallback if no outfit or items
    if (!outfit) return null;

    const items = outfit.items || outfit.outfit_items || [];
    
    // Check if we have valid layout data for at least one item
    // Some legacy outfits might not have position_x, position_y
    const hasLayoutData = items.some((item: any) => 
        item.position_x !== undefined && item.position_x !== null
    );

    // If we don't have layout data, use the static image fallback
    const staticImage = outfit.imageUrl || outfit.image_url;
    
    // Always use interactive viewer, if no positions, we will arrange them programmatically
    // to avoid them all stacking in the middle
    
    // Generate programmatic positions for items that lack them
    const itemsWithPositions = items.map((item: any, i: number) => {
        const clothingRaw = item.clothing_items || item.clothing_item || item;
        const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
        const img = clothing?.imageUrl || clothing?.image_url;
        
        let x = item.position_x;
        let y = item.position_y;
        
        // If they don't have layout data, spread them nicely
        if (x === undefined || x === null) {
            // Simple grid layout spread
            const cols = items.length > 2 ? 2 : 1;
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            x = (col + 1) * (100 / (cols + 1));
            y = (row + 1) * (100 / (Math.ceil(items.length / cols) + 1));
        }

        return {
            ...item,
            clothing,
            img,
            computedX: x,
            computedY: y,
            computedScale: item.scale ?? 1,
            computedRotation: item.rotation ?? 0,
            computedZIndex: item.layer_order ?? item.z_index ?? i
        };
    }).filter((item: any) => item.img);

    if (itemsWithPositions.length === 0 && staticImage) {
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

    // Interactive canvas rendering
    return (
        <div className={`relative w-full h-full bg-[#f8f9fa] dark:bg-[#111] overflow-hidden flex items-center justify-center ${className}`}>
            {itemsWithPositions.map((item: any, i: number) => {
                const isHovered = hoveredItemId === item.clothing.id;
                // On mobile, or desktop, we want the items to scale relative to the container.
                // 35% of container width is a good base size for an item
                const baseWidthStr = `${35 * item.computedScale}%`;

                return (
                    <motion.div
                        key={item.clothing.id || i}
                        className={`absolute ${disableInteraction ? 'pointer-events-none' : 'cursor-pointer'}`}
                        style={{
                            left: `${item.computedX}%`,
                            top: `${item.computedY}%`,
                            x: '-50%',
                            y: '-50%',
                            zIndex: isHovered && !disableInteraction ? 999 : item.computedZIndex,
                            width: baseWidthStr,
                        }}
                        initial={{ rotate: item.computedRotation }}
                        animate={!disableInteraction ? { 
                            scale: isHovered || selectedItemId === item.clothing.id ? 1.05 : 1,
                            rotate: item.computedRotation
                        } : { rotate: item.computedRotation }}
                        whileTap={!disableInteraction ? { scale: 0.95 } : undefined}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onHoverStart={() => !disableInteraction && setHoveredItemId(item.clothing.id)}
                        onHoverEnd={() => setHoveredItemId(null)}
                        onClick={(e) => {
                            if (disableInteraction) return;
                            e.stopPropagation();
                            onItemClick?.(item.clothing);
                        }}
                    >
                        {/* Sticker Effect */}
                        <div 
                            className="relative w-full aspect-[3/4]"
                            style={{
                                filter: isMobileSticker 
                                    ? (isHovered || selectedItemId === item.clothing.id
                                        ? 'drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 8px 16px rgba(0,0,0,0.4))' 
                                        : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))')
                                    : 'none'
                            }}
                        >
                            <Image
                                src={item.img}
                                alt={item.clothing.name || 'Prenda'}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default React.memo(InteractiveOutfitViewer);
