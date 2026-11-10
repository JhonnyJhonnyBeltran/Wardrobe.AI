'use client';

/**
 * Onboarding Preferences Page - Phased Guided Onboarding
 * Step 0: Identidad (Enfoque de moda Chica/Chico/Unisex + Edad + Altura)
 * Step 1: Silueta (Tipo de cuerpo + Colorimetría opcional)
 * Step 2: Estilos Favoritos (Pills agrupadas por categorías, filtradas por género + buscador) + Accesorios
 */

import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Minus,
    Plus,
    X,
    User,
    AtSign,
    Loader2,
    Ruler,
    Eye,
    Palette,
    Search,
    SlidersHorizontal,
    ShieldCheck,
    AlertCircle,
} from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';
import { useTourStore } from '@/store/tourStore';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';
import { showDatabaseError } from '@/lib/errorModal';
import {
    BODY_TYPES_BY_GENDER,
    EYE_COLOR_OPTIONS,
    HAIR_COLOR_OPTIONS,
} from '@/components/AvatarCalibrationModal';

interface StyleItem {
    id: string;
    slug?: string;
    name: string;
    category: string;
    genderTarget: 'woman' | 'man' | 'all';
}

interface AccessoryOption {
    id: string;
    name: string;
    sublabel: string;
}

const ACCESSORY_OPTIONS: AccessoryOption[] = [
    {
        id: 'minimalista',
        name: 'Minimalista',
        sublabel: 'Sutil y funcional (reloj fino o anillos discretos)',
    },
    {
        id: 'clasico',
        name: 'Clásico / Elegante',
        sublabel: 'Atemporal (reloj de piel o acero, joyería clásica)',
    },
    {
        id: 'llamativo',
        name: 'Statement / Llamativo',
        sublabel: 'Piezas protagonistas con presencia y volumen',
    },
    {
        id: 'urbano',
        name: 'Urbano / Streetwear',
        sublabel: 'Gorras, cadenas, gafas de sol y complementos',
    },
    {
        id: 'ninguno',
        name: 'Sin accesorios',
        sublabel: 'Looks limpios sin complementos adicionales',
    },
];

