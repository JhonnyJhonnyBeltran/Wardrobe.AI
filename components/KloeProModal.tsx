'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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

  const stripePromise = useMemo(() => (isOpen && (view === 'checkout' || clientSecret) ? getStripeClientPromise() : null), [isOpen, view, clientSecret]);

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
    'Estilismo personal con Kloe 24/7 (hasta 35 consultas/día)',
    'Análisis contextual de tus prendas, outfits y posts',
    'Montaje directo de outfits recomendados en el lienzo',
    'Recomendaciones adaptadas a tu morfología y clima local'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop with smooth blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window: Native Bottom Sheet on Mobile, Floating Card on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className={`relative w-full ${
            view === 'checkout' ? 'max-w-lg' : 'max-w-md'
          } max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto no-scrollbar bg-[var(--card-bg)] border-t sm:border border-[var(--brand-pink)]/40 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 transition-all duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6`}
        >
          {/* iOS-style Drawer Handle Bar (Mobile Only) */}
          <div className="w-12 h-1 bg-[var(--foreground-tertiary)]/30 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--brand-pink)]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--brand-pink)]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Actions: Back button (if in checkout) & Close button */}
          <div className="flex items-center justify-between mb-2">
            {view === 'checkout' ? (
              <button
                onClick={() => setView('plans')}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)] hover:text-[var(--brand-pink)] py-1.5 px-3 -ml-1 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--brand-pink)]" />
                <span>Elegir otro plan</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {view === 'plans' ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mt-1 mb-4">
                <div className="relative w-24 h-14 mb-2">
                  <Image
                    src="/kloe-logo-large.png"
                    alt="Klozet Premium"
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
                  Desbloquea <span className="text-[var(--brand-pink)]">Klozet Pro</span>
                </h3>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1.5 max-w-xs leading-relaxed font-medium">
                  Estilismo completo con Kloe, análisis contextual de looks y recomendaciones a tu medida. Tu armario y calendario siguen siendo 100% gratis.
                </p>
              </div>

              {/* Compact Benefits List */}
              <div className="space-y-2 mb-5 bg-[var(--background-secondary)]/50 rounded-2xl p-3.5 border border-[var(--border-color)]/70">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-left">
                    <div className="w-4 h-4 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-medium text-[var(--foreground)] leading-tight">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Options Cards */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
                {/* Yearly Option (Best Value - Irresistible Annual Offer) */}
                <div
                  onClick={() => setSelectedPlan('yearly')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between active:scale-[0.98] ${
                    selectedPlan === 'yearly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-md shadow-[var(--brand-pink)]/10 ring-1 ring-[var(--brand-pink)]'
                      : 'border-[var(--border-color)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-pink)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--brand-pink)] text-white tracking-wide shadow-xs">
                      Ahorra 67%
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'yearly' ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]' : 'border-[var(--border-color)]'
                    }`}>
                      {selectedPlan === 'yearly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">Plan Anual</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">19,99 €</span>
                      <span className="text-[10px] text-[var(--foreground-secondary)] font-medium">/año</span>
                    </div>
                    <p className="text-[11px] text-[var(--brand-pink)] font-bold mt-1">
                      Solo 1,66 € / mes
                    </p>
                  </div>
                </div>

                {/* Monthly Option */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between active:scale-[0.98] ${
                    selectedPlan === 'monthly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 shadow-md shadow-[var(--brand-pink)]/10 ring-1 ring-[var(--brand-pink)]'
                      : 'border-[var(--border-color)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-pink)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[var(--foreground-tertiary)] tracking-wide">
                      Mensual
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'monthly' ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]' : 'border-[var(--border-color)]'
                    }`}>
                      {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">Plan Mensual</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">4,99 €</span>
                      <span className="text-[10px] text-[var(--foreground-secondary)] font-medium">/mes</span>
                    </div>
                    <p className="text-[11px] text-[var(--foreground-tertiary)] font-medium mt-1">
                      Cancela cuando quieras
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Checkout Button */}
              <button
                onClick={handleStartCheckout}
                disabled={loading}
                className="w-full h-13 py-3.5 px-6 rounded-full bg-[var(--brand-pink)] hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-[var(--brand-pink)]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando pago seguro...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Continuar al Pago Rápido</span>
                  </>
                )}
              </button>

              {/* Apple Pay, Google Pay & SSL Guarantee Note */}
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-[var(--foreground-tertiary)] text-center font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Paga con Apple Pay, Google Pay o Tarjeta</span>
              </div>
            </>
          ) : (
            /* In-Modal Direct 1-Click Checkout (Apple Pay, Google Pay, Link & Card) */
            <div className="space-y-3.5">
              {/* Plan Recap Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--brand-pink)]/10 text-[var(--brand-pink)] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">
                      {selectedPlan === 'yearly' ? 'Klozet Pro · Plan Anual' : 'Klozet Pro · Plan Mensual'}
                    </h4>
                    <p className="text-[11px] text-[var(--foreground-secondary)] font-medium">
                      {selectedPlan === 'yearly' ? '19,99 € / año (1,66 €/mes)' : '4,99 € / mes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>Cifrado SSL</span>
                </div>
              </div>

              {/* Stripe Embedded Checkout Container */}
              <div className="w-full min-h-[360px] rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] p-2 sm:p-3 shadow-inner">
                {clientSecret ? (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout className="w-full min-h-[350px]" />
                  </EmbeddedCheckoutProvider>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[var(--brand-pink)]" />
                    <p className="text-xs font-semibold text-[var(--foreground-secondary)]">
                      Cargando opciones de pago rápido...
                    </p>
                  </div>
                )}
              </div>

              {/* Footer reassurance */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--foreground-tertiary)] text-center font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pago procesado con cifrado bancario de Stripe</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
