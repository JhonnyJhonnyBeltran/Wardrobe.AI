/**
 * RevenueCat Unified Client SDK (Native iOS via Capacitor + Web via purchases-js)
 *
 * - On Native iOS (App Store / Xcode / Test Store): uses @revenuecat/purchases-capacitor &
 *   @revenuecat/purchases-capacitor-ui (`RevenueCatUI.presentPaywall()`)
 * - On Web (Next.js Browser): uses @revenuecat/purchases-js (`purchases.presentPaywall()`)
 *   with graceful Stripe fallback if Web Billing isn't active in the RevenueCat dashboard yet.
 * - Entitlement identifier: 'klozet_pro'
 */

import { Capacitor } from '@capacitor/core';

export const REVENUECAT_ENTITLEMENT_ID = 'klozet_pro';

const DEFAULT_TEST_STORE_KEY = 'test_XZNJUZgtJPHbnONEWbcAQHnxNxC';

function getRevenueCatApiKey(platform: 'ios' | 'android' | 'web'): string {
  if (platform === 'ios') {
    return (
      process.env.NEXT_PUBLIC_REVENUECAT_IOS_API_KEY ||
      process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ||
      DEFAULT_TEST_STORE_KEY
    );
  }
  if (platform === 'android') {
    return (
      process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
      process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ||
      DEFAULT_TEST_STORE_KEY
    );
  }
  return (
    process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY ||
    process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ||
    DEFAULT_TEST_STORE_KEY
  );
}

export function isNativeCapacitor(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

export function isNativeIOS(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

let nativeConfigured = false;
let nativeConfigurePromise: Promise<void> | null = null;
let lastIdentifiedNativeUserId: string | null = null;

/**
 * Configures the appropriate RevenueCat SDK for the active runtime (Native Capacitor or Web JS).
 */
export async function initRevenueCat(appUserId?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isNativeCapacitor()) {
    if (nativeConfigurePromise) {
      await nativeConfigurePromise;
    } else if (!nativeConfigured) {
      nativeConfigurePromise = (async () => {
        try {
          const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
          const platform = Capacitor.getPlatform() === 'android' ? 'android' : 'ios';
          const apiKey = getRevenueCatApiKey(platform);

          await Purchases.setLogLevel({
            level: process.env.NODE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.VERBOSE,
          });

          await Purchases.configure({
            apiKey,
            appUserID: appUserId || undefined,
          });

          nativeConfigured = true;
          if (appUserId) {
            lastIdentifiedNativeUserId = appUserId;
          }
        } catch (err) {
          console.warn('[RevenueCat] Native configure failed:', err);
        } finally {
          nativeConfigurePromise = null;
        }
      })();
      await nativeConfigurePromise;
    }

    if (nativeConfigured && appUserId && appUserId !== lastIdentifiedNativeUserId) {
      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        await Purchases.logIn({ appUserID: appUserId });
        lastIdentifiedNativeUserId = appUserId;
      } catch (err) {
        console.warn('[RevenueCat] Native logIn warning:', err);
      }
    }
    return;
  }

  // Web Browser (@revenuecat/purchases-js)
  try {
    const { Purchases } = await import('@revenuecat/purchases-js');
    const apiKey = getRevenueCatApiKey('web');

    if (!Purchases.isConfigured()) {
      const uid = appUserId || Purchases.generateRevenueCatAnonymousAppUserId();
      Purchases.configure({
        apiKey,
        appUserId: uid,
      });
    } else if (appUserId) {
      const shared = Purchases.getSharedInstance();
      if (shared.getAppUserId() !== appUserId) {
        await shared.changeUser(appUserId);
      }
    }
  } catch (err) {
    console.warn('[RevenueCat] Web configure warning:', err);
  }
}

export async function identifyRevenueCatUser(appUserId: string): Promise<void> {
  if (!appUserId || typeof window === 'undefined') return;
  await initRevenueCat(appUserId);
}

export async function resetRevenueCatUser(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (isNativeCapacitor() && nativeConfigured) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.logOut();
      lastIdentifiedNativeUserId = null;
      return;
    }

    const { Purchases } = await import('@revenuecat/purchases-js');
    if (Purchases.isConfigured()) {
      const shared = Purchases.getSharedInstance();
      if (!shared.isAnonymous()) {
        await shared.changeUser(Purchases.generateRevenueCatAnonymousAppUserId());
      }
    }
  } catch (err) {
    console.warn('[RevenueCat] Logout warning:', err);
  }
}

