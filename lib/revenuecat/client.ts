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
  productIdentifier?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/revenuecat/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: options?.source || (isNativeCapacitor() ? 'native' : 'web'),
        isTestStorePurchase: Boolean(options?.isTestStorePurchase),
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
  fallbackToStripe?: boolean;
}

/**
 * Presents the Native iOS/Android Paywall configured in the RevenueCat Dashboard.
 */
export async function presentNativePaywall(appUserId?: string): Promise<PaywallPresentationResult> {
  if (typeof window === 'undefined' || !isNativeCapacitor()) {
    return { purchasedOrRestored: false, cancelled: false, fallbackToStripe: true };
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
      // Double-check if user tapped "Restore" inside the sheet before closing
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
 * Falls back cleanly if Web Billing is not yet linked in the RevenueCat Dashboard.
 */
export async function presentWebPaywall(params: {
  htmlTarget: HTMLElement;
  appUserId?: string;
  customerEmail?: string;
  onBack?: () => void;
}): Promise<PaywallPresentationResult> {
  if (typeof window === 'undefined') {
    return { purchasedOrRestored: false, cancelled: false, fallbackToStripe: true };
  }

  try {
    await initRevenueCat(params.appUserId);
    const { Purchases } = await import('@revenuecat/purchases-js');

    if (!Purchases.isConfigured()) {
      return { purchasedOrRestored: false, cancelled: false, fallbackToStripe: true };
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
    // If user closed / cancelled, respect cancellation
    if (msg.includes('cancel') || msg.includes('closed') || msg.includes('abort')) {
      return { purchasedOrRestored: false, cancelled: true };
    }
    // Otherwise signal fallback to existing Stripe Embedded Checkout on web
    console.warn('[RevenueCat] Web paywall unavailable, falling back to Stripe:', err?.message || err);
    return {
      purchasedOrRestored: false,
      cancelled: false,
      fallbackToStripe: true,
      error: err?.message,
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

    return await checkKlozetProEntitlement();
  } catch (err) {
    console.error('[RevenueCat] restoreKlozetPurchases error:', err);
    return false;
  }
}
