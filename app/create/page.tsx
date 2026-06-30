'use client';

/**
 * Create Outfit - Mobile & Desktop Flow
 * Mobile: Selection → Preview/Name/Save
 * Desktop: Side-by-side with name input
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, ArrowRight, Shirt, Wand2, Eye, X, Share2, Camera, Check, Briefcase, PartyPopper, Zap, Heart, Sparkles, Circle } from 'lucide-react';
import { Button } from '@/components';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { ClothingItem } from '@/types/clothing';
import { CarouselSlot } from '@/components/Creator/CarouselSlot';
import { FreeDragCanvas, FreeDragCanvasRef } from '@/components/Creator/FreeDragCanvas';
import { FilterBar } from '@/components/Creator/FilterBar';
import { MobileItemSelector } from '@/components/Creator/MobileItemSelector';

import { supabase } from '@/lib/supabase/client';
import { uploadImage, BUCKETS } from '@/lib/supabase/storage';
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
    const [outfitOccasion, setOutfitOccasion] = useState('casual');
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
    // Canvas ref
    const canvasRef = useRef<FreeDragCanvasRef>(null);

    // Flatten selections to a single list for FreeDragCanvas
    const flatItems = useMemo(() => {
        return Object.values(selections).flat();
    }, [selections]);

    // Preview modal state
    const [showPreview, setShowPreview] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const savedOutfitIdRef = useRef<string | null>(null);

    // Success Modal State
    const [successModalConfig, setSuccessModalConfig] = useState<{
        isOpen: boolean;
        outfitName: string;
        isUpdate: boolean;
        savedOutfitId?: string | null;
        returnTo?: string | null;
    }>({ isOpen: false, outfitName: '', isUpdate: false });

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
                    if (outfit.occasion) setOutfitOccasion(outfit.occasion);

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
                        const cat = clothingItem.category.toLowerCase();
                        if (['top', 'shirt', 'blouse', 't-shirt', 'sweater', 'jersey'].includes(cat)) slot = 'top';
                        else if (['bottom', 'pants', 'skirt', 'jeans', 'shorts', 'dress'].includes(cat)) slot = 'bottom';
                        else if (['shoes', 'boots', 'sneakers', 'sandals'].includes(cat)) slot = 'shoes';
                        else if (['outerwear', 'jacket', 'coat', 'blazer'].includes(cat)) slot = 'layer';
                        else if (cat === 'accessory' || cat === 'headwear') {
                            if (clothingItem.name.toLowerCase().includes('sombrero') || 
                                clothingItem.name.toLowerCase().includes('gorra') || 
                                clothingItem.name.toLowerCase().includes('gafas')) {
                                slot = 'headwear';
                            } else {
                                slot = 'accessories';
                            }
                        }

                        if (newSelections[slot]) {
                            newSelections[slot].push(clothingItem);
                        }

                        // Set canvas state using item.id as key
                        const stateKey = item.id;
                        newCanvasState[stateKey] = {
                            x: oi.position_x ?? 50,
                            y: oi.position_y ?? 50,
                            scale: oi.scale ?? 1,
                            rotation: oi.rotation ?? 0,
                            zIndex: oi.layer_order ?? 1
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

    const handleRemoveItem = useCallback((itemId: string) => {
        setSelections(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                next[key] = next[key].filter(item => item.id !== itemId);
            });
            return next;
        });
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
            if (selectedType && item.category?.toLowerCase() !== selectedType.toLowerCase()) {
                return false;
            }
            if (showFavoritesOnly && !item.favorite) {
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

    // Preview handler
    const handlePreview = async () => {
        if (isEmpty) return;
        setPreviewLoading(true);
        try {
            const imageData = await canvasRef.current?.exportToImage();
            setPreviewImage(imageData || null);
            setShowPreview(true);
        } catch (error) {
            console.error('Error generating preview:', error);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Publish to feed - redirect to create post page
    const handlePublishToFeed = async () => {
        // First save the outfit if not saved yet
        if (!outfitId) {
            // Save the outfit first
            await handleSaveWithoutRedirect();
            // Then redirect to create post
            if (savedOutfitIdRef.current) {
                router.push(`/create-post?outfitId=${savedOutfitIdRef.current}`);
            }
        } else {
            router.push(`/create-post?outfitId=${outfitId}`);
        }
        setShowPreview(false);
    };

    // Add to stories
    const handleAddToStories = async () => {
        if (!previewImage) return;
        // TODO: Implement add to stories functionality  
        alert('¡Añadiendo a historias! (Funcionalidad en desarrollo)');
    };

    // Helper to save outfit without redirecting (for publish flow)
    const handleSaveWithoutRedirect = async (): Promise<string | null> => {
        if (isEmpty || !outfitName.trim()) return null;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Debes iniciar sesión para guardar outfits');
                return null;
            }

            // Generate Image
            let finalImage = previewImage;
            if (!finalImage) {
                try {
                    finalImage = await canvasRef.current?.exportToImage() || null;
                } catch (e) {
                    console.error("Error generating image on save:", e);
                }
            }

            // Upload Image to Storage
            let publicImageUrl = null;
            if (finalImage) {
                const uploadResult = await uploadImage(finalImage, BUCKETS.CLOTHING, {
                    folder: `outfits/${user.id}`,
                    fileName: `outfit_${Date.now()}`
                });

                if (uploadResult.success) {
                    publicImageUrl = uploadResult.url;
                }
            }

            // Insert new outfit
            const { data: outfitData, error: outfitError } = await (supabase.from('outfits') as any)
                .insert({
                    user_id: user.id,
                    name: outfitName,
                    occasion: outfitOccasion,
                    description: `Outfit con ${totalSelected} prendas`,
                    season: 'all-season',
                    is_public: false,
                    ai_generated: false,
                    image_url: publicImageUrl
                } as any)
                .select()
                .single();

            if (outfitError) throw outfitError;
            const newOutfitId = (outfitData as any).id;

            // Create Outfit Items
            const outfitItemsArr: any[] = [];
            const currentCanvasState = canvasState; // Use the continuously updated state!
            
            Object.entries(selections).forEach(([slotId, items]) => {
                items.forEach(item => {
                    const state = currentCanvasState[item.id] || { x: 50, y: 50, scale: 1, rotation: 0, zIndex: 1 };

                    outfitItemsArr.push({
                        outfit_id: newOutfitId,
                        clothing_item_id: item.id,
                        position_x: state.x ?? 50, // Fix fallback to use ?? so 0 doesn't become 50
                        position_y: state.y ?? 50,
                        scale: state.scale ?? 1,
                        rotation: state.rotation ?? 0,
                        layer_order: state.zIndex ?? 1
                    });
                });
            });

            if (outfitItemsArr.length > 0) {
                await (supabase.from('outfit_items') as any).insert(outfitItemsArr as any);
            }

            return newOutfitId;
        } catch (error) {
            console.error('Error saving outfit:', error);
            return null;
        }
    };

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

            // 1. Generate Image
            let finalImage = previewImage;
            if (!finalImage) {
                try {
                    finalImage = await canvasRef.current?.exportToImage() || null;
                } catch (e) {
                    console.error("Error generating image on save:", e);
                }
            }

            // 2. Upload Image to Storage
            let publicImageUrl = null;
            if (finalImage) {
                // Use CLOTHING bucket ('clothing-images') as it's guaranteed to exist
                const uploadResult = await uploadImage(finalImage, BUCKETS.CLOTHING, {
                    folder: `outfits/${user.id}`, // Subfolder for organization
                    fileName: `outfit_${Date.now()}`
                });

                if (uploadResult.success) {
                    publicImageUrl = uploadResult.url;
                } else {
                    console.error("Failed to upload outfit image:", uploadResult.error);
                }
            }

            let savedOutfitId = outfitId;

            if (outfitId) {
                // UPDATE existing outfit
                const updatePayload: any = {
                    name: outfitName,
                    occasion: outfitOccasion,
                    description: `Outfit con ${totalSelected} prendas`,
                    updated_at: new Date().toISOString()
                };

                if (publicImageUrl) {
                    updatePayload.image_url = publicImageUrl;
                }

                const { error: updateError } = await (supabase.from('outfits') as any)
                    .update(updatePayload)
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
                const { data: outfitData, error: outfitError } = await (supabase.from('outfits') as any)
                    .insert({
                        user_id: user.id,
                        name: outfitName,
                        occasion: outfitOccasion,
                        description: `Outfit con ${totalSelected} prendas`,
                        season: 'all-season', // Default for now
                        is_public: false,
                        ai_generated: false,
                        image_url: publicImageUrl
                    } as any)
                    .select()
                    .single();

                if (outfitError) throw outfitError;
                savedOutfitId = (outfitData as any).id;
                savedOutfitIdRef.current = savedOutfitId;
            }

            // Create Outfit Items (Common for both insert and update)
            const outfitItemsArr: any[] = [];
            const currentCanvasState = canvasState; // Use the continuously updated state!

            Object.entries(selections).forEach(([slotId, items]) => {
                items.forEach(item => {
                    const state = currentCanvasState[item.id] || { x: 50, y: 50, scale: 1, rotation: 0, zIndex: 1 };

                    outfitItemsArr.push({
                        outfit_id: savedOutfitId,
                        clothing_item_id: item.id,
                        position_x: state.x ?? 50,
                        position_y: state.y ?? 50,
                        scale: state.scale ?? 1,
                        rotation: state.rotation ?? 0,
                        layer_order: state.zIndex ?? 1
                    });
                });
            });

            if (outfitItemsArr.length > 0) {
                const { error: itemsError } = await supabase
                    .from('outfit_items')
                    .insert(outfitItemsArr as any);

                if (itemsError) throw itemsError;
            }

            setSuccessModalConfig({
                isOpen: true,
                outfitName,
                isUpdate: !!outfitId,
                savedOutfitId,
                returnTo: searchParams.get('returnTo')
            });

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
            <main className="flex-1 flex flex-col lg:flex-row lg:container lg:mx-auto lg:max-w-7xl lg:p-8 lg:gap-8 overflow-hidden h-full">

                {/* MOBILE: Two-Step Flow */}
                <div className="flex-1 flex flex-col lg:hidden relative h-full">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Selection */}
                        {mobileStep === 'selection' && (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                <div className="p-4 bg-[var(--background)] sticky top-0 z-10">
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
                                </div>

                                {/* Unified Grid for filtered items */}
                                <div className="flex-1 overflow-y-auto px-4 pb-32">
                                    <div className="grid grid-cols-3 gap-3">
                                        {filteredItems.length === 0 ? (
                                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-[var(--foreground-secondary)]">
                                                <p>No se encontraron prendas con estos filtros.</p>
                                            </div>
                                        ) : (
                                            filteredItems.map(item => {
                                                // Determine slot dynamically for selection checking
                                                let slot = 'accessories';
                                                const cat = item.category?.toLowerCase() || '';
                                                if (['top', 'shirt', 'blouse', 't-shirt', 'sweater', 'jersey'].includes(cat)) slot = 'top';
                                                else if (['bottom', 'pants', 'skirt', 'jeans', 'shorts', 'dress'].includes(cat)) slot = 'bottom';
                                                else if (['shoes', 'boots', 'sneakers', 'sandals'].includes(cat)) slot = 'shoes';
                                                else if (['outerwear', 'jacket', 'coat', 'blazer'].includes(cat)) slot = 'layer';
                                                else if (cat === 'accessory') {
                                                    if (item.name.toLowerCase().includes('sombrero') || item.name.toLowerCase().includes('gorra') || item.name.toLowerCase().includes('gafas')) {
                                                        slot = 'headwear';
                                                    }
                                                }

                                                const isSelected = selections[slot]?.some(i => i.id === item.id);

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleSelect(slot, item)}
                                                        className={`cursor-pointer group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--card-bg)] transition-all flex flex-col ${isSelected
                                                            ? 'ring-2 ring-inset ring-[var(--brand-pink)]'
                                                            : 'ring-1 ring-inset ring-[var(--border-color)]'
                                                            }`}
                                                    >
                                                        <div className="flex-1 w-full relative bg-[var(--background-secondary)]">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-[var(--brand-pink)]/20 flex items-center justify-center">
                                                                    <div className="bg-[var(--brand-pink)] text-white rounded-full p-1">
                                                                        <Check className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-2 bg-[var(--card-bg)] border-t border-[var(--border-color)] shrink-0 text-left">
                                                            <p className="text-[var(--foreground)] text-xs font-bold truncate">{item.name}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Next Button */}
                                <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md z-40">
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
                                className="flex flex-col h-full p-4 space-y-4 pb-24 overflow-y-auto"
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
                                        className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl text-[var(--foreground)] outline-none mb-4"
                                    />

                                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                        Tipo de Outfit
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'casual', label: 'Casual', icon: Circle },
                                            { id: 'everyday', label: 'Diario', icon: Sparkles },
                                            { id: 'business', label: 'Negocios', icon: Briefcase },
                                            { id: 'formal', label: 'Formal', icon: Briefcase },
                                            { id: 'party', label: 'Fiesta', icon: PartyPopper },
                                            { id: 'sport', label: 'Deporte', icon: Zap },
                                            { id: 'date', label: 'Cita', icon: Heart },
                                        ].map((occ) => {
                                            const Icon = occ.icon;
                                            return (
                                                <button
                                                    key={occ.id}
                                                    onClick={() => setOutfitOccasion(occ.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                                        outfitOccasion === occ.id
                                                            ? 'bg-[var(--brand-pink)] text-white'
                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--border-color)]'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {occ.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Canvas Preview - Border removed for cleaner look */}
                                <div className="w-full bg-white overflow-hidden aspect-[4/5] shadow-sm">
                                    <FreeDragCanvas
                                        ref={canvasRef}
                                        items={flatItems}
                                        onRemoveItem={handleRemoveItem}
                                        initialState={canvasState}
                                        onStateChange={setCanvasState}
                                    />
                                </div>
                                <button
                                    onClick={() => setMobileStep('selection')}
                                    className="w-full py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--background-secondary)] transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                        <Shirt className="w-4 h-4 text-[var(--brand-pink)]" />
                                    </div>
                                    Seguir añadiendo prendas
                                </button>

                                {/* Preview & Save Buttons */}
                                <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md z-40 flex gap-3">
                                    <Button
                                        onClick={handlePreview}
                                        disabled={isEmpty || previewLoading}
                                        className="flex-1 rounded-full py-4 text-sm font-semibold bg-[var(--background)] border-2 border-[var(--brand-pink)] text-[var(--brand-pink)]"
                                    >
                                        <Eye className="w-5 h-5 mr-2" />
                                        Preview
                                    </Button>

                                    <Button
                                        onClick={handleSave}
                                        disabled={isEmpty || !outfitName.trim()}
                                        glow={!isEmpty && outfitName.trim().length > 0}
                                        className="flex-1 rounded-full py-4 text-sm font-semibold"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Guardar
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* DESKTOP: Side-by-side Layout */}
                <div className="hidden lg:flex lg:flex-1 lg:gap-8 overflow-hidden h-full">
                    {/* Left: Selection Panel (Unified Grid) */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
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

                        {/* Grid Container */}
                        <div className="flex-1 overflow-y-auto bg-[var(--card-bg)]/50 rounded-3xl p-6">
                            <div className="grid grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredItems.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-[var(--foreground-secondary)]">
                                        <p>No se encontraron prendas.</p>
                                    </div>
                                ) : (
                                    filteredItems.map(item => {
                                        // Determine slot dynamically
                                        let slot = 'accessories';
                                        const cat = item.category?.toLowerCase() || '';
                                        if (['top', 'shirt', 'blouse', 't-shirt', 'sweater', 'jersey'].includes(cat)) slot = 'top';
                                        else if (['bottom', 'pants', 'skirt', 'jeans', 'shorts', 'dress'].includes(cat)) slot = 'bottom';
                                        else if (['shoes', 'boots', 'sneakers', 'sandals'].includes(cat)) slot = 'shoes';
                                        else if (['outerwear', 'jacket', 'coat', 'blazer'].includes(cat)) slot = 'layer';
                                        else if (cat === 'accessory') {
                                            if (item.name.toLowerCase().includes('sombrero') || item.name.toLowerCase().includes('gorra') || item.name.toLowerCase().includes('gafas')) {
                                                slot = 'headwear';
                                            }
                                        }

                                        const isSelected = selections[slot]?.some(i => i.id === item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(slot, item)}
                                                className={`cursor-pointer group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--card-bg)] transition-all duration-300 flex flex-col ${isSelected
                                                    ? 'ring-2 ring-inset ring-[var(--brand-pink)]'
                                                    : 'ring-1 ring-inset ring-[var(--border-color)]'
                                                    }`}
                                            >
                                                <div className="flex-1 w-full relative bg-[var(--background-secondary)]">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-[var(--brand-pink)]/20 flex items-center justify-center backdrop-blur-[1px]">
                                                            <div className="bg-[var(--brand-pink)] text-white rounded-full p-2 shadow-lg scale-110">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-[var(--card-bg)] border-t border-[var(--border-color)] shrink-0 text-left">
                                                    <p className="text-[var(--foreground)] text-xs font-bold truncate">{item.name}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview Panel (Sticky) */}
                    <div className="w-[400px] flex-shrink-0 flex flex-col gap-4 h-full overflow-y-auto pb-8">
                        {/* Outfit Name */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] shadow-sm">
                            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                Nombre del Outfit
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Look casual de verano"
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all mb-4"
                            />

                            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                Tipo de Outfit
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'casual', label: 'Casual', icon: Circle },
                                    { id: 'everyday', label: 'Diario', icon: Sparkles },
                                    { id: 'business', label: 'Negocios', icon: Briefcase },
                                    { id: 'formal', label: 'Formal', icon: Briefcase },
                                    { id: 'party', label: 'Fiesta', icon: PartyPopper },
                                    { id: 'sport', label: 'Deporte', icon: Zap },
                                    { id: 'date', label: 'Cita', icon: Heart },
                                ].map((occ) => {
                                    const Icon = occ.icon;
                                    return (
                                        <button
                                            key={occ.id}
                                            onClick={() => setOutfitOccasion(occ.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                                outfitOccasion === occ.id
                                                    ? 'bg-[var(--brand-pink)] text-white'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--border-color)]'
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {occ.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Canvas - Added border per request */}
                        <div className="overflow-hidden shadow-lg bg-white border border-gray-200 rounded-2xl">
                            <FreeDragCanvas
                                ref={canvasRef}
                                items={flatItems}
                                onRemoveItem={handleRemoveItem}
                                initialState={canvasState}
                                onStateChange={setCanvasState}
                            />
                        </div>

                        {/* Info & Save */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--border-color)] space-y-4 shadow-sm">
                            <div className="flex justify-between items-center text-sm font-medium text-[var(--foreground-secondary)]">
                                <span>{totalSelected} prendas seleccionadas</span>
                                {totalSelected > 0 && <span className="text-[var(--brand-pink)]">¡Listo para guardar!</span>}
                            </div>

                            <Button
                                onClick={handlePreview}
                                disabled={isEmpty || previewLoading}
                                variant="outline"
                                className="w-full rounded-2xl py-6 text-sm font-bold border-2 hover:bg-[var(--background-secondary)]"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                {previewLoading ? 'Generando...' : 'Ver Preview Completa'}
                            </Button>

                            <Button
                                onClick={handleSave}
                                disabled={isEmpty || !outfitName.trim()}
                                glow={!isEmpty && outfitName.trim().length > 0}
                                className="w-full rounded-2xl py-6 text-sm font-bold shadow-lg shadow-pink-500/20"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Outfit
                            </Button>
                        </div>
                    </div>
                </div>

            </main>

            {/* Success Modal */}
            <AnimatePresence>
                {successModalConfig.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                         <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xl w-full max-w-sm flex flex-col items-center text-center"
                         >
                              <div className="w-16 h-16 bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] rounded-full flex items-center justify-center mb-4">
                                  <Check className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">¡Outfit {successModalConfig.isUpdate ? 'actualizado' : 'creado'}!</h3>
                              <p className="text-[var(--foreground-secondary)] text-sm mb-6">
                                  El outfit "{successModalConfig.outfitName}" se ha {successModalConfig.isUpdate ? 'actualizado' : 'guardado'} correctamente.
                              </p>
                              <Button
                                  onClick={() => {
                                      setSuccessModalConfig({ ...successModalConfig, isOpen: false });
                                      const rTo = successModalConfig.returnTo;
                                      if (rTo) {
                                          const separator = rTo.includes('?') ? '&' : '?';
                                          router.push(`${rTo}${separator}outfitId=${successModalConfig.savedOutfitId}`);
                                      } else {
                                          router.push('/closet?tab=outfits');
                                      }
                                  }}
                                  className="w-full rounded-xl py-3 font-semibold"
                                  glow
                              >
                                  Ir al Armario
                              </Button>
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl overflow-hidden aspect-[4/5] w-auto h-auto max-h-[90vh] max-w-[90vw] flex flex-col shadow-2xl mx-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Preview del Outfit</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Preview Image - FULL VIEW, NO SCROLL */}
                            <div className="flex-1 flex items-center justify-center bg-white overflow-hidden p-0">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center p-12 text-gray-400">
                                        <p>No se pudo generar la preview</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons Removed per request */}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
