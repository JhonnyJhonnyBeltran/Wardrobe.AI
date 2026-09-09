'use client';

/**
 * BatchCarousel Component
 * Displays an interactive carousel/slider for multi-item garment uploads (up to 20 photos).
 * Allows the user to slide through garments one by one, edit names, categories, and colors,
 * with enlarged circular thumbnails and real-time status icons inside.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, Loader2, Check, AlertCircle, Plus } from 'lucide-react';
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

    const handleColorSelect = (colorOption: { name: string; hex: string }) => {
        onUpdateFormData(currentIndex, { color: colorOption.name, colorHex: colorOption.hex });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* ── Top Header with Slide Counter ── */}
            <div className="flex items-center justify-between px-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border border-[var(--brand-pink)]/20 shadow-sm">
                    Prenda {currentIndex + 1} de {totalCount}
                </span>
                {currentItem.isProcessing && (
                    <span className="text-[11px] font-medium text-[var(--foreground-tertiary)] flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--brand-pink)]" />
                        <span>Analizando prenda...</span>
                    </span>
                )}
            </div>

            {/* ── Thumbnail Strip with Circular Previews ── */}
            <div className="w-full px-1">
                <div className="flex items-center gap-3 overflow-x-auto px-2 py-2.5 custom-scrollbar touch-pan-x -mx-1">
                    {batchItems.map((item, idx) => {
                        const isSelected = idx === currentIndex;
                        const previewImg = item.image || item.originalImage;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSelectIndex(idx)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border transition-all duration-300 cursor-pointer p-0.5 bg-white dark:bg-[#151518] shadow-sm ${
                                    isSelected
                                        ? 'ring-2 ring-[var(--brand-pink)] ring-offset-2 ring-offset-[var(--background)] scale-105 border-transparent'
                                        : 'border-[var(--border-color)] opacity-75 hover:opacity-100 hover:scale-100'
                                }`}
                            >
                                {previewImg ? (
                                    <div className="relative w-full h-full rounded-full overflow-hidden">
                                        <Image
                                            src={previewImg}
                                            alt={`Miniatura ${idx + 1}`}
                                            fill
                                            className="object-contain p-0.5"
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
                                        <span className="text-xs font-bold text-[var(--foreground-tertiary)]">{idx + 1}</span>
                                    </div>
                                )}

                                {/* Status Icon Inside Circle without background */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {item.isProcessing ? (
                                        <div className="w-full h-full bg-black/25 backdrop-blur-[1px] flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-[var(--brand-pink)] animate-spin drop-shadow-md" />
                                        </div>
                                    ) : item.error ? (
                                        <div className="w-full h-full bg-red-950/30 flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-red-500 drop-shadow-md" />
                                        </div>
                                    ) : isSelected ? (
                                        <div className="absolute bottom-1 right-1">
                                            <Check className="w-4 h-4 text-emerald-500 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] stroke-[3]" />
                                        </div>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })}
                </div>
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
                    {/* Image Preview Container with Corner Delete Button */}
                    <div className="w-full max-w-[240px] mx-auto aspect-square rounded-3xl overflow-hidden bg-white dark:bg-[#151518] border border-[var(--border-color)] relative flex items-center justify-center shadow-sm group">
                        {currentItem.image ? (
                            <div className="relative w-full h-full p-2.5">
                                <Image
                                    src={currentItem.image}
                                    alt={currentItem.formData.name || 'Prenda'}
                                    fill
                                    className="object-contain p-1.5"
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

                        {/* Corner Delete Button */}
                        <button
                            type="button"
                            onClick={() => onRemoveItem(currentIndex)}
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-20 shadow-md hover:scale-110 active:scale-95 border border-white/10"
                            title="Eliminar prenda"
                            aria-label="Eliminar prenda"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Processing Badge Overlay */}
                        {currentItem.isProcessing && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 p-3 text-center">
                                <Loader2 className="w-9 h-9 text-[var(--brand-pink)] animate-spin" />
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

                        {/* Color Selector (Curated palette without color text label) */}
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
                                            currentItem.formData.color === colorOption.name
                                                ? 'border-[var(--brand-pink)] scale-110 ring-2 ring-[var(--brand-pink)]/30'
                                                : 'border-[var(--border-color)] hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: colorOption.hex }}
                                        title={colorOption.name}
                                    />
                                ))}
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

