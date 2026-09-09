'use client';

/**
 * ImageUploader Component
 * Handles image upload with preview and basic processing overlay
 * 
 * Features:
 * - Click-to-upload support
 * - Processing overlay with animated message
 * - Optimized for mobile view
 */

import React, { memo, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Camera, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImageUploaderProps } from '../types';

/**
 * ProcessingOverlay - Shown while image is being processed
 */
const ProcessingOverlay = memo(function ProcessingOverlay({
    message,
}: {
    message: string;
}) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/40 backdrop-blur-md z-10 transition-all duration-300 rounded-3xl p-4">
            <Loader2 className="w-9 h-9 text-[var(--brand-pink)] animate-spin" />
            <span className="text-xs text-white font-bold animate-pulse drop-shadow text-center">
                {message}
            </span>
        </div>
    );
});

/**
 * EmptyState - Shown when no image is selected
 */
const EmptyState = memo(function EmptyState({
    isProcessing,
    processingMessage,
}: {
    isProcessing: boolean;
    processingMessage: string;
}) {
    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-6">
                <Loader2 className="w-9 h-9 text-[var(--brand-pink)] animate-spin" />
                <span className="text-xs text-[var(--brand-pink)] font-bold animate-pulse text-center">
                    {processingMessage}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3.5 p-6 w-full h-full select-none">
            <div className="w-14 h-14 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center justify-center group-hover:scale-105 group-hover:border-[var(--brand-pink)]/40 group-hover:bg-[var(--brand-pink)]/5 transition-all duration-300 shadow-sm">
                <Upload className="w-6 h-6 text-[var(--foreground-secondary)] group-hover:text-[var(--brand-pink)] transition-colors" />
            </div>
            <div className="text-center">
                <span className="block text-sm font-bold text-[var(--foreground)] mb-0.5 group-hover:text-[var(--brand-pink)] transition-colors">
                    Subir prendas
                </span>
                <span className="text-xs text-[var(--foreground-secondary)]">
                    Selecciona 1 o hasta 20 fotos a la vez
                </span>
            </div>
        </div>
    );
});

/**
 * Main Component
 */
export const ImageUploader = memo(function ImageUploader({
    image,
    isProcessing,
    processingMessage,
    onImageUpload,
    onRemoveImage,
}: Omit<ImageUploaderProps, 'onRotate' | 'onScale'>) {

    const [showOptions, setShowOptions] = useState(false);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleOptionSelect = (type: 'camera' | 'gallery') => {
        setShowOptions(false);
        setTimeout(() => {
            if (type === 'camera' && cameraInputRef.current) {
                cameraInputRef.current.click();
            } else if (type === 'gallery' && galleryInputRef.current) {
                galleryInputRef.current.click();
            }
        }, 150); // Small delay to let modal close animation start
    };

    return (
        <div className="w-full">
            <label className="block text-xs font-bold text-[var(--foreground-secondary)] mb-2.5 uppercase tracking-wider">
                Foto de la prenda
            </label>
            
            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageUpload}
                ref={galleryInputRef}
                className="hidden"
                aria-label="Subir desde galería"
            />
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onImageUpload}
                ref={cameraInputRef}
                className="hidden"
                aria-label="Tomar foto"
            />
            
            {/* Image Upload Area */}
            <div 
                className="w-full max-w-[240px] mx-auto aspect-square rounded-3xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 hover:bg-[var(--background-secondary)]/60 relative flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] cursor-pointer group"
                onClick={() => setShowOptions(true)}
            >
                {image ? (
                    <>
                        <div className={`relative w-full h-full transition-all duration-500 ease-out p-3 bg-white dark:bg-[#151518] ${isProcessing ? 'scale-90 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
                            <Image
                                src={image}
                                alt="Vista previa"
                                fill
                                className="object-contain p-3"
                                unoptimized
                                priority
                            />
                            
                            {/* Overlay hint to change image */}
                            <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold py-1 px-3.5 rounded-full border border-white/10 shadow-sm">
                                    CAMBIAR FOTO
                                </div>
                            </div>
                        </div>

                        {/* Corner Delete Button */}
                        {onRemoveImage && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveImage();
                                }}
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-20 shadow-md hover:scale-110 active:scale-95 border border-white/10"
                                title="Eliminar foto"
                                aria-label="Eliminar foto"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        
                        {isProcessing && (
                            <ProcessingOverlay message={processingMessage} />
                        )}
                    </>
                ) : (
                    <EmptyState
                        isProcessing={isProcessing}
                        processingMessage={processingMessage}
                    />
                )}
            </div>

            {/* Selection Modal */}
            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowOptions(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[var(--card-bg)] w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowOptions(false)}
                                className="absolute top-4 right-4 p-2 text-[var(--foreground-tertiary)] hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-6 text-center">Añadir Foto</h3>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleOptionSelect('camera')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)] hover:text-white transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-[var(--foreground)] group-hover:text-white">Cámara</span>
                                        <span className="text-sm text-[var(--foreground-tertiary)] group-hover:text-white/80">Tomar una foto nueva</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleOptionSelect('gallery')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)] hover:text-white transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-[var(--foreground)] group-hover:text-white">Galería</span>
                                        <span className="text-sm text-[var(--foreground-tertiary)] group-hover:text-white/80">Elegir de tus fotos</span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
