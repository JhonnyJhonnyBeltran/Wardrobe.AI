'use client';

/**
 * Create Outfit with Inspiration
 * Generates outfit collages based on saved posts and user preferences
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Settings, Save, Share2, Image as ImageIcon } from 'lucide-react';
import { Button, Card, LogoMark, OutfitLoadingCarousel, PremiumModal, WardrobeSelectionModal } from '@/components';
import { useWardrobe } from '@/lib/hooks/useWardrobe';
import { useUser } from '@/store/userStore';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { X, Move, Trash2, Loader2, ArrowLeft, Layers } from 'lucide-react'; // Add icons for canvas interactions
import { processClothingImage } from '@/lib/imageProcessing';

interface OutfitPiece {
    id: string;
    type: 'top' | 'bottom' | 'shoes' | 'accessories' | 'outerwear';
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
    const [isPublic, setIsPublic] = useState(false); // Estado para marcar outfit como público
    const [isKloeEnabled, setIsKloeEnabled] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Manual Creator State
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [isManualPreviewOpen, setIsManualPreviewOpen] = useState(false);

    const { isPremium } = useUser();

    // Referencia al contenedor del outfit generado para scroll
    const outfitPreviewRef = useRef<HTMLDivElement>(null);

    // Obtener items del armario para el carrusel
    const { items: wardrobeItems } = useWardrobe();

    // Preparar items para el carrusel
    const carouselItems = wardrobeItems.map(item => ({
        id: item.id,
        imageUrl: item.imageUrl || '',
        name: item.name,
    }));

    // Sample data
    const occasions = ['Casual', 'Trabajo', 'Fiesta', 'Deportivo', 'Formal'];
    const weathers = ['Calor ☀️', 'Frío ❄️', 'Lluvia 🌧️', 'Templado 🌤️'];
    const moods = ['Cómodo', 'Elegante', 'Atrevido', 'Minimalista', 'Colorido'];

    const handleGenerateOutfit = async () => {
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
                { id: '4', type: 'accessories', imageUrl: '', name: 'Bolso Beige' },
            ];
            setGeneratedOutfit(mockOutfit);
            setIsGenerating(false);
            setShowQuiz(false);
        }, 2000);
    };

    const handleChangeItem = (type: string) => {
        // Logic to change a specific item in the outfit
        console.log('Changing item:', type);
    };

    const handleSaveOutfit = () => {
        console.log('Saving outfit...', { isPublic, items: isKloeEnabled ? generatedOutfit : canvasItems });
        // TODO: Implement actual save logic
    };

    // Función que se ejecuta cuando termina la animación del carrusel
    const handleCarouselExitComplete = () => {
        // Scroll suave hacia el outfit generado
        if (outfitPreviewRef.current) {
            outfitPreviewRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Canvas Functions
    const handleOpenCategory = (category: ClothingCategory) => {
        setSelectedCategory(category);
        setIsSelectionModalOpen(true);
    };

    // Canvas Placement Logic
    const getInitialPosition = (type: ClothingCategory | string, existingItems: CanvasItem[]) => {
        // Updated for mobile compatibility (350px width safe zone)
        // Mobile container usually around 350-390px wide
        // We will target a 320px safe area centered

        // Dynamic centering if possible, but hardcoded safe values for initial
        const CENTER_X = 100; // Left offset - works for mobile (~half of 300px item width? No, item is 128px-192px)
        // If item is 128px (w-32), centered in 350px container is (350-128)/2 = 111px

        const RIGHT_COL_X = 220; // For accessories. 220px + 128px item > 350px? 
        // Accessories are usually smaller. Let's assume standard accessory size.

        switch (type) {
            case ClothingCategory.TOP:
                return { x: CENTER_X, y: 50, zIndex: 10 };
            case ClothingCategory.OUTERWEAR:
                // Un poco arriba y a la derecha, detrás del top
                return { x: CENTER_X + 20, y: 30, zIndex: 5 };
            case ClothingCategory.BOTTOM:
                return { x: CENTER_X, y: 200, zIndex: 9 };
            case ClothingCategory.SHOES:
                return { x: CENTER_X, y: 380, zIndex: 11 }; // Zapatos debajo
            case ClothingCategory.ACCESSORY:
            default:
                // Stack en la derecha, pero más compacto para móvil
                const accessoryCount = existingItems.filter(i =>
                    i.category === ClothingCategory.ACCESSORY ||
                    (i.category !== 'top' && i.category !== 'bottom' && i.category !== 'shoes' && i.category !== 'outerwear')
                ).length;
                return { x: RIGHT_COL_X, y: 50 + (accessoryCount * 80), zIndex: 12 };
        }
    };

    const handleAddItemToCanvas = async (item: ClothingItem) => {
        // Just add to state, placement happens later or we use default placement but hide canvas
        // We calculate position now but it won't be visible until 'Generate' is clicked
        const uniqueId = crypto.randomUUID();
        const position = getInitialPosition(item.category, canvasItems);

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

        setCanvasItems(prev => [...prev, newItem]);
    };

    const handleManualGenerate = () => {
        setCarouselSeed(prev => prev + 1);
        setIsGenerating(true);

        // Delay to show carousel animation
        setTimeout(() => {
            setIsGenerating(false);
            setIsManualPreviewOpen(true);

            // Re-calculate positions to ensure they are correct for the current set?
            // Actually, we already calculated them on add. 
            // scroll to preview
            if (outfitPreviewRef.current) {
                outfitPreviewRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1500);
    };

    const handleUpdateCanvasItem = (uniqueId: string, updates: Partial<CanvasItem>) => {
        setCanvasItems(items => items.map(item =>
            item.uniqueId === uniqueId ? { ...item, ...updates } : item
        ));
    };

    const handleRemoveFromCanvas = (uniqueId: string) => {
        setCanvasItems(items => items.filter(item => item.uniqueId !== uniqueId));
    };

    const bringToFront = (uniqueId: string) => {
        const maxZ = Math.max(...canvasItems.map(i => i.zIndex), 0);
        handleUpdateCanvasItem(uniqueId, { zIndex: maxZ + 1 });
    };

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                            ? "IA activada: Kloe diseñará tu outfit ideal"
                                            : "Modo estándar: Sugerencias básicas del armario"}
                                    </p>
                                </div>

                                {isKloeEnabled ? (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                                        {/* Occasion */}
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                                                Ocasión
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
                                                Estado de ánimo
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
                                                    Tu outfit está listo. Puedes arrastrar las prendas para ajustarlas.
                                                </p>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setIsManualPreviewOpen(false)}
                                                    className="w-full"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Volver a selección
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
                                    Fuentes de Inspiración
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

                    {/* Right Column - Outfit Preview or Canvas */}
                    <div ref={outfitPreviewRef} className="lg:col-span-2 scroll-mt-4">
                        <Card className="p-8 min-h-[600px] h-full relative overflow-hidden">
                            {/* Canvas Background Grid */}
                            {!isKloeEnabled && (
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />
                            )}

                            <AnimatePresence mode="wait">
                                {isKloeEnabled ? (
                                    // KLOE Preview Logic (Existing)
                                    generatedOutfit.length === 0 ? (
                                        <motion.div
                                            key="empty-kloe"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center h-full text-center py-12"
                                        >
                                            <div className="w-24 h-24 rounded-3xl bg-[var(--background)] shadow-[var(--shadow-float-strong)] flex items-center justify-center mb-6 overflow-hidden">
                                                <LogoMark size="xl" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                                Crea tu Outfit Perfecto
                                            </h3>
                                            <p className="text-[var(--foreground-tertiary)] max-w-md">
                                                Selecciona la ocasión, clima y estado de ánimo para generar un collage de prendas
                                                personalizado de tu armario
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="outfit-kloe"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                        >
                                            {/* ... Existing Result View ... */}
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-xl font-bold text-[var(--foreground)]">
                                                    Tu Outfit Generado
                                                </h2>
                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Button variant="secondary" onClick={handleSaveOutfit}>
                                                        <Save className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                {generatedOutfit.map((piece) => (
                                                    <div key={piece.id} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                                        {piece.imageUrl ? (
                                                            <img src={piece.imageUrl} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span>{piece.name}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )
                                ) : (
                                    // Manual Canvas Logic
                                    <motion.div
                                        key="canvas"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col"
                                    >
                                        <div className="flex items-center justify-between mb-4 z-10 relative">
                                            <h2 className="text-xl font-bold text-[var(--foreground)]">
                                                {isManualPreviewOpen ? "Lienzo de Diseño" : "Previsualización"}
                                            </h2>

                                            {isManualPreviewOpen && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setCanvasItems([]);
                                                            setIsManualPreviewOpen(false);
                                                        }}
                                                        disabled={canvasItems.length === 0}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                    <Button onClick={handleSaveOutfit} disabled={canvasItems.length === 0}>
                                                        <Save className="w-5 h-5 mr-2" />
                                                        Guardar
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 relative bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-[var(--border-color)] overflow-hidden min-h-[500px]"
                                            id="outfit-canvas"
                                        >
                                            {!isManualPreviewOpen ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--foreground-tertiary)] bg-[var(--background-secondary)]/50">
                                                    <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center mb-4 shadow-sm">
                                                        <Layers className="w-8 h-8 opacity-20" />
                                                    </div>
                                                    <p>Selecciona prendas para comenzar</p>
                                                    <p className="text-xs mt-2 opacity-60">El lienzo aparecerá al generar</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {canvasItems.length === 0 && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--foreground-tertiary)] pointer-events-none">
                                                            <Move className="w-12 h-12 mb-4 opacity-20" />
                                                            <p>Tu lienzo está vacío</p>
                                                        </div>
                                                    )}

                                                    {canvasItems.map((item) => (
                                                        <motion.div
                                                            key={item.uniqueId}
                                                            drag
                                                            dragMomentum={false}
                                                            onDragStart={() => bringToFront(item.uniqueId)}
                                                            initial={{ x: item.x, y: item.y }}
                                                            style={{ zIndex: item.zIndex }}
                                                            className="absolute cursor-move touch-none"
                                                        >
                                                            <div className="relative group w-32 h-32 md:w-32 md:h-32">
                                                                {item.imageUrl ? (
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        className={`w-full h-full object-contain pointer-events-none transition-all hover:drop-shadow-xl ${item.isProcessing ? 'opacity-50' : ''}`}
                                                                        alt={item.name}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-[var(--background-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-color)]">
                                                                        <span className="text-2xl">👕</span>
                                                                    </div>
                                                                )}

                                                                {/* Loading State */}
                                                                {item.isProcessing && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <Loader2 className="w-8 h-8 text-[var(--brand-pink)] animate-spin" />
                                                                    </div>
                                                                )}

                                                                {/* Hover Controls */}
                                                                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleRemoveFromCanvas(item.uniqueId)}
                                                                        className="p-1 rounded-full bg-red-500 text-white shadow-lg transform hover:scale-110 transition-transform"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </div>
            </div>
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />

            <WardrobeSelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                onSelect={handleAddItemToCanvas}
                category={selectedCategory}
            />
        </>
    );
}
