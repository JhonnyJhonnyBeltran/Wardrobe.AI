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
import { X, Loader2, Check, Plus } from 'lucide-react';
import { Button, AdvisorModal } from '@/components';
import { useBodyScrollLock } from '@/lib/hooks';
import { useUiStore } from '@/store/uiStore';
import { normalizeBrand, generateSlug } from '@/lib/utils/string';

// Local imports
import { useAddItemForm } from './hooks/useAddItemForm';
import { useCategoriesAndBrands } from '@/lib/hooks/useCategoriesAndBrands';
import {
    DropdownWithCustom,
    CustomSelect,
    ImageUploader,
    BatchCarousel,
    AddMoreModal,
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
    isEditing = false,
}: AddItemModalProps) {
    // Lock body scroll while modal is open
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
        batchItems,
        currentBatchIndex,
        setCurrentBatchIndex,
        updateBatchItemFormData,
        removeBatchItem,
        buildBatchPayloads,
        isProcessing,
        processingMessage,
        handleImageUpload,
        appendFiles,
        handleColorSelect,
        handleColorPickerChange,
        buildPayload,
        resetForm,
        error,
        setError,
    } = useAddItemForm({ isOpen, initialData, isEditing });

    // Fetch categories and brands from database
    const { categories, brands, refetch: refetchBrands } = useCategoriesAndBrands();

    // Prevent duplicate submissions
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [savingProgress, setSavingProgress] = React.useState<{ current: number; total: number } | null>(null);

    // Advisor modal state (kept here as it's UI-specific)
    const [showAdvisor, setShowAdvisor] = React.useState(false);

    // Cancel confirmation state
    const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

    // Add more photos modal state
    const [showAddMore, setShowAddMore] = React.useState(false);

    const isBatch = batchItems.length > 0;


    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (isProcessing || isSubmitting) return;

        // ── Batch Submission Path ──
        if (isBatch) {
            setIsSubmitting(true);
            try {
                const batchPayloads = buildBatchPayloads();
                if (batchPayloads.length === 0) {
                    setError('No hay prendas válidas para añadir.');
                    setIsSubmitting(false);
                    return;
                }

                let addedCount = 0;
                for (let i = 0; i < batchPayloads.length; i++) {
                    setSavingProgress({ current: i + 1, total: batchPayloads.length });
                    const payload = batchPayloads[i];

                    // Check if brand is new and needs to be added
                    if (payload.brand) {
                        const normalizedBrand = normalizeBrand(payload.brand);
                        const brandExists = brands.some(b => normalizeBrand(b).toLowerCase() === normalizedBrand.toLowerCase());

                        if (!brandExists) {
                            try {
                                const response = await fetch('/api/brands', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name: normalizedBrand,
                                        slug: generateSlug(normalizedBrand),
                                    }),
                                });
                                if (response.ok) refetchBrands();
                            } catch (brandErr) {
                                console.warn('[AddItemModal] Failed to add new brand in batch:', brandErr);
                            }
                        }
                    }

                    const success = await onAdd(payload);
                    if (success !== false) {
                        addedCount++;
                    }
                }

                useUiStore.getState().clearPendingUploadItem();
                useUiStore.getState().showModal({
                    title: '¡Prendas guardadas!',
                    message: `Se han añadido ${addedCount} ${addedCount === 1 ? 'prenda' : 'prendas'} correctamente a tu armario.`,
                    type: 'success',
                    confirmText: 'Genial',
                });
                resetForm();
                onClose();
            } catch (err) {
                console.error('[AddItemModal] Error in batch handleSubmit:', err);
            } finally {
                setIsSubmitting(false);
                setSavingProgress(null);
            }
            return;
        }

        // ── Single Item Submission Path ──
        setIsSubmitting(true);
        try {
            const payload = buildPayload();
            
            // Validate source URL if present
            if (payload.sourceUrl) {
                let url = payload.sourceUrl.trim();
                const blockedDomains = ['pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'onlyfans', 'chaturbate'];
                const urlLower = url.toLowerCase();
                
                if (blockedDomains.some(d => urlLower.includes(d))) {
                    useUiStore.getState().showModal({
                        title: 'Enlace no permitido',
                        message: 'Solo se permiten enlaces a tiendas de ropa y sitios legítimos.',
                        type: 'error',
                        confirmText: 'Entendido'
                    });
                    setIsSubmitting(false);
                    return;
                }
                
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                    payload.sourceUrl = url;
                }
            }
            
            // Check if brand is new and needs to be added to global database
            if (payload.brand) {
                const normalizedBrand = normalizeBrand(payload.brand);
                const brandExists = brands.some(b => normalizeBrand(b).toLowerCase() === normalizedBrand.toLowerCase());

                if (!brandExists) {
                    try {
                        console.log(`[AddItemModal] Adding new brand to database: ${normalizedBrand}`);
                        const response = await fetch('/api/brands', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: normalizedBrand,
                                slug: generateSlug(normalizedBrand),
                            }),
                        });
                        
                        if (response.ok) {
                            refetchBrands();
                        }
                    } catch (brandErr) {
                        console.warn('[AddItemModal] Failed to add new brand to global list:', brandErr);
                    }
                }
            }

            const success = await onAdd(payload);

            if (success === false) {
                console.warn('[AddItemModal] Submission returned false');
                return;
            }

            if (!isEditing) {
                useUiStore.getState().clearPendingUploadItem();
                useUiStore.getState().showModal({
                    title: '¡Prenda guardada!',
                    message: 'Tu prenda se ha añadido correctamente a tu armario.',
                    type: 'success',
                    confirmText: 'Genial',
                });
                resetForm();
            } else {
                useUiStore.getState().showModal({
                    title: '¡Prenda actualizada!',
                    message: 'Los cambios se han guardado correctamente.',
                    type: 'success',
                    confirmText: 'Genial',
                });
            }

            onClose();
        } catch (err) {
            console.error('[AddItemModal] Error in handleSubmit:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveToPending = () => {
        if (!isEditing) {
            if (batchItems && batchItems.length > 0) {
                useUiStore.getState().setPendingUploadItem({
                    batchItems,
                    formData: batchItems[currentBatchIndex]?.formData || formData,
                    image: batchItems[currentBatchIndex]?.image || image,
                    originalImage: batchItems[currentBatchIndex]?.originalImage || originalImage,
                    processedImage: batchItems[currentBatchIndex]?.processedImage || processedImage,
                    name: `Subida múltiple (${batchItems.length} prendas)`
                });
            } else if (image || (formData.name && formData.name.trim() !== '' && formData.name !== 'Nueva prenda')) {
                useUiStore.getState().setPendingUploadItem({
                    formData,
                    image,
                    originalImage,
                    processedImage,
                    name: formData.name || 'Nueva prenda'
                });
            }
        }
    };

    const handleBackdropClick = () => {
        if (!isEditing && (isBatch || image || formData.name.trim() !== '')) {
            saveToPending();
        }
        onClose();
    };

    const handleHeaderCloseClick = () => {
        if (!isEditing && (isBatch || image || formData.name.trim() !== '')) {
            saveToPending();
        }
        onClose();
    };

    const handleCancelButtonClick = () => {
        if (!isEditing && (isBatch || image || formData.name.trim() !== '')) {
            setShowCancelConfirm(true);
        } else {
            onClose();
        }
    };

    const handleAdvisorConfirm = () => {
        setShowAdvisor(false);
    };

    // ─── Derived flags ────────────────────────────────────────────────────────

    // In edit mode the image is always pre-filled; allow submit as long as there is one
    const canSubmit = isBatch
        ? batchItems.some(item => !item.error && (item.image || item.originalImage)) && !isProcessing && !isSubmitting
        : !!image && !isProcessing && !isSubmitting;

    // Show all form fields when in "complete" mode OR when editing an existing item
    const showAllFields = mode === 'complete' || isEditing;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="add-item-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4"
                        onClick={handleBackdropClick}
                    >
                        <motion.div
                            key="add-item-content"
                            layout
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full bg-[var(--background)] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-[var(--border-color)] transition-all duration-300 ${
                                isBatch
                                    ? 'max-w-md md:max-w-lg max-h-[90vh] h-auto'
                                    : mode === 'quick' && !isEditing
                                    ? 'max-w-md max-h-[85vh] h-auto'
                                    : 'max-w-2xl max-h-[88vh] h-[88vh] md:h-auto md:max-h-[85vh]'
                            }`}
                        >
                            {/* ── Header with Title and Close Button ── */}
                            <div className="sticky top-0 z-50 flex items-center justify-between px-6 pt-5 pb-2 bg-[var(--background)] border-b border-[var(--border-color)]/40">
                                <div>
                                    <h3 className="text-base font-bold text-[var(--foreground)]">
                                        {isEditing ? 'Editar prenda' : isBatch ? 'Subir prendas' : 'Subir nueva prenda'}
                                    </h3>
                                    <p className="text-xs text-[var(--foreground-tertiary)]">
                                        {isBatch 
                                            ? `Subida múltiple (${batchItems.length} prendas seleccionadas)`
                                            : mode === 'quick' && !isEditing 
                                            ? 'Modo de creación rápida' 
                                            : 'Detalles completos de la prenda'
                                        }
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleHeaderCloseClick}
                                    className="w-9 h-9 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                    aria-label="Cerrar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── Scrollable Content ── */}
                            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 md:px-6 py-4 custom-scrollbar scroll-smooth space-y-4">

                                {/* Mode Toggle — only relevant when CREATING a new item and not in multi-batch */}
                                {!isEditing && !isBatch && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMode('quick')}
                                            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                                                mode === 'quick'
                                                    ? 'bg-[var(--brand-pink)] text-white'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                                            }`}
                                        >
                                            Rápido
                                        </button>
                                        <button
                                            onClick={() => setMode('complete')}
                                            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                                                mode === 'complete'
                                                    ? 'bg-[var(--brand-pink)] text-white'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)]'
                                            }`}
                                        >
                                            Completo
                                        </button>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-300"
                                    >
                                        <div className="shrink-0">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-medium">{error}</div>
                                    </motion.div>
                                )}

                                {/* ── Batch Carousel View (Multi-photo) ── */}
                                {isBatch ? (
                                    <BatchCarousel
                                        batchItems={batchItems}
                                        currentIndex={currentBatchIndex}
                                        onSelectIndex={setCurrentBatchIndex}
                                        onUpdateFormData={updateBatchItemFormData}
                                        onRemoveItem={removeBatchItem}
                                        onOpenAddMore={() => setShowAddMore(true)}
                                        categories={categories}
                                        brands={brands}
                                        mode={mode}
                                    />
                                ) : (
                                    /* ── Single Item View ── */
                                    <div className="space-y-4">
                                        {/* Image Area with Add More (+) Button on the Right */}
                                        <div className="relative w-full max-w-[240px] mx-auto min-h-[150px]">
                                            <ImageUploader
                                                image={image}
                                                isProcessing={isProcessing}
                                                processingMessage={processingMessage}
                                                onImageUpload={handleImageUpload}
                                            />
                                            {image && !isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddMore(true)}
                                                    className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-30 border-2 border-[var(--background)] group"
                                                    title="Añadir más prendas"
                                                    aria-label="Añadir más prendas"
                                                >
                                                    <Plus className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Helper Pill to Add More Garments */}
                                        {image && !isEditing && (
                                            <div className="flex justify-center -mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddMore(true)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--background-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-all cursor-pointer shadow-sm active:scale-95"
                                                >
                                                    <Plus className="w-3.5 h-3.5 text-[var(--brand-pink)] stroke-[2.5]" />
                                                    <span>Añadir más prendas a esta subida</span>
                                                </button>
                                            </div>
                                        )}

                                        {/* Nombre de la prenda (auto-detected, always visible) */}
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                                Nombre de la prenda
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                placeholder="ej: Camiseta Polo Ralph Lauren"
                                                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--foreground-tertiary)] text-sm font-medium"
                                            />
                                        </div>

                                        {/* Tipo de prenda — always visible */}
                                        <CustomSelect
                                            label="Tipo de prenda"
                                            value={formData.type}
                                            onChange={(value) =>
                                                setFormData((prev) => ({ ...prev, type: value }))
                                            }
                                            options={categories}
                                        />

                                        {/* Color — always visible */}
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                                                Color
                                            </label>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {COLOR_OPTIONS.map((colorOption) => (
                                                    <button
                                                        key={colorOption.name}
                                                        type="button"
                                                        onClick={() => handleColorSelect(colorOption)}
                                                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                                                            formData.color === colorOption.name
                                                                ? 'border-[var(--brand-pink)] scale-110 ring-2 ring-[var(--brand-pink)]/30'
                                                                : 'border-[var(--border-color)] hover:scale-105'
                                                        }`}
                                                        style={{ backgroundColor: colorOption.hex }}
                                                        title={colorOption.name}
                                                    />
                                                ))}
                                                {formData.color && (
                                                    <span className="text-xs font-medium text-[var(--foreground-secondary)] ml-1">
                                                        {formData.color}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Extended fields (complete mode or edit mode) */}
                                        {showAllFields && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-4 pt-2"
                                            >
                                                {/* Brand */}
                                                <DropdownWithCustom
                                                    label="Marca"
                                                    value={formData.brand}
                                                    onChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            brand: value,
                                                        }))
                                                    }
                                                    options={brands}
                                                    placeholder="Seleccionar marca..."
                                                />

                                                {/* Size + Reference */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <DropdownWithCustom
                                                        label="Talla"
                                                        value={formData.size}
                                                        onChange={(value) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                size: value,
                                                            }))
                                                        }
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
                                                            onChange={(e) =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    reference: e.target.value,
                                                                }))
                                                            }
                                                            placeholder="Opcional"
                                                            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--foreground-tertiary)]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Source URL */}
                                                <div>
                                                    <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                                        Enlace a la prenda
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={formData.sourceUrl}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                sourceUrl: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="ej: https://zara.com/... (Opcional)"
                                                        className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--foreground-tertiary)]"
                                                    />
                                                </div>

                                                {/* Fabric */}
                                                <DropdownWithCustom
                                                    label="Tejido"
                                                    value={formData.fabric}
                                                    onChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            fabric: value,
                                                        }))
                                                    }
                                                    options={FABRIC_OPTIONS}
                                                    placeholder="Seleccionar tejido..."
                                                />

                                                {/* Season */}
                                                <CustomSelect
                                                    label="Temporada"
                                                    value={formData.season}
                                                    onChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            season: value,
                                                        }))
                                                    }
                                                    options={SEASON_OPTIONS}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Bottom Action Buttons ── */}
                            <div className="flex-shrink-0 p-4 pt-3 pb-6 md:pb-4 bg-[var(--background)] border-t border-[var(--border-color)] safe-bottom">
                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        type="button"
                                        onClick={handleCancelButtonClick}
                                        className="px-5 py-3 rounded-2xl bg-[var(--background-secondary)] hover:bg-[var(--border-color)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className="flex-1 py-3 rounded-2xl text-xs sm:text-sm font-semibold"
                                        glow={canSubmit}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {isBatch 
                                                    ? (savingProgress ? `Guardando ${savingProgress.current} de ${savingProgress.total}...` : 'Guardando prendas...') 
                                                    : (isEditing ? 'Guardando...' : 'Añadiendo...')
                                                }
                                            </>
                                        ) : isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {isBatch
                                                    ? `Procesando ${batchItems.filter(i => !i.isProcessing).length} de ${batchItems.length}...`
                                                    : (processingMessage || 'Procesando...')
                                                }
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                {isBatch
                                                    ? `Añadir ${batchItems.filter(i => !i.error && (i.image || i.originalImage)).length} Prendas`
                                                    : (isEditing ? 'Guardar Cambios' : 'Añadir Prenda')
                                                }
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {isProcessing && (
                                    <p className="text-xs text-center text-[var(--foreground-tertiary)] mt-2">
                                        {isBatch 
                                            ? 'Puedes ir revisando y personalizando cada prenda mientras se procesan las demás'
                                            : 'Puedes seguir rellenando el formulario mientras se procesa'
                                        }
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowCancelConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-sm bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] shadow-2xl z-10 text-center space-y-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                                <X className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-[var(--foreground)]">¿Cancelar subida de prenda?</h4>
                                <p className="text-xs text-[var(--foreground-secondary)] mt-1.5 leading-relaxed">
                                    Si eliminas la subida, se descartarán la fotografía y los datos que hayas introducido.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="w-full py-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--border-color)] text-[var(--foreground)] font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                                >
                                    Seguir editando
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCancelConfirm(false);
                                        useUiStore.getState().clearPendingUploadItem();
                                        resetForm();
                                        onClose();
                                    }}
                                    className="w-full py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 font-semibold text-xs transition-colors cursor-pointer"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Photo Format / AI Error Modal */}
            <AnimatePresence>
                {error && (
                    <div className="fixed inset-0 z-[10006] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setError(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-sm bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] shadow-2xl z-10 text-center space-y-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                                <X className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-[var(--foreground)]">Formato de foto no válido</h4>
                                <p className="text-xs text-[var(--foreground-secondary)] mt-1.5 leading-relaxed">
                                    {error}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="w-full py-3 rounded-xl bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AdvisorModal
                key="advisor-modal"
                isOpen={showAdvisor}
                onClose={() => setShowAdvisor(false)}
                onConfirm={handleAdvisorConfirm}
            />

            <AddMoreModal
                isOpen={showAddMore}
                onClose={() => setShowAddMore(false)}
                onFilesSelected={(files) => appendFiles(files)}
                maxAllowed={20 - batchItems.length}
            />
        </>
    );
}
