'use client';

/**
 * ModelPreloader Component
 * Preloads the AI model in the background on app initialization
 * Uses requestIdleCallback for lowest priority, ensuring no UI blocking
 */

import { useEffect, useRef, useCallback } from 'react';
import { preloadModel, isModelLoaded, type ProcessingQuality } from '@/lib/imageProcessing';

interface ModelPreloaderProps {
    /** Delay before starting preload (ms) */
    delay?: number;
    /** Model quality to preload - always uses 'quality' for best results */
    quality?: ProcessingQuality;
    /** Show console logs */
    debug?: boolean;
}

/**
 * Polyfill for requestIdleCallback
 */
const requestIdleCallbackPolyfill = (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
): number => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        return window.requestIdleCallback(callback, options);
    }
    // Fallback: use setTimeout with low priority via nested setTimeout
    if (typeof window === 'undefined') return 0;
    const start = Date.now();
    return setTimeout(() => {
        callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
    }, options?.timeout || 1) as unknown as number;
};

const cancelIdleCallbackPolyfill = (id: number): void => {
    if (typeof window === 'undefined') return;
    if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(id);
    } else {
        clearTimeout(id);
    }
};

/**
 * Invisible component that preloads the background removal model
 * Uses requestIdleCallback to ensure zero impact on app responsiveness
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx or main layout
 * <ModelPreloader delay={3000} quality="quality" />
 * ```
 */
export function ModelPreloader({ 
    delay = 3000, 
    quality = 'quality', // Always default to quality model
    debug = false 
}: ModelPreloaderProps) {
    const hasPreloaded = useRef(false);
    const idleCallbackId = useRef<number | null>(null);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const startPreload = useCallback(async () => {
        if (hasPreloaded.current) return;
        
        // Check if we're on a slow connection
        const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
        if (connection && connection.effectiveType === '2g') {
            if (debug) console.log('[ModelPreloader] Skipping on slow connection');
            return;
        }

        try {
            if (debug) console.log(`[ModelPreloader] Starting model '${quality}' preload in idle time...`);
            const start = Date.now();
            
            // Preload the model - this runs in a Web Worker so it won't block
            await preloadModel(quality);
            hasPreloaded.current = true;
            
            if (debug) {
                console.log(`[ModelPreloader] Model '${quality}' preloaded in ${Date.now() - start}ms`);
            }
        } catch (error) {
            // Silently fail - user will just wait on first use
            if (debug) console.error('[ModelPreloader] Failed:', error);
        }
    }, [quality, debug]);

    useEffect(() => {
        // Only run once
        if (hasPreloaded.current) return;
        
        // Skip if model is already loaded
        if (isModelLoaded(quality)) {
            if (debug) console.log(`[ModelPreloader] Model '${quality}' already loaded`);
            return;
        }

        // Wait for initial delay, then use requestIdleCallback for lowest priority
        timeoutId.current = setTimeout(() => {
            // Use requestIdleCallback to ensure we only preload when browser is idle
            // This prevents any impact on initial app load and navigation
            idleCallbackId.current = requestIdleCallbackPolyfill(
                async (deadline) => {
                    // If we have enough idle time, start preloading
                    // Or if we've waited too long (timeout), start anyway
                    if (deadline.timeRemaining() > 10 || deadline.didTimeout) {
                        // Start preload in microtask to not block the idle callback
                        queueMicrotask(() => {
                            startPreload();
                        });
                    } else {
                        // Not enough time, schedule another idle callback
                        idleCallbackId.current = requestIdleCallbackPolyfill(
                            () => startPreload(),
                            { timeout: 10000 } // Give up after 10s and just preload
                        );
                    }
                },
                { timeout: 15000 } // Maximum wait time of 15 seconds
            );
        }, delay);

        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
            if (idleCallbackId.current !== null) {
                cancelIdleCallbackPolyfill(idleCallbackId.current);
            }
        };
    }, [delay, quality, debug, startPreload]);

    // This component renders nothing
    return null;
}

export default ModelPreloader;
