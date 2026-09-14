import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';
let originalPosition = '';
let originalWidth = '';
let originalOverscroll = '';

/**
 * Safely force-unlocks all body scroll locks
 * Useful during route changes or emergency error recovery
 */
export function forceUnlockBodyScroll() {
    if (typeof window === 'undefined') return;
    lockCount = 0;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.overscrollBehavior = '';
    document.documentElement.classList.remove('modal-open');
}

/**
 * Hook to lock body scroll when a modal or drawer is open
 * Uses reference counting so multiple nested modals do not break scroll on close
 */
export function useBodyScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked || typeof window === 'undefined') return;

        if (lockCount === 0) {
            // Save pristine styles before any lock was applied
            originalOverflow = document.body.style.overflow;
            originalPaddingRight = document.body.style.paddingRight;
            originalPosition = document.body.style.position;
            originalWidth = document.body.style.width;
            originalOverscroll = document.body.style.overscrollBehavior;

            // Calculate scrollbar width to prevent layout shift
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Apply lock
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('modal-open');

            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            document.body.style.overscrollBehavior = 'none';
        }

        lockCount++;

        return () => {
            lockCount = Math.max(0, lockCount - 1);

            if (lockCount === 0) {
                document.body.style.overflow = originalOverflow || '';
                document.body.style.paddingRight = originalPaddingRight || '';
                document.body.style.position = originalPosition || '';
                document.body.style.width = originalWidth || '';
                document.body.style.overscrollBehavior = originalOverscroll || '';
                document.documentElement.classList.remove('modal-open');
            }
        };
    }, [isLocked]);
}

