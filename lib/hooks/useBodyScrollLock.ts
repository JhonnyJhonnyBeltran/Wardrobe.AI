import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open
 * Prevents background scrolling behavior
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        // Save original styles
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const originalPosition = document.body.style.position;
        const originalWidth = document.body.style.width;

        // Calculate scrollbar width to prevent layout shift (even if hidden, some browsers might jump)
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Apply lock
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('modal-open');
        
        // If there's a visible scrollbar context, compensate for it
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Prevent iOS "bounce" and background scroll issues completely
        const originalOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overscrollBehavior = 'none';

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            document.body.style.position = originalPosition;
            document.body.style.width = originalWidth;
            document.body.style.overscrollBehavior = originalOverscroll;
            document.documentElement.classList.remove('modal-open');
        };
    }, [isLocked]);
}
