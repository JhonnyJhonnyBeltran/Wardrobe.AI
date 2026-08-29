'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button, LogoExtended } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/store/userStore';

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
            alert(`Error de autenticación: ${urlError}`);
        }
    }, [urlError]);

    const [isLogin, setIsLogin] = useState(mode !== 'signup');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailConfirmPending, setEmailConfirmPending] = useState(false);
    
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
        setLoading(true);
        try {
            const res = await resetPasswordForEmail(resetEmail);
            if (res.success) {
                setResetSent(true);
            } else {
                alert(res.error || 'Error al enviar enlace de recuperación');
            }
        } catch (err: any) {
            alert(err?.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // If it looks like a username (no @ + .), try resolving; otherwise use directly as email
                const input = emailOrUser.trim();
                let emailToUse: string;
                if (input.includes('@') && input.includes('.')) {
                    emailToUse = input;
                } else {
                    const resolved = await resolveEmail(input);
                    if (!resolved) {
                        alert('Usuario no encontrado. Intenta con tu email directamente.');
                        return;
                    }
                    emailToUse = resolved;
                }

                const res = await signIn(emailToUse, password);
                if (res.success) {
                    router.push('/closet');
                } else {
                    const msg = res.error || 'Error al iniciar sesión';
                    if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
                        alert('Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
                    } else if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials') || msg.toLowerCase().includes('invalid email')) {
                        alert('Email o contraseña incorrectos');
                    } else {
                        alert(msg);
                    }
                }
            } else {
                if (isEmailAvailable === false) { alert('El email ya está en uso'); return; }
                if (isUsernameAvailable === false) { alert('El nombre de usuario ya está en uso'); return; }
                if (!fullName.trim()) { alert('Introduce tu nombre completo'); return; }
                if (!username.trim() || username.length < 3) { alert('El nombre de usuario debe tener al menos 3 caracteres'); return; }

                const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
                const res = await signUp(email, password, fullName.trim(), cleanUsername);

                if (res.success) {
                    if (res.hasSession) {
                    // Email confirmation disabled — user is logged in, go to onboarding
                    router.push('/onboarding/preferences');
                } else {
                    // Email confirmation required
                    setEmailConfirmPending(true);
                }
            } else {
                alert(res.error || 'Error al crear cuenta');
            }
        }
        } catch (err: any) {
            console.error('Auth error:', err);
            alert(err?.message || 'Ha ocurrido un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('Google auth error:', err);
            alert('Error al iniciar sesión con Google');
            setLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('Apple auth error:', err);
            alert('Error al iniciar sesión con Apple');
            setLoading(false);
        }
    };

    if (emailConfirmPending) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[32px] shadow-2xl p-10 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <Image src="/klozet-logo.png" alt="Klozet Logo" width={80} height={80} className="dark:hidden block object-contain drop-shadow-sm" />
                        <Image src="/klozet-logo-dark.png" alt="Klozet Logo Dark" width={80} height={80} className="hidden dark:block object-contain drop-shadow-sm" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-[var(--brand-pink)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Revisa tu bandeja</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Te hemos enviado un enlace de confirmación a <strong className="text-gray-900 dark:text-white">{email}</strong>.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 text-left">
                        <p className="text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">¿No lo ves?</p>
                        <p className="text-amber-700/90 dark:text-amber-400/80 text-xs leading-relaxed">
                            Revisa la carpeta de <strong>SPAM o correo no deseado</strong>. A veces los filtros lo mandan ahí.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEmailConfirmPending(false); setIsLogin(true); }}
                        className="text-sm font-semibold text-[var(--brand-pink)] hover:underline"
                    >
                        Ya lo confirmé, iniciar sesión
                    </button>
                </motion.div>
            </div>
        );
    }

    const AmbientOrb = ({ className, delay, duration = 18 }: { className: string, delay: number, duration?: number }) => (
        <motion.div
            className={`absolute rounded-full filter blur-[110px] pointer-events-none opacity-30 dark:opacity-50 ${className}`}
            animate={{
                x: [0, 50, -40, 0],
                y: [0, -60, 40, 0],
                scale: [1, 1.15, 0.9, 1],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: delay,
                ease: "easeInOut"
            }}
        />
    );

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#09090c] overflow-hidden selection:bg-[var(--brand-pink)] selection:text-white transition-colors duration-300">
            {/* Multi-layered Professional Gradient Mesh */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Radial Glow Centers */}
                <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-[var(--brand-pink)]/15 via-purple-600/10 to-transparent dark:from-[var(--brand-pink)]/25 dark:via-purple-600/15 rounded-full blur-[120px] opacity-70" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-tl from-indigo-600/15 via-[var(--brand-pink)]/10 to-transparent dark:from-indigo-600/20 dark:via-[var(--brand-pink)]/15 rounded-full blur-[130px] opacity-60" />
                <div className="absolute top-[40%] -left-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/15 via-pink-500/10 to-transparent dark:from-violet-600/20 dark:via-pink-500/10 rounded-full blur-[120px] opacity-50" />

                {/* Animated Floating Ambient Orbs */}
                <AmbientOrb className="top-[5%] left-[10%] w-[380px] h-[380px] bg-[var(--brand-pink)]" delay={0} duration={16} />
                <AmbientOrb className="bottom-[10%] right-[15%] w-[450px] h-[450px] bg-gradient-to-tl from-indigo-500 to-purple-600" delay={2} duration={20} />
                <AmbientOrb className="top-[45%] right-[25%] w-[300px] h-[300px] bg-gradient-to-r from-fuchsia-500 to-[var(--brand-pink)]" delay={4} duration={18} />

                {/* Subtle Modern Dot-Matrix Grid Overlay */}
                <div 
                    className="absolute inset-0 opacity-[0.10] dark:opacity-[0.22] mix-blend-multiply dark:mix-blend-plus-lighter"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.3) 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Subtle Vignette */}
                <div className="absolute inset-0 bg-radial from-transparent via-black/5 dark:via-black/30 to-black/10 dark:to-black/80" />
            </div>

            {/* Glassmorphic Auth Card Container with Gradient Border */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md p-[1px] rounded-[36px] bg-gradient-to-b from-gray-200 via-gray-100 to-[var(--brand-pink)]/30 dark:from-white/20 dark:via-white/5 dark:to-[var(--brand-pink)]/25 shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
            >
                <div className="w-full bg-white/95 dark:bg-[#0d0d12]/90 backdrop-blur-3xl rounded-[35px] p-8 md:p-10 border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="flex justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-[var(--brand-pink)]/15 dark:bg-[var(--brand-pink)]/20 rounded-full blur-2xl -z-10 scale-75" />
                        {/* Light Mode Logo (Black Logo on White Background) */}
                        <Image 
                            src="/klozet-logo.png" 
                            alt="Klozet Logo" 
                            width={160} 
                            height={160} 
                            className="dark:hidden block object-contain drop-shadow-md" 
                            priority
                        />
                        {/* Dark Mode Logo (White Logo on Dark Background) */}
                        <Image 
                            src="/klozet-logo-dark.png" 
                            alt="Klozet Logo Dark" 
                            width={160} 
                            height={160} 
                            className="hidden dark:block object-contain drop-shadow-xl" 
                            priority
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {isResetPassword ? (
                            <motion.div
                                key="reset-password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-6 tracking-tight">
                                    Recuperar contraseña
                                </h2>
                                
                                {resetSent ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-4">
                                            <Mail className="w-8 h-8 text-[var(--brand-pink)]" />
                                        </div>
                                        <p className="text-[var(--foreground-secondary)] mb-6">
                                            Hemos enviado un enlace de recuperación a <strong className="text-[var(--foreground)]">{resetEmail}</strong>
                                        </p>
                                        <Button
                                            onClick={() => { setIsResetPassword(false); setResetSent(false); setIsLogin(true); }}
                                            className="w-full text-sm font-semibold rounded-xl bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--border-color)] transition-colors"
                                        >
                                            Volver a iniciar sesión
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <p className="text-sm text-[var(--foreground-secondary)] text-center mb-4">
                                            Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                        </p>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="Correo electrónico"
                                                required
                                                className="w-full pl-12 pr-4 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                            />
                                        </div>
                                        
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 text-lg font-semibold rounded-xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg shadow-[var(--brand-pink)]/20 disabled:opacity-60"
                                            glow
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enviar enlace'}
                                        </Button>

                                        <div className="mt-8 text-center pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetPassword(false)}
                                                className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors"
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
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-6 tracking-tight">
                                    {isLogin ? 'Bienvenido de nuevo' : 'Únete a KLOZET'}
                                </h2>

                                <form onSubmit={handleEmailAuth} className="space-y-4">
                                    {!isLogin && (
                                        <>
                                            {/* Nombre completo */}
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Nombre completo"
                                                    required
                                                    className="w-full pl-12 pr-4 h-12 rounded-xl bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent transition-all"
                                                />
                                            </div>

                                            {/* Nombre de usuario */}
                                            <div className="relative group">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    placeholder="Nombre de usuario"
                                                    required
                                                    minLength={3}
                                                    className="w-full pl-12 pr-10 h-12 rounded-xl bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent transition-all"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {isCheckingUsername && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                                    {!isCheckingUsername && isUsernameAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                    {!isCheckingUsername && isUsernameAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Email / usuario */}
                                    <div className="relative group">
                                        {isLogin
                                            ? <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                            : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                        }
                                        <input
                                            type={isLogin ? 'text' : 'email'}
                                            value={isLogin ? emailOrUser : email}
                                            onChange={(e) => isLogin ? setEmailOrUser(e.target.value) : setEmail(e.target.value)}
                                            placeholder={isLogin ? 'Email o @usuario' : 'Correo electrónico'}
                                            required
                                            className="w-full pl-12 pr-10 h-12 rounded-xl bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent transition-all"
                                        />
                                        {!isLogin && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {isCheckingEmail && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                                {!isCheckingEmail && isEmailAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                {!isCheckingEmail && isEmailAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Contraseña */}
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Contraseña"
                                            required
                                            className="w-full pl-12 pr-12 h-12 rounded-xl bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {isLogin && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => setIsResetPassword(true)}
                                                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[var(--brand-pink)] transition-colors"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 text-lg font-semibold rounded-xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg shadow-[var(--brand-pink)]/20 disabled:opacity-60 transition-transform active:scale-[0.99]"
                                        glow
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Entrar' : 'Registrarse')}
                                    </Button>
                                </form>

                                <div className="mt-6 flex items-center justify-between">
                                    <span className="w-1/5 border-b border-gray-200 dark:border-white/10"></span>
                                    <span className="text-xs text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">o continuar con</span>
                                    <span className="w-1/5 border-b border-gray-200 dark:border-white/10"></span>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-[#16161c] dark:hover:bg-[#1f1f26] text-gray-800 dark:text-gray-100 font-semibold transition-colors disabled:opacity-60 border border-gray-200 dark:border-white/10 shadow-sm"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </button>
                                </div>

                                <div className="mt-8 text-center pt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="font-bold text-gray-900 dark:text-white hover:text-[var(--brand-pink)] transition-colors ml-1"
                                        >
                                            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                                        </button>
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 max-w-xs mx-auto leading-relaxed">
                                        Al continuar, aceptas nuestros <br className="sm:hidden" />
                                        <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Términos de Servicio</Link> y <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Política de Privacidad</Link>.
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
