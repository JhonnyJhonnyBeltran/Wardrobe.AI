'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shirt, Search } from 'lucide-react';
import { useState } from 'react';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { useWardrobe } from '@/lib/hooks/useWardrobe';

interface WardrobeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: ClothingItem) => void;
    category?: ClothingCategory | null;
}

export default function WardrobeSelectionModal({
    isOpen,
    onClose,
    onSelect,
    category
}: WardrobeSelectionModalProps) {
    const { items } = useWardrobe();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = items.filter(item => {
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

    const categoryLabel = category
        ? (category.charAt(0).toUpperCase() + category.slice(1))
        : 'Prendas';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[var(--background)] border border-[var(--border-color)] rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--background-secondary)]">
                                <h2 className="text-lg font-bold text-[var(--foreground)]">
                                    Seleccionar {categoryLabel}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--background)]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                                    <input
                                        type="text"
                                        placeholder="Buscar prendas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--background-secondary)] border-none text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] focus:ring-2 focus:ring-[var(--brand-pink)]/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                                {filteredItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-[var(--foreground-tertiary)]">
                                        <Shirt className="w-12 h-12 mb-2 opacity-20" />
                                        <p>No se encontraron prendas</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {filteredItems.map((item) => (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    onSelect(item);
                                                    onClose();
                                                }}
                                                className="group relative aspect-square rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-pink)] overflow-hidden transition-all text-left"
                                            >
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                        👕
                                                    </div>
                                                )}

                                                {/* Overlay Info */}
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs font-medium truncate">
                                                        {item.name}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
