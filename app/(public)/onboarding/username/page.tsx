'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';
import { useSocial } from '@/lib/hooks/useSocial';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { AtSign, ArrowRight, Loader2, User } from 'lucide-react';
import Image from 'next/image';

export default function UsernameOnboardingPage() {
    const router = useRouter();
    const { user, refreshProfile } = useUser();
    const { checkUsernameAvailability } = useSocial();
    
    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // If user already has username, push them forward
        if (user?.username) {
            if (user.styleCompleted) {
                router.replace('/closet');
            } else {
                router.replace('/onboarding/preferences');
            }
        }
    }, [user, router]);

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(val);
        setIsAvailable(null);
        setErrorMsg('');

        if (val.length < 3) {
            if (val.length > 0) setErrorMsg('Mínimo 3 caracteres');
            return;
        }

        setIsChecking(true);
        const available = await checkUsernameAvailability(val);
        setIsChecking(false);
        setIsAvailable(available);

        if (!available) {
            setErrorMsg('Este nombre de usuario ya está en uso');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAvailable || username.length < 3 || !user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            
            // Re-check where they should go
            if (user.styleCompleted) {
                router.push('/closet');
            } else {
                router.push('/onboarding/preferences');
            }
        } catch (error: any) {
            console.error('Error saving username:', error);
            setErrorMsg('Error al guardar. Inténtalo de nuevo.');
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 selection:bg-[var(--brand-pink)] selection:text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--brand-pink)] rounded-full mix-blend-screen filter blur-[100px] opacity-20"
                    animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex justify-center mb-10">
                    <Image src="/klozet-logo.png" alt="Klozet" width={120} height={36} className="dark:hidden block object-contain" />
                    <Image src="/klozet-logo-dark.png" alt="Klozet" width={120} height={36} className="hidden dark:block object-contain" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[var(--card-bg)]/60 backdrop-blur-xl border border-[var(--border-color)]/50 p-8 rounded-3xl shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-[var(--brand-pink)]/10 flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-[var(--brand-pink)]" />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">¡Casi listo!</h1>
                        <p className="text-[var(--foreground-secondary)] text-sm">
                            Elige un nombre de usuario único para identificarte en la comunidad de Klozet.
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-secondary)]" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    placeholder="tu_usuario"
                                    className="w-full bg-[var(--background-secondary)] text-[var(--foreground)] pl-12 pr-12 py-4 rounded-xl border border-[var(--border-color)] focus:border-[var(--brand-pink)] focus:ring-1 focus:ring-[var(--brand-pink)] transition-all outline-none"
                                />
                                {isChecking && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-5 h-5 text-[var(--brand-pink)] animate-spin" />
                                    </div>
                                )}
                                {!isChecking && username.length >= 3 && isAvailable === true && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 font-medium text-sm">
                                        Libre
                                    </div>
                                )}
                            </div>
                            {errorMsg && (
                                <p className="text-red-500 text-sm mt-2 ml-2">{errorMsg}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!isAvailable || username.length < 3 || isSaving}
                            className="w-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink)]/90 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Continuar <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
