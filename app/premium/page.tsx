'use client';

import { motion } from 'framer-motion';
import { Crown, Check, X } from 'lucide-react';
import Link from 'next/link';
import { LogoMark } from '@/components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PremiumPage() {
    const router = useRouter();

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

    const benefits = [
        'Análisis AI Ilimitado',
        'Subidas Ilimitadas',
        'Outfits Personalizados',
        'Acceso Prioritario',
        'Sin Anuncios'
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                <div className="px-4 h-14 flex items-center justify-between max-w-2xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <LogoMark size="sm" />
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    {/* Large Logo */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-24 h-24">
                            <LogoMark size="lg" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--foreground)]">
                        Klozet Premium
                    </h1>

                    <p className="text-xl text-[var(--foreground-secondary)] mb-2">
                        ¿No sabes qué ponerte mañana?
                    </p>

                    <p className="text-lg text-[var(--foreground-tertiary)]">
                        Deja que la IA te ayude a lucir increíble cada día
                    </p>
                </motion.div>

                {/* Benefits List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 mb-8"
                >
                    <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                        Beneficios Premium
                    </h2>

                    <div className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--brand-pink)] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[var(--foreground)]">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Pricing */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[var(--brand-pink)] rounded-3xl p-8 text-white mb-8"
                >
                    <div className="text-center mb-6">
                        <div className="text-5xl font-bold mb-2">9.99€</div>
                        <div className="text-white/80">al mes</div>
                    </div>

                    <button className="w-full bg-white text-[var(--brand-pink)] font-semibold py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 mb-4">
                        Actualizar a Premium
                    </button>

                    <p className="text-center text-sm text-white/70">
                        Cancela cuando quieras. Sin compromisos.
                    </p>
                </motion.div>

                {/* Footer Note */}
                <p className="text-center text-sm text-[var(--foreground-tertiary)]">
                    Al suscribirte, aceptas nuestros términos y condiciones
                </p>
            </div>
        </div>
    );
}
