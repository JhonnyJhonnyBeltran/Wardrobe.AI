'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings2, ShieldCheck, Check, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface CookiePreferences {
    technical: boolean; // Always true
    preferences: boolean;
    analytics: boolean;
    timestamp: string;
}

const STORAGE_KEY = 'klozet_cookie_consent_v1';

export default function CookiesBanner() {
    const [mounted, setMounted] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Cookie preferences state
    const [prefSettings, setPrefSettings] = useState({
        technical: true,
        preferences: true,
        analytics: false,
    });

    useEffect(() => {
        setMounted(true);
        try {
            const consent = localStorage.getItem(STORAGE_KEY);
            if (!consent) {
                // Short delay so it doesn't pop aggressively on first frame
                const timer = setTimeout(() => setShowBanner(true), 600);
                return () => clearTimeout(timer);
            }
        } catch {
            // LocalStorage might be restricted
            setShowBanner(false);
        }
    }, []);

    const saveConsent = async (prefs: { technical: boolean; preferences: boolean; analytics: boolean }) => {
        const payload: CookiePreferences = {
            ...prefs,
            technical: true, // Always required
            timestamp: new Date().toISOString(),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error('Error saving cookie consent locally:', e);
        }

        // Also persist to Supabase profiles if user is authenticated
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('notification_preferences')
                    .eq('id', session.user.id)
                    .maybeSingle();

                const existingPrefs = (currentProfile as any)?.notification_preferences || {};
                await supabase
                    .from('profiles')
                    .update({
                        notification_preferences: {
                            ...existingPrefs,
                            cookie_consent: payload,
                        }
                    } as any)
                    .eq('id', session.user.id);
            }
        } catch (e) {
            console.warn('[CookiesBanner] Non-critical error saving consent to DB:', e);
        }

        setShowBanner(false);
        setShowModal(false);
    };

    const handleAcceptAll = () => {
        saveConsent({ technical: true, preferences: true, analytics: true });
    };

    const handleRejectAll = () => {
        saveConsent({ technical: true, preferences: false, analytics: false });
    };

    const handleSaveCustom = () => {
        saveConsent(prefSettings);
    };

    if (!mounted || !showBanner) return null;

    return (
        <>
            {/* First Layer: Bottom Floating Banner */}
            <AnimatePresence>
                {!showModal && (
                    <motion.aside
                        role="region"
                        aria-label="Consentimiento de cookies"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-[99999] pointer-events-auto"
                    >
                        <div className="bg-white/95 dark:bg-[#121216]/95 backdrop-blur-2xl border border-gray-200/80 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                            <div className="flex items-start gap-3.5 mb-3.5">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0 border border-[var(--brand-pink)]/20">
                                    <Cookie className="w-5 h-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                                        Tu privacidad en Klozet
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                        Utilizamos cookies técnicas para mantener tu sesión segura y cookies de personalización para recordar tus preferencias (tema oscuro/claro). Cumplimos con la normativa española de la AEPD y el RGPD.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                <Link 
                                    href="/cookies" 
                                    className="underline hover:text-[var(--brand-pink)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)] rounded"
                                >
                                    Política de Cookies
                                </Link>
                                <span>•</span>
                                <Link 
                                    href="/privacy" 
                                    className="underline hover:text-[var(--brand-pink)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)] rounded"
                                >
                                    Privacidad
                                </Link>
                                <span>•</span>
                                <Link 
                                    href="/terms" 
                                    className="underline hover:text-[var(--brand-pink)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)] rounded"
                                >
                                    Términos
                                </Link>
                            </div>

                            {/* Buttons conforming to AEPD equal prominence rule */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={handleAcceptAll}
                                    className="w-full h-10 px-3 text-xs md:text-sm font-semibold rounded-xl bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] shadow-md shadow-[var(--brand-pink)]/20 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand-pink)] active:scale-[0.98]"
                                    aria-label="Aceptar todas las cookies"
                                >
                                    Aceptar todas
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRejectAll}
                                    className="w-full h-10 px-3 text-xs md:text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white transition-all border border-gray-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 active:scale-[0.98]"
                                    aria-label="Rechazar cookies opcionales"
                                >
                                    Rechazar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(true)}
                                    className="w-full h-10 px-3 text-xs md:text-sm font-medium rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-all border border-gray-200/80 dark:border-white/10 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)] active:scale-[0.98]"
                                    aria-label="Configurar preferencias de cookies"
                                >
                                    <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Configurar</span>
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Second Layer: Granular Configuration Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="cookie-settings-title"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full max-w-lg bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center">
                                        <Settings2 className="w-5 h-5" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h2 id="cookie-settings-title" className="text-lg font-bold text-gray-900 dark:text-white">
                                            Preferencias de Cookies
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Gestiona qué cookies autorizas
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Cerrar modal de configuración"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                {/* Technical Cookies (Strictly Required) */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181e] border border-gray-200/80 dark:border-white/5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Cookies Técnicas
                                                </h4>
                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                    Obligatorias
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Imprescindibles para mantener tu sesión activa con Supabase, la seguridad de la app y la prevención de fraude en transacciones. No se pueden desactivar.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            disabled={true}
                                            aria-label="Cookies técnicas obligatorias"
                                            className="w-5 h-5 accent-[var(--brand-pink)] rounded cursor-not-allowed opacity-60 mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Preferences / Customization Cookies */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181e] border border-gray-200/80 dark:border-white/5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Personalización y Tema
                                                </h4>
                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    Opcional
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Permiten recordar si prefieres modo claro u oscuro y mantener la coherencia de tu experiencia visual en el dispositivo.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={prefSettings.preferences}
                                            onChange={(e) => setPrefSettings(prev => ({ ...prev, preferences: e.target.checked }))}
                                            aria-label="Permitir cookies de personalización y tema"
                                            className="w-5 h-5 accent-[var(--brand-pink)] rounded cursor-pointer mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#18181e] border border-gray-200/80 dark:border-white/5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Métricas Anónimas de Rendimiento
                                                </h4>
                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                    Opcional
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Nos ayudan a medir el rendimiento de la aplicación y la estabilidad de las consultas de IA de forma completamente anonimizada.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={prefSettings.analytics}
                                            onChange={(e) => setPrefSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                                            aria-label="Permitir cookies de métricas y rendimiento"
                                            className="w-5 h-5 accent-[var(--brand-pink)] rounded cursor-pointer mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleSaveCustom}
                                    className="w-full sm:flex-1 h-11 px-4 text-xs md:text-sm font-semibold rounded-xl bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-dark)] shadow-md shadow-[var(--brand-pink)]/20 transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand-pink)]"
                                    aria-label="Guardar configuración seleccionada"
                                >
                                    Guardar preferencias
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAcceptAll}
                                    className="w-full sm:w-auto h-11 px-4 text-xs md:text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white transition-all border border-gray-200 dark:border-white/10"
                                    aria-label="Aceptar todas las cookies"
                                >
                                    Aceptar todas
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
