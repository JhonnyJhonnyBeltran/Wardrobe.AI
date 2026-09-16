'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { haptics } from '@/lib/haptic';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const PULL_THRESHOLD = 60; // Distance in px to trigger refresh
const MAX_PULL_DISTANCE = 90; // Maximum visual pull distance

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  disabled = false,
  className
}: PullToRefreshProps) {
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
      if (diffX > Math.abs(diffY) || diffY <= 0) {
        resetState();
        return;
      }
    }

    if (diffY > 0) {
      const damping = 0.45;
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
      setPullDistance(44);
      try {
        haptics.heavy();
      } catch {}

      try {
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
      className={cn("relative w-full", className)}
    >
      {/* Inline Pull Indicator directly above the posts */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: isRefreshing ? 44 : Math.min(pullDistance * 0.75, 50),
              opacity: 1 
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full flex items-center justify-center overflow-hidden pointer-events-none md:hidden py-1"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--background-secondary)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-sm flex items-center justify-center">
              {isRefreshing || isTriggered ? (
                <LoadingSpinner size="xs" variant="spinner" color="var(--brand-pink)" />
              ) : (
                <motion.div
                  style={{ rotate: progress * 180 }}
                  className="text-[var(--foreground-secondary)]"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-[var(--brand-pink)]" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {children}
    </div>
  );
}
