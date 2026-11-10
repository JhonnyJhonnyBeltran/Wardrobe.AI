'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  X,
  ChevronLeft,
  Lock,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripeClientPromise } from '@/lib/stripe/stripeClientPromise';
import { useUser } from '@/store';
import { haptics } from '@/lib/haptic';
import {
  isNativeCapacitor,
  presentNativePaywall,
  presentWebPaywall,
  restoreKlozetPurchases,
} from '@/lib/revenuecat/client';

interface KloeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'monthly' | 'yearly';
  redirectBackToCloset?: boolean;
}

export default function KloeProModal({
  isOpen,
  onClose,
  defaultPlan = 'yearly',
  redirectBackToCloset = false,
}: KloeProModalProps) {
  const router = useRouter();
  const { user, refreshProfile } = useUser();
  const [view, setView] = useState<'plans' | 'rc-web' | 'checkout'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(defaultPlan);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const rcWebContainerRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef(false);

  const isNative = isNativeCapacitor();

  const stripePromise = useMemo(
    () => (isOpen && view === 'checkout' && clientSecret ? getStripeClientPromise() : null),
    [isOpen, view, clientSecret]
  );

  useBodyScrollLock(isOpen);

  useEffect(() => {
    setSelectedPlan(defaultPlan);
  }, [defaultPlan, isOpen]);

  // Reset view when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setView('plans');
      setClientSecret(null);
      setLoading(false);
      setRestoring(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    onClose();
    if (redirectBackToCloset) {
      router.push('/closet');
    }
  };

  const openStripeCheckoutFallback = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: selectedPlan,
        embedded: true,
      }),
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
  };

  const handleStartCheckout = async () => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      haptics.tap();

      // Native iOS / Android (App Store StoreKit / Google Play / RevenueCat Test Store)
      if (isNative) {
        const res = await presentNativePaywall(user?.id);
        if (res.purchasedOrRestored) {
          haptics.success();
          await refreshProfile();
          toast.success('¡Bienvenido a Klozet Pro!');
          handleDismiss();
          return;
        }
        if (res.cancelled) {
          return;
        }
        if (res.error) {
          toast.error(res.error);
        }
        return;
      }

      // Web Browser: try RevenueCat Web Paywall first, fallback seamlessly to Stripe Embedded Checkout
      setView('rc-web');
      await new Promise((r) => setTimeout(r, 40));

      if (rcWebContainerRef.current) {
        const rcRes = await presentWebPaywall({
          htmlTarget: rcWebContainerRef.current,
          appUserId: user?.id,
          customerEmail: user?.email,
          onBack: () => setView('plans'),
        });

        if (rcRes.purchasedOrRestored) {
          haptics.success();
          await refreshProfile();
          toast.success('¡Bienvenido a Klozet Pro!');
          handleDismiss();
          return;
        }

        if (rcRes.cancelled) {
          setView('plans');
          return;
        }

        if (!rcRes.fallbackToStripe && rcRes.error) {
          toast.error(rcRes.error);
          setView('plans');
          return;
        }
      }

      // Stripe Embedded Checkout fallback on Web
      await openStripeCheckoutFallback();
    } catch (err: any) {
      console.error('[KloeProModal] Checkout error:', err);
      toast.error(err.message || 'Hubo un error al abrir el pago. Inténtalo de nuevo.');
      setView('plans');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleRestorePurchases = async () => {
    if (restoring || loading) return;
    setRestoring(true);
    try {
      haptics.selection();
      const restored = await restoreKlozetPurchases(user?.id);
      if (restored) {
        haptics.success();
        await refreshProfile();
        toast.success('¡Suscripción Klozet Pro restaurada!');
        handleDismiss();
      } else {
        toast.info('No encontramos compras activas asociadas a tu cuenta.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'No se pudieron restaurar las compras.');
    } finally {
      setRestoring(false);
    }
  };

  const features = [
    'Estilismo personal con Kloe 24/7 (hasta 35 consultas/día)',
    'Análisis contextual de tus prendas, outfits y posts',
    'Montaje directo de outfits recomendados en el lienzo',
    'Recomendaciones adaptadas a tu morfología y clima local',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className={`relative w-full ${
            view !== 'plans' ? 'max-w-lg' : 'max-w-md'
          } max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto no-scrollbar bg-[var(--card-bg)] border-t sm:border border-[var(--border-color)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 transition-all duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6`}
        >
          {/* iOS Drawer Handle (Mobile Only) */}
          <div className="w-12 h-1 bg-[var(--foreground-tertiary)]/30 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Top Actions */}
          <div className="flex items-center justify-between mb-2">
            {view !== 'plans' ? (
              <button
                onClick={() => setView('plans')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)] hover:text-[var(--brand-pink)] py-2 px-3 -ml-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--brand-pink)]" />
                <span>Elegir otro plan</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleDismiss}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
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
                    alt="Klozet Pro"
                    fill
                    className="object-contain"
                  />
                </div>

                <h3 className="text-xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
                  Desbloquea <span className="text-[var(--brand-pink)]">Klozet Pro</span>
                </h3>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1.5 max-w-xs leading-relaxed font-medium">
                  Estilismo completo con Kloe, análisis contextual de looks y recomendaciones a tu medida. Tu armario y calendario siguen siendo gratis.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-2 mb-5 bg-[var(--background-secondary)]/60 rounded-2xl p-3.5 border border-[var(--border-color)]">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-left">
                    <div className="w-4 h-4 rounded-full bg-[var(--brand-pink)] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-medium text-[var(--foreground)] leading-tight">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
                <div
                  onClick={() => setSelectedPlan('yearly')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between active:scale-[0.98] ${
                    selectedPlan === 'yearly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 ring-1 ring-[var(--brand-pink)]'
                      : 'border-[var(--border-color)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-pink)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--brand-pink)] text-white tracking-wide">
                      Ahorra 30%
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'yearly' ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]' : 'border-[var(--border-color)]'
                      }`}
                    >
                      {selectedPlan === 'yearly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">Plan Anual</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">24,99 €</span>
                      <span className="text-[10px] text-[var(--foreground-secondary)] font-medium">/año</span>
                    </div>
                    <p className="text-[11px] text-[var(--brand-pink)] font-bold mt-1">
                      ~2,08 € / mes
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between active:scale-[0.98] ${
                    selectedPlan === 'monthly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 ring-1 ring-[var(--brand-pink)]'
                      : 'border-[var(--border-color)] bg-[var(--background-secondary)]/50 hover:border-[var(--brand-pink)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[var(--foreground-tertiary)] tracking-wide">
                      Mensual
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'monthly' ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]' : 'border-[var(--border-color)]'
                      }`}
                    >
                      {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">Plan Mensual</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">2,99 €</span>
                      <span className="text-[10px] text-[var(--foreground-secondary)] font-medium">/mes</span>
                    </div>
                    <p className="text-[11px] text-[var(--foreground-tertiary)] font-medium mt-1">
                      Cancela cuando quieras
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleStartCheckout}
                disabled={loading || restoring}
                className="w-full h-12 py-3 px-6 rounded-full bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-dark)] text-white font-semibold text-sm shadow-lg shadow-[var(--brand-pink)]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{isNative ? 'Suscribirme en App Store' : 'Continuar al pago'}</span>
                  </>
                )}
              </button>

              {isNative && (
                <button
                  type="button"
                  onClick={handleRestorePurchases}
                  disabled={restoring || loading}
                  className="w-full h-11 mt-2.5 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-60 cursor-pointer"
                >
                  {restoring ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Restaurar compras</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-[var(--foreground-tertiary)] text-center font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {isNative ? 'Pago seguro gestionado por Apple' : 'Pago seguro con Apple Pay, Google Pay o Tarjeta'}
                </span>
              </div>
            </>
          ) : view === 'rc-web' ? (
            <div className="space-y-3">
              <div
                ref={rcWebContainerRef}
                className="w-full min-h-[380px] rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)]"
              />
              {loading && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-[var(--foreground-secondary)]">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-pink)]" />
                  <span>Preparando opciones de suscripción...</span>
                </div>
              )}
            </div>
          ) : (
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
                      {selectedPlan === 'yearly' ? '24,99 € / año (~2,08 €/mes)' : '2,99 € / mes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>Cifrado SSL</span>
                </div>
              </div>

              {/* Stripe Embedded Checkout Fallback Container */}
              <div className="w-full min-h-[360px] rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] p-2 sm:p-3">
                {clientSecret ? (
                  <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
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
