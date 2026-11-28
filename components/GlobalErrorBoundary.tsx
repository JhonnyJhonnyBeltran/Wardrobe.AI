'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Image from 'next/image';
import { Home, Search, Heart, UserRound, RotateCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isReloading: boolean;
}

/**
 * GlobalErrorBoundary - The non-intrusive safety net for Klozet.
 * Prevents blank screens and renders the native app skeleton with authentic TabBar navigation.
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isReloading: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[GlobalError] Runtime error caught:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ isReloading: true });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
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
          {/* Header with official Klozet logo and Embedded Reload Action */}
          <header className="w-full flex items-center justify-between py-2 border-b border-zinc-100 z-10">
            <Image
              src="/landing/klozet-nombre-grande.png"
              alt="Klozet"
              width={120}
              height={38}
              className="h-7 w-auto object-contain"
              priority
            />
            <button
              type="button"
              onClick={this.handleReload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/90 text-xs font-bold text-zinc-800 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[var(--brand-pink,#FF66C4)] ${this.state.isReloading ? 'animate-spin' : ''}`} />
              <span>Recargar</span>
            </button>
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

          {/* Real Bottom TabBar Structure (Home, Search, Klozet, Heart, Profile) */}
          <nav
            aria-label="Navegación principal"
            className="w-full max-w-sm mx-auto z-10 select-none pb-[env(safe-area-inset-bottom)]"
          >
            <div className="relative flex justify-between items-center h-[58px] px-2 rounded-full bg-white/95 border border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              {/* Home */}
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex justify-center items-center h-full text-zinc-500 hover:text-black cursor-pointer"
                aria-label="Inicio"
              >
                <Home className="w-[23px] h-[23px]" strokeWidth={1.8} />
              </button>

              {/* Search */}
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex justify-center items-center h-full text-zinc-500 hover:text-black cursor-pointer"
                aria-label="Buscar"
              >
                <Search className="w-[23px] h-[23px]" strokeWidth={1.8} />
              </button>

              {/* Center Klozet Logo Mark */}
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex justify-center items-center h-full cursor-pointer"
                aria-label="Armario"
              >
                <div className="w-[26px] h-[28px] relative flex items-center justify-center">
                  <Image
                    src="/klzt-pink.png"
                    alt="Klozet"
                    width={26}
                    height={28}
                    className="object-contain w-full h-full"
                  />
                </div>
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex justify-center items-center h-full text-zinc-500 hover:text-black cursor-pointer"
                aria-label="Notificaciones"
              >
                <Heart className="w-[23px] h-[23px]" strokeWidth={1.8} />
              </button>

              {/* Profile */}
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex justify-center items-center h-full text-zinc-500 hover:text-black cursor-pointer"
                aria-label="Perfil"
              >
                <UserRound className="w-[23px] h-[23px]" strokeWidth={1.8} />
              </button>
            </div>
          </nav>
        </div>
      );
    }

    return this.props.children;
  }
}
