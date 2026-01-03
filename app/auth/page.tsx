'use client';

/**
 * Auth - Login/Register Page
 * Google, Apple, Email/Password authentication
 * Includes integrated style questionnaire after registration
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, MailCheck } from 'lucide-react';
import { Button, Card, StyleQuizModal } from '@/components';
import type { StyleQuizResponses } from '@/components/StyleQuizModal';
import { useUser } from '@/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('mode');
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [waitingVerification, setWaitingVerification] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Google login error', err);
        }
    };

    const handleAppleLogin = () => {
        // Apple sign-in not configured in Supabase settings here
        console.log('Apple login - not configured');
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (showResetPassword) {
            // TODO: Send reset email
            console.log('Reset password for:', email);
            setShowResetPassword(false);
            return;
        }

        if (isLogin) {
            const res = await signIn(email, password);
            if (res.success) {
                router.push('/closet');
            } else {
                alert(res.error || 'Error al iniciar sesión');
            }
        } else {
            const res = await signUp(email, password, name);
            if (res.success) {
                // Mostrar pantalla de verificación en lugar del quiz
                setWaitingVerification(true);
            } else {
                alert(res.error || 'Error al crear cuenta');
            }
        }
    };

    // Authentication handled by `useAuth`; simulateLogin removed

    const handleQuizComplete = (responses: StyleQuizResponses) => {
        // After signup, style quiz completes — useAuth already updated the store
        setShowQuiz(false);
        router.push('/closet');
    };

    return (
        <>
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
                {waitingVerification ? (
                    /* Pantalla de verificación */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <Card className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-[var(--shadow-float-strong)]"
                            >
                                <MailCheck className="w-10 h-10 text-white" />
                            </motion.div>

                            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                                Revisa tu correo
                            </h2>
                            
                            <p className="text-[var(--foreground-secondary)] mb-2">
                                Te hemos enviado un email a
                            </p>
                            <p className="text-[var(--brand-pink)] font-semibold mb-6">
                                {email}
                            </p>

                            <div className="bg-[var(--background-secondary)] rounded-2xl p-4 mb-6">
                                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                                    Haz clic en el enlace de verificación para activar tu cuenta y comenzar a usar KLOZET
                                </p>
                            </div>

                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-sm text-[var(--foreground-tertiary)] mb-6"
                            >
                                Esperando verificación...
                            </motion.div>

                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setWaitingVerification(false);
                                    setEmail('');
                                    setPassword('');
                                    setName('');
                                }}
                                className="w-full"
                            >
                                Usar otro email
                            </Button>

                            <p className="text-xs text-[var(--foreground-tertiary)] mt-4">
                                ¿No recibiste el email? Revisa tu carpeta de spam
                            </p>
                        </Card>
                    </motion.div>
                ) : (
                    <>
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-[var(--shadow-float-strong)]">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Klozet</h1>
                    <p className="text-sm text-[var(--foreground-tertiary)]">Tu estilista personal</p>
                </motion.div>

                {/* Auth Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full max-w-md"
                >
                    <Card className="p-6">
                        <AnimatePresence mode="wait">
                            {showResetPassword ? (
                                <motion.div
                                    key="reset"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Recuperar contraseña</h2>
                                    <p className="text-sm text-[var(--foreground-tertiary)] mb-6">
                                        Te enviaremos un link para resetearla
                                    </p>

                                    <form onSubmit={handleEmailAuth} className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email"
                                                required
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full" glow>
                                            Enviar link
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={() => setShowResetPassword(false)}
                                            className="w-full text-sm text-[var(--brand-pink)] font-semibold"
                                        >
                                            Volver al login
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="auth"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
                                        {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                                    </h2>

                                    {/* Social Login */}
                                    <div className="space-y-3 mb-6">
                                        <Button
                                            onClick={handleGoogleLogin}
                                            variant="secondary"
                                            className="w-full !bg-white dark:!bg-[#1A1A1A] !text-[#202124] dark:!text-white !border-[#dadce0] dark:!border-[#5f6368] hover:!shadow-lg"
                                        >
                                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Continuar con Google
                                        </Button>

                                        <Button
                                            onClick={handleAppleLogin}
                                            variant="secondary"
                                            className="w-full !bg-black dark:!bg-white !text-white dark:!text-black !border-black dark:!border-white hover:!bg-black/90 dark:hover:!bg-white/90"
                                        >
                                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                            </svg>
                                            Continuar con Apple
                                        </Button>
                                    </div>

                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[var(--border-color)]"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-[var(--card-bg)] text-[var(--foreground-tertiary)]">
                                                o con email
                                            </span>
                                        </div>
                                    </div>


                                    {/* Email/Password Form */}
                                    <form onSubmit={handleEmailAuth} className="space-y-4">
                                        {/* Name field (only for registration) */}
                                        {!isLogin && (
                                            <div className="relative">
                                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Nombre"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                                />
                                            </div>
                                        )}

                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email"
                                                required
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                            />
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Contraseña"
                                                required
                                                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5 text-[var(--foreground-tertiary)]" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-[var(--foreground-tertiary)]" />
                                                )}
                                            </button>
                                        </div>

                                        {isLogin && (
                                            <button
                                                type="button"
                                                onClick={() => setShowResetPassword(true)}
                                                className="text-sm text-[var(--brand-pink)] font-semibold"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        )}

                                        <Button type="submit" className="w-full" glow>
                                            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                                        </Button>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="text-sm text-[var(--foreground-secondary)]"
                                        >
                                            {isLogin ? '¿No tienes cuenta? ' : '¿Tienes cuenta? '}
                                            <span className="text-[var(--brand-pink)] font-semibold">
                                                {isLogin ? 'Regístrate' : 'Inicia sesión'}
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </motion.div>

                <p className="mt-6 text-xs text-[var(--foreground-tertiary)] text-center max-w-md">
                    Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
                </p>
                </>
                )}
            </div>

            {/* Style Quiz Modal - Shows after registration */}
            <StyleQuizModal
                isOpen={showQuiz}
                onClose={() => {
                    setShowQuiz(false);
                    router.push('/');
                }}
                onComplete={handleQuizComplete}
            />
        </>
    );
}
