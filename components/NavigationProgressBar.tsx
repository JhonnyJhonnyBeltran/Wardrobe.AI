'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Global trigger for programmatic navigation (e.g. router.push)
let globalStartProgress: (() => void) | null = null;
let globalStopProgress: (() => void) | null = null;

export function triggerNavigationProgress() {
  if (globalStartProgress) globalStartProgress();
}

export function stopNavigationProgress() {
  if (globalStopProgress) globalStopProgress();
}

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    setIsNavigating(true);
    setProgress(28);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        return prev + (prev < 60 ? 18 : 6);
      });
    }, 120);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 220);
  };

  useEffect(() => {
    globalStartProgress = startProgress;
    globalStopProgress = completeProgress;
    return () => {
      globalStartProgress = null;
      globalStopProgress = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Complete progress on route change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  // Intercept click on internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || targetAttr === '_blank') {
        return;
      }

      if (href.startsWith('/') || href.startsWith(window.location.origin)) {
        const url = new URL(href, window.location.origin);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          startProgress();
        }
      }
    };

    window.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => window.removeEventListener('click', handleClick, { capture: true });
  }, []);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed top-0 left-0 right-0 h-[2.5px] z-[999999] pointer-events-none select-none bg-transparent"
        >
          <motion.div
            className="h-full bg-[var(--brand-pink,#FF66C4)] shadow-[0_0_10px_rgba(255,102,196,0.85)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
