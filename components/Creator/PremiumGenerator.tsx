'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PremiumGeneratorProps {
    isVisible: boolean;
    onComplete?: () => void;
}

export function PremiumGenerator({ isVisible, onComplete }: PremiumGeneratorProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        if (onComplete) setTimeout(onComplete, 500); // Slight delay after 100%
                        return 100;
                    }
                    return prev + 2; // Speed of progress
                });
            }, 50); // 50ms * 50 steps = 2500ms total roughly

            return () => clearInterval(interval);
        }
    }, [isVisible, onComplete]);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
        >
            <div className="relative w-64 h-64 mb-8">
                {/* Rotating Rings */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-white/10"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-[var(--brand-pink)]/20 border-t-[var(--brand-pink)]"
                />

                {/* Center Icon Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-[var(--brand-pink)] blur-xl opacity-50 rounded-full"
                        />
                        <Sparkles className="w-16 h-16 text-white relative z-10" />
                    </div>
                </div>
            </div>

            {/* Text & Progress */}
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Diseñando tu estilo</h2>
            <p className="text-white/50 text-sm mb-8">Kloe está combinando las mejores prendas...</p>

            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-purple-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="mt-2 text-xs font-mono text-[var(--brand-pink)]">
                {progress}%
            </div>
        </motion.div>
    );
}
