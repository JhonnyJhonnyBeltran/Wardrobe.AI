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
                                layoutId={`slot-${item.id}`} // Shared layout ID if transitioning
                                onClick={() => onSelect(item)}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative flex-shrink-0 w-32 h-40 rounded-2xl overflow-hidden snap-center transition-all ${isSelected ? 'ring-4 ring-[var(--brand-pink)] shadow-lg shadow-pink-500/20' : 'opacity-70 hover:opacity-100 hover:shadow-md'}`}
                            >
                                <div className="absolute inset-0 bg-[var(--card-bg)]">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[var(--background-secondary)]">
                                            <span className="text-xs">Sin imagen</span>
                                        </div>
                                    )}
                                </div>

                                {/* Gradient Overlay for Name */}
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white text-xs font-medium truncate w-full text-center">
                                        {item.name}
                                    </p>
                                </div>

                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--brand-pink)] rounded-full flex items-center justify-center text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Scroll Hints (Optional - visible on hover on desktop) */}
                <div className="hidden md:block absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="hidden md:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}
