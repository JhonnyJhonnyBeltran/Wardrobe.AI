import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open
 * Prevents background scrolling behavior
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        // Save original overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Prevent scrolling
        document.body.style.overflow = 'hidden';

        // Re-enable scrolling on cleanup
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isLocked]);
}
