import { useEffect, RefObject } from 'react';

/**
 * Hook to lock scrolling on the nearest scrollable parent when a dropdown is open.
 * Useful for dropdowns inside scrollable modals to prevent the modal from scrolling
 * while the user interacts with the dropdown.
 */
export function useDropdownScrollLock(isOpen: boolean, targetRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!isOpen || !targetRef.current || typeof window === 'undefined') return;

        // Find the nearest scrollable parent (excluding body/html as useBodyScrollLock handles that)
        let parent = targetRef.current.parentElement;
        let scrollableParent: HTMLElement | null = null;

        while (parent && parent !== document.body && parent !== document.documentElement) {
            const style = window.getComputedStyle(parent);
            const overflowY = style.overflowY;
            const isScrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
            
            if (isScrollable && parent.scrollHeight > parent.clientHeight) {
                scrollableParent = parent;
                break;
            }
            parent = parent.parentElement;
        }

        if (!scrollableParent) {
            // If no scrollable parent found within the modal, we don't need to do anything
            // because useBodyScrollLock probably already handles the body.
            return;
        }

        // Save original styles
        const originalOverflow = scrollableParent.style.overflow;
        const originalTouchAction = scrollableParent.style.touchAction;

        // Lock scroll on the parent container
        scrollableParent.style.overflow = 'hidden';
        
        // For mobile: prevent touch pan/scroll on the parent while dropdown is open
        // this is important to avoid "overscroll-behavior" issues
        scrollableParent.style.touchAction = 'none';

        return () => {
            if (scrollableParent) {
                scrollableParent.style.overflow = originalOverflow;
                scrollableParent.style.touchAction = originalTouchAction;
            }
        };
    }, [isOpen, targetRef]);
}
