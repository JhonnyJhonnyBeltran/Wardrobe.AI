'use client';

/**
 * SmartModelPreloader - Intelligent AI Model Preloading
 * Only preloads models when user navigates to pages that use AI features
 * Significantly reduces initial app load time
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { preloadModel, isModelLoaded } from '@/lib/imageProcessing';
import { useUser } from '@/store';

// Routes that require AI model preloading
const AI_REQUIRED_ROUTES = [
  '/create',
  '/process-image',
  '/outfit',
  '/chat',
  '/closet', // Optional: preload if user visits closet
];

export default function SmartModelPreloader() {
  const pathname = usePathname();
  const { user } = useUser();
  const preloadAttempted = useRef<string[]>([]);

  useEffect(() => {
    if (!user || !pathname) return;

    // Check if current route needs AI model
    const needsAiModel = AI_REQUIRED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (!needsAiModel) return;

    // Avoid preloading the same model multiple times
    if (preloadAttempted.current.includes(pathname)) return;
    preloadAttempted.current.push(pathname);

    // Preload model on-demand with a small delay to not block UI
    const preloadTimer = setTimeout(async () => {
      try {
        if (!isModelLoaded('quality')) {
          console.log(`[SmartPreloader] Preloading AI model for route: ${pathname}`);
          await preloadModel('quality');
          console.log('[SmartPreloader] AI model ready.');
        }
      } catch (error) {
        console.warn('[SmartPreloader] Model preload failed, will retry on use:', error);
      }
    }, 500); // Small delay to ensure UI is ready

    return () => clearTimeout(preloadTimer);
  }, [pathname, user]);

  return null; // Logic-only component
}