/**
 * Checks whether the active subscriber holds the 'klozet_pro' entitlement.
 */
export async function checkKlozetProEntitlement(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    await initRevenueCat();

    if (isNativeCapacitor()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      return typeof customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID] !== 'undefined';
    }

    const { Purchases } = await import('@revenuecat/purchases-js');
    if (!Purchases.isConfigured()) return false;
    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    return typeof customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID] !== 'undefined';
  } catch (err) {
    console.warn('[RevenueCat] checkKlozetProEntitlement error:', err);
    return false;
  }
}

/**
 * Notifies Klozet backend to immediately reconcile RevenueCat subscriber status into Supabase `profiles`.
 */
export async function syncRevenueCatEntitlementToBackend(options?: {
  source?: 'native' | 'web';
  isTestStorePurchase?: boolean;
  hasActiveEntitlement?: boolean;
  productIdentifier?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/revenuecat/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: options?.source || (isNativeCapacitor() ? 'native' : 'web'),
        isTestStorePurchase: Boolean(options?.isTestStorePurchase),
        hasActiveEntitlement: options?.hasActiveEntitlement ?? true,
        productIdentifier: options?.productIdentifier,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.isPremium);
  } catch {
    return false;
  }
}

export interface PaywallPresentationResult {
  purchasedOrRestored: boolean;
  cancelled: boolean;
  error?: string;
}

export const YEARLY_DISCOUNT_PERCENT = 40;
export const MONTHLY_DISCOUNT_PERCENT = 30;

export interface RevenueCatPlanPricing {
  yearlyPrice: string;
  yearlyOriginalPrice: string;
  yearlyMonthlyPrice: string;
  yearlyDiscountPercent: number;
  monthlyPrice: string;
  monthlyOriginalPrice: string;
  monthlyDiscountPercent: number;
  hasLiveOffering: boolean;
}

export const DEFAULT_PLAN_PRICING: RevenueCatPlanPricing = {
  yearlyPrice: '24,99 €',
  yearlyOriginalPrice: '41,99 €',
  yearlyMonthlyPrice: '~2,08 €/mes',
  yearlyDiscountPercent: YEARLY_DISCOUNT_PERCENT,
  monthlyPrice: '2,99 €',
  monthlyOriginalPrice: '4,29 €',
  monthlyDiscountPercent: MONTHLY_DISCOUNT_PERCENT,
  hasLiveOffering: false,
};

function formatOriginalFromDiscount(
  discountedAmount: number,
  discountPercent: number,
  currencyCode: string | undefined,
  fallbackFormatted: string
): string {
  if (!Number.isFinite(discountedAmount) || discountedAmount <= 0) {
    return fallbackFormatted;
  }
  const rawOriginal = discountedAmount / (1 - discountPercent / 100);
  const rounded = Number(rawOriginal.toFixed(2));
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rounded);
  } catch {
    return `${rounded.toFixed(2).replace('.', ',')} €`;
  }
}

function selectNativePackage(offering: any, plan: 'monthly' | 'yearly') {
  if (!offering) return null;
  if (plan === 'yearly') {
    if (offering.annual) return offering.annual;
  } else {
    if (offering.monthly) return offering.monthly;
  }
  const pkgs: any[] = Array.isArray(offering.availablePackages) ? offering.availablePackages : [];
  return (
    pkgs.find((p) => {
      const id = String(p?.identifier || '').toLowerCase();
      const type = String(p?.packageType || '').toLowerCase();
      return plan === 'yearly'
        ? type === 'annual' || id.includes('annual') || id.includes('year')
        : type === 'monthly' || id.includes('month');
    }) || null
  );
}

function selectWebPackage(offering: any, plan: 'monthly' | 'yearly') {
  if (!offering) return null;
  if (plan === 'yearly' && offering.annual) return offering.annual;
  if (plan === 'monthly' && offering.monthly) return offering.monthly;
  const pkgs: any[] = Array.isArray(offering.availablePackages) ? offering.availablePackages : [];
  return (
    pkgs.find((p) => {
      const id = String(p?.identifier || '').toLowerCase();
      const type = String(p?.packageType || '').toLowerCase();
      return plan === 'yearly'
        ? type.includes('annual') || id.includes('annual') || id.includes('year')
        : type.includes('month') || id.includes('month');
    }) || null
  );
}

