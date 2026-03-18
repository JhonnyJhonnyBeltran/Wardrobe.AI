'use client';

/**
 * AddItemModal - Refactored Version
 * 
 * A modular, scalable modal for adding/editing clothing items.
 * 
 * Architecture:
 * - constants.ts: All predefined options and configuration
 * - types.ts: TypeScript interfaces and types
 * - hooks/useAddItemForm.ts: All form logic and state management
 * - components/: Reusable UI components (dropdowns, image handlers, etc.)
 * 
 * This file is the orchestrator that composes all pieces together.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, Check, Crop } from 'lucide-react';
import { Button, AdvisorModal } from '@/components';
import { useBodyScrollLock } from '@/lib/hooks';
import { useUiStore } from '@/store/uiStore';

// Local imports
import { useAddItemForm } from './hooks/useAddItemForm';
import { useCategoriesAndBrands } from '@/lib/hooks/useCategoriesAndBrands';
import {
    DropdownWithCustom,
    CustomSelect,
    ImageUploader,
} from './components';
import {
    SIZE_OPTIONS,
    FABRIC_OPTIONS,
    SEASON_OPTIONS,
    COLOR_OPTIONS,
} from './constants';
import type { AddItemModalProps } from './types';

export default function AddItemModal({
    isOpen,
    onClose,
    onAdd,
    initialData,
    isEditing = false
}: AddItemModalProps) {
    // Lock body scroll
    useBodyScrollLock(isOpen);

    // All form logic is encapsulated in the hook
    const {
        mode,
        setMode,
        formData,
        setFormData,
        image,
        originalImage,
        processedImage,
        isProcessing,
        processingMessage,
        handleImageUpload,
        handleColorSelect,
        handleColorPickerChange,
        rotateImage,
        scaleImage,
        buildPayload,
        resetForm,
        error,
    } = useAddItemForm({ isOpen, initialData, isEditing });

    // Fetch categories and brands from database
    const { categories, brands, isLoading: isOptionsLoading } = useCategoriesAndBrands();

    // Prevent duplicate submissions
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Advisor modal state (kept here as it's UI-specific)
    const [showAdvisor, setShowAdvisor] = React.useState(false);

    // Listen for crop trigger from ImageUploader
    React.useEffect(() => {
        const handleTriggerCrop = () => {
            // Cropper removed - just use the image as-is
        };
        window.addEventListener('triggerCrop', handleTriggerCrop);
        return () => window.removeEventListener('triggerCrop', handleTriggerCrop);
    }, [image]);

    const handleCropComplete = (croppedImage: Blob) => {
        // Cropper removed - no action needed
    };

    const handleSubmit = async () => {
        if (isProcessing || isSubmitting) {
            console.log('Still processing image or submitting, wait...');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = buildPayload();
            await onAdd(payload);

            // Clear pending item on success
            if (!isEditing) {
                useUiStore.getState().clearPendingUploadItem();
                useUiStore.getState().showModal({
                    title: '¡Prenda guardada!',
                    message: 'Tu prenda se ha añadido correctamente a tu armario.',
                    type: 'success',
                    confirmText: 'Genial'
                });
                resetForm();
            } else {
                useUiStore.getState().showModal({
                    title: '¡Prenda actualizada!',
                    message: 'Los cambios se han guardado correctamente.',
                    type: 'success',
                    confirmText: 'Genial'
                });
            }

            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveToPending = () => {
        if (!isEditing && (image || formData.name !== '')) {
            useUiStore.getState().setPendingUploadItem({
                formData,
                image,
                originalImage,
                processedImage
            });
        }
    };

    const handleBackdropClick = () => {
        saveToPending();
        onClose();
    };

    const handleCloseClick = () => {
        if (!isEditing && image) {
            useUiStore.getState().showModal({
                title: '¿Cancelar subida?',
                message: 'Se perderán los datos de la prenda que estabas añadiendo. ¿Estás seguro?',
                type: 'warning',
                confirmText: 'Sí, cancelar',
                cancelText: 'Seguir editando',
                onConfirm: () => {
                    useUiStore.getState().clearPendingUploadItem();
                    resetForm();
                    onClose();
                }
            });
        } else {
            saveToPending(); // Save edit state if needed, though mostly for creations
            onClose();
        }
    };

    const handleAdvisorConfirm = () => {
        // handleManualProcess();
        setShowAdvisor(false);
    };

    return (<>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="add-item-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 bg-black/50 z-[80] flex items-end md:items-center justify-center p-0 md:p-4"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        key="add-item-content"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full md:max-w-lg bg-[var(--background)] rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[85vh] md:h-auto md:max-h-[85vh] mb-16 md:mb-0 flex flex-col"
                    >
                        {/* Floating Close Button */}
                        <div className="sticky top-0 z-50 flex justify-end px-4 pt-4">
                            <motion.button
                                onClick={handleCloseClick}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    transition: { delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }
                                }}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: 90,
                                    transition: { duration: 0.15, ease: 'easeOut' }
                                }}
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 rounded-full bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-sm flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-75 ease-out"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 md:px-6 pb-24 md:pb-6 custom-scrollbar scroll-smooth">
                            {/* Mode Toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('quick')}
                                    className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${mode === 'quick'
                                        ? 'bg-[var(--brand-pink)] text-white'
                                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                                        }`}
                                >
                                    Rápido
                                </button>
                                <button
                                    onClick={() => setMode('complete')}
                                    className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${mode === 'complete'
                                        ? 'bg-[var(--brand-pink)] text-white'
                                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                                        }`}
                                >
                                    Completo
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-300"
                                >
                                    <div className="shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {error}
                                    </div>
                                </motion.div>
                            )}

                            {/* Image Input Area */}
                            <div className="min-h-[150px]">
                                <ImageUploader
                                    image={image}
                                    isProcessing={isProcessing}
                                    processingMessage={processingMessage}
                                    onImageUpload={handleImageUpload}
                                    onRotate={rotateImage}
                                    onScale={scaleImage}
                                />
                            </div>

                            {/* Type Selector - Always visible */}
                            <div className="space-y-3">
                                <CustomSelect
                                    label="Tipo de prenda"
                                    value={formData.type}
                                    onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                    options={categories}
                                />
                            </div>

                            {/* Complete Mode Fields */}
                            {mode === 'complete' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="ej: Blazer Oversize"
                                            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                        />
                                    </div>

                                    {/* Brand */}
                                    <DropdownWithCustom
                                        label="Marca"
                                        value={formData.brand}
                                        onChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                                        options={brands}
                                        placeholder="Seleccionar marca..."
                                    />

                                    {/* Size and Reference grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <DropdownWithCustom
                                            label="Talla"
                                            value={formData.size}
                                            onChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                                            options={SIZE_OPTIONS}
                                            placeholder="Seleccionar..."
                                        />

                                        <div>
                                            <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                                Referencia
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.reference}
                                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                                placeholder="Opcional"
                                                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                            />
                                        </div>
                                    </div>

                                    {/* Color */}
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                                            Color
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {COLOR_OPTIONS.map((colorOption) => (
                                                <button
                                                    key={colorOption.name}
                                                    type="button"
                                                    onClick={() => handleColorSelect(colorOption)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === colorOption.name
                                                        ? 'border-[var(--brand-pink)] scale-110 ring-2 ring-[var(--brand-pink)]/30'
                                                        : 'border-[var(--border-color)] hover:scale-105'
                                                        }`}
                                                    style={{ backgroundColor: colorOption.hex }}
                                                    title={colorOption.name}
                                                />
                                            ))}
                                            <input
                                                type="color"
                                                value={formData.colorHex}
                                                onChange={(e) => handleColorPickerChange(e.target.value)}
                                                className="w-8 h-8 rounded-full border border-[var(--border-color)] cursor-pointer"
                                                title="Color personalizado"
                                            />
                                        </div>
                                        {formData.color && (
                                            <p className="text-xs text-[var(--foreground-secondary)]">
                                                Color seleccionado: <strong>{formData.color}</strong>
                                            </p>
                                        )}
                                    </div>

                                    {/* Fabric */}
                                    <DropdownWithCustom
                                        label="Tejido"
                                        value={formData.fabric}
                                        onChange={(value) => setFormData(prev => ({ ...prev, fabric: value }))}
                                        options={FABRIC_OPTIONS}
                                        placeholder="Seleccionar tejido..."
                                    />

                                    {/* Season */}
                                    <CustomSelect
                                        label="Temporada"
                                        value={formData.season}
                                        onChange={(value) => setFormData(prev => ({ ...prev, season: value }))}
                                        options={SEASON_OPTIONS}
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Submit Button - Fixed at bottom for mobile */}
                        <div className="flex-shrink-0 p-4 pt-2 pb-3 bg-[var(--background)] border-t border-[var(--border-color)]">
                            <Button
                                onClick={handleSubmit}
                                disabled={!image || isProcessing || isSubmitting}
                                className="w-full"
                                glow={!!image && !isProcessing && !isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {isEditing ? 'Guardando...' : 'Añadiendo...'}
                                    </>
                                ) : isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {processingMessage || 'Procesando...'}
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        {isEditing ? 'Guardar Cambios' : 'Añadir Prenda'}
                                    </>
                                )}
                            </Button>
                            {isProcessing && (
                                <p className="text-xs text-center text-[var(--foreground-tertiary)] mt-2">
                                    Puedes seguir rellenando el formulario mientras se procesa
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <AdvisorModal
            key="advisor-modal"
            isOpen={showAdvisor}
            onClose={() => setShowAdvisor(false)}
            onConfirm={handleAdvisorConfirm}
        />

        {/* Image Cropper Modal - Removed */}
    </>);
}
