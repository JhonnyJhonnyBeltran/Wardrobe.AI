'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/feed');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[var(--brand-pink)]/15 blur-3xl pointer-events-none -top-12 -right-12" />
      <div className="absolute w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none -bottom-12 -left-12" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 flex flex-col items-center max-w-sm"
      >
        {/* Logo / Mascot Illustration */}
        <div className="relative w-28 h-20 mb-6 flex items-center justify-center">
          <Image
            src="/kloe-logo-large.png"
            alt="Klozet"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* 404 Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] text-xs font-extrabold uppercase tracking-wider mb-4 border border-[var(--brand-pink)]/20">
          <Sparkles className="w-3.5 h-3.5" />
          Error 404
        </span>

        {/* Main Header */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          Upss te has equivocado
        </h1>

        <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-6">
          Esta página no existe o ha sido movida. Te estamos redirigiendo al feed automáticamente...
        </p>

        {/* Action Button */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white text-sm font-bold shadow-lg shadow-[var(--brand-pink)]/25 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Ir al feed ahora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
