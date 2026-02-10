'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';

// Types
interface StyleImageOption {
    id: string;
    imageUrl: string;
    styleTag: string;
}

const STYLE_OPTIONS: StyleImageOption[] = [
    { id: 'casual', imageUrl: '/images/style-casual.jpg', styleTag: 'Casual Moderno' },
    { id: 'elegant', imageUrl: '/images/style-elegant.jpg', styleTag: 'Elegante Clásico' },
    { id: 'sporty', imageUrl: '/images/style-sporty.jpg', styleTag: 'Deportivo' },
    { id: 'boho', imageUrl: '/images/style-boho.jpg', styleTag: 'Boho Chic' },
    { id: 'street', imageUrl: '/images/style-street.jpg', styleTag: 'Streetwear' },
    { id: 'romantic', imageUrl: '/images/style-romantic.jpg', styleTag: 'Romántico' },
];

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDER_OPTIONS = [
    { value: 'woman', label: 'Mujer', icon: '👩' },
    { value: 'man', label: 'Hombre', icon: '👨' },
    { value: 'other', label: 'Otro', icon: '✨' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [ageRange, setAgeRange] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState(170);
    const [usesAccessories, setUsesAccessories] = useState<boolean | null>(null);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    const totalSteps = 6;

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleComplete = async () => {
        if (!user) return;
        setIsLoading(true);

        const heightRange = height < 160 ? 'short' : height > 175 ? 'tall' : 'medium';
        const responses = {
            ageRange,
            gender,
            height,
            heightRange,
            preferredStyles: selectedStyles,
            usesAccessories: usesAccessories || false,
            visualStylePreferences: selectedStyles,
        };

        try {
            const updates = {
                age_range: responses.ageRange,
                gender: responses.gender,
                height: responses.height,
                height_range: responses.heightRange,
                preferred_styles: responses.preferredStyles,
                uses_accessories: responses.usesAccessories,
                visual_style_preferences: responses.visualStylePreferences,
                style_completed: true,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            setUser({
                ...user,
                ...responses,
                styleCompleted: true,
            } as any);

            // Redirect to Closet
            router.push('/closet');

        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Hubo un error al guardar tus preferencias. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStyle = (styleId: string) => {
        setSelectedStyles(prev =>
            prev.includes(styleId)
                ? prev.filter(id => id !== styleId)
                : [...prev, styleId]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return ageRange !== '';
            case 1: return gender !== '';
            case 2: return height > 0;
            case 3: return selectedStyles.length > 0;
            case 4: return usesAccessories !== null;
            case 5: return selectedStyles.length > 0;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="p-6 md:p-8 flex flex-col min-h-[600px] shadow-xl border-[var(--border-color)]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-lg shadow-[var(--brand-pink)]/20">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                                    Tu Perfil de Estilo
                                </h2>
                                <p className="text-sm text-[var(--foreground-tertiary)]">
                                    Paso {step + 1} de {totalSteps}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8 h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)]"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-8">
                        <AnimatePresence mode="wait">
                            {/* Step 0: Age Range */}
                            {step === 0 && (
                                <motion.div
                                    key="age"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                                            ¿Cuál es tu edad?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] text-lg">
                                            Esto nos ayuda a personalizar mejor tus recomendaciones
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {AGE_RANGES.map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => setAgeRange(range)}
                                                className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${ageRange === range
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]'
                                                    }`}
                                            >
                                                <div className="text-4xl mb-3">🎂</div>
                                                <div className="font-bold text-lg text-[var(--foreground)]">{range}</div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 1: Gender */}
                            {step === 1 && (
                                <motion.div
                                    key="gender"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                                            ¿Cómo te identificas?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] text-lg">
                                            Adaptaremos el estilo a tus preferencias
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {GENDER_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setGender(option.value)}
                                                className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${gender === option.value
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]'
                                                    }`}
                                            >
                                                <div className="text-6xl mb-4">{option.icon}</div>
                                                <div className="font-bold text-xl text-[var(--foreground)]">
                                                    {option.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Height */}
                            {step === 2 && (
                                <motion.div
                                    key="height"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                                            ¿Cuál es tu altura?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] text-lg">
                                            Nos ayuda a sugerir proporciones ideales
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-12 bg-[var(--background-secondary)]/30 rounded-3xl">
                                        <div className="text-7xl font-bold bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-purple)] bg-clip-text text-transparent mb-12">
                                            {height} <span className="text-4xl text-[var(--foreground-secondary)]">cm</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="140"
                                            max="200"
                                            value={height}
                                            onChange={(e) => setHeight(parseInt(e.target.value))}
                                            className="w-full max-w-md h-3 bg-[var(--background-secondary)] rounded-full appearance-none cursor-pointer slider shadow-inner"
                                            style={{
                                                background: `linear-gradient(to right, var(--brand-pink) 0%, var(--brand-pink) ${((height - 140) / 60) * 100
                                                    }%, var(--background-secondary) ${((height - 140) / 60) * 100}%, var(--background-secondary) 100%)`,
                                            }}
                                        />
                                        <div className="flex justify-between w-full max-w-md mt-4 text-sm font-medium text-[var(--foreground-tertiary)] px-2">
                                            <span>140cm</span>
                                            <span>200cm</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Style Preferences */}
                            {step === 3 && (
                                <motion.div
                                    key="styles"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                                            ¿Qué estilo te define más?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] text-lg">
                                            Selecciona todos los que te gusten
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {STYLE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => toggleStyle(option.id)}
                                                className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${selectedStyles.includes(option.id)
                                                    ? 'border-[var(--brand-pink)] shadow-[var(--shadow-float)]'
                                                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                    }`}
                                            >
                                                <div className="aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
                                                    <span className="text-5xl opacity-50 transition-transform group-hover:scale-110">👗</span>
                                                </div>
                                                <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
                                                    <p className={`font-bold text-sm text-center ${selectedStyles.includes(option.id) ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground)]'}`}>
                                                        {option.styleTag}
                                                    </p>
                                                </div>
                                                {selectedStyles.includes(option.id) && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg"
                                                    >
                                                        <Check className="w-5 h-5 text-white" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Accessories */}
                            {step === 4 && (
                                <motion.div
                                    key="accessories"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                                            ¿Usas accesorios?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] text-lg">
                                            Nos ayuda a completar tu look perfecto
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button
                                            onClick={() => setUsesAccessories(true)}
                                            className={`p-12 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${usesAccessories === true
                                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]'
                                                }`}
                                        >
                                            <div className="text-7xl mb-6">💍</div>
                                            <div className="font-bold text-2xl text-[var(--foreground)]">Sí</div>
                                            <p className="text-[var(--foreground-tertiary)] mt-3 text-lg">
                                                Me encantan los accesorios
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => setUsesAccessories(false)}
                                            className={`p-12 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${usesAccessories === false
                                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]'
                                                }`}
                                        >
                                            <div className="text-7xl mb-6">✨</div>
                                            <div className="font-bold text-2xl text-[var(--foreground)]">No</div>
                                            <p className="text-[var(--foreground-tertiary)] mt-3 text-lg">
                                                Prefiero lo minimalista
                                            </p>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Visual Style Quiz */}
                            {step === 5 && (
                                <motion.div
                                    key="visual-styles"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                                            ¿Qué looks te inspiran?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] text-lg">
                                            Selecciona los estilos que más te llaman la atención
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {STYLE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => toggleStyle(option.id)}
                                                className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${selectedStyles.includes(option.id)
                                                    ? 'border-[var(--brand-pink)] shadow-[var(--shadow-float)]'
                                                    : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                    }`}
                                            >
                                                <div className="aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
                                                    <span className="text-5xl opacity-50 transition-transform group-hover:scale-110">📸</span>
                                                </div>
                                                <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
                                                    <p className={`font-bold text-sm text-center ${selectedStyles.includes(option.id) ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground)]'}`}>
                                                        Look {option.styleTag}
                                                    </p>
                                                </div>
                                                {selectedStyles.includes(option.id) && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg"
                                                    >
                                                        <Check className="w-5 h-5 text-white" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4 pt-6 border-t border-[var(--border-color)] mt-auto">
                        {step > 0 && (
                            <Button
                                variant="secondary"
                                onClick={handleBack}
                                className="flex-1 h-12 text-lg"
                            >
                                <ChevronLeft className="w-6 h-6 mr-2" />
                                Atrás
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed() || isLoading}
                            className="flex-1 h-12 text-lg shadow-lg shadow-[var(--brand-pink)]/20"
                            glow={step === totalSteps - 1}
                        >
                            {isLoading ? 'Guardando...' : step === totalSteps - 1 ? 'Completar Perfil' : 'Siguiente'}
                            {step < totalSteps - 1 && !isLoading && <ChevronRight className="w-6 h-6 ml-2" />}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
