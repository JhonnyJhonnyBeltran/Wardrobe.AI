'use client';

/**
 * Create Outfit - Premium Redesign
 * Slot-machine based interface for desktop and mobile.
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Share2, Sparkles, Layers, RefreshCw, Undo2, Check } from 'lucide-react';
import { Button, Card } from '@/components';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { CarouselSlot } from '@/components/Creator/CarouselSlot';
import { PremiumGenerator } from '@/components/Creator/PremiumGenerator';
import { OutfitCanvas } from '@/components/Creator/OutfitCanvas';

// Slot Configuration
const SLOTS = [
    { id: 'headwear', title: 'Accesorios Cabeza', category: ClothingCategory.ACCESSORY, filter: (i: ClothingItem) => i.name.toLowerCase().includes('sombrero') || i.name.toLowerCase().includes('gorra') || i.name.toLowerCase().includes('gafas') },
    { id: 'top', title: 'Parte Superior', category: ClothingCategory.TOP },
    { id: 'layer', title: 'Capas / Abrigos', category: ClothingCategory.OUTERWEAR }, // Vests, Jackets, Coats
    { id: 'bottom', title: 'Parte Inferior', category: ClothingCategory.BOTTOM },
    { id: 'shoes', title: 'Calzado', category: ClothingCategory.SHOES },
    { id: 'accessories', title: 'Accesorios Extra', category: ClothingCategory.ACCESSORY, filter: (i: ClothingItem) => !i.name.toLowerCase().includes('sombrero') && !i.name.toLowerCase().includes('gorra') && !i.name.toLowerCase().includes('gafas') },
];

export default function CreateOutfitPage() {
    const router = useRouter();
    const { items: wardrobeItems } = useWardrobe();

    // State for selected items in each slot - NOW ARRAYS for multi-selection
    const [selections, setSelections] = useState<Record<string, ClothingItem[]>>({
        headwear: [],
        top: [],
        layer: [],
        bottom: [],
        shoes: [],
        accessories: []
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Helpers
    const handleSelect = useCallback((slotId: string, item: ClothingItem) => {
        setSelections(prev => {
            const currentItems = prev[slotId] || [];
            // Toggle: if already selected, remove it; otherwise add it
            const isAlreadySelected = currentItems.some(i => i.id === item.id);
            if (isAlreadySelected) {
                return { ...prev, [slotId]: currentItems.filter(i => i.id !== item.id) };
            } else {
                return { ...prev, [slotId]: [...currentItems, item] };
            }
        });
    }, []);

    const handleClear = useCallback((slotId: string) => {
        setSelections(prev => ({ ...prev, [slotId]: [] }));
    }, []);

    const handleRemoveItem = useCallback((slotId: string, itemId: string) => {
        setSelections(prev => ({
            ...prev,
            [slotId]: prev[slotId].filter(item => item.id !== itemId)
        }));
    }, []);

    const handleGenerate = () => {
        // Validation: Need at least 2 items total?
        const totalCount = Object.values(selections).reduce((sum, items) => sum + items.length, 0);
        if (totalCount < 2) {
            // Optional: Show toast
            alert("Selecciona al menos 2 prendas para crear un look.");
            return;
        }

        setIsGenerating(true);
    };

    const handleGenerationComplete = () => {
        setIsGenerating(false);
        setShowPreview(true);
    };

    // Filter Items for Slots
    const getItemsForSlot = useCallback((slot: typeof SLOTS[0]) => {
        return wardrobeItems.filter(item => {
            if (item.category !== slot.category) return false;
            // Additional filter logic if provided (e.g. splitting accessories)
            if (slot.filter) return slot.filter(item);
            return true;
        });
    }, [wardrobeItems]);

    // Check if outfit is empty
    const isEmpty = Object.values(selections).every(items => items.length === 0);

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden">
            <PremiumGenerator isVisible={isGenerating} onComplete={handleGenerationComplete as any} />

            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">Diseñador</h1>
                </div>

                <div className="flex items-center gap-2">
                    {!isEmpty && (
                        <button
                            onClick={() => setSelections({
                                headwear: [], top: [], layer: [], bottom: [], shoes: [], accessories: []
                            })}
                            className="p-2 text-[var(--foreground-tertiary)] hover:text-red-500 transition-colors"
                            title="Limpiar todo"
                        >
                            <Undo2 className="w-5 h-5" />
                        </button>
                    )}
                    <Button
                        onClick={handleGenerate}
                        glow={!isEmpty}
                        disabled={isEmpty}
                        className="rounded-full px-6"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Generar Look</span>
                        <span className="sm:hidden">Crear</span>
                    </Button>
                </div>
            </header>

            {/* Main Content - Split Layout on Desktop */}
            <main className="flex-1 container mx-auto max-w-7xl p-4 md:p-8 flex flex-col lg:flex-row gap-8">

                {/* Left: Slots / Carousel Area */}
                <div className="flex-1 lg:w-2/3 space-y-2 overflow-y-auto pb-24 lg:pb-0 scrollbar-hide">
                    <div className="bg-[var(--card-bg)]/50 rounded-3xl p-4 md:p-6 border border-[var(--border-color)] shadow-sm">
                        <div className="space-y-6 divide-y divide-[var(--border-color)]/50">
                            {SLOTS.map(slot => (
                                <CarouselSlot
                                    key={slot.id}
                                    title={slot.title}
                                    items={getItemsForSlot(slot)}
                                    selectedItems={selections[slot.id] || []}
                                    onSelect={(item) => handleSelect(slot.id, item)}
                                    onClear={() => handleClear(slot.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Preview Area (Sticky on Desktop) */}
                <div className="hidden lg:block lg:w-1/3 pl-4">
                    <div className="sticky top-24">
                        <OutfitCanvas selections={selections} onRemoveItem={handleRemoveItem} />

                        <div className="mt-6 p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm">
                            <div className="flex justify-between items-center text-sm text-[var(--foreground-secondary)]">
                                <span>{Object.values(selections).reduce((sum, items) => sum + items.length, 0)} prendas seleccionadas</span>
                                <span className="font-bold text-[var(--brand-pink)]">
                                    {/* Mock Total Price? */}
                                    Estilo Propio
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Floating Mobile Preview Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        // For mobile, maybe just scroll to specific preview mode or modal
                        // But if we want to preview, we trigger generate.
                        handleGenerate();
                    }}
                    disabled={isEmpty}
                    className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white ${isEmpty ? 'bg-gray-400' : 'bg-[var(--brand-pink)]'}`}
                >
                    <Check className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Final Result Modal (Reused Logic?) */}
            {/* Can reuse WardrobeSelectionModal or just a full screen overlay */}

            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col"
                    >
                        {/* Preview Header */}
                        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
                            <button onClick={() => setShowPreview(false)} className="text-[var(--foreground)] font-bold">
                                Editar
                            </button>
                            <span className="font-bold">Tu Outfit</span>
                            <button className="text-[var(--brand-pink)] font-bold">
                                Publicar
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[url('/grid-pattern.svg')]">
                            <div className="w-full max-w-sm h-full flex items-center justify-center">
                                <OutfitCanvas
                                    selections={selections}
                                    isMobile={true}
                                // No remove allowed in final view usually, or maybe yes? User said "interactividad... reajustar".
                                // Let's allow removing or just moving. For now, just moving (no remove handler passed implies no remove button)
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-8 pb-12 flex gap-4 justify-center bg-[var(--background)]">
                            <Button variant="outline" className="flex-1">
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir
                            </Button>
                            <Button className="flex-1" glow>
                                <Save className="w-4 h-4 mr-2" />
                                Guardar
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
