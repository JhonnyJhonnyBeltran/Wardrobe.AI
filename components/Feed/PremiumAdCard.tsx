'use client';

import { motion } from 'framer-motion';
import { Crown, ArrowRight } from 'lucide-react';
import { LogoMark } from '@/components';
import { useUiStore } from '@/store/uiStore';

export default function PremiumAdCard() {
    const { openPremiumModal } = useUiStore();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block w-full max-w-md mx-auto my-8"
        >
            <div 
                onClick={openPremiumModal}
                className="relative overflow-hidden bg-[var(--brand-pink,#FF66C4)] rounded-3xl p-8 cursor-pointer group hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <LogoMark size="sm" className="text-white" />
                        </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-2xl font-bold text-white text-center mb-3">
                        ¿No sabes qué ponerte mañana?
                    </h3>

                    <p className="text-white/90 text-center mb-6">
                        Deja que la IA te ayude a crear outfits perfectos cada día
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center justify-center gap-2 bg-white text-[var(--brand-pink,#FF66C4)] font-semibold py-3 px-6 rounded-xl group-hover:bg-gray-50 transition-all">
                        <Crown className="w-5 h-5" />
                        <span>Actualizar a Premium</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
