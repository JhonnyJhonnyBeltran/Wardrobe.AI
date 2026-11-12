'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useUser } from '@/store';
import { haptics } from '@/lib/haptic';
import KlozetPaywallContent, { PaywallFloatingGarments } from '@/components/KlozetPaywallContent';
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
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Custom Klozet Pro Paywall Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar bg-[var(--background)] border-t sm:border border-[var(--border-color)] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6"
        >
          {/* Animated softly blurred loose clothes floating behind paywall */}
          <PaywallFloatingGarments className="absolute inset-0 z-0" />

          {/* iOS Sheet Handle */}
          <div className="relative z-10 w-12 h-1 bg-[var(--foreground-tertiary)]/30 rounded-full mx-auto mb-3 sm:hidden" />

          <KlozetPaywallContent
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            pricing={pricing}
            loading={loading}
            restoring={restoring}
            isNative={isNative}
            onStartCheckout={handleStartCheckout}
            onRestorePurchases={handleRestorePurchases}
            onDismiss={handleDismiss}
            onOpenWidgetsPage={() => {
              onClose();
              router.push('/widgets');
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
