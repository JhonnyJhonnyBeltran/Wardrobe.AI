'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Search, Check } from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';
import Image from 'next/image';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { useWardrobe } from '@/lib/hooks/useWardrobe';

// ============================================
// Types
// ============================================

interface WardrobeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: ClothingItem) => void;
    onDeselect?: (itemId: string) => void;
    category?: ClothingCategory | null;
    selectedItemIds?: string[];
}

interface SelectableItemProps {
    item: ClothingItem;
    isSelected: boolean;
    onToggle: (item: ClothingItem, isSelected: boolean) => void;
}

// ============================================
// Constants
// ============================================

const CATEGORY_LABELS: Record<string, string> = {
    top: 'Partes de arriba',
    shirt: 'Camisas',
    sweater: 'Jerseys',
    bottom: 'Partes de abajo',
    skirt: 'Faldas',
    dress: 'Vestidos',
    outerwear: 'Abrigos',
    shoes: 'Calzado',
    accessory: 'Accesorios',
};

// ============================================
// Subcomponents
// ============================================

/**
 * SelectableItem - Individual item card with selection state
 * Memoized to prevent unnecessary re-renders
 */
const SelectableItem = memo(function SelectableItem({
    item,
    isSelected,
    onToggle,
}: SelectableItemProps) {
    const handleClick = useCallback(() => {
        onToggle(item, isSelected);
    }, [item, isSelected, onToggle]);

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={`group relative aspect-square rounded-2xl bg-[var(--background-secondary)] overflow-hidden text-left transition-all duration-200 ease-out ${
                isSelected 
                    ? 'border-2 border-[var(--brand-pink)] ring-2 ring-[var(--brand-pink)]/30 shadow-lg' 
                    : 'border border-[var(--border-color)] hover:border-[var(--brand-pink)]'
            }`}
        >
            {/* Image or Placeholder */}
            {item.imageUrl ? (
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className={`object-contain transition-opacity duration-200 ${isSelected ? 'opacity-90' : ''}`}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-[var(--background-tertiary)]">
                    👕
                </div>
            )}

            {/* Selected Indicator */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg"
                    >
                        <Check className="w-4 h-4 text-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay Info */}
            <div className={`absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent pt-8 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <p className="text-white text-xs font-medium truncate">
                    {item.name}
                </p>
            </div>
        </motion.button>
    );
});

/**
 * EmptyState - Shown when no items match the filter
 */
const EmptyState = memo(function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-48 text-[var(--foreground-tertiary)]">
            <Shirt className="w-12 h-12 mb-2 opacity-20" />
            <p>No se encontraron prendas</p>
        </div>
    );
});

// ============================================
// Main Component
// ============================================

export default function WardrobeSelectionModal({
    isOpen,
    onClose,
    onSelect,
    onDeselect,
    category,
    selectedItemIds = []
}: WardrobeSelectionModalProps) {
    const { items } = useWardrobe();
    const [searchQuery, setSearchQuery] = useState('');

    // Memoize selected IDs as a Set for O(1) lookup
    const selectedSet = useMemo(
        () => new Set(selectedItemIds),
        [selectedItemIds]
    );

    // Memoize filtered items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Skip items without valid id
            if (!item.id) return false;

            // Filter by category if specified
            if (category && item.category !== category) return false;

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    item.name.toLowerCase().includes(query) ||
                    item.brand?.toLowerCase().includes(query) ||
                    item.color.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [items, category, searchQuery]);

    // Memoize category label
    const categoryLabel = useMemo(() => {
        if (!category) return 'Prendas';
        return CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }, [category]);

    // Handle item toggle - stable callback
    const handleItemToggle = useCallback((item: ClothingItem, isSelected: boolean) => {
        if (isSelected && onDeselect) {
            onDeselect(item.id);
        } else if (!isSelected) {
            onSelect(item);
        }
    }, [onSelect, onDeselect]);

    // Handle search input
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="wardrobe-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <div key="wardrobe-modal-container" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    key="wardrobe-modal-content"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[var(--background)] border border-[var(--border-color)] rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--background-secondary)]">
                        <h2 className="text-lg font-bold text-[var(--foreground)]">
                            Seleccionar {categoryLabel}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex-shrink-0 p-4 border-b border-[var(--border-color)] bg-[var(--background)]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                            <input
                                type="text"
                                placeholder="Buscar prendas..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--background-secondary)] border-none text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] focus:ring-2 focus:ring-[var(--brand-pink)]/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                        {filteredItems.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {filteredItems.map((item, index) => (
                                    <SelectableItem
                                        key={item.id || `item-${index}`}
                                        item={item}
                                        isSelected={selectedSet.has(item.id)}
                                        onToggle={handleItemToggle}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
