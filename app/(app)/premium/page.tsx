'use client';

import { motion } from 'framer-motion';
import { Crown, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { LogoMark } from '@/components';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUiStore } from '@/store/uiStore';

export default function PremiumPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const { openPremiumModal } = useUiStore();

    useEffect(() => {
        if (searchParams.get('subscribed') === 'success' || searchParams.get('success') === 'true') {
            toast.success('¡Bienvenido a Klozet Premium! Tu suscripción ya está activa.');
        }
    }, [searchParams]);

    // Swipe right to go back
    useEffect(() => {
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        };

        const handleSwipe = () => {
            if (touchEndX - touchStartX > 100) {
                router.back();
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [router]);

    const handleOpenPaymentModal = () => {
        openPremiumModal();
    };

    const benefits = [
        { title: 'Estilismo Ilimitado con Kloe 24/7', desc: 'Sin límites de consultas ni bloqueos diarios.' },
        { title: 'Análisis Visual Inteligente de Ropa', desc: 'Kloe ve las fotos reales de tus prendas y tus combinaciones.' },
        { title: 'Montaje de Looks en el Lienzo', desc: 'Pasa los outfits recomendados al lienzo con 1 solo toque.' },
        { title: 'Acceso Prioritario y Novedades VIP', desc: 'Nuevos filtros de estilismo, texturas y ocasiones antes que nadie.' },
        { title: 'Experiencia 100% Limpia Sin Anuncios', desc: 'Navegación ultra rápida sin interrupciones.' }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                <div className="px-4 h-14 flex items-center justify-between max-w-2xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        aria-label="Volver"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <LogoMark size="sm" />
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-[var(--brand-pink)]/15 border border-[var(--brand-pink)]/30 flex items-center justify-center text-[var(--brand-pink)] shadow-lg shadow-[var(--brand-pink)]/10">
                            <Crown className="w-10 h-10" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-[var(--foreground)] mb-3 tracking-tight">
                        Desbloquea <span className="text-[var(--brand-pink)]">Klozet Pro</span>
                    </h1>
                    <p className="text-sm text-[var(--foreground-secondary)] max-w-md mx-auto leading-relaxed">
                        Tu estilista de moda personal en el bolsillo. Consultas infinitas, análisis visual de tus prendas y looks ilimitados.
                    </p>
                </motion.div>

                {/* Plans Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3 mb-8"
                >
                    {/* Yearly Plan */}
                    <div
                        onClick={() => setSelectedPlan('yearly')}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedPlan === 'yearly'
                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-lg shadow-[var(--brand-pink)]/10'
                                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--foreground-tertiary)]'
                        }`}
                    >
                        <div className="absolute -top-3 right-3 bg-[var(--brand-pink)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            Ahorra 30%
                        </div>
                        <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-1">Plan Anual</div>
                        <div className="text-2xl font-extrabold text-[var(--foreground)]">24,99 €</div>
                        <div className="text-[11px] text-[var(--foreground-tertiary)] mt-0.5">~2,08 €/mes facturado al año</div>
                    </div>

                    {/* Monthly Plan */}
                    <div
                        onClick={() => setSelectedPlan('monthly')}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedPlan === 'monthly'
                                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-lg shadow-[var(--brand-pink)]/10'
                                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--foreground-tertiary)]'
                        }`}
                    >
                        <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-1">Plan Mensual</div>
                        <div className="text-2xl font-extrabold text-[var(--foreground)]">2,99 €</div>
                        <div className="text-[11px] text-[var(--foreground-tertiary)] mt-0.5">Facturado mensualmente</div>
                    </div>
                </motion.div>

                {/* Benefits List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 mb-8 divide-y divide-[var(--border-color)]"
                >
                    <h2 className="text-sm font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-4">
                        Todo lo que incluye tu suscripción
                    </h2>

                    <div className="divide-y divide-[var(--border-color)]">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="py-3.5 flex items-start gap-3 first:pt-0 last:pb-0">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--brand-pink)]/15 flex items-center justify-center mt-0.5">
                                    <Check className="w-3.5 h-3.5 text-[var(--brand-pink)]" strokeWidth={3} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-[var(--foreground)]">{benefit.title}</div>
                                    <div className="text-xs text-[var(--foreground-tertiary)] mt-0.5">{benefit.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Button: Opens native in-app payment modal with Apple Pay & Google Pay */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3 mb-6"
                >
                    <button
                        onClick={handleOpenPaymentModal}
                        className="w-full py-4 px-6 rounded-2xl bg-[var(--brand-pink)] text-white font-bold text-base hover:opacity-95 active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand-pink)]/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Zap className="w-5 h-5 fill-white" />
                        <span>
                            Abrir Hoja de Pago Rápido ({selectedPlan === 'yearly' ? '24,99 €/año' : '2,99 €/mes'})
                        </span>
                    </button>

                    <div className="flex items-center justify-center gap-4 text-xs text-[var(--foreground-tertiary)]">
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Pago seguro con Apple Pay, Google Pay y Tarjeta
                        </span>
                        <span>•</span>
                        <span>Cancela en 1 clic cuando quieras</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
