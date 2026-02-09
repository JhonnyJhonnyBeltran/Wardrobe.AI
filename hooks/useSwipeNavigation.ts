import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SwipeNavigationConfig {
    enabled?: boolean;
    threshold?: number; // Minimum distance in pixels to trigger navigation
    velocity?: number; // Minimum velocity to trigger navigation
}

const SCREEN_ORDER = ['/feed', '/search', '/closet', '/messages', '/profile'];

export function useSwipeNavigation(config: SwipeNavigationConfig = {}) {
    const {
        enabled = true,
        threshold = 50,
        velocity = 0.3
    } = config;

    const router = useRouter();
    const pathname = usePathname();
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const touchStartTime = useRef<number>(0);

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
                const currentIndex = SCREEN_ORDER.indexOf(pathname);

                if (currentIndex === -1) return;

                let targetIndex = currentIndex;

                if (deltaX > 0) {
                    // Swipe right -> go to previous screen (left)
                    targetIndex = currentIndex - 1;
                } else {
                    // Swipe left -> go to next screen (right)
                    targetIndex = currentIndex + 1;
                }

                // Check bounds
                if (targetIndex >= 0 && targetIndex < SCREEN_ORDER.length) {
                    router.push(SCREEN_ORDER[targetIndex]);
                }
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [enabled, threshold, velocity, pathname, router]);
}
