'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClothingItem } from '@/types/clothing';
import { X } from 'lucide-react';

interface OutfitCanvasProps {
    selections: Record<string, ClothingItem[]>;
    onRemoveItem?: (slotId: string, itemId: string) => void;
    isMobile?: boolean;
    onCanvasChange?: (states: Record<string, ItemState>) => void;
}

interface ItemState {
    zIndex: number;
    scale: number;
    rotation: number;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
}

export function OutfitCanvas({ selections, onRemoveItem, isMobile = false, onCanvasChange }: OutfitCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxZIndex, setMaxZIndex] = useState(100);
    const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});

    // Initialize new items at center
    useEffect(() => {
        const newStates = { ...itemStates };
        let hasChanges = false;

        Object.entries(selections).forEach(([slotId, items]) => {
            items.forEach((item, index) => {
                const itemId = `${slotId}-${item.id}`;

                if (!newStates[itemId]) {
                    hasChanges = true;
                    // Start at EXACT center, no stagger, no smarts.
                    newStates[itemId] = {
                        zIndex: index + 1,
                        scale: 0.8,
                        rotation: 0,
                        x: 50,
                        y: 50
                    };
                }
            });
        });

        if (hasChanges) {
            setItemStates(newStates);
            onCanvasChange?.(newStates);
        }
    }, [selections]);

    const updateState = (itemId: string, updates: Partial<ItemState>) => {
        setItemStates(prev => {
            const next = {
                ...prev,
                [itemId]: { ...prev[itemId], ...updates }
            };
            onCanvasChange?.(next);
            return next;
        });
    };

    const handleDragEnd = (itemId: string, event: any, info: any) => {
        if (!containerRef.current) return;

        // Find draggable element to get its real visual position
        const target = event.target as HTMLElement;
        const draggableEl = target.closest('.group') as HTMLElement;

        if (!draggableEl) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const itemRect = draggableEl.getBoundingClientRect();

        // Calculate center relative to container
        const centerX = (itemRect.left + itemRect.width / 2) - containerRect.left;
        const centerY = (itemRect.top + itemRect.height / 2) - containerRect.top;

        const x = (centerX / containerRect.width) * 100;
        const y = (centerY / containerRect.height) * 100;

        updateState(itemId, { x, y });
    };

    const bringToFront = (itemId: string) => {
        const newZ = maxZIndex + 1;
        setMaxZIndex(newZ);
        updateState(itemId, { zIndex: newZ });
    };

    const handleResize = (itemId: string, delta: number) => {
        const current = itemStates[itemId];
        if (!current) return;
        const newScale = Math.max(0.2, Math.min(4.0, current.scale + delta));
        updateState(itemId, { scale: newScale });
    };

    // Flatten items for rendering - DO NOT SORT to avoid DOM shuffling.
    // Use CSS z-index to handle layering.
    const renderItems = () => {
        const itemsToRender: { id: string; item: ClothingItem; slotId: string }[] = [];
        Object.entries(selections).forEach(([slotId, items]) => {
            items.forEach(item => {
                itemsToRender.push({ id: `${slotId}-${item.id}`, item, slotId });
            });
        });
        return itemsToRender;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-[var(--background-secondary)]/30 overflow-hidden rounded-[32px] shadow-inner"
            style={{ aspectRatio: isMobile ? '9/16' : '3/4' }}
        >
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {/* Version marker to force HMR */}
            <div className="absolute top-2 right-2 opacity-0 pointer-events-none">v2-free</div>

            {renderItems().map(({ id: itemId, item, slotId }) => {
                const state = itemStates[itemId];
                if (!state) return null;

                return (
                    <motion.div
                        key={itemId}
                        drag
                        dragMomentum={false}
                        onDragEnd={(e, info) => handleDragEnd(itemId, e, info)}
                        // Removed auto-bringToFront on touch to keep layers stable

                        // Use strict absolute positioning with percentage
                        initial={false}
                        animate={{
                            left: `${state.x}%`,
                            top: `${state.y}%`,
                            x: "-50%", // CRITICAL: Force reset of drag transform residue to true center
                            y: "-50%", // CRITICAL: Force reset of drag transform residue to true center
                            zIndex: state.zIndex,
                            // Removed duration: 0 to restore smooth animation as requested
                        }}
                        style={{
                            position: 'absolute',
                            width: isMobile ? '45%' : '40%',
                            // transform is handled by animate x/y
                        }}
                        className="cursor-move touch-none group"
                    >
                        <div
                            className="relative w-full"
                            style={{
                                transform: `scale(${state.scale})`,
                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
                            }}
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-auto object-contain pointer-events-none select-none"
                                draggable={false}
                            />

                            {/* Controls */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {onRemoveItem && (
                                    <button
                                        onPointerDown={(e) => { e.stopPropagation(); onRemoveItem(slotId, item.id); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg pointer-events-auto hover:bg-red-600 z-10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <div className="absolute -bottom-2 -right-2 flex gap-1 pointer-events-auto z-10">
                                    <button
                                        onPointerDown={(e) => { e.stopPropagation(); handleResize(itemId, -0.15); }}
                                        className="bg-[#FF69B4] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg font-bold"
                                    >
                                        −
                                    </button>
                                    <button
                                        onPointerDown={(e) => { e.stopPropagation(); handleResize(itemId, 0.15); }}
                                        className="bg-[#FF69B4] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {renderItems().length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground-tertiary)] pointer-events-none">
                    <p className="text-sm font-medium">Selecciona prendas para crear tu outfit</p>
                </div>
            )}
        </div>
    );
}
