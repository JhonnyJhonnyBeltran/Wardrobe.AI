'use client';

/**
 * AddMoreModal Component
 * Provides a clean modal to select Camera or Gallery when adding more garments
 * to an existing upload (single or batch).
 */

import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFilesSelected: (files: FileList | File[]) => void;
    maxAllowed?: number;
}

export function AddMoreModal({
    isOpen,
    onClose,
    onFilesSelected,
    maxAllowed = 20,
}: AddMoreModalProps) {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleOptionSelect = (type: 'camera' | 'gallery') => {
        onClose();
        setTimeout(() => {
            if (type === 'camera' && cameraInputRef.current) {
                cameraInputRef.current.click();
            } else if (type === 'gallery' && galleryInputRef.current) {
                galleryInputRef.current.click();
            }
        }, 150);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
        e.target.value = '';
    };

    return (
        <>
            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                ref={galleryInputRef}
                className="hidden"
                aria-label="Subir desde galería"
            />
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                ref={cameraInputRef}
                className="hidden"
                aria-label="Tomar foto"
            />

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[var(--card-bg)] w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border border-[var(--border-color)] z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors cursor-pointer"
                                aria-label="Cerrar"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1 text-center">
                                Añadir más prendas
                            </h3>
                            <p className="text-xs text-[var(--foreground-secondary)] mb-5 text-center">
                                Selecciona fotos adicionales para añadirlas a tu subida
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleOptionSelect('camera')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)] hover:text-white transition-all group cursor-pointer border border-[var(--border-color)]/50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-[var(--foreground)] group-hover:text-white">Cámara</span>
                                        <span className="text-xs text-[var(--foreground-tertiary)] group-hover:text-white/80">Tomar una foto nueva</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleOptionSelect('gallery')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--brand-pink)] hover:text-white transition-all group cursor-pointer border border-[var(--border-color)]/50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--background)] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-[var(--foreground)] group-hover:text-white">Galería</span>
                                        <span className="text-xs text-[var(--foreground-tertiary)] group-hover:text-white/80">Elegir de tus fotos (hasta {maxAllowed})</span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
