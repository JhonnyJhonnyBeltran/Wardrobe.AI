/**
 * Dynamic Imports Helper - Lazy load heavy libraries on-demand
 * This reduces initial bundle size and improves performance
 * 
 * Usage:
 * const html2canvas = await loadHtml2Canvas();
 * const backgroundRemoval = await loadBackgroundRemoval();
 */

export async function loadHtml2Canvas() {
  try {
    const module = await import('html2canvas');
    return module.default;
  } catch (error) {
    console.error('[DynamicImports] Failed to load html2canvas:', error);
    throw error;
  }
}

export async function loadBackgroundRemoval() {
  try {
    const module = await import('@imgly/background-removal');
    return module;
  } catch (error) {
    console.error('[DynamicImports] Failed to load @imgly/background-removal:', error);
    throw error;
  }
}

export async function loadImageProcessing() {
  try {
    const module = await import('@/lib/imageProcessing');
    return module;
  } catch (error) {
    console.error('[DynamicImports] Failed to load imageProcessing:', error);
    throw error;
  }
}

/**
 * Preload a heavy library in the background without blocking UI
 * Useful for anticipated user actions
 */
export function prefetchLibrary(loader: () => Promise<any>) {
  if (typeof window === 'undefined') return; // SSR safety
  
  // Use requestIdleCallback if available, otherwise setTimeout
  const callback = () => {
    try {
      loader().catch(err => {
        console.warn('[DynamicImports] Prefetch failed (non-critical):', err);
      });
    } catch (error) {
      // Silently fail - prefetch is non-blocking
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 1000);
  }
}
