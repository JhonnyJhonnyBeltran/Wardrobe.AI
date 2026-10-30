'use client';

import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/userStore';

export default function PremiumAdCard() {
  const router = useRouter();
  const { user } = useUser();

  const handleGoToKloe = () => {
    router.push(user ? '/closet/kloe' : '/auth');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto my-6"
    >
      <div
        onClick={handleGoToKloe}
        className="relative overflow-hidden bg-[var(--card-bg)] border border-[var(--brand-pink,#FF66C4)]/35 rounded-3xl p-6 cursor-pointer group hover:scale-[1.01] transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Official Kloe Character Logo */}
          <div className="relative w-24 h-14 mb-3">
            <Image
              src="/kloe-logo-large.png"
              alt="Kloe"
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-1.5 tracking-tight">
            ¿No sabes qué ponerte hoy?
          </h3>

          <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-5 max-w-xs leading-relaxed">
            Habla con Kloe: analiza tu armario real, el clima de tu ciudad y te monta el outfit completo en segundos.
          </p>

          <div className="inline-flex items-center justify-center gap-2 bg-[var(--brand-pink,#FF66C4)] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-full shadow-md group-hover:opacity-95 transition-all">
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Hablar con Kloe ahora</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
