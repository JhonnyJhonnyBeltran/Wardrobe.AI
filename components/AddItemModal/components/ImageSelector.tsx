'use client';

/**
 * ImageSelector Component
 * Grid for selecting from multiple scraped images with processing preview
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, RotateCw, RotateCcw } from 'lucide-react';
import type { ImageSelectorProps } from '../types';

export function ImageSelector({
    images,
    selectedIndex,
    isProcessing,
    processingMessage,
    processedImage,
    onSelectImage,
    onRotate,
}: ImageSelectorProps) {
    if (images.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">
                    Selecciona una imagen ({images.length} disponibles)
                </span>
                {selectedIndex !== null && (
                    <span className="text-xs text-[var(--brand-pink)] font-semibold">
                        ✓ Imagen {selectedIndex + 1} seleccionada
                    </span>
                )}
            </div>

            {/* Image grid for selection */}
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1 hide-scrollbar">
                {images.map((imgUrl, index) => (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => onSelectImage(imgUrl, index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedIndex === index
                            ? 'border-[var(--brand-pink)] ring-2 ring-[var(--brand-pink)]/30'
                            : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                            }`}
                    >
                        <img
                            src={imgUrl}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover bg-white"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        {selectedIndex === index && (
                            <div className="absolute inset-0 bg-[var(--brand-pink)]/20 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Processed image preview */}
            {processedImage && (
                <div className="mt-3">
                    <span className="text-xs font-bold text-[var(--foreground)] mb-2 block">
                        Vista previa (fondo eliminado)
                    </span>
                    <div className="aspect-square max-w-[200px] mx-auto rounded-2xl border border-[var(--border-color)] bg-white overflow-hidden relative">
                        {isProcessing ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                <span className="text-xs text-[var(--brand-pink)] font-semibold animate-pulse">
                                    {processingMessage}
                                </span>
                            </div>
                        ) : (
                            <img src={processedImage} alt="Preview" className="w-full h-full object-contain p-2" />
                        )}
                    </div>
                    {/* Rotation buttons */}
                    <div className="flex justify-center gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => onRotate?.(-90)}
                            disabled={isProcessing}
                            className="px-3 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                            <span className="text-xs text-[var(--foreground-secondary)]">Girar ←</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onRotate?.(90)}
                            disabled={isProcessing}
                            className="px-3 py-2 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
                        >
                            <RotateCw className="w-4 h-4 text-[var(--foreground-tertiary)]" />
                            <span className="text-xs text-[var(--foreground-secondary)]">Girar →</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
