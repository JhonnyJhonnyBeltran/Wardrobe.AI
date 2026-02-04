'use client';

import { useRouter } from 'next/navigation';
import { motion, PanInfo } from 'framer-motion';
import { Share2, Heart, Globe } from 'lucide-react';

export default function FeedPage() {
  const router = useRouter();

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Swipe Left -> Search
    if (info.offset.x < -50) {
      router.push('/search');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
      className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 relative overflow-hidden touch-pan-y"
    >
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[var(--brand-pink)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

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
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-pink)]/20 to-orange-500/20 rounded-3xl animate-pulse" />
          <Share2 className="w-12 h-12 text-[var(--brand-pink)] relative z-10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 bg-orange-500 text-white p-1.5 rounded-full shadow-lg"
          >
            <Heart className="w-4 h-4" />
          </motion.div>
        </motion.div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--brand-pink)] to-orange-500 bg-clip-text text-transparent mb-3">
          Feed Social
        </h1>
        <p className="text-lg font-medium text-[var(--foreground)] mb-2">
          Comparte tu estilo con el mundo
        </p>
        <p className="text-sm text-[var(--foreground-tertiary)] max-w-xs mx-auto">
          Muy pronto podrás compartir tus outfits, inspirarte con otros usuarios y unirte a la comunidad de moda.
        </p>
      </motion.div>
    </motion.div>
  );
}
