'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, KloeEmptyVisual } from '@/components';

export default function NotFoundPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 py-12 text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center max-w-sm"
      >
        <div className="mb-6">
          <KloeEmptyVisual variant="not-found" />
        </div>

        <h1 className="kz-title text-[var(--foreground)] mb-2">
          Aquí no era.
        </h1>

        <p className="kz-body text-[var(--foreground-secondary)] max-w-xs mx-auto mb-8 leading-relaxed">
          Esta página no existe o se ha movido de sitio.
        </p>

        <Button
          onClick={handleBack}
          className="px-8 h-12 text-[15px] rounded-full font-semibold kz-pink-surface text-white border-0 hover:scale-[1.03] active:scale-[0.97] transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </motion.div>
    </div>
  );
}
