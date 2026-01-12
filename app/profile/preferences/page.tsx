'use client';

/**
 * Preferences Page - Preferencias de estilo del usuario
 * Colores favoritos, tallas y estilo preferido
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Ruler, Shirt, Sparkles, Save, Check } from 'lucide-react';
import { Card, Button } from '@/components';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';

const COLORS = [
    { name: 'Negro', value: '#000000' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Gris', value: '#6B7280' },
    { name: 'Azul marino', value: '#1E3A5F' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Beige', value: '#D4A574' },
    { name: 'Marrón', value: '#8B4513' },
    { name: 'Morado', value: '#8B5CF6' },
    { name: 'Amarillo', value: '#F59E0B' },
];

const STYLES = [
    { id: 'casual', label: 'Casual', emoji: '👕', description: 'Cómodo y relajado' },
    { id: 'formal', label: 'Formal', emoji: '👔', description: 'Elegante y profesional' },
    { id: 'sporty', label: 'Deportivo', emoji: '🏃', description: 'Activo y dinámico' },
    { id: 'streetwear', label: 'Streetwear', emoji: '🧢', description: 'Urbano y moderno' },
    { id: 'minimalist', label: 'Minimalista', emoji: '⬜', description: 'Limpio y simple' },
    { id: 'bohemian', label: 'Bohemio', emoji: '🌺', description: 'Libre y artístico' },
    { id: 'classic', label: 'Clásico', emoji: '👗', description: 'Atemporal y elegante' },
    { id: 'trendy', label: 'Trendy', emoji: '✨', description: 'Última moda' },
];

const SIZES = {
    top: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    bottom: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'],
    shoe: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
};

export default function PreferencesPage() {
    const router = useRouter();
    const { user, preferences, setPreferences } = useUser();

    const [selectedColors, setSelectedColors] = useState<string[]>(preferences?.favoriteColors || []);
    const [selectedStyle, setSelectedStyle] = useState<string>(preferences?.style || '');
    const [sizes, setSizes] = useState<{ top?: string; bottom?: string; shoe?: string }>(
        preferences?.sizes || {}
    );
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const toggleColor = (color: string) => {
        setSelectedColors(prev =>
            prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color]
        );
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            setPreferences({
                ...preferences,
                favoriteColors: selectedColors,
                style: selectedStyle,
                sizes,
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
            >
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">Preferencias</h1>
                    <div className="w-20" />
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Colores Favoritos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Colores Favoritos
                    </h2>
                    <Card className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">Tus colores preferidos</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    Selecciona los colores que más te gustan
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => toggleColor(color.value)}
                                    className="relative group"
                                >
                                    <div
                                        className={`w-full aspect-square rounded-xl border-2 transition-all ${selectedColors.includes(color.value)
                                                ? 'border-[var(--brand-pink)] scale-95'
                                                : 'border-transparent hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                    >
                                        {selectedColors.includes(color.value) && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <Check className={`w-5 h-5 ${color.value === '#FFFFFF' || color.value === '#F59E0B'
                                                        ? 'text-gray-800'
                                                        : 'text-white'
                                                    }`} />
                                            </motion.div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-[var(--foreground-tertiary)] mt-1 block text-center">
                                        {color.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Estilo Preferido */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Estilo Preferido
                    </h2>
                    <Card className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">Tu estilo de moda</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    ¿Cómo te gusta vestir?
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedStyle === style.id
                                            ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5'
                                            : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50'
                                        }`}
                                >
                                    <span className="text-2xl mb-2 block">{style.emoji}</span>
                                    <div className="font-medium text-[var(--foreground)]">{style.label}</div>
                                    <div className="text-xs text-[var(--foreground-tertiary)]">{style.description}</div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Tallas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Tus Tallas
                    </h2>
                    <Card className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Ruler className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">Medidas habituales</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    Para mejores recomendaciones
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Top Size */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    <Shirt className="w-4 h-4 inline mr-2" />
                                    Parte superior
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SIZES.top.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSizes(prev => ({ ...prev, top: size }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${sizes.top === size
                                                    ? 'bg-[var(--brand-pink)] text-white'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Size */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    👖 Parte inferior
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SIZES.bottom.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSizes(prev => ({ ...prev, bottom: size }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${sizes.bottom === size
                                                    ? 'bg-[var(--brand-pink)] text-white'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Shoe Size */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    👟 Calzado
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SIZES.shoe.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSizes(prev => ({ ...prev, shoe: size }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${sizes.shoe === size
                                                    ? 'bg-[var(--brand-pink)] text-white'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full"
                        glow
                    >
                        {saved ? (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                ¡Guardado!
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Guardando...' : 'Guardar Preferencias'}
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
