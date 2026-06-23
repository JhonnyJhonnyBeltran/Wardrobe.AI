'use client';

/**
 * Clean & Fast Onboarding Tour
 * Step 1: Gender Identity (Big visual cards)
 * Step 2: Visual Style Preferences (Bubbles/Cards)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Sparkles, User, UserCircle, Star, X } from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

// --- DATA ---
const AGE_OPTIONS = [
    { value: 'under_18', label: 'Menos de 18' },
    { value: '18_24', label: '18 - 24 años' },
    { value: '25_34', label: '25 - 34 años' },
    { value: '35_44', label: '35 - 44 años' },
    { value: '45_plus', label: '45+ años' },
];

const GENDER_OPTIONS = [
    { value: 'woman', label: 'Mujer', icon: User, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80' },
    { value: 'man', label: 'Hombre', icon: UserCircle, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
    { value: 'other', label: 'Otro/Unisex', icon: Star, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80' },
];

const FALLBACK_STYLES = [
    { id: 'casual', label: 'Casual', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
    { id: 'street', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80' },
    { id: 'elegant', label: 'Elegante', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80' },
    { id: 'boho', label: 'Boho', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
    { id: 'minimal', label: 'Minimalista', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80' },
    { id: 'vintage', label: 'Vintage', image: 'https://images.unsplash.com/photo-1529374255404-31176343895d?w=400&q=80' },
];

export default function PreferencesPage() {
    const router = useRouter();
    const { user, setUser, isLoading: isLoadingUser } = useUser();

    // Core state
    const [step, setStep] = useState(0);
    const [ageRange, setAgeRange] = useState('');
    const [gender, setGender] = useState('');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    // DB state
    const [dbStyles, setDbStyles] = useState<{ id: string, name: string, image_url: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isLoadingUser) return;
        
        if (!user) {
            router.push('/auth');
            return;
        }

        if (user.styleCompleted) {
            setIsEditing(true);
            setAgeRange(prev => prev || user.ageRange || '');
            setGender(prev => prev || user.gender || '');
            if (Array.isArray(user.preferredStyles)) {
                setSelectedStyles(prev => prev.length ? prev : user.preferredStyles!);
            }
        }

        const loadStyles = async () => {
            const { data, error } = await supabase.from('style_options').select('*').eq('is_active', true);
            if (!error && data && data.length > 0) {
                setDbStyles(data);
            }
            setIsLoading(false);
        };

        loadStyles();
    }, [user, router, isLoadingUser]);

    const handleNext = () => {
        if (step === 0 && !ageRange) return;
        if (step === 1 && !gender) return;

        if (step < 2) {
            setStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const { error } = await (supabase as any)
                .from('profiles')
                .update({
                    age_range: ageRange,
                    gender: gender,
                    preferred_styles: selectedStyles,
                    visual_style_preferences: selectedStyles,
                    style_completed: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            // 2. Update local store
            setUser({
                ...user,
                ageRange: ageRange as any,
                gender: gender as any,
                preferredStyles: selectedStyles,
                styleCompleted: true
            });

            // 3. Success Redirect
            router.push('/closet');
        } catch (err: any) {
            console.error('Error saving fast tour preferences:', err);
            alert('Error guardando preferencias. Intenta de nuevo.');
            setIsSaving(false);
        }
    };

    const toggleStyle = (id: string) => {
        setSelectedStyles(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <LogoMark className="animate-pulse opacity-50 w-12 h-12" />
            </div>
        );
    }

    const availableStyles = dbStyles.length > 0 ? dbStyles.map(s => ({ id: s.id, label: s.name, image: s.image_url })) : FALLBACK_STYLES;

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-32 overflow-hidden flex flex-col">

            {/* Minimal Header */}
            <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md">
                <div className="flex gap-2">
                    <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 0 ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`} />
                    <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`} />
                    <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`} />
                </div>
                {isEditing && (
                    <button onClick={() => router.push('/closet')} className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                )}
                {step > 0 && !isEditing && (
                    <button
                        onClick={() => setStep(prev => prev - 1)}
                        className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm font-medium transition-colors p-2"
                    >
                        Volver
                    </button>
                )}
            </header>

            <main className="flex-1 px-6 max-w-2xl mx-auto w-full pt-8 relative">
                <AnimatePresence mode="wait">
                    {/* STEP 0: AGE RANGE */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="text-center md:text-left space-y-3">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">¿Qué edad tienes?</h1>
                                <p className="text-[17px] text-[var(--foreground-secondary)]">Nos ayuda a adaptar las recomendaciones a tu estilo de vida.</p>
                            </div>

                            <div className="grid gap-4 mt-4">
                                {AGE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setAgeRange(option.value);
                                            setTimeout(() => setStep(1), 300);
                                        }}
                                        className={`relative w-full h-16 md:h-20 rounded-2xl flex items-center justify-between px-6 transition-all border-2 ${ageRange === option.value
                                            ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 scale-[0.98]'
                                            : 'border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 bg-[var(--background-secondary)] active:scale-95'
                                            }`}
                                    >
                                        <span className={`text-xl font-semibold tracking-wide ${ageRange === option.value ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground)]'}`}>
                                            {option.label}
                                        </span>
                                        {ageRange === option.value && (
                                            <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-lg">
                                                <Check className="w-5 h-5" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: GENDER */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="text-center md:text-left space-y-3">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">¿Para quién compramos?</h1>
                                <p className="text-[17px] text-[var(--foreground-secondary)]">Esto nos ayuda a configurar tu armario inicial y mostrarte inspiración relevante.</p>
                            </div>

                            <div className="grid gap-4 mt-4">
                                {GENDER_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setGender(option.value);
                                            // Auto-advance for ultra-fast UX
                                            setTimeout(() => setStep(2), 300);
                                        }}
                                        className={`relative w-full h-32 md:h-40 rounded-2xl overflow-hidden text-left transition-all ${gender === option.value
                                            ? 'ring-4 ring-[var(--brand-pink)] ring-offset-2 ring-offset-[var(--background)] scale-[0.98]'
                                            : 'hover:opacity-90 active:scale-95'
                                            }`}
                                    >
                                        <Image src={option.image} alt={option.label} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                                            <span className="text-white text-2xl font-bold tracking-wide flex items-center gap-3">
                                                <option.icon className="w-6 h-6 opacity-80" />
                                                {option.label}
                                            </span>
                                            {gender === option.value && (
                                                <div className="w-8 h-8 rounded-full bg-[var(--brand-pink)] flex items-center justify-center text-white shadow-lg">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: STYLES */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="text-center md:text-left space-y-3">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">Tus Vibes Visuales</h1>
                                <p className="text-[17px] text-[var(--foreground-secondary)]">Toca las fotos que encajen con cómo te gusta vestir <span className="text-[var(--foreground-tertiary)]">(Opcional)</span></p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                                {availableStyles.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => toggleStyle(style.id)}
                                        className="relative aspect-[3/4] rounded-2xl overflow-hidden group focus:outline-none"
                                    >
                                        <div className="absolute inset-0 bg-black/10 z-10" />
                                        <Image src={style.image} alt={style.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />

                                        {/* Overlay Check */}
                                        <div className={`absolute inset-0 z-20 transition-all duration-300 ${selectedStyles.includes(style.id) ? 'bg-[var(--brand-pink)]/30 backdrop-blur-[2px]' : 'bg-transparent'}`} />

                                        {/* Name Label */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 z-30 bg-gradient-to-t from-black/80 to-transparent">
                                            <span className="text-white font-semibold flex items-center gap-2">
                                                {style.label}
                                            </span>
                                        </div>

                                        {/* Check Icon */}
                                        {selectedStyles.includes(style.id) && (
                                            <div className="absolute top-3 right-3 z-30 w-7 h-7 bg-white rounded-full flex items-center justify-center text-[var(--brand-pink)] shadow-lg animate-in zoom-in-50">
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Floating Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent z-40 cursor-auto pointer-events-none">
                <div className="max-w-xl mx-auto flex justify-between gap-4 pointer-events-auto">
                    {step > 0 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-16 h-14 md:w-auto md:px-8 rounded-2xl"
                            onClick={() => setStep(prev => prev - 1)}
                        >
                            <ChevronLeft className="w-6 h-6" />
                            <span className="hidden md:inline ml-2">Atrás</span>
                        </Button>
                    )}

                    <Button
                        size="lg"
                        glow={step === 2 || (step === 1 && !!gender) || (step === 0 && !!ageRange)}
                        className="flex-1 h-14 rounded-2xl text-[16px] max-w-sm ml-auto"
                        onClick={handleNext}
                        disabled={(step === 0 && !ageRange) || (step === 1 && !gender) || isSaving}
                    >
                        {step === 2 ? '¡Listo, entremos! ✨' : 'Siguiente paso'}
                        {step < 2 && <ChevronRight className="w-5 h-5 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
