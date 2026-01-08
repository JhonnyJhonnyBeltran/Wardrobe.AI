'use client';

/**
 * Create Outfit with Inspiration
 * Generates outfit collages based on saved posts and user preferences
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Settings, Save, Share2, Image as ImageIcon } from 'lucide-react';
import { Button, Card, LogoMark } from '@/components';

interface OutfitPiece {
    id: string;
    type: 'top' | 'bottom' | 'shoes' | 'accessories' | 'outerwear';
    imageUrl: string;
    name: string;
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

    // Sample data
    const occasions = ['Casual', 'Trabajo', 'Fiesta', 'Deportivo', 'Formal'];
    const weathers = ['Calor ☀️', 'Frío ❄️', 'Lluvia 🌧️', 'Templado 🌤️'];
    const moods = ['Cómodo', 'Elegante', 'Atrevido', 'Minimalista', 'Colorido'];

    const handleGenerateOutfit = async () => {
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
        console.log('Saving outfit...');
    };

    return (
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
                    </Card>

                    {/* Inspiration Sources */}
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
                </div>

                {/* Right Column - Outfit Preview */}
                <div className="lg:col-span-2">
                    <Card className="p-8 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {generatedOutfit.length === 0 ? (
                                <motion.div
                                    key="empty"
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
                                    key="outfit"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Outfit Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-[var(--foreground)]">
                                            Tu Outfit Generado
                                        </h2>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" onClick={handleGenerateOutfit}>
                                                <RefreshCw className="w-5 h-5" />
                                            </Button>
                                            <Button variant="secondary" onClick={handleSaveOutfit}>
                                                <Save className="w-5 h-5" />
                                            </Button>
                                            <Button variant="secondary">
                                                <Share2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Outfit Collage */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {generatedOutfit.map((piece) => (
                                            <motion.div
                                                key={piece.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="group relative"
                                            >
                                                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center overflow-hidden border-2 border-[var(--border-color)] hover:border-[var(--brand-pink)] transition-all">
                                                    {piece.imageUrl ? (
                                                        <img
                                                            src={piece.imageUrl}
                                                            alt={piece.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-6xl">👗</div>
                                                    )}
                                                </div>

                                                {/* Item Info */}
                                                <div className="mt-3">
                                                    <p className="font-medium text-[var(--foreground)] text-sm">
                                                        {piece.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--foreground-tertiary)] capitalize">
                                                        {piece.type}
                                                    </p>
                                                </div>

                                                {/* Change Button */}
                                                <button
                                                    onClick={() => handleChangeItem(piece.type)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/90"
                                                >
                                                    Cambiar
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleChangeItem('top')}
                                            className="px-4 py-2 rounded-full bg-[var(--background-secondary)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
                                        >
                                            Cambiar parte superior
                                        </button>
                                        <button
                                            onClick={() => handleChangeItem('bottom')}
                                            className="px-4 py-2 rounded-full bg-[var(--background-secondary)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
                                        >
                                            Cambiar parte inferior
                                        </button>
                                        <button
                                            onClick={() => handleChangeItem('shoes')}
                                            className="px-4 py-2 rounded-full bg-[var(--background-secondary)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
                                        >
                                            Cambiar zapatos
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </div>
            </div>
        </div>
    );
}
