'use client';

import { useEffect, useRef } from 'react';
import { preloadModel, isModelLoaded } from '@/lib/imageProcessing';
import { useUser } from '@/store';

/**
 * BackgroundInitializer - Handles non-critical application tasks.
 * Performs actions in the background after the initial app load to ensure
 * a smooth and fast entry experience (matching Era Control style).
 */
export default function BackgroundInitializer() {
    const { user } = useUser();
    const hasPreloaded = useRef(false);

    useEffect(() => {
        // Only run tasks once per session and if user is logged in
        if (!user || hasPreloaded.current) return;

        const performBackgroundTasks = async () => {
            hasPreloaded.current = true;
            
            // 1. Silent AI Model Preloading
            // We give it a slight delay to ensure the main UI is interactive first
            setTimeout(async () => {
                try {
                    if (!isModelLoaded('quality')) {
                        console.log('[Background] Preloading AI model for image processing...');
                        await preloadModel('quality');
                        console.log('[Background] AI model ready.');
                    }
                } catch (error) {
                    console.warn('[Background] Critical model preload failed, will retry on use:', error);
                }
            }, 2000);

            // 2. Add other background tasks here (e.g. warming up caches, etc.)
        };

        performBackgroundTasks();
    }, [user]);

    return null; // Logic-only component
}
