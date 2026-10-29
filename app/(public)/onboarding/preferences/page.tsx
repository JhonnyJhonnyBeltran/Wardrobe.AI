'use client';

/**
 * Onboarding Preferences Page - Phased Guided Onboarding
 * Step 0: Identity (Name & @username)
 * Step 1: Age Selector
 * Step 2: Gender / Identity Category (Chica, Chico, Unisex)
 * Step 3: "Dinos cómo eres" (Height, Body Type, Eye Color, Hair Color)
 * Step 4: Visual Style Selection (Dynamic gender-based photography)
 * Step 5: Accessories Style
 * Step 6: "Digitaliza tu armario en 15 minutos" (Math Pain Point + Photo/Web Guide + Direct Batch Upload up to 20 items)
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
    Camera,
    Globe,
    Layers,
    Clock,
} from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';
import {
    BODY_TYPES_BY_GENDER,
    EYE_COLOR_OPTIONS,
    HAIR_COLOR_OPTIONS,
} from '@/components/AvatarCalibrationModal';
import Image from 'next/image';

interface StyleItem {
    id: string;
    slug?: string;
    name: string;
    image_url?: string;
    image_url_woman?: string;
    image_url_man?: string;
}

interface AccessoryOption {
    id: string;
    name: string;
    sublabel: string;
    image_woman: string;
    image_man: string;
    image_unisex: string;
}

const ACCESSORY_OPTIONS: AccessoryOption[] = [
    {
        id: 'minimalista',
        name: 'Minimalista',
        sublabel: 'Sutil, discreto y funcional (reloj fino, anillos sutiles o cadenas finas)',
        image_woman: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
        image_man: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        image_unisex: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    },
    {
        id: 'clasico',
        name: 'Clásico / Elegante',
        sublabel: 'Atemporal y refinado (joyería clásica, reloj de piel, perlas o acero)',
        image_woman: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        image_man: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        image_unisex: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    },
    {
        id: 'llamativo',
        name: 'Statement / Llamativo',
        sublabel: 'Piezas protagonistas con presencia, volumen y brillo destacado',
        image_woman: 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=800&q=80',
        image_man: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
        image_unisex: 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=800&q=80',
    },
    {
        id: 'urbano',
        name: 'Urbano / Streetwear',
        sublabel: 'Cadenas, gorras, gafas de sol y complementos de tendencia urbana',
        image_woman: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        image_man: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
        image_unisex: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
    },
    {
        id: 'ninguno',
        name: 'Sin accesorios',
        sublabel: 'Prefiero vestir looks limpios sin complementos adicionales',
        image_woman: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
        image_man: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
        image_unisex: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
    },
];

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
        name: 'Old Money / Clásico',
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
        label: 'Chica',
        sublabel: 'Moda, cortes y proporciones femeninas',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    },
    {
        value: 'man',
        label: 'Chico',
        sublabel: 'Moda, cortes y proporciones masculinas',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
    {
        value: 'other',
        label: 'Unisex / Mixto',
        sublabel: 'Inspiración diversa y combinada',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    },
];

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

function PreferencesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromSource = searchParams?.get('from');
    const isFromSettings = fromSource === 'settings' || fromSource === 'profile';
    const isEditModeQuery = searchParams?.get('mode') === 'edit';

    const { user, setUser, isLoading: isLoadingUser } = useUser();
    const { checkUsernameAvailability } = useSocial();

    // Step 0: Identity state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [usernameError, setUsernameError] = useState('');

    // Steps 1 to 6: Core state
    const [step, setStep] = useState(0);
    const [age, setAge] = useState<number>(24);
    const [gender, setGender] = useState<'woman' | 'man' | 'other' | ''>('');

    // Step 3: "Dinos cómo eres" (Physical Profile)
    const [height, setHeight] = useState<number>(170);
    const [bodyType, setBodyType] = useState<string>('reloj_de_arena');
    const [eyeColor, setEyeColor] = useState<string>('marron_oscuro');
    const [hairColor, setHairColor] = useState<string>('castano_oscuro');

    // Step 4 & 5: Styles & Accessories
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [selectedAccessory, setSelectedAccessory] = useState<string>('minimalista');

    // DB state
    const [dbStyles, setDbStyles] = useState<StyleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const totalSteps = isFromSettings ? 6 : 7;
    const maxStepIndex = totalSteps - 1;

    useEffect(() => {
        if (isLoadingUser) return;

        if (!user) {
            router.push('/auth');
            return;
        }

        if (user.name) {
            setFullName(prev => prev || user.name);
        }
        if (user.username && !user.username.startsWith('user_')) {
            setUsername(prev => prev || user.username!);
            setIsUsernameAvailable(true);
        }

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
            if (user.gender) setGender(prev => prev || user.gender!);
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
        if (!validIds.includes(bodyType)) {
            setBodyType(currentBodyOptions[0].id);
        }
        // Adjust default height when selecting gender if untouched
        if (!user?.height && height === 170) {
            if (gender === 'woman') setHeight(165);
            else if (gender === 'man') setHeight(178);
        }
    }, [gender, currentBodyOptions]);

    const handleUsernameChange = async (rawVal: string) => {
        const clean = rawVal.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(clean);
        setIsUsernameAvailable(null);
        setUsernameError('');

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

    const availableStyles = useMemo(() => {
        if (!dbStyles || dbStyles.length === 0) return COMPREHENSIVE_STYLES;

        const dbMap = new Map(dbStyles.map(s => [s.slug || s.id, s]));
        const merged: StyleItem[] = [];

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

    const getStyleImage = (style: StyleItem, idx: number) => {
        if (gender === 'man') {
            return style.image_url_man || style.image_url || style.image_url_woman || '';
        }
        if (gender === 'woman') {
            return style.image_url_woman || style.image_url || style.image_url_man || '';
        }
        return idx % 2 === 0
            ? (style.image_url_woman || style.image_url || style.image_url_man || '')
            : (style.image_url_man || style.image_url || style.image_url_woman || '');
    };

    const getAccessoryImage = (option: AccessoryOption) => {
        if (gender === 'man') return option.image_man;
        if (gender === 'woman') return option.image_woman;
        return option.image_unisex;
    };

    const handleNext = () => {
        if (step === 0) {
            if (!fullName.trim() || fullName.trim().length < 2) return;
            if (username.length < 3 || isUsernameAvailable === false || isCheckingUsername) return;
        }
        if (step === 1 && !age) return;
        if (step === 2 && !gender) return;
        if (step === 3 && (!height || !bodyType || !eyeColor || !hairColor)) return;
        if (step === 4 && selectedStyles.length === 0) return;
        if (step === 5 && !selectedAccessory) return;

        if (step < maxStepIndex) {
            setStep(prev => prev + 1);
        } else {
            handleComplete(false);
        }
    };

    const handleComplete = async (openUploaderImmediately: boolean = false) => {
        if (!user) return;
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

            let payload: Record<string, any> = {
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

            // Resilient fallback if optional columns do not exist in remote DB
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

            if (openUploaderImmediately) {
                router.push('/closet?action=new-item&startTour=true');
                return;
            }

            const isTourCompleted = typeof window !== 'undefined' && user?.id && localStorage.getItem(`klozet_tour_completed_${user.id}`) === 'true';
            if (isEditing || isFromSettings || isEditModeQuery || user.styleCompleted || isTourCompleted) {
                if (isFromSettings) {
                    router.push('/profile/settings');
                } else {
                    router.push('/closet');
                }
            } else {
                router.push('/closet?startTour=true');
            }
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
            {/* Minimal Header with Step Indicators */}
            <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]/30">
                <div className="flex gap-1.5 sm:gap-2 items-center">
                    {Array.from({ length: totalSteps }).map((_, s) => (
                        <div
                            key={s}
                            className={`h-1.5 w-5 sm:w-8 rounded-full transition-all duration-300 ${step >= s ? 'bg-[var(--brand-pink)]' : 'bg-[var(--border-color)]'}`}
                        />
                    ))}
                </div>
                {isEditing ? (
                    <button
                        onClick={() => router.push(isFromSettings ? '/profile/settings' : '/closet')}
                        className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <span className="text-xs font-semibold text-[var(--foreground-tertiary)]">
                        Paso {step + 1} de {totalSteps}
                    </span>
                )}
            </header>

            <main className="flex-1 px-4 sm:px-6 max-w-2xl mx-auto w-full pt-6 md:pt-10 relative">
                <AnimatePresence mode="wait">
                    {/* STEP 0: IDENTITY / NAME & USERNAME */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6 md:gap-8"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                    ¿Cómo te llamas?
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Elige tu nombre y un @usuario único para que tus amigos y la comunidad te reconozcan.
                                </p>
                            </div>

                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] block">
                                        Tu nombre o alias
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Ej. Ethan"
                                            maxLength={50}
                                            autoFocus
                                            className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border border-[var(--border-color)] focus:border-[var(--brand-pink)] focus:ring-1 focus:ring-[var(--brand-pink)] transition-all outline-none text-sm sm:text-base font-medium placeholder:text-[var(--foreground-tertiary)]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)] block">
                                        Nombre de usuario único (@handle)
                                    </label>
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => handleUsernameChange(e.target.value)}
                                            placeholder="tu_usuario"
                                            maxLength={30}
                                            className={`w-full bg-[var(--background-secondary)] text-[var(--foreground)] pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl border transition-all outline-none text-sm sm:text-base font-medium placeholder:text-[var(--foreground-tertiary)] ${
                                                usernameError
                                                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                    : isUsernameAvailable === true
                                                    ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                                    : 'border-[var(--border-color)] focus:border-[var(--brand-pink)] focus:ring-1 focus:ring-[var(--brand-pink)]'
                                            }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                            {isCheckingUsername && (
                                                <Loader2 className="w-4 h-4 text-[var(--brand-pink)] animate-spin" />
                                            )}
                                            {!isCheckingUsername && isUsernameAvailable === true && username.length >= 3 && (
                                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                    Libre
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {usernameError ? (
                                        <p className="text-xs text-red-500 font-medium ml-1">{usernameError}</p>
                                    ) : (
                                        <p className="text-xs text-[var(--foreground-tertiary)] ml-1">
                                            Solo letras, números y guiones bajos (mínimo 3 caracteres).
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: AGE SLIDER */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
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

                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-sm">
                                <div className="text-center space-y-1">
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-6xl sm:text-7xl font-bold tracking-tight text-[var(--brand-pink)] tabular-nums font-display">
                                            {age}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-semibold text-[var(--foreground-secondary)]">
                                            años
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-[var(--foreground-tertiary)]">
                                        {getAgeLabel(age)}
                                    </p>
                                </div>

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

                    {/* STEP 2: GENDER / PREFERENCE CATEGORY */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6 md:gap-8"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                    ¿Eres chica o chico?
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Selecciona el enfoque de prendas, cortes y proporciones para tu armario y para Kloe.
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
                                                setGender(option.value as 'woman' | 'man' | 'other');
                                                setTimeout(() => setStep(3), 220);
                                            }}
                                            className={`relative w-full h-24 sm:h-32 rounded-2xl overflow-hidden text-left transition-all duration-200 group cursor-pointer ${
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
                                            <div className="absolute inset-0 bg-black/55" />

                                            <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-between z-10">
                                                <div className="space-y-0.5 sm:space-y-1">
                                                    <span className="text-white text-lg sm:text-2xl font-bold tracking-wide block">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-white/80 text-xs sm:text-sm block">
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

                    {/* STEP 3: "DINOS CÓMO ERES" (PHYSICAL PROFILE) */}
                    {step === 3 && (
                        <motion.div
                            key="step3_physical"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6 pb-6"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-semibold">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Perfil físico para Kloe · Sin fotos faciales</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                    Dinos cómo eres
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Kloe utiliza tu altura, silueta y rasgos para recomendarte los cortes, tiros y colores que mejor te sientan. Podrás editarlo siempre desde Ajustes.
                                </p>
                            </div>

                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-7 space-y-6 shadow-sm">
                                {/* 1. Altura */}
                                <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                                            <Ruler className="w-4 h-4 text-[var(--brand-pink)]" />
                                            Tu altura
                                        </span>
                                        <span className="text-2xl font-bold text-[var(--foreground)] font-display tabular-nums">
                                            {height} <span className="text-xs font-normal text-[var(--foreground-secondary)]">cm</span>
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={145}
                                        max={210}
                                        step={1}
                                        value={height}
                                        onChange={(e) => setHeight(Number(e.target.value))}
                                        className="w-full accent-[var(--brand-pink)] cursor-pointer h-2.5 rounded-lg"
                                    />
                                    <div className="flex justify-between text-[11px] text-[var(--foreground-tertiary)] mt-1.5">
                                        <span>145 cm</span>
                                        <span>175 cm</span>
                                        <span>210 cm</span>
                                    </div>
                                </div>

                                {/* 2. Tipo de cuerpo adaptado a Chica / Chico */}
                                <div className="space-y-2.5">
                                    <label className="block text-xs font-semibold text-[var(--foreground-secondary)]">
                                        Tu tipo de cuerpo ({gender === 'man' ? 'Chico' : gender === 'other' ? 'Unisex' : 'Chica'})
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {currentBodyOptions.map((opt) => {
                                            const active = bodyType === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setBodyType(opt.id)}
                                                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                                        active
                                                            ? 'bg-[var(--brand-pink)]/10 border-[var(--brand-pink)] text-[var(--foreground)] shadow-sm'
                                                            : 'bg-[var(--background-secondary)] border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--foreground-tertiary)]'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold">{opt.label}</div>
                                                        <div className="text-[11px] text-[var(--foreground-secondary)] mt-0.5 leading-snug">
                                                            {opt.desc}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                                            active
                                                                ? 'bg-[var(--brand-pink)] border-[var(--brand-pink)] text-white'
                                                                : 'border-[var(--border-color)]'
                                                        }`}
                                                    >
                                                        {active && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Color de ojos */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-[var(--brand-pink)]" />
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
                                                    className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                                                        active
                                                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-sm'
                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--foreground-tertiary)]'
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

                                {/* 4. Color de pelo */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-semibold text-[var(--foreground-secondary)] flex items-center gap-1.5">
                                        <Palette className="w-4 h-4 text-[var(--brand-pink)]" />
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
                                                    className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                                                        active
                                                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-sm'
                                                            : 'bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)] hover:border-[var(--foreground-tertiary)]'
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
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: EXPANDED STYLES GRID */}
                    {step === 4 && (
                        <motion.div
                            key="step4_styles"
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
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                                        selectedStyles.length > 0
                                            ? 'bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] border-[var(--brand-pink)]/30'
                                            : 'bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] border-[var(--border-color)]'
                                    }`}>
                                        {selectedStyles.length > 0 ? `${selectedStyles.length} seleccionados` : 'Elige al menos 1'}
                                    </span>
                                </div>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Elige los estilos que mejor representen cómo te gusta vestir (selección obligatoria).
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 pb-4">
                                {availableStyles.map((style, idx) => {
                                    const styleKey = style.slug || style.id;
                                    const isSelected = selectedStyles.includes(styleKey) || selectedStyles.includes(style.id);
                                    const imageUrl = getStyleImage(style, idx);

                                    return (
                                        <button
                                            key={styleKey}
                                            type="button"
                                            onClick={() => toggleStyle(styleKey)}
                                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden group focus:outline-none transition-all duration-200 text-left cursor-pointer ${
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

                                            <div className="absolute inset-0 bg-black/45 z-10" />

                                            {isSelected && (
                                                <div className="absolute inset-0 bg-[var(--brand-pink)]/25 z-20 transition-opacity" />
                                            )}

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

                                            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3.5 z-30">
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

                    {/* STEP 5: ACCESSORIES STYLE SELECTION */}
                    {step === 5 && (
                        <motion.div
                            key="step5_accessories"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                                    ¿Qué tipo de accesorios sueles llevar?
                                </h1>
                                <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
                                    Personalizamos cómo completamos tus looks, recomendaciones y complementos.
                                </p>
                            </div>

                            <div className="grid gap-2.5 sm:gap-4 mt-1 pb-4">
                                {ACCESSORY_OPTIONS.map((option) => {
                                    const isSelected = selectedAccessory === option.id;
                                    const imageSrc = getAccessoryImage(option);

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setSelectedAccessory(option.id)}
                                            className={`relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden text-left transition-all duration-200 group cursor-pointer ${
                                                isSelected
                                                    ? 'ring-3 ring-[var(--brand-pink)] scale-[0.99] shadow-lg'
                                                    : 'border border-[var(--border-color)] hover:border-[var(--brand-pink)]/50 active:scale-[0.98]'
                                            }`}
                                        >
                                            <Image
                                                src={imageSrc}
                                                alt={option.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/60" />

                                            <div className="absolute inset-0 p-4 sm:p-5 flex items-center justify-between z-10">
                                                <div className="space-y-0.5 sm:space-y-1 max-w-[80%]">
                                                    <span className="text-white text-base sm:text-xl font-bold tracking-wide block">
                                                        {option.name}
                                                    </span>
                                                    <span className="text-white/80 text-[11px] sm:text-sm block line-clamp-2">
                                                        {option.sublabel}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
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

                    {/* STEP 6: PHASED ACTION - MATH PAIN POINT + PHOTO/WEB GUIDE + DIRECT UPLOAD UP TO 20 ITEMS */}
                    {step === 6 && (
                        <motion.div
                            key="step6_upload_guide"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-5 pb-8"
                        >
                            {/* Mathematical Pain Point Banner */}
                            <div className="bg-[var(--foreground)] text-[var(--background)] rounded-[2rem] p-6 sm:p-7 shadow-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-pink)] text-white text-xs font-bold mb-3">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>El cálculo que cambia tus mañanas</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                                    15 minutos hoy te ahorran <span className="text-[var(--brand-pink)]">91 horas al año</span>
                                </h1>
                                <p className="text-xs sm:text-sm opacity-80 mt-2.5 leading-relaxed">
                                    Pasamos una media de <strong>15 minutos cada mañana</strong> frente al armario sin saber qué ponernos. Al cabo del año son <strong>5.475 minutos perdidos</strong> (más de <strong>91 horas</strong> o casi <strong>4 días enteros</strong> frente al espejo).
                                </p>

                                <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/15 dark:border-black/15 text-center">
                                    <div className="p-2.5 rounded-2xl bg-white/10 dark:bg-black/10">
                                        <div className="text-xl sm:text-2xl font-bold font-display text-[var(--brand-pink)]">15 min</div>
                                        <div className="text-[11px] opacity-75">Subir tu ropa hoy</div>
                                    </div>
                                    <div className="p-2.5 rounded-2xl bg-white/10 dark:bg-black/10">
                                        <div className="text-xl sm:text-2xl font-bold font-display">5.475 m</div>
                                        <div className="text-[11px] opacity-75">Ahorrados al año</div>
                                    </div>
                                    <div className="p-2.5 rounded-2xl bg-white/10 dark:bg-black/10">
                                        <div className="text-xl sm:text-2xl font-bold font-display text-emerald-400 dark:text-emerald-600">+91 h</div>
                                        <div className="text-[11px] opacity-75">Casi 4 días libres</div>
                                    </div>
                                </div>
                            </div>

                            {/* How to upload in 3 simple ways */}
                            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-5 sm:p-6 space-y-4 shadow-sm">
                                <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                                    ¿Cómo subir tus prendas en segundos?
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                        <div className="w-10 h-10 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[var(--foreground)]">
                                                1. Haz fotos rápidas a tu ropa
                                            </h3>
                                            <p className="text-xs text-[var(--foreground-secondary)] mt-0.5 leading-relaxed">
                                                Extiende la prenda sobre la cama o en una percha con luz natural. Nosotros borramos el fondo y detectamos categoría, color y estación automáticamente.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                        <div className="w-10 h-10 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[var(--foreground)]">
                                                2. O coge fotos y capturas de webs
                                            </h3>
                                            <p className="text-xs text-[var(--foreground-secondary)] mt-0.5 leading-relaxed">
                                                ¿No te apetece sacar la ropa del armario? Guarda la foto de la web donde la compraste (Zara, Mango, Bershka, Pull&Bear, Nike, Eme Studios...) y súbela tal cual.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                        <div className="w-10 h-10 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[var(--foreground)]">
                                                3. Sube hasta 20 prendas de golpe (armario ilimitado)
                                            </h3>
                                            <p className="text-xs text-[var(--foreground-secondary)] mt-0.5 leading-relaxed">
                                                Selecciona hasta <strong>20 fotos a la vez</strong> desde tu galería. Sin límite total de prendas en tu armario.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct Action CTAs */}
                                <div className="pt-2 space-y-2.5">
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => handleComplete(true)}
                                        className="w-full py-4 px-6 rounded-full bg-[var(--brand-pink)] text-white font-bold text-sm sm:text-base hover:opacity-95 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>{isSaving ? 'Preparando tu armario...' : 'Subir mis primeras prendas ahora (hasta 20)'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => handleComplete(false)}
                                        className="w-full py-3 px-6 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                                    >
                                        Ir a mi armario y subir luego
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Floating Navigation (Hidden on Step 6 because Step 6 has its own primary dual CTAs) */}
            {step < 6 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent z-40 pointer-events-none">
                    <div className="max-w-xl mx-auto flex justify-between gap-3 sm:gap-4 pointer-events-auto">
                        {step > 0 && (
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-14 sm:w-auto sm:px-6 h-13 rounded-full flex items-center justify-center gap-2"
                                onClick={() => setStep(prev => prev - 1)}
                                type="button"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Atrás</span>
                            </Button>
                        )}

                        <Button
                            size="lg"
                            className="flex-1 h-13 rounded-full text-[15px] font-semibold max-w-sm ml-auto disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={handleNext}
                            disabled={
                                (step === 0 && (!fullName.trim() || fullName.trim().length < 2 || username.length < 3 || isUsernameAvailable === false || isCheckingUsername)) ||
                                (step === 1 && !age) ||
                                (step === 2 && !gender) ||
                                (step === 3 && (!height || !bodyType || !eyeColor || !hairColor)) ||
                                (step === 4 && selectedStyles.length === 0) ||
                                (step === 5 && !selectedAccessory) ||
                                isSaving
                            }
                            type="button"
                        >
                            {isSaving
                                ? 'Guardando...'
                                : step === maxStepIndex
                                ? 'Guardar cambios'
                                : 'Continuar'}
                            {step < maxStepIndex && !isSaving && <ChevronRight className="w-4 h-4 ml-1.5" />}
                        </Button>
                    </div>
                </div>
            )}
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
