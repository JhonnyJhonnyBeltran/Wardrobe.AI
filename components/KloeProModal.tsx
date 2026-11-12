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
  DEFAULT_PLAN_PRICING,
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
  const [pricing, setPricing] = useState<RevenueCatPlanPricing>(DEFAULT_PLAN_PRICING);
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
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 36 }}
        transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[5020] bg-[var(--background)] overflow-hidden"
      >
        {/* Animated softly blurred loose clothes floating behind full-screen paywall */}
        <PaywallFloatingGarments className="fixed inset-0 z-0" />

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
    </AnimatePresence>
  );
}
