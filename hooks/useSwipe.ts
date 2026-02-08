import { TouchEvent, useState } from 'react';

interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }: SwipeHandlers) => {
    const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);

    // Minimum distance required for a swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null); // Reset
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distanceX = touchStart.x - touchEnd.x;
        const distanceY = touchStart.y - touchEnd.y;
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontalSwipe) {
            if (Math.abs(distanceX) < minSwipeDistance) return;

            if (distanceX > 0) {
                // Swiped Left
                if (onSwipeLeft) onSwipeLeft();
            } else {
                // Swiped Right
                if (onSwipeRight) onSwipeRight();
            }
        } else {
            // Vertical Swipe (Optional, usually handled by scroll)
            if (Math.abs(distanceY) < minSwipeDistance) return;

            if (distanceY > 0) {
                // Swiped Up
                if (onSwipeUp) onSwipeUp();
            } else {
                // Swiped Down
                if (onSwipeDown) onSwipeDown();
            }
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
