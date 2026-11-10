'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    AtSign,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { toast } from 'sonner';
import { showDatabaseError } from '@/lib/errorModal';
import { haptics } from '@/lib/haptic';

interface ShowcaseLook {
    id: string;
    label: string;
    image: string;
    handle: string;
    pieces: string;
    kloeLine: string;
}

const SHOWCASE_LOOKS: ShowcaseLook[] = [
    {
        id: 'casual',
        label: 'Casual',
        image: '/landing/outfits/chica-brown-top-jeans.jpg',
        handle: '@marina',
        pieces: 'Top chocolate · Jeans wide · Cinturón piel',
        kloeLine: 'Básicos que nunca fallan. Menos pensar, más salir.',
    },
    {
        id: 'urbano',
        label: 'Urbano',
        image: '/landing/outfits/chico-denim-sneakers-street.jpg',
        handle: '@hugo',
        pieces: 'Camiseta blanca · Denim recto · Zapatillas',
        kloeLine: 'Corte limpio y zapatillas cómodas. Un 10 rápido.',
    },
    {
        id: 'clasico',
        label: 'Clásico',
        image: '/landing/outfits/chico-henley-pleated.jpg',
        handle: '@lucas',
        pieces: 'Henley blanco · Pantalón pinzas · Mocasín',
        kloeLine: 'Arreglado sin complicarse la mañana.',
    },
    {
        id: 'blanco',
        label: 'Monocromo',
        image: '/landing/outfits/chica-blanco-total-look.jpg',
        handle: '@clara',
        pieces: 'Top crudo · Wide blanco · Bolso ante',
        kloeLine: 'Luz propia hasta un lunes por la mañana.',
    },
];

const KLOE_PLAYFUL_QUIPS = [
    '¿Otra vez delante del armario sin saber qué ponerte? Entra, que lo arreglamos.',
    'Sube tu ropa una vez. Combínala todo el año.',
    'Tu armario tiene más opciones de las que crees.',
    'Cero dramas frente al espejo a las ocho de la mañana.',
];

