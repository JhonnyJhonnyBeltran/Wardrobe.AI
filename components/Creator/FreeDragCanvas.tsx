'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { ClothingItem } from '@/types/clothing';
import { DraggableItem } from './DraggableItem';
import html2canvas from 'html2canvas';

interface FreeDragCanvasProps {
    items: ClothingItem[]; // Flat list of items to show
    onRemoveItem?: (itemId: string) => void;
}

export interface FreeDragCanvasRef {
    exportToImage: () => Promise<string | null>;
    getItemsState: () => Record<string, any>;
}

interface ItemState {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    zIndex: number;
}

export const FreeDragCanvas = forwardRef<FreeDragCanvasRef, FreeDragCanvasProps>(function FreeDragCanvas({ items, onRemoveItem }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
    const [maxZIndex, setMaxZIndex] = useState(10);

    // Initialize/Update items
    useEffect(() => {
        setItemStates(prev => {
            const next = { ...prev };
            let hasChanges = false;

            // Set grid positions for new items
            items.forEach((item, index) => {
                if (!next[item.id]) {
                    hasChanges = true;
                    // Improved initial layout: Staggered grid
                    const col = index % 3;
                    const row = Math.floor(index / 3);

                    next[item.id] = {
                        x: 50 + col * 100, // Pixel Offset approx
                        y: 50 + row * 150,
                        scale: 1,
                        rotation: 0,
                        zIndex: index + 1
                    };
                    if (index + 1 > maxZIndex) setMaxZIndex(index + 1);
                }
            });

            return hasChanges ? next : prev;
        });
    }, [items]);

    // Export function
    useImperativeHandle(ref, () => ({
        getItemsState: () => itemStates,
        exportToImage: async () => {
            if (!containerRef.current) return null;
            // Deselect before capture
            setSelectedId(null);

            // Wait for React to render the deselection (next tick)
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const canvas = await html2canvas(containerRef.current, {
                    backgroundColor: '#ffffff',
                    scale: 3, // High quality
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                });
                return canvas.toDataURL('image/jpeg', 0.8);
            } catch (error) {
                console.error('Canvas export failed:', error);
                return null;
            }
        }
    }), []);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        // Bring to front
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        updateState(id, { zIndex: nextZ });
    };

    const updateState = (id: string, updates: Partial<ItemState>) => {
        setItemStates(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    };

    return (
        <div
            className="w-full h-full min-h-[500px] bg-white overflow-hidden relative touch-none"
            ref={containerRef}
            onClick={() => setSelectedId(null)} // Click background to deselect
        >
            {/* Grid pattern background (optional visual aid) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {items.map(item => {
                const state = itemStates[item.id];
                if (!state) return null;

                return (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        state={state}
                        isSelected={selectedId === item.id}
                        onSelect={() => handleSelect(item.id)}
                        onChange={(updates) => updateState(item.id, updates)}
                        onRemove={() => onRemoveItem?.(item.id)}
                        containerRef={containerRef}
                    />
                );
            })}
        </div>
    );
});
