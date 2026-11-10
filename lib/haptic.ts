/**
 * Haptic Feedback Utilities
 * Uses native iOS/Android Taptic Engine via Capacitor Haptics when running in native shell,
 * with graceful Web Vibration API fallback.
 */

import { Capacitor } from '@capacitor/core';

export type HapticType =
  | 'light'      // Light tap - for selections
  | 'medium'     // Medium tap - for confirmations
  | 'heavy'      // Heavy tap - for important actions
  | 'success'    // Success pattern
  | 'warning'    // Warning pattern
  | 'error';     // Error pattern

const hapticPatterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10, 50],
  warning: [20, 30, 20, 30],
  error: [30, 50, 30, 50, 30, 50],
};

let hapticsModulePromise: Promise<typeof import('@capacitor/haptics')> | null = null;

function triggerNativeCapacitorHaptic(type: HapticType): void {
  if (typeof window === 'undefined') return;
  try {
    if (!Capacitor.isNativePlatform()) return;
    if (!hapticsModulePromise) {
      hapticsModulePromise = import('@capacitor/haptics');
    }
    hapticsModulePromise
      .then(({ Haptics, ImpactStyle, NotificationType }) => {
        switch (type) {
          case 'light':
            return Haptics.impact({ style: ImpactStyle.Light });
          case 'medium':
            return Haptics.impact({ style: ImpactStyle.Medium });
          case 'heavy':
            return Haptics.impact({ style: ImpactStyle.Heavy });
          case 'success':
            return Haptics.notification({ type: NotificationType.Success });
          case 'warning':
            return Haptics.notification({ type: NotificationType.Warning });
          case 'error':
            return Haptics.notification({ type: NotificationType.Error });
        }
      })
      .catch(() => {});
  } catch {
    // Ignore native bridge error
  }
}

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    triggerNativeCapacitorHaptic(type);
    return;
  }

  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      const pattern = hapticPatterns[type];
      navigator.vibrate(pattern);
    }
  } catch {
    // Gracefully ignore browser intervention or unactivated vibration calls
  }
}

export const haptics = {
  selection: () => triggerHaptic('light'),
  tap: () => triggerHaptic('medium'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  heavy: () => triggerHaptic('heavy'),
  notification: () => triggerHaptic('success'),
};

export function useHaptic() {
  return haptics;
}
