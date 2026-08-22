'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  Layers, 
  CalendarDays, 
  Loader2 
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface KloeProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KloeProModal({ isOpen, onClose }: KloeProModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar la pasarela de pago');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (err: any) {
      console.error('[KloeProModal] Checkout error:', err);
      toast.error(err.message || 'Hubo un error al abrir el pago. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const features = [
    { title: 'Estilismo Ilimitado con Kloe', desc: 'Sin límites de consultas ni cuotas diarias.' },
    { title: 'Análisis Visual de tus Prendas', desc: 'Kloe reconoce fotos reales y colores de tu ropa.' },
    { title: 'Montaje Directo en el Lienzo', desc: 'Edita, escala y guarda looks con 1 solo toque.' },
    { title: 'Programación en Calendario', desc: 'Planifica tus outfits para cualquier día o evento.' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--brand-pink)]/30 rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--brand-pink)]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="relative w-16 h-16 mb-3">
              <Image
                src="/kloe-avatar.png"
                alt="Kloe Pro"
                fill
                className="object-contain drop-shadow-md"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center shadow-sm">
                <Crown className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <h3 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-1.5">
              Desbloquea Kloe <span className="text-[var(--brand-pink)]">Pro</span>
            </h3>
            <p className="text-xs text-[var(--foreground-secondary)] mt-1 max-w-xs">
              Tu estilista personal con IA siempre lista en tu bolsillo
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 mb-6">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--brand-pink)]/15 text-[var(--brand-pink)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--foreground)]">{feat.title}</p>
                  <p className="text-[11px] text-[var(--foreground-tertiary)]">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Yearly Option */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'yearly'
                  ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-sm'
                  : 'border-[var(--border-color)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-pink)]/40'
              }`}
            >
              <span className="absolute -top-2.5 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--brand-pink)] text-white shadow-xs">
                Ahorra 30%
              </span>
              <p className="text-xs font-bold text-[var(--foreground)]">Anual</p>
              <p className="text-lg font-extrabold text-[var(--foreground)] mt-1">
                24,99 €<span className="text-[10px] font-normal text-[var(--foreground-secondary)]"> /año</span>
              </p>
              <p className="text-[10px] text-[var(--brand-pink)] font-semibold mt-0.5">
                ~2,08 € / mes
              </p>
            </div>

            {/* Monthly Option */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-sm'
                  : 'border-[var(--border-color)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-pink)]/40'
              }`}
            >
              <p className="text-xs font-bold text-[var(--foreground)]">Mensual</p>
              <p className="text-lg font-extrabold text-[var(--foreground)] mt-1">
                2,99 €<span className="text-[10px] font-normal text-[var(--foreground-secondary)]"> /mes</span>
              </p>
              <p className="text-[10px] text-[var(--foreground-tertiary)] mt-0.5">
                Sin permanencia
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white font-bold text-sm shadow-lg shadow-[var(--brand-pink)]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Conectando con Stripe...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Continuar al Pago Seguro</span>
              </>
            )}
          </button>

          {/* Security & Guarantee Note */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-[var(--foreground-tertiary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pago seguro con Stripe. Cancela en cualquier momento con 1 clic.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
