'use client';

/**
 * BatchCarousel Component
 * Displays an interactive carousel/slider for multi-item garment uploads (up to 20 photos).
 * Allows the user to slide through garments one by one, edit names, categories, and colors,
 * and view thumbnails with real-time AI processing status.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, Loader2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { DropdownWithCustom } from './DropdownWithCustom';
import {
    SIZE_OPTIONS,
    FABRIC_OPTIONS,
    SEASON_OPTIONS,
    COLOR_OPTIONS,
} from '../constants';
import type { BatchItem, ItemFormData, SelectOption, FormMode } from '../types';

interface BatchCarouselProps {
    batchItems: BatchItem[];
    currentIndex: number;
    onSelectIndex: (index: number) => void;
    onUpdateFormData: (index: number, data: Partial<ItemFormData>) => void;
    onRemoveItem: (index: number) => void;
    categories: SelectOption[];
    brands: string[];
    mode: FormMode;
}

export const BatchCarousel = memo(function BatchCarousel({
    batchItems,
    currentIndex,
    onSelectIndex,
    onUpdateFormData,
    onRemoveItem,
    categories,
    brands,
    mode,
}: BatchCarouselProps) {
    const currentItem = batchItems[currentIndex] || batchItems[0];
    if (!currentItem) return null;

    const totalCount = batchItems.length;
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < totalCount - 1;

    const handlePrev = () => {
        if (canGoPrev) onSelectIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (canGoNext) onSelectIndex(currentIndex + 1);
    };

    const handleColorSelect = (colorOption: { name: string; hex: string }) => {
        onUpdateFormData(currentIndex, { color: colorOption.name, colorHex: colorOption.hex });
    };

    const handleColorPickerChange = (hex: string) => {
        onUpdateFormData(currentIndex, { colorHex: hex });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* ── Top Navigation & Slide Counter ── */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border border-[var(--brand-pink)]/20">
                        <Sparkles className="w-3 h-3 mr-1 inline-block" />
                        Prenda {currentIndex + 1} de {totalCount}
                    </span>
                    {currentItem.isProcessing && (
                        <span className="text-[11px] font-medium text-[var(--foreground-tertiary)] flex items-center gap-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin text-[var(--brand-pink)]" />
                            Analizando...
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={!canGoPrev}
                        className="w-8 h-8 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[var(--foreground)] transition-colors cursor-pointer"
                        aria-label="Prenda anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className="w-8 h-8 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[var(--foreground)] transition-colors cursor-pointer"
                        aria-label="Prenda siguiente"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRemoveItem(currentIndex)}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors cursor-pointer ml-1"
                        title="Descartar esta prenda"
                        aria-label="Descartar prenda"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ── Thumbnail Strip ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar touch-pan-x">
                {batchItems.map((item, idx) => {
                    const isSelected = idx === currentIndex;
                    const previewImg = item.image || item.originalImage;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectIndex(idx)}
                            className={`relative flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                                isSelected
                                    ? 'ring-2 ring-[var(--brand-pink)] scale-105 border-transparent shadow-md'
                                    : 'border-[var(--border-color)] opacity-70 hover:opacity-100 hover:border-[var(--brand-pink)]/40'
                            }`}
                        >
                            {previewImg ? (
                                <div className="relative w-full h-full bg-white dark:bg-[#151518] p-1">
                                    <Image
                                        src={previewImg}
                                        alt={`Miniatura ${idx + 1}`}
                                        fill
                                        className="object-contain p-1"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-[var(--background-secondary)] flex items-center justify-center">
                                    <span className="text-xs font-bold text-[var(--foreground-tertiary)]">{idx + 1}</span>
                                </div>
                            )}

                            {/* Status Overlay Badge */}
                            <div className="absolute top-1 right-1">
                                {item.isProcessing ? (
                                    <div className="w-4 h-4 rounded-full bg-black/60 flex items-center justify-center">
                                        <Loader2 className="w-2.5 h-2.5 text-[var(--brand-pink)] animate-spin" />
                                    </div>
                                ) : item.error ? (
                                    <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── Active Item Presentation ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    {/* Image Preview Container */}
                    <div className="w-full max-w-[220px] mx-auto aspect-square rounded-3xl overflow-hidden bg-white dark:bg-[#151518] border border-[var(--border-color)] relative flex items-center justify-center shadow-sm">
                        {currentItem.image ? (
                            <div className="relative w-full h-full p-3">
                                <Image
                                    src={currentItem.image}
                                    alt={currentItem.formData.name || 'Prenda'}
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 p-4">
                                <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                <span className="text-xs text-[var(--foreground-tertiary)] font-medium">Cargando foto...</span>
                            </div>
                        )}

                        {/* Processing Badge Overlay */}
                        {currentItem.isProcessing && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3 text-center">
                                <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                <span className="text-xs font-bold text-white animate-pulse">
                                    Eliminando fondo con IA...
                                </span>
                            </div>
                        )}

                        {/* Error Badge */}
                        {currentItem.error && (
                            <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                                <AlertCircle className="w-6 h-6 text-red-300" />
                                <span className="text-xs font-bold text-white">
                                    {currentItem.error}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Form Fields for Active Item ── */}
                    <div className="space-y-3">
                        {/* Name Input */}
                        <div>
                            <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                                Nombre de la prenda
                            </label>
                            <input
                                type="text"
                                value={currentItem.formData.name}
                                onChange={(e) => onUpdateFormData(currentIndex, { name: e.target.value })}
                                placeholder="ej: Camiseta Polo Ralph Lauren"
                                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--foreground-tertiary)] text-sm font-medium"
                            />
                        </div>

                        {/* Garment Type */}
                        <CustomSelect
                            label="Tipo de prenda"
                            value={currentItem.formData.type}
                            onChange={(value) => onUpdateFormData(currentIndex, { type: value })}
                            options={categories}
                        />

                        {/* Color Selector */}
                        <div>
                            <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                                Color
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                {COLOR_OPTIONS.slice(0, 10).map((colorOption) => (
                                    <button
                                        key={colorOption.name}
                                        type="button"
                                        onClick={() => handleColorSelect(colorOption)}
                                        className={`w-7 h-7 rounded-full border transition-all ${
                                            currentItem.formData.color === colorOption.name
                                                ? 'border-[var(--brand-pink)] scale-110 ring-2 ring-[var(--brand-pink)]/30'
                                                : 'border-[var(--border-color)] hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: colorOption.hex }}
                                        title={colorOption.name}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={currentItem.formData.colorHex || '#000000'}
                                    onChange={(e) => handleColorPickerChange(e.target.value)}
                                    className="w-7 h-7 rounded-full border border-[var(--border-color)] cursor-pointer"
                                    title="Color personalizado"
                                />
                                {currentItem.formData.color && (
                                    <span className="text-xs font-medium text-[var(--foreground-secondary)] ml-1">
                                        {currentItem.formData.color}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Extended Fields in Complete Mode */}
                        {mode === 'complete' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-3 pt-2"
                            >
                                <DropdownWithCustom
                                    label="Marca"
                                    value={currentItem.formData.brand}
                                    onChange={(value) => onUpdateFormData(currentIndex, { brand: value })}
                                    options={brands}
                                    placeholder="Seleccionar marca..."
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <DropdownWithCustom
                                        label="Talla"
                                        value={currentItem.formData.size}
                                        onChange={(value) => onUpdateFormData(currentIndex, { size: value })}
                                        options={SIZE_OPTIONS}
                                        placeholder="Seleccionar..."
                                    />
                                    <CustomSelect
                                        label="Temporada"
                                        value={currentItem.formData.season}
                                        onChange={(value) => onUpdateFormData(currentIndex, { season: value })}
                                        options={SEASON_OPTIONS}
                                    />
                                </div>

                                <DropdownWithCustom
                                    label="Tejido"
                                    value={currentItem.formData.fabric}
                                    onChange={(value) => onUpdateFormData(currentIndex, { fabric: value })}
                                    options={FABRIC_OPTIONS}
                                    placeholder="Seleccionar tejido..."
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
});
