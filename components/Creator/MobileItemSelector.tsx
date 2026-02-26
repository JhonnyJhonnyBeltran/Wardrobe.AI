'use client';

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import { ClothingItem } from '@/types/clothing';

interface MobileItemSelectorProps {
    title: string;
    items: ClothingItem[];
    selectedItems: ClothingItem[];
    onSelect: (item: ClothingItem) => void;
}

export function MobileItemSelector({ title, items, selectedItems, onSelect }: MobileItemSelectorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (items.length === 0) return null; // Hide empty categories

    const currentItem = items[currentIndex];
    const isSelected = selectedItems.some(i => i.id === currentItem.id);

    const handleNext = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            handlePrev();
        } else if (info.offset.x < -100) {
            handleNext();
        }
    };

    return (
        <div className="space-y-3">
            {/* Category Title */}
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
                    {title}
                </h3>
                <span className="text-xs text-[var(--foreground-tertiary)]">
                    {currentIndex + 1} / {items.length}
                </span>
            </div>

            {/* Swipeable Card */}
            <div className="relative h-[360px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem.id}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0"
                    >
                        <button
                            onClick={() => onSelect(currentItem)}
                            className="w-full h-full flex flex-col items-center"
                        >
                            {/* Image Container */}
                            <motion.div
                                animate={{ y: isSelected ? -8 : 0 }}
                                className="relative w-full h-[280px] rounded-3xl overflow-hidden bg-[var(--card-bg)]"
                            >
                                {currentItem.imageUrl ? (
                                    <Image
                                        src={currentItem.imageUrl}
                                        alt={currentItem.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--background-secondary)]">
                                        <span className="text-sm text-[var(--foreground-tertiary)]">Sin imagen</span>
                                    </div>
                                )}

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-xl">
                                            <Check className="w-9 h-9 text-white" strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Item Info */}
                            <div className="mt-4 text-center space-y-1">
                                <h4 className="text-lg font-bold text-[var(--foreground)]">
                                    {currentItem.name}
                                </h4>
                                {currentItem.brand && (
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                        {currentItem.brand}
                                    </p>
                                )}
                            </div>
                        </button>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-lg border border-[var(--border-color)] z-10"
                    >
                        <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
                    </button>
                )}
                {currentIndex < items.length - 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-lg border border-[var(--border-color)] z-10"
                    >
                        <ChevronRight className="w-6 h-6 text-[var(--foreground)]" />
                    </button>
                )}
            </div>

            {/* Dots Indicator */}
            {items.length > 1 && (
                <div className="flex justify-center gap-1.5 pt-2">
                    {items.slice(0, Math.min(items.length, 10)).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentIndex
                                ? 'w-6 bg-[var(--brand-pink)]'
                                : 'w-1.5 bg-[var(--foreground-tertiary)]'
                                }`}
                        />
                    ))}
                    {items.length > 10 && (
                        <span className="text-xs text-[var(--foreground-tertiary)] ml-1">
                            +{items.length - 10}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