/**
 * Fetches active RevenueCat offerings & localized plan prices for our custom Kloe paywall,
 * and records a custom paywall impression on Web.
 */
export async function fetchRevenueCatOfferings(appUserId?: string): Promise<RevenueCatPlanPricing> {
  if (typeof window === 'undefined') return DEFAULT_PLAN_PRICING;

  try {
    await initRevenueCat(appUserId);

    const platform = isNativeCapacitor()
      ? (Capacitor.getPlatform() === 'android' ? 'android' : 'ios')
      : 'web';
    const isTestStore = getRevenueCatApiKey(platform).startsWith('test_');

    if (isNativeCapacitor()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      const current = offerings?.current;
      if (!current || isTestStore) return DEFAULT_PLAN_PRICING;

      const annualPkg = selectNativePackage(current, 'yearly');
      const monthlyPkg = selectNativePackage(current, 'monthly');
      const rawAnnual = annualPkg?.product?.priceString;
      const rawMonthly = monthlyPkg?.product?.priceString;
      const annualPriceNumber = typeof annualPkg?.product?.price === 'number' ? annualPkg.product.price : null;
      const monthlyPriceNumber = typeof monthlyPkg?.product?.price === 'number' ? monthlyPkg.product.price : null;
      const currency = annualPkg?.product?.currencyCode || monthlyPkg?.product?.currencyCode || 'EUR';

      return {
        yearlyPrice: rawAnnual || DEFAULT_PLAN_PRICING.yearlyPrice,
        yearlyOriginalPrice: annualPriceNumber
          ? formatOriginalFromDiscount(annualPriceNumber, YEARLY_DISCOUNT_PERCENT, currency, DEFAULT_PLAN_PRICING.yearlyOriginalPrice)
          : DEFAULT_PLAN_PRICING.yearlyOriginalPrice,
        yearlyMonthlyPrice: annualPriceNumber
          ? `~${(annualPriceNumber / 12).toFixed(2).replace('.', ',')} €/mes`
          : DEFAULT_PLAN_PRICING.yearlyMonthlyPrice,
        yearlyDiscountPercent: YEARLY_DISCOUNT_PERCENT,
        monthlyPrice: rawMonthly || DEFAULT_PLAN_PRICING.monthlyPrice,
        monthlyOriginalPrice: monthlyPriceNumber
          ? formatOriginalFromDiscount(monthlyPriceNumber, MONTHLY_DISCOUNT_PERCENT, currency, DEFAULT_PLAN_PRICING.monthlyOriginalPrice)
          : DEFAULT_PLAN_PRICING.monthlyOriginalPrice,
        monthlyDiscountPercent: MONTHLY_DISCOUNT_PERCENT,
        hasLiveOffering: Boolean(annualPkg || monthlyPkg),
      };
    }

    const { Purchases } = await import('@revenuecat/purchases-js');
    if (!Purchases.isConfigured()) return DEFAULT_PLAN_PRICING;

    const shared = Purchases.getSharedInstance();
    const offerings = await shared.getOfferings();
    const current = offerings?.current;
    if (!current) return DEFAULT_PLAN_PRICING;

    try {
      shared.trackCustomPaywallImpression({
        paywallId: 'klozet_kloe_custom_paywall',
        offering: current,
      });
    } catch {
      // Telemetry failure never blocks paywall presentation
    }

    // Keep official business-plan Euro prices when running against RevenueCat Test Store
    if (isTestStore) {
      return DEFAULT_PLAN_PRICING;
    }

    const annualPkg = selectWebPackage(current, 'yearly');
    const monthlyPkg = selectWebPackage(current, 'monthly');

    const annualPriceObj = annualPkg?.product?.currentPrice;
    const monthlyPriceObj = monthlyPkg?.product?.currentPrice;
    const perMonthFromAnnual = annualPkg?.product?.defaultSubscriptionOption?.base?.pricePerMonth?.formattedPrice;
    const annualNum = annualPriceObj?.amountMicros ? annualPriceObj.amountMicros / 1_000_000 : null;
    const monthlyNum = monthlyPriceObj?.amountMicros ? monthlyPriceObj.amountMicros / 1_000_000 : null;
    const currency = annualPriceObj?.currency || monthlyPriceObj?.currency || 'EUR';

    return {
      yearlyPrice: annualPriceObj?.formattedPrice || DEFAULT_PLAN_PRICING.yearlyPrice,
      yearlyOriginalPrice: annualNum
        ? formatOriginalFromDiscount(annualNum, YEARLY_DISCOUNT_PERCENT, currency, DEFAULT_PLAN_PRICING.yearlyOriginalPrice)
        : DEFAULT_PLAN_PRICING.yearlyOriginalPrice,
      yearlyMonthlyPrice: perMonthFromAnnual
        ? `~${perMonthFromAnnual}/mes`
        : annualNum
          ? `~${(annualNum / 12).toFixed(2).replace('.', ',')} €/mes`
          : DEFAULT_PLAN_PRICING.yearlyMonthlyPrice,
      yearlyDiscountPercent: YEARLY_DISCOUNT_PERCENT,
      monthlyPrice: monthlyPriceObj?.formattedPrice || DEFAULT_PLAN_PRICING.monthlyPrice,
      monthlyOriginalPrice: monthlyNum
        ? formatOriginalFromDiscount(monthlyNum, MONTHLY_DISCOUNT_PERCENT, currency, DEFAULT_PLAN_PRICING.monthlyOriginalPrice)
        : DEFAULT_PLAN_PRICING.monthlyOriginalPrice,
      monthlyDiscountPercent: MONTHLY_DISCOUNT_PERCENT,
      hasLiveOffering: Boolean(annualPkg || monthlyPkg),
    };
  } catch (err) {
    console.warn('[RevenueCat] fetchRevenueCatOfferings fallback to default prices:', err);
    return DEFAULT_PLAN_PRICING;
  }
}

