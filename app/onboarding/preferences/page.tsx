'use client';

/**
 * Style Preferences Page
 * Enhanced multi-step questionnaire with image-based form elements
 * and improved UX following Klozet brand guidelines
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Sparkles, Ruler, Palette, Shirt, Users, Camera, Scissors, ShoppingBag, Calendar, User, UserCircle, Star, Briefcase, Music, Footprints, Crown, DollarSign, Gem, X } from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

// --- DATA ---
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDER_OPTIONS = [
    { value: 'woman', label: 'Mujer', icon: User, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=60' },
    { value: 'man', label: 'Hombre', icon: UserCircle, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60' },
    { value: 'other', label: 'Otro', icon: Star, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=60' },
];
const HAIR_TYPES = [
    { value: 'straight', label: 'Liso', icon: Scissors, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60' },
    { value: 'wavy', label: 'Ondulado', icon: Crown, image: 'https://images.unsplash.com/photo-1542345112-4182e220d7a8?w=200&q=60' },
    { value: 'curly', label: 'Rizado', icon: Star, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=60' },
    { value: 'coily', label: 'Encrespado', icon: Sparkles, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=60' },
    { value: 'short', label: 'Corto', icon: Scissors, image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=200&q=60' },
];
const SKIN_TONES = [
    { value: 'fair', label: 'Clara', color: '#FDE68A' },
    { value: 'light', label: 'Ligera', color: '#F59E0B' },
    { value: 'medium', label: 'Media', color: '#D97706' },
    { value: 'olive', label: 'Aceitosa', color: '#B45309' },
    { value: 'dark', label: 'Oscura', color: '#78350F' },
];
const BODY_SHAPES = [
    { value: 'hourglass', label: 'Hora', icon: Star, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&q=60' },
    { value: 'apple', label: 'Manzana', icon: Crown, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=60' },
    { value: 'pear', label: 'Pera', icon: Sparkles, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=60' },
    { value: 'rectangle', label: 'Rectángulo', icon: Ruler, image: 'https://images.unsplash.com/photo-1542345112-4182e220d7a8?w=200&q=60' },
    { value: 'inverted-triangle', label: 'Triángulo invertido', icon: Star, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=60' },
];
const FAVORITE_COLORS = [
    { id: 'black', label: 'Negro', color: '#000000' },
    { id: 'white', label: 'Blanco', color: '#FFFFFF' },
    { id: 'blue', label: 'Azul', color: '#3B82F6' },
    { id: 'red', label: 'Rojo', color: '#EF4444' },
    { id: 'green', label: 'Verde', color: '#10B981' },
    { id: 'yellow', label: 'Amarillo', color: '#F59E0B' },
    { id: 'purple', label: 'Morado', color: '#8B5CF6' },
    { id: 'pink', label: 'Rosa', color: '#EC4899' },
];
const OCCASIONS = [
    { id: 'work', label: 'Trabajo', icon: Briefcase, image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&q=60' },
    { id: 'casual', label: 'Casual', icon: Shirt, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=60' },
    { id: 'party', label: 'Fiesta', icon: Music, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=60' },
    { id: 'sports', label: 'Deporte', icon: Footprints, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=60' },
    { id: 'formal', label: 'Formal', icon: Crown, image: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?w=200&q=60' },
    { id: 'date', label: 'Cita', icon: Star, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&q=60' },
];
const BUDGET_RANGES = [
    { value: 'low', label: 'Económico', icon: DollarSign, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=60' },
    { value: 'medium', label: 'Medio', icon: Gem, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=60' },
    { value: 'high', label: 'Alto', icon: Crown, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&q=60' },
];
const STYLE_OPTIONS = [
    { id: 'casual', label: 'Casual', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=60' },
    { id: 'street', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=200&q=60' },
    { id: 'elegant', label: 'Elegante', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&q=60' },
    { id: 'boho', label: 'Boho', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&q=60' },
    { id: 'classic', label: 'Clásico', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=60' },
    { id: 'sporty', label: 'Deportivo', image: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?w=200&q=60' },
    { id: 'minimal', label: 'Minimalista', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=60' },
    { id: 'vintage', label: 'Vintage', image: 'https://images.unsplash.com/photo-1529374255404-31176343895d?w=200&q=60' },
];

export default function PreferencesPage() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const [step, setStep] = useState(0);
    const totalSteps = 10;

    // State
    const [ageRange, setAgeRange] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState(170); // cm
    const [hairType, setHairType] = useState('');
    const [skinTone, setSkinTone] = useState('');
    const [bodyShape, setBodyShape] = useState('');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
    const [occasionPreferences, setOccasionPreferences] = useState<string[]>([]);
    const [budgetRange, setBudgetRange] = useState('');
    const [usesAccessories, setUsesAccessories] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);

    // Redirect if not logged in or already has preferences
    useEffect(() => {
        if (!user) {
            router.push('/auth');
        } else if (user.styleCompleted) {
            // User already completed preferences - enable edit mode
            setIsEditing(true);
            setIsLoading(false);
            // Pre-fill logic could go here if we wanted to show existing prefs
        } else {
            setIsLoading(false);
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
                hairType: hairType,
                skinTone: skinTone,
                bodyShape: bodyShape,
                preferredStyles: selectedStyles,
                favoriteColors: favoriteColors,
                occasionPreferences: occasionPreferences,
                budgetRange: budgetRange,
                usesAccessories: usesAccessories || false,
                styleCompleted: true
            };
            setUser(updatedUser);

            // 2. Persist to Supabase
            try {
                const { error } = await (supabase as any)
                    .from('profiles')
                    .upsert({
                        id: user.id, // Required for upsert
                        age_range: ageRange,
                        gender: gender,
                        height: height,
                        hair_type: hairType,
                        skin_tone: skinTone,
                        body_shape: bodyShape,
                        preferred_styles: selectedStyles,
                        visual_style_preferences: selectedStyles,
                        favorite_colors: favoriteColors,
                        occasions_preferences: occasionPreferences,
                        budget_range: budgetRange,
                        uses_accessories: usesAccessories,
                        style_completed: true,
                        // Preserve existing fields if they exist (though this is upsert, so it merges/updates)
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'id' });

                if (error) {
                    console.error('Error saving preferences:', error);
                    alert('Error guardando preferencias: ' + error.message); // Temporary alert for debugging
                } else {
                    console.log('Preferences saved successfully');
                }
            } catch (err) {
                console.error('Exception saving preferences:', err);
                alert('Excepción guardando preferencias: ' + JSON.stringify(err));
            }
        } else {
            console.error('No user found when trying to save preferences');
        }
        router.push('/closet');
    };

    const toggleStyle = (id: string) => {
        setSelectedStyles(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleColor = (id: string) => {
        setFavoriteColors(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleOccasion = (id: string) => {
        setOccasionPreferences(prev =>
            prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
        );
    };

    // Validation
    const canProceed = () => {
        switch (step) {
            case 0: return !!ageRange;
            case 1: return !!gender;
            case 2: return height > 100 && height < 250;
            case 3: return !!hairType;
            case 4: return !!skinTone;
            case 5: return !!bodyShape;
            case 6: return selectedStyles.length > 0;
            case 7: return favoriteColors.length > 0;
            case 8: return occasionPreferences.length > 0;
            case 9: return !!budgetRange;
            case 10: return usesAccessories !== null;
            default: return false;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-pink)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
            {/* Progress Bar */}
            {/* Progress Bar & Exit */}
            <div className="px-6 pt-12 pb-4 flex items-center justify-between">
                <div className="flex gap-1.5 mx-auto">
                    {[...Array(totalSteps)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[var(--brand-pink)]' : 'bg-[var(--background-secondary)]'}`}
                        />
                    ))}
                </div>
                {isEditing && (
                    <button
                        onClick={() => router.back()}
                        className="absolute right-6 top-10 p-2 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--card-hover)] transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5 text-[var(--foreground)]" />
                    </button>
                )}
            </div>

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
                                            className={`p-4 rounded-xl border-2 text-left text-base font-medium transition-all duration-300 transform hover:scale-105
                                                ${ageRange === range
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)] shadow-lg'
                                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                }
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
                                    {GENDER_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setGender(opt.value)}
                                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                                    ${gender === opt.value
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                        : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                    }
                                                `}
                                            >
                                                <div className="relative z-10 p-4 flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={opt.image}
                                                            alt={opt.label}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            priority={step === 1}
                                                            loading="eager"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-base font-medium">{opt.label}</span>
                                                    </div>
                                                    <Icon className="w-8 h-8 text-[var(--brand-pink)]" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: HEIGHT */}
                        {step === 2 && (
                            <div className="flex-1 flex flex-col justify-center items-center">
                                <h1 className="text-3xl font-bold mb-3 self-start">Tu altura</h1>
                                <p className="text-[var(--foreground-secondary)] mb-12 text-lg self-start">Para saber qué te queda mejor.</p>

                                <div className="w-full bg-[var(--card-bg)] rounded-[32px] p-8 border border-[var(--border-color)] text-center relative overflow-visible">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--brand-pink)] text-white p-2 rounded-xl">
                                        <Ruler className="w-5 h-5" />
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
                                    <div className="flex justify-between text-xs text-[var(--foreground-tertiary)]">
                                        <span>140cm</span>
                                        <span>210cm</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: HAIR TYPE */}
                        {step === 3 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Tipo de cabello</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Para recomendaciones acertadas.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {HAIR_TYPES.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setHairType(opt.value)}
                                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                                    ${hairType === opt.value
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                        : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                    }
                                                `}
                                            >
                                                <div className="relative z-10 p-4 text-center">
                                                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={opt.image}
                                                            alt={opt.label}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <span className="text-lg font-medium">{opt.label}</span>
                                                    <Icon className="w-6 h-6 mx-auto mt-2 text-[var(--brand-pink)]" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: SKIN TONE */}
                        {step === 4 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Tono de piel</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Para combinar colores perfectos.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {SKIN_TONES.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSkinTone(opt.value)}
                                            className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105
                                                ${skinTone === opt.value
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)] shadow-lg'
                                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                }
                                            `}
                                        >
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-full shadow-lg" style={{ backgroundColor: opt.color }}></div>
                                            <span className="text-lg font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: BODY SHAPE */}
                        {step === 5 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Tipo de cuerpo</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Para encontrar tu mejor look.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    {BODY_SHAPES.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setBodyShape(opt.value)}
                                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                                    ${bodyShape === opt.value
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                        : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                    }
                                                `}
                                            >
                                                <div className="relative z-10 p-4 flex items-center gap-4">
                                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={opt.image}
                                                            alt={opt.label}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-base font-medium">{opt.label}</span>
                                                    </div>
                                                    <Icon className="w-8 h-8 text-[var(--brand-pink)]" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: STYLE PREFERENCES */}
                        {step === 6 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Estilos que te gustan</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Selecciona todos los que te atraen.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {STYLE_OPTIONS.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => toggleStyle(style.id)}
                                            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                                ${selectedStyles.includes(style.id)
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                }
                                            `}
                                        >
                                            <div className="relative w-full h-32 overflow-hidden">
                                                <Image
                                                    src={style.image}
                                                    alt={style.label}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                            <div className="p-4 text-center">
                                                <span className="text-sm font-medium">{style.label}</span>
                                                {selectedStyles.includes(style.id) && (
                                                    <div className="absolute top-2 right-2 bg-[var(--brand-pink)] text-white p-1 rounded-full">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 7: FAVORITE COLORS */}
                        {step === 7 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Colores favoritos</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Selecciona tus colores preferidos.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {FAVORITE_COLORS.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => toggleColor(color.id)}
                                            className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105
                                                ${favoriteColors.includes(color.id)
                                                    ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                }
                                            `}
                                        >
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-full shadow-lg" style={{ backgroundColor: color.color }}></div>
                                            <span className="text-lg font-medium">{color.label}</span>
                                            {favoriteColors.includes(color.id) && (
                                                <div className="absolute top-2 right-2 bg-[var(--brand-pink)] text-white p-1 rounded-full">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 8: OCCASIONS */}
                        {step === 8 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Ocasiones</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Selecciona las que más te importan.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    {OCCASIONS.map((occasion) => {
                                        const Icon = occasion.icon;
                                        return (
                                            <button
                                                key={occasion.id}
                                                onClick={() => toggleOccasion(occasion.id)}
                                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                                    ${occasionPreferences.includes(occasion.id)
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                        : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                    }
                                                `}
                                            >
                                                <div className="relative z-10 p-4 flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={occasion.image}
                                                            alt={occasion.label}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-base font-medium">{occasion.label}</span>
                                                    </div>
                                                    <Icon className="w-8 h-8 text-[var(--brand-pink)]" />
                                                    {occasionPreferences.includes(occasion.id) && (
                                                        <div className="absolute top-2 right-2 bg-[var(--brand-pink)] text-white p-1 rounded-full">
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 9: BUDGET */}
                        {step === 9 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">Presupuesto</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Para ajustar las recomendaciones.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    {BUDGET_RANGES.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setBudgetRange(opt.value)}
                                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                                                    ${budgetRange === opt.value
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 shadow-lg'
                                                        : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                                    }
                                                `}
                                            >
                                                <div className="relative z-10 p-4 flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={opt.image}
                                                            alt={opt.label}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-base font-medium">{opt.label}</span>
                                                    </div>
                                                    <Icon className="w-8 h-8 text-[var(--brand-pink)]" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 10: ACCESSORIES */}
                        {step === 10 && (
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold mb-3">¿Usas accesorios?</h1>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-lg">Nos ayuda a personalizar más tu estilo.</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setUsesAccessories(true)}
                                        className={`p-8 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105
                                            ${usesAccessories === true
                                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)] shadow-lg'
                                                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                            }
                                        `}
                                    >
                                        <Sparkles className="w-12 h-12 mx-auto mb-4" />
                                        <span className="text-lg font-medium">Sí, frecuentemente</span>
                                    </button>

                                    <button
                                        onClick={() => setUsesAccessories(false)}
                                        className={`p-8 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105
                                            ${usesAccessories === false
                                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)] shadow-lg'
                                                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/50'
                                            }
                                        `}
                                    >
                                        <Scissors className="w-12 h-12 mx-auto mb-4" />
                                        <span className="text-lg font-medium">No, rara vez</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--background)] to-transparent">
                    <div className="flex gap-4">
                        {step > 0 && (
                            <Button
                                variant="secondary"
                                onClick={handleBack}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Atrás
                            </Button>
                        )}

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`flex-1 ${step > 0 ? 'flex-2' : 'flex-1'} flex items-center justify-center gap-2 transform hover:scale-105 transition-transform duration-200`}
                        >
                            {step === totalSteps - 1 ? (
                                <>
                                    Completar <Check className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
