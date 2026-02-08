'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Check } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';

export default function PremiumModal() {
    const { isPremiumModalOpen, closePremiumModal } = useUiStore();
    const { upgradeToPremiun } = useUser();

    const handleUpgrade = () => {
        upgradeToPremiun();
        closePremiumModal();
    };

    if (!isPremiumModalOpen) return null;

    const benefits = [
        "Upload unlimited items to your closet",
        "Advanced AI outfit generation",
        "Priority support",
        "Exclusive styles and trends"
    ];

    return (
        <AnimatePresence>
            {isPremiumModalOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePremiumModal}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-md h-fit z-[101] p-4"
                    >
                        <div className="bg-[var(--card-bg)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] relative">
                            {/* Close Button */}
                            <button
                                onClick={closePremiumModal}
                                className="absolute top-4 right-4 p-2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header Image / Gradient */}
                            <div className="h-32 bg-gradient-to-br from-[var(--brand-pink)] to-purple-600 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <Sparkles className="absolute top-4 left-4 text-white/40 w-6 h-6 animate-pulse" />
                                <Sparkles className="absolute bottom-4 right-10 text-white/40 w-4 h-4 animate-pulse delay-700" />
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Upgrade to Klozet Premium</h2>
                                    <p className="text-[var(--foreground-secondary)]">Unlock the full potential of your wardrobe with our premium features.</p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--foreground)]">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleUpgrade}
                                    className="w-full py-3.5 bg-gradient-to-r from-[var(--brand-pink)] to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-wide"
                                >
                                    Start 7-Day Free Trial
                                </button>
                                <p className="text-xs text-center text-[var(--foreground-tertiary)] mt-4">
                                    $9.99/month after trial. Cancel anytime.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
