'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { haptics } from '@/lib/haptic';

interface PullToRefreshProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 65; // Distance in px to trigger refresh
const MAX_PULL_DISTANCE = 110; // Maximum visual pull distance

export default function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const isDeterminedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    isPullingRef.current = false;
    isDeterminedRef.current = false;
    setPullDistance(0);
    setIsTriggered(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    // Only allow pulling down if we are at the very top of the page
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 2 && e.touches.length === 1) {
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      isPullingRef.current = true;
      isDeterminedRef.current = false;
      setIsTriggered(false);
    } else {
      isPullingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || disabled || isRefreshing || e.touches.length !== 1) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - startYRef.current;
    const diffX = Math.abs(currentX - startXRef.current);

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 2) {
      resetState();
      return;
    }

    // Determine gesture direction once movement starts
    if (!isDeterminedRef.current && (Math.abs(diffY) > 5 || diffX > 5)) {
      isDeterminedRef.current = true;
      // If movement is mostly horizontal or user is scrolling up (diffY < 0), cancel pull-to-refresh
      if (diffX > Math.abs(diffY) || diffY <= 0) {
        resetState();
        return;
      }
    }

    if (diffY > 0) {
      // Apply rubber-band damping
      const damping = 0.4;
      const distance = Math.min(diffY * damping, MAX_PULL_DISTANCE);
      setPullDistance(distance);

      if (distance >= PULL_THRESHOLD && !isTriggered) {
        setIsTriggered(true);
        try {
          haptics.selection();
        } catch {}
      } else if (distance < PULL_THRESHOLD && isTriggered) {
        setIsTriggered(false);
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return;
    isPullingRef.current = false;
    isDeterminedRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(50); // Keep spinner visible at 50px during refresh
      try {
        haptics.heavy();
      } catch {}

      try {
        // Safety timeout of 8s to prevent eternal hang on bad network
        await Promise.race([
          onRefresh(),
          new Promise((resolve) => setTimeout(resolve, 8000))
        ]);
      } catch (err) {
        console.error('[PullToRefresh] Refresh failed:', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsTriggered(false);
      }
    } else {
      setPullDistance(0);
      setIsTriggered(false);
    }
  };

  const handleTouchCancel = () => {
    resetState();
  };

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="relative min-h-screen"
    >
      {/* Pull-to-refresh Indicator (Mobile Top Area) */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-2 inset-x-0 z-50 flex items-center justify-center pointer-events-none md:hidden"
            style={{ transform: `translateY(${Math.min(pullDistance * 0.7, 45)}px)` }}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--card-bg)]/95 backdrop-blur-lg border border-[var(--brand-pink)]/40 shadow-lg shadow-[var(--brand-pink)]/15 flex items-center justify-center">
              {isRefreshing ? (
                <LoadingSpinner size="sm" color="var(--brand-pink)" />
              ) : isTriggered ? (
                <Sparkles className="w-5 h-5 text-[var(--brand-pink)] animate-pulse" />
              ) : (
                <motion.div
                  style={{ rotate: progress * 180 }}
                  className="text-[var(--foreground-secondary)]"
                >
                  <ArrowDown className="w-4 h-4 text-[var(--brand-pink)]" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with subtle spring offset when pulling */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.25}px)` : undefined,
          transition: isPullingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
