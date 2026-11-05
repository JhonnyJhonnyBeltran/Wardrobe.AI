'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/imageUtils';

interface InteractiveOutfitViewerProps {
    outfit: any;
    onItemClick?: (item: any) => void;
    className?: string;
    isMobileSticker?: boolean;
    selectedItemId?: string;
    disableInteraction?: boolean;
    isActive?: boolean;
}

function getViewerCategoryVerticalRank(category?: string | null, name?: string | null): number {
    const raw = `${category || ''} ${name || ''}`.toLowerCase();
    if (/(hat|cap|gorra|gorro|sombrero|beanie|head|gafa|sunglass)/.test(raw)) return 1;
    if (/(outerwear|jacket|coat|blazer|cazadora|abrigo)/.test(raw)) return 2;
    if (/(top|shirt|camiseta|camisa|hoodie|sudadera|sweater|jersey|blusa|polo|knit|tank|crop)/.test(raw)) return 2.5;
    if (/(dress|vestido|mono|jumpsuit)/.test(raw)) return 3;
    if (/(pant|jean|trouser|pantalon|pantalón|vaquero|short|bermuda|skirt|falda|bottom|cargo|legging)/.test(raw)) return 4;
    if (/(shoe|sneaker|zapatilla|bota|boot|sandal|loafer|mocasin|mocasín|heel|tacón|calzado|footwear|shox)/.test(raw)) return 5;
    return 3.5;
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
    const rawStaticImage = outfit.imageUrl || outfit.image_url;
    const staticImage = rawStaticImage ? resolveImageUrl(rawStaticImage, '') : '';
    
    // Detect legacy 2x2 grid coordinates from old saves
    const isLegacyGrid = useMemo(() => {
        if (!items || items.length < 2) return false;
        const allMatch = items.every((it: any) => {
            const px = Math.round(it.position_x ?? it.positionX ?? 50);
            const py = Math.round(it.position_y ?? it.positionY ?? 50);
            return (px === 33 || px === 67 || px === 50) && (py === 33 || py === 67 || py === 50);
        });
        const hasGridOffset = items.some((it: any) => {
            const px = Math.round(it.position_x ?? it.positionX ?? 50);
            return px === 33 || px === 67;
        });
        return allMatch && hasGridOffset;
    }, [items]);

    // Generate programmatic positions for items that lack them or have legacy 2x2 coordinates
    const itemsWithPositions = useMemo(() => {
        const needsVerticalStack = !hasLayoutData || isLegacyGrid;
        const workingList = needsVerticalStack
            ? [...items].sort((a: any, b: any) => {
                const ca = a.clothing_items || a.clothing_item || a.clothing || a;
                const cb = b.clothing_items || b.clothing_item || b.clothing || b;
                const itemA = Array.isArray(ca) ? ca[0] : ca;
                const itemB = Array.isArray(cb) ? cb[0] : cb;
                return getViewerCategoryVerticalRank(itemA?.category || a.category, itemA?.name || a.name) -
                       getViewerCategoryVerticalRank(itemB?.category || b.category, itemB?.name || b.name);
            })
            : items;

        const total = workingList.length;

        return workingList.map((item: any, i: number) => {
            const clothingRaw = item.clothing_items || item.clothing_item || item.clothing || item;
            const clothing = Array.isArray(clothingRaw) ? clothingRaw[0] : clothingRaw;
            const rawImg = clothing?.imageUrl || clothing?.image_url || clothing?.original_image_url || clothing?.originalImageUrl || item.image_url || item.imageUrl;
            const img = rawImg ? resolveImageUrl(rawImg, '') : '';
            
            let x = item.position_x ?? item.positionX;
            let y = item.position_y ?? item.positionY;
            let scale = item.scale ?? 1;
            
            // If they don't have layout data or were in legacy 2x2 grid, stack vertically head-to-toe
            if (needsVerticalStack || x === undefined || x === null || y === undefined || y === null) {
                x = 50;
                if (total === 1) {
                    y = 50;
                } else {
                    const startY = total >= 4 ? 14 : 20;
                    const endY = total >= 4 ? 86 : 80;
                    y = startY + (i * (endY - startY)) / (total - 1);
                }
                const rank = getViewerCategoryVerticalRank(clothing?.category || item.category, clothing?.name || item.name);
                if (rank === 1) scale = 0.55; // Hats / caps smaller
            }

            return {
                ...item,
                clothing,
                img,
                computedX: Number(x),
                computedY: Number(y),
                computedScale: Number(scale) || 1,
                computedRotation: Number(item.rotation ?? 0),
                computedZIndex: item.layer_order ?? item.zIndex ?? item.z_index ?? i
            };
        }).filter((item: any) => item.img);
    }, [items, hasLayoutData, isLegacyGrid]);

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
                className={`relative w-full h-full bg-white overflow-hidden ${className} ${!disableInteraction && items.length > 0 ? 'cursor-pointer' : ''}`}
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

    // Interactive canvas rendering (Always white background so dark garments remain visible in dark mode)
    return (
        <div className={`relative w-full h-full bg-white overflow-hidden flex items-center justify-center ${className}`}>
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

