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
            layoutId={`item-${item.id}`}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`group relative aspect-[3/4] rounded-2xl bg-[var(--card-bg)] overflow-hidden text-left transition-all duration-300 shadow-sm hover:shadow-xl ${isSelected
                    ? 'ring-4 ring-[var(--brand-pink)]/50 border-transparent shadow-[0_0_20px_rgba(255,105,180,0.3)]'
                    : 'border border-[var(--border-color)] hover:border-[var(--brand-pink)]'
                }`}
        >
            {/* Image or Placeholder - Larger Display */}
            <div className="absolute inset-0 p-4">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className={`object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-lg ${isSelected ? 'opacity-100 scale-105' : 'opacity-90'}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-[var(--background-tertiary)] rounded-xl">
                        👕
                    </div>
                )}
            </div>

            {/* Selected Indicator - Premium Checkmark */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg border-2 border-white z-10"
                    >
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Badge - Bottom */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="text-white font-bold text-sm truncate drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {item.name}
                </p>
                <p className="text-white/70 text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    {item.brand || 'Klozet'}
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
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
