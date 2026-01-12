'use client';

/**
 * OutfitLoadingCarousel Component
 * 3D rotating carousel that displays wardrobe items while generating outfit
 * Includes animated phrases that cycle through
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ClothingItemImage {
    id: string;
    imageUrl: string;
    name: string;
}

interface OutfitLoadingCarouselProps {
    items: ClothingItemImage[];
    isVisible: boolean;
    /** Cambiar este valor para forzar re-shuffle de los items */
    shuffleSeed?: number;
    /** Callback que se ejecuta cuando termina la animación de salida */
    onExitComplete?: () => void;
}

// Frases que se muestran mientras se genera el outfit
const LOADING_PHRASES = [
    "Analizando tu estilo...",
    "Eligiendo los mejores colores...",
    "Ordenando la ropa...",
    "Combinando texturas...",
    "Buscando la combinación perfecta...",
    "Revisando tendencias...",
    "Personalizando para ti...",
    "Ajustando los detalles...",
    "Creando magia fashionista...",
    "Casi listo...",
    "Preparando tu look ideal...",
    "Mezclando estilos...",
];

// Colores para las tarjetas (vibrantes y modernos)
const CARD_COLORS = [
    '255, 105, 180', // brand-pink
    '142, 249, 252', // cyan
    '142, 252, 204', // mint
    '215, 252, 142', // lime
    '252, 208, 142', // orange
    '204, 142, 252', // purple
    '252, 142, 239', // magenta
    '142, 202, 252', // sky blue
    '252, 252, 142', // yellow
    '252, 142, 142', // coral
];

export const OutfitLoadingCarousel: React.FC<OutfitLoadingCarouselProps> = ({
    items,
    isVisible,
    shuffleSeed = 0,
    onExitComplete,
}) => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    // Mezclar items usando useMemo con shuffleSeed como dependencia
    const displayItems = useMemo(() => {
        if (items.length === 0) return [];
        
        // Usar shuffleSeed como parte de la lógica de mezcla determinista
        const shuffled = [...items];
        let seed = shuffleSeed * 1000 + items.length + 12345;
        
        // Fisher-Yates shuffle con seed
        for (let i = shuffled.length - 1; i > 0; i--) {
            seed = (seed * 9301 + 49297) % 233280;
            const j = Math.floor((seed / 233280) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Si hay menos de 10 items, repetir para llenar el carrusel
        const targetCount = 10;
        const result = shuffled.slice(0, Math.min(targetCount, shuffled.length));
        
        if (result.length < targetCount && result.length > 0) {
            const originalLength = result.length;
            let repeatIndex = 0;
            while (result.length < targetCount) {
                // Crear copia con ID único para evitar problemas de key
                result.push({
                    ...result[repeatIndex % originalLength],
                    id: `${result[repeatIndex % originalLength].id}-repeat-${result.length}`,
                });
                repeatIndex++;
            }
        }
        
        return result;
    }, [items, shuffleSeed]);

    const quantity = displayItems.length || 10;

    // Ciclar las frases
    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setCurrentPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <AnimatePresence onExitComplete={onExitComplete}>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        y: -50,
                        scale: 0.95,
                    }}
                    transition={{ 
                        duration: 0.5, 
                        ease: [0.4, 0, 0.2, 1] 
                    }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)]/95 backdrop-blur-xl"
                >
                    {/* 3D Carousel Container */}
                    <div className="carousel-wrapper">
                        <div
                            className="carousel-inner"
                            style={{ '--quantity': quantity } as React.CSSProperties}
                        >
                            {displayItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="carousel-card"
                                    style={{
                                        '--index': index,
                                        '--color-card': CARD_COLORS[index % CARD_COLORS.length],
                                    } as React.CSSProperties}
                                >
                                    <div className="carousel-card-content">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                sizes="140px"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                👗
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Si no hay items, mostrar placeholders */}
                            {displayItems.length === 0 &&
                                Array.from({ length: 10 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="carousel-card"
                                        style={{
                                            '--index': index,
                                            '--color-card': CARD_COLORS[index],
                                        } as React.CSSProperties}
                                    >
                                        <div className="carousel-card-placeholder" />
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Animated Loading Phrase */}
                    <div className="mt-16 h-12 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentPhraseIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                className="text-lg font-medium text-[var(--foreground)] text-center"
                            >
                                {LOADING_PHRASES[currentPhraseIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Subtle loading indicator */}
                    <motion.div
                        className="mt-6 flex gap-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-[var(--brand-pink)]"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OutfitLoadingCarousel;
