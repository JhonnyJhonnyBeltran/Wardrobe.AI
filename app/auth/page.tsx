'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button, LogoExtended } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';

export default function AuthPage() {
    const router = useRouter();
    const { signIn, signUp } = useAuth();
    const { checkEmailAvailability, checkUsernameAvailability } = useSocial();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('mode');

    const [isLogin, setIsLogin] = useState(mode !== 'signup');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailConfirmPending, setEmailConfirmPending] = useState(false);

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

    if (emailConfirmPending) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[32px] shadow-2xl p-10 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <LogoExtended size="xl" className="text-[var(--foreground)] drop-shadow-sm" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-[var(--brand-pink)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Confirma tu email</h2>
                    <p className="text-[var(--foreground-secondary)] mb-6">
                        Te hemos enviado un email a <strong>{email}</strong>. Haz clic en el enlace para activar tu cuenta.
                    </p>
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

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--background)] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[32px] shadow-2xl overflow-hidden"
            >
                <div className="p-8 md:p-10">
                    <div className="flex justify-center mb-28 pt-12 scale-[4]">
                        <LogoExtended size="xl" className="text-[var(--foreground)] drop-shadow-sm" />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-6 tracking-tight">
                                {isLogin ? 'Bienvenido de nuevo' : 'Únete a KLOZET'}
                            </h2>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {!isLogin && (
                                    <>
                                        {/* Nombre completo */}
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Nombre completo"
                                                required
                                                className="w-full pl-12 pr-4 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                            />
                                        </div>

                                        {/* Nombre de usuario */}
                                        <div className="relative group">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="Nombre de usuario"
                                                required
                                                minLength={3}
                                                className="w-full pl-12 pr-10 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {isCheckingUsername && <Loader2 className="w-4 h-4 animate-spin text-[var(--foreground-tertiary)]" />}
                                                {!isCheckingUsername && isUsernameAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                {!isCheckingUsername && isUsernameAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Email / usuario */}
                                <div className="relative group">
                                    {isLogin
                                        ? <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                        : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                    }
                                    <input
                                        type={isLogin ? 'text' : 'email'}
                                        value={isLogin ? emailOrUser : email}
                                        onChange={(e) => isLogin ? setEmailOrUser(e.target.value) : setEmail(e.target.value)}
                                        placeholder={isLogin ? 'Email o @usuario' : 'Correo electrónico'}
                                        required
                                        className="w-full pl-12 pr-10 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                    />
                                    {!isLogin && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isCheckingEmail && <Loader2 className="w-4 h-4 animate-spin text-[var(--foreground-tertiary)]" />}
                                            {!isCheckingEmail && isEmailAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {!isCheckingEmail && isEmailAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    )}
                                </div>

                                {/* Contraseña */}
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña"
                                        required
                                        className="w-full pl-12 pr-12 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 text-lg font-semibold rounded-xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg shadow-[var(--brand-pink)]/20 disabled:opacity-60"
                                    glow
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Entrar' : 'Registrarse')}
                                </Button>
                            </form>

                            <div className="mt-8 text-center pt-2">
                                <p className="text-sm text-[var(--foreground-secondary)]">
                                    {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="font-bold text-[var(--foreground)] hover:text-[var(--brand-pink)] transition-colors ml-1"
                                    >
                                        {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
