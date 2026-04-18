'use client';

import { useEffect, useRef } from 'react';
import { useUiStore } from '@/store/uiStore';

/**
 * Hook to automatically trigger a function when the app gains focus
 * or when the user returns to the tab.
 * 
 * @param onRefetch The function to execute for data revalidation
 * @param dependencies Optional dependencies to control when the effect re-runs
 */
export function useFocusRefetch(onRefetch: () => void, dependencies: any[] = []) {
    const refetchTrigger = useUiStore((state) => state.refetchTrigger);
    const lastRefetchTrigger = useRef(refetchTrigger);

    useEffect(() => {
        // If the global refetch trigger has incremented, it means focus was regained
        if (refetchTrigger > lastRefetchTrigger.current) {
            onRefetch();
            lastRefetchTrigger.current = refetchTrigger;
        }
    }, [refetchTrigger, onRefetch, ...dependencies]);
}
