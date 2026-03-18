'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { ClothingItem } from '@/types/clothing';
import { X, RotateCw, Maximize2, Trash2, Move } from 'lucide-react';
import Image from 'next/image';

interface DraggableItemProps {
    item: ClothingItem;
    state: { x: number; y: number; scale: number; rotation: number; zIndex: number };
    isSelected: boolean;
    onSelect: () => void;
    onChange: (updates: Partial<{ x: number; y: number; scale: number; rotation: number; zIndex: number }>) => void;
    onRemove: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DraggableItem = ({
    item,
    state,
    isSelected,
    onSelect,
    onChange,
    onRemove,
    containerRef
}: DraggableItemProps) => {
    const controls = useDragControls();
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    // Initial drag constraint is the container
    const constraintsRef = containerRef;

    // Handle Drag End to update X/Y
    const handleDragEnd = (_: any, info: any) => {
        if (!containerRef.current || !itemRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        // Convert pixel position to percentage relative to container
        // We use the point relative to the container
        const xPercent = (info.point.x - containerRect.left) / containerRect.width * 100;
        const yPercent = (info.point.y - containerRect.top) / containerRect.height * 100;

        onChange({ x: xPercent, y: yPercent });
    };

    return (
        <motion.div
            ref={itemRef}
            drag
            dragMomentum={false}
            dragControls={controls}
            dragConstraints={constraintsRef}
            onDragStart={onSelect} // Select on start dragging
            onTap={onSelect}
            // Animate only if not dragging to avoid jitter
            animate={{
                x: state.x, // We'll rely on absolute positioning or percentage if possible, but framer motion drag operates on transform
                y: state.y,
                rotate: state.rotation,
                scale: state.scale,
                zIndex: state.zIndex,
            }}
            // Use style for initial position if needed, but Motion handles transform
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                x: state.x, // Initial
                y: state.y, // Initial
                width: '150px', // Base width
                height: 'auto',
                touchAction: 'none',
                cursor: isSelected ? 'move' : 'pointer',
            }}
            className={`group relative select-none ${isSelected ? 'z-[1000]' : ''}`}
        >
            <div className={`relative w-full h-full p-2`}>
                {/* Image */}
                <div className={`relative w-full h-full overflow-visible pointer-events-none`}>
                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-auto object-contain drop-shadow-md pointer-events-none select-none"
                            draggable={false}
                        />
                    )}
                </div>

                {/* Controls Overlay - Only when selected */}
                {isSelected && (
                    <div className="absolute inset-0 border-2 border-[var(--brand-pink)] rounded-lg pointer-events-none">

                        {/* Remove Button (Top Left) */}
                        <div className="absolute -top-3 -left-3 pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Rotate Handle (Top Right) */}
                        <div className="absolute -top-3 -right-3 pointer-events-auto cursor-grab active:cursor-grabbing">
                            <motion.div
                                drag
                                dragMomentum={false}
                                onDrag={(_, info) => {
                                    // Simple rotation logic based on drag delta X
                                    onChange({ rotation: state.rotation + info.delta.x });
                                }}
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Don't actually move the handle div
                                className="bg-[var(--brand-pink)] text-white p-1.5 rounded-full shadow-md"
                            >
                                <RotateCw size={14} />
                            </motion.div>
                        </div>

                        {/* Resize Handle (Bottom Right) */}
                        <div className="absolute -bottom-3 -right-3 pointer-events-auto cursor-nwse-resize">
                            <motion.div
                                drag
                                dragMomentum={false}
                                onDrag={(_, info) => {
                                    // Simple scale logic based on drag delta X + Y (average)
                                    // Sensitivity factor 0.01
                                    const scaleDelta = (info.delta.x + info.delta.y) * 0.005;
                                    const newScale = Math.max(0.3, Math.min(3, state.scale + scaleDelta));
                                    onChange({ scale: newScale });
                                }}
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                className="bg-[var(--brand-pink)] text-white p-1.5 rounded-full shadow-md"
                            >
                                <Maximize2 size={14} />
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
