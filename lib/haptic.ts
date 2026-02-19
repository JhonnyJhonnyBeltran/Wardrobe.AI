/**
 * Haptic Feedback Utilities
 * Provides haptic feedback for mobile devices
 * Uses Vibration API and fallback for visual feedback
 */

export type HapticType = 
  | 'light'      // Light tap - for selections
  | 'medium'     // Medium tap - for confirmations
  | 'heavy'      // Heavy tap - for important actions
  | 'success'    // Success pattern
  | 'warning'    // Warning pattern
  | 'error';    // Error pattern

// Vibration patterns in milliseconds
const hapticPatterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10, 50],
  warning: [20, 30, 20, 30],
  error: [30, 50, 30, 50, 30, 50],
};

export function triggerHaptic(type: HapticType = 'light'): void {
  // Check if device supports vibration
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const pattern = hapticPatterns[type];
    navigator.vibrate(pattern);
  }
  
  // Fallback: Visual feedback could be added here
  // For now, we rely on CSS animations as visual fallback
}

// Convenience functions for common actions
export const haptics = {
  selection: () => triggerHaptic('light'),
  tap: () => triggerHaptic('medium'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  heavy: () => triggerHaptic('heavy'),
};

/**
 * Hook for using haptic feedback in React components
 */
export function useHaptic() {
  return haptics;
}
