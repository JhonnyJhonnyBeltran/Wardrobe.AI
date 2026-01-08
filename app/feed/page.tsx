'use client';

/**
 * Feed Page - Próximamente
 * Placeholder para el feed social
 */

import { motion } from 'framer-motion';
import { LogoMark } from '@/components';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--background)] shadow-[var(--shadow-float-strong)] flex items-center justify-center overflow-hidden">
          <LogoMark size="xl" />
        </div>
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
