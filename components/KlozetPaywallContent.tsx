'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Loader2,
  MessageCircle,
  Bookmark,
  Ban,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import KloeMascot from '@/components/KloeMascot';
import IosWidgetPreview from '@/components/IosWidgetPreview';
import { MAX_PER_DAY_FREE, MAX_PER_DAY_PREMIUM } from '@/lib/closy/rateLimiter';
import type { RevenueCatPlanPricing } from '@/lib/revenuecat/client';

const FLOATING_GARMENTS = [
  { src: '/landing/piezas/chaqueta-militar.png', cls: 'top-16 -left-8 w-28 h-28 sm:w-32 sm:h-32 -rotate-12', dy: -10, dur: 6.2 },
  { src: '/landing/piezas/gafas-miumiu.png', cls: 'top-24 -right-6 w-24 h-24 sm:w-28 sm:h-28 rotate-12', dy: 12, dur: 7.1 },
  { src: '/landing/piezas/bolso-ante-beige.png', cls: 'top-[42%] -left-10 w-28 h-28 sm:w-32 sm:h-32 rotate-6', dy: -12, dur: 7.8 },
  { src: '/landing/piezas/jersey-rayas-hombre.png', cls: 'top-[48%] -right-10 w-32 h-32 sm:w-36 sm:h-36 -rotate-6', dy: 10, dur: 6.8 },
  { src: '/landing/piezas/jeans-wide-mujer.png', cls: 'bottom-28 -left-8 w-28 h-28 sm:w-32 sm:h-32 rotate-12', dy: -9, dur: 7.4 },
  { src: '/landing/piezas/zapatillas-margiela.png', cls: 'bottom-24 -right-6 w-28 h-28 sm:w-32 sm:h-32 -rotate-12', dy: 11, dur: 6.5 },
];

export const PAYWALL_FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Widgets personalizados en tu iPhone',
    desc: 'Lleva tu outfit de hoy con temperatura y ciudad en formato cuadrado o alargado.',
  },
  {
    icon: MessageCircle,
    title: `Hasta ${MAX_PER_DAY_PREMIUM} conversaciones diarias con Kloe`,
    desc: `El máximo diario completo disponible (en lugar de las ${MAX_PER_DAY_FREE} gratuitas).`,
  },
  {
    icon: Bookmark,
    title: 'Pásale a Kloe prendas y posts guardados',
    desc: 'Adjunta cualquier prenda o look guardado para recibir asesoría al instante.',
  },
  {
    icon: Ban,
    title: 'Feed limpio sin anuncios',
    desc: 'Explora looks en tu feed y en búsquedas sin tarjetas promocionales.',
  },
];

const DEADLINE_KEY = 'klozet_black_friday_deadline_v1';
const WINDOW_MS = (2 * 86400 + 14 * 3600 + 38 * 60 + 19) * 1000;

function getPaywallCampaign(): { title: string; badge: string; subtitle: string } {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed (10 = Nov, 11 = Dec)
  const day = now.getDate();
  const isBlackFridayWindow = month === 10 || (month === 11 && day <= 6);

  if (isBlackFridayWindow) {
    return {
      title: 'Black Friday',
      badge: 'Oferta Black Friday',
      subtitle: 'Hasta un 40% de descuento activo',
    };
  }

  return {
    title: 'Oferta especial',
    badge: 'Oferta activa · -40%',
    subtitle: 'Descuento permanente del 30% al 40%',
  };
}

