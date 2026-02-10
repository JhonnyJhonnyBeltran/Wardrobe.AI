/**
 * Haptic feedback - Contexto §6C
 * Micro-vibraciones al dar Like, Guardar o Match de estilo.
 * Usa Vibration API cuando está disponible (móviles).
 */

export function hapticLight(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function hapticMedium(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([10, 30, 10]);
  }
}

export function hapticSuccess(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([5, 20, 5, 20, 5]);
  }
}
