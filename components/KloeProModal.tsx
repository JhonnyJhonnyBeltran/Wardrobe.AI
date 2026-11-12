'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  X,
  RotateCcw,
  LayoutGrid,
  MessageCircle,
  Bookmark,
  Ban,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useUser } from '@/store';
import { haptics } from '@/lib/haptic';
import KloeMascot from '@/components/KloeMascot';
import { MAX_PER_DAY_FREE, MAX_PER_DAY_PREMIUM } from '@/lib/closy/rateLimiter';
import {
  isNativeCapacitor,
  fetchRevenueCatOfferings,
  purchaseRevenueCatPlan,
  restoreKlozetPurchases,
  type RevenueCatPlanPricing,
} from '@/lib/revenuecat/client';

interface KloeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'monthly' | 'yearly';
  redirectBackToCloset?: boolean;
}

const PAYWALL_FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Widgets personalizados en tu pantalla',
    desc: 'Tu outfit de hoy con temperatura y lugar en formato cuadrado o alargado.',
  },
  {
    icon: MessageCircle,
    title: `Hasta ${MAX_PER_DAY_PREMIUM} conversaciones diarias con Kloe`,
    desc: `El máximo diario completo (en lugar de las ${MAX_PER_DAY_FREE} gratuitas).`,
  },
  {
    icon: Bookmark,
    title: 'Pásale a Kloe prendas y posts guardados',
    desc: 'Envíale tus prendas o inspiración para que te asesore al instante.',
  },
  {
    icon: Ban,
    title: 'Sin anuncios en tu feed',
    desc: 'Explora looks en el feed y búsquedas sin tarjetas promocionales.',
  },
];

export default function KloeProModal({
  isOpen,
  onClose,
  defaultPlan = 'yearly',
  redirectBackToCloset = false,
}: KloeProModalProps) {
  const router = useRouter();
  const { user, refreshProfile } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(defaultPlan);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pricing, setPricing] = useState<RevenueCatPlanPricing>({
    yearlyPrice: '24,99 €',
    yearlyMonthlyPrice: '~2,08 €/mes',
    monthlyPrice: '2,99 €',
    hasLiveOffering: false,
  });
  const isSubmittingRef = useRef(false);

  const isNative = isNativeCapacitor();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    setSelectedPlan(defaultPlan);
  }, [defaultPlan, isOpen]);

  // Fetch live RevenueCat package pricing when custom paywall opens
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setRestoring(false);
      isSubmittingRef.current = false;
      return;
    }

    let mounted = true;
    fetchRevenueCatOfferings(user?.id).then((livePricing) => {
      if (mounted) {
        setPricing(livePricing);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    onClose();
    if (redirectBackToCloset) {
      router.push('/closet');
    }
  };

  const handleStartCheckout = async () => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      haptics.tap();

      const res = await purchaseRevenueCatPlan({
        plan: selectedPlan,
        appUserId: user?.id,
        customerEmail: user?.email,
      });

      if (res.purchasedOrRestored) {
        haptics.success();
        await refreshProfile();
        toast.success('¡Bienvenido a Klozet Pro!');
        onClose();
        if (redirectBackToCloset) {
          router.push('/closet');
        }
        return;
      }

      if (res.cancelled) {
        return;
      }

      if (res.error) {
        toast.error(res.error);
      }
    } catch (err: any) {
      console.error('[KloeProModal] RevenueCat purchase error:', err);
      toast.error(err?.message || 'No se pudo iniciar la suscripción con RevenueCat.');
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[5000] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Custom Kloe Paywall Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto no-scrollbar bg-[var(--card-bg)] border-t sm:border border-[var(--border-color)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 transition-all duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6"
        >
          {/* iOS Sheet Handle */}
          <div className="w-12 h-1 bg-[var(--foreground-tertiary)]/30 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-1">
            <div className="relative w-14 h-7">
              <Image
                src="/kloe-logo-large.png"
                alt="Kloe"
                fill
                className="object-contain object-left"
              />
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-[var(--background-secondary)]/80 hover:bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <>
              {/* Kloe Mascot Hero */}
              <div className="flex flex-col items-center text-center mt-1 mb-4">
                <div className="w-20 h-20 rounded-[24px] bg-[var(--brand-pink)]/12 border border-[var(--brand-pink)]/25 flex items-center justify-center mb-3 shadow-xs">
                  <KloeMascot mood="excited" size="lg" variant="pink" interactive />
                </div>

                <h3 className="text-xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
                  Desbloquea <span className="text-[var(--brand-pink)]">Klozet Pro</span>
                </h3>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1 max-w-xs leading-relaxed font-medium">
                  Lleva a Kloe al máximo en tu armario y en la pantalla de inicio de tu iPhone.
                </p>
              </div>

              {/* 4 Requested Features List */}
              <div className="space-y-2.5 mb-4 bg-[var(--background-secondary)]/65 rounded-2xl p-3.5 border border-[var(--border-color)]">
                {PAYWALL_FEATURES.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 text-left">
                      <div className="w-7 h-7 rounded-full bg-[var(--brand-pink)]/15 text-[var(--brand-pink)] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--foreground)] leading-snug">
                          {feat.title}
                        </p>
                        <p className="text-[11px] text-[var(--foreground-secondary)] leading-snug mt-0.5">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preview Link to iOS Widgets */}
              <button
                type="button"
                onClick={() => {
                  handleDismiss();
                  router.push('/widgets');
                }}
                className="w-full mb-4 px-3.5 py-2.5 rounded-2xl bg-[var(--background-secondary)]/70 hover:bg-[var(--background-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                  <span>Ver cómo quedan los Widgets de iOS</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-tertiary)]" />
              </button>

              {/* Pricing Cards (RevenueCat Offerings) */}
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
                      <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{pricing.yearlyPrice}</span>
                      <span className="text-[10px] text-[var(--foreground-secondary)] font-medium">/año</span>
                    </div>
                    <p className="text-[11px] text-[var(--brand-pink)] font-bold mt-1">
                      {pricing.yearlyMonthlyPrice}
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
                      <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{pricing.monthlyPrice}</span>
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
                type="button"
                onClick={handleStartCheckout}
                disabled={loading || restoring}
                className="w-full h-12 py-3 px-6 rounded-full bg-[var(--brand-pink)] text-white font-semibold text-sm shadow-lg shadow-[var(--brand-pink)]/30 hover:shadow-[0_0_22px_rgba(255,102,196,0.45)] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando con RevenueCat...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>
                      {isNative
                        ? `Suscribirme (${selectedPlan === 'yearly' ? pricing.yearlyPrice : pricing.monthlyPrice})`
                        : `Continuar (${selectedPlan === 'yearly' ? pricing.yearlyPrice + '/año' : pricing.monthlyPrice + '/mes'})`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRestorePurchases}
                disabled={restoring || loading}
                className="w-full h-10 mt-2.5 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-60 cursor-pointer"
              >
                {restoring ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Restaurar compras</span>
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-[var(--foreground-tertiary)] text-center font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {isNative ? 'Suscripción segura gestionada con Apple & RevenueCat' : 'Pago seguro gestionado por RevenueCat'}
                </span>
              </div>
            </>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
