'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface InteractiveOutfitViewerProps {
    outfit: any;
    onItemClick?: (item: any) => void;
    className?: string;
    isMobileSticker?: boolean;
    selectedItemId?: string;
    disableInteraction?: boolean;
    isActive?: boolean;
}

const InteractiveOutfitViewer = ({ 
    outfit, 
    onItemClick, 
    className = '', 
    isMobileSticker = false, 
    selectedItemId, 
    disableInteraction = false,
    isActive = false 
}: InteractiveOutfitViewerProps) => {
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [bouncingIndex, setBouncingIndex] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fallback if no outfit or items
    if (!outfit) return null;

    const items = useMemo(() => {
        return (outfit.items && outfit.items.length > 0)
            ? outfit.items
            : (outfit.outfit_items && outfit.outfit_items.length > 0)
            ? outfit.outfit_items
            : (outfit.clothing_items && outfit.clothing_items.length > 0)
            ? outfit.clothing_items
            : (outfit.garments && outfit.garments.length > 0)
            ? outfit.garments
            : [];
    }, [outfit]);
    
    // Check if we have valid layout data for at least one item
    // Some legacy outfits might not have position_x, position_y
    const hasLayoutData = items.some((item: any) => 
        (item.position_x !== undefined && item.position_x !== null) ||
        (item.positionX !== undefined && item.positionX !== null)
    );

    // If we don't have layout data, use the static image fallback
    const staticImage = outfit.imageUrl || outfit.image_url;
    
    // Generate programmatic positions for items that lack them
    const itemsWithPositions = useMemo(() => {
        return items.map((item: any, i: number) => {
            const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
            const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
            const img = clothing?.imageUrl || clothing?.image_url || clothing?.original_image_url || clothing?.originalImageUrl || item.image_url || item.imageUrl;
            
            let x = item.position_x ?? item.positionX;
            let y = item.position_y ?? item.positionY;
            
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
                computedZIndex: item.layer_order ?? item.zIndex ?? item.z_index ?? i
            };
        }).filter((item: any) => item.img);
    }, [items]);

    // Sequential bounce entrance animation: items bounce one by one to show interactivity
    useEffect(() => {
        if (!isActive || disableInteraction || itemsWithPositions.length === 0) {
            setBouncingIndex(null);
            return;
        }

        const timeouts: NodeJS.Timeout[] = [];
        const startDelay = 350; // ms delay so parent transition/modal settles
        const bounceDuration = 320; // ms duration per item

        itemsWithPositions.forEach((_: any, idx: number) => {
            const timeout = setTimeout(() => {
                setBouncingIndex(idx);
            }, startDelay + idx * bounceDuration);
            timeouts.push(timeout);
        });

        // Reset when full sequence finishes
        const endTimeout = setTimeout(() => {
            setBouncingIndex(null);
        }, startDelay + itemsWithPositions.length * bounceDuration);
        timeouts.push(endTimeout);

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [isActive, disableInteraction, itemsWithPositions.length, outfit?.id]);

    if (itemsWithPositions.length === 0 && staticImage) {
        return (
            <div 
                className={`relative w-full h-full bg-[#f8f9fa] dark:bg-[#111] overflow-hidden ${className} ${!disableInteraction && items.length > 0 ? 'cursor-pointer' : ''}`}
                onClick={() => {
                    if (!disableInteraction && items.length > 0) {
                        const firstGarment = items[0].clothing_items || items[0].clothing_item || items[0].clothing || items[0];
                        onItemClick?.(firstGarment);
                    }
                }}
            >
                <Image
                    src={staticImage}
                    alt={outfit.name || 'Outfit'}
                    fill
                    quality={92}
                    className="object-cover transform-gpu"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
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
                const isSelected = selectedItemId === item.clothing.id;
                const isBouncing = bouncingIndex === i;
                const isHighlighted = isHovered || isSelected || isBouncing;

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
                            zIndex: isHighlighted && !disableInteraction ? 999 : item.computedZIndex,
                            width: baseWidthStr,
                        }}
                        initial={{ scale: 1, rotate: item.computedRotation }}
                        animate={!disableInteraction ? { 
                            scale: isHighlighted ? 1.10 : 1,
                            rotate: item.computedRotation
                        } : { rotate: item.computedRotation }}
                        whileTap={!disableInteraction ? { scale: 0.94 } : undefined}
                        transition={{ 
                            type: 'spring', 
                            stiffness: 420, 
                            damping: 18, 
                            mass: 0.8 
                        }}
                        onHoverStart={() => {
                            if (!disableInteraction) {
                                setHoveredItemId(item.clothing.id);
                                setBouncingIndex(null); // Cancel automated bounce if user hovers
                            }
                        }}
                        onHoverEnd={() => setHoveredItemId(null)}
                        onClick={(e) => {
                            if (disableInteraction) return;
                            e.stopPropagation();
                            setBouncingIndex(null); // Cancel automated bounce if user clicks
                            onItemClick?.(item.clothing);
                        }}
                    >
                        {/* Sticker Effect */}
                        <div 
                            className="relative w-full aspect-[3/4] transition-[filter] duration-200"
                            style={{
                                filter: isMobileSticker 
                                    ? (isHighlighted
                                        ? 'drop-shadow(0 0 10px rgba(255,255,255,0.95)) drop-shadow(0 8px 18px rgba(0,0,0,0.35))' 
                                        : 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))')
                                    : (isHighlighted
                                        ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))'
                                        : 'none')
                            }}
                        >
                            <Image
                                src={item.img}
                                alt={item.clothing.name || 'Prenda'}
                                fill
                                quality={92}
                                className="object-contain transform-gpu select-none pointer-events-none"
                                sizes="(max-width: 768px) 60vw, 40vw"
                                priority={i < 2}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default React.memo(InteractiveOutfitViewer);

