'use client';

/**
 * Create Outfit - Mobile & Desktop Flow
 * Mobile 3-Step:
 *   1. Selection: Choose garments with filters
 *   2. Canvas: Fixed-size canvas with Undo (paso atrás) / Redo (paso adelante) + Continue
 *   3. Details: Name, Category/Occasion, Calendar (Pro), and Save
 * Desktop: Side-by-side with Canvas Undo/Redo toolbar and keyboard shortcuts
 */

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    ArrowLeft, 
    Save, 
    ArrowRight, 
    Shirt, 
    Eye, 
    X, 
    Share2, 
    Camera, 
    Check, 
    Briefcase, 
    PartyPopper, 
    Zap, 
    Heart, 
    Circle,
    Coffee, 
    Crown, 
    Flame, 
    Palmtree, 
    Moon, 
    Sun, 
    Snowflake,
    Calendar,
    Lock,
    Undo2,
    Redo2
} from 'lucide-react';
import { Button, KloeMascot } from '@/components';
import { haptics } from '@/lib/haptic';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { ClothingItem } from '@/types/clothing';
import { CarouselSlot } from '@/components/Creator/CarouselSlot';
import { FreeDragCanvas, FreeDragCanvasRef } from '@/components/Creator/FreeDragCanvas';
import { FilterBar } from '@/components/Creator/FilterBar';
import { MobileItemSelector } from '@/components/Creator/MobileItemSelector';

import { supabase } from '@/lib/supabase/client';
import { uploadImage, BUCKETS } from '@/lib/supabase/storage';
import Image from 'next/image';
import Link from 'next/link';
import { useUiStore } from '@/store/uiStore';
import { useTourStore } from '@/store/tourStore';
import { useUser } from '@/store';
import { showDatabaseError } from '@/lib/errorModal';

const OUTFIT_OCCASIONS = [
    { id: 'everyday', label: 'Diario', icon: Sun },
    { id: 'casual', label: 'Casual', icon: Coffee },
    { id: 'streetwear', label: 'Streetwear', icon: Flame },
    { id: 'business', label: 'Negocios', icon: Briefcase },
    { id: 'formal', label: 'Formal', icon: Crown },
    { id: 'party', label: 'Fiesta', icon: PartyPopper },
    { id: 'date', label: 'Cita', icon: Heart },
    { id: 'sport', label: 'Deporte', icon: Zap },
    { id: 'vacation', label: 'Vacaciones', icon: Palmtree },
    { id: 'evening', label: 'Noche', icon: Moon },
    { id: 'beach', label: 'Playa', icon: Sun },
    { id: 'winter', label: 'Invierno', icon: Snowflake },
    { id: 'summer', label: 'Verano', icon: Sun },
];

function CreateOutfitContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const outfitId = searchParams.get('outfitId');
    const { items: wardrobeItems } = useWardrobe();
    const { setTabBarHidden, openPremiumModal } = useUiStore();
    const { isPremium } = useUser();
    const isPro = isPremium();

    // Hide mobile tab bar while creating outfit
    useEffect(() => {
        setTabBarHidden(true);
        return () => setTabBarHidden(false);
    }, [setTabBarHidden]);

    // Mobile flow: 1. selection → 2. canvas → 3. details
    const [mobileStep, setMobileStep] = useState<'selection' | 'canvas' | 'details'>('selection');

    // History state for Undo / Redo
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Outfit metadata
    const [outfitName, setOutfitName] = useState('');
    const [outfitOccasion, setOutfitOccasion] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(true);
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

    // Canvas refs (separate for mobile and desktop to avoid DOM ref conflicts)
    const mobileCanvasRef = useRef<FreeDragCanvasRef>(null);
    const desktopCanvasRef = useRef<FreeDragCanvasRef>(null);

    const getActiveCanvas = useCallback(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            return desktopCanvasRef.current || mobileCanvasRef.current;
        }
        return mobileCanvasRef.current || desktopCanvasRef.current;
    }, []);

    // Global keyboard shortcuts for Undo / Redo (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
            if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

            if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                getActiveCanvas()?.undo();
            } else if (
                ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
                ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
            ) {
                e.preventDefault();
                getActiveCanvas()?.redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [getActiveCanvas]);

    // Flatten selections to a single list for FreeDragCanvas
    const flatItems = useMemo(() => {
        return Object.values(selections).flat();
    }, [selections]);
    
    const savedOutfitIdRef = useRef<string | null>(null);

    // Success Modal State
    const [successModalConfig, setSuccessModalConfig] = useState<{
        isOpen: boolean;
        outfitName: string;
        isUpdate: boolean;
        savedOutfitId?: string | null;
        returnTo?: string | null;
    }>({ isOpen: false, outfitName: '', isUpdate: false });

    const scheduledDateParam = searchParams.get('date') || searchParams.get('scheduledDate') || searchParams.get('scheduled_for');

    useEffect(() => {
        if (scheduledDateParam) {
            if (!isPro) {
                setScheduledDate('');
                openPremiumModal('yearly');
                toast.info('Programar looks en el calendario es exclusivo de Klozet Pro');
            } else {
                setScheduledDate(decodeURIComponent(scheduledDateParam));
            }
        }
    }, [scheduledDateParam, isPro, openPremiumModal]);

    // Filter states
    const [scheduledDate, setScheduledDate] = useState((scheduledDateParam && isPro) ? decodeURIComponent(scheduledDateParam) : '');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Load outfit data if editing
    useEffect(() => {
        if (!outfitId) return;

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
                    setIsPublic(outfit.is_public ?? true);

                    // Fetch scheduled calendar date if exists
                    try {
                        const { data: calData } = await (supabase.from('calendar_outfits') as any)
                            .select('date')
                            .eq('outfit_id', outfitId)
                            .order('date', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        if (calData?.date && !scheduledDateParam) {
                            if (isPro) {
                                setScheduledDate(calData.date);
                            }
                        }
                    } catch (calErr) {
                        console.warn('Error loading calendar date for outfit:', calErr);
                    }

                    // Reconstruct selections and canvas state
                    const newSelections: Record<string, ClothingItem[]> = {
                        headwear: [], top: [], layer: [], bottom: [], shoes: [], accessories: []
                    };
                    const newCanvasState: Record<string, any> = {};

                    outfit.outfit_items.forEach((oi: any) => {
                        const item = oi.param_clothing_item || oi.clothing_item;
                        if (!item) return;

                        const clothingItem: ClothingItem = {
                            id: item.id,
                            imageUrl: item.image_url,
                            category: item.category as any,
                            name: item.name,
                            brand: item.brand,
                            color: item.color as any,
                            originalImageUrl: item.original_image,
                            favorite: item.is_favorite,
                            createdAt: new Date(item.created_at),
                            season: item.season || [],
                            tags: item.tags || [],
                        };

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

                        newCanvasState[item.id] = {
                            x: oi.position_x ?? 50,
                            y: oi.position_y ?? 50,
                            scale: oi.scale ?? 1,
                            rotation: oi.rotation ?? 0,
                            zIndex: oi.layer_order ?? 1
                        };
                    });

                    setSelections(newSelections);
                    setCanvasState(newCanvasState);
                    // Start in canvas view when editing an outfit
                    setMobileStep('canvas');
                }
            } catch (err) {
                console.error('Error fetching outfit:', err);
                toast.error('No se pudo cargar el outfit.');
                router.push('/closet');
            } finally {
                setLoading(false);
            }
        };

        fetchOutfit();
    }, [outfitId, router, isPro, scheduledDateParam]);

    // Load preselected items if coming from Kloe or external link
    const itemIdsParam = searchParams.get('itemIds') || searchParams.get('items');
    const outfitNameParam = searchParams.get('name') || searchParams.get('outfitName');
    const occasionParam = searchParams.get('occasion');
    const fromKloeParam = searchParams.get('fromKloe') || searchParams.get('from') || searchParams.get('source');
    const isFromKloe = Boolean(itemIdsParam || fromKloeParam === 'true' || fromKloeParam === 'kloe');

    useEffect(() => {
        if (outfitId || !itemIdsParam) return;

        const loadPreselectedItems = async () => {
            setLoading(true);
            try {
                const ids = itemIdsParam.split(',').map(id => id.trim()).filter(Boolean);
                if (ids.length === 0) return;

                const { data: clothesList, error } = await supabase
                    .from('clothing_items')
                    .select('*')
                    .in('id', ids);

                if (error) throw error;

                if (clothesList && clothesList.length > 0) {
                    if (outfitNameParam) setOutfitName(decodeURIComponent(outfitNameParam));
                    if (occasionParam) setOutfitOccasion(decodeURIComponent(occasionParam));

                    const newSelections: Record<string, ClothingItem[]> = {
                        headwear: [], top: [], layer: [], bottom: [], shoes: [], accessories: []
                    };
                    const newCanvasState: Record<string, any> = {};

                    clothesList.forEach((item: any, idx: number) => {
                        const clothingItem: ClothingItem = {
                            id: item.id,
                            imageUrl: item.image_url || item.original_image,
                            category: item.category as any,
                            name: item.name,
                            brand: item.brand,
                            color: item.color as any,
                            originalImageUrl: item.original_image,
                            favorite: item.is_favorite,
                            createdAt: new Date(item.created_at || Date.now()),
                            season: item.season || [],
                            tags: item.tags || [],
                        };

                        let slot = 'accessories';
                        let defaultY = 50;
                        const cat = (clothingItem.category || '').toLowerCase();
                        if (['top', 'shirt', 'blouse', 't-shirt', 'sweater', 'jersey', 'topwear'].some(s => cat.includes(s))) {
                            slot = 'top';
                            defaultY = 32;
                        } else if (['bottom', 'pants', 'skirt', 'jeans', 'shorts', 'dress', 'bottomwear'].some(s => cat.includes(s))) {
                            slot = 'bottom';
                            defaultY = 58;
                        } else if (['shoes', 'boots', 'sneakers', 'sandals', 'footwear'].some(s => cat.includes(s))) {
                            slot = 'shoes';
                            defaultY = 82;
                        } else if (['outerwear', 'jacket', 'coat', 'blazer'].some(s => cat.includes(s))) {
                            slot = 'layer';
                            defaultY = 32;
                        } else if (clothingItem.name.toLowerCase().includes('gorra') || clothingItem.name.toLowerCase().includes('sombrero')) {
                            slot = 'headwear';
                            defaultY = 12;
                        }

                        if (newSelections[slot]) {
                            newSelections[slot].push(clothingItem);
                        }

                        newCanvasState[item.id] = {
                            x: 50,
                            y: defaultY,
                            scale: 1,
                            rotation: 0,
                            zIndex: idx + 1
                        };
                    });

                    setSelections(newSelections);
                    setCanvasState(newCanvasState);
                    setMobileStep('canvas');
                }
            } catch (err) {
                console.error('Error preloading items:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPreselectedItems();
    }, [outfitId, itemIdsParam, outfitNameParam, occasionParam]);

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
            if (selectedColors.length > 0) {
                const colorTranslations: Record<string, string[]> = {
                    'red': ['red', 'rojo', 'roja'],
                    'blue': ['blue', 'azul'],
                    'green': ['green', 'verde'],
                    'yellow': ['yellow', 'amarillo', 'amarilla'],
                    'black': ['black', 'negro', 'negra'],
                    'white': ['white', 'blanco', 'blanca'],
                    'pink': ['pink', 'rosa', 'rosado'],
                    'purple': ['purple', 'morado', 'morada', 'lila', 'violeta'],
                    'orange': ['orange', 'naranja', 'anaranjado'],
                    'gray': ['gray', 'grey', 'gris'],
                    'brown': ['brown', 'marrón', 'marron', 'cafe', 'café'],
                    'beige': ['beige', 'crema'],
                    'maroon': ['maroon', 'granate', 'bordeaux', 'vino'],
                    'lightblue': ['lightblue', 'celeste', 'azul claro'],
                    'cyan': ['cyan', 'cian', 'turquesa'],
                    'khaki': ['khaki', 'caqui', 'kaki']
                };

                const colorMatches = selectedColors.some(selectedColor => {
                    const c = item.color?.toLowerCase() || '';
                    const n = item.name?.toLowerCase() || '';
                    const synonyms = colorTranslations[selectedColor] || [selectedColor];
                    return synonyms.some(syn => c.includes(syn) || c === syn || n.includes(syn));
                });
                if (!colorMatches) return false;
            }
            if (selectedTypes.length > 0) {
                const typeMatches = selectedTypes.some(type => {
                    const t = type.toLowerCase();
                    const c = item.category?.toLowerCase() || '';
                    const n = item.name?.toLowerCase() || '';
                    if (t === 'camiseta') return c === 'top' || c === 'shirt' || n.includes('camiseta');
                    if (t === 'pantalón') return c === 'bottom' || n.includes('pantalón') || n.includes('pantalon');
                    if (t === 'vestido') return c === 'dress' || n.includes('vestido');
                    if (t === 'chaqueta') return c === 'outerwear' || n.includes('chaqueta');
                    if (t === 'jersey') return c === 'sweater' || n.includes('jersey');
                    if (t === 'sudadera') return n.includes('sudadera') || n.includes('hoodie');
                    if (t === 'abrigo') return c === 'outerwear' || n.includes('abrigo');
                    if (t === 'falda') return c === 'skirt' || n.includes('falda');
                    if (t === 'shorts') return n.includes('short');
                    if (t === 'zapatos') return c === 'shoes' || n.includes('zapat') || n.includes('sneaker');
                    if (t === 'accesorios') return c === 'accessory' || n.includes('accesorio') || n.includes('gorra') || n.includes('sombrero') || n.includes('gafas') || n.includes('bolso');
                    return false;
                });
                if (!typeMatches) return false;
            }
            if (showFavoritesOnly && !item.favorite) {
                return false;
            }
            return true;
        });
    }, [wardrobeItems, searchQuery, selectedColors, selectedTypes, showFavoritesOnly]);

    // Check if outfit is empty
    const isEmpty = Object.values(selections).every(items => items.length === 0);
    const totalSelected = Object.values(selections).reduce((sum, items) => sum + items.length, 0);

    // Save outfit
    const handleSave = async () => {
        if (loading) return;
        if (isEmpty) {
            toast.error('No puedes guardar un outfit sin prendas');
            return;
        }
        if (!outfitName.trim()) {
            toast.error('Ponle un nombre a tu outfit');
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Debes iniciar sesión para guardar outfits');
                setLoading(false);
                return;
            }

            // 1. Generate Image from the active canvas
            const finalImage = await getActiveCanvas()?.exportToImage() || null;

            // 2. Upload Image to Storage
            let publicImageUrl = null;
            if (finalImage) {
                const uploadResult = await uploadImage(finalImage, BUCKETS.CLOTHING, {
                    folder: `outfits/${user.id}`,
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
                    occasion: outfitOccasion || null,
                    description: '',
                    updated_at: new Date().toISOString()
                };

                if (publicImageUrl) {
                    updatePayload.image_url = publicImageUrl;
                }

                const { error: updateError } = await (supabase.from('outfits') as any)
                    .update(updatePayload)
                    .eq('id', outfitId);

                if (updateError) throw updateError;

                // Delete existing items to replace them
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
                        occasion: outfitOccasion || null,
                        description: '',
                        season: 'all-season',
                        is_public: isPublic,
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
            const currentCanvasState = canvasState;

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

            // Sync with calendar_outfits if scheduledDate is provided and user is premium
            if (scheduledDate && savedOutfitId && user) {
                if (!isPro) {
                    setScheduledDate('');
                } else {
                    try {
                        await (supabase.from('calendar_outfits') as any).upsert({
                            user_id: user.id,
                            outfit_id: savedOutfitId,
                            date: scheduledDate
                        }, { onConflict: 'user_id,date,outfit_id' });

                        useTourStore.getState().markStepComplete('schedule_outfit', '¡Has planificado tu outfit en el calendario!', true);
                    } catch (calErr) {
                        console.warn('Could not sync calendar_outfits:', calErr);
                    }
                }
            }

            // Guided tour real-time trigger for outfit creation
            try {
                useTourStore.getState().markStepComplete('create_outfit', '¡Has creado tu primer look en el lienzo interactivo!', true);
            } catch (tourErr) {
                console.warn('[CreateOutfit] Error updating tour step:', tourErr);
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
            toast.error('Error al guardar el outfit. Inténtalo de nuevo.');
            showDatabaseError(error, 'No se pudo guardar el outfit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border-color)] w-full px-4 lg:px-8 h-16 flex items-center justify-between">
                {/* Mobile Step 1: Selection Header */}
                <div className={`w-full flex items-center justify-between lg:hidden ${mobileStep !== 'selection' ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors active:scale-95"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-[var(--foreground)]">Elegir Prendas</h1>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)]">1/3</span>
                        </div>
                    </div>
                    {totalSelected > 0 && (
                        <button
                            onClick={() => setMobileStep('canvas')}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full kz-pink-surface text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                            <span>Lienzo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Mobile Step 2: Canvas Header (Undo, Redo, Continue) */}
                <div className={`w-full flex items-center justify-between lg:hidden ${mobileStep !== 'canvas' ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setMobileStep('selection')}
                            className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors active:scale-95 cursor-pointer"
                            title="Volver a elegir prendas"
                            aria-label="Volver a elegir prendas"
                        >
                            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                        </button>

                        <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

                        <button
                            onClick={() => mobileCanvasRef.current?.undo()}
                            disabled={!canUndo}
                            className="p-2 rounded-full hover:bg-[var(--background-secondary)] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
                            title="Paso atrás (Deshacer)"
                            aria-label="Paso atrás"
                        >
                            <Undo2 className="w-5 h-5 text-[var(--foreground)]" />
                        </button>

                        <button
                            onClick={() => mobileCanvasRef.current?.redo()}
                            disabled={!canRedo}
                            className="p-2 rounded-full hover:bg-[var(--background-secondary)] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
                            title="Paso adelante (Rehacer)"
                            aria-label="Paso adelante"
                        >
                            <Redo2 className="w-5 h-5 text-[var(--foreground)]" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[var(--foreground)]">Colocar</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)]">2/3</span>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => setMobileStep('details')}
                            className="flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-full kz-pink-surface text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                            <span>Continuar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Step 3: Details Header */}
                <div className={`w-full flex items-center justify-between lg:hidden ${mobileStep !== 'details' ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileStep('canvas')}
                            className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors active:scale-95 cursor-pointer"
                            aria-label="Volver al lienzo"
                        >
                            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-[var(--foreground)]">Guardar Outfit</h1>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)]">3/3</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors active:scale-95 cursor-pointer"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
                        </button>
                        <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                            {outfitId ? 'Editar Outfit' : 'Crear Outfit'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border-color)]">
                            {totalSelected} {totalSelected === 1 ? 'prenda seleccionada' : 'prendas seleccionadas'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row w-full px-4 lg:px-8 py-5 lg:gap-8 overflow-hidden h-[calc(100vh-4rem)]">

                {/* MOBILE: 3-Step Flow */}
                <div className="flex-1 flex flex-col lg:hidden relative h-full">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Selection Screen */}
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
                                        selectedColors={selectedColors}
                                        onColorsChange={setSelectedColors}
                                        selectedTypes={selectedTypes}
                                        onTypesChange={setSelectedTypes}
                                        showFavoritesOnly={showFavoritesOnly}
                                        onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    />
                                </div>

                                {/* Unified Grid for filtered items */}
                                <div className="flex-1 overflow-y-auto px-4 pb-48">
                                    <div className="grid grid-cols-3 gap-3">
                                        {filteredItems.length === 0 ? (
                                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-[var(--foreground-secondary)]">
                                                <p>No se encontraron prendas con estos filtros.</p>
                                            </div>
                                        ) : (
                                            filteredItems.map(item => {
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
                                                        className={`cursor-pointer group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#f8f9fa] dark:bg-[#111] transition-all flex flex-col ${isSelected
                                                            ? 'ring-2 ring-inset ring-[var(--brand-pink)]'
                                                            : 'ring-1 ring-inset ring-[var(--border-color)]'
                                                            }`}
                                                    >
                                                        {item.favorite && (
                                                            <div className="absolute top-2 right-3 z-10 text-[var(--brand-pink)] drop-shadow-md">
                                                                <Heart className="w-4 h-4 fill-current" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 w-full relative bg-transparent flex items-center justify-center">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain p-2"
                                                                loading="lazy"
                                                            />
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                                                    <div className="bg-[var(--brand-pink)] text-white rounded-full p-2 shadow-lg scale-110">
                                                                        <Check className="w-5 h-5" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Fixed Canvas Screen with Undo/Redo */}
                        {mobileStep === 'canvas' && (
                            <motion.div
                                key="canvas"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col justify-between items-center p-4 pb-6 overflow-hidden touch-none select-none h-[calc(100dvh-64px)]"
                            >
                                {/* Subtle hint */}
                                <div className="text-center py-0.5">
                                    <p className="text-xs text-[var(--foreground-secondary)] font-medium">
                                        Arrastra y coloca tus prendas en el look
                                    </p>
                                </div>

                                {/* Fixed Canvas Container - Not taking whole screen */}
                                <div className="w-full max-w-[340px] sm:max-w-[370px] aspect-[4/5] max-h-[52vh] sm:max-h-[56vh] bg-white rounded-3xl shadow-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.12] my-auto flex-shrink-0 touch-none relative">
                                    <FreeDragCanvas
                                        ref={mobileCanvasRef}
                                        items={flatItems}
                                        onRemoveItem={handleRemoveItem}
                                        initialState={canvasState}
                                        onStateChange={setCanvasState}
                                        onHistoryChange={(u, r) => {
                                            setCanUndo(u);
                                            setCanRedo(r);
                                        }}
                                    />
                                </div>

                                {/* Bottom helper bar */}
                                <div className="w-full max-w-[340px] flex flex-col gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setMobileStep('selection')}
                                        className="w-full py-2.5 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[var(--background-secondary)] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                            <Shirt className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                        </div>
                                        <span>Elegir más prendas ({totalSelected})</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Details & Save Screen */}
                        {mobileStep === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full p-4 space-y-4 pb-36 overflow-y-auto"
                            >
                                {/* Outfit Name Input */}
                                <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] shadow-xs">
                                    <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-2">
                                        Nombre del Outfit
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Look casual de verano"
                                        value={outfitName}
                                        onChange={(e) => setOutfitName(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl text-sm text-[var(--foreground)] outline-none border border-transparent focus:border-[var(--brand-pink)] transition-all mb-4"
                                    />

                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                                            Tipo de Outfit / Ocasión
                                        </label>
                                        {outfitOccasion && (
                                            <button
                                                type="button"
                                                onClick={() => setOutfitOccasion(null)}
                                                className="text-[11px] text-[var(--brand-pink)] hover:underline font-medium cursor-pointer"
                                            >
                                                Desmarcar
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {OUTFIT_OCCASIONS.map((occ) => {
                                            const Icon = occ.icon;
                                            const isSelected = outfitOccasion === occ.id;
                                            return (
                                                <button
                                                    key={occ.id}
                                                    type="button"
                                                    onClick={() => setOutfitOccasion(isSelected ? null : occ.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[var(--brand-pink)] text-white shadow-sm'
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

                                {/* Mobile Calendar Scheduling */}
                                {isPro ? (
                                    <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] shadow-xs space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[var(--foreground)]">Programar en Calendario</p>
                                                    <p className="text-[10px] text-[var(--foreground-tertiary)]">Asigna el día para lucir este outfit</p>
                                                </div>
                                            </div>
                                            {scheduledDate && (
                                                <button
                                                    type="button"
                                                    onClick={() => setScheduledDate('')}
                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/20 transition-all cursor-pointer"
                                                >
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative flex items-center bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 focus-within:border-[var(--brand-pink)] focus-within:ring-2 focus-within:ring-[var(--brand-pink)]/15 transition-all px-3.5 py-2.5">
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full bg-transparent text-xs text-[var(--foreground)] font-medium outline-none cursor-pointer scheme-light dark:scheme-dark"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => {
                                            openPremiumModal('yearly');
                                            toast.info('Programar looks en el calendario es exclusivo de Klozet Pro');
                                        }}
                                        className="bg-zinc-100/90 dark:bg-zinc-800/40 rounded-2xl p-4 border border-dashed border-zinc-300 dark:border-zinc-700 space-y-3 cursor-pointer hover:border-[var(--brand-pink)]/50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700/60 flex items-center justify-center text-zinc-500">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Programar en Calendario</p>
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--brand-pink)] text-white">Pro</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Exclusivo de Klozet Pro</p>
                                                </div>
                                            </div>
                                            <Lock className="w-4 h-4 text-zinc-400 group-hover:text-[var(--brand-pink)] transition-colors" />
                                        </div>
                                        <div className="relative flex items-center bg-zinc-200/50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 px-3.5 py-2.5 opacity-60">
                                            <span className="text-xs text-zinc-400 font-medium">Bloqueado · Desbloquear con Klozet Pro</span>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Public Toggle */}
                                <div className="bg-[var(--card-bg)] px-5 py-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between shadow-xs">
                                    <div>
                                        <p className="text-sm font-bold text-[var(--foreground)]">Outfit Público</p>
                                        <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5">Visible para todos en tu perfil</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setIsPublic(!isPublic)}
                                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isPublic ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Garments Summary Info */}
                                <div className="bg-[var(--card-bg)] rounded-2xl p-3 border border-[var(--border-color)] flex items-center justify-between shadow-xs">
                                    <span className="text-xs text-[var(--foreground-secondary)] font-medium">Prendas en el look:</span>
                                    <span className="text-xs font-bold text-[var(--foreground)]">{totalSelected} prendas seleccionadas</span>
                                </div>

                                {/* Save Button */}
                                <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-[var(--border-color)] bg-[var(--background)]/90 backdrop-blur-md z-40">
                                    <Button
                                        onClick={handleSave}
                                        glow={true}
                                        loading={loading}
                                        disabled={loading || !outfitName.trim() || isEmpty}
                                        className="w-full rounded-2xl py-3.5 text-sm font-semibold shadow-xl kz-pink-surface text-white"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        {outfitId ? 'Guardar Cambios' : 'Guardar Outfit'}
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
                            selectedColors={selectedColors}
                            onColorsChange={setSelectedColors}
                            selectedTypes={selectedTypes}
                            onTypesChange={setSelectedTypes}
                            showFavoritesOnly={showFavoritesOnly}
                            onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        />

                        {/* Grid Container */}
                        <div className="flex-1 overflow-y-auto bg-[var(--card-bg)]/50 rounded-3xl p-6 border border-[var(--border-color)]/50">
                            <div className="grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
                                {filteredItems.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-[var(--foreground-secondary)]">
                                        <p>No se encontraron prendas.</p>
                                    </div>
                                ) : (
                                    filteredItems.map(item => {
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
                                                className={`cursor-pointer group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#f8f9fa] dark:bg-[#111] transition-all duration-300 flex flex-col ${isSelected
                                                    ? 'ring-2 ring-inset ring-[var(--brand-pink)]'
                                                    : 'ring-1 ring-inset ring-[var(--border-color)]'
                                                    }`}
                                            >
                                                {item.favorite && (
                                                    <div className="absolute top-2 right-3 z-10 text-[var(--brand-pink)] drop-shadow-md">
                                                        <Heart className="w-4 h-4 fill-current" />
                                                    </div>
                                                )}
                                                <div className="flex-1 w-full relative bg-transparent flex items-center justify-center">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain p-2"
                                                        loading="lazy"
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                                            <div className="bg-[var(--brand-pink)] text-white rounded-full p-2 shadow-lg scale-110">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Outfit Studio Panel (Sticky) */}
                    <div className="w-[460px] xl:w-[500px] flex-shrink-0 flex flex-col gap-4 h-full overflow-y-auto pr-1 pb-12">
                        {/* 1. Desktop Canvas Toolbar (Undo / Redo / Count) */}
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xs shrink-0">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => desktopCanvasRef.current?.undo()}
                                    disabled={!canUndo}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--background-secondary)] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                                    title="Paso atrás (Ctrl+Z / Cmd+Z)"
                                >
                                    <Undo2 className="w-3.5 h-3.5" />
                                    <span>Paso atrás</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => desktopCanvasRef.current?.redo()}
                                    disabled={!canRedo}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--background-secondary)] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                                    title="Paso adelante (Ctrl+Y / Cmd+Shift+Z)"
                                >
                                    <Redo2 className="w-3.5 h-3.5" />
                                    <span>Paso adelante</span>
                                </button>
                            </div>
                            <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                                {totalSelected} {totalSelected === 1 ? 'prenda en el look' : 'prendas en el look'}
                            </span>
                        </div>

                        {/* 2. Desktop Canvas (TOP POSITION, ASPECT 3:4, NOT SQUARE!) */}
                        <div className="w-full aspect-[3/4] max-h-[540px] min-h-[440px] overflow-hidden shadow-sm bg-white dark:bg-zinc-950 border border-[var(--border-color)] rounded-3xl relative shrink-0">
                            <FreeDragCanvas
                                ref={desktopCanvasRef}
                                items={flatItems}
                                onRemoveItem={handleRemoveItem}
                                initialState={canvasState}
                                onStateChange={setCanvasState}
                                onHistoryChange={(u, r) => {
                                    setCanUndo(u);
                                    setCanRedo(r);
                                }}
                            />
                        </div>

                        {/* 3. Outfit Name & Occasion (BELOW Canvas) */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] shadow-xs shrink-0">
                            <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-2">
                                Nombre del Outfit
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Look casual de verano"
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--background-secondary)] rounded-xl text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-pink)] border border-transparent transition-all mb-4"
                            />

                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                                    Ocasión (Opcional)
                                </label>
                                {outfitOccasion && (
                                    <button
                                        type="button"
                                        onClick={() => setOutfitOccasion(null)}
                                        className="text-[11px] text-[var(--brand-pink)] hover:underline font-medium cursor-pointer"
                                    >
                                        Desmarcar
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {OUTFIT_OCCASIONS.map((occ) => {
                                    const Icon = occ.icon;
                                    const isSelected = outfitOccasion === occ.id;
                                    return (
                                        <button
                                            key={occ.id}
                                            type="button"
                                            onClick={() => setOutfitOccasion(isSelected ? null : occ.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[var(--brand-pink)] text-white shadow-sm'
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

                        {/* 4. Desktop Calendar Scheduling */}
                        {isPro ? (
                            <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] shadow-xs space-y-3 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center text-[var(--brand-pink)]">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--foreground)]">Programar en Calendario</p>
                                            <p className="text-[10px] text-[var(--foreground-tertiary)]">Asigna el día para lucir este outfit</p>
                                        </div>
                                    </div>
                                    {scheduledDate && (
                                        <button
                                            type="button"
                                            onClick={() => setScheduledDate('')}
                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/20 transition-all cursor-pointer"
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                                <div className="relative flex items-center bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 focus-within:border-[var(--brand-pink)] focus-within:ring-2 focus-within:ring-[var(--brand-pink)]/15 transition-all px-3.5 py-2.5">
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full bg-transparent text-xs text-[var(--foreground)] font-medium outline-none cursor-pointer scheme-light dark:scheme-dark"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => {
                                    openPremiumModal('yearly');
                                    toast.info('Programar looks en el calendario es exclusivo de Klozet Pro');
                                }}
                                className="bg-zinc-100/90 dark:bg-zinc-800/40 rounded-2xl p-4 border border-dashed border-zinc-300 dark:border-zinc-700 space-y-3 cursor-pointer hover:border-[var(--brand-pink)]/50 transition-all group shrink-0"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700/60 flex items-center justify-center text-zinc-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Programar en Calendario</p>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--brand-pink)] text-white">Pro</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Exclusivo de Klozet Pro</p>
                                        </div>
                                    </div>
                                    <Lock className="w-4 h-4 text-zinc-400 group-hover:text-[var(--brand-pink)] transition-colors" />
                                </div>
                                <div className="relative flex items-center bg-zinc-200/50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 px-3.5 py-2.5 opacity-60">
                                    <span className="text-xs text-zinc-400 font-medium">Bloqueado · Desbloquear con Klozet Pro</span>
                                </div>
                            </div>
                        )}

                        {/* 5. Desktop Public Toggle */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--border-color)] shadow-xs flex items-center justify-between shrink-0">
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)]">Outfit Público</p>
                                <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5">Visible para todos en tu perfil</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isPublic ? 'bg-[var(--brand-pink)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* 6. Kloe Assistant Banner */}
                        {!isFromKloe && (
                            <Link href="/closet/kloe" className="block group shrink-0">
                                <div className="relative overflow-hidden kz-kloe-hero rounded-[20px] p-3.5 flex items-center justify-between transition-all duration-300 active:scale-[0.98]">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <KloeMascot mood="happy" size="sm" />
                                        <div className="min-w-0">
                                            <p className="font-kloe text-sm font-bold text-[var(--foreground)] truncate">
                                                ¿Quieres que Kloe te ayude?
                                            </p>
                                            <p className="kz-caption text-[var(--foreground-secondary)] truncate">
                                                Combina tus prendas en segundos
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-kloe text-xs font-semibold px-3 py-1.5 rounded-full kz-pink-surface text-white shrink-0 ml-2">
                                        Abrir
                                    </span>
                                </div>
                            </Link>
                        )}

                        {/* 7. Save Button (The very last element) */}
                        <div className="pt-2 pb-6 shrink-0">
                            <Button
                                onClick={handleSave}
                                glow={true}
                                loading={loading}
                                disabled={loading || !outfitName.trim() || isEmpty}
                                className="w-full h-14 rounded-2xl font-bold text-base kz-pink-surface text-white shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5 mr-1" />
                                {outfitId ? 'Guardar Cambios' : 'Crear Outfit'}
                            </Button>
                        </div>
                    </div>
                </div>

            </main>

            {/* Floating Selected Garments Bar (Mobile Selection Step Only) */}
            <AnimatePresence>
                {mobileStep === 'selection' && totalSelected > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 w-[92vw] sm:w-auto sm:max-w-lg md:max-w-xl lg:hidden pointer-events-auto"
                    >
                        {/* Selected Items Summary Container */}
                        <div className="w-full bg-[var(--card-bg)]/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl p-2.5 sm:p-3 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col gap-2">
                            {/* Header Info */}
                            <div className="flex items-center justify-between px-1 gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse shrink-0" />
                                    <span className="text-xs font-bold text-[var(--foreground)] tracking-wide truncate">
                                        Prendas en el outfit ({totalSelected})
                                    </span>
                                </div>
                                <span className="text-[10px] text-[var(--foreground-tertiary)] shrink-0">
                                    Toca × para quitar
                                </span>
                            </div>

                            {/* Rectangular Cards Horizontal Scroll */}
                            <div className="flex items-center gap-2 overflow-x-auto py-0.5 px-0.5 no-scrollbar scroll-smooth">
                                {flatItems.map((item, idx) => (
                                    <div
                                        key={`${item.id}-${idx}`}
                                        className="flex items-center gap-2 pl-1.5 pr-2 py-1 bg-[var(--background-secondary)]/90 hover:bg-[var(--background-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 rounded-xl shadow-xs shrink-0 transition-all group max-w-[155px] sm:max-w-[175px]"
                                    >
                                        {/* Image Thumbnail */}
                                        <div className="relative w-8 h-8 rounded-lg bg-white border border-[var(--border-color)] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Garment Name & Category */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-[var(--foreground)] truncate leading-tight">
                                                {item.name || 'Prenda'}
                                            </p>
                                            <p className="text-[9px] font-medium text-[var(--foreground-tertiary)] capitalize truncate mt-0.5">
                                                {item.category || item.color || 'Armario'}
                                            </p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveItem(item.id);
                                            }}
                                            className="w-5 h-5 rounded-full bg-[var(--foreground-tertiary)]/15 hover:bg-red-500 hover:text-white text-[var(--foreground-secondary)] flex items-center justify-center transition-all cursor-pointer shrink-0 ml-0.5"
                                            title={`Quitar ${item.name}`}
                                            aria-label={`Quitar ${item.name}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Button Pill to go to Canvas */}
                        <div className="w-full">
                            <Button
                                onClick={() => setMobileStep('canvas')}
                                glow={true}
                                className="w-full rounded-2xl py-3.5 text-sm font-semibold overflow-hidden shadow-xl kz-pink-surface text-white"
                            >
                                <motion.span
                                    key={totalSelected}
                                    initial={{ y: -15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="inline-block"
                                >
                                    Continuar al lienzo ({totalSelected})
                                </motion.span>
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal with Kloe celebration */}
            <AnimatePresence>
                {successModalConfig.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                         <motion.div
                            initial={{ scale: 0.84, opacity: 0, y: 18 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 12 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                            className="kz-surface-card p-6 rounded-[20px] w-full max-w-sm flex flex-col items-center text-center relative overflow-hidden"
                         >
                              <div className="relative w-20 h-20 rounded-[20px] kz-kloe-hero flex items-center justify-center mb-4">
                                  <KloeMascot mood="excited" size="lg" />
                              </div>
                              <h3 className="kz-title text-[var(--foreground)] mb-2">
                                  ¡Outfit {successModalConfig.isUpdate ? 'actualizado' : 'creado'}!
                              </h3>
                              <p className="kz-body text-[var(--foreground-secondary)] mb-6">
                                  El look &quot;{successModalConfig.outfitName}&quot; ya está en tu armario.
                              </p>
                              <Button
                                  onClick={() => {
                                      try { haptics.success(); } catch {}
                                      setSuccessModalConfig({ ...successModalConfig, isOpen: false });
                                      const rTo = successModalConfig.returnTo;
                                      if (rTo) {
                                          const separator = rTo.includes('?') ? '&' : '?';
                                          router.push(`${rTo}${separator}outfitId=${successModalConfig.savedOutfitId}`);
                                      } else {
                                          router.push('/closet?tab=outfits');
                                      }
                                  }}
                                  className="w-full rounded-full py-3 font-semibold kz-pink-surface border-0 text-white cursor-pointer"
                              >
                                  Ir al Armario
                              </Button>
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


function CreateOutfitSkeleton() {
    return (
        <div className="w-full h-[100dvh] bg-white flex flex-col justify-between overflow-hidden select-none animate-pulse">
            <div className="h-14 border-b border-zinc-100 flex items-center justify-between px-4 sm:px-6">
                <div className="w-24 h-8 rounded-full bg-zinc-200/80" />
                <div className="w-32 h-6 rounded-md bg-zinc-200/60" />
                <div className="w-20 h-8 rounded-full bg-zinc-200/80" />
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-lg aspect-[3/4] rounded-3xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
                </div>
            </div>
            <div className="h-28 border-t border-zinc-100 flex items-center justify-center gap-3 px-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
                <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
                <div className="w-16 h-16 rounded-2xl bg-zinc-200/80" />
            </div>
        </div>
    );
}

export default function CreateOutfitPage() {
    return (
        <Suspense fallback={<CreateOutfitSkeleton />}>
            <CreateOutfitContent />
        </Suspense>
    );
}
