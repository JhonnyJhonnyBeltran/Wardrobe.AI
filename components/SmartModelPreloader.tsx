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
];

export default function SmartModelPreloader() {
  const pathname = usePathname();
  const { user } = useUser();
  const preloadAttempted = useRef<string[]>([]);
  const globalWarmupStarted = useRef(false);
  const idleHandleRef = useRef<number | null>(null);
  const timeoutHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const startPreload = () => {
      if (isModelLoaded('quality')) return;

      // Fire-and-forget: keep the UI thread free and let the model warm up in the background.
      void preloadModel('quality').catch(error => {
        console.warn('[SmartPreloader] Model preload failed, will retry on use:', error);
      });
    };

    // Let the new page paint first, then preload during idle time.
    const delayMs = pathname === '/closet' ? 8000 : 1500;
    timeoutHandleRef.current = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleHandleRef.current = window.requestIdleCallback(() => startPreload(), { timeout: 10000 });
      } else {
        startPreload();
      }
    }, delayMs);

    return () => {
      if (timeoutHandleRef.current) clearTimeout(timeoutHandleRef.current);
      if (idleHandleRef.current && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandleRef.current);
      }
    };
  }, [pathname, user]);

  useEffect(() => {
    if (!user || globalWarmupStarted.current) return;

    globalWarmupStarted.current = true;

    const startWarmup = () => {
      if (isModelLoaded('quality')) return;

      void preloadModel('quality').catch(error => {
        console.warn('[SmartPreloader] Global warmup failed, will retry on use:', error);
      });
    };

    const warmupTimeout = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleHandleRef.current = window.requestIdleCallback(() => startWarmup(), { timeout: 12000 });
      } else {
        startWarmup();
      }
    }, 12000);

    return () => {
      clearTimeout(warmupTimeout);
      if (idleHandleRef.current && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandleRef.current);
      }
    };
  }, [user]);

  return null; // Logic-only component
}
