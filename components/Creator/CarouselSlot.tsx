'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import { ClothingItem } from '@/types/clothing';

interface CarouselSlotProps {
    title: string;
    items: ClothingItem[];
    selectedItems: ClothingItem[]; // Changed from selectedItemId
    onSelect: (item: ClothingItem) => void;
    onClear: () => void;
    placeholderIcon?: React.ReactNode;
}

export function CarouselSlot({
    title,
    items,
    selectedItems,
    onSelect,
    onClear,
    placeholderIcon
}: CarouselSlotProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to first selected item on mount/change if needed
    useEffect(() => {
        if (selectedItems.length > 0 && scrollRef.current) {
            // Find the element
            const selectedEl = document.getElementById(`slot-item-${selectedItems[0].id}`);
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedItems]);

    return (
        <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">{title}</h3>
                {selectedItems.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="text-xs text-[var(--foreground-tertiary)] hover:text-red-500 transition-colors"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            <div className="relative group">
                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory scrollbar-hide mask-fade-sides"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {/* Only show actual items, no placeholder */}
                    {items.map((item) => {
                        const isSelected = selectedItems.some(i => i.id === item.id);
                        return (
                            <motion.button
                                id={`slot-item-${item.id}`}
                                key={item.id}
                                layoutId={`slot-${item.id}`}
                                onClick={() => onSelect(item)}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative flex-shrink-0 w-32 snap-center transition-all ${isSelected ? '' : 'opacity-70 hover:opacity-100'}`}
                            >
                                {/* Image Container */}
                                <div className="relative w-32 h-40 rounded-2xl overflow-hidden bg-[var(--card-bg)]">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            sizes="128px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[var(--background-secondary)]">
                                            <span className="text-xs">Sin imagen</span>
                                        </div>
                                    )}

                                    {/* Selection Indicator - Simple Circle */}
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-12 h-12 rounded-full bg-[#FF69B4] flex items-center justify-center shadow-lg">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Name Below Image */}
                                <p className="mt-2 text-xs font-medium text-[var(--foreground)] truncate w-full text-center">
                                    {item.name}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Scroll Hints (Optional - visible on hover on desktop) */}
                <div className="hidden md:block absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="hidden md:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div >
    );
}
