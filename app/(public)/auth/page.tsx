'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';
import { toast } from 'sonner';
import { showDatabaseError } from '@/lib/errorModal';

export default function AuthPage() {
    const router = useRouter();
    const { signIn, signUp, resetPasswordForEmail } = useAuth();
    const { checkEmailAvailability, checkUsernameAvailability } = useSocial();
    const { user, isLoading } = useUser();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('mode');
    const urlError = searchParams?.get('error');

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
            <div className="relative min-h-screen flex items-center justify-center p-3.5 sm:p-4 bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-10 text-center"
                >
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <Image src="/landing/klozet-nombre-grande.png" alt="Klozet" width={180} height={56} className="w-32 sm:w-40 h-auto object-contain" priority />
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--brand-pink)]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2 sm:mb-3">Revisa tu bandeja</h2>
                    <p className="text-sm sm:text-base text-[var(--foreground-secondary)] mb-4">
                        Te hemos enviado un enlace de confirmación a <strong className="text-[var(--foreground)]">{email}</strong>.
                    </p>
                    <div className="bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-2xl px-4 py-3 mb-5 sm:mb-6 text-left">
                        <p className="text-[var(--foreground)] text-xs font-bold mb-1">¿No lo ves?</p>
                        <p className="text-[var(--foreground-secondary)] text-[11px] sm:text-xs leading-relaxed">
                            Revisa la carpeta de <strong>SPAM o correo no deseado</strong>. A veces los filtros lo mandan ahí.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEmailConfirmPending(false); setIsLogin(true); }}
                        className="text-xs sm:text-sm font-semibold text-[var(--brand-pink)] hover:underline min-h-[44px] flex items-center justify-center mx-auto cursor-pointer"
                    >
                        Ya lo confirmé, iniciar sesión
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-3.5 sm:p-4 py-6 sm:py-10 bg-[var(--background)] overflow-hidden selection:bg-[var(--brand-pink)] selection:text-white transition-colors duration-300">
            {/* Return to Landing Link */}
            <Link
                href="/"
                className="fixed top-3 left-3 sm:top-6 sm:left-6 z-50 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--brand-pink)]/50 transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Inicio</span>
            </Link>

            {/* Clean Apple Auth Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[390px] sm:max-w-[420px] rounded-[28px] sm:rounded-[36px] bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl my-auto"
            >
                <div className="w-full rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 md:p-9 overflow-hidden">
                    <div className="flex justify-center mb-3 sm:mb-5 relative">
                        <Image
                            src="/landing/klozet-nombre-grande.png"
                            alt="Klozet"
                            width={220}
                            height={68}
                            className="block w-36 sm:w-44 h-auto object-contain"
                            priority
                        />
                    </div>

                    {/* Segmented Pill Switcher for Login / Signup */}
                    {!isResetPassword && (
                        <div className="flex p-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] mb-4 sm:mb-5">
                            <button
                                type="button"
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                    isLogin
                                        ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-xs'
                                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                Iniciar sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                    !isLogin
                                        ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-xs'
                                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                Registrarse
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isResetPassword ? (
                            <motion.div
                                key="reset-password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] text-center mb-4 sm:mb-6 tracking-tight">
                                    Recuperar contraseña
                                </h2>

                                {resetSent ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--brand-pink)]" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-5 sm:mb-6">
                                            Hemos enviado un enlace de recuperación a <strong className="text-[var(--foreground)]">{resetEmail}</strong>
                                        </p>
                                        <Button
                                            onClick={() => { setIsResetPassword(false); setResetSent(false); setIsLogin(true); }}
                                            className="w-full h-11 sm:h-12 text-sm font-semibold rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--border-color)] transition-colors"
                                        >
                                            Volver a iniciar sesión
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-4">
                                        <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] text-center mb-3 sm:mb-4">
                                            Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                        </p>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="Correo electrónico"
                                                required
                                                className="w-full pl-11 sm:pl-12 pr-4 h-11 sm:h-12 text-xs sm:text-sm rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] transition-all"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-md disabled:opacity-60"
                                            glow
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enviar enlace'}
                                        </Button>

                                        <div className="mt-3 sm:mt-6 text-center pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetPassword(false)}
                                                className="text-xs sm:text-sm font-bold text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors min-h-[36px] flex items-center justify-center mx-auto cursor-pointer"
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
                                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h2 className="text-base sm:text-xl font-bold text-[var(--foreground)] text-center mb-3 sm:mb-5 tracking-tight">
                                    {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
                                </h2>

                                <form onSubmit={handleEmailAuth} className="space-y-2.5 sm:space-y-3.5">
                                    {!isLogin && (
                                        <>
                                            {/* Nombre completo */}
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Nombre completo"
                                                    aria-label="Nombre completo"
                                                    autoComplete="name"
                                                    required
                                                    className="w-full pl-11 sm:pl-12 pr-4 h-11 sm:h-12 text-xs sm:text-sm rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] transition-all"
                                                />
                                            </div>

                                            {/* Nombre de usuario */}
                                            <div className="relative group">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    placeholder="usuario_unico"
                                                    aria-label="Nombre de usuario"
                                                    autoComplete="username"
                                                    required
                                                    minLength={3}
                                                    className="w-full pl-11 sm:pl-12 pr-10 h-11 sm:h-12 text-xs sm:text-sm rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] transition-all"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {isCheckingUsername && <Loader2 className="w-4 h-4 animate-spin text-[var(--foreground-tertiary)]" />}
                                                    {!isCheckingUsername && isUsernameAvailable === true && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                    {!isCheckingUsername && isUsernameAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Email / usuario */}
                                    <div className="relative group">
                                        {isLogin
                                            ? <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                            : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                        }
                                        <input
                                            type={isLogin ? 'text' : 'email'}
                                            value={isLogin ? emailOrUser : email}
                                            onChange={(e) => isLogin ? setEmailOrUser(e.target.value) : setEmail(e.target.value)}
                                            placeholder={isLogin ? 'Email o @usuario' : 'Correo electrónico'}
                                            aria-label={isLogin ? 'Email o nombre de usuario' : 'Correo electrónico'}
                                            autoComplete={isLogin ? 'username' : 'email'}
                                            required
                                            className="w-full pl-11 sm:pl-12 pr-10 h-11 sm:h-12 text-xs sm:text-sm rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] transition-all"
                                        />
                                        {!isLogin && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {isCheckingEmail && <Loader2 className="w-4 h-4 animate-spin text-[var(--foreground-tertiary)]" />}
                                                {!isCheckingEmail && isEmailAvailable === true && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                {!isCheckingEmail && isEmailAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Contraseña */}
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Contraseña"
                                            aria-label="Contraseña"
                                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                                            required
                                            className="w-full pl-11 sm:pl-12 pr-11 h-11 sm:h-12 text-xs sm:text-sm rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--brand-pink)] transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors p-1.5 rounded-full cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </button>
                                    </div>

                                    {isLogin && (
                                        <div className="text-right pt-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetPassword(true)}
                                                className="text-[11px] sm:text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] transition-colors rounded py-0.5 cursor-pointer"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-md disabled:opacity-60 transition-transform active:scale-[0.99]"
                                        glow
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" /> : (isLogin ? 'Entrar' : 'Continuar')}
                                    </Button>
                                </form>

                                <div className="mt-4 sm:mt-5 flex items-center justify-between">
                                    <span className="w-1/4 border-b border-[var(--border-color)]"></span>
                                    <span className="text-[10px] sm:text-xs text-center text-[var(--foreground-tertiary)] uppercase tracking-wider font-medium">o continuar con</span>
                                    <span className="w-1/4 border-b border-[var(--border-color)]"></span>
                                </div>

                                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        aria-label="Continuar con Google"
                                        className="w-full flex items-center justify-center gap-2.5 h-11 sm:h-12 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border-color)]/40 text-[var(--foreground)] text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 border border-[var(--border-color)] shadow-xs cursor-pointer"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </button>
                                </div>

                                <div className="mt-4 sm:mt-6 text-center pt-0.5">
                                    <p className="text-[11px] sm:text-sm text-[var(--foreground-secondary)]">
                                        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="font-bold text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors ml-1 rounded py-0.5 cursor-pointer"
                                        >
                                            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                                        </button>
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] text-[var(--foreground-tertiary)] mt-2.5 sm:mt-4 max-w-xs mx-auto leading-relaxed">
                                        Al continuar, aceptas nuestros <br className="sm:hidden" />
                                        <Link href="/terms" className="underline hover:text-[var(--foreground)] transition-colors">Términos</Link>, <Link href="/privacy" className="underline hover:text-[var(--foreground)] transition-colors">Privacidad</Link> y <Link href="/cookies" className="underline hover:text-[var(--foreground)] transition-colors">Cookies</Link>.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
