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

        window.addEventListener('focus', onFocus);
        window.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [triggerRefetch, lastFocusTimestamp, setLastFocusTimestamp, refreshProfile, user]);

    return null; // This is a logic-only component
}
