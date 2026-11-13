'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Crown, Check, ArrowRight, X } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';
import KlozetPaywallContent, { PaywallFloatingGarments } from '@/components/KlozetPaywallContent';
import {
  DEFAULT_PLAN_PRICING,
  isNativeCapacitor,
  fetchRevenueCatOfferings,
  purchaseRevenueCatPlan,
  restoreKlozetPurchases,
  type RevenueCatPlanPricing,
} from '@/lib/revenuecat/client';

export default function PremiumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPaywall, setLoadingPaywall] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pricing, setPricing] = useState<RevenueCatPlanPricing>(DEFAULT_PLAN_PRICING);

  const { openPremiumModal } = useUiStore();
  const { user, isPremium, refreshProfile } = useUser();
  const isNative = isNativeCapacitor();
  const isPaidUser = isPremium();

  useEffect(() => {
    const subscribed = searchParams.get('subscribed');
    const sessionId = searchParams.get('session_id');

    if (subscribed === 'success') {
      if (sessionId) {
        fetch('/api/stripe/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
          .then(async (res) => {
            if (res.ok) {
              await refreshProfile();
              toast.success('¡Bienvenido a Klozet Pro! Tu suscripción ya está activa.');
              router.push('/closet/kloe');
            }
          })
          .catch(() => {
            toast.success('¡Bienvenido a Klozet Pro!');
          });
      } else {
        toast.success('¡Bienvenido a Klozet Pro! Tu suscripción ya está activa.');
      }
    }
  }, [searchParams, refreshProfile, router]);

  useEffect(() => {
    let mounted = true;
    fetchRevenueCatOfferings(user?.id).then((livePricing) => {
      if (mounted) setPricing(livePricing);
    });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Swipe right to go back
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX - touchStartX > 100) {
        router.back();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router]);

  const handleOpenPaymentModal = async () => {
    if (loadingPaywall || restoring) return;
    setLoadingPaywall(true);
    try {
      haptics.tap();
      if (isNative) {
        const res = await purchaseRevenueCatPlan({
          plan: selectedPlan,
          appUserId: user?.id,
          customerEmail: user?.email,
        });
        if (res.purchasedOrRestored) {
          haptics.success();
          await refreshProfile();
          toast.success('¡Bienvenido a Klozet Pro!');
          router.push('/closet/kloe');
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

      // Web: Direct Stripe Checkout session
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || 'No se pudo iniciar la pasarela de pago');
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('No se recibió la URL de pago de Stripe.');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar la suscripción con Stripe.');
    } finally {
      setLoadingPaywall(false);
    }
  };

  const handleRestore = async () => {
    if (restoring || loadingPaywall) return;
    setRestoring(true);
    try {
      const restored = await restoreKlozetPurchases(user?.id);
      if (restored) {
        haptics.success();
        await refreshProfile();
        toast.success('¡Suscripción Klozet Pro restaurada!');
        router.push('/closet/kloe');
      } else {
        toast.info('No encontramos suscripciones activas previas.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al restaurar compras.');
    } finally {
      setRestoring(false);
    }
  };

  if (isPaidUser && searchParams.get('subscribed') !== 'success') {
    return (
      <div className="relative h-[100dvh] w-full bg-[var(--background)] flex flex-col items-center justify-between p-6">
        <header className="w-full flex items-center justify-between pt-safe">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full apple-glass-bar flex items-center justify-center text-[var(--foreground)] hover:opacity-75 transition-opacity cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--brand-pink)] text-white">
            Klozet Pro Activo
          </span>
          <div className="w-10" />
        </header>

        <div className="max-w-md w-full text-center flex flex-col items-center my-auto">
          <div className="w-20 h-20 rounded-3xl bg-[var(--brand-pink)]/15 border border-[var(--brand-pink)]/30 flex items-center justify-center mb-6 shadow-xl">
            <Crown className="w-10 h-10 text-[var(--brand-pink)]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)] mb-2">
            Ya eres Klozet Pro
          </h1>
          <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-8 max-w-xs">
            Tienes acceso completo a todas las funciones avanzadas de Kloe, widgets en vivo de iOS y análisis sin límites.
          </p>

          <div className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 mb-6 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-[var(--foreground)] font-medium">
              <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
              <span>Consultas diarias con Kloe aumentadas a 35</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[var(--foreground)] font-medium">
              <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
              <span>Adjuntar prendas, looks guardados y fotos a Kloe</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[var(--foreground)] font-medium">
              <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
              <span>Widgets de hoy para pantalla de inicio iOS</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[var(--foreground)] font-medium">
              <Check className="w-4 h-4 text-[var(--brand-pink)] shrink-0" />
              <span>Experiencia 100% libre de anuncios patrocinados</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/closet/kloe')}
            className="w-full py-4 rounded-full kz-pink-surface border border-white/25 text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
          >
            <span>Ir a chatear con Kloe</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pb-safe text-[11px] text-[var(--foreground-tertiary)]">
          Estado: Suscripción Activa
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full bg-[var(--background)] overflow-hidden">
      {/* Animated softly blurred loose clothes floating behind full-screen paywall */}
      <PaywallFloatingGarments className="fixed inset-0 z-0" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 h-full w-full"
      >
        <KlozetPaywallContent
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
          pricing={pricing}
          loading={loadingPaywall}
          restoring={restoring}
          isNative={isNative}
          onStartCheckout={handleOpenPaymentModal}
          onRestorePurchases={handleRestore}
          onDismiss={() => router.back()}
        />
      </motion.div>
    </div>
  );
}
