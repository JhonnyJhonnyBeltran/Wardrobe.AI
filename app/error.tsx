'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    console.warn('[ErrorBoundary] Intercepted runtime error:', error);

    const now = Date.now();
    const lastReload = parseInt(sessionStorage.getItem('klozet_error_time') || '0', 10);
    const reloadCount = parseInt(sessionStorage.getItem('klozet_error_count') || '0', 10);

    let newCount = 1;
    if (now - lastReload < 12000) {
      newCount = reloadCount + 1;
    }

    sessionStorage.setItem('klozet_error_time', now.toString());
    sessionStorage.setItem('klozet_error_count', newCount.toString());

    // Auto-recover silently on first occurrence
    if (newCount === 1) {
      setRecovering(true);
      const timer = setTimeout(() => {
        try {
          reset();
        } catch {
          window.location.reload();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [error, reset]);

  const handleManualReconnect = () => {
    sessionStorage.removeItem('klozet_error_time');
    sessionStorage.removeItem('klozet_error_count');
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
        colorScheme: 'light',
      }}
      className="fixed inset-0 w-screen h-screen bg-white text-zinc-950 flex flex-col justify-between px-4 sm:px-6 z-[9999] overflow-hidden select-none"
    >
      {/* 1. Header with official Klozet logo */}
      <header className="w-full flex items-center justify-between py-2 border-b border-zinc-100">
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

      {/* 2. Embedded App Skeleton Background */}
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

      {/* 3. Centered Embedded Recovery Card (Apple HIG translucent glass) */}
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm bg-white/95 border border-black/[0.08] rounded-[32px] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col items-center"
        >
          {/* Animated Kloe Avatar Container */}
          <div className="relative w-18 h-18 rounded-full bg-[#FF66C4]/10 flex items-center justify-center mb-4">
            <Image
              src="/kloe-avatar.png"
              alt="Kloe"
              width={42}
              height={42}
              className="object-contain"
            />
            <div className="absolute inset-0 rounded-full border-2 border-[#FF66C4] border-t-transparent animate-spin" />
          </div>

          <h2 className="text-xl font-bold text-zinc-950 tracking-tight mb-1.5">
            {recovering ? 'Sincronizando armario...' : 'Actualizando la conexión'}
          </h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-6 max-w-[260px]">
            {recovering
              ? 'Conectando con tu cuenta y cargando tus prendas.'
              : 'Estamos sincronizando las últimas mejoras de Klozet para ti.'}
          </p>

          <button
            type="button"
            onClick={handleManualReconnect}
            className="w-full h-12 rounded-full bg-[#FF66C4] hover:bg-[#ED4C9E] active:scale-[0.97] transition-all text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,102,196,0.35)] cursor-pointer touch-manipulation"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            <span>Reconectar ahora</span>
          </button>
        </motion.div>
      </div>

      {/* 4. Bottom TabBar Skeleton Placeholder */}
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
