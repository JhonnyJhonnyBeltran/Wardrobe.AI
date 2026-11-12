'use client';

import { motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Zap,
  RotateCcw,
  Loader2,
  LayoutGrid,
  MessageCircle,
  Bookmark,
  Ban,
  Check,
  ArrowRight,
} from 'lucide-react';
import { LogoMark } from '@/components';
import KloeMascot from '@/components/KloeMascot';
import IosWidgetPreview from '@/components/IosWidgetPreview';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';
import { haptics } from '@/lib/haptic';
import { MAX_PER_DAY_FREE, MAX_PER_DAY_PREMIUM } from '@/lib/closy/rateLimiter';
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
  const [widgetVariant, setWidgetVariant] = useState<'square' | 'wide'>('wide');
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

  const benefits = [
    {
      icon: LayoutGrid,
      title: 'Widgets personalizados en tu iPhone',
      desc: 'Lleva tu outfit de hoy con temperatura y ciudad en formato cuadrado o alargado.',
    },
    {
      icon: MessageCircle,
      title: `Hasta ${MAX_PER_DAY_PREMIUM} conversaciones diarias con Kloe`,
      desc: `El máximo diario completo disponible (frente a las ${MAX_PER_DAY_FREE} gratuitas).`,
    },
    {
      icon: Bookmark,
      title: 'Pásale a Kloe prendas y posts guardados',
      desc: 'Adjunta cualquier look guardado o prenda de tu armario para que te asesore al instante.',
    },
    {
      icon: Ban,
      title: 'Sin anuncios en tu feed',
      desc: 'Navega por todo el feed y la pestaña de búsqueda sin tarjetas promocionales.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Apple Glass Header */}
      <header className="sticky top-0 z-30 apple-glass-bar pt-safe border-b border-[var(--border-color)]">
        <div className="px-4 min-h-14 flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            aria-label="Volver"
          >
            <X className="w-6 h-6" />
          </button>
          <LogoMark size="sm" />
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero with Kloe Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mb-5 flex justify-center">
            <div className="w-24 h-24 rounded-[28px] bg-[var(--brand-pink)]/12 border border-[var(--brand-pink)]/30 flex items-center justify-center shadow-sm">
              <KloeMascot mood="excited" size="lg" variant="pink" interactive />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2.5 tracking-tight">
            Desbloquea <span className="text-[var(--brand-pink)]">Klozet Pro</span>
          </h1>
          <p className="text-sm text-[var(--foreground-secondary)] max-w-md mx-auto leading-relaxed">
            Kloe sin límites diarios en tu armario, asesoría con tus guardados, widgets de iOS y feed limpio sin anuncios.
          </p>
        </motion.div>

        {/* Plans Selection (RevenueCat Offerings) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-3 mb-7"
        >
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'yearly'
                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 ring-1 ring-[var(--brand-pink)]'
                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="bg-[var(--brand-pink)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
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
            <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-1">Plan Anual</div>
            <div className="text-2xl font-bold text-[var(--foreground)]">{pricing.yearlyPrice}</div>
            <div className="text-[11px] font-bold text-[var(--brand-pink)] mt-0.5">
              {pricing.yearlyMonthlyPrice} · al año
            </div>
          </div>

          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'monthly'
                ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]/10 ring-1 ring-[var(--brand-pink)]'
                : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--brand-pink)]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--foreground-tertiary)]">Mensual</span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly' ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]' : 'border-[var(--border-color)]'
                }`}
              >
                {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </div>
            </div>
            <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-1">Plan Mensual</div>
            <div className="text-2xl font-bold text-[var(--foreground)]">{pricing.monthlyPrice}</div>
            <div className="text-[11px] text-[var(--foreground-tertiary)] mt-0.5">Facturado mensualmente</div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 mb-7"
        >
          <h2 className="text-xs font-bold text-[var(--foreground-secondary)] tracking-wide mb-4">
            Todo lo que incluye tu suscripción
          </h2>

          <div className="divide-y divide-[var(--border-color)]">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="py-3.5 flex items-start gap-3 first:pt-0 last:pb-0">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--brand-pink)]/15 flex items-center justify-center mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-[var(--brand-pink)]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--foreground)]">{benefit.title}</div>
                    <div className="text-xs text-[var(--foreground-tertiary)] mt-0.5">{benefit.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive iOS Widget Preview inside Paywall Page */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 mb-7"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">Vista previa de tus Widgets iOS</h2>
              <p className="text-xs text-[var(--foreground-tertiary)]">
                Cuadrado y alargado con temperatura, lugar y Kloe.
              </p>
            </div>
            <div className="inline-flex rounded-full p-1 bg-[var(--background-secondary)] border border-[var(--border-color)] shrink-0">
              <button
                type="button"
                onClick={() => setWidgetVariant('wide')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  widgetVariant === 'wide' ? 'bg-[var(--brand-pink)] text-white' : 'text-[var(--foreground-secondary)]'
                }`}
              >
                Alargado
              </button>
              <button
                type="button"
                onClick={() => setWidgetVariant('square')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  widgetVariant === 'square' ? 'bg-[var(--brand-pink)] text-white' : 'text-[var(--foreground-secondary)]'
                }`}
              >
                Cuadrado
              </button>
            </div>
          </div>

          <div className="flex justify-center py-4 px-2 rounded-2xl bg-[var(--background-secondary)]/70 border border-[var(--border-color)]">
            <IosWidgetPreview
              size={widgetVariant}
              city="Sevilla"
              temp={21}
              outfit={null}
              appearance="light"
              interactiveHref="/widgets"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <Link
              href="/widgets"
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-pink)] hover:underline"
            >
              <span>Personalizar widgets con mi outfit de hoy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Action Buttons (RevenueCat only) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="space-y-3 mb-6"
        >
          <button
            type="button"
            onClick={handleOpenPaymentModal}
            disabled={loadingPaywall || restoring}
            className="w-full py-4 px-6 rounded-full bg-[var(--brand-pink)] text-white font-bold text-base hover:opacity-95 active:scale-[0.98] transition-all shadow-xl shadow-[var(--brand-pink)]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loadingPaywall ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 fill-white" />
            )}
            <span>
              {isNative
                ? `Continuar con App Store (${selectedPlan === 'yearly' ? pricing.yearlyPrice : pricing.monthlyPrice})`
                : `Suscribirme (${selectedPlan === 'yearly' ? `${pricing.yearlyPrice}/año` : `${pricing.monthlyPrice}/mes`})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={restoring || loadingPaywall}
            className="w-full py-3 px-6 rounded-full bg-[var(--background-secondary)] text-[var(--foreground)] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--background-tertiary)] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            <span>Restaurar compras</span>
          </button>

          <div className="flex items-center justify-center gap-3 text-xs text-[var(--foreground-tertiary)] flex-wrap text-center">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {isNative ? 'Gestionado de forma segura por Apple & RevenueCat' : 'Gestionado de forma segura por RevenueCat'}
            </span>
            <span>•</span>
            <span>Cancela cuando quieras</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
