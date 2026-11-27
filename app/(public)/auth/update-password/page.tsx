'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { Button, LogoExtended } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const { updatePassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const triggerShake = (msg: string) => {
        setErrorMsg(msg);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        if (password !== confirmPassword) {
            triggerShake('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            triggerShake('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const res = await updatePassword(password);
            if (res.success) {
                setSuccess(true);
            } else {
                triggerShake(res.error || 'Error al actualizar la contraseña');
            }
        } catch (err: any) {
            triggerShake(err?.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ colorScheme: 'light' }} className="relative min-h-screen flex items-center justify-center p-4 bg-white text-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md bg-white border border-black/[0.08] rounded-[32px] shadow-xl p-10 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <LogoExtended size="xl" className="text-[var(--foreground)] drop-shadow-sm" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Contraseña actualizada</h2>
                    <p className="text-[var(--foreground-secondary)] mb-8">
                        Tu contraseña se ha cambiado correctamente. Ya puedes acceder a tu cuenta de forma segura.
                    </p>
                    <Button
                        onClick={() => router.push('/closet')}
                        className="w-full h-12 text-lg font-semibold rounded-xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg shadow-[var(--brand-pink)]/20"
                        glow
                    >
                        Ir al inicio
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ colorScheme: 'light' }} className="relative min-h-screen flex items-center justify-center p-4 bg-white text-black overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-white border border-black/[0.08] rounded-[32px] shadow-xl overflow-hidden"
            >
                <div className="p-8 md:p-10">
                    <div className="flex justify-center mb-12">
                        <LogoExtended size="xl" className="text-[var(--foreground)] drop-shadow-sm" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-2 tracking-tight">
                            Nueva contraseña
                        </h2>
                        <p className="text-sm text-[var(--foreground-secondary)] text-center mb-8">
                            Introduce tu nueva contraseña. Debe tener al menos 6 caracteres.
                        </p>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <motion.div
                                animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                                transition={{ duration: 0.35 }}
                                className="space-y-4"
                            >
                                {/* Nueva Contraseña */}
                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errorMsg ? 'text-rose-500' : 'text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)]'}`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrorMsg('');
                                        }}
                                        placeholder="Nueva contraseña"
                                        required
                                        className={`w-full pl-12 pr-12 h-12 rounded-xl bg-[var(--background-secondary)] border text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none transition-all ${
                                            errorMsg
                                                ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                                                : 'border-[var(--border-color)] focus:border-[#FF66C4]'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Confirmar Contraseña */}
                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errorMsg ? 'text-rose-500' : 'text-[var(--foreground-tertiary)] group-focus-within:text-[var(--foreground)]'}`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setErrorMsg('');
                                        }}
                                        placeholder="Confirmar contraseña"
                                        required
                                        className={`w-full pl-12 pr-12 h-12 rounded-xl bg-[var(--background-secondary)] border text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none transition-all ${
                                            errorMsg
                                                ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                                                : 'border-[var(--border-color)] focus:border-[#FF66C4]'
                                        }`}
                                    />
                                </div>
                            </motion.div>

                            {errorMsg && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-rose-500 font-semibold text-center"
                                >
                                    {errorMsg}
                                </motion.p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-6 text-lg font-semibold rounded-xl bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white shadow-lg shadow-[var(--brand-pink)]/20 disabled:opacity-60"
                                glow
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Actualizar contraseña'}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
