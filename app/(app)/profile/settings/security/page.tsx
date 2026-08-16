'use client';

/**
 * Security Settings Page - Configuración de seguridad
 * Cambio de contraseña y autenticación
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Eye, EyeOff, Shield, Check, AlertCircle } from 'lucide-react';
import { Card, Button } from '@/components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';

export default function SecurityPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Password strength checker
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(newPassword);
    const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

    const handleChangePassword = async () => {
        // Validaciones
        if (!newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Redireccionar después de un momento
            setTimeout(() => {
                router.push('/profile');
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)] px-4 py-3"
            >
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </button>
                    <h1 className="text-lg font-bold text-[var(--foreground)]">Seguridad</h1>
                    <div className="w-20" />
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Cambiar Contraseña */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Cambiar Contraseña
                    </h2>
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-pink)]/10 flex items-center justify-center">
                                <Key className="w-5 h-5 text-[var(--brand-pink)]" />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--foreground)]">Nueva contraseña</div>
                                <div className="text-xs text-[var(--foreground-tertiary)]">
                                    Usa al menos 8 caracteres con letras y números
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {newPassword && (
                                    <div className="mt-3">
                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-[var(--background-tertiary)]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-[var(--foreground-tertiary)]">
                                            Fortaleza: {strengthLabels[passwordStrength - 1] || 'Muy débil'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-tertiary)]" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Validation feedback */}
                                {confirmPassword && (
                                    <div className="mt-2 flex items-center gap-2">
                                        {newPassword === confirmPassword ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="text-xs text-green-500">Las contraseñas coinciden</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                <span className="text-xs text-red-500">Las contraseñas no coinciden</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'error'
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-green-500/10 text-green-500'
                                        }`}
                                >
                                    {message.type === 'error' ? (
                                        <AlertCircle className="w-5 h-5" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                    {message.text}
                                </motion.div>
                            )}

                            {/* Save Button */}
                            <Button
                                onClick={handleChangePassword}
                                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                className="w-full"
                                glow
                            >
                                <Key className="w-5 h-5 mr-2" />
                                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Información de Seguridad */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    Consejos de seguridad
                                </p>
                                <ul className="text-xs text-[var(--foreground-tertiary)] mt-2 space-y-1">
                                    <li>• Usa contraseñas únicas para cada servicio</li>
                                    <li>• Combina letras mayúsculas, minúsculas, números y símbolos</li>
                                    <li>• No compartas tu contraseña con nadie</li>
                                    <li>• Cambia tu contraseña regularmente</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
