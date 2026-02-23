'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { ClothingItem } from '@/types/clothing';
import { X } from 'lucide-react';
import html2canvas from 'html2canvas';

interface OutfitCanvasProps {
    selections: Record<string, ClothingItem[]>;
    onRemoveItem?: (slotId: string, itemId: string) => void;
    isMobile?: boolean;
    onCanvasChange?: (states: Record<string, ItemState>) => void;
}

export interface OutfitCanvasRef {
    exportToImage: () => Promise<string | null>;
}

interface ItemState {
    zIndex: number;
    scale: number;
    rotation: number;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
}

export const OutfitCanvas = forwardRef<OutfitCanvasRef, OutfitCanvasProps>(function OutfitCanvas({ selections, onRemoveItem, isMobile = false, onCanvasChange }: OutfitCanvasProps, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxZIndex, setMaxZIndex] = useState(100);
    const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});

    // Expose export function to parent components
    useImperativeHandle(ref, () => ({
        exportToImage: async () => {
            if (!containerRef.current) return null;

            try {
                const canvas = await html2canvas(containerRef.current, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                });

                return canvas.toDataURL('image/png');
            } catch (error) {
                console.error('Failed to export canvas:', error);
                return null;
            }
        }
    }), []);

    // Initialize new items at center
    useEffect(() => {
        const newStates = { ...itemStates };
        let hasChanges = false;

        Object.entries(selections).forEach(([slotId, items]) => {
            items.forEach((item, index) => {
                const itemId = `${slotId}-${item.id}`;

                if (!newStates[itemId]) {
                    hasChanges = true;
                    // Start at random position anywhere on canvas - no limits
                    newStates[itemId] = {
                        zIndex: index + 1,
                        scale: 0.8,
                        rotation: 0,
                        x: Math.random() * 100, // Anywhere from 0% to 100%
                        y: Math.random() * 100  // Anywhere from 0% to 100%
                    };
                }
            });
        });

        if (hasChanges) {
            setItemStates(newStates);
            // onCanvasChange will be triggered by the useEffect observing itemStates
        }
    }, [selections]);

    // Notify parent of changes when itemStates changes
    useEffect(() => {
        const timer = setTimeout(() => {
            onCanvasChange?.(itemStates);
        }, 0);
        return () => clearTimeout(timer);
    }, [itemStates, onCanvasChange]);

    const updateState = (itemId: string, updates: Partial<ItemState>) => {
        setItemStates(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], ...updates }
        }));
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

        // Ensure we don't go out of bounds (0-100%)
        const boundedX = Math.max(0, Math.min(100, x));
        const boundedY = Math.max(0, Math.min(100, y));

        updateState(itemId, { x: boundedX, y: boundedY });
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
            className="relative w-full h-full bg-white overflow-hidden rounded-[32px] shadow-inner"
            style={{ aspectRatio: isMobile ? '9/16' : '3/4' }}
            data-canvas-export="true"
        // Note: Tap-to-place could be added here if we track a 'selectedId'
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
                        }}
                        transition={{
                            left: { duration: 0 },
                            top: { duration: 0 },
                            x: { duration: 0 },
                            y: { duration: 0 },
                            // Keep other transitions (like scale/opacity) smooth if needed, or set default interaction
                            default: { duration: 0.2 }
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
});
