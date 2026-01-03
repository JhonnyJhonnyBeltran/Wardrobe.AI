'use client';

/**
 * Feed Page - Próximamente
 * Placeholder para el feed social
 */

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--brand-pink)] to-[var(--brand-pink-dark)] flex items-center justify-center shadow-[var(--shadow-float-strong)]">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Feed
        </h1>
        <p className="text-lg text-[var(--foreground-secondary)] mb-2">
          Próximamente...
        </p>
        <p className="text-sm text-[var(--foreground-tertiary)]">
          Estamos trabajando en algo increíble para ti
        </p>
      </motion.div>
    </div>
  );
}
