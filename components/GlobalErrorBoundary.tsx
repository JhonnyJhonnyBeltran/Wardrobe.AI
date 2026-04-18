'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    attemptedReload: boolean;
}

/**
 * GlobalErrorBoundary - The ultimate safety net for Klozet.
 * Prevents white screens by intercepting JS crashes and attempting a silent recovery.
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        attemptedReload: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, attemptedReload: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[GlobalError] Uncaught crash:', error, errorInfo);
        
        // Auto-recovery: If it crashes, try to reload once
        if (!sessionStorage.getItem('klozet_crash_reload')) {
            console.log('[GlobalError] Attempting automatic recovery reload...');
            sessionStorage.setItem('klozet_crash_reload', 'true');
            
            // Wait 1.5s to show the "Updating" screen before reloading
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    private handleManualReset = () => {
        sessionStorage.removeItem('klozet_crash_reload');
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-sm w-full"
                    >
                        {/* Premium Loader Icon */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 border-4 border-[var(--brand-pink)]/20 rounded-full" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-[var(--brand-pink)] rounded-full border-t-transparent"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img src="/klozet-logo-dark.png" alt="Klozet" className="w-12 h-12 dark:invert opacity-80" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                            Actualizando la experiencia
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-8 leading-relaxed">
                            Estamos sincronizando las últimas mejoras de Klozet para ti. Esto tomará solo un segundo.
                        </p>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={this.handleManualReset}
                            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Reintentar ahora
                        </motion.button>

                        <div className="mt-12 flex items-center justify-center gap-2 text-[var(--foreground-tertiary)] opacity-50">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-mono tracking-tighter uppercase">
                                Recovery Mode Active
                            </span>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
