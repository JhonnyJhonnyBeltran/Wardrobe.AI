import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SwipeNavigationConfig {
    enabled?: boolean;
    threshold?: number; // Minimum distance in pixels to trigger navigation
    velocity?: number; // Minimum velocity to trigger navigation
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

export function useSwipeNavigation(config: SwipeNavigationConfig = {}) {
    const {
        enabled = true,
        threshold = 50,
        velocity = 0.3,
        onSwipeLeft,
        onSwipeRight
    } = config;

    const router = useRouter();
    const pathname = usePathname();
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const touchStartTime = useRef<number>(0);

    // Default global navigation if no specific callbacks are provided
    const handleGlobalSwipe = (direction: 'left' | 'right') => {
        // Fallback or specific hardcoded paths for pages that don't pass callbacks
        if (direction === 'left') {
            // Swipe Left -> going to next screen
            if (pathname === '/feed') router.push('/search');
            else if (pathname === '/search') router.push('/closet');
            else if (pathname === '/closet') router.push('/messages'); // Wait, let's keep the user request logic explicit in the pages
        } else {
            // Swipe Right -> going to previous screen
            if (pathname === '/search') router.push('/feed');
            else if (pathname === '/closet') router.push('/search');
        }
    };

    useEffect(() => {
        if (!enabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
            touchStartTime.current = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            const deltaX = touchEndX - touchStartX.current;
            const deltaY = touchEndY - touchStartY.current;
            const deltaTime = touchEndTime - touchStartTime.current;

            // Calculate velocity (pixels per millisecond)
            const swipeVelocity = Math.abs(deltaX) / deltaTime;

            // Only trigger if horizontal swipe is more dominant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold && swipeVelocity > velocity) {
                if (deltaX > 0) {
                    // Swipe right -> normally means "go back" or visual left
                    if (onSwipeRight) onSwipeRight();
                    else handleGlobalSwipe('right');
                } else {
                    // Swipe left -> normally means "go forward" or visual right
                    if (onSwipeLeft) onSwipeLeft();
                    else handleGlobalSwipe('left');
                }
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [enabled, threshold, velocity, pathname, router, onSwipeLeft, onSwipeRight]);
}
