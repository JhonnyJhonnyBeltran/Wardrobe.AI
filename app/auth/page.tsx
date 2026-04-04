'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button, LogoExtended } from '@/components'; // Usamos solo LogoExtended para limpieza
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';

export default function AuthPage() {
    const router = useRouter();
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const { checkEmailAvailability } = useSocial();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('mode');

    // States
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [emailOrUser, setEmailOrUser] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Validation States
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    // Debounce Checks for Email
    useEffect(() => {
        if (isLogin) return;
        const checkEmail = async () => {
            if (!email || !email.includes('@') || email.length < 5) { setIsEmailAvailable(null); return; }
            setIsCheckingEmail(true);
            const available = await checkEmailAvailability(email);
            setIsEmailAvailable(available);
            setIsCheckingEmail(false);
        };
        const timeoutId = setTimeout(checkEmail, 500);
        return () => clearTimeout(timeoutId);
    }, [email, checkEmailAvailability, isLogin]);


    // Handlers
    const handleGoogleLogin = async () => {
        try { await signInWithGoogle(); } catch (err) { console.error('Google login error', err); }
    };

    const resolveEmail = async (input: string): Promise<string | null> => {
        if (input.includes('@') && input.includes('.')) return input;
        const cleanUsername = input.startsWith('@') ? input.substring(1) : input;
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', cleanUsername).single();
        if (!profile) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: user } = await supabase.from('users' as any).select('email').eq('id', (profile as any).id).single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (user as any)?.email || null;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            const resolvedEmail = await resolveEmail(emailOrUser);
            if (!resolvedEmail) { alert('Usuario o email no encontrado'); return; }
            const res = await signIn(resolvedEmail, password);
            if (res.success) router.push('/closet');
            else alert(res.error || 'Error al iniciar sesión');
        } else {
            if (isEmailAvailable === false) return alert('El email ya está registrado');
            if (!name) return alert('Elige un nombre');

            // Autogenerate username
            const generatedUsername = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(Math.random() * 10000)}`;

            const res = await signUp(email, password, name, generatedUsername);
            if (res.success) router.push('/onboarding/preferences');
            else alert(res.error || 'Error al crear cuenta');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--background)] overflow-hidden">

            {/* Solid Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[32px] shadow-2xl overflow-hidden"
            >
                <div className="p-8 md:p-10">
                    {/* Logo Section */}
                    <div className="flex justify-center mb-10 pt-2 scale-110">
                        {/* Adapt Logo automatically to theme by not forcing text-white */}
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

                            {/* Social Login */}
                            <div className="space-y-3 mb-6">
                                <Button
                                    onClick={handleGoogleLogin}
                                    variant="outline"
                                    className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] h-12 rounded-xl font-medium border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continuar con Google
                                </Button>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--border-color)]"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest text-[var(--foreground-secondary)]">
                                    <span className="px-2 bg-[var(--card-bg)]">o correo electrónico</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {!isLogin && (
                                    <>
                                        <div className="relative group">
                                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nombre completo"
                                                required
                                                className="w-full pl-12 pr-4 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)] group-focus-within:text-[var(--brand-pink)] transition-colors" />
                                    <input
                                        type={isLogin ? "text" : "email"}
                                        value={isLogin ? emailOrUser : email}
                                        onChange={(e) => isLogin ? setEmailOrUser(e.target.value) : setEmail(e.target.value)}
                                        placeholder={isLogin ? "Email o @usuario" : "Correo electrónico"}
                                        required
                                        className="w-full pl-12 pr-4 h-12 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)] transition-all"
                                    />
                                    {!isLogin && isCheckingEmail && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />}
                                </div>

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
                                    className="w-full h-12 text-lg font-semibold rounded-xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg shadow-[var(--brand-pink)]/20"
                                    glow
                                >
                                    {isLogin ? 'Entrar' : 'Registrarse'}
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
