'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Wand2, Plus, X } from 'lucide-react';
import { myWardrobe, currentUser } from '@/data/mockData';
import { useRouter } from 'next/navigation';
import AddItemModal from '@/components/AddItemModal';

type OutfitStyle = 'casual' | 'romantic' | 'business' | 'streetwear' | 'quietluxury' | 'trending';

const styles: { value: OutfitStyle; label: string; emoji: string }[] = [
    { value: 'casual', label: 'Casual', emoji: '👖' },
    { value: 'romantic', label: 'Romántico', emoji: '💕' },
    { value: 'business', label: 'Oficina', emoji: '💼' },
    { value: 'streetwear', label: 'Street', emoji: '🔥' },
    { value: 'quietluxury', label: 'Elegante', emoji: '✨' },
    { value: 'trending', label: 'Trending', emoji: '📈' },
];

export default function CreatePage() {
    const router = useRouter();
    const [selectedStyle, setSelectedStyle] = useState<OutfitStyle | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const handleGenerate = async () => {
        if (!selectedStyle) return;
        setIsGenerating(true);
        setTimeout(() => {
            router.push('/closet');
        }, 2000);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: direction === 'right' ? 300 : -300,
                behavior: 'smooth',
            });
        }
    };

    const toggleItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            {/* Avatar & Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8 pb-6 px-4 text-center relative"
            >
                <button onClick={() => router.back()} className="absolute left-4 top-8">
                    <X className="w-6 h-6" />
                </button>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-20 h-20 mx-auto mb-3 relative"
                >
                    <img
                        src={currentUser.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-full border-4 border-[var(--brand-pink)] shadow-[var(--shadow-float-strong)]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                </motion.div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">Crear Look</h1>
            </motion.div>

            {/* Carousel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 px-4 mb-4"
            >
                <div className="relative">
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-strong flex items-center justify-center shadow-lg"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-strong flex items-center justify-center shadow-lg"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div
                        ref={carouselRef}
                        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-4"
                    >
                        {myWardrobe.map((item, index) => (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={() => toggleItem(item.id)}
                                className={`flex-shrink-0 w-40 snap-center ${selectedItems.has(item.id) ? 'ring-4 ring-[var(--brand-pink)]' : ''
                                    } rounded-2xl overflow-hidden bg-white`}
                            >
                                <div className="aspect-[3/4] relative group">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                                        style={{ mixBlendMode: 'darken' }}
                                    />

                                    {selectedItems.has(item.id) && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center"
                                        >
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                                <div className="p-2 text-center bg-[var(--background)]">
                                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{item.name}</p>
                                    <p className="text-[10px] text-[var(--foreground-tertiary)]">{item.brand}</p>
                                </div>
                            </motion.button>
                        ))}

                        {/* Add Item Card */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * myWardrobe.length }}
                            onClick={() => setShowAddModal(true)}
                            className="flex-shrink-0 w-40 snap-center rounded-2xl bg-[var(--background-secondary)] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-colors"
                        >
                            <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2">
                                <div className="w-14 h-14 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                    <Plus className="w-7 h-7 text-[var(--brand-pink)]" />
                                </div>
                                <p className="text-xs font-semibold text-[var(--foreground-secondary)]">Añadir</p>
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Style Selector */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 mb-4"
            >
                <p className="text-xs font-bold text-[var(--foreground)] mb-3">Estilo</p>
                <div className="grid grid-cols-3 gap-2">
                    {styles.map((style) => (
                        <motion.button
                            key={style.value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedStyle(style.value)}
                            className={`p-3 rounded-2xl transition-all ${selectedStyle === style.value
                                    ? 'bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] text-white shadow-[var(--shadow-float-hover)]'
                                    : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)]'
                                }`}
                        >
                            <div className="text-2xl mb-1">{style.emoji}</div>
                            <div className="text-xs font-semibold">{style.label}</div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Create Button */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="px-4 pb-safe pb-24 md:pb-8"
            >
                <AnimatePresence>
                    {selectedStyle && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-5 rounded-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)] text-white font-bold text-lg shadow-[var(--shadow-float-strong)] flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles className="w-6 h-6" />
                                    </motion.div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-6 h-6" />
                                    Crear Outfit
                                </>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            <AddItemModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={() => { }}
            />
        </div>
    );
}
