'use client';

/**
 * StyleQuizModal - Visual Style Analysis Questionnaire
 * Image-based selector for gathering user style preferences
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components';
import type { StyleImageOption } from '@/types/user';

interface StyleQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (responses: StyleQuizResponses) => void;
}

export interface StyleQuizResponses {
    ageRange: string;
    gender: string;
    height: number;
    heightRange: string;
    preferredStyles: string[];
    usesAccessories: boolean;
    visualStylePreferences: string[];
}

// Sample style images (replace with real images)
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

export default function StyleQuizModal({ isOpen, onClose, onComplete }: StyleQuizModalProps) {
    const [step, setStep] = useState(0);
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

    const handleComplete = () => {
        const heightRange = height < 160 ? 'short' : height > 175 ? 'tall' : 'medium';

        onComplete({
            ageRange,
            gender,
            height,
            heightRange,
            preferredStyles: selectedStyles,
            usesAccessories: usesAccessories || false,
            visualStylePreferences: selectedStyles,
        });
        onClose();
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
                >
                    <Card className="p-6 md:p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--foreground)]">
                                        Cuestionario de Estilo
                                    </h2>
                                    <p className="text-sm text-[var(--foreground-tertiary)]">
                                        Paso {step + 1} de {totalSteps}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full hover:bg-[var(--background-secondary)] flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--foreground-secondary)]" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8 h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)]"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="min-h-[400px] mb-8">
                            <AnimatePresence mode="wait">
                                {/* Step 0: Age Range */}
                                {step === 0 && (
                                    <motion.div
                                        key="age"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Cuál es tu edad?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-6">
                                            Esto nos ayuda a personalizar mejor tus recomendaciones
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {AGE_RANGES.map((range) => (
                                                <button
                                                    key={range}
                                                    onClick={() => setAgeRange(range)}
                                                    className={`p-6 rounded-2xl border-2 transition-all ${ageRange === range
                                                            ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                            : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                        }`}
                                                >
                                                    <div className="text-3xl mb-2">🎂</div>
                                                    <div className="font-semibold text-[var(--foreground)]">{range}</div>
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
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Cómo te identificas?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-6">
                                            Adaptaremos el estilo a tus preferencias
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {GENDER_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setGender(option.value)}
                                                    className={`p-8 rounded-2xl border-2 transition-all ${gender === option.value
                                                            ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                            : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                        }`}
                                                >
                                                    <div className="text-5xl mb-3">{option.icon}</div>
                                                    <div className="font-semibold text-lg text-[var(--foreground)]">
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
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Cuál es tu altura?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-6">
                                            Nos ayuda a sugerir proporciones ideales
                                        </p>
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="text-6xl font-bold gradient-text mb-8">
                                                {height} cm
                                            </div>
                                            <input
                                                type="range"
                                                min="140"
                                                max="200"
                                                value={height}
                                                onChange={(e) => setHeight(parseInt(e.target.value))}
                                                className="w-full max-w-md h-2 bg-[var(--background-secondary)] rounded-full appearance-none cursor-pointer slider"
                                                style={{
                                                    background: `linear-gradient(to right, var(--brand-pink) 0%, var(--brand-pink) ${((height - 140) / 60) * 100
                                                        }%, var(--background-secondary) ${((height - 140) / 60) * 100}%, var(--background-secondary) 100%)`,
                                                }}
                                            />
                                            <div className="flex justify-between w-full max-w-md mt-2 text-sm text-[var(--foreground-tertiary)]">
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
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Qué estilo te define más?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-6">
                                            Puedes seleccionar varios
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                                            {STYLE_OPTIONS.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => toggleStyle(option.id)}
                                                    className={`relative group overflow-hidden rounded-2xl border-2 transition-all ${selectedStyles.includes(option.id)
                                                            ? 'border-[var(--brand-pink)] shadow-[var(--shadow-float)]'
                                                            : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                        }`}
                                                >
                                                    {/* Image placeholder */}
                                                    <div className="aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
                                                        <span className="text-4xl opacity-50">👗</span>
                                                    </div>
                                                    <div className="p-4 bg-[var(--card-bg)]">
                                                        <p className="font-semibold text-sm text-[var(--foreground)]">
                                                            {option.styleTag}
                                                        </p>
                                                    </div>
                                                    {selectedStyles.includes(option.id) && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg"
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
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Usas accesorios?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-6">
                                            Nos ayuda a completar tu look perfecto
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setUsesAccessories(true)}
                                                className={`p-12 rounded-2xl border-2 transition-all ${usesAccessories === true
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                        : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                    }`}
                                            >
                                                <div className="text-6xl mb-4">💍</div>
                                                <div className="font-semibold text-xl text-[var(--foreground)]">Sí</div>
                                                <p className="text-sm text-[var(--foreground-tertiary)] mt-2">
                                                    Me encantan los accesorios
                                                </p>
                                            </button>
                                            <button
                                                onClick={() => setUsesAccessories(false)}
                                                className={`p-12 rounded-2xl border-2 transition-all ${usesAccessories === false
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-[var(--shadow-float)]'
                                                        : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                    }`}
                                            >
                                                <div className="text-6xl mb-4">✨</div>
                                                <div className="font-semibold text-xl text-[var(--foreground)]">No</div>
                                                <p className="text-sm text-[var(--foreground-tertiary)] mt-2">
                                                    Prefiero lo minimalista
                                                </p>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 5: Visual Style Quiz (same as step 3 with different title) */}
                                {step === 5 && (
                                    <motion.div
                                        key="visual-styles"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Qué looks te inspiran?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-6">
                                            Selecciona los estilos que más te llaman la atención
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                                            {STYLE_OPTIONS.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => toggleStyle(option.id)}
                                                    className={`relative group overflow-hidden rounded-2xl border-2 transition-all ${selectedStyles.includes(option.id)
                                                            ? 'border-[var(--brand-pink)] shadow-[var(--shadow-float)]'
                                                            : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                                                        }`}
                                                >
                                                    <div className="aspect-square bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
                                                        <span className="text-4xl opacity-50">📸</span>
                                                    </div>
                                                    <div className="p-4 bg-[var(--card-bg)]">
                                                        <p className="font-semibold text-sm text-[var(--foreground)]">
                                                            Look {option.styleTag}
                                                        </p>
                                                    </div>
                                                    {selectedStyles.includes(option.id) && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg"
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
                        <div className="flex gap-3">
                            {step > 0 && (
                                <Button variant="secondary" onClick={handleBack} className="flex-1">
                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                    Atrás
                                </Button>
                            )}
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1"
                                glow={step === totalSteps - 1}
                            >
                                {step === totalSteps - 1 ? 'Completar' : 'Siguiente'}
                                {step < totalSteps - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
