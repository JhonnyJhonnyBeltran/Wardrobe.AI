'use client';

import { useEffect, useRef } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useUser } from '@/store/userStore';

/**
 * AppLifecycleManager - Centralized system for focus, visibility, and session health.
 * Ensures the app "wakes up" correctly after inactivity, similar to Top Apps like Instagram.
 */
export default function AppLifecycleManager() {
    const triggerRefetch = useUiStore((state) => state.triggerRefetch);
    const lastFocusTimestamp = useUiStore((state) => state.lastFocusTimestamp);
    const setLastFocusTimestamp = useUiStore((state) => state.setLastFocusTimestamp);
    const { refreshProfile, user } = useUser();
    
    // Safety ref to prevent double-firing in strict mode
    const isWakingRef = useRef(false);

    useEffect(() => {
        const handleWakeUp = async () => {
            if (isWakingRef.current) return;
            
            // Modern apps only refetch if the user has been away for a meaningful time (e.g. 2 mins)
            const now = Date.now();
            const timeSinceLastFocus = now - lastFocusTimestamp;
            
            if (timeSinceLastFocus > 2 * 60 * 1000) {
                console.log(`[Lifecycle] App wake-up detected after ${Math.round(timeSinceLastFocus / 1000)}s`);
                isWakingRef.current = true;
                
                try {
                    // 1. Trigger Silent Data Revalidation across all subscribed components
                    triggerRefetch();
                    
                    // 2. Proactively refresh auth session to prevent "Access Required" glitches
                    if (user) {
                        await refreshProfile();
                    }
                } catch (e) {
                    console.error('[Lifecycle] Wake-up sync failed:', e);
                } finally {
                    isWakingRef.current = false;
                }
            }
            
            setLastFocusTimestamp(now);
        };

        const onFocus = () => {
            if (document.visibilityState === 'visible') {
                handleWakeUp();
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleWakeUp();
            }
        };

        const onResourceError = (e: ErrorEvent) => {
            // Resource errors don't bubble, so we catch them in the capture phase
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                const src = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href;
                if (src && src.includes('/_next/static/chunks/')) {
                    console.warn('[Lifecycle] Next.js chunk load error detected (404). Reloading page...', src);
                    const lastReload = sessionStorage.getItem('klozet_chunk_reload');
                    const now = Date.now();
                    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                        sessionStorage.setItem('klozet_chunk_reload', now.toString());
                        window.location.reload();
                    }
                }
            }
        };

        const onUnhandledRejection = (e: PromiseRejectionEvent) => {
            const reason = (e.reason?.message || String(e.reason)).toLowerCase();
            if (reason.includes('chunkloaderror') || reason.includes('loading chunk') || reason.includes('failed to fetch dynamically imported module')) {
                console.warn('[Lifecycle] Dynamic import chunk error detected. Reloading page...');
                const lastReload = sessionStorage.getItem('klozet_chunk_reload');
                const now = Date.now();
                if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                    sessionStorage.setItem('klozet_chunk_reload', now.toString());
                    window.location.reload();
                }
            }
        };

        window.addEventListener('focus', onFocus);
        window.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('error', onResourceError, true);
        window.addEventListener('unhandledrejection', onUnhandledRejection);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('error', onResourceError, true);
            window.removeEventListener('unhandledrejection', onUnhandledRejection);
        };
    }, [triggerRefetch, lastFocusTimestamp, setLastFocusTimestamp, refreshProfile, user]);

    return null; // This is a logic-only component
}
