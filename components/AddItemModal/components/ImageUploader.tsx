'use client';

/**
 * ImageUploader Component
 * Handles image upload with preview and rotation controls
 */

import React from 'react';
import { Upload, Camera, RotateCw, RotateCcw, Loader2 } from 'lucide-react';
import type { ImageUploaderProps } from '../types';

export function ImageUploader({
    image,
    isProcessing,
    processingMessage,
    onImageUpload,
    onRotate,
}: ImageUploaderProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                Foto de la prenda
            </label>
            <div className="flex gap-2">
                <label className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="hidden"
                    />
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-[var(--background-secondary)] relative overflow-hidden">
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                <span className="text-xs text-[var(--brand-pink)] font-semibold animate-pulse">
                                    {processingMessage}
                                </span>
                            </>
                        ) : image ? (
                            <img
                                src={image}
                                alt="Preview"
                                className="w-full h-full object-contain p-2 bg-white"
                            />
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-[var(--foreground-tertiary)]" />
                                <span className="text-xs text-[var(--foreground-tertiary)]">Subir foto</span>
                            </>
                        )}
                    </div>
                </label>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors"
                    >
                        <Camera className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                        <span className="text-[9px] text-[var(--foreground-tertiary)]">Cámara</span>
                    </button>

                    {image && (
                        <>
                            <button
                                type="button"
                                onClick={() => onRotate(90)}
                                className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors"
                            >
                                <RotateCw className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                                <span className="text-[9px] text-[var(--foreground-tertiary)]">Girar →</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onRotate(-90)}
                                className="w-20 aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1 hover:bg-[var(--background-tertiary)] transition-colors"
                            >
                                <RotateCcw className="w-6 h-6 text-[var(--foreground-tertiary)]" />
                                <span className="text-[9px] text-[var(--foreground-tertiary)]">Girar ←</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
