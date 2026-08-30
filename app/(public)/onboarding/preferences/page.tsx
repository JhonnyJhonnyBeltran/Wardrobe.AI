'use client';

/**
 * Onboarding Preferences Page
 * Step 0: Age Selector (Interactive modern slider)
 * Step 1: Style / Identity Category (Woman, Man, Unisex)
 * Step 2: Visual Style Selection (Dynamic gender-based photography)
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Minus, Plus, X } from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface StyleItem {
    id: string;
    slug?: string;
    name: string;
    image_url?: string;
    image_url_woman?: string;
    image_url_man?: string;
}

// 34 Comprehensive Style Definitions with Real Fashion Outfit Photography
const COMPREHENSIVE_STYLES: StyleItem[] = [
    {
        id: 'casual-moderno',
        slug: 'casual-moderno',
        name: 'Casual Moderno',
        image_url: '/styles/women/casual-moderno.jpg',
        image_url_woman: '/styles/women/casual-moderno.jpg',
        image_url_man: '/styles/men/casual-moderno.jpg',
    },
    {
        id: 'streetwear',
        slug: 'streetwear',
        name: 'Streetwear',
        image_url: '/styles/men/streetwear.jpg',
        image_url_woman: '/styles/women/streetwear.jpg',
        image_url_man: '/styles/men/streetwear.jpg',
    },
    {
        id: 'elegante-clasico',
        slug: 'elegante-clasico',
        name: 'Elegante / Clásico',
        image_url: '/styles/women/elegante-clasico.jpg',
        image_url_woman: '/styles/women/elegante-clasico.jpg',
        image_url_man: '/styles/men/elegante-clasico.jpg',
    },
    {
        id: 'old-money',
        slug: 'old-money',
        name: 'Old Money / Quiet Luxury',
        image_url: '/styles/men/old-money.jpg',
        image_url_woman: '/styles/women/old-money.jpg',
        image_url_man: '/styles/men/old-money.jpg',
    },
    {
        id: 'minimalista',
        slug: 'minimalista',
        name: 'Minimalista',
        image_url: '/styles/women/minimalista.jpg',
        image_url_woman: '/styles/women/minimalista.jpg',
        image_url_man: '/styles/men/minimalista.jpg',
    },
    {
        id: 'deportivo-athleisure',
        slug: 'deportivo-athleisure',
        name: 'Deportivo / Athleisure',
        image_url: '/styles/men/deportivo-athleisure.jpg',
        image_url_woman: '/styles/women/deportivo-athleisure.jpg',
        image_url_man: '/styles/men/deportivo-athleisure.jpg',
    },
    {
        id: 'boho-chic',
        slug: 'boho-chic',
        name: 'Boho Chic',
        image_url: '/styles/women/boho-chic.jpg',
        image_url_woman: '/styles/women/boho-chic.jpg',
        image_url_man: '/styles/men/boho-chic.jpg',
    },
    {
        id: 'y2k',
        slug: 'y2k',
        name: 'Y2K',
        image_url: '/styles/women/y2k.jpg',
        image_url_woman: '/styles/women/y2k.jpg',
        image_url_man: '/styles/men/y2k.jpg',
    },
    {
        id: 'business-casual',
        slug: 'business-casual',
        name: 'Business Casual',
        image_url: '/styles/men/business-casual.jpg',
        image_url_woman: '/styles/women/business-casual.jpg',
        image_url_man: '/styles/men/business-casual.jpg',
    },
    {
        id: 'rock-grunge',
        slug: 'rock-grunge',
        name: 'Rock / Grunge',
        image_url: '/styles/women/rock-grunge.jpg',
        image_url_woman: '/styles/women/rock-grunge.jpg',
        image_url_man: '/styles/men/rock-grunge.jpg',
    },
    {
        id: 'preppy',
        slug: 'preppy',
        name: 'Preppy',
        image_url: '/styles/men/preppy.jpg',
        image_url_woman: '/styles/women/preppy.jpg',
        image_url_man: '/styles/men/preppy.jpg',
    },
    {
        id: 'vintage-retro',
        slug: 'vintage-retro',
        name: 'Vintage / Retro',
        image_url: '/styles/women/vintage-retro.jpg',
        image_url_woman: '/styles/women/vintage-retro.jpg',
        image_url_man: '/styles/men/vintage-retro.jpg',
    },
    {
        id: 'cottagecore',
        slug: 'cottagecore',
        name: 'Cottagecore',
        image_url: '/styles/women/cottagecore.jpg',
        image_url_woman: '/styles/women/cottagecore.jpg',
        image_url_man: '/styles/men/cottagecore.jpg',
    },
    {
        id: 'gotico-alt',
        slug: 'gotico-alt',
        name: 'Gótico / Alt',
        image_url: '/styles/women/gotico-alt.jpg',
        image_url_woman: '/styles/women/gotico-alt.jpg',
        image_url_man: '/styles/men/gotico-alt.jpg',
    },
    {
        id: 'techwear',
        slug: 'techwear',
        name: 'Techwear / Utilitario',
        image_url: '/styles/men/techwear.jpg',
        image_url_woman: '/styles/women/techwear.jpg',
        image_url_man: '/styles/men/techwear.jpg',
    },
    {
        id: 'dark-academia',
        slug: 'dark-academia',
        name: 'Dark Academia',
        image_url: '/styles/women/dark-academia.jpg',
        image_url_woman: '/styles/women/dark-academia.jpg',
        image_url_man: '/styles/men/dark-academia.jpg',
    },
    {
        id: 'light-academia',
        slug: 'light-academia',
        name: 'Light Academia',
        image_url: '/styles/women/light-academia.jpg',
        image_url_woman: '/styles/women/light-academia.jpg',
        image_url_man: '/styles/men/light-academia.jpg',
    },
    {
        id: 'skater-surf',
        slug: 'skater-surf',
        name: 'Skater / Surf',
        image_url: '/styles/men/skater-surf.jpg',
        image_url_woman: '/styles/women/skater-surf.jpg',
        image_url_man: '/styles/men/skater-surf.jpg',
    },
    {
        id: 'clean-look',
        slug: 'clean-look',
        name: 'Clean Look',
        image_url: '/styles/women/clean-look.jpg',
        image_url_woman: '/styles/women/clean-look.jpg',
        image_url_man: '/styles/men/clean-look.jpg',
    },
    {
        id: 'normcore',
        slug: 'normcore',
        name: 'Normcore',
        image_url: '/styles/men/normcore.jpg',
        image_url_woman: '/styles/women/normcore.jpg',
        image_url_man: '/styles/men/normcore.jpg',
    },
    {
        id: 'chic-parisino',
        slug: 'chic-parisino',
        name: 'Chic Parisino',
        image_url: '/styles/women/chic-parisino.jpg',
        image_url_woman: '/styles/women/chic-parisino.jpg',
        image_url_man: '/styles/men/chic-parisino.jpg',
    },
    {
        id: 'coastal-resort',
        slug: 'coastal-resort',
        name: 'Coastal / Resort',
        image_url: '/styles/men/coastal-resort.jpg',
        image_url_woman: '/styles/women/coastal-resort.jpg',
        image_url_man: '/styles/men/coastal-resort.jpg',
    },
    {
        id: 'western-cowboy',
        slug: 'western-cowboy',
        name: 'Western / Cowboy',
        image_url: '/styles/women/western-cowboy.jpg',
        image_url_woman: '/styles/women/western-cowboy.jpg',
        image_url_man: '/styles/men/western-cowboy.jpg',
    },
    {
        id: 'k-fashion',
        slug: 'k-fashion',
        name: 'K-Fashion',
        image_url: '/styles/women/k-fashion.jpg',
        image_url_woman: '/styles/women/k-fashion.jpg',
        image_url_man: '/styles/men/k-fashion.jpg',
    },
    {
        id: 'harajuku',
        slug: 'harajuku',
        name: 'Harajuku / J-Fashion',
        image_url: '/styles/women/harajuku-j-fashion.jpg',
        image_url_woman: '/styles/women/harajuku-j-fashion.jpg',
        image_url_man: '/styles/men/harajuku-j-fashion.jpg',
    },
    {
        id: 'workwear-americana',
        slug: 'workwear-americana',
        name: 'Workwear / Americana',
        image_url: '/styles/men/workwear-americana.jpg',
        image_url_woman: '/styles/women/workwear-americana.jpg',
        image_url_man: '/styles/men/workwear-americana.jpg',
    },
    {
        id: 'coquette',
        slug: 'coquette',
        name: 'Coquette',
        image_url: '/styles/women/coquette.jpg',
        image_url_woman: '/styles/women/coquette.jpg',
        image_url_man: '/styles/men/coquette.jpg',
    },
    {
        id: 'baddie-glam',
        slug: 'baddie-glam',
        name: 'Baddie / Glam',
        image_url: '/styles/women/baddie-glam.jpg',
        image_url_woman: '/styles/women/baddie-glam.jpg',
        image_url_man: '/styles/men/baddie-glam.jpg',
    },
    {
        id: 'maximalista',
        slug: 'maximalista',
        name: 'Maximalista',
        image_url: '/styles/women/maximalista.jpg',
        image_url_woman: '/styles/women/maximalista.jpg',
        image_url_man: '/styles/men/maximalista.jpg',
    },
    {
        id: 'gorpcore',
        slug: 'gorpcore',
        name: 'Gorpcore / Outdoor',
        image_url: '/styles/men/gorpcore-outdoor.jpg',
        image_url_woman: '/styles/women/gorpcore-outdoor.jpg',
        image_url_man: '/styles/men/gorpcore-outdoor.jpg',
    },
    {
        id: 'party-noche',
        slug: 'party-noche',
        name: 'Noche / Fiesta',
        image_url: '/styles/women/noche-fiesta.jpg',
        image_url_woman: '/styles/women/noche-fiesta.jpg',
        image_url_man: '/styles/men/noche-fiesta.jpg',
    },
    {
        id: 'smart-casual',
        slug: 'smart-casual',
        name: 'Smart Casual',
        image_url: '/styles/men/smart-casual.jpg',
        image_url_woman: '/styles/women/smart-casual.jpg',
        image_url_man: '/styles/men/smart-casual.jpg',
    },
    {
        id: 'soft-girl-boy',
        slug: 'soft-girl-boy',
        name: 'Soft Girl / Soft Boy',
        image_url: '/styles/women/soft-girl-boy.jpg',
        image_url_woman: '/styles/women/soft-girl-boy.jpg',
        image_url_man: '/styles/men/soft-girl-boy.jpg',
    },
    {
        id: 'cyberpunk',
        slug: 'cyberpunk',
        name: 'Cyberpunk / Y2K Tech',
        image_url: '/styles/men/cyberpunk.jpg',
        image_url_woman: '/styles/women/cyberpunk.jpg',
        image_url_man: '/styles/men/cyberpunk.jpg',
    },
];

const GENDER_OPTIONS = [
    {
        value: 'woman',
        label: 'Mujer',
        sublabel: 'Moda y cortes femeninos',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    },
    {
        value: 'man',
        label: 'Hombre',
        sublabel: 'Moda y cortes masculinos',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
    {
        value: 'other',
        label: 'Unisex / Mixto',
        sublabel: 'Inspiración diversa y combinada',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    },
];

// Helper to derive legacy age_range string from numeric age
function getAgeRangeFromAge(age: number): string {
    if (age < 18) return 'under_18';
    if (age <= 24) return '18_24';
    if (age <= 34) return '25_34';
    if (age <= 44) return '35_44';
    return '45_plus';
}

function getAgeLabel(age: number): string {
    if (age < 18) return 'Menor de 18';
    if (age <= 24) return 'Joven Adulto (18-24)';
    if (age <= 34) return 'Adulto (25-34)';
    if (age <= 44) return 'Maduro (35-44)';
    if (age <= 59) return 'Senior (45-59)';
    return '60+ años';
}

export default function PreferencesPage() {
    const router = useRouter();
    const { user, setUser, isLoading: isLoadingUser } = useUser();

    // Core state
    const [step, setStep] = useState(0);
    const [age, setAge] = useState<number>(24);
    const [gender, setGender] = useState('');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    // DB state
    const [dbStyles, setDbStyles] = useState<StyleItem[]>([]);
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
            if (user.age) {
                setAge(user.age);
            } else if (user.ageRange) {
                if (user.ageRange === 'under_18') setAge(16);
                else if (user.ageRange === '18_24' || user.ageRange === '18-24') setAge(21);
                else if (user.ageRange === '25_34' || user.ageRange === '25-34') setAge(28);
                else if (user.ageRange === '35_44' || user.ageRange === '35-44') setAge(38);
                else setAge(50);
            }
            setGender(prev => prev || user.gender || '');
            if (Array.isArray(user.preferredStyles)) {
                setSelectedStyles(prev => prev.length ? prev : user.preferredStyles!);
            }
        }

        const loadStyles = async () => {
            try {
                const { data, error } = await supabase
                    .from('style_options')
                    .select('*')
                    .eq('is_active', true);

                if (!error && data && data.length > 0) {
                    setDbStyles(data);
                }
            } catch (e) {
                console.warn('Could not load styles from DB, using fallback list', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadStyles();
    }, [user, router, isLoadingUser]);

    // Merge DB styles with comprehensive fallback list ensuring full coverage
    const availableStyles = useMemo(() => {
        if (!dbStyles || dbStyles.length === 0) return COMPREHENSIVE_STYLES;

        const dbMap = new Map(dbStyles.map(s => [s.slug || s.id, s]));
        const merged: StyleItem[] = [];

        // Include all comprehensive styles, enriching with DB data when available
        COMPREHENSIVE_STYLES.forEach(fallback => {
            const match = dbMap.get(fallback.slug || fallback.id) || dbStyles.find(d => d.name.toLowerCase() === fallback.name.toLowerCase());
            if (match) {
                merged.push({
                    id: match.id || fallback.id,
                    slug: match.slug || fallback.slug,
                    name: match.name || fallback.name,
                    image_url: fallback.image_url || match.image_url,
                    image_url_woman: fallback.image_url_woman || match.image_url_woman || match.image_url,
                    image_url_man: fallback.image_url_man || match.image_url_man || match.image_url,
                });
                dbMap.delete(match.slug || match.id);
            } else {
                merged.push(fallback);
            }
        });

        // Add any remaining extra styles from DB
        dbMap.forEach(extra => {
            merged.push({
                id: extra.id,
                slug: extra.slug || extra.id,
                name: extra.name,
                image_url: extra.image_url,
                image_url_woman: extra.image_url_woman || extra.image_url,
                image_url_man: extra.image_url_man || extra.image_url,
            });
        });

        return merged;
    }, [dbStyles]);

    // Choose image based on gender selection
    const getStyleImage = (style: StyleItem, idx: number) => {
        if (gender === 'man') {
            return style.image_url_man || style.image_url || style.image_url_woman || '';
        }
        if (gender === 'woman') {
            return style.image_url_woman || style.image_url || style.image_url_man || '';
        }
        // Unisex: alternate curated photos
        return idx % 2 === 0
            ? (style.image_url_woman || style.image_url || style.image_url_man || '')
            : (style.image_url_man || style.image_url || style.image_url_woman || '');
    };

    const handleNext = () => {
        if (step === 0 && !age) return;
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

        const ageRangeComputed = getAgeRangeFromAge(age);

        try {
            const { error } = await (supabase as any)
                .from('profiles')
                .upsert({
                    id: user.id,
                    age: age,
                    age_range: ageRangeComputed,
                    gender: gender,
                    preferred_styles: selectedStyles,
                    visual_style_preferences: selectedStyles,
                    style_completed: true,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Update local store
            setUser({
                ...user,
                age: age,
                ageRange: ageRangeComputed as any,
                gender: gender as any,
                preferredStyles: selectedStyles,
                visualStylePreferences: selectedStyles,
                styleCompleted: true
            });

            // Redirect to closet
            router.push('/closet');
        } catch (err: any) {
            console.error('Error saving onboarding preferences:', err);
            setIsSaving(false);
        }
    };

    const toggleStyle = (idOrSlug: string) => {
        setSelectedStyles(prev =>
            prev.includes(idOrSlug) ? prev.filter(s => s !== idOrSlug) : [...prev, idOrSlug]
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <LogoMark className="animate-pulse opacity-50 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] pb-28 md:pb-32 overflow-hidden flex flex-col selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Minimal Header */}
            <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/30">
                <div className="flex gap-2 items-center">
                    <div className={`h-1.5 w-10 md:w-14 rounded-full transition-all duration-300 ${step >= 0 ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`} />
                    <div className={`h-1.5 w-10 md:w-14 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`} />
                    <div className={`h-1.5 w-10 md:w-14 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`} />
                </div>
                {isEditing && (
                    <button
                        onClick={() => router.push('/closet')}
                        className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {step > 0 && !isEditing && (
                    <button
                        onClick={() => setStep(prev => prev - 1)}
                        className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] text-sm font-medium transition-colors py-1.5 px-3 rounded-lg hover:bg-[var(--background-secondary)]"
                    >
                        Volver
                    </button>
                )}
            </header>

            <main className="flex-1 px-4 sm:px-6 max-w-2xl mx-auto w-full pt-6 md:pt-10 relative">
                <AnimatePresence mode="wait">
                    {/* STEP 0: AGE SLIDER */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                    ¿Cuál es tu edad?
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Adaptamos las recomendaciones y tendencias de la comunidad según tu perfil.
                                </p>
                            </div>

                            {/* Modern Interactive Age Card */}
                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-sm">
                                {/* Digital readout */}
                                <div className="text-center space-y-1">
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-[var(--brand-pink)] tabular-nums">
                                            {age}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-semibold text-[var(--foreground-secondary)]">
                                            años
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-[var(--foreground-tertiary)] uppercase tracking-wider">
                                        {getAgeLabel(age)}
                                    </p>
                                </div>

                                {/* Slider Control with Precision Buttons */}
                                <div className="w-full max-w-md space-y-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAge(prev => Math.max(14, prev - 1))}
                                            disabled={age <= 14}
                                            className="w-10 h-10 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--foreground)] transition-colors shrink-0"
                                            aria-label="Disminuir edad"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>

                                        <div className="relative flex-1 flex items-center">
                                            <input
                                                type="range"
                                                min={14}
                                                max={80}
                                                step={1}
                                                value={age}
                                                onChange={(e) => setAge(Number(e.target.value))}
                                                className="w-full h-3 bg-[var(--background-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--brand-pink)] focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setAge(prev => Math.min(80, prev + 1))}
                                            disabled={age >= 80}
                                            className="w-10 h-10 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--foreground)] transition-colors shrink-0"
                                            aria-label="Aumentar edad"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between text-xs text-[var(--foreground-tertiary)] font-medium px-1">
                                        <span>14 años</span>
                                        <span>30 años</span>
                                        <span>50 años</span>
                                        <span>80 años</span>
                                    </div>
                                </div>

                                {/* Quick Age Selector Pills */}
                                <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-[var(--border-color)]/50 w-full">
                                    {[18, 21, 25, 30, 40, 50].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setAge(preset)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                                age === preset
                                                    ? 'bg-[var(--brand-pink)] text-white shadow-sm'
                                                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border-color)]/60'
                                            }`}
                                        >
                                            {preset} años
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: GENDER / PREFERENCE CATEGORY */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6 md:gap-8"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                    Preferencia de catálogo
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Selecciona el enfoque de prendas y modelos que deseas ver en tus recomendaciones.
                                </p>
                            </div>

                            <div className="grid gap-3.5 sm:gap-4 mt-1">
                                {GENDER_OPTIONS.map((option) => {
                                    const isSelected = gender === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setGender(option.value);
                                                setTimeout(() => setStep(2), 220);
                                            }}
                                            className={`relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden text-left transition-all duration-200 group ${
                                                isSelected
                                                    ? 'ring-3 ring-[var(--brand-pink)] scale-[0.99] shadow-lg'
                                                    : 'border border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 active:scale-[0.98]'
                                            }`}
                                        >
                                            <Image
                                                src={option.image}
                                                alt={option.label}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />

                                            <div className="absolute inset-0 p-5 sm:p-6 flex items-center justify-between z-10">
                                                <div className="space-y-1">
                                                    <span className="text-white text-xl sm:text-2xl font-bold tracking-wide block">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-white/75 text-xs sm:text-sm block">
                                                        {option.sublabel}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'bg-[var(--brand-pink)] text-white shadow-md'
                                                            : 'bg-white/20 text-white/50 group-hover:bg-white/40'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: EXPANDED STYLES GRID */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                        Tus estilos favoritos
                                    </h1>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--background-secondary)] text-[var(--brand-pink)] border border-[var(--border-color)]">
                                        {selectedStyles.length} seleccionados
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Elige los estilos que mejor representen cómo te gusta vestir.
                                </p>
                            </div>

                            {/* 32 Grid Items with dynamic gender-specific photography */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pb-4">
                                {availableStyles.map((style, idx) => {
                                    const styleKey = style.slug || style.id;
                                    const isSelected = selectedStyles.includes(styleKey) || selectedStyles.includes(style.id);
                                    const imageUrl = getStyleImage(style, idx);

                                    return (
                                        <button
                                            key={styleKey}
                                            type="button"
                                            onClick={() => toggleStyle(styleKey)}
                                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden group focus:outline-none transition-all duration-200 text-left ${
                                                isSelected
                                                    ? 'ring-3 ring-[var(--brand-pink)] scale-[0.98] shadow-md'
                                                    : 'border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 active:scale-[0.98]'
                                            }`}
                                        >
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={style.name}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-tertiary)]" />
                                            )}

                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-10" />

                                            {/* Pink overlay when selected */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-[var(--brand-pink)]/25 z-20 transition-opacity" />
                                            )}

                                            {/* Selection indicator pill */}
                                            <div className="absolute top-2.5 right-2.5 z-30">
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'bg-[var(--brand-pink)] text-white shadow-md scale-100'
                                                            : 'bg-black/40 text-transparent border border-white/30 group-hover:border-white/70'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                                </div>
                                            </div>

                                            {/* Name Label */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 z-30">
                                                <span className="text-white text-xs sm:text-sm font-semibold tracking-wide block leading-snug line-clamp-2 drop-shadow-sm">
                                                    {style.name}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Floating Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent z-40 pointer-events-none">
                <div className="max-w-xl mx-auto flex justify-between gap-3 sm:gap-4 pointer-events-auto">
                    {step > 0 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-14 sm:w-auto sm:px-6 h-13 rounded-2xl flex items-center justify-center gap-2"
                            onClick={() => setStep(prev => prev - 1)}
                            type="button"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Atrás</span>
                        </Button>
                    )}

                    <Button
                        size="lg"
                        className="flex-1 h-13 rounded-2xl text-[15px] font-semibold max-w-sm ml-auto"
                        onClick={handleNext}
                        disabled={(step === 0 && !age) || (step === 1 && !gender) || isSaving}
                        type="button"
                    >
                        {isSaving
                            ? 'Guardando...'
                            : step === 2
                            ? 'Finalizar y explorar'
                            : 'Continuar'}
                        {step < 2 && !isSaving && <ChevronRight className="w-4 h-4 ml-1.5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
