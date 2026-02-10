'use client';

/**
 * Create Outfit - Mobile & Desktop Flow
 * Mobile: Selection → Preview/Name/Save
 * Desktop: Side-by-side with name input
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, ArrowRight, Shirt, Wand2 } from 'lucide-react';
import { Button } from '@/components';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { ClothingItem } from '@/types/clothing';
import { CarouselSlot } from '@/components/Creator/CarouselSlot';
import { OutfitCanvas } from '@/components/Creator/OutfitCanvas';
import { FilterBar } from '@/components/Creator/FilterBar';
import { MobileItemSelector } from '@/components/Creator/MobileItemSelector';

import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export default function CreateOutfitPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const outfitId = searchParams.get('outfitId');
    const { items: wardrobeItems } = useWardrobe();

    // Mobile flow state: 'selection' | 'preview' - Skipped 'initial' as per request
    const [mobileStep, setMobileStep] = useState<'selection' | 'preview'>('selection');

    // Outfit name
    const [outfitName, setOutfitName] = useState('');
    const [loading, setLoading] = useState(false);

    // State for selected items
    const [selections, setSelections] = useState<Record<string, ClothingItem[]>>({
        headwear: [],
        top: [],
        layer: [],
        bottom: [],
        shoes: [],
        accessories: []
    });

    // Canvas state for positions
    const [canvasState, setCanvasState] = useState<Record<string, any>>({});

    // Load outfit data if editing
    useEffect(() => {
        if (!outfitId) return;
        setMobileStep('selection');

        const fetchOutfit = async () => {
            setLoading(true);
            try {
                // Fetch outfit details
                const { data: outfitData, error } = await supabase
                    .from('outfits')
                    .select(`
                        *,
                        outfit_items (
                            param_clothing_item:clothing_items (*),
                            clothing_item_id,
                            position_x,
                            position_y,
                            scale,
                            rotation,
                            layer_order
                        )
                    `)
                    .eq('id', outfitId)
                    .single();

                if (error) throw error;
                const outfit = outfitData as any;

                if (outfit) {
                    setOutfitName(outfit.name);

                    // Reconstruct selections and canvas state
                    const newSelections: Record<string, ClothingItem[]> = {
                        headwear: [], top: [], layer: [], bottom: [], shoes: [], accessories: []
                    };
                    const newCanvasState: Record<string, any> = {};

                    outfit.outfit_items.forEach((oi: any) => {
                        const item = oi.param_clothing_item || oi.clothing_item; // Handle potential alias or direct join
                        if (!item) return;

                        // Normalize fields if needed (Supabase returns snake_case, type expects camelCase/defined fields)
                        const clothingItem: ClothingItem = {
                            id: item.id,
                            imageUrl: item.image_url,
                            category: item.category as any, // Cast to enum
                            name: item.name,
                            brand: item.brand,
                            color: item.color as any, // Cast to enum
                            originalImageUrl: item.original_image,
                            favorite: item.is_favorite,
                            createdAt: new Date(item.created_at),
                            season: item.season || [], // Default to empty array or map if needed
                            tags: item.tags || [],
                        };

                        // Determine slot (simple mapping based on category)
                        let slot = 'accessories';
                        if (['top', 'shirt', 'blouse', 't-shirt'].includes(clothingItem.category)) slot = 'top';
                        // Add other mappings as necessary, leveraging existing logic if possible. 
                        // For simplicity, we trust the category from DB matches keys if perfect, 
                        // but fallbacks are safer.
                        if (clothingItem.category === 'top') slot = 'top';
                        else if (clothingItem.category === 'bottom') slot = 'bottom';
                        else if (clothingItem.category === 'shoes') slot = 'shoes';
                        else if (clothingItem.category === 'outerwear') slot = 'layer';
                        else if (clothingItem.category === 'accessory') {
                            if (clothingItem.name.toLowerCase().includes('sombrero') || clothingItem.name.toLowerCase().includes('gorra') || clothingItem.name.toLowerCase().includes('gafas')) {
                                slot = 'headwear';
                            } else {
                                slot = 'accessories';
                            }
                        }

                        if (newSelections[slot]) {
                            newSelections[slot].push(clothingItem);
                        }

                        // Set canvas state
                        const stateKey = `${slot}-${item.id}`;
                        newCanvasState[stateKey] = {
                            x: oi.position_x || 50,
                            y: oi.position_y || 50,
                            scale: oi.scale || 1,
                            rotation: oi.rotation || 0,
                            zIndex: oi.layer_order || 1
                        };
                    });

                    setSelections(newSelections);
                    setCanvasState(newCanvasState);

                    // If editing, go straight to preview on mobile potentially? 
                    // Or stay on selection to allow adding more. 
                    // Let's stay on selection but maybe user wants to see the outfit first.
                    // For now, default behavior is fine.
                }
            } catch (err) {
                console.error('Error fetching outfit:', err);
                alert('No se pudo cargar el outfit.');
                router.push('/closet');
            } finally {
                setLoading(false);
            }
        };

        fetchOutfit();
    }, [outfitId, router]);


    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Helpers
    const handleSelect = useCallback((slotId: string, item: ClothingItem) => {
        setSelections(prev => {
            const currentItems = prev[slotId] || [];
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

    // Filter items based on search, color, type, and favorites
    const filteredItems = useMemo(() => {
        return wardrobeItems.filter(item => {
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            if (selectedColor && item.color?.toLowerCase() !== selectedColor.toLowerCase()) {
                return false;
            }
            if (selectedType && item.type?.toLowerCase() !== selectedType.toLowerCase()) {
                return false;
            }
            if (showFavoritesOnly && !item.isFavorite) {
                return false;
            }
            return true;
        });
    }, [wardrobeItems, searchQuery, selectedColor, selectedType, showFavoritesOnly]);

    // Get items for each slot with filters applied
    const getItemsForSlot = useCallback((category: string, filter?: (item: ClothingItem) => boolean) => {
        return filteredItems.filter(item => {
            if (item.category !== category) return false;
            if (filter) return filter(item);
            return true;
        });
    }, [filteredItems]);

    // Check if outfit is empty
    const isEmpty = Object.values(selections).every(items => items.length === 0);
    const totalSelected = Object.values(selections).reduce((sum, items) => sum + items.length, 0);

    // Save outfit
    const handleSave = async () => {
        if (isEmpty || !outfitName.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Debes iniciar sesión para guardar outfits');
                return;
            }

            setLoading(true);

            let savedOutfitId = outfitId;

            if (outfitId) {
                // UPDATE existing outfit
                const { error: updateError } = await supabase
                    .from('outfits')
                    // @ts-ignore
                    .update({
                        name: outfitName,
                        description: `Outfit con ${totalSelected} prendas`,
                        updated_at: new Date().toISOString()
                    } as any)
                    .eq('id', outfitId);

                if (updateError) throw updateError;

                // Delete existing items to replace them (easier than syncing)
                const { error: deleteItemsError } = await supabase
                    .from('outfit_items')
                    .delete()
                    .eq('outfit_id', outfitId);

                if (deleteItemsError) throw deleteItemsError;

            } else {
                // INSERT new outfit
                const { data: outfitData, error: outfitError } = await supabase
                    .from('outfits')
                    .insert({
                        user_id: user.id,
                        name: outfitName,
                        description: `Outfit con ${totalSelected} prendas`,
                        season: 'all-season', // Default for now
                        is_public: false,
                        ai_generated: false
                    } as any)
                    .select()
                    .single();

                if (outfitError) throw outfitError;
                savedOutfitId = (outfitData as any).id;
            }

            // Create Outfit Items (Common for both insert and update)
            const outfitItemsArr: any[] = [];

            Object.entries(selections).forEach(([slotId, items]) => {
                items.forEach(item => {
                    const stateKey = `${slotId}-${item.id}`;
                    const state = canvasState[stateKey] || { x: 50, y: 50, scale: 1, rotation: 0, zIndex: 1 };

                    outfitItemsArr.push({
                        outfit_id: savedOutfitId,
                        clothing_item_id: item.id,
                        position_x: state.x,
                        position_y: state.y,
                        scale: state.scale,
                        rotation: state.rotation,
                        layer_order: state.zIndex
                    });
                });
            });

            if (outfitItemsArr.length > 0) {
                const { error: itemsError } = await supabase
                    .from('outfit_items')
                    .insert(outfitItemsArr as any);

                if (itemsError) throw itemsError;
            }

            alert(`Outfit "${outfitName}" ${outfitId ? 'actualizado' : 'guardado'} correctamente!`);

            const returnTo = searchParams.get('returnTo');
            if (returnTo) {
                const separator = returnTo.includes('?') ? '&' : '?';
                router.push(`${returnTo}${separator}outfitId=${savedOutfitId}`);
            } else {
                router.push('/closet?tab=outfits'); // Redirect to outfits tab
            }

        } catch (error) {
            console.error('Error saving outfit:', error);
            alert('Error al guardar el outfit. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (mobileStep === 'preview') {
                                setMobileStep('selection');
                            } else {
                                router.back();
                            }
                        }}
                        className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">
                        {mobileStep === 'selection' ? 'Seleccionar Prendas' : 'Crear Outfit'}
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row lg:container lg:mx-auto lg:max-w-7xl lg:p-8 lg:gap-8">

                {/* MOBILE: Two-Step Flow */}
                <div className="flex-1 flex flex-col lg:hidden">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Selection */}
                        {mobileStep === 'selection' && (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col p-4 space-y-4 pb-24"
                            >
                                {/* Filters */}
                                <FilterBar
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedColor={selectedColor}
                                    onColorChange={setSelectedColor}
                                    selectedType={selectedType}
                                    onTypeChange={setSelectedType}
                                    showFavoritesOnly={showFavoritesOnly}
                                    onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                />

                                {/* Mobile Swipeable Item Selectors */}
                                <div className="space-y-8">
                                    <MobileItemSelector
                                        title="Accesorios Cabeza"
                                        items={getItemsForSlot('accessory', (i) => i.name.toLowerCase().includes('sombrero') || i.name.toLowerCase().includes('gorra') || i.name.toLowerCase().includes('gafas'))}
                                        selectedItems={selections.headwear || []}
                                        onSelect={(item) => handleSelect('headwear', item)}
                                    />
                                    <MobileItemSelector
                                        title="Parte Superior"
                                        items={getItemsForSlot('top')}
                                        selectedItems={selections.top || []}
                                        onSelect={(item) => handleSelect('top', item)}
                                    />
                                    <MobileItemSelector
                                        title="Capas / Abrigos"
                                        items={getItemsForSlot('outerwear')}
                                        selectedItems={selections.layer || []}
                                        onSelect={(item) => handleSelect('layer', item)}
                                    />
                                    <MobileItemSelector
                                        title="Parte Inferior"
                                        items={getItemsForSlot('bottom')}
                                        selectedItems={selections.bottom || []}
                                        onSelect={(item) => handleSelect('bottom', item)}
                                    />
                                    <MobileItemSelector
                                        title="Calzado"
                                        items={getItemsForSlot('shoes')}
                                        selectedItems={selections.shoes || []}
                                        onSelect={(item) => handleSelect('shoes', item)}
                                    />
                                    <MobileItemSelector
                                        title="Accesorios Extra"
                                        items={getItemsForSlot('accessory', (i) => !i.name.toLowerCase().includes('sombrero') && !i.name.toLowerCase().includes('gorra') && !i.name.toLowerCase().includes('gafas'))}
                                        selectedItems={selections.accessories || []}
                                        onSelect={(item) => handleSelect('accessories', item)}
                                    />
                                </div>

                                {/* Next Button */}
                                <div className="fixed bottom-24 left-4 right-4 z-40">
                                    <Button
                                        onClick={() => setMobileStep('preview')}
                                        disabled={isEmpty}
                                        glow={!isEmpty}
                                        className="w-full rounded-full py-4 text-base font-semibold"
                                    >
                                        Siguiente ({totalSelected})
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Preview + Name + Save */}
                        {mobileStep === 'preview' && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex-1 flex flex-col p-4 space-y-4 pb-24"
                            >
                                {/* Outfit Name Input */}
                                <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)]">
                                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                        Nombre del Outfit
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Look casual de verano"
                                        value={outfitName}
                                        onChange={(e) => setOutfitName(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none"
                                    />
                                </div>

                                {/* Canvas Preview */}
                                <div className="w-full max-w-md space-y-4">
                                    <OutfitCanvas
                                        selections={selections}
                                        onRemoveItem={handleRemoveItem}
                                        isMobile={true}
                                        onCanvasChange={setCanvasState}
                                    />

                                    {/* Add More Items Button */}
                                    <button
                                        onClick={() => setMobileStep('selection')}
                                        className="w-full py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--background-secondary)] transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                            <Shirt className="w-4 h-4 text-[var(--brand-pink)]" />
                                        </div>
                                        Seguir añadiendo prendas
                                    </button>
                                </div>

                                {/* Save Button */}
                                <div className="fixed bottom-24 left-4 right-4 z-40">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isEmpty || !outfitName.trim()}
                                        glow={!isEmpty && outfitName.trim().length > 0}
                                        className="w-full rounded-full py-4 text-base font-semibold"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Guardar Outfit
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* DESKTOP: Side-by-side Layout */}
                <div className="hidden lg:flex lg:flex-1 lg:gap-8">
                    {/* Left: Selection Panel */}
                    <div className="flex-1 space-y-4 overflow-y-auto">
                        {/* Filters */}
                        <FilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedColor={selectedColor}
                            onColorChange={setSelectedColor}
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                            showFavoritesOnly={showFavoritesOnly}
                            onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)
                            }
                        />

                        {/* Clothing Slots */}
                        <div className="bg-[var(--card-bg)]/50 rounded-3xl p-6 border border-[var(--border-color)] shadow-sm">
                            <div className="space-y-6 divide-y divide-[var(--border-color)]/50">
                                {(() => {
                                    const headwearItems = getItemsForSlot('accessory', (i) => i.name.toLowerCase().includes('sombrero') || i.name.toLowerCase().includes('gorra') || i.name.toLowerCase().includes('gafas'));
                                    const topItems = getItemsForSlot('top');
                                    const layerItems = getItemsForSlot('outerwear');
                                    const bottomItems = getItemsForSlot('bottom');
                                    const shoesItems = getItemsForSlot('shoes');
                                    const accessoriesItems = getItemsForSlot('accessory', (i) => !i.name.toLowerCase().includes('sombrero') && !i.name.toLowerCase().includes('gorra') && !i.name.toLowerCase().includes('gafas'));

                                    return (
                                        <>
                                            {headwearItems.length > 0 && (
                                                <CarouselSlot
                                                    title="Accesorios Cabeza"
                                                    items={headwearItems}
                                                    selectedItems={selections.headwear || []}
                                                    onSelect={(item) => handleSelect('headwear', item)}
                                                    onClear={() => handleClear('headwear')}
                                                />
                                            )}
                                            {topItems.length > 0 && (
                                                <CarouselSlot
                                                    title="Parte Superior"
                                                    items={topItems}
                                                    selectedItems={selections.top || []}
                                                    onSelect={(item) => handleSelect('top', item)}
                                                    onClear={() => handleClear('top')}
                                                />
                                            )}
                                            {layerItems.length > 0 && (
                                                <CarouselSlot
                                                    title="Capas / Abrigos"
                                                    items={layerItems}
                                                    selectedItems={selections.layer || []}
                                                    onSelect={(item) => handleSelect('layer', item)}
                                                    onClear={() => handleClear('layer')}
                                                />
                                            )}
                                            {bottomItems.length > 0 && (
                                                <CarouselSlot
                                                    title="Parte Inferior"
                                                    items={bottomItems}
                                                    selectedItems={selections.bottom || []}
                                                    onSelect={(item) => handleSelect('bottom', item)}
                                                    onClear={() => handleClear('bottom')}
                                                />
                                            )}
                                            {shoesItems.length > 0 && (
                                                <CarouselSlot
                                                    title="Calzado"
                                                    items={shoesItems}
                                                    selectedItems={selections.shoes || []}
                                                    onSelect={(item) => handleSelect('shoes', item)}
                                                    onClear={() => handleClear('shoes')}
                                                />
                                            )}
                                            {accessoriesItems.length > 0 && (
                                                <CarouselSlot
                                                    title="Accesorios Extra"
                                                    items={accessoriesItems}
                                                    selectedItems={selections.accessories || []}
                                                    onSelect={(item) => handleSelect('accessories', item)}
                                                    onClear={() => handleClear('accessories')}
                                                />
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview Panel */}
                    <div className="w-[400px]">
                        <div className="sticky top-24 space-y-4">
                            {/* Outfit Name */}
                            <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)]">
                                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                    Nombre del Outfit
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Look casual de verano"
                                    value={outfitName}
                                    onChange={(e) => setOutfitName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--background-secondary)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none"
                                />
                            </div>

                            {/* Canvas */}
                            <OutfitCanvas
                                selections={selections}
                                onRemoveItem={handleRemoveItem}
                                onCanvasChange={setCanvasState}
                            />

                            {/* Info & Save */}
                            <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] space-y-3">
                                <div className="flex justify-between items-center text-sm text-[var(--foreground-secondary)]">
                                    <span>{totalSelected} prendas seleccionadas</span>
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={isEmpty || !outfitName.trim()}
                                    glow={!isEmpty && outfitName.trim().length > 0}
                                    className="w-full rounded-full"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar Outfit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
