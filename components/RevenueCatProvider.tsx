'use client';

import { useEffect, useRef } from 'react';
import { useUser, useTheme } from '@/store';
import {
  initRevenueCat,
  identifyRevenueCatUser,
  resetRevenueCatUser,
  checkKlozetProEntitlement,
  syncRevenueCatEntitlementToBackend,
  isNativeCapacitor,
} from '@/lib/revenuecat/client';

/**
 * Configures RevenueCat across Native iOS (Capacitor) and Web,
 * binds Supabase User UUID to RevenueCat App User ID,
 * and bridges native iOS StatusBar / SplashScreen lifecycle.
 */
export default function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshProfile } = useUser();
  const { isDark } = useTheme();
  const prevUserIdRef = useRef<string | null>(null);

  // Sync native iOS StatusBar appearance + dismiss SplashScreen
  useEffect(() => {
    if (!isNativeCapacitor()) return;

    import('@capacitor/status-bar')
      .then(({ StatusBar, Style }) => {
        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
        StatusBar.setBackgroundColor({ color: isDark ? '#111113' : '#ffffff' }).catch(() => {});
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
      })
      .catch(() => {});

    import('@capacitor/splash-screen')
      .then(({ SplashScreen }) => {
        SplashScreen.hide().catch(() => {});
      })
      .catch(() => {});
  }, [isDark]);

  // Configure & synchronize RevenueCat user session
  useEffect(() => {
    let active = true;

    const isUserPremium = user?.subscriptionTier === 'premium';

    const syncUserWithRevenueCat = async () => {
      try {
        if (user?.id) {
          await identifyRevenueCatUser(user.id);
          prevUserIdRef.current = user.id;

          const hasPro = await checkKlozetProEntitlement();
          if (active && hasPro && !isUserPremium) {
            const synced = await syncRevenueCatEntitlementToBackend({
              source: isNativeCapacitor() ? 'native' : 'web',
            });
            if (synced) {
              await refreshProfile();
            }
          }
        } else {
          if (prevUserIdRef.current) {
            await resetRevenueCatUser();
            prevUserIdRef.current = null;
          } else {
            await initRevenueCat();
          }
        }
      } catch (err) {
        console.warn('[RevenueCatProvider] Sync warning:', err);
      }
    };

    syncUserWithRevenueCat();

    return () => {
      active = false;
    };
  }, [user?.id, user?.subscriptionTier, refreshProfile]);

  // Re-check entitlement when app returns to foreground (e.g. after external StoreKit / Safari flow)
  useEffect(() => {
    if (!user?.id || !isNativeCapacitor()) return;

    const isUserPremium = user?.subscriptionTier === 'premium';

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        const hasPro = await checkKlozetProEntitlement();
        if (hasPro && !isUserPremium) {
          const synced = await syncRevenueCatEntitlementToBackend({ source: 'native' });
          if (synced) {
            await refreshProfile();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user?.id, user?.subscriptionTier, refreshProfile]);

  return <>{children}</>;
}
