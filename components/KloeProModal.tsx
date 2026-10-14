'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  Loader2,
  X,
  ChevronLeft,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripeClientPromise } from '@/lib/stripe/stripeClientPromise';

interface KloeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectBackToCloset?: boolean;
}

export default function KloeProModal({ isOpen, onClose, redirectBackToCloset = false }: KloeProModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'plans' | 'checkout'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const stripePromise = useMemo(() => getStripeClientPromise(), []);

  useBodyScrollLock(isOpen);

  // Reset view when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setView('plans');
      setClientSecret(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    onClose();
    if (redirectBackToCloset) {
      router.push('/closet');
    }
  };

  const handleStartCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: selectedPlan,
          embedded: true 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al conectar con la pasarela de pago');
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setView('checkout');
      } else if (data.url) {
        // Fallback to hosted redirect if server provided URL
        window.location.href = data.url;
      } else {
        throw new Error('No se pudo inicializar la pasarela de pago');
      }
    } catch (err: any) {
      console.error('[KloeProModal] Checkout error:', err);
      toast.error(err.message || 'Hubo un error al abrir el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { title: 'Estilismo Ilimitado con Kloe 24/7', desc: 'Sin límites de mensajes diarios ni bloqueos.' },
    { title: 'Análisis Visual de tus Prendas y Fotos', desc: 'Kloe ve las fotos reales de tu ropa y de tus looks guardados.' },
    { title: 'Montaje de Looks en el Lienzo', desc: 'Pasa cualquier outfit recomendado al lienzo con 1 solo toque.' },
    { title: 'Programación en Calendario', desc: 'Planifica tus combinaciones para cualquier ocasión o evento.' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`relative w-full ${
            view === 'checkout' ? 'max-w-lg' : 'max-w-md'
          } max-h-[92vh] overflow-y-auto no-scrollbar bg-[var(--card-bg)] border border-[var(--brand-pink)]/40 rounded-3xl p-4 sm:p-6 shadow-2xl z-10 transition-all duration-300`}
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--brand-pink)]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Actions: Back button (if in checkout) & Close button */}
          <div className="flex items-center justify-between mb-2">
            {view === 'checkout' ? (
              <button
                onClick={() => setView('plans')}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] p-1.5 -ml-1 rounded-lg hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a planes</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {view === 'plans' ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mt-0.5 mb-4">
                <div className="relative w-20 sm:w-24 h-12 sm:h-14 mb-2">
                  <Image
                    src="/kloe-logo-large.png"
                    alt="Klozet Premium"
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </div>
                
                <h3 className="text-lg font-extrabold text-[var(--foreground)] leading-snug">
                  Para usar esta función necesitas <br />
                  <span className="text-[var(--brand-pink)]">Klozet Premium</span>
                </h3>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1 max-w-xs leading-relaxed">
                  ¡Tu armario nunca volverá a estar desaprovechado! Desbloquea a Kloe para estilismo inteligente 24/7.
                </p>
              </div>

              {/* Duolingo-style Feature Perks */}
              <div className="space-y-2.5 mb-5 bg-[var(--background-secondary)]/50 rounded-2xl p-3.5 border border-[var(--border-color)]">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-[var(--foreground)]">{feat.title}</p>
                      <p className="text-[11px] text-[var(--foreground-tertiary)]">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Options */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Yearly Option */}
                <div
                  onClick={() => setSelectedPlan('yearly')}
                  className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'yearly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-sm ring-2 ring-[var(--brand-pink)]/30'
                      : 'border-[var(--border-color)] bg-[var(--background-secondary)]/40 hover:border-[var(--brand-pink)]/40'
                  }`}
                >
                  <span className="absolute -top-2.5 right-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--brand-pink)] text-white shadow-xs">
                    Ahorras 10,89 € (-30%)
                  </span>
                  <p className="text-xs font-bold text-[var(--foreground)]">Plan Anual</p>
                  <p className="text-lg font-extrabold text-[var(--foreground)] mt-0.5">
                    24,99 €<span className="text-[10px] font-normal text-[var(--foreground-secondary)]"> /año</span>
                  </p>
                  <p className="text-[10px] text-[var(--brand-pink)] font-bold mt-0.5">
                    ~2,08 € / mes
                  </p>
                </div>

                {/* Monthly Option */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-sm ring-2 ring-[var(--brand-pink)]/30'
                      : 'border-[var(--border-color)] bg-[var(--background-secondary)]/40 hover:border-[var(--brand-pink)]/40'
                  }`}
                >
                  <p className="text-xs font-bold text-[var(--foreground)]">Plan Mensual</p>
                  <p className="text-lg font-extrabold text-[var(--foreground)] mt-0.5">
                    2,99 €<span className="text-[10px] font-normal text-[var(--foreground-secondary)]"> /mes</span>
                  </p>
                  <p className="text-[10px] text-[var(--foreground-tertiary)] mt-0.5">
                    Cancela cuando quieras
                  </p>
                </div>
              </div>

              {/* CTA Checkout Button */}
              <button
                onClick={handleStartCheckout}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--brand-pink)] hover:bg-[#ff3377] text-white font-bold text-sm shadow-lg shadow-[var(--brand-pink)]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando con pago rápido...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Desbloquear Klozet Premium</span>
                  </>
                )}
              </button>

              {/* Apple Pay, Google Pay & SSL Guarantee Note */}
              <div className="flex items-center justify-center gap-1.5 mt-3.5 text-[10px] text-[var(--foreground-tertiary)] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Paga con Apple Pay, Google Pay o Tarjeta. Cifrado SSL.</span>
              </div>
            </>
          ) : (
            /* In-Modal Direct 1-Click Checkout (Apple Pay, Google Pay, Link & Card) */
            <div className="space-y-4">
              {/* Plan Recap Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {selectedPlan === 'yearly' ? 'Klozet Pro · Plan Anual' : 'Klozet Pro · Plan Mensual'}
                    </h4>
                    <p className="text-[11px] text-[var(--foreground-secondary)]">
                      {selectedPlan === 'yearly' ? '24,99 € / año (~2,08 €/mes)' : '2,99 € / mes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>Pago Seguro</span>
                </div>
              </div>

              {/* Stripe Embedded Checkout Container */}
              <div className="w-full min-h-[380px] rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] p-2 sm:p-3 shadow-inner">
                {clientSecret ? (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout className="w-full min-h-[360px]" />
                  </EmbeddedCheckoutProvider>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-pink)]" />
                    <p className="text-xs text-[var(--foreground-secondary)]">
                      Cargando opciones de pago seguro...
                    </p>
                  </div>
                )}
              </div>

              {/* Footer reassurance */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--foreground-tertiary)] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Compatible con Apple Pay, Google Pay y Tarjetas con cifrado de Stripe.</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
