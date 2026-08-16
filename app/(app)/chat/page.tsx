'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { LogoMark } from '@/components';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[var(--brand-pink)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[var(--brand-purple)]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-[var(--background)] shadow-[var(--shadow-float-strong)] flex items-center justify-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-pink)]/20 to-[var(--brand-purple)]/20 rounded-3xl animate-pulse" />
          <Bot className="w-12 h-12 text-[var(--brand-pink)] relative z-10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2 bg-[var(--brand-purple)] text-white p-1.5 rounded-full shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-purple)] bg-clip-text text-transparent mb-3">
          Kloe
        </h1>
        <p className="text-lg font-medium text-[var(--foreground)] mb-2">
          Tu asistente virtual de moda
        </p>
        <p className="text-sm text-[var(--foreground-tertiary)] max-w-xs mx-auto">
          Estamos entrenando a Kloe para que te ayude a encontrar tu estilo perfecto. ¡Muy pronto!
        </p>
      </motion.div>
    </div>
  );
}