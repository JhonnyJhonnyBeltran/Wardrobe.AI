'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';
import KlozetPaywallContent, { PaywallFloatingGarments } from '@/components/KlozetPaywallContent';
import {
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
  const [pricing, setPricing] = useState<RevenueCatPlanPricing>({
    yearlyPrice: '24,99 €',
    yearlyMonthlyPrice: '~2,08 €/mes',
    monthlyPrice: '2,99 €',
    hasLiveOffering: false,
  });

  const { openPremiumModal } = useUiStore();
  const { user, refreshProfile } = useUser();
  const isNative = isNativeCapacitor();

  useEffect(() => {
    if (searchParams.get('subscribed') === 'success' || searchParams.get('success') === 'true') {
      toast.success('¡Bienvenido a Klozet Pro! Tu suscripción ya está activa.');
    }
  }, [searchParams]);

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
        if (!isNative) {
          openPremiumModal(selectedPlan);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar la suscripción con RevenueCat.');
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

  return (
    <div className="relative min-h-screen bg-[var(--background)] overflow-x-hidden pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-safe">
      {/* Animated softly blurred loose clothes floating behind paywall */}
      <PaywallFloatingGarments className="fixed inset-0 z-0 max-w-2xl mx-auto" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 max-w-md mx-auto px-4 pt-4 sm:pt-8 pb-8"
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