function formatParts(ms: number) {
  const safe = Math.max(0, ms);
  const totalSec = Math.floor(safe / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return [
    { val: String(days).padStart(2, '0'), label: 'días' },
    { val: String(hours).padStart(2, '0'), label: 'hrs' },
    { val: String(mins).padStart(2, '0'), label: 'min' },
    { val: String(secs).padStart(2, '0'), label: 'seg' },
  ];
}

export function PaywallFloatingGarments({ className = '' }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`} aria-hidden="true">
      {FLOATING_GARMENTS.map((item, idx) => (
        <motion.img
          key={item.src}
          src={item.src}
          alt=""
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, item.dy, 0],
                }
          }
          transition={{
            duration: item.dur,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: idx * 0.35,
          }}
          className={`absolute object-contain opacity-30 dark:opacity-25 blur-[4px] ${item.cls}`}
        />
      ))}
    </div>
  );
}

interface KlozetPaywallContentProps {
  selectedPlan: 'monthly' | 'yearly';
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
  pricing: RevenueCatPlanPricing;
  loading: boolean;
  restoring: boolean;
  isNative: boolean;
  onStartCheckout: () => void;
  onRestorePurchases: () => void;
  onDismiss: () => void;
  onOpenWidgetsPage?: () => void;
}

/**
 * Full-screen scrollable Klozet Pro Paywall UI:
 * - Pinned top glass header (close + restore)
 * - Smooth vertical scroll viewport (Hero + Countdown + Discounted Plan Cards + Widgets + All Benefits)
 * - Permanent 30%–40% promo framing (Black Friday in Nov/early Dec, Oferta especial year-round) with previous crossed-out price
 * - Pinned bottom glass CTA dock so primary CTA & legal notice are never clipped or hidden
 */
export default function KlozetPaywallContent({
  selectedPlan,
  onSelectPlan,
  pricing,
  loading,
  restoring,
  isNative,
  onStartCheckout,
  onRestorePurchases,
  onDismiss,
  onOpenWidgetsPage,
}: KlozetPaywallContentProps) {
  const [widgetVariant, setWidgetVariant] = useState<'wide' | 'square'>('wide');
  const [showAllIncluded, setShowAllIncluded] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number>(WINDOW_MS);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const featuresEndRef = useRef<HTMLDivElement>(null);

  const campaign = getPaywallCampaign();

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let target = Date.now() + WINDOW_MS;
    try {
      const saved = Number(localStorage.getItem(DEADLINE_KEY));
      if (Number.isFinite(saved) && saved > Date.now() + 3600_000) {
        target = saved;
      } else {
        localStorage.setItem(DEADLINE_KEY, String(target));
      }
    } catch {}

    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const timerParts = formatParts(remainingMs);

  const handleScrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleAllIncluded = () => {
    setShowAllIncluded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          featuresEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 220);
      }
      return next;
    });
  };

  const activePrice = selectedPlan === 'yearly' ? pricing.yearlyPrice : pricing.monthlyPrice;
  const activeOriginalPrice =
    selectedPlan === 'yearly' ? pricing.yearlyOriginalPrice : pricing.monthlyOriginalPrice;
  const activePeriod = selectedPlan === 'yearly' ? '/año' : '/mes';

  return (
    <div className="relative z-10 flex flex-col h-[100dvh] w-full overflow-hidden">
      {/* Pinned Top Bar: circular X left + Restore right */}
      <header className="shrink-0 z-30 apple-glass-bar border-b border-[var(--border-color)]/60 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2.5 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onDismiss}
            className="w-10 h-10 rounded-full bg-[var(--card-bg)]/90 border border-[var(--border-color)] hover:border-[var(--brand-pink)]/45 flex items-center justify-center text-[var(--foreground)] transition-all active:scale-95 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-pink)]">
            Klozet Pro
          </span>

          <button
            type="button"
            onClick={onRestorePurchases}
            disabled={restoring || loading}
            className="h-10 px-3.5 rounded-full text-xs font-semibold text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] hover:bg-[var(--card-bg)]/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            {restoring ? 'Restaurando...' : 'Restaurar'}
          </button>
        </div>
      </header>

      {/* Full-Screen Scrollable Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-md mx-auto w-full px-4 sm:px-5 pt-4 pb-8">
          {/* Hero: Bare Kloe K (NO circle / NO box) beside big bold Black Friday / Promo title */}
          <div className="flex items-center justify-center gap-3.5 sm:gap-4 pt-1 pb-4">
            <KloeMascot
              mood="excited"
              size="xl"
              variant="pink"
              interactive
              className="-rotate-3 shrink-0"
            />

            <div className="text-left min-w-0">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-pink)] mb-0.5">
                {campaign.badge}
              </span>
              <h2 className="font-display text-[32px] sm:text-[38px] font-bold tracking-tight leading-[0.95] text-[var(--foreground)]">
                {campaign.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[var(--foreground-secondary)] mt-1">
                {campaign.subtitle}
              </p>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex flex-col items-center mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--foreground-tertiary)] mb-1.5">
              Termina en
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 font-display tabular-nums">
              {timerParts.map((part, idx) => (
                <React.Fragment key={part.label}>
                  <div className="flex flex-col items-center min-w-[38px]">
                    <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)] leading-none">
                      {part.val}
                    </span>
                    <span className="text-[9px] font-medium text-[var(--foreground-tertiary)] mt-0.5 uppercase tracking-wider">
                      {part.label}
                    </span>
                  </div>
                  {idx < timerParts.length - 1 && (
                    <span className="text-lg font-bold text-[var(--brand-pink)] -mt-3">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Stacked Offer Plan Selector Cards (previous crossed-out price + discounted price on both plans) */}
          <div className="space-y-3 mb-4 pt-2">
            {/* Yearly Offer Card */}
            <div
              onClick={() => onSelectPlan('yearly')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPlan('yearly'); } }}
              className={`relative rounded-2xl border-2 px-4 py-4 pt-5 cursor-pointer transition-all backdrop-blur-md active:scale-[0.99] ${
                selectedPlan === 'yearly'
                  ? 'border-[var(--brand-pink)] bg-[var(--card-bg)]/95 shadow-[0_10px_28px_-10px_rgba(255,102,196,0.3)]'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)]/85 hover:border-[var(--brand-pink)]/45'
              }`}
            >
              {/* Floating top pill overlapping card border */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full kz-pink-surface border border-white/25 text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                {campaign.badge}
              </span>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[var(--foreground)]">Plan Anual</span>
                    <span className="text-xs font-semibold text-[var(--foreground-tertiary)] line-through tabular-nums">
                      {pricing.yearlyOriginalPrice}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display text-2xl font-bold text-[var(--foreground)] tabular-nums">
                      {pricing.yearlyPrice}
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground-secondary)]">/año</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--brand-pink)] mt-0.5">
                    {pricing.yearlyMonthlyPrice} · Todo incluido
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="px-3 py-1.5 rounded-full kz-pink-surface border border-white/25 text-white text-xs font-bold whitespace-nowrap">
                    Ahorra {pricing.yearlyDiscountPercent}%
                  </span>
                  <div
                    className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'yearly'
                        ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]'
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    {selectedPlan === 'yearly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Card (with previous crossed-out price + 30% discount badge) */}
            <div
              onClick={() => onSelectPlan('monthly')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPlan('monthly'); } }}
              className={`rounded-2xl border-2 px-4 py-3.5 cursor-pointer transition-all flex items-center justify-between gap-3 backdrop-blur-md active:scale-[0.99] ${
                selectedPlan === 'monthly'
                  ? 'border-[var(--brand-pink)] bg-[var(--card-bg)]/95 shadow-[0_8px_24px_-10px_rgba(255,102,196,0.25)]'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)]/85 hover:border-[var(--brand-pink)]/45'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[var(--foreground)]">Plan Mensual</span>
                  <span className="text-xs font-semibold text-[var(--foreground-tertiary)] line-through tabular-nums">
                    {pricing.monthlyOriginalPrice}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display text-xl font-bold text-[var(--foreground)] tabular-nums">
                    {pricing.monthlyPrice}
                  </span>
                  <span className="text-xs font-medium text-[var(--foreground-secondary)]">/mes</span>
                </div>
                <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5">
                  Cancela cuando quieras
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-[var(--brand-pink)]/12 border border-[var(--brand-pink)]/30 text-[var(--brand-pink-dark,#ED4C9E)] dark:text-[var(--brand-pink)] text-[11px] font-bold whitespace-nowrap">
                  -{pricing.monthlyDiscountPercent}%
                </span>
                <div
                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPlan === 'monthly'
                      ? 'border-[var(--brand-pink)] bg-[var(--brand-pink)]'
                      : 'border-[var(--border-color)]'
                  }`}
                >
                  {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll cue to discover Widgets & Full Breakdown below */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleScrollToDetails}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[var(--foreground-secondary)] hover:text-[var(--brand-pink)] bg-[var(--card-bg)]/70 border border-[var(--border-color)] transition-colors cursor-pointer"
            >
              <span>Desliza para ver widgets y ventajas</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
            </button>
          </div>

          {/* Live iOS Home Screen Widgets Showcase */}
          <div
            ref={detailsRef}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]/88 backdrop-blur-md p-3.5 sm:p-4 mb-3.5"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-[var(--foreground)]">
                Widgets de iOS incluidos
              </span>
              <div className="inline-flex rounded-full p-0.5 bg-[var(--background-secondary)] border border-[var(--border-color)] shrink-0">
                <button
                  type="button"
                  onClick={() => setWidgetVariant('wide')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    widgetVariant === 'wide'
                      ? 'kz-pink-surface text-white border border-white/25'
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Alargado
                </button>
                <button
                  type="button"
                  onClick={() => setWidgetVariant('square')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    widgetVariant === 'square'
                      ? 'kz-pink-surface text-white border border-white/25'
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Cuadrado
                </button>
              </div>
            </div>

            <div className="flex justify-center overflow-hidden py-0.5">
              <IosWidgetPreview
                size={widgetVariant}
                city="Sevilla"
                temp={21}
                outfit={null}
                appearance={isDark ? 'dark' : 'light'}
                interactiveHref="/widgets"
              />
            </div>

            <div className="mt-3 flex justify-end">
              {onOpenWidgetsPage ? (
                <button
                  type="button"
                  onClick={onOpenWidgetsPage}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-pink)] hover:underline cursor-pointer"
                >
                  <span>Personalizar widgets</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href="/widgets"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-pink)] hover:underline"
                >
                  <span>Personalizar widgets</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Collapsible "Ver todo lo que incluye" section */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]/88 backdrop-blur-md overflow-hidden mb-3">
            <button
              type="button"
              onClick={handleToggleAllIncluded}
              className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-[var(--foreground)] hover:bg-[var(--background-secondary)]/50 transition-colors cursor-pointer"
              aria-expanded={showAllIncluded}
            >
              <span>Ver todo lo que incluye</span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--brand-pink)] transition-transform duration-200 ${
                  showAllIncluded ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {showAllIncluded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden border-t border-[var(--border-color)]/60"
                >
                  <div className="px-4 py-3.5 space-y-3.5">
                    {PAYWALL_FEATURES.map((feat) => {
                      const Icon = feat.icon;
                      return (
                        <div key={feat.title} className="flex items-start gap-3 text-left">
                          <Icon className="w-4 h-4 text-[var(--brand-pink)] shrink-0 mt-0.5" strokeWidth={2.2} />
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={featuresEndRef} className="h-2" />
        </div>
      </div>

      {/* Pinned Bottom Checkout Dock: CTA + Auto-renew notice always unclipped and legible */}
      <footer className="shrink-0 z-30 apple-glass-bar border-t border-[var(--border-color)]/70 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={onStartCheckout}
            disabled={loading || restoring}
            className="w-full h-12 px-5 rounded-full kz-pink-surface border border-white/25 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-65 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <span className="flex items-center justify-center gap-2 flex-wrap">
                <span>Continuar</span>
                <span className="text-white/75 line-through text-xs font-medium tabular-nums">
                  {activeOriginalPrice}
                </span>
                <span className="tabular-nums">
                  {activePrice}
                  {activePeriod}
                </span>
              </span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-[var(--foreground-secondary)] text-center font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Renovable automáticamente · Cancela cuando quieras ·{' '}
              {isNative ? 'Apple & RevenueCat' : 'RevenueCat'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
