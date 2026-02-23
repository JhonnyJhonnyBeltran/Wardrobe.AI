'use client';

/**
 * ImageUploader Component
 * Handles image upload with preview and rotation controls
 * 
 * Features:
 * - Drag & drop support
 * - Processing overlay with animated message
 * - Rotation controls
 * - Camera button (placeholder for future implementation)
 */

import React, { memo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Camera, RotateCw, RotateCcw, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import type { ImageUploaderProps } from '../types';

// ============================================
// Subcomponents
// ============================================

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}

/**
 * ActionButton - Reusable button for actions like rotate/camera
 */
const ActionButton = memo(function ActionButton({
    icon,
    label,
    onClick,
    disabled = false,
}: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {icon}
            <span className="text-[9px] text-[var(--foreground-tertiary)]">{label}</span>
        </button>
    );
});

/**
 * ProcessingOverlay - Shown while image is being processed
 */
const ProcessingOverlay = memo(function ProcessingOverlay({
    message,
}: {
    message: string;
}) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-[var(--brand-pink)] animate-spin" />
            <span className="text-sm text-white font-semibold animate-pulse drop-shadow-lg">
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
            <>
                <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                <span className="text-xs text-[var(--brand-pink)] font-semibold animate-pulse">
                    {processingMessage}
                </span>
            </>
        );
    }

    return (
        <>
            <Upload className="w-8 h-8 text-[var(--foreground-tertiary)]" />
            <span className="text-xs text-[var(--foreground-tertiary)]">Subir foto</span>
        </>
    );
});

// ============================================
// Main Component
// ============================================

export const ImageUploader = memo(function ImageUploader({
    image,
    isProcessing,
    processingMessage,
    onImageUpload,
    onRotate,
    onScale,
}: ImageUploaderProps) {
    // Stable callbacks
    const handleRotateRight = useCallback(() => onRotate(90), [onRotate]);
    const handleRotateLeft = useCallback(() => onRotate(-90), [onRotate]);

    // Scale handlers
    const handleZoomIn = useCallback(() => {
        console.log('Zoom In clicked');
        if (onScale) {
            onScale(1.1); // Scale up by 10%
        } else {
            console.warn('onScale not provided');
        }
    }, [onScale]);

    const handleZoomOut = useCallback(() => {
        console.log('Zoom Out clicked');
        if (onScale) {
            onScale(0.9); // Scale down by 10%
        } else {
            console.warn('onScale not provided');
        }
    }, [onScale]);

    // Listen for crop event from parent
    useEffect(() => {
        const handleOpenCropper = () => {
            // Dispatch custom event that parent can listen to
            const event = new CustomEvent('triggerCrop', { detail: { image } });
            window.dispatchEvent(event);
        };

        window.addEventListener('openCropper', handleOpenCropper);
        return () => window.removeEventListener('openCropper', handleOpenCropper);
    }, [image]);

    return (
        <div>
            <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                Foto de la prenda
            </label>
            <div className="flex gap-2">
                {/* Image Upload Area */}
                <label className="flex-1 cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="hidden"
                        aria-label="Subir imagen"
                    />
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-colors flex flex-col items-center justify-center gap-2 bg-[var(--background-secondary)] relative overflow-hidden">
                        {image ? (
                            <>
                                <div className={`relative w-full h-full p-2 bg-white transition-opacity duration-200 ${isProcessing ? 'opacity-40' : 'opacity-100'}`}>
                                    <Image
                                        src={image}
                                        alt="Vista previa"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized // Required for data URLs and blob URLs
                                    />
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

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    <ActionButton
                        icon={<Camera className="w-6 h-6 text-[var(--foreground-tertiary)]" />}
                        label="Cámara"
                        disabled // TODO: Implement camera capture
                    />

                    {image && (
                        <>
                            <ActionButton
                                icon={<ZoomIn className="w-6 h-6 text-[var(--foreground-tertiary)]" />}
                                label="Acercar"
                                onClick={handleZoomIn}
                            />
                            <ActionButton
                                icon={<ZoomOut className="w-6 h-6 text-[var(--foreground-tertiary)]" />}
                                label="Alejar"
                                onClick={handleZoomOut}
                            />
                            <ActionButton
                                icon={<RotateCw className="w-6 h-6 text-[var(--foreground-tertiary)]" />}
                                label="Girar →"
                                onClick={handleRotateRight}
                            />
                            <ActionButton
                                icon={<RotateCcw className="w-6 h-6 text-[var(--foreground-tertiary)]" />}
                                label="Girar ←"
                                onClick={handleRotateLeft}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});
