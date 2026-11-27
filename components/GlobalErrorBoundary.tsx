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
                <div 
                    style={{
                        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
                        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
                        colorScheme: 'light',
                    }}
                    className="fixed inset-0 w-screen h-screen bg-white text-zinc-950 flex flex-col justify-between px-4 sm:px-6 z-[9999] overflow-hidden select-none"
                >
                    {/* Header with official Klozet logo */}
                    <header className="w-full flex items-center justify-between py-2 border-b border-zinc-100">
                        <img
                            src="/landing/klozet-nombre-grande.png"
                            alt="Klozet"
                            className="h-7 w-auto object-contain"
                        />
                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                            <img
                                src="/kloe-avatar.png"
                                alt="Kloe"
                                className="w-5 h-5 object-contain"
                            />
                        </div>
                    </header>

                    {/* Embedded App Skeleton Background */}
                    <div className="flex-1 w-full max-w-md mx-auto grid grid-cols-2 gap-3 py-4 opacity-40 pointer-events-none">
                        {[1, 2, 3, 4].map((idx) => (
                            <div
                                key={idx}
                                className="w-full aspect-[3/4] rounded-2xl bg-zinc-100 border border-zinc-200/60 p-3 flex flex-col justify-between animate-pulse"
                            >
                                <div className="w-full h-[65%] rounded-xl bg-zinc-200/80" />
                                <div className="space-y-1.5 pt-2">
                                    <div className="w-3/4 h-3 rounded-md bg-zinc-200" />
                                    <div className="w-1/2 h-2.5 rounded-md bg-zinc-200/70" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Centered Serene Recovery Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-[32px] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col items-center"
                        >
                            <div className="relative w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                                <img src="/kloe-avatar.png" alt="Kloe" className="w-10 h-10 object-contain" />
                                <div className="absolute inset-0 rounded-full border-2 border-[#FF66C4] border-t-transparent animate-spin" />
                            </div>

                            <h2 className="text-lg font-bold text-zinc-950 mb-1.5 tracking-tight">
                                Actualizando la conexión
                            </h2>
                            <p className="text-xs text-zinc-500 mb-5 leading-relaxed max-w-[260px]">
                                Estamos sincronizando la app con tu armario. Un momento por favor.
                            </p>

                            <button
                                type="button"
                                onClick={this.handleManualReset}
                                className="w-full h-12 rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] active:scale-[0.97] transition-all text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,102,196,0.35)] cursor-pointer touch-manipulation"
                            >
                                <RefreshCcw className="w-4 h-4 text-white" />
                                <span>Reconectar ahora</span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Bottom Tab Bar Skeleton */}
                    <footer className="w-full max-w-md mx-auto py-2 flex items-center justify-around border-t border-zinc-100 opacity-40">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
                        ))}
                    </footer>
                </div>
            );
        }

        return this.props.children;
    }
}