export default function AuthPage() {
    const router = useRouter();
    const { signIn, signUp, resetPasswordForEmail } = useAuth();
    const { checkEmailAvailability, checkUsernameAvailability } = useSocial();
    const { user, isLoading } = useUser();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('mode');
    const urlError = searchParams?.get('error');

    // Enforce crisp light mode on Login / Auth screen at all times
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
    }, []);

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!isLoading && user) {
            if (user.styleCompleted) {
                router.push('/closet');
            } else {
                router.push('/onboarding/preferences');
            }
        }
    }, [user, isLoading, router]);

    // Show auth errors from callback
    useEffect(() => {
        if (urlError) {
            toast.error(`Error de autenticación: ${urlError}`);
        }
    }, [urlError]);

    const [isLogin, setIsLogin] = useState(mode !== 'signup');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailConfirmPending, setEmailConfirmPending] = useState(false);
    const isSubmittingRef = useRef(false);

    // Personality & Interactive Showcase state
    const [selectedLookIdx, setSelectedLookIdx] = useState(0);
    const [focusedField, setFocusedField] = useState<'none' | 'password' | 'username' | 'email'>('none');
    const [kloeTapCount, setKloeTapCount] = useState(0);
    const [showcaseTouched, setShowcaseTouched] = useState(false);

    // Reset password state
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    // Login fields
    const [emailOrUser, setEmailOrUser] = useState('');

    // Signup fields
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Validation states
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Gentle auto-cycle on showcase until user picks one manually
    useEffect(() => {
        if (showcaseTouched) return;
        const timer = setInterval(() => {
            setSelectedLookIdx((prev) => (prev + 1) % SHOWCASE_LOOKS.length);
        }, 4800);
        return () => clearInterval(timer);
    }, [showcaseTouched]);

    // Debounce email check
    useEffect(() => {
        if (isLogin) return;
        const check = async () => {
            if (!email || !email.includes('@') || email.length < 5) { setIsEmailAvailable(null); return; }
            setIsCheckingEmail(true);
            const available = await checkEmailAvailability(email);
            setIsEmailAvailable(available);
            setIsCheckingEmail(false);
        };
        const t = setTimeout(check, 500);
        return () => clearTimeout(t);
    }, [email, checkEmailAvailability, isLogin]);

    // Debounce username check
    useEffect(() => {
        if (isLogin) return;
        const check = async () => {
            if (!username || username.length < 3) { setIsUsernameAvailable(null); return; }
            setIsCheckingUsername(true);
            const available = await checkUsernameAvailability(username);
            setIsUsernameAvailable(available);
            setIsCheckingUsername(false);
        };
        const t = setTimeout(check, 500);
        return () => clearTimeout(t);
    }, [username, checkUsernameAvailability, isLogin]);

    const activeLook = SHOWCASE_LOOKS[selectedLookIdx] || SHOWCASE_LOOKS[0];

    // Live reactive copy from Kloe depending on user interaction
    const getKloeMessage = (): string => {
        if (isResetPassword) {
            return resetSent
                ? 'Enlace en camino. Revisa también spam por si acaso.'
                : 'Sin dramas, a todos se nos olvida una clave antes del café.';
        }
        if (focusedField === 'password') {
            return 'Prometo no mirar. Tu contraseña queda a salvo.';
        }
        if (!isLogin && username.trim().length >= 3) {
            if (isUsernameAvailable === false) {
                return `@${username} ya tiene dueño... toca elegir otro.`;
            }
            if (isUsernameAvailable === true) {
                return `@${username} suena increíble. Vamos a estrenarlo.`;
            }
        }
        if (kloeTapCount > 0) {
            return KLOE_PLAYFUL_QUIPS[kloeTapCount % KLOE_PLAYFUL_QUIPS.length];
        }
        if (!isLogin) {
            return 'Sube tres prendas en dos minutos. Prometemos no juzgar esa sudadera vieja.';
        }
        if (showcaseTouched) {
            return activeLook.kloeLine;
        }
        return KLOE_PLAYFUL_QUIPS[0];
    };

    const handleKloeTap = () => {
        try { haptics.tap(); } catch {}
        setShowcaseTouched(false);
        setKloeTapCount((c) => c + 1);
    };

    const resolveEmail = async (input: string): Promise<string | null> => {
        const trimmed = input.trim();
        if (trimmed.includes('@') && trimmed.includes('.')) return trimmed;
        const cleanUsername = trimmed.startsWith('@') ? trimmed.substring(1) : trimmed;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase.rpc as any)('get_email_by_username', { username_input: cleanUsername });
            return data || null;
        } catch {
            return null;
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setLoading(true);
        try {
            const res = await resetPasswordForEmail(resetEmail);
            if (res.success) {
                setResetSent(true);
                toast.success('Enlace de recuperación enviado. Revisa tu correo.');
            } else {
                toast.error(res.error || 'Error al enviar enlace de recuperación');
            }
        } catch (err: any) {
            console.error('Reset password error:', err);
            showDatabaseError(err, 'No se pudo enviar el enlace de recuperación.');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setLoading(true);

        try {
            if (isLogin) {
                const input = emailOrUser.trim();
                let emailToUse: string;
                if (input.includes('@') && input.includes('.')) {
                    emailToUse = input;
                } else {
                    const resolved = await resolveEmail(input);
                    if (!resolved) {
                        toast.error('Usuario no encontrado. Intenta con tu email directamente.');
                        return;
                    }
                    emailToUse = resolved;
                }

                const res = await signIn(emailToUse, password);
                if (res.success) {
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    if (authUser) {
                        const { data: prof } = await supabase
                            .from('profiles')
                            .select('style_completed')
                            .eq('id', authUser.id)
                            .maybeSingle();
                        if (prof && prof.style_completed === false) {
                            router.push('/onboarding/preferences');
                            return;
                        }
                    }
                    router.push('/closet');
                } else {
                    const msg = res.error || 'Error al iniciar sesión';
                    if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
                        toast.error('Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
                    } else if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials') || msg.toLowerCase().includes('invalid email')) {
                        toast.error('Email o contraseña incorrectos');
                    } else {
                        showDatabaseError(res.error || msg, msg);
                    }
                }
            } else {
                if (isEmailAvailable === false) { toast.error('El email ya está en uso'); return; }
                if (isUsernameAvailable === false) { toast.error('El nombre de usuario ya está en uso'); return; }
                if (!fullName.trim()) { toast.error('Introduce tu nombre completo'); return; }
                if (!username.trim() || username.length < 3) { toast.error('El nombre de usuario debe tener al menos 3 caracteres'); return; }

                const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
                const res = await signUp(email, password, fullName.trim(), cleanUsername);

                if (res.success) {
                    if (res.hasSession) {
                        router.push('/onboarding/preferences');
                    } else {
                        setEmailConfirmPending(true);
                    }
                } else {
                    showDatabaseError(res.error, res.error || 'Error al crear cuenta');
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            showDatabaseError(err, 'Ha ocurrido un error inesperado al procesar tu cuenta');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleGoogleLogin = async () => {
        if (loading || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                        access_type: 'offline',
                    }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('Google auth error:', err);
            showDatabaseError(err, 'Error al iniciar sesión con Google');
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    if (emailConfirmPending) {
        return (
            <div style={{ colorScheme: 'light' }} className="relative min-h-screen flex items-center justify-center p-4 bg-white text-black antialiased">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="relative z-10 w-full max-w-md bg-white border border-black/[0.08] rounded-[32px] shadow-[0_16px_48px_rgba(0,0,0,0.06)] p-7 sm:p-10 text-center"
                >
                    <div className="flex justify-center mb-5">
                        <Image src="/landing/klozet-nombre-grande.png" alt="Klozet" width={160} height={50} className="w-32 sm:w-38 h-auto object-contain" priority />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-[#FFB3DE]/25 flex items-center justify-center mx-auto mb-4">
                        <Image src="/kloe-avatar.png" alt="Kloe" width={40} height={40} className="object-contain" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 tracking-tight">Revisa tu bandeja</h2>
                    <p className="text-sm sm:text-base text-zinc-600 mb-5 leading-relaxed">
                        Te hemos enviado un enlace de confirmación a <strong className="text-black">{email}</strong>.
                    </p>
                    <div className="bg-[#F5F5F7] border border-black/[0.06] rounded-2xl px-4 py-3.5 mb-6 text-left">
                        <p className="text-black text-xs font-semibold mb-1">¿No lo ves?</p>
                        <p className="text-zinc-600 text-xs leading-relaxed">
                            Echa un ojo en <strong>SPAM o correo no deseado</strong>. A veces los filtros lo mandan ahí.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEmailConfirmPending(false); setIsLogin(true); }}
                        className="w-full h-12 rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] text-white text-sm font-semibold transition-all active:scale-[0.97] cursor-pointer"
                    >
                        Ya lo confirmé, iniciar sesión
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            style={{ colorScheme: 'light' }}
            className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-white text-black overflow-x-hidden selection:bg-[#FF66C4] selection:text-white antialiased"
        >
            {/* Top Return Pill */}
            <Link
                href="/"
                className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] border border-black/[0.06] text-black transition-all flex items-center gap-1.5 active:scale-[0.97]"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Inicio</span>
            </Link>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-12 lg:pt-0 my-auto">
                {/* LEFT COLUMN (Desktop): Visual Outfit Preview + Kloe Toy Companion */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="hidden lg:flex lg:col-span-6 flex-col justify-between bg-[#F5F5F7] border border-black/[0.06] rounded-[32px] p-6 gap-5"
                >
                    {/* Style Filter Pills */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-600 pl-1">
                            Lo que combina hoy
                        </span>
                        <div className="flex items-center gap-1.5">
                            {SHOWCASE_LOOKS.map((look, idx) => {
                                const isActive = idx === selectedLookIdx;
                                return (
                                    <button
                                        key={look.id}
                                        type="button"
                                        onClick={() => {
                                            setShowcaseTouched(true);
                                            setKloeTapCount(0);
                                            setSelectedLookIdx(idx);
                                            try { haptics.selection(); } catch {}
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                                            isActive
                                                ? 'bg-black text-white'
                                                : 'bg-white text-zinc-700 border border-black/[0.06] hover:text-black'
                                        }`}
                                    >
                                        {look.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Full-bleed Street Look Photography Frame */}
                    <div className="relative w-full aspect-[4/4.3] rounded-[24px] overflow-hidden bg-white border border-black/[0.06]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeLook.id}
                                initial={{ opacity: 0.3, scale: 1.02 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0.3 }}
                                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={activeLook.image}
                                    alt={activeLook.pieces}
                                    fill
                                    sizes="(max-width: 1280px) 420px, 480px"
                                    className="object-cover object-top"
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Frosted Apple Pill Overlay */}
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-black/55 backdrop-blur-md text-white">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{activeLook.pieces}</p>
                                <p className="text-[11px] text-white/75 font-medium">{activeLook.handle}</p>
                            </div>
                            <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-[#FF66C4]" />
                        </div>
                    </div>

                    {/* Interactive Kloe Companion Bar ("Un juguete dentro de un iPhone") */}
                    <button
                        type="button"
                        onClick={handleKloeTap}
                        aria-label="Saludar a Kloe"
                        className="w-full text-left bg-white hover:bg-zinc-50/90 border border-black/[0.06] rounded-[24px] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-3.5 transition-colors cursor-pointer group active:scale-[0.99]"
                    >
                        <motion.div
                            key={`${focusedField}-${kloeTapCount}-${selectedLookIdx}`}
                            animate={
                                focusedField === 'password'
                                    ? { rotate: -14, scale: 0.92, y: 2 }
                                    : { rotate: [0, -6, 4, 0], scale: [0.92, 1.06, 1] }
                            }
                            transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                            className="shrink-0 w-11 h-11 rounded-2xl bg-[#FFB3DE]/25 flex items-center justify-center p-1.5"
                        >
                            <Image
                                src="/kloe-avatar.png"
                                alt="Kloe"
                                width={34}
                                height={34}
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-[#ED4C9E] mb-0.5">Kloe dice</p>
                            <p className="text-xs sm:text-[13px] text-zinc-800 font-medium leading-snug">
                                {getKloeMessage()}
                            </p>
                        </div>
                    </button>
                </motion.div>

                {/* RIGHT COLUMN (Mobile full + Desktop card): Clean Apple Auth Card */}
                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="lg:col-span-6 w-full max-w-[420px] mx-auto bg-white border border-black/[0.08] rounded-[32px] shadow-[0_16px_48px_rgba(0,0,0,0.06)] p-6 sm:p-8"
                >
                    {/* Official Klozet Wordmark */}
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/landing/klozet-nombre-grande.png"
                            alt="Klozet"
                            width={180}
                            height={56}
                            className="w-32 sm:w-40 h-auto object-contain"
                            priority
                        />
                    </div>

                    {/* Mobile / Compact Interactive Kloe Greeting */}
                    <button
                        type="button"
                        onClick={handleKloeTap}
                        aria-label="Saludar a Kloe"
                        className="lg:hidden w-full text-left bg-[#F5F5F7] border border-black/[0.05] rounded-2xl px-3.5 py-2.5 mb-5 flex items-center gap-3 transition-transform active:scale-[0.98] cursor-pointer"
                    >
                        <motion.div
                            key={`mob-${focusedField}-${kloeTapCount}`}
                            animate={
                                focusedField === 'password'
                                    ? { rotate: -14, scale: 0.92 }
                                    : { rotate: [0, -6, 4, 0], scale: [0.92, 1.06, 1] }
                            }
                            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                            className="shrink-0 w-9 h-9 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center p-1"
                        >
                            <Image src="/kloe-avatar.png" alt="Kloe" width={28} height={28} className="w-full h-full object-contain" />
                        </motion.div>
                        <p className="text-xs text-zinc-700 font-medium leading-snug flex-1">
                            {getKloeMessage()}
                        </p>
                    </button>

                    {/* Segmented Apple Pill Switcher */}
                    {!isResetPassword && (
                        <div className="relative flex p-1 rounded-full bg-[#F2F2F7] border border-black/[0.04] mb-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(true);
                                    setKloeTapCount(0);
                                }}
                                className={`relative z-10 flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                                    isLogin ? 'text-black' : 'text-zinc-600 hover:text-black'
                                }`}
                            >
                                {isLogin && (
                                    <motion.span
                                        layoutId="auth-mode-pill"
                                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        className="absolute inset-0 bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)] -z-10"
                                    />
                                )}
                                Iniciar sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(false);
                                    setKloeTapCount(0);
                                }}
                                className={`relative z-10 flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                                    !isLogin ? 'text-black' : 'text-zinc-600 hover:text-black'
                                }`}
                            >
                                {!isLogin && (
                                    <motion.span
                                        layoutId="auth-mode-pill"
                                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                        className="absolute inset-0 bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)] -z-10"
                                    />
                                )}
                                Registrarse
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isResetPassword ? (
                            <motion.div
                                key="reset-password"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                            >
                                <h2 className="text-xl font-bold text-black text-center mb-2 tracking-tight">
                                    Recuperar contraseña
                                </h2>

                                {resetSent ? (
                                    <div className="text-center pt-2">
                                        <div className="w-14 h-14 rounded-full bg-[#FFB3DE]/25 flex items-center justify-center mx-auto mb-4">
                                            <Mail className="w-6 h-6 text-[#ED4C9E]" />
                                        </div>
                                        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                                            Hemos enviado un enlace a <strong className="text-black">{resetEmail}</strong>.
                                        </p>
                                        <Button
                                            onClick={() => { setIsResetPassword(false); setResetSent(false); setIsLogin(true); }}
                                            className="w-full h-12 text-sm font-semibold rounded-full bg-[#F2F2F7] text-black hover:bg-[#E5E5EA] transition-colors"
                                        >
                                            Volver a iniciar sesión
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="space-y-3.5">
                                        <p className="text-xs sm:text-sm text-zinc-600 text-center mb-4">
                                            Introduce tu correo y te enviamos un enlace para cambiarla.
                                        </p>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] group-focus-within:text-black transition-colors" />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="Correo electrónico"
                                                required
                                                className="w-full pl-11 pr-4 h-12 text-sm rounded-full bg-[#F2F2F7] focus:bg-white border border-transparent focus:border-[#FF66C4] focus:ring-4 focus:ring-[#FF66C4]/10 text-black placeholder:text-[#636366] focus:outline-none transition-all"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 text-sm sm:text-base font-semibold rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] text-white shadow-sm disabled:opacity-60 transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar enlace'}
                                        </button>

                                        <div className="pt-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetPassword(false)}
                                                className="text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#ED4C9E] transition-colors min-h-[44px] inline-flex items-center justify-center cursor-pointer"
                                            >
                                                Volver atrás
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: isLogin ? -12 : 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 12 : -12 }}
                                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                            >
                                <h1 className="text-lg sm:text-xl font-bold text-black text-center mb-4 tracking-tight">
                                    {isLogin ? 'Tu armario te espera' : 'Abre tu armario digital'}
                                </h1>

                                <form onSubmit={handleEmailAuth} className="space-y-3">
                                    {!isLogin && (
                                        <>
                                            {/* Nombre completo */}
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] group-focus-within:text-black transition-colors" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    onFocus={() => setFocusedField('none')}
                                                    placeholder="Tu nombre"
                                                    aria-label="Nombre completo"
                                                    autoComplete="name"
                                                    required
                                                    className="w-full pl-11 pr-4 h-12 text-sm rounded-full bg-[#F2F2F7] focus:bg-white border border-transparent focus:border-[#FF66C4] focus:ring-4 focus:ring-[#FF66C4]/10 text-black placeholder:text-[#636366] focus:outline-none transition-all"
                                                />
                                            </div>

                                            {/* Nombre de usuario */}
                                            <div className="relative group">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] group-focus-within:text-black transition-colors" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    onFocus={() => setFocusedField('username')}
                                                    onBlur={() => setFocusedField('none')}
                                                    placeholder="tu_usuario"
                                                    aria-label="Nombre de usuario"
                                                    autoComplete="username"
                                                    required
                                                    minLength={3}
                                                    className="w-full pl-11 pr-10 h-12 text-sm rounded-full bg-[#F2F2F7] focus:bg-white border border-transparent focus:border-[#FF66C4] focus:ring-4 focus:ring-[#FF66C4]/10 text-black placeholder:text-[#636366] focus:outline-none transition-all"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {isCheckingUsername && <Loader2 className="w-4 h-4 animate-spin text-[#636366]" />}
                                                    {!isCheckingUsername && isUsernameAvailable === true && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                                    {!isCheckingUsername && isUsernameAvailable === false && <XCircle className="w-4 h-4 text-red-600" />}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Email / usuario */}
                                    <div className="relative group">
                                        {isLogin
                                            ? <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] group-focus-within:text-black transition-colors" />
                                            : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] group-focus-within:text-black transition-colors" />
                                        }
                                        <input
                                            type={isLogin ? 'text' : 'email'}
                                            value={isLogin ? emailOrUser : email}
                                            onChange={(e) => isLogin ? setEmailOrUser(e.target.value) : setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField('none')}
                                            placeholder={isLogin ? 'Email o @usuario' : 'Correo electrónico'}
                                            aria-label={isLogin ? 'Email o nombre de usuario' : 'Correo electrónico'}
                                            autoComplete={isLogin ? 'username' : 'email'}
                                            required
                                            className="w-full pl-11 pr-10 h-12 text-sm rounded-full bg-[#F2F2F7] focus:bg-white border border-transparent focus:border-[#FF66C4] focus:ring-4 focus:ring-[#FF66C4]/10 text-black placeholder:text-[#636366] focus:outline-none transition-all"
                                        />
                                        {!isLogin && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {isCheckingEmail && <Loader2 className="w-4 h-4 animate-spin text-[#636366]" />}
                                                {!isCheckingEmail && isEmailAvailable === true && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                                {!isCheckingEmail && isEmailAvailable === false && <XCircle className="w-4 h-4 text-red-600" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Contraseña */}
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366] group-focus-within:text-black transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField('none')}
                                            placeholder="Contraseña"
                                            aria-label="Contraseña"
                                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                                            required
                                            className="w-full pl-11 pr-12 h-12 text-sm rounded-full bg-[#F2F2F7] focus:bg-white border border-transparent focus:border-[#FF66C4] focus:ring-4 focus:ring-[#FF66C4]/10 text-black placeholder:text-[#636366] focus:outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#636366] hover:text-black transition-colors rounded-full cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {isLogin && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetPassword(true)}
                                                className="text-xs font-semibold text-zinc-600 hover:text-[#ED4C9E] transition-colors py-1 cursor-pointer"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 text-sm sm:text-base font-semibold rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] text-white shadow-[0_6px_20px_rgba(255,102,196,0.28)] disabled:opacity-60 transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar' : 'Continuar')}
                                    </button>
                                </form>

                                <div className="mt-5 flex items-center gap-3">
                                    <span className="flex-1 border-b border-black/[0.08]" />
                                    <span className="text-xs text-zinc-500 font-medium">o entra con</span>
                                    <span className="flex-1 border-b border-black/[0.08]" />
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        aria-label="Continuar con Google"
                                        className="w-full flex items-center justify-center gap-2.5 h-12 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-black text-sm font-semibold transition-colors disabled:opacity-60 border border-black/[0.05] cursor-pointer active:scale-[0.98]"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 shrink-0" aria-hidden="true">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continuar con Google
                                    </button>
                                </div>

                                <div className="mt-5 text-center">
                                    <p className="text-xs sm:text-sm text-zinc-600">
                                        {isLogin ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setKloeTapCount(0);
                                            }}
                                            className="font-semibold text-black hover:text-[#ED4C9E] transition-colors ml-1 py-1 cursor-pointer"
                                        >
                                            {isLogin ? 'Regístrate' : 'Inicia sesión'}
                                        </button>
                                    </p>
                                    <p className="text-[11px] text-zinc-500 mt-3 max-w-xs mx-auto leading-relaxed">
                                        Al continuar, aceptas nuestros{' '}
                                        <Link href="/terms" className="underline hover:text-black transition-colors">Términos</Link>,{' '}
                                        <Link href="/privacy" className="underline hover:text-black transition-colors">Privacidad</Link> y{' '}
                                        <Link href="/cookies" className="underline hover:text-black transition-colors">Cookies</Link>.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
