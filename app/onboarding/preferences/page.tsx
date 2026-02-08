'use client';

/**
 * Style Preferences Page
 * Multi-step full screen questionnaire for new users.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Sparkles, Ruler } from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

// --- DATA ---
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDER_OPTIONS = [
    { value: 'woman', label: 'Mujer', emoji: '👩' },
    { value: 'man', label: 'Hombre', emoji: '👨' },
    { value: 'other', label: 'Otro', emoji: '✨' },
];

// Placeholder images - would be replaced by real assets
const STYLE_OPTIONS = [
    { id: 'casual', label: 'Casual', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
    { id: 'street', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80' },
    { id: 'elegant', label: 'Elegante', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80' },
    { id: 'boho', label: 'Boho', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
    { id: 'classic', label: 'Clásico', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80' },
    { id: 'sporty', label: 'Deportivo', image: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?w=400&q=80' },
];

export default function PreferencesPage() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const [step, setStep] = useState(0);
    const totalSteps = 5;

    // State
    const [ageRange, setAgeRange] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState(170); // cm
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [usesAccessories, setUsesAccessories] = useState<boolean | null>(null);

    // Redirect if not logged in (optional check, depends on flow)
    useEffect(() => {
        if (!user) {
            // For dev/testing allowing access, but ideally:
            // router.push('/auth');
        }
    }, [user, router]);

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    const handleComplete = async () => {
        if (user) {
            // 1. Update Local State
            const updatedUser = {
                ...user,
                ageRange: ageRange as any,
                gender: gender as any,
                height: height,
                preferredStyles: selectedStyles,
                usesAccessories: usesAccessories || false,
                styleCompleted: true
            };
            setUser(updatedUser);

            // 2. Persist to Supabase
            try {
                const { error } = await supabase
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .from('profiles' as any)
                    .update({
                        age_range: ageRange,
                        gender: gender,
                        height: height,
                        preferred_styles: selectedStyles,
                        uses_accessories: usesAccessories,
                        style_completed: true,
                        // map other camelCase to snake_case if needed by DB
                    })
                    .eq('id', user.id);

                if (error) {
                    console.error('Error saving preferences:', error);
                    // Continue anyway to letting user use the app
                }
            } catch (err) {
                console.error('Exception saving preferences:', err);
            }
        }
        router.push('/feed'); // Redirect to Feed instead of Closet as requested by user (Pinterest style feed)
    };

    const toggleStyle = (id: string) => {
        setSelectedStyles(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    // Validation
    const canProceed = () => {
        switch (step) {
            case 0: return !!ageRange;
            case 1: return !!gender;
            case 2: return height > 100 && height < 250;
            case 3: return selectedStyles.length > 0;
            case 4: return usesAccessories !== null;
            default: return false;
        }
    };

    // Animation Variants
    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">

            {/* Header / Progress */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between z-10">
                <div onClick={handleBack} className={`p-2 -ml-2 rounded-full cursor-pointer hover:bg-[var(--background-secondary)] transition-colors ${step === 0 ? 'invisible' : ''}`}>
                    <ChevronLeft className="w-6 h-6" />
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1.5">
                    {[...Array(totalSteps)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[var(--brand-pink)]' : 'bg-[var(--background-secondary)]'}`}
                        />
                    ))}
                </div>

                <div className="w-10 h-10 flex items-center justify-center">
                    <LogoMark size="sm" />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 pb-24 max-w-lg mx-auto w-full relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        {/* STEP 0: AGE */}
                        {step === 0 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">¿Cuál es tu edad?</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Nos ayuda a personalizar tu estilo.</p>

                                <div className="grid grid-cols-1 gap-3">
                                    {AGE_RANGES.map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setAgeRange(range)}
                                            className={`p-5 rounded-2xl border-2 text-left text-lg font-medium transition-all
                                                ${ageRange === range
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)]'
                                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'}
                                            `}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 1: GENDER */}
                        {step === 1 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">¿Cómo te identificas?</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Para ajustar las recomendaciones.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    {GENDER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setGender(opt.value)}
                                            className={`p-6 rounded-2xl border-2 flex items-center justify-between text-lg font-medium transition-all
                                                ${gender === opt.value
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)]'
                                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'}
                                            `}
                                        >
                                            <span>{opt.label}</span>
                                            <span className="text-3xl">{opt.emoji}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: HEIGHT */}
                        {step === 2 && (
                            <div className="flex-1 flex flex-col justify-center items-center">
                                <h1 className="text-3xl font-bold mb-3 self-start">Tu altura</h1>
                                <p className="text-[var(--foreground-secondary)] mb-12 text-lg self-start">Para saber qué te queda mejor.</p>

                                <div className="w-full bg-[var(--card-bg)] rounded-[32px] p-8 border border-[var(--border-color)] text-center relative overflow-visible">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--brand-pink)] text-white p-3 rounded-2xl shadow-lg">
                                        <Ruler className="w-6 h-6" />
                                    </div>

                                    <div className="text-7xl font-bold text-[var(--foreground)] mt-6 mb-2">
                                        {height}
                                        <span className="text-2xl text-[var(--foreground-tertiary)] ml-2">cm</span>
                                    </div>

                                    <input
                                        type="range"
                                        min="140"
                                        max="210"
                                        value={height}
                                        onChange={(e) => setHeight(Number(e.target.value))}
                                        className="w-full h-2 bg-[var(--background-secondary)] rounded-lg appearance-none cursor-pointer mt-8 mb-4 accent-[var(--brand-pink)]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: STYLE SELECTION */}
                        {step === 3 && (
                            <div className="flex-1 flex flex-col">
                                <h1 className="text-3xl font-bold mb-3">Elige tus estilos</h1>
                                <p className="text-[var(--foreground-secondary)] mb-6 text-lg">Selecciona uno o más.</p>

                                <div className="grid grid-cols-2 gap-3 pb-4">
                                    {STYLE_OPTIONS.map((style) => (
                                        <div
                                            key={style.id}
                                            onClick={() => toggleStyle(style.id)}
                                            className={`relative group cursor-pointer aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300
                                                ${selectedStyles.includes(style.id) ? 'ring-4 ring-[var(--brand-pink)] scale-[0.98]' : 'hover:opacity-90'}
                                            `}
                                        >
                                            <Image
                                                src={style.image}
                                                alt={style.label}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                                            <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                                                {style.label}
                                            </div>

                                            {selectedStyles.includes(style.id) && (
                                                <div className="absolute top-3 right-3 bg-[var(--brand-pink)] text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: ACCESSORIES */}
                        {step === 4 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">¿Usas accesorios?</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Relojes, joyas, gorros...</p>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => setUsesAccessories(true)}
                                        className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all
                                            ${usesAccessories === true
                                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5'
                                                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'}
                                        `}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center text-3xl shadow-sm">
                                            💍
                                        </div>
                                        <span className="font-bold text-xl">¡Me encantan!</span>
                                    </button>

                                    <button
                                        onClick={() => setUsesAccessories(false)}
                                        className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all
                                            ${usesAccessories === false
                                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5'
                                                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'}
                                        `}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-3xl">
                                            🙅
                                        </div>
                                        <span className="font-bold text-xl">No suelo usarlos</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-[var(--background)]/90 backdrop-blur-md border-t border-[var(--border-color)] z-20">
                <div className="max-w-lg mx-auto">
                    <Button
                        size="lg"
                        glow={canProceed()}
                        disabled={!canProceed()}
                        onClick={handleNext}
                        className="w-full text-lg rounded-2xl h-14"
                    >
                        {step === totalSteps - 1 ? 'Finalizar' : 'Continuar'}
                        {step < totalSteps - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