const COMPREHENSIVE_STYLES: StyleItem[] = [
    // 🌟 Tendencias & Virales
    { id: 'streetwear', slug: 'streetwear', name: 'Streetwear', category: 'Tendencias & Virales', genderTarget: 'all' },
    { id: 'old-money', slug: 'old-money', name: 'Old Money', category: 'Tendencias & Virales', genderTarget: 'all' },
    { id: 'y2k', slug: 'y2k', name: 'Y2K', category: 'Tendencias & Virales', genderTarget: 'all' },
    { id: 'clean-look', slug: 'clean-look', name: 'Clean Look', category: 'Tendencias & Virales', genderTarget: 'all' },
    { id: 'coquette', slug: 'coquette', name: 'Coquette', category: 'Tendencias & Virales', genderTarget: 'woman' },
    { id: 'baddie-glam', slug: 'baddie-glam', name: 'Baddie / Glam', category: 'Tendencias & Virales', genderTarget: 'woman' },
    { id: 'k-fashion', slug: 'k-fashion', name: 'K-Fashion', category: 'Tendencias & Virales', genderTarget: 'all' },

    // 🏙️ Casual & Diario
    { id: 'casual-moderno', slug: 'casual-moderno', name: 'Casual Moderno', category: 'Casual & Diario', genderTarget: 'all' },
    { id: 'minimalista', slug: 'minimalista', name: 'Minimalista', category: 'Casual & Diario', genderTarget: 'all' },
    { id: 'normcore', slug: 'normcore', name: 'Normcore', category: 'Casual & Diario', genderTarget: 'all' },
    { id: 'deportivo-athleisure', slug: 'deportivo-athleisure', name: 'Deportivo / Athleisure', category: 'Casual & Diario', genderTarget: 'all' },
    { id: 'smart-casual', slug: 'smart-casual', name: 'Smart Casual', category: 'Casual & Diario', genderTarget: 'all' },

    // 👔 Elegante & Formal
    { id: 'elegante-clasico', slug: 'elegante-clasico', name: 'Elegante / Clásico', category: 'Elegante & Formal', genderTarget: 'all' },
    { id: 'business-casual', slug: 'business-casual', name: 'Business Casual', category: 'Elegante & Formal', genderTarget: 'all' },
    { id: 'preppy', slug: 'preppy', name: 'Preppy', category: 'Elegante & Formal', genderTarget: 'all' },
    { id: 'chic-parisino', slug: 'chic-parisino', name: 'Chic Parisino', category: 'Elegante & Formal', genderTarget: 'woman' },

    // 🛹 Urbano, Tech & Outdoor
    { id: 'skater-surf', slug: 'skater-surf', name: 'Skater / Surf', category: 'Urbano & Outdoor', genderTarget: 'man' },
    { id: 'workwear-americana', slug: 'workwear-americana', name: 'Workwear / Americana', category: 'Urbano & Outdoor', genderTarget: 'man' },
    { id: 'techwear', slug: 'techwear', name: 'Techwear / Utilitario', category: 'Urbano & Outdoor', genderTarget: 'man' },
    { id: 'gorpcore', slug: 'gorpcore', name: 'Gorpcore / Outdoor', category: 'Urbano & Outdoor', genderTarget: 'man' },
    { id: 'cyberpunk', slug: 'cyberpunk', name: 'Cyberpunk / Tech', category: 'Urbano & Outdoor', genderTarget: 'all' },

    // ☕ Aesthetic & Subculturas
    { id: 'dark-academia', slug: 'dark-academia', name: 'Dark Academia', category: 'Aesthetic & Subculturas', genderTarget: 'all' },
    { id: 'light-academia', slug: 'light-academia', name: 'Light Academia', category: 'Aesthetic & Subculturas', genderTarget: 'all' },
    { id: 'cottagecore', slug: 'cottagecore', name: 'Cottagecore', category: 'Aesthetic & Subculturas', genderTarget: 'woman' },
    { id: 'soft-girl-boy', slug: 'soft-girl-boy', name: 'Soft Aesthetic', category: 'Aesthetic & Subculturas', genderTarget: 'all' },
    { id: 'gotico-alt', slug: 'gotico-alt', name: 'Gótico / Alt', category: 'Aesthetic & Subculturas', genderTarget: 'all' },
    { id: 'harajuku', slug: 'harajuku', name: 'Harajuku / J-Fashion', category: 'Aesthetic & Subculturas', genderTarget: 'all' },

    // 🎸 Vintage, Retro & Ocasiones
    { id: 'vintage-retro', slug: 'vintage-retro', name: 'Vintage / Retro', category: 'Vintage & Ocasiones', genderTarget: 'all' },
    { id: 'rock-grunge', slug: 'rock-grunge', name: 'Rock / Grunge', category: 'Vintage & Ocasiones', genderTarget: 'all' },
    { id: 'boho-chic', slug: 'boho-chic', name: 'Boho Chic', category: 'Vintage & Ocasiones', genderTarget: 'woman' },
    { id: 'western-cowboy', slug: 'western-cowboy', name: 'Western / Cowboy', category: 'Vintage & Ocasiones', genderTarget: 'all' },
    { id: 'party-noche', slug: 'party-noche', name: 'Noche / Fiesta', category: 'Vintage & Ocasiones', genderTarget: 'all' },
    { id: 'coastal-resort', slug: 'coastal-resort', name: 'Coastal / Resort', category: 'Vintage & Ocasiones', genderTarget: 'all' },
    { id: 'maximalista', slug: 'maximalista', name: 'Maximalista', category: 'Vintage & Ocasiones', genderTarget: 'all' },
];

const GENDER_OPTIONS = [
    {
        value: 'woman',
        label: 'Chica',
        sublabel: 'Prendas y siluetas femeninas',
        badge: 'Femenino',
    },
    {
        value: 'man',
        label: 'Chico',
        sublabel: 'Prendas y siluetas masculinas',
        badge: 'Masculino',
    },
    {
        value: 'other',
        label: 'Unisex',
        sublabel: 'Todos los estilos combinados',
        badge: 'Mixto',
    },
];

function getAgeRangeFromAge(age: number): string {
    if (age < 18) return 'under_18';
    if (age <= 24) return '18_24';
    if (age <= 34) return '25_34';
    if (age <= 44) return '35_44';
    return '45_plus';
}

function PreferencesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromSource = searchParams?.get('from');
    const isFromSettings = fromSource === 'settings' || fromSource === 'profile';
    const isEditModeQuery = searchParams?.get('mode') === 'edit';

    const { user, setUser, isLoading: isLoadingUser } = useUser();
    const { checkUsernameAvailability } = useSocial();

    // Identity state (only shown if OAuth user without custom handle or editing from settings)
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(true);
    const [usernameError, setUsernameError] = useState('');
    const [needsIdentityInput, setNeedsIdentityInput] = useState(false);

    // 3 Fast Steps:
    // Step 0: Identidad (Género + Edad + Altura + Nombre/@usuario solo si falta)
    // Step 1: Silueta y Proporciones (Tipo de cuerpo + Colorimetría opcional)
    // Step 2: Estilos Favoritos (Pills agrupadas + Buscador + Accesorios)
    const [step, setStep] = useState(0);
    const [age, setAge] = useState<number>(24);
    const [gender, setGender] = useState<'woman' | 'man' | 'other' | ''>('woman');

    // Physical Profile
    const [height, setHeight] = useState<number>(168);
    const [bodyType, setBodyType] = useState<string>('reloj_de_arena');
    const [eyeColor, setEyeColor] = useState<string>('marron_oscuro');
    const [hairColor, setHairColor] = useState<string>('castano_oscuro');
    const [showColorimetry, setShowColorimetry] = useState(false);

    // Styles & Accessories
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [selectedAccessory, setSelectedAccessory] = useState<string>('minimalista');
    const [styleSearch, setStyleSearch] = useState('');
    const [showAllGenderStyles, setShowAllGenderStyles] = useState(false);
    const [showSkipSilhouetteModal, setShowSkipSilhouetteModal] = useState(false);

    // Force light mode on Onboarding (never dark); ThemeProvider restores on app routes
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
    }, []);

    // DB state
    const [dbStyles, setDbStyles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const totalSteps = 3;
    const maxStepIndex = totalSteps - 1;

    useEffect(() => {
        if (isLoadingUser) return;

        if (!user) {
            router.push('/auth');
            return;
        }

        const hasValidName = Boolean(user.name && user.name.trim().length >= 2 && user.name !== 'Usuario');
        const hasValidCustomUsername = Boolean(user.username && user.username.length >= 3 && !user.username.startsWith('user_'));

        if (user.name) {
            setFullName(prev => prev || user.name);
        }
        if (hasValidCustomUsername) {
            setUsername(prev => prev || user.username!);
            setIsUsernameAvailable(true);
        }

        const shouldAskIdentity = !hasValidName || !hasValidCustomUsername || isFromSettings || isEditModeQuery;
        setNeedsIdentityInput(shouldAskIdentity);

        const isUserConfigured = Boolean(user.styleCompleted);
        if (isUserConfigured || isFromSettings || isEditModeQuery) {
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
            if (user.gender) setGender(user.gender);
            if (user.height) setHeight(Number(user.height));
            if (user.bodyType || user.morphology) setBodyType(user.bodyType || user.morphology || 'reloj_de_arena');
            if (user.eyeColor) setEyeColor(user.eyeColor);
            if (user.hairColor) setHairColor(user.hairColor);

            if (Array.isArray(user.preferredStyles)) {
                setSelectedStyles(prev => prev.length ? prev : user.preferredStyles!);
            }
            if (user.accessoriesStyle) {
                setSelectedAccessory(user.accessoriesStyle);
            } else if (user.usesAccessories === false) {
                setSelectedAccessory('ninguno');
            } else if (user.usesAccessories === true) {
                setSelectedAccessory('minimalista');
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
    }, [user, router, isLoadingUser, isFromSettings, isEditModeQuery]);

    // Ensure bodyType matches gender options when gender changes
    const currentBodyOptions = useMemo(() => {
        const key = gender === 'man' ? 'man' : gender === 'other' ? 'other' : 'woman';
        return BODY_TYPES_BY_GENDER[key] || BODY_TYPES_BY_GENDER.woman;
    }, [gender]);

    useEffect(() => {
        const validIds = currentBodyOptions.map(o => o.id);
        if (bodyType !== 'no_specified' && !validIds.includes(bodyType)) {
            setBodyType(currentBodyOptions[0].id);
        }
        if (!user?.height && (height === 168 || height === 165 || height === 178)) {
            if (gender === 'woman') setHeight(165);
            else if (gender === 'man') setHeight(178);
            else setHeight(170);
        }
    }, [gender, currentBodyOptions]);

    const handleUsernameChange = async (rawVal: string) => {
        const clean = rawVal.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(clean);
        setIsUsernameAvailable(null);
        setUsernameError('');

        if (clean === user?.username) {
            setIsUsernameAvailable(true);
            return;
        }

        if (clean.length < 3) {
            if (clean.length > 0) setUsernameError('Mínimo 3 caracteres');
            return;
        }

        setIsCheckingUsername(true);
        const available = await checkUsernameAvailability(clean);
        setIsCheckingUsername(false);
        setIsUsernameAvailable(available);

        if (!available) {
            setUsernameError('Este nombre de usuario ya está cogido');
        }
    };

    // Filter styles by gender and combine with DB
    const availableStyles = useMemo(() => {
        const base = COMPREHENSIVE_STYLES;

        return base.filter(style => {
            if (showAllGenderStyles || !gender || gender === 'other') return true;
            if (gender === 'woman') return style.genderTarget === 'woman' || style.genderTarget === 'all';
            if (gender === 'man') return style.genderTarget === 'man' || style.genderTarget === 'all';
            return true;
        });
    }, [gender, showAllGenderStyles]);

    // Search filter
    const displayedStyles = useMemo(() => {
        if (!styleSearch.trim()) return availableStyles;
        const q = styleSearch.toLowerCase().trim();
        return availableStyles.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            (s.slug && s.slug.toLowerCase().includes(q))
        );
    }, [availableStyles, styleSearch]);

    // Group styles by category
    const styleCategories = useMemo(() => {
        const groups: Record<string, StyleItem[]> = {};
        for (const style of displayedStyles) {
            if (!groups[style.category]) {
                groups[style.category] = [];
            }
            groups[style.category].push(style);
        }
        return groups;
    }, [displayedStyles]);

    const handleNext = () => {
        if (step === 0) {
            if (needsIdentityInput) {
                if (!fullName.trim() || fullName.trim().length < 2) return;
                if (username.length < 3 || isUsernameAvailable === false || isCheckingUsername) return;
            }
            if (!gender || !age || !height) return;
        }
        if (step === 1 && (!bodyType || bodyType === '')) {
            setShowSkipSilhouetteModal(true);
            return;
        }
        if (step === 2 && selectedStyles.length === 0) return;

        if (step < maxStepIndex) {
            setStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        if (!user || isSaving) return;
        setIsSaving(true);

        const ageRangeComputed = getAgeRangeFromAge(age);
        const usesAccessoriesVal = selectedAccessory !== 'ninguno';
        const cleanUsername = (username.trim() || user.username || `user_${user.id.substring(0, 8)}`).toLowerCase().replace(/[^a-z0-9_]/g, '');
        const finalName = fullName.trim() || user.name || 'Usuario';
        const finalGender = (gender || 'woman') as 'woman' | 'man' | 'other';

        const physicalProfilePayload = {
            gender: finalGender,
            height,
            body_type: bodyType,
            eye_color: eyeColor,
            hair_color: hairColor,
            updated_at: new Date().toISOString(),
        };

        try {
            const currentNotifPrefs = (user.notificationSettings as any) || {};
            const updatedNotifPrefs = {
                ...currentNotifPrefs,
                physical_profile: physicalProfilePayload,
            };

            const payload: Record<string, any> = {
                id: user.id,
                full_name: finalName,
                username: cleanUsername,
                age: age,
                age_range: ageRangeComputed,
                gender: finalGender,
                height: height,
                body_shape: bodyType,
                morphology: bodyType,
                preferred_styles: selectedStyles,
                visual_style_preferences: selectedStyles,
                uses_accessories: usesAccessoriesVal,
                accessories_style: selectedAccessory,
                notification_preferences: updatedNotifPrefs,
                style_completed: true,
                updated_at: new Date().toISOString(),
            };

            let { error } = await (supabase as any)
                .from('profiles')
                .upsert(payload);

            if (error) {
                console.warn('Retrying profiles upsert with core columns + JSONB physical_profile:', error.message);
                const safePayload: Record<string, any> = {
                    id: user.id,
                    full_name: finalName,
                    username: cleanUsername,
                    age: age,
                    age_range: ageRangeComputed,
                    gender: finalGender,
                    preferred_styles: selectedStyles,
                    visual_style_preferences: selectedStyles,
                    notification_preferences: updatedNotifPrefs,
                    style_completed: true,
                    updated_at: new Date().toISOString(),
                };
                const retry = await (supabase as any).from('profiles').upsert(safePayload);
                error = retry.error;
            }

            if (error) throw error;

            if (typeof window !== 'undefined' && user.id) {
                localStorage.setItem(`wardrobe_physical_profile_${user.id}`, JSON.stringify(physicalProfilePayload));
            }

            setUser({
                ...user,
                name: finalName,
                username: cleanUsername,
                age: age,
                ageRange: ageRangeComputed as any,
                gender: finalGender,
                height: height,
                bodyType: bodyType,
                morphology: bodyType,
                eyeColor: eyeColor,
                hairColor: hairColor,
                preferredStyles: selectedStyles,
                visualStylePreferences: selectedStyles,
                usesAccessories: usesAccessoriesVal,
                accessoriesStyle: selectedAccessory,
                styleCompleted: true,
            });

            // Pre-complete Step 1 of the Tour (Endowed Progress Effect: user starts at 20% in /closet!)
            const tourStore = useTourStore.getState();
            tourStore.initUserTour(user.id);
            tourStore.startNewUserTour(user.id);
            tourStore.markStepComplete('style_preferences', undefined, false);

            if (isFromSettings) {
                router.push('/profile/settings');
            } else {
                router.push('/closet');
            }
        } catch (err: any) {
            console.error('Error saving onboarding preferences:', err);
            showDatabaseError(err, 'No pudimos guardar tus preferencias. Por favor, inténtalo de nuevo.');
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

    const firstName = (fullName || user?.name || '').trim().split(' ')[0];
    const agePercent = Math.max(0, Math.min(100, ((age - 14) / (80 - 14)) * 100));
    const heightPercent = Math.max(0, Math.min(100, ((height - 145) / (210 - 145)) * 100));

    return (
        <div className="min-h-screen bg-[#FBFBFD] text-zinc-900 pb-28 md:pb-32 overflow-hidden flex flex-col selection:bg-[var(--brand-pink)] selection:text-white">
            {/* Minimal Header with 3 Step Indicators */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#FBFBFD]/90 backdrop-blur-md border-b border-zinc-200/80">
                <div className="flex gap-2 items-center">
                    {Array.from({ length: totalSteps }).map((_, s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => {
                                if (s < step || isEditing) setStep(s);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                step === s
                                    ? 'w-10 bg-[var(--brand-pink)]'
                                    : step > s
                                    ? 'w-6 bg-[var(--brand-pink)]/45 cursor-pointer'
                                    : 'w-6 bg-[var(--border-color)]'
                            }`}
                            aria-label={`Paso ${s + 1}`}
                        />
                    ))}
                </div>
                {isEditing ? (
                    <button
                        onClick={() => router.push(isFromSettings ? '/profile/settings' : '/closet')}
                        className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <span className="text-xs font-bold text-[var(--foreground-secondary)] px-3 py-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)]">
                        Paso {step + 1} de {totalSteps}
                    </span>
                )}
            </header>

            <main className="flex-1 px-4 sm:px-6 max-w-2xl mx-auto w-full pt-6 md:pt-8 relative">
                <AnimatePresence mode="wait">
                    {/* PASO 1 DE 3: IDENTIDAD, GÉNERO, EDAD Y ALTURA */}
                    {step === 0 && (
                        <motion.div
                            key="step0_identity"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.22 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="space-y-1.5">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                                    {firstName && !needsIdentityInput ? `¡Hola, ${firstName}! Configura tu base` : 'Tu perfil de estilo en 30 segundos'}
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Kloe adaptará recomendaciones, cortes y proporciones a tu medida.
                                </p>
                            </div>

                            {/* Only shown if OAuth login without username or editing from Settings */}
                            {needsIdentityInput && (
                                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] block">
                                                Tu nombre
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Ej. Alex"
                                                    maxLength={50}
                                                    className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] pl-11 pr-4 py-3 rounded-full border border-[var(--border-color)] focus:border-[var(--brand-pink)] transition-all outline-none text-sm font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] block">
                                                @usuario único
                                            </label>
                                            <div className="relative">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                                    placeholder="tu_usuario"
                                                    maxLength={30}
                                                    className={`w-full bg-[var(--background-secondary)] text-[var(--foreground)] pl-11 pr-20 py-3 rounded-full border transition-all outline-none text-sm font-medium ${
                                                        usernameError
                                                            ? 'border-red-500'
                                                            : isUsernameAvailable === true
                                                            ? 'border-emerald-500/80'
                                                            : 'border-[var(--border-color)] focus:border-[var(--brand-pink)]'
                                                    }`}
                                                />
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                                                    {isCheckingUsername && (
                                                        <Loader2 className="w-4 h-4 text-[var(--brand-pink)] animate-spin" />
                                                    )}
                                                    {!isCheckingUsername && isUsernameAvailable === true && username.length >= 3 && (
                                                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Check className="w-3 h-3" strokeWidth={3} />
                                                            OK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {usernameError && (
                                                <p className="text-xs text-red-500 font-medium ml-2">{usernameError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1. Selección de Enfoque (Pills limpias Apple, sin fotos de stock) */}
                            <div className="space-y-2.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] block">
                                    1. ¿Qué enfoque de moda buscas?
                                </label>
                                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                                    {GENDER_OPTIONS.map((option) => {
                                        const isSelected = gender === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setGender(option.value as 'woman' | 'man' | 'other')}
                                                className={`py-4 px-3 sm:px-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                                    isSelected
                                                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 text-[var(--foreground)] shadow-sm ring-1 ring-[var(--brand-pink)]'
                                                        : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:border-[var(--brand-pink)]/40 hover:text-[var(--foreground)]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-sm sm:text-base font-bold ${isSelected ? 'text-[var(--brand-pink)]' : 'text-[var(--foreground)]'}`}>
                                                        {option.label}
                                                    </span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-pink)]" strokeWidth={3} />}
                                                </div>
                                                <span className="text-[11px] sm:text-xs text-[var(--foreground-tertiary)] line-clamp-1 leading-tight">
                                                    {option.sublabel}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Edad y Altura en una sola tarjeta táctil */}
                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xs">
                                {/* Edad */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
                                            2. Tu edad
                                        </span>
                                        <span className="text-2xl font-bold text-[var(--brand-pink)] tabular-nums">
                                            {age} <span className="text-xs font-medium text-[var(--foreground-secondary)]">años</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setAge(prev => Math.max(14, prev - 1))}
                                            className="w-9 h-9 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] flex items-center justify-center text-[var(--foreground)] shrink-0 cursor-pointer"
                                            aria-label="Restar edad"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <input
                                            type="range"
                                            min={14}
                                            max={80}
                                            step={1}
                                            value={age}
                                            onChange={(e) => setAge(Number(e.target.value))}
                                            className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-[var(--brand-pink)] border border-zinc-300 dark:border-zinc-700 shadow-xs"
                                            style={{
                                                background: `linear-gradient(to right, #FF66C4 0%, #FF66C4 ${agePercent}%, #E4E4E7 ${agePercent}%, #E4E4E7 100%)`,
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setAge(prev => Math.min(80, prev + 1))}
                                            className="w-9 h-9 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] flex items-center justify-center text-[var(--foreground)] shrink-0 cursor-pointer"
                                            aria-label="Sumar edad"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {[18, 22, 26, 32, 40].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setAge(preset)}
                                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                                    age === preset
                                                        ? 'bg-[var(--brand-pink)] text-white'
                                                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                                }`}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Altura */}
                                <div className="space-y-3 sm:border-l sm:border-[var(--border-color)]/60 sm:pl-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-1">
                                            <Ruler className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                            3. Tu altura
                                        </span>
                                        <span className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                                            {height} <span className="text-xs font-medium text-[var(--foreground-secondary)]">cm</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setHeight(prev => Math.max(145, prev - 1))}
                                            className="w-9 h-9 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] flex items-center justify-center text-[var(--foreground)] shrink-0 cursor-pointer"
                                            aria-label="Restar altura"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <input
                                            type="range"
                                            min={145}
                                            max={210}
                                            step={1}
                                            value={height}
                                            onChange={(e) => setHeight(Number(e.target.value))}
                                            className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-[var(--brand-pink)] border border-zinc-300 dark:border-zinc-700 shadow-xs"
                                            style={{
                                                background: `linear-gradient(to right, #FF66C4 0%, #FF66C4 ${heightPercent}%, #E4E4E7 ${heightPercent}%, #E4E4E7 100%)`,
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setHeight(prev => Math.min(210, prev + 1))}
                                            className="w-9 h-9 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)] flex items-center justify-center text-[var(--foreground)] shrink-0 cursor-pointer"
                                            aria-label="Sumar altura"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {(gender === 'man' ? [170, 175, 180, 185, 190] : [158, 163, 168, 173, 178]).map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setHeight(preset)}
                                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                                    height === preset
                                                        ? 'bg-[var(--foreground)] text-[var(--background)]'
                                                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                                }`}
                                            >
                                                {preset} cm
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PASO 2 DE 3: SILUETA Y RASGOS OPCIONALES */}
                    {step === 1 && (
                        <motion.div
                            key="step1_silhouette"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.22 }}
                            className="flex flex-col gap-6 pb-6"
                        >
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                                        ¿Cuál es tu silueta?
                                    </h1>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        100% privado
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Así Kloe equilibra tiros de pantalón, caídas y volúmenes ideales.
                                </p>
                                <p className="text-xs text-[var(--foreground-tertiary)] flex items-center gap-1">
                                    Esta información es confidencial y nunca será visible en tu perfil público.
                                </p>
                            </div>

                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {currentBodyOptions.map((opt) => {
                                        const active = bodyType === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setBodyType(opt.id)}
                                                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                    active
                                                        ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--foreground)] shadow-xs ring-1 ring-[var(--brand-pink)]'
                                                        : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--brand-pink)]/40'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold">{opt.label}</div>
                                                    <div className="text-xs text-[var(--foreground-secondary)] mt-0.5 leading-snug">
                                                        {opt.desc}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                                                        active
                                                            ? 'bg-[var(--brand-pink)] border-[var(--brand-pink)] text-white'
                                                            : 'border-[var(--border-color)]'
                                                    }`}
                                                >
                                                    {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Prefiero no decirlo */}
                                <div className="pt-2 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowSkipSilhouetteModal(true)}
                                        className="text-xs sm:text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors underline decoration-dotted underline-offset-4 cursor-pointer py-1 px-3"
                                    >
                                        Prefiero no decirlo
                                    </button>
                                </div>

                                {/* Collapsible Optional Colorimetry */}
                                <div className="pt-2 border-t border-[var(--border-color)]/60">
                                    <button
                                        type="button"
                                        onClick={() => setShowColorimetry(prev => !prev)}
                                        className="w-full flex items-center justify-between py-2 text-xs sm:text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-[var(--brand-pink)]" />
                                            <span>Afinar colorimetría: ojos y pelo (opcional)</span>
                                        </span>
                                        <span className="text-xs text-[var(--brand-pink)] font-bold">
                                            {showColorimetry ? 'Ocultar' : 'Personalizar +'}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {showColorimetry && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pt-3 space-y-4"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                                                        <Eye className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                                        Color de ojos
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {EYE_COLOR_OPTIONS.map((eye) => {
                                                            const active = eyeColor === eye.id;
                                                            return (
                                                                <button
                                                                    key={eye.id}
                                                                    type="button"
                                                                    onClick={() => setEyeColor(eye.id)}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                                                                        active
                                                                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)]'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                                                        style={{ backgroundColor: eye.swatch }}
                                                                    />
                                                                    <span>{eye.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                                                        <Palette className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                                                        Color de pelo
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {HAIR_COLOR_OPTIONS.map((hair) => {
                                                            const active = hairColor === hair.id;
                                                            return (
                                                                <button
                                                                    key={hair.id}
                                                                    type="button"
                                                                    onClick={() => setHairColor(hair.id)}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                                                                        active
                                                                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)]'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                                                        style={{ backgroundColor: hair.swatch }}
                                                                    />
                                                                    <span>{hair.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PASO 3 DE 3: TUS ESTILOS FAVORITOS (PILLS AGRUPADAS + BUSCADOR + ACCESORIOS) */}
                    {step === 2 && (
                        <motion.div
                            key="step2_styles"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.22 }}
                            className="flex flex-col gap-6 pb-8"
                        >
                            {/* Header */}
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                                        Tus estilos favoritos
                                    </h1>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                                        selectedStyles.length > 0
                                            ? 'bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border-[var(--brand-pink)]/30'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] border-[var(--border-color)]'
                                    }`}>
                                        {selectedStyles.length > 0 ? `${selectedStyles.length} seleccionados` : 'Elige al menos 1'}
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Toca los estilos que definen cómo te gusta vestir. Están filtrados según tu enfoque ({gender === 'man' ? 'Chico' : gender === 'woman' ? 'Chica' : 'Unisex'}).
                                </p>
                            </div>

                            {/* Live Search Bar + Gender Filter Toggle */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                                    <input
                                        type="text"
                                        value={styleSearch}
                                        onChange={(e) => setStyleSearch(e.target.value)}
                                        placeholder="Buscar estilos (ej. Streetwear, Old Money, Coquette...)"
                                        className="w-full bg-[var(--card-bg)] text-[var(--foreground)] pl-11 pr-10 py-3 rounded-full border border-[var(--border-color)] focus:border-[var(--brand-pink)] transition-all outline-none text-xs sm:text-sm font-medium shadow-xs"
                                    />
                                    {styleSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setStyleSearch('')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] p-1 rounded-full cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between px-1 text-xs">
                                    <span className="text-[var(--foreground-tertiary)]">
                                        Mostrando {displayedStyles.length} estilos
                                    </span>
                                    {gender !== 'other' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllGenderStyles(prev => !prev)}
                                            className="text-[var(--brand-pink)] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <SlidersHorizontal className="w-3 h-3" />
                                            <span>{showAllGenderStyles ? 'Volver a filtrar por género' : 'Ver todos (sin filtro de género)'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Grouped Pills List */}
                            <div className="space-y-6">
                                {Object.keys(styleCategories).length === 0 ? (
                                    <div className="text-center py-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6">
                                        <p className="text-sm font-semibold text-[var(--foreground-secondary)]">
                                            No se encontró ningún estilo para "{styleSearch}"
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => { setStyleSearch(''); setShowAllGenderStyles(true); }}
                                            className="mt-2 text-xs font-bold text-[var(--brand-pink)] hover:underline cursor-pointer"
                                        >
                                            Limpiar búsqueda y mostrar todos
                                        </button>
                                    </div>
                                ) : (
                                    Object.entries(styleCategories).map(([categoryName, styles]) => {
                                        const selectedInCategory = styles.filter(s => selectedStyles.includes(s.slug || s.id)).length;
                                        return (
                                            <div key={categoryName} className="space-y-2.5">
                                                <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider px-1">
                                                    <span>{categoryName}</span>
                                                    {selectedInCategory > 0 && (
                                                        <span className="text-[11px] font-bold text-[var(--brand-pink)]">
                                                            {selectedInCategory} elegidos
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                                                    {styles.map(style => {
                                                        const key = style.slug || style.id;
                                                        const isSelected = selectedStyles.includes(key) || selectedStyles.includes(style.id);
                                                        return (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                onClick={() => toggleStyle(key)}
                                                                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                                                    isSelected
                                                                        ? 'bg-[var(--brand-pink)] text-white shadow-xs font-bold border border-[var(--brand-pink)]'
                                                                        : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] hover:border-[var(--brand-pink)]/40 hover:bg-[var(--background-secondary)]'
                                                                }`}
                                                            >
                                                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                                <span>{style.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Compact Pill Selector for Accessories (Zero images) */}
                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs mt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
                                        Nivel de accesorios que sueles llevar
                                    </span>
                                    <span className="text-[11px] text-[var(--foreground-tertiary)]">Opcional</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ACCESSORY_OPTIONS.map((opt) => {
                                        const active = selectedAccessory === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setSelectedAccessory(opt.id)}
                                                className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                                                    active
                                                        ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs'
                                                        : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border-[var(--border-color)] hover:text-[var(--foreground)]'
                                                }`}
                                            >
                                                {opt.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Floating Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#FBFBFD] via-[#FBFBFD]/95 to-transparent z-40 pointer-events-none">
                <div className={`max-w-xl mx-auto flex items-center gap-3 sm:gap-4 pointer-events-auto ${step === 0 ? 'justify-center' : 'justify-between'}`}>
                    {step > 0 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-14 sm:w-auto sm:px-6 h-13 rounded-full flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            onClick={() => setStep(prev => prev - 1)}
                            type="button"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Atrás</span>
                        </Button>
                    )}

                    <Button
                        size="lg"
                        className={`h-13 rounded-full text-[15px] font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer ${
                            step === 0 ? 'w-full max-w-sm mx-auto' : 'flex-1 max-w-sm ml-auto'
                        }`}
                        onClick={handleNext}
                        disabled={
                            (step === 0 && (
                                !gender ||
                                !age ||
                                !height ||
                                (needsIdentityInput && (!fullName.trim() || fullName.trim().length < 2 || username.length < 3 || isUsernameAvailable === false || isCheckingUsername))
                            )) ||
                            (step === 2 && selectedStyles.length === 0) ||
                            isSaving
                        }
                        type="button"
                    >
                        {isSaving
                            ? 'Preparando tu armario...'
                            : step === maxStepIndex
                            ? (isFromSettings ? 'Guardar cambios' : 'Entrar a mi armario')
                            : 'Continuar'}
                        {!isSaving && <ChevronRight className="w-4 h-4 ml-1.5" />}
                    </Button>
                </div>
            </div>

            {/* Modal: Aviso al omitir silueta */}
            <AnimatePresence>
                {showSkipSilhouetteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSkipSilhouetteModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 z-10 text-center space-y-4"
                        >
                            <div className="w-14 h-14 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] mx-auto flex items-center justify-center">
                                <AlertCircle className="w-7 h-7 stroke-[2.3]" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                                    ¿Omitir tu silueta?
                                </h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Kloe necesita conocer tu silueta para calcular tiros de pantalón, caídas de tejido y proporciones a tu medida.
                                </p>
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-800 text-left font-medium leading-normal">
                                    ⚠️ Sin esta información, las recomendaciones de outfits de Kloe perderán precisión.
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2.5">
                                <Button
                                    size="lg"
                                    className="w-full h-12 rounded-full font-bold text-sm bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white shadow-lg cursor-pointer"
                                    onClick={() => setShowSkipSilhouetteModal(false)}
                                    type="button"
                                >
                                    Elegir mi silueta
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBodyType('no_specified');
                                        setShowSkipSilhouetteModal(false);
                                        setStep(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-full py-2.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                                >
                                    Omitir de todos modos
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PreferencesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <LogoMark className="animate-pulse opacity-50 w-12 h-12" />
            </div>
        }>
            <PreferencesContent />
        </Suspense>
    );
}