/**
 * Purchases the chosen Klozet Pro plan directly via RevenueCat (Native StoreKit / Play Store or Web Billing).
 * Powers our custom Kloe paywall UI with zero Stripe involvement.
 */
export async function purchaseRevenueCatPlan(params: {
  plan: 'monthly' | 'yearly';
  appUserId?: string;
  customerEmail?: string;
  htmlTarget?: HTMLElement | null;
}): Promise<PaywallPresentationResult> {
  if (typeof window === 'undefined') {
    return { purchasedOrRestored: false, cancelled: false, error: 'Compras disponibles solo en cliente.' };
  }

  try {
    await initRevenueCat(params.appUserId);

    // 1. Native iOS (App Store / StoreKit) or Android via Capacitor
    if (isNativeCapacitor()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      const targetPkg = selectNativePackage(offerings?.current, params.plan);

      if (targetPkg) {
        try {
          const { customerInfo } = await Purchases.purchasePackage({ aPackage: targetPkg });
          const entitlement = customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
          const isEntitlementActive = Boolean(entitlement && (entitlement as any).isActive !== false);
          const apiKey = getRevenueCatApiKey(Capacitor.getPlatform() === 'android' ? 'android' : 'ios');
          const isTestKey = apiKey.startsWith('test_');

          if (isEntitlementActive || isTestKey) {
            const synced = await syncRevenueCatEntitlementToBackend({
              source: 'native',
              isTestStorePurchase: isTestKey || Boolean(entitlement?.isSandbox),
              hasActiveEntitlement: isEntitlementActive || isTestKey,
              productIdentifier: entitlement?.productIdentifier || targetPkg?.product?.identifier,
            });
            if (!synced) {
              return {
                purchasedOrRestored: false,
                cancelled: false,
                error: 'Compra completada en App Store, pero no se pudo activar en tu perfil. Pulsa "Restaurar compras".',
              };
            }
            return { purchasedOrRestored: true, cancelled: false };
          }

          return {
            purchasedOrRestored: false,
            cancelled: false,
            error: 'La compra no activó el entitlement klozet_pro. Verifica en RevenueCat que el producto pertenezca a klozet_pro.',
          };
        } catch (err: any) {
          if (err?.userCancelled === true || err?.code === 1 || String(err?.code) === '1') {
            return { purchasedOrRestored: false, cancelled: true };
          }
          throw err;
        }
      }

      // Fallback to native RevenueCat sheet if package wasn't mapped directly
      return await presentNativePaywall(params.appUserId);
    }

    // 2. Web Browser via @revenuecat/purchases-js
    await initRevenueCat(params.appUserId);
    const { Purchases } = await import('@revenuecat/purchases-js');
    if (!Purchases.isConfigured()) {
      return {
        purchasedOrRestored: false,
        cancelled: false,
        error: 'RevenueCat no está inicializado todavía. Recarga e inténtalo de nuevo.',
      };
    }

    const shared = Purchases.getSharedInstance();
    const offerings = await shared.getOfferings();
    const targetPkg = selectWebPackage(offerings?.current, params.plan);

    if (!targetPkg) {
      return {
        purchasedOrRestored: false,
        cancelled: false,
        error: 'No se encontró el paquete seleccionado en tu Offering activo de RevenueCat.',
      };
    }

    const purchaseResult = await shared.purchase({
      rcPackage: targetPkg,
      customerEmail: params.customerEmail,
      selectedLocale: 'es',
    });

    const entitlement = purchaseResult?.customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
    const isTestKey = getRevenueCatApiKey('web').startsWith('test_');

    if (entitlement || purchaseResult?.storeTransaction) {
      const synced = await syncRevenueCatEntitlementToBackend({
        source: 'web',
        isTestStorePurchase: isTestKey || shared.isSandbox(),
        hasActiveEntitlement: Boolean(entitlement || purchaseResult?.storeTransaction),
        productIdentifier: entitlement?.productIdentifier || targetPkg.product.identifier,
      });
      if (!synced) {
        return {
          purchasedOrRestored: false,
          cancelled: false,
          error: 'Compra completada en RevenueCat, pero no se pudo activar en tu perfil. Pulsa "Restaurar compras".',
        };
      }
      return { purchasedOrRestored: true, cancelled: false };
    }

    return { purchasedOrRestored: false, cancelled: true };
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    const code = err?.errorCode ?? err?.code;
    if (
      err?.userCancelled === true ||
      code === 1 ||
      msg.includes('cancel') ||
      msg.includes('closed') ||
      msg.includes('abort')
    ) {
      return { purchasedOrRestored: false, cancelled: true };
    }

    // Dynamic check for purchases-js ErrorCode.UserCancelledError (value 1)
    try {
      const { ErrorCode } = await import('@revenuecat/purchases-js');
      if (code === ErrorCode.UserCancelledError) {
        return { purchasedOrRestored: false, cancelled: true };
      }
    } catch {}

    console.error('[RevenueCat] purchaseRevenueCatPlan error:', err);
    return {
      purchasedOrRestored: false,
      cancelled: false,
      error: err?.underlyingErrorMessage || err?.message || 'No se pudo iniciar la compra con RevenueCat.',
    };
  }
}

