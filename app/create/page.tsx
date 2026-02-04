'use client';

/**
 * Create Outfit with Inspiration
 * Generates outfit collages based on saved posts and user preferences
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Settings, Save, Share2, Image as ImageIcon } from 'lucide-react';
import { Button, Card, LogoMark, OutfitLoadingCarousel, PremiumModal, WardrobeSelectionModal } from '@/components';
import ProductModal from '@/components/ProductModal';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useUser } from '@/store/userStore';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { X, Move, Trash2, Loader2, ArrowLeft, Layers, ChevronLeft, ChevronRight, Download, Instagram, Check, Plus } from 'lucide-react';
import { processClothingImage } from '@/lib/imageProcessing';
import { getTemplatesForCount, OutfitTemplate } from './templates';

// ============================================
// Types
// ============================================

interface OutfitPiece {
    id: string;
    type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';
    imageUrl: string;
    name: string;
}

interface CanvasItem extends ClothingItem {
    uniqueId: string; // To allow multiple of same item if needed
    x: number;
    y: number;
    rotation: number;
    scale: number;
    zIndex: number;
    isProcessing?: boolean;
}

interface OutfitInspirationQuiz {
    occasion?: string;
    weather?: string;
    mood?: string;
    colors?: string[];
}

export default function CreateOutfitPage() {
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<OutfitInspirationQuiz>({});
    const [generatedOutfit, setGeneratedOutfit] = useState<OutfitPiece[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [carouselSeed, setCarouselSeed] = useState(0);
    const [isPublic, setIsPublic] = useState(false); // Estado para marcar outfit como pÃºblico
    const [isKloeEnabled, setIsKloeEnabled] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Manual Creator State
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [isManualPreviewOpen, setIsManualPreviewOpen] = useState(false); // Now acts as "Review Mode"

    // New Template Flow State
    const [showResultModal, setShowResultModal] = useState(false);
    const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
    const [outfitName, setOutfitName] = useState('');

    // Product Modal State
    const [productToView, setProductToView] = useState<ClothingItem | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const { isPremium } = useUser();

    // Referencia al contenedor del outfit generado para scroll
    const outfitPreviewRef = useRef<HTMLDivElement>(null);

    // Referencia al canvas para obtener dimensiones dinÃ¡micas
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 500 });

    // Obtener items del armario para el carrusel
    const { items: wardrobeItems } = useWardrobe();

    // Observar cambios en el tamaÃ±o del canvas
    useEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setCanvasSize({ width: rect.width, height: rect.height });
            }
        };

        updateCanvasSize();

        const resizeObserver = new ResizeObserver(updateCanvasSize);
        if (canvasRef.current) {
            resizeObserver.observe(canvasRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [isManualPreviewOpen]);

    // Referencia para almacenar el tamaÃ±o previo del canvas
    const prevCanvasSizeRef = useRef(canvasSize);

    // Reposicionar items cuando cambia el tamaÃ±o del canvas
    useEffect(() => {
        const prevSize = prevCanvasSizeRef.current;

        // Solo reposicionar si hay un cambio significativo en el tamaÃ±o
        if (
            isManualPreviewOpen &&
            (Math.abs(prevSize.width - canvasSize.width) > 10 ||
                Math.abs(prevSize.height - canvasSize.height) > 10)
        ) {
            // Calcular factores de escala
            const scaleX = canvasSize.width / prevSize.width;
            const scaleY = canvasSize.height / prevSize.height;

            // Aplicar escala proporcional a las posiciones de los items
            setCanvasItems(items => {
                if (items.length === 0) return items;
                return items.map(item => ({
                    ...item,
                    x: Math.max(16, Math.min(item.x * scaleX, canvasSize.width - 144)),
                    y: Math.max(16, Math.min(item.y * scaleY, canvasSize.height - 144)),
                }));
            });
        }

        prevCanvasSizeRef.current = canvasSize;
    }, [canvasSize, isManualPreviewOpen]);

    // Memoize carousel items to prevent unnecessary re-renders
    const carouselItems = useMemo(() =>
        wardrobeItems.map(item => ({
            id: item.id,
            imageUrl: item.imageUrl || '',
            name: item.name,
        })),
        [wardrobeItems]
    );

    // ============================================
    // Constants
    // ============================================

    const occasions = ['Casual', 'Trabajo', 'Fiesta', 'Deportivo', 'Formal'];
    const weathers = ['Calor â˜€ï¸', 'FrÃ­o â„ï¸', 'Lluvia ðŸŒ§ï¸', 'Templado ðŸŒ¤ï¸'];
    const moods = ['CÃ³modo', 'Elegante', 'Atrevido', 'Minimalista', 'Colorido'];

    // ============================================
    // Handlers
    // ============================================

    const handleGenerateOutfit = useCallback(async () => {
        // Cambiar seed para mezclar items cada vez que se genera
        setCarouselSeed(prev => prev + 1);
        setIsGenerating(true);

        // Simulate API call to generate outfit
        setTimeout(() => {
            // Mock generated outfit
            const mockOutfit: OutfitPiece[] = [
                { id: '1', type: 'top', imageUrl: '', name: 'Blusa Blanca' },
                { id: '2', type: 'bottom', imageUrl: '', name: 'Jeans Azules' },
                { id: '3', type: 'shoes', imageUrl: '', name: 'Zapatillas Blancas' },
                { id: '4', type: 'accessory', imageUrl: '', name: 'Bolso Beige' },
            ];
            setGeneratedOutfit(mockOutfit);
            setIsGenerating(false);
            setShowQuiz(false);
        }, 2000);
    }, []);

    const handleChangeItem = useCallback((type: string) => {
        // Logic to change a specific item in the outfit
        console.log('Changing item:', type);
    }, []);

    const handleSaveOutfit = useCallback(() => {
        console.log('Saving outfit...', { isPublic, items: isKloeEnabled ? generatedOutfit : canvasItems });
        // TODO: Implement actual save logic
    }, [isPublic, isKloeEnabled, generatedOutfit, canvasItems]);

    // FunciÃ³n que se ejecuta cuando termina la animaciÃ³n del carrusel
    const handleCarouselExitComplete = useCallback(() => {
        // Scroll suave hacia el outfit generado
        if (outfitPreviewRef.current) {
            outfitPreviewRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, []);

    // Canvas Functions
    const handleOpenCategory = useCallback((category: ClothingCategory) => {
        setSelectedCategory(category);
        setIsSelectionModalOpen(true);
    }, []);

    // Canvas Placement Logic - DinÃ¡mico basado en tamaÃ±o del canvas
    const getInitialPosition = useCallback((type: ClothingCategory | string, existingItems: CanvasItem[]) => {
        const ITEM_SIZE = 128; // TamaÃ±o del item (w-32 = 128px)
        const PADDING = 16; // Margen del borde

        const { width: canvasWidth, height: canvasHeight } = canvasSize;

        // Calcular el espacio disponible
        const availableWidth = canvasWidth - ITEM_SIZE - PADDING * 2;
        const availableHeight = canvasHeight - ITEM_SIZE - PADDING * 2;

        // Contar items por categorÃ­a para ajustar disposiciÃ³n
        const countByCategory = {
            tops: existingItems.filter(i => i.category === ClothingCategory.TOP).length,
            bottoms: existingItems.filter(i => i.category === ClothingCategory.BOTTOM).length,
            shoes: existingItems.filter(i => i.category === ClothingCategory.SHOES).length,
            outerwear: existingItems.filter(i => i.category === ClothingCategory.OUTERWEAR).length,
            accessories: existingItems.filter(i => i.category === ClothingCategory.ACCESSORY).length,
        };

        const totalItems = existingItems.length;

        // Determinar si necesitamos modo compacto (muchas prendas)
        const isCompactMode = totalItems >= 6;

        // Calcular posiciones base proporcionales
        // Ajustar el espaciado vertical segÃºn la cantidad de items
        const verticalSpacing = isCompactMode
            ? Math.min(availableHeight / 4, 100) // Modo compacto: menos espacio
            : availableHeight / 3.5;

        // Zonas verticales (asegurando que queden dentro)
        const topZoneY = PADDING;
        const bottomZoneY = Math.min(PADDING + verticalSpacing, availableHeight * 0.45);
        const shoesZoneY = Math.min(PADDING + verticalSpacing * 2, availableHeight * 0.75);

        // Calcular posiciÃ³n X base - columna principal mÃ¡s centrada
        const mainColumnX = Math.max(PADDING, Math.min(availableWidth * 0.15, availableWidth - ITEM_SIZE));

        // FunciÃ³n helper para calcular offset horizontal cuando hay mÃºltiples del mismo tipo
        const getHorizontalOffset = (count: number, index: number) => {
            const offsetStep = Math.min(50, availableWidth / (count + 2));
            return index * offsetStep;
        };

        // Asegurar que la posiciÃ³n X quede dentro del canvas
        const clampX = (x: number) => Math.max(PADDING, Math.min(x, canvasWidth - ITEM_SIZE - PADDING));

        // Asegurar que la posiciÃ³n Y quede dentro del canvas
        const clampY = (y: number) => Math.max(PADDING, Math.min(y, canvasHeight - ITEM_SIZE - PADDING));

        switch (type) {
            case ClothingCategory.TOP: {
                const offsetX = getHorizontalOffset(countByCategory.tops + 1, countByCategory.tops);
                return {
                    x: clampX(mainColumnX + offsetX),
                    y: clampY(topZoneY),
                    zIndex: 10 + countByCategory.tops
                };
            }
            case ClothingCategory.OUTERWEAR: {
                // Outerwear detrÃ¡s del top, ligeramente desplazado
                const offsetX = getHorizontalOffset(countByCategory.outerwear + 1, countByCategory.outerwear);
                const outerwearX = mainColumnX + 20 + offsetX;
                return {
                    x: clampX(outerwearX),
                    y: clampY(topZoneY - 10),
                    zIndex: 5 + countByCategory.outerwear
                };
            }
            case ClothingCategory.BOTTOM: {
                const offsetX = getHorizontalOffset(countByCategory.bottoms + 1, countByCategory.bottoms);
                return {
                    x: clampX(mainColumnX + offsetX),
                    y: clampY(bottomZoneY),
                    zIndex: 9 + countByCategory.bottoms
                };
            }
            case ClothingCategory.SHOES: {
                const offsetX = getHorizontalOffset(countByCategory.shoes + 1, countByCategory.shoes);
                return {
                    x: clampX(mainColumnX + offsetX),
                    y: clampY(shoesZoneY),
                    zIndex: 11 + countByCategory.shoes
                };
            }
            case ClothingCategory.ACCESSORY:
            default: {
                // Accesorios en columna derecha, apilados con espaciado adaptativo
                const accessoryBaseX = Math.max(canvasWidth * 0.55, mainColumnX + ITEM_SIZE + 30);

                // Calcular cuÃ¡ntos accesorios caben verticalmente
                const maxAccessoriesVertical = Math.floor(availableHeight / 70);
                const accessoryIndex = countByCategory.accessories;

                // Si hay mÃ¡s accesorios de los que caben, crear columnas
                const column = Math.floor(accessoryIndex / maxAccessoriesVertical);
                const row = accessoryIndex % maxAccessoriesVertical;

                // Espaciado vertical adaptativo
                const accessorySpacingY = Math.min(70, availableHeight / (maxAccessoriesVertical + 1));
                const accessorySpacingX = Math.min(70, (availableWidth - accessoryBaseX) / 2);

                const accessoryX = accessoryBaseX + (column * accessorySpacingX);
                const accessoryY = PADDING + (row * accessorySpacingY);

                return {
                    x: clampX(accessoryX),
                    y: clampY(accessoryY),
                    zIndex: 12 + accessoryIndex
                };
            }
        }
    }, [canvasSize]);

    const handleAddItemToCanvas = useCallback((item: ClothingItem) => {
        // Check if item is already in canvas - avoid duplicates
        setCanvasItems(prev => {
            const alreadyExists = prev.some(ci => ci.id === item.id);
            if (alreadyExists) {
                return prev; // Item already selected, do nothing
            }

            const uniqueId = crypto.randomUUID();
            const position = getInitialPosition(item.category, prev);

            const newItem: CanvasItem = {
                ...item,
                uniqueId,
                x: position.x,
                y: position.y,
                rotation: 0,
                scale: 1,
                zIndex: position.zIndex,
                isProcessing: false,
            };

            return [...prev, newItem];
        });
    }, [getInitialPosition]);

    const handleDeselectItem = useCallback((itemId: string) => {
        setCanvasItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    // Memoize IDs of currently selected items for the modal
    const selectedItemIds = useMemo(
        () => canvasItems.map(item => item.id),
        [canvasItems]
    );

    // Helpers function to get available templates based on current count
    const availableTemplates = useMemo(() =>
        getTemplatesForCount(Math.min(canvasItems.length || 2, 5)),
        [canvasItems.length]); // Fallback to 2 to avoid empty array if 0

    const activeTemplate = availableTemplates[currentTemplateIndex] || availableTemplates[0];

    const handleManualGenerate = useCallback(() => {
        if (canvasItems.length < 2) {
            alert("Selecciona al menos 2 prendas para crear un outfit.");
            return;
        }

        // Start animation
        setCarouselSeed(prev => prev + 1);
        setIsGenerating(true);

        // Wait for animation mock
        setTimeout(() => {
            setIsGenerating(false);
            setCurrentTemplateIndex(0);
            setShowResultModal(true);
        }, 2000);
    }, [canvasItems]);

    const handleNextTemplate = useCallback(() => {
        if (availableTemplates.length === 0) return;
        setCurrentTemplateIndex(prev => (prev + 1) % availableTemplates.length);
    }, [availableTemplates.length]);

    const handlePrevTemplate = useCallback(() => {
        if (availableTemplates.length === 0) return;
        setCurrentTemplateIndex(prev => (prev - 1 + availableTemplates.length) % availableTemplates.length);
    }, [availableTemplates.length]);

    const handleDownloadImage = useCallback(() => {
        // En un entorno real usarÃ­amos html-to-image
        alert("Descargando imagen... (SimulaciÃ³n)");
    }, []);

    const handleShare = useCallback((platform: string) => {
        alert(`Compartiendo en ${platform}...`);
    }, []);

    const handleUpdateCanvasItem = useCallback((uniqueId: string, updates: Partial<CanvasItem>) => {
        setCanvasItems(items => items.map(item =>
            item.uniqueId === uniqueId ? { ...item, ...updates } : item
        ));
    }, []);

    const handleRemoveFromCanvas = useCallback((uniqueId: string) => {
        setCanvasItems(items => items.filter(item => item.uniqueId !== uniqueId));
    }, []);

    const bringToFront = useCallback((uniqueId: string) => {
        setCanvasItems(items => {
            const maxZ = Math.max(...items.map(i => i.zIndex), 0);
            return items.map(item =>
                item.uniqueId === uniqueId ? { ...item, zIndex: maxZ + 1 } : item
            );
        });
    }, []);

    return (
        <>
            {/* Loading Carousel - Se muestra mientras se genera el outfit */}
            <OutfitLoadingCarousel
                items={carouselItems}
                isVisible={isGenerating}
                shuffleSeed={carouselSeed}
                onExitComplete={handleCarouselExitComplete}
            />

            <div className="min-h-screen bg-[var(--background)] p-4 md:p-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Personalizar
                            </h2>


                            <div className="space-y-6">
                                {/* KLOE Toggle */}
                                <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className={`w-4 h-4 ${isKloeEnabled ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground-secondary)]'}`} />
                                            <span className="font-semibold text-[var(--foreground)]">Generar con KLOE</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (isPremium()) {
                                                    setIsKloeEnabled(!isKloeEnabled);
                                                } else {
                                                    setShowPremiumModal(true);
                                                }
                                            }}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${isKloeEnabled ? 'bg-[var(--brand-pink)]' : 'bg-[var(--background-tertiary)]'
                                                }`}
                                        >
                                            <motion.div
                                                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                                animate={{ x: isKloeEnabled ? 20 : 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-[var(--foreground-tertiary)]">
                                        {isKloeEnabled
                                            ? "IA activada: Kloe diseÃ±arÃ¡ tu outfit ideal"
                                            : "Modo estÃ¡ndar: Sugerencias bÃ¡sicas del armario"}
                                    </p>
                                </div>

                                {isKloeEnabled ? (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                                        {/* Occasion */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                                                OcasiÃ³n
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {occasions.map((occasion) => (
                                                    <button
                                                        key={occasion}
                                                        onClick={() => setQuizAnswers({ ...quizAnswers, occasion })}
                                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${quizAnswers.occasion === occasion
                                                            ? 'bg-[var(--brand-pink)] text-white shadow-[var(--shadow-float)]'
                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                                                            }`}
                                                    >
                                                        {occasion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Weather */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                                                Clima
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {weathers.map((weather) => (
                                                    <button
                                                        key={weather}
                                                        onClick={() => setQuizAnswers({ ...quizAnswers, weather })}
                                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${quizAnswers.weather === weather
                                                            ? 'bg-[var(--brand-pink)] text-white shadow-[var(--shadow-float)]'
                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                                                            }`}
                                                    >
                                                        {weather}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mood */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                                                Estado de Ã¡nimo
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {moods.map((mood) => (
                                                    <button
                                                        key={mood}
                                                        onClick={() => setQuizAnswers({ ...quizAnswers, mood })}
                                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${quizAnswers.mood === mood
                                                            ? 'bg-[var(--brand-pink)] text-white shadow-[var(--shadow-float)]'
                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
                                                            }`}
                                                    >
                                                        {mood}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Generate Button */}
                                        <Button
                                            onClick={handleGenerateOutfit}
                                            className="w-full"
                                            glow
                                            disabled={!quizAnswers.occasion || !quizAnswers.weather || !quizAnswers.mood}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                    Generando...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Generar Outfit
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    // Manual Category Selector
                                    <div className="space-y-3 animate-in slide-in-from-top-4 fade-in duration-300">
                                        {!isManualPreviewOpen ? (
                                            <>
                                                <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                                    Selecciona tus prendas
                                                </p>
                                                {[
                                                    { id: ClothingCategory.TOP, label: 'Partes de arriba' },
                                                    { id: ClothingCategory.BOTTOM, label: 'Partes de abajo' },
                                                    { id: ClothingCategory.SHOES, label: 'Calzado' },
                                                    { id: ClothingCategory.OUTERWEAR, label: 'Abrigos y Chaquetas' },
                                                    { id: ClothingCategory.ACCESSORY, label: 'Accesorios' },
                                                ].map((cat) => {
                                                    const count = canvasItems.filter(i => i.category === cat.id).length;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => handleOpenCategory(cat.id)}
                                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors text-left group border border-transparent hover:border-[var(--border-color)]"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-[var(--foreground)]">{cat.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {count > 0 && (
                                                                    <span className="bg-[var(--brand-pink)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                                        {count}
                                                                    </span>
                                                                )}
                                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-lg leading-none text-[var(--foreground)]">+</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}

                                                <div className="pt-4">
                                                    <Button
                                                        onClick={handleManualGenerate}
                                                        className="w-full"
                                                        glow={canvasItems.length > 0}
                                                        disabled={canvasItems.length === 0}
                                                    >
                                                        {isGenerating ? (
                                                            <>
                                                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                                Preparando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Layers className="w-5 h-5 mr-2" />
                                                                Crear Outfit ({canvasItems.length})
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-sm text-[var(--foreground-tertiary)]">
                                                    Tu outfit estÃ¡ listo. Puedes arrastrar las prendas para ajustarlas.
                                                </p>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setIsManualPreviewOpen(false)}
                                                    className="w-full"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Volver a selecciÃ³n
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Inspiration Sources */}
                        {isKloeEnabled && (
                            <Card className="p-6">
                                <h3 className="text-sm font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Fuentes de InspiraciÃ³n
                                </h3>
                                <div className="space-y-2 text-sm text-[var(--foreground-tertiary)]">
                                    <div className="flex items-center justify-between">
                                        <span>Posts guardados</span>
                                        <span className="font-semibold text-[var(--brand-pink)]">32</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Tu armario</span>
                                        <span className="font-semibold text-[var(--brand-pink)]">48 prendas</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                    {/* Selection Dock - Fixed Bottom Bar */}
                    <AnimatePresence>
                        {canvasItems.length > 0 && (
                            <motion.div
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                exit={{ y: 100 }}
                                className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg)]/90 backdrop-blur-xl border-t border-[var(--border-color)] shadow-2xl pb-safe"
                                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                            >
                                <div className="container mx-auto max-w-5xl px-4 py-4">
                                    <div className="flex items-center justify-between gap-6">
                                        {/* Items Strip */}
                                        <div className="flex items-center gap-3 overflow-x-auto py-1 flex-1 mask-fade-right scrollbar-hide">
                                            <div className="flex flex-col justify-center mr-2 px-2 border-r border-[var(--border-color)]">
                                                <span className="text-lg font-bold text-[var(--foreground)] leading-none">{canvasItems.length}</span>
                                                <span className="text-[10px] text-[var(--foreground-secondary)] uppercase tracking-wider">Items</span>
                                            </div>

                                            <AnimatePresence mode="popLayout">
                                                {canvasItems.map((item) => (
                                                    <motion.div
                                                        layoutId={`dock-${item.uniqueId}`}
                                                        key={item.uniqueId}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        className="relative w-12 h-12 bg-white rounded-lg border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center p-1 group"
                                                    >
                                                        <img src={item.imageUrl} className="w-full h-full object-contain" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveFromCanvas(item.uniqueId); }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md transform scale-0 group-hover:scale-100 transition-transform"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Main Action */}
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCanvasItems([])}
                                                className="hidden sm:flex border-red-200 text-red-500 hover:bg-red-50"
                                            >
                                                Borrar
                                            </Button>
                                            <Button
                                                onClick={handleManualGenerate}
                                                disabled={canvasItems.length < 2 || isGenerating}
                                                className="bg-gradient-to-r from-[var(--brand-pink)] to-purple-600 text-white shadow-lg shadow-[var(--brand-pink)]/25 px-8 h-12 rounded-xl font-bold text-base transition-transform hover:scale-105 active:scale-95"
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 fill-current" />}
                                                Generar Outfit
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Global Loading Overlay */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[60] bg-[var(--background)]/80 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto"
                            >
                                <div className="scale-125">
                                    <OutfitLoadingCarousel items={carouselItems} seed={carouselSeed} />
                                </div>
                                <p className="mt-8 text-xl font-medium text-[var(--foreground)] animate-pulse">DiseÃ±ando tu look...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>









                </div >
            </div >
            {/* Result Modal - The Main Experience */}
            <AnimatePresence>
                {
                    showResultModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            {/* Navigation Arrows */}
                            <button
                                onClick={handlePrevTemplate}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 hidden md:block"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <button
                                onClick={handleNextTemplate}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 hidden md:block"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-[var(--card-bg)] w-full max-w-xl aspect-[4/5] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
                            >
                                {/* Header overlay */}
                                <div className="absolute top-0 inset-x-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                                    <div className="pointer-events-auto bg-white/10 backdrop-blur-md rounded-xl p-1 pr-3 flex items-center border border-white/20">
                                        <div className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-lg font-bold mr-2">
                                            {currentTemplateIndex + 1}
                                        </div>
                                        <span className="text-white font-medium text-sm">{activeTemplate.name}</span>
                                    </div>

                                    <button
                                        onClick={() => setShowResultModal(false)}
                                        className="pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Main Content Collage */}
                                <div className="flex-1 relative bg-[var(--background)]">
                                    {activeTemplate && (
                                        <div className="absolute inset-0 m-0">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeTemplate.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="absolute inset-0"
                                                >
                                                    {activeTemplate.slots.map((slot, index) => {
                                                        const item = canvasItems[index];
                                                        if (!item) return null;
                                                        return (
                                                            <motion.button
                                                                key={`${activeTemplate.id}-${item.uniqueId}`}
                                                                layoutId={`item-${item.uniqueId}`}
                                                                onClick={() => {
                                                                    setProductToView(item);
                                                                    setIsProductModalOpen(true);
                                                                }}
                                                                className="absolute group focus:outline-none overflow-hidden"
                                                                style={{
                                                                    top: slot.top,
                                                                    left: slot.left,
                                                                    width: slot.width,
                                                                    height: slot.height || 'auto',
                                                                    aspectRatio: slot.height ? undefined : '1/1',
                                                                    transform: `rotate(${slot.rotate}deg)`,
                                                                    zIndex: slot.zIndex
                                                                }}
                                                            >
                                                                <div className="relative w-full h-full transform transition-transform duration-300 group-hover:scale-105">
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-contain drop-shadow-xl"
                                                                    />
                                                                    {/* Interactive Pin */}
                                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                                                                    </div>
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="p-5 bg-[var(--card-bg)] border-t border-[var(--border-color)] space-y-4 z-20">
                                    {/* Name Input */}
                                    <input
                                        type="text"
                                        placeholder="Nombra este outfit..."
                                        value={outfitName}
                                        onChange={(e) => setOutfitName(e.target.value)}
                                        className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] px-4 py-3 rounded-xl border-none outline-none focus:ring-2 ring-[var(--brand-pink)]/50 transition-all font-medium"
                                    />

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSaveOutfit}
                                            className="flex-1 bg-[var(--brand-pink)] hover:opacity-90 text-white shadow-[var(--shadow-float)]"
                                        >
                                            <Save className="w-5 h-5 mr-2" />
                                            Guardar
                                        </Button>

                                        <button
                                            onClick={handleDownloadImage}
                                            className="p-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] transition-colors border border-[var(--border-color)]"
                                            title="Descargar PNG"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => handleShare('instagram')}
                                            className="p-3 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] transition-colors border border-[var(--border-color)]"
                                            title="Compartir en Instagram"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Mobile Navigation Helper */}
                                    <div className="flex justify-between md:hidden pt-2">
                                        <button onClick={handlePrevTemplate} className="text-sm text-[var(--foreground-secondary)] font-medium flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Anterior</button>
                                        <button onClick={handleNextTemplate} className="text-sm text-[var(--foreground-secondary)] font-medium flex items-center gap-1">Siguiente <ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            <ProductModal
                item={productToView ? { ...productToView, type: productToView.category, source: 'wardrobe', trending: false, matchScore: 100 } as any : null}
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onFavoriteToggle={() => { }}
                onEdit={() => { }}
            />

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />

            <WardrobeSelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                onSelect={handleAddItemToCanvas}
                onDeselect={handleDeselectItem}
                category={selectedCategory}
                selectedItemIds={selectedItemIds}
            />
        </>
    );
}
