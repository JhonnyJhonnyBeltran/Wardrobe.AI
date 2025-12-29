'use client';

/**
 * SlotMachineGenerator Component
 * Ultra-fast vertical carousel animation that gradually stops to reveal the final outfit
 * Apple/Revolut premium feel with elastic animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface SlotMachineItem {
    id: string;
    name: string;
    imageUrl: string;
    type: string;
}

interface SlotMachineGeneratorProps {
    items: SlotMachineItem[];
    finalItem: SlotMachineItem;
    onComplete?: () => void;
    duration?: number; // Duration in ms for the slot animation
}

export const SlotMachineGenerator: React.FC<SlotMachineGeneratorProps> = ({
    items,
    finalItem,
    onComplete,
    duration = 2000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(true);
    const [speed, setSpeed] = useState(50); // Initial speed in ms

    useEffect(() => {
        if (!isSpinning) return;

        let interval: NodeJS.Timeout;
        let elapsed = 0;

        interval = setInterval(() => {
            elapsed += speed;

            // Gradually slow down
            if (elapsed > duration * 0.6) {
                setSpeed((prev) => Math.min(prev + 20, 500));
            }

            // Stop when duration is reached
            if (elapsed >= duration) {
                setIsSpinning(false);
                onComplete?.();
                clearInterval(interval);
                return;
            }

            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, speed);

        return () => clearInterval(interval);
    }, [isSpinning, speed, duration, items.length, onComplete]);

    const displayItem = isSpinning ? items[currentIndex] : finalItem;

    return (
        <div className="relative w-full h-64 overflow-hidden rounded-3xl bg-[var(--background-secondary)]">
            {/* Gradient overlays for slot machine effect */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--background)] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--background)] to-transparent z-10 pointer-events-none" />

            {/* Center highlight */}
            <div className="absolute top-1/2 left-0 right-0 h-32 -translate-y-1/2 border-y-2 border-[var(--brand-pink)] opacity-20 z-10 pointer-events-none" />

            {/* Spinning items */}
            <div className="flex items-center justify-center h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={displayItem.id}
                        initial={{ y: isSpinning ? -100 : 0, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{
                            duration: isSpinning ? 0.05 : 0.6,
                            ease: isSpinning ? 'linear' : [0.68, -0.55, 0.265, 1.55],
                        }}
                        className="relative"
                    >
                        <div className="w-48 h-48 relative">
                            <img
                                src={displayItem.imageUrl}
                                alt={displayItem.name}
                                className="w-full h-full object-contain no-background-image"
                            />
                        </div>

                        {/* Item info */}
                        {!isSpinning && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center"
                            >
                                <p className="text-sm font-semibold text-[var(--foreground)]">
                                    {displayItem.name}
                                </p>
                                <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                                    {displayItem.type}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sparkle effect when stopped */}
            {!isSpinning && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
                    className="absolute top-4 right-4 z-20"
                >
                    <Sparkles className="w-6 h-6 text-[var(--brand-pink)] animate-pulse-glow" />
                </motion.div>
            )}
        </div>
    );
};

/**
 * MultiSlotMachineGenerator
 * Shows multiple slot machines side by side for complete outfit generation
 */

interface OutfitSlot {
    category: string;
    items: SlotMachineItem[];
    finalItem: SlotMachineItem;
}

interface MultiSlotMachineGeneratorProps {
    slots: OutfitSlot[];
    onComplete?: () => void;
}

export const MultiSlotMachineGenerator: React.FC<MultiSlotMachineGeneratorProps> = ({
    slots,
    onComplete,
}) => {
    const [completedSlots, setCompletedSlots] = useState<number>(0);

    const handleSlotComplete = () => {
        setCompletedSlots((prev) => {
            const newCount = prev + 1;
            if (newCount === slots.length) {
                setTimeout(() => onComplete?.(), 500);
            }
            return newCount;
        });
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h2 className="text-2xl font-bold gradient-text mb-2">
                    Generando tu outfit perfecto
                </h2>
                <p className="text-sm text-[var(--foreground-tertiary)]">
                    Analizando tu armario...
                </p>
            </motion.div>

            {/* Slots grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot, index) => (
                    <motion.div
                        key={slot.category}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="space-y-2"
                    >
                        {/* Category label */}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider">
                                {slot.category}
                            </span>
                            {completedSlots > index && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 rounded-full bg-[var(--brand-pink)]"
                                />
                            )}
                        </div>

                        {/* Slot machine */}
                        <SlotMachineGenerator
                            items={slot.items}
                            finalItem={slot.finalItem}
                            onComplete={handleSlotComplete}
                            duration={2000 + index * 300} // Stagger completion
                        />
                    </motion.div>
                ))}
            </div>

            {/* Progress indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center gap-2 mt-8"
            >
                {slots.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${completedSlots > index
                                ? 'w-12 bg-[var(--brand-pink)]'
                                : 'w-8 bg-[var(--border-color)]'
                            }`}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default SlotMachineGenerator;