/**
 * Presents the Native iOS/Android Paywall configured in the RevenueCat Dashboard.
 */
export async function presentNativePaywall(appUserId?: string): Promise<PaywallPresentationResult> {
  if (typeof window === 'undefined' || !isNativeCapacitor()) {
    return { purchasedOrRestored: false, cancelled: false, error: 'Paywall nativa disponible solo en la app iOS/Android.' };
  }

  try {
    await initRevenueCat(appUserId);
    const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
    const { PAYWALL_RESULT, Purchases } = await import('@revenuecat/purchases-capacitor');

    const { result } = await RevenueCatUI.presentPaywall({
      displayCloseButton: true,
    });

    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const entitlement = customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
      const apiKey = getRevenueCatApiKey(Capacitor.getPlatform() === 'android' ? 'android' : 'ios');
      const isTestKey = apiKey.startsWith('test_');

      await syncRevenueCatEntitlementToBackend({
        source: 'native',
        isTestStorePurchase: isTestKey || Boolean(entitlement?.isSandbox),
        productIdentifier: entitlement?.productIdentifier,
      });

      return { purchasedOrRestored: true, cancelled: false };
    }

    if (result === PAYWALL_RESULT.CANCELLED) {
      const hasPro = await checkKlozetProEntitlement();
      if (hasPro) {
        const apiKey = getRevenueCatApiKey(Capacitor.getPlatform() === 'android' ? 'android' : 'ios');
        await syncRevenueCatEntitlementToBackend({
          source: 'native',
          isTestStorePurchase: apiKey.startsWith('test_'),
        });
        return { purchasedOrRestored: true, cancelled: false };
      }
      return { purchasedOrRestored: false, cancelled: true };
    }

    return {
      purchasedOrRestored: false,
      cancelled: false,
      error: result === PAYWALL_RESULT.NOT_PRESENTED ? 'No se encontró una paywall activa en RevenueCat.' : 'Error al mostrar la paywall.',
    };
  } catch (err: any) {
    console.error('[RevenueCat] presentNativePaywall error:', err);
    return {
      purchasedOrRestored: false,
      cancelled: false,
      error: err?.message || 'Error al abrir las compras de App Store.',
    };
  }
}

