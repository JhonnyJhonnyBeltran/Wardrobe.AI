'use client';

/**
 * StyleQuizModal - Visual Style Analysis Questionnaire
 * Image-based selector for gathering user style preferences
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface StyleQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (responses: StyleQuizResponses) => void;
    required?: boolean;
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

interface StyleOption {
    id: string;
    name: string;
    image_url: string;
    category: string;
}

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

// Updated with Images
const GENDER_OPTIONS = [
    { value: 'woman', label: 'Mujer', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80' },
    { value: 'man', label: 'Hombre', image: 'https://images.unsplash.com/photo-1488161628813-99c974c76949?w=600&q=80' },
    { value: 'other', label: 'Otro', image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?w=600&q=80' },
];

export default function StyleQuizModal({ isOpen, onClose, onComplete, required = false }: StyleQuizModalProps) {
    const [step, setStep] = useState(0);
    const [ageRange, setAgeRange] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState(170);
    const [usesAccessories, setUsesAccessories] = useState<boolean | null>(null);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    // DB Data
    const [styleOptions, setStyleOptions] = useState<StyleOption[]>([]);
    const [loadingStyles, setLoadingStyles] = useState(false);

    const totalSteps = 5; // Reduced steps (merged Style steps)

    useEffect(() => {
        if (isOpen) {
            fetchStyles();
        }
    }, [isOpen]);

    const fetchStyles = async () => {
        setLoadingStyles(true);
        const { data } = await supabase.from('style_options').select('*').eq('is_active', true);
        if (data) setStyleOptions(data);
        setLoadingStyles(false);
    };

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
            default: return false;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Full Screen High Z-Index to cover Navbar */}
            <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full h-full md:h-auto md:max-w-2xl bg-[var(--background)] md:bg-transparent"
                >
                    <Card className="w-full h-full md:h-auto border-0 md:border p-6 md:p-8 flex flex-col md:rounded-3xl shadow-none md:shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 flex-shrink-0">
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
                            {!required && (
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full hover:bg-[var(--background-secondary)] flex items-center justify-center transition-colors"
                                >
                                    <X className="w-6 h-6 text-[var(--foreground-secondary)]" />
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8 h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden flex-shrink-0">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-dark)]"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto mb-8 pr-2">
                            <AnimatePresence mode="wait">
                                {/* Step 0: Age Range */}
                                {step === 0 && (
                                    <motion.div
                                        key="age"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full"
                                    >
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            ¿Cuál es tu edad?
                                        </h3>
                                        <p className="text-[var(--foreground-tertiary)] mb-8">
                                            Esto nos ayuda a personalizar mejor tus recomendaciones
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {AGE_RANGES.map((range) => (
                                                <button
                                                    key={range}
                                                    onClick={() => setAgeRange(range)}
                                                    className={`p-6 rounded-2xl border-2 transition-all ${ageRange === range
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-md'
                                                        : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)]'
                                                        }`}
                                                >
                                                    <div className="text-2xl mb-2">🎈</div>
                                                    <div className="font-bold text-[var(--foreground)]">{range}</div>
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
                                        <p className="text-[var(--foreground-tertiary)] mb-8">
                                            Adaptaremos el estilo a tus preferencias
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {GENDER_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setGender(option.value)}
                                                    className={`relative overflow-hidden group rounded-2xl border-2 transition-all h-64 md:h-auto ${gender === option.value
                                                        ? 'border-[var(--brand-pink)] shadow-lg'
                                                        : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)]'
                                                        }`}
                                                >
                                                    <Image
                                                        src={option.image}
                                                        alt={option.label}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                                                        <span className="text-white font-bold text-xl">{option.label}</span>
                                                    </div>
                                                    {gender === option.value && (
                                                        <div className="absolute top-4 right-4 bg-[var(--brand-pink)] rounded-full p-1.5 shadow-lg">
                                                            <Check className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
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
                                        <p className="text-[var(--foreground-tertiary)] mb-12">
                                            Nos ayuda a sugerir proporciones ideales
                                        </p>
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="text-7xl font-bold text-[var(--brand-pink)] mb-12">
                                                {height} <span className="text-2xl text-[var(--foreground-secondary)]">cm</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="140"
                                                max="200"
                                                value={height}
                                                onChange={(e) => setHeight(parseInt(e.target.value))}
                                                className="w-full max-w-md h-3 bg-[var(--background-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--brand-pink)]"
                                            />
                                            <div className="flex justify-between w-full max-w-md mt-4 text-sm font-medium text-[var(--foreground-tertiary)]">
                                                <span>140cm</span>
                                                <span>200cm</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Style Preferences (From DB) */}
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
                                            Selecciona todos los que te gusten
                                        </p>

                                        {loadingStyles ? (
                                            <div className="flex justify-center p-12">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand-pink)]"></div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                                {styleOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => toggleStyle(option.id)}
                                                        className={`relative group overflow-hidden rounded-2xl border-2 transition-all aspect-[4/5] ${selectedStyles.includes(option.id)
                                                            ? 'border-[var(--brand-pink)] shadow-lg'
                                                            : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)]'
                                                            }`}
                                                    >
                                                        <Image
                                                            src={option.image_url}
                                                            alt={option.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                                            <span className="text-white font-medium text-sm">{option.name}</span>
                                                        </div>
                                                        {selectedStyles.includes(option.id) && (
                                                            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--brand-pink)] flex items-center justify-center shadow-lg">
                                                                <Check className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                        <p className="text-[var(--foreground-tertiary)] mb-8">
                                            Nos ayuda a completar tu look perfecto
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setUsesAccessories(true)}
                                                className={`p-10 rounded-3xl border-2 transition-all ${usesAccessories === true
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-md'
                                                    : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)]'
                                                    }`}
                                            >
                                                <div className="text-6xl mb-6">💍</div>
                                                <div className="font-bold text-2xl text-[var(--foreground)]">Sí</div>
                                                <p className="text-[var(--foreground-tertiary)] mt-2">
                                                    Me encantan los accesorios
                                                </p>
                                            </button>
                                            <button
                                                onClick={() => setUsesAccessories(false)}
                                                className={`p-10 rounded-3xl border-2 transition-all ${usesAccessories === false
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-md'
                                                    : 'border-[var(--border-color)] hover:border-[var(--foreground-secondary)]'
                                                    }`}
                                            >
                                                <div className="text-6xl mb-6">✨</div>
                                                <div className="font-bold text-2xl text-[var(--foreground)]">No</div>
                                                <p className="text-[var(--foreground-tertiary)] mt-2">
                                                    Prefiero lo minimalista
                                                </p>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-4 flex-shrink-0 pt-6 border-t border-[var(--border-color)]">
                            {step > 0 && (
                                <Button variant="secondary" onClick={handleBack} className="flex-1 py-6 text-lg rounded-2xl">
                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                    Atrás
                                </Button>
                            )}
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1 py-6 text-lg rounded-2xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg disabled:opacity-50 disabled:shadow-none"
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
