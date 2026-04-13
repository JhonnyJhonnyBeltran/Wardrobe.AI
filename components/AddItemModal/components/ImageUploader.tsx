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
import { Upload, Loader2, Camera, Image as ImageIcon, X } from 'lucide-react';
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-sm z-10 transition-all duration-300 rounded-[32px]">
            <Loader2 className="w-10 h-10 text-[var(--brand-pink)] animate-spin" />
            <span className="text-sm text-white font-semibold animate-pulse drop-shadow-lg px-4 text-center">
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
            <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-[var(--brand-pink)] animate-spin" />
                <span className="text-sm text-[var(--brand-pink)] font-semibold animate-pulse">
                    {processingMessage}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[var(--border-color)] rounded-3xl w-full h-full bg-[var(--background-secondary)] group-hover:border-[var(--brand-pink)] transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-[var(--foreground-tertiary)]" />
            </div>
            <div className="text-center">
                <span className="block text-sm font-bold text-[var(--foreground)] mb-1">Subir foto</span>
                <span className="text-xs text-[var(--foreground-tertiary)]">Toca para seleccionar</span>
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
            <label className="block text-xs font-bold text-[var(--foreground)] mb-3 uppercase tracking-wider">
                Foto de la prenda
            </label>
            
            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
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
                className="w-full max-w-[240px] mx-auto aspect-square rounded-[32px] overflow-hidden bg-[var(--background-secondary)] relative flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:shadow-[var(--brand-pink)]/5 cursor-pointer group"
                onClick={() => setShowOptions(true)}
            >
                {image ? (
                    <>
                        <div className={`relative w-full h-full transition-all duration-500 ease-out p-4 bg-white ${isProcessing ? 'scale-90 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
                            <Image
                                src={image}
                                alt="Vista previa"
                                fill
                                className="object-contain p-4"
                                unoptimized
                                priority
                            />
                            
                            {/* Overlay hint to change image */}
                            <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold py-1.5 px-4 rounded-full border border-white/10">
                                    TAP PARA CAMBIAR
                                </div>
                            </div>
                        </div>
                        
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