/**
 * Presents a RevenueCat Web Paywall inside an HTML target container (@revenuecat/purchases-js).
 */
export async function presentWebPaywall(params: {
  htmlTarget: HTMLElement;
  appUserId?: string;
  customerEmail?: string;
  onBack?: () => void;
}): Promise<PaywallPresentationResult> {
  if (typeof window === 'undefined') {
    return { purchasedOrRestored: false, cancelled: false, error: 'Disponible solo en navegador.' };
  }

  try {
    await initRevenueCat(params.appUserId);
    const { Purchases } = await import('@revenuecat/purchases-js');

    if (!Purchases.isConfigured()) {
      return { purchasedOrRestored: false, cancelled: false, error: 'RevenueCat Web no configurado.' };
    }

    const purchaseResult = await Purchases.getSharedInstance().presentPaywall({
      htmlTarget: params.htmlTarget,
      customerEmail: params.customerEmail,
      selectedLocale: 'es',
      onBack: (closePaywall) => {
        closePaywall();
        params.onBack?.();
      },
    });

    const entitlement = purchaseResult?.customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
    const isTestKey = getRevenueCatApiKey('web').startsWith('test_');

    if (entitlement || purchaseResult?.storeTransaction) {
      await syncRevenueCatEntitlementToBackend({
        source: 'web',
        isTestStorePurchase: isTestKey || Purchases.getSharedInstance().isSandbox(),
        productIdentifier: entitlement?.productIdentifier || purchaseResult?.selectedPackage?.product?.identifier,
      });
      return { purchasedOrRestored: true, cancelled: false };
    }

    return { purchasedOrRestored: false, cancelled: true };
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('cancel') || msg.includes('closed') || msg.includes('abort')) {
      return { purchasedOrRestored: false, cancelled: true };
    }
    return {
      purchasedOrRestored: false,
      cancelled: false,
      error: err?.message || 'RevenueCat Web Billing no disponible todavía en el proyecto.',
    };
  }
}

/**
 * Restores previous App Store / Play Store purchases (required by Apple App Review 3.1.1).
 */
export async function restoreKlozetPurchases(appUserId?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    await initRevenueCat(appUserId);

    if (isNativeCapacitor()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.restorePurchases();
      const entitlement = customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
      const active = typeof entitlement !== 'undefined';

      if (active) {
        const apiKey = getRevenueCatApiKey(Capacitor.getPlatform() === 'android' ? 'android' : 'ios');
        await syncRevenueCatEntitlementToBackend({
          source: 'native',
          isTestStorePurchase: apiKey.startsWith('test_') || Boolean(entitlement?.isSandbox),
          productIdentifier: entitlement?.productIdentifier,
        });
      }
      return active;
    }

    const { Purchases } = await import('@revenuecat/purchases-js');
    if (!Purchases.isConfigured()) return false;
    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    const entitlement = customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
    const active = typeof entitlement !== 'undefined';

    if (active) {
      const apiKey = getRevenueCatApiKey('web');
      await syncRevenueCatEntitlementToBackend({
        source: 'web',
        isTestStorePurchase: apiKey.startsWith('test_') || Purchases.getSharedInstance().isSandbox(),
        hasActiveEntitlement: true,
        productIdentifier: entitlement?.productIdentifier,
      });
    }
    return active;
  } catch (err) {
    console.error('[RevenueCat] restoreKlozetPurchases error:', err);
    return false;
  }
}
