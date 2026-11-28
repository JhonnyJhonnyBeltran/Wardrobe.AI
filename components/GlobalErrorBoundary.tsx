'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    showRetry: boolean;
}

/**
 * GlobalErrorBoundary - The non-intrusive safety net for Klozet.
 * Prevents blank screens and renders the native app skeleton without blocking modal popups.
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
    private retryTimeout: ReturnType<typeof setTimeout> | null = null;

    public state: State = {
        hasError: false,
        error: null,
        showRetry: false,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn('[GlobalError] Runtime error caught:', error, errorInfo);

        // After 5s of being stuck, show inline retry button
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => {
            this.setState({ showRetry: true });
        }, 5000);
    }

    public componentWillUnmount() {
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null, showRetry: false });
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
                    <header className="w-full flex items-center justify-between py-2 border-b border-zinc-100 z-10">
                        <Image
                            src="/landing/klozet-nombre-grande.png"
                            alt="Klozet"
                            width={120}
                            height={38}
                            className="h-7 w-auto object-contain"
                            priority
                        />
                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                            <Image
                                src="/kloe-avatar.png"
                                alt="Kloe"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        </div>
                    </header>

                    {/* Embedded App Skeleton Background */}
                    <div className="flex-1 w-full max-w-md mx-auto grid grid-cols-2 gap-3 py-4 overflow-hidden pointer-events-none">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
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

                    {/* Inline Retry Button (Appears only after 5 seconds if connection fails) */}
                    {this.state.showRetry && (
                        <div className="w-full max-w-xs mx-auto py-3 flex flex-col items-center gap-2 z-20 animate-in fade-in zoom-in-95 duration-300">
                            <button
                                type="button"
                                onClick={this.handleRetry}
                                className="w-full h-11 rounded-full bg-[#FF66C4] active:scale-[0.97] transition-all text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,102,196,0.35)] cursor-pointer touch-manipulation"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-white" />
                                <span>Reintentar</span>
                            </button>
                        </div>
                    )}

                    {/* Bottom TabBar Skeleton Placeholder */}
                    <footer className="w-full max-w-md mx-auto h-12 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-around px-4 opacity-50 pointer-events-none mb-1">
                        <div className="w-5 h-5 rounded-md bg-zinc-300" />
                        <div className="w-5 h-5 rounded-md bg-zinc-300" />
                        <div className="w-7 h-7 rounded-full bg-[#FF66C4]/50" />
                        <div className="w-5 h-5 rounded-md bg-zinc-300" />
                        <div className="w-5 h-5 rounded-md bg-zinc-300" />
                    </footer>
                </div>
            );
        }

        return this.props.children;
    }
}
