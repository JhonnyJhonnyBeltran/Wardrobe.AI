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

import React, { memo } from 'react';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-sm z-10 transition-all duration-300">
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
    return (
        <div className="w-full">
            <label className="block text-xs font-bold text-[var(--foreground)] mb-3 uppercase tracking-wider">
                Foto de la prenda
            </label>
            
            {/* Image Upload Area */}
            <label className="block relative cursor-pointer group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                    aria-label="Subir imagen"
                />
                
                <div className="aspect-square rounded-[32px] overflow-hidden bg-[var(--background-secondary)] relative flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:shadow-[var(--brand-pink)]/5">
                    {image ? (
                        <>
                            <div className={`relative w-full h-full transition-all duration-500 ease-out p-4 bg-white ${isProcessing ? 'scale-90 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
                                <Image
                                    src={image}
                                    alt="Vista previa"
                                    fill
                                    className="object-contain p-4"
                                    unoptimized // Required for data URLs and blob URLs
                                    priority
                                />
                                
                                {/* Overlay hint to change image */}
                                <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
            </label>
        </div>
    );
});
