'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Star } from 'lucide-react';
import { Button, LogoMark } from '@/components';
import { useUser } from '@/store/userStore';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { upgradeToPremiun } = useUser();

    const handleUpgrade = () => {
        upgradeToPremiun();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#1C1C1E] border border-[var(--border-color)] rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-[var(--brand-pink)]/20 to-purple-600/20 blur-3xl pointer-events-none" />
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--brand-pink)]/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-8 text-center relative z-0">
                                {/* Icon */}
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--brand-pink)] to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[var(--brand-pink)]/20 rotate-3">
                                    <Crown className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent mb-2">
                                    Actualiza a Premium
                                </h2>
                                <p className="text-[var(--foreground-secondary)] mb-8 text-sm leading-relaxed">
                                    Desbloquea todo el potencial de tu armario con nuestras funciones exclusivas de IA.
                                </p>

                                {/* Features List */}
                                <div className="space-y-4 mb-8 text-left bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 rounded-full bg-[var(--brand-pink)]/20 text-[var(--brand-pink)] mt-0.5">
                                            <Star className="w-3 h-3 fill-[var(--brand-pink)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">Generación con KLOE AI</h3>
                                            <p className="text-xs text-[var(--foreground-tertiary)]">Crea outfits personalizados con inteligencia artificial avanzada</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 rounded-full bg-[var(--brand-pink)]/20 text-[var(--brand-pink)] mt-0.5">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">Sin límites</h3>
                                            <p className="text-xs text-[var(--foreground-tertiary)]">Genera outfits ilimitados cada día</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 rounded-full bg-[var(--brand-pink)]/20 text-[var(--brand-pink)] mt-0.5">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">Análisis de estilo</h3>
                                            <p className="text-xs text-[var(--foreground-tertiary)]">Estadísticas detalladas de tu uso de ropa</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <Button
                                    className="w-full py-4 text-base font-semibold shadow-lg shadow-[var(--brand-pink)]/25 mb-3"
                                    glow
                                    onClick={handleUpgrade}
                                >
                                    Obtener Premium
                                </Button>
                                <button
                                    onClick={onClose}
                                    className="text-sm text-[var(--foreground-tertiary)] hover:text-white transition-colors"
                                >
                                    Quizás más tarde
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
